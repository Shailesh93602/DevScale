// Microservices: Saga Pattern - Reference Solution

import * as crypto from 'crypto';

// Types
interface SagaStep {
  name: string;
  execute: (context: SagaContext) => Promise<any>;
  compensate: (context: SagaContext) => Promise<void>;
}

interface SagaContext {
  sagaId: string;
  data: Record<string, any>;
  stepResults: Record<string, any>;
}

interface StepStatus {
  name: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'compensating' | 'compensated' | 'compensation_failed';
  result?: any;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

interface SagaResult {
  sagaId: string;
  status: 'completed' | 'compensated' | 'compensation_failed';
  steps: StepStatus[];
  failedStep?: string;
  error?: string;
  compensationErrors?: { step: string; error: string }[];
  duration: number;
}

interface SagaLog {
  sagaId: string;
  timestamp: number;
  step: string;
  event: string;
  details?: any;
}

// Saga Orchestrator
class SagaOrchestrator {
  private steps: SagaStep[] = [];
  private sagaHistory: Map<string, SagaResult> = new Map();
  private logs: SagaLog[] = [];
  private stepTimeout: number;

  constructor(stepTimeout: number = 10000) {
    this.stepTimeout = stepTimeout;
  }

  // Add a step to the saga
  addStep(step: SagaStep): SagaOrchestrator {
    if (this.steps.length >= 10) {
      throw new Error('Maximum 10 steps per saga');
    }
    this.steps.push(step);
    return this; // Allow chaining
  }

  // Execute the saga
  async execute(data: Record<string, any>): Promise<SagaResult> {
    const sagaId = crypto.randomUUID();
    const startTime = Date.now();

    const context: SagaContext = {
      sagaId,
      data: JSON.parse(JSON.stringify(data)),
      stepResults: {},
    };

    const stepStatuses: StepStatus[] = this.steps.map(step => ({
      name: step.name,
      status: 'pending' as const,
    }));

    this.log(sagaId, 'saga', 'started', { stepCount: this.steps.length });

    // Forward execution
    let failedIndex = -1;
    let failError: string | undefined;

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      stepStatuses[i].status = 'executing';
      stepStatuses[i].startedAt = Date.now();
      this.log(sagaId, step.name, 'executing');

      try {
        const result = await this.executeWithTimeout(
          step.execute(context),
          this.stepTimeout,
          `Step '${step.name}' timed out`
        );

        context.stepResults[step.name] = result;
        stepStatuses[i].result = result;
        stepStatuses[i].status = 'completed';
        stepStatuses[i].completedAt = Date.now();
        this.log(sagaId, step.name, 'completed');
      } catch (error: any) {
        failedIndex = i;
        failError = error.message;
        stepStatuses[i].status = 'failed';
        stepStatuses[i].error = error.message;
        stepStatuses[i].completedAt = Date.now();
        this.log(sagaId, step.name, 'failed', { error: error.message });
        break;
      }
    }

    // If all steps succeeded
    if (failedIndex === -1) {
      const result: SagaResult = {
        sagaId,
        status: 'completed',
        steps: stepStatuses,
        duration: Date.now() - startTime,
      };
      this.sagaHistory.set(sagaId, result);
      this.log(sagaId, 'saga', 'completed');
      return result;
    }

    // Compensation needed
    this.log(sagaId, 'saga', 'compensating', { failedStep: this.steps[failedIndex].name });

    const compensationErrors: { step: string; error: string }[] = [];

    // Compensate in reverse order (from the step before the failed one)
    for (let i = failedIndex - 1; i >= 0; i--) {
      const step = this.steps[i];
      stepStatuses[i].status = 'compensating';
      this.log(sagaId, step.name, 'compensating');

      try {
        await this.executeWithTimeout(
          step.compensate(context),
          this.stepTimeout,
          `Compensation for '${step.name}' timed out`
        );

        stepStatuses[i].status = 'compensated';
        this.log(sagaId, step.name, 'compensated');
      } catch (error: any) {
        stepStatuses[i].status = 'compensation_failed';
        stepStatuses[i].error = error.message;
        compensationErrors.push({ step: step.name, error: error.message });
        this.log(sagaId, step.name, 'compensation_failed', { error: error.message });
        // Continue compensating remaining steps
      }
    }

    const sagaStatus = compensationErrors.length > 0 ? 'compensation_failed' : 'compensated';

    const result: SagaResult = {
      sagaId,
      status: sagaStatus,
      steps: stepStatuses,
      failedStep: this.steps[failedIndex].name,
      error: failError,
      ...(compensationErrors.length > 0 ? { compensationErrors } : {}),
      duration: Date.now() - startTime,
    };

    this.sagaHistory.set(sagaId, result);
    this.log(sagaId, 'saga', sagaStatus);
    return result;
  }

  // Get saga status
  getStatus(sagaId: string): SagaResult | undefined {
    return this.sagaHistory.get(sagaId);
  }

  // Get saga logs
  getLogs(sagaId?: string): SagaLog[] {
    if (sagaId) {
      return this.logs.filter(l => l.sagaId === sagaId);
    }
    return [...this.logs];
  }

  // Execute with timeout
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    message: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(message)), timeoutMs)
      ),
    ]);
  }

  // Log a saga event
  private log(sagaId: string, step: string, event: string, details?: any): void {
    this.logs.push({
      sagaId,
      timestamp: Date.now(),
      step,
      event,
      details,
    });
  }
}

// Saga Builder (fluent API)
class SagaBuilder {
  private orchestrator: SagaOrchestrator;

  constructor(timeout?: number) {
    this.orchestrator = new SagaOrchestrator(timeout);
  }

  step(
    name: string,
    execute: (ctx: SagaContext) => Promise<any>,
    compensate: (ctx: SagaContext) => Promise<void>
  ): SagaBuilder {
    this.orchestrator.addStep({ name, execute, compensate });
    return this;
  }

  build(): SagaOrchestrator {
    return this.orchestrator;
  }
}

export { SagaOrchestrator, SagaBuilder, SagaStep, SagaContext, SagaResult };
