# Editorial: Microservices Saga Pattern

## Approach Overview

The Saga pattern replaces distributed transactions (2PC) with a sequence of local transactions. Each step has a compensating action that semantically undoes it. If any step fails, previously completed steps are compensated in reverse order.

## Two Approaches

### Orchestration (Central Coordinator)
A central orchestrator directs the saga flow, calling each service in order. Simpler to implement and reason about.

### Choreography (Event-Driven)
Each service publishes events that trigger the next step. More decoupled but harder to debug.

This implementation uses the **orchestration** approach.

## Implementation

### Step 1: Saga Context

```typescript
class SagaContext {
  sagaId: string;
  data: any;
  stepResults: Record<string, any> = {};

  setStepResult(stepName: string, result: any): void {
    this.stepResults[stepName] = result;
  }
}
```

### Step 2: Forward Execution

```typescript
async executeForward(steps: SagaStep[], context: SagaContext): Promise<number> {
  for (let i = 0; i < steps.length; i++) {
    try {
      const result = await steps[i].execute(context);
      context.setStepResult(steps[i].name, result);
      this.log(steps[i].name, 'completed');
    } catch (error) {
      this.log(steps[i].name, 'failed', error);
      return i; // Return index of failed step
    }
  }
  return -1; // All succeeded
}
```

### Step 3: Backward Compensation

```typescript
async compensateBackward(
  steps: SagaStep[],
  context: SagaContext,
  failedIndex: number
): Promise<CompensationError[]> {
  const errors: CompensationError[] = [];

  // Compensate in reverse order, starting from the step before the failed one
  for (let i = failedIndex - 1; i >= 0; i--) {
    try {
      await steps[i].compensate(context);
      this.log(steps[i].name, 'compensated');
    } catch (error) {
      errors.push({ step: steps[i].name, error });
      this.log(steps[i].name, 'compensation_failed', error);
      // Continue compensating remaining steps
    }
  }

  return errors;
}
```

### Step 4: Saga Orchestrator

```typescript
class SagaOrchestrator {
  async execute(context: any): Promise<SagaResult> {
    const sagaContext = new SagaContext(context);

    const failedIndex = await this.executeForward(this.steps, sagaContext);

    if (failedIndex === -1) {
      return { status: 'completed', steps: this.getStepStatuses() };
    }

    const compensationErrors = await this.compensateBackward(
      this.steps, sagaContext, failedIndex
    );

    if (compensationErrors.length > 0) {
      return { status: 'compensation_failed', compensationErrors };
    }

    return { status: 'compensated', failedStep: this.steps[failedIndex].name };
  }
}
```

## Complexity Analysis

- **Forward execution**: O(n) where n = number of steps
- **Compensation**: O(n) in worst case (all steps completed before last one fails)
- **Total worst case**: O(2n) - execute all then compensate all
- **Space**: O(n) for step results and logs

## Key Design Decisions

1. **Continue compensation on failure**: Even if one compensation fails, try the rest
2. **Log everything**: Every state transition must be logged for debugging
3. **Idempotency**: Use unique saga IDs and step IDs to prevent duplicate execution
4. **Timeout per step**: Prevent hanging sagas from blocking resources

## Common Pitfalls

1. **Not compensating all steps**: Must compensate ALL completed steps, not just the one before failure
2. **Compensation order**: Must be reverse order to avoid dependency issues
3. **Stopping compensation on failure**: Other steps still need compensating
4. **Non-idempotent compensations**: Compensation might be called multiple times
5. **Missing context**: Later steps might need results from earlier steps
