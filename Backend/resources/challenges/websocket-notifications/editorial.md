# Editorial: WebSocket Real-Time Notifications

## Approach Overview

Building a real-time notification system requires managing persistent connections, implementing pub/sub patterns, and handling edge cases like disconnections and message ordering.

## Architecture

```
Client <-> WebSocket Server <-> Notification Service
                |                       |
           Connection Manager      Message Queue
                |                       |
           Presence Tracker        Storage (for offline)
```

## Implementation

### Step 1: Connection Manager

```typescript
class ConnectionManager {
  private connections: Map<string, Set<WebSocket>> = new Map(); // userId -> sockets
  private socketToUser: Map<string, string> = new Map(); // socketId -> userId

  addConnection(userId: string, socket: WebSocket): void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(socket);
    this.socketToUser.set(socket.id, userId);
  }

  removeConnection(socket: WebSocket): void {
    const userId = this.socketToUser.get(socket.id);
    if (userId) {
      this.connections.get(userId)?.delete(socket);
      if (this.connections.get(userId)?.size === 0) {
        this.connections.delete(userId);
      }
    }
    this.socketToUser.delete(socket.id);
  }

  isOnline(userId: string): boolean {
    return this.connections.has(userId) && this.connections.get(userId)!.size > 0;
  }
}
```

### Step 2: Room Management

```typescript
class RoomManager {
  private rooms: Map<string, Set<string>> = new Map(); // room -> userIds
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> rooms

  join(userId: string, room: string): void {
    if (!this.rooms.has(room)) this.rooms.set(room, new Set());
    this.rooms.get(room)!.add(userId);

    if (!this.userRooms.has(userId)) this.userRooms.set(userId, new Set());
    this.userRooms.get(userId)!.add(room);
  }

  getRoomMembers(room: string): string[] {
    return Array.from(this.rooms.get(room) || []);
  }
}
```

### Step 3: Notification Delivery with Acknowledgements

```typescript
class NotificationDelivery {
  private pendingAcks: Map<string, { notification: Notification; timeout: NodeJS.Timeout }> = new Map();

  async deliver(userId: string, notification: Notification): Promise<boolean> {
    if (connectionManager.isOnline(userId)) {
      // Send to all active sockets for this user
      const sockets = connectionManager.getSockets(userId);
      sockets.forEach(socket => socket.send(JSON.stringify(notification)));

      // Set acknowledgement timeout
      this.waitForAck(notification.id, userId, notification);
      return true;
    } else {
      // Buffer for offline delivery
      offlineBuffer.add(userId, notification);
      return false;
    }
  }
}
```

### Step 4: Offline Message Buffer

```typescript
class OfflineBuffer {
  private buffer: Map<string, Notification[]> = new Map();
  private maxPerUser = 100;

  add(userId: string, notification: Notification): void {
    if (!this.buffer.has(userId)) this.buffer.set(userId, []);
    const userBuffer = this.buffer.get(userId)!;

    if (userBuffer.length >= this.maxPerUser) {
      userBuffer.shift(); // Remove oldest
    }
    userBuffer.push(notification);
  }

  flush(userId: string): Notification[] {
    const notifications = this.buffer.get(userId) || [];
    this.buffer.delete(userId);
    return notifications;
  }
}
```

## Scalability Considerations

1. **Multiple server instances**: Use Redis Pub/Sub to broadcast across servers
2. **Connection limits**: Use worker threads or cluster mode
3. **Memory**: Move offline buffer to Redis for persistence
4. **Heartbeat**: Implement ping/pong for stale connection detection

## Complexity Analysis

- **Send to user**: O(k) where k = number of active sockets for the user
- **Broadcast to room**: O(n * k) where n = room members
- **Connection/Disconnection**: O(1) amortized
- **Presence check**: O(1)
- **Space**: O(U + C + R) where U = users, C = connections, R = rooms
