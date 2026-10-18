// WebSocket Real-Time Notifications - Reference Solution

import * as crypto from 'crypto';

// Types
interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: string;
  read: boolean;
}

interface SocketLike {
  id: string;
  send(data: string): void;
  on(event: string, handler: (...args: any[]) => void): void;
  close(): void;
}

interface ConnectionInfo {
  userId: string;
  socketId: string;
  rooms: Set<string>;
  connectedAt: string;
}

// Connection Manager - tracks all active WebSocket connections
class ConnectionManager {
  private userSockets: Map<string, Set<SocketLike>> = new Map();
  private socketToUser: Map<string, string> = new Map();
  private connectionInfo: Map<string, ConnectionInfo> = new Map();

  addConnection(userId: string, socket: SocketLike): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket);
    this.socketToUser.set(socket.id, userId);
    this.connectionInfo.set(socket.id, {
      userId,
      socketId: socket.id,
      rooms: new Set(),
      connectedAt: new Date().toISOString(),
    });
  }

  removeConnection(socket: SocketLike): string | undefined {
    const userId = this.socketToUser.get(socket.id);
    if (userId) {
      this.userSockets.get(userId)?.delete(socket);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.socketToUser.delete(socket.id);
    this.connectionInfo.delete(socket.id);
    return userId;
  }

  getSockets(userId: string): SocketLike[] {
    return Array.from(this.userSockets.get(userId) || []);
  }

  isOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets !== undefined && sockets.size > 0;
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getConnectionCount(): number {
    let count = 0;
    for (const sockets of this.userSockets.values()) {
      count += sockets.size;
    }
    return count;
  }
}

// Room Manager - handles room subscriptions
class RoomManager {
  private rooms: Map<string, Set<string>> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();

  join(userId: string, room: string): void {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(userId);

    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(room);
  }

  leave(userId: string, room: string): void {
    this.rooms.get(room)?.delete(userId);
    if (this.rooms.get(room)?.size === 0) {
      this.rooms.delete(room);
    }
    this.userRooms.get(userId)?.delete(room);
  }

  leaveAll(userId: string): void {
    const rooms = this.userRooms.get(userId);
    if (rooms) {
      for (const room of rooms) {
        this.rooms.get(room)?.delete(userId);
        if (this.rooms.get(room)?.size === 0) {
          this.rooms.delete(room);
        }
      }
    }
    this.userRooms.delete(userId);
  }

  getRoomMembers(room: string): string[] {
    return Array.from(this.rooms.get(room) || []);
  }

  getUserRooms(userId: string): string[] {
    return Array.from(this.userRooms.get(userId) || []);
  }
}

// Offline Buffer - stores notifications for offline users
class OfflineBuffer {
  private buffer: Map<string, Notification[]> = new Map();
  private maxPerUser: number;

  constructor(maxPerUser: number = 100) {
    this.maxPerUser = maxPerUser;
  }

  add(userId: string, notification: Notification): void {
    if (!this.buffer.has(userId)) {
      this.buffer.set(userId, []);
    }
    const userBuffer = this.buffer.get(userId)!;

    if (userBuffer.length >= this.maxPerUser) {
      userBuffer.shift(); // Remove oldest to maintain limit
    }
    userBuffer.push(notification);
  }

  flush(userId: string): Notification[] {
    const notifications = this.buffer.get(userId) || [];
    this.buffer.delete(userId);
    return notifications;
  }

  getCount(userId: string): number {
    return this.buffer.get(userId)?.length || 0;
  }
}

// Main Notification Server
class NotificationServer {
  private connectionManager = new ConnectionManager();
  private roomManager = new RoomManager();
  private offlineBuffer = new OfflineBuffer(100);
  private pendingAcks: Map<string, { userId: string; notification: Notification; retries: number }> = new Map();
  private deliveredIds: Set<string> = new Set(); // Deduplication

  // Handle new WebSocket connection
  onConnection(socket: SocketLike, userId: string): void {
    // Register connection
    this.connectionManager.addConnection(userId, socket);

    // Send connection confirmation
    socket.send(JSON.stringify({
      event: 'connected',
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    }));

    // Flush offline notifications
    const buffered = this.offlineBuffer.flush(userId);
    for (const notification of buffered) {
      this.sendToSocket(socket, notification);
    }

    // Broadcast presence update
    this.broadcastPresence(userId, 'online');

    // Handle events
    socket.on('subscribe', (data: { room: string }) => {
      this.roomManager.join(userId, data.room);
      socket.send(JSON.stringify({ event: 'subscribed', room: data.room }));
    });

    socket.on('unsubscribe', (data: { room: string }) => {
      this.roomManager.leave(userId, data.room);
      socket.send(JSON.stringify({ event: 'unsubscribed', room: data.room }));
    });

    socket.on('ack', (data: { notificationId: string }) => {
      this.handleAck(data.notificationId);
    });

    socket.on('disconnect', () => {
      this.onDisconnect(socket);
    });
  }

  // Handle disconnection
  private onDisconnect(socket: SocketLike): void {
    const userId = this.connectionManager.removeConnection(socket);
    if (userId && !this.connectionManager.isOnline(userId)) {
      this.roomManager.leaveAll(userId);
      this.broadcastPresence(userId, 'offline');
    }
  }

  // Send notification to a specific user
  send(userId: string, notification: Partial<Notification>): Notification {
    const fullNotification: Notification = {
      id: notification.id || crypto.randomUUID(),
      type: notification.type || 'general',
      title: notification.title || '',
      body: notification.body || '',
      data: notification.data,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Deduplication check
    if (this.deliveredIds.has(fullNotification.id)) {
      return fullNotification;
    }

    if (this.connectionManager.isOnline(userId)) {
      const sockets = this.connectionManager.getSockets(userId);
      for (const socket of sockets) {
        this.sendToSocket(socket, fullNotification);
      }
      // Track for acknowledgement
      this.pendingAcks.set(fullNotification.id, {
        userId,
        notification: fullNotification,
        retries: 0,
      });
    } else {
      // Buffer for offline user
      this.offlineBuffer.add(userId, fullNotification);
    }

    this.deliveredIds.add(fullNotification.id);
    return fullNotification;
  }

  // Broadcast notification to a room
  broadcast(room: string, notification: Partial<Notification>): void {
    const members = this.roomManager.getRoomMembers(room);
    for (const userId of members) {
      this.send(userId, notification);
    }
  }

  // Get online users
  getOnlineUsers(): string[] {
    return this.connectionManager.getOnlineUsers();
  }

  // Get connection statistics
  getStats(): { onlineUsers: number; totalConnections: number } {
    return {
      onlineUsers: this.connectionManager.getOnlineUsers().length,
      totalConnections: this.connectionManager.getConnectionCount(),
    };
  }

  // Private helpers
  private sendToSocket(socket: SocketLike, notification: Notification): void {
    socket.send(JSON.stringify({
      event: 'notification',
      data: notification,
    }));
  }

  private handleAck(notificationId: string): void {
    this.pendingAcks.delete(notificationId);
  }

  private broadcastPresence(userId: string, status: 'online' | 'offline'): void {
    // Broadcast to all connected users (simplified)
    for (const onlineUserId of this.connectionManager.getOnlineUsers()) {
      if (onlineUserId !== userId) {
        const sockets = this.connectionManager.getSockets(onlineUserId);
        for (const socket of sockets) {
          socket.send(JSON.stringify({
            event: 'presence',
            userId,
            status,
            timestamp: new Date().toISOString(),
          }));
        }
      }
    }
  }
}

export { NotificationServer, ConnectionManager, RoomManager, OfflineBuffer, Notification };
