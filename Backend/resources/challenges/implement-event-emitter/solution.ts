/**
 * Implement an Event Emitter
 *
 * A pub/sub system supporting on, off, emit, and once.
 *
 * Time: on O(1), off O(n), emit O(n), once O(1)
 * Space: O(total listeners)
 */
class EventEmitter {
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    const cbs = this.listeners.get(event);
    if (!cbs) return;
    const index = cbs.indexOf(callback);
    if (index !== -1) {
      cbs.splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]): void {
    const cbs = this.listeners.get(event);
    if (!cbs) return;
    // Copy to handle modifications during iteration
    for (const cb of [...cbs]) {
      cb(...args);
    }
  }

  once(event: string, callback: (...args: any[]) => void): void {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

export { EventEmitter };
