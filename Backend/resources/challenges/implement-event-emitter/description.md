# Implement an Event Emitter

## Problem Description

Implement an `EventEmitter` class that supports subscribing to events, emitting events, and unsubscribing. This is a fundamental pattern used in Node.js, browser APIs, and many frameworks.

## Class Interface

```typescript
class EventEmitter {
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  once(event: string, callback: (...args: any[]) => void): void;
}
```

## Methods

- `on(event, callback)` — Subscribe a callback to an event. Multiple callbacks can be registered for the same event.
- `off(event, callback)` — Remove a specific callback from an event.
- `emit(event, ...args)` — Trigger all callbacks registered for the event, passing the arguments.
- `once(event, callback)` — Subscribe a callback that fires only once, then automatically unsubscribes.

## Examples

### Example 1
```typescript
const emitter = new EventEmitter();
const handler = (msg: string) => console.log(msg);

emitter.on('greet', handler);
emitter.emit('greet', 'Hello!'); // logs "Hello!"
emitter.emit('greet', 'Hi!');    // logs "Hi!"
```

### Example 2
```typescript
emitter.once('init', () => console.log('Initialized'));
emitter.emit('init'); // logs "Initialized"
emitter.emit('init'); // nothing happens
```

### Example 3
```typescript
const handler = (x: number) => console.log(x * 2);
emitter.on('double', handler);
emitter.emit('double', 5); // logs 10
emitter.off('double', handler);
emitter.emit('double', 5); // nothing happens
```

## Constraints

- Event names are non-empty strings
- Callbacks are valid functions
- Multiple listeners can be registered for the same event
- `off` removes only the specific callback reference
- `emit` calls listeners in the order they were registered
