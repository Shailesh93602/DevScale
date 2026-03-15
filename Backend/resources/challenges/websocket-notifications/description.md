# WebSocket Real-Time Notifications

## Problem Description

Build a real-time notification system using WebSockets. The system should handle user connections, room-based subscriptions, targeted and broadcast notifications, presence tracking, and reliable message delivery with acknowledgements.

## Requirements

### Functional Requirements
1. **Connection Management**: Handle connect/disconnect with authentication
2. **Room Subscriptions**: Users can join/leave notification channels
3. **Targeted Notifications**: Send to specific users
4. **Broadcast**: Send to all users in a room
5. **Presence**: Track which users are online
6. **Message Queue**: Buffer notifications for offline users
7. **Acknowledgements**: Confirm delivery to clients

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client -> Server | Authenticate and establish connection |
| `subscribe` | Client -> Server | Join a notification room |
| `unsubscribe` | Client -> Server | Leave a notification room |
| `notification` | Server -> Client | Deliver a notification |
| `ack` | Client -> Server | Acknowledge receipt |
| `presence` | Server -> Client | Online status updates |

### Data Models

```typescript
interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: string;
  read: boolean;
}

interface ConnectionInfo {
  userId: string;
  socketId: string;
  rooms: Set<string>;
  connectedAt: string;
}
```

## Examples

### Example 1: User Connects and Subscribes
```
Client: connect({ token: 'jwt-token-for-user1' })
Server: { event: 'connected', userId: 'user1', socketId: 'abc123' }

Client: subscribe({ room: 'order-updates' })
Server: { event: 'subscribed', room: 'order-updates' }
```

### Example 2: Targeted Notification
```
Server sends to user1:
{
  id: 'notif-1',
  type: 'order-shipped',
  title: 'Order Shipped',
  body: 'Your order #123 has been shipped',
  data: { orderId: 123, trackingNumber: 'XYZ' },
  timestamp: '2024-01-15T10:30:00Z'
}

Client: ack({ notificationId: 'notif-1' })
```

### Example 3: Room Broadcast
```
broadcast('order-updates', {
  type: 'flash-sale',
  title: 'Flash Sale!',
  body: '50% off all items for the next hour'
})
// All users subscribed to 'order-updates' receive this notification
```

## Constraints

- Must support at least 10,000 concurrent connections
- Message delivery latency < 100ms for online users
- Must authenticate connections using JWT tokens
- Must buffer up to 100 notifications per offline user
- Must handle graceful disconnection and reconnection
- Must prevent duplicate notification delivery
- Notifications must be delivered in order per user
