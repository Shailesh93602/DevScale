# Microservices: Saga Pattern

## Problem Description

Implement the Saga pattern for managing distributed transactions across microservices. When a multi-step business process (like placing an order) spans multiple services, you need to ensure that either all steps complete successfully, or all completed steps are compensated (rolled back) in reverse order.

## Requirements

### Functional Requirements
1. **Saga Definition**: Define a sequence of steps, each with an execute and compensate function
2. **Forward Execution**: Execute steps in order, passing context between them
3. **Compensation**: On failure, compensate completed steps in reverse order
4. **Status Tracking**: Track the status of each step and the overall saga
5. **Compensation Failures**: Handle failures during compensation gracefully
6. **Idempotency**: Support idempotent execution and compensation

### Saga Step

```typescript
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
```

### Saga Lifecycle

```
Step 1 Execute -> Step 2 Execute -> Step 3 Execute -> COMPLETED
                                        |
                                    (failure)
                                        |
                   Step 2 Compensate <- Step 1 Compensate -> COMPENSATED
```

## Examples

### Example 1: Successful Order Saga
```typescript
const saga = new SagaOrchestrator();

saga.addStep({
  name: 'reserve-inventory',
  execute: async (ctx) => {
    const reserved = await inventoryService.reserve(ctx.data.items);
    return { reservationId: reserved.id };
  },
  compensate: async (ctx) => {
    await inventoryService.release(ctx.stepResults['reserve-inventory'].reservationId);
  },
});

saga.addStep({
  name: 'charge-payment',
  execute: async (ctx) => {
    const charge = await paymentService.charge(ctx.data.amount);
    return { chargeId: charge.id };
  },
  compensate: async (ctx) => {
    await paymentService.refund(ctx.stepResults['charge-payment'].chargeId);
  },
});

saga.addStep({
  name: 'create-shipment',
  execute: async (ctx) => {
    return await shippingService.create(ctx.data.address);
  },
  compensate: async (ctx) => {
    await shippingService.cancel(ctx.stepResults['create-shipment'].shipmentId);
  },
});

const result = await saga.execute({ items: [...], amount: 99.99, address: {...} });
// All steps succeed: { status: 'completed', steps: [...] }
```

### Example 2: Failed Saga with Compensation
```typescript
// Same saga as above, but payment fails
// Step 1 (reserve-inventory): SUCCESS
// Step 2 (charge-payment): FAILS
// Compensation: release-inventory runs (reverse order)
// Result: { status: 'compensated', failedStep: 'charge-payment', error: 'Card declined' }
```

### Example 3: Compensation Failure
```typescript
// Step 1: SUCCESS, Step 2: SUCCESS, Step 3: FAILS
// Compensate Step 2: SUCCESS
// Compensate Step 1: FAILS (service down)
// Result: { status: 'compensation_failed', compensationErrors: [...] }
// Requires manual intervention
```

## Constraints

- Maximum 10 steps per saga
- Step execution timeout: 10 seconds per step
- Compensation timeout: 10 seconds per step
- Must log all step transitions for auditability
- Must support concurrent saga executions
- Compensation failures must not stop remaining compensations
- Each step result is available to subsequent steps via context
