import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import logger from '../utils/logger';
import prisma from '../lib/prisma';
import { REDIS_URL } from '../config';
import {
  BATTLE_USERS_KEY,
  PRESENCE_KEY,
  PRESENCE_TTL,
  SOCKET_TTL,
  SocketEvents,
  USER_BATTLES_KEY,
  USER_SOCKETS_KEY,
  participantUpdate,
  type ChatMessage,
} from './realtime/socketContract';
import {
  authenticateSocket,
  socketCorsOrigin,
} from './realtime/socketHandshake';

export {
  SocketEvents,
  type ChatMessage,
  type ParticipantUpdate,
} from './realtime/socketContract';

const MAX_CHAT_MESSAGE_LENGTH = 500;

/** The payload's battle_id when it is a non-empty string, else null. */
function battleIdOf(data: unknown): string | null {
  const id = (data as { battle_id?: unknown } | null | undefined)?.battle_id;
  return typeof id === 'string' && id !== '' ? id : null;
}

class SocketService {
  private io: SocketIOServer | null = null;
  // Redis clients — pub/sub must be separate connections per Socket.io adapter requirements
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  // Local fallback Maps used only during Redis initialisation or when Redis is unavailable
  private userSockets: Map<string, string[]> = new Map();
  private battleRooms: Map<string, Set<string>> = new Map();

  initialize(server: HttpServer) {
    // Create dedicated pub/sub Redis connections for the adapter
    this.pubClient = new Redis(REDIS_URL);
    this.subClient = this.pubClient.duplicate();

    this.pubClient.on('error', (err) =>
      logger.error('Socket.io pubClient Redis error', { err })
    );
    this.subClient.on('error', (err) =>
      logger.error('Socket.io subClient Redis error', { err })
    );

    this.io = new SocketIOServer(server, {
      cors: {
        origin: socketCorsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Wire the Redis adapter — enables room broadcasts across multiple server instances
    this.io.adapter(createAdapter(this.pubClient, this.subClient));

    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('WebSocket server initialized with Redis adapter');
  }

  private setupMiddleware() {
    if (!this.io) return;
    this.io.use(authenticateSocket);
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on(SocketEvents.CONNECT, (socket) => {
      const userId = socket.data.user?.id;

      if (!userId) {
        socket.disconnect();
        return;
      }

      this.trackConnection(socket, userId);
      logger.info(`User ${userId} connected with socket ${socket.id}`);

      // Payloads are client-controlled. A throw or rejection here becomes an
      // uncaughtException / unhandledRejection, which main.ts answers with
      // process.exit(1) — so every handler checks types and catches.
      const onFail = (event: string) => (err: unknown) =>
        logger.warn(`socket ${event} handler failed`, { err, userId });

      // Handle battle join (also used for reconnect)
      socket.on(SocketEvents.BATTLE_JOIN, (data: unknown) => {
        const battleId = battleIdOf(data);
        if (!battleId) return;
        this.joinAndReplayState(socket, userId, battleId).catch(
          onFail(SocketEvents.BATTLE_JOIN)
        );
      });

      socket.on(SocketEvents.BATTLE_LEAVE, (data: unknown) => {
        const battleId = battleIdOf(data);
        if (!battleId) return;
        this.leaveBattleRoom(socket, userId, battleId);
      });

      socket.on(SocketEvents.CHAT_MESSAGE, (data: unknown) => {
        const battleId = battleIdOf(data);
        if (!battleId) return;
        const message = (data as { message?: unknown }).message;
        if (typeof message !== 'string') return;
        if (message.length > MAX_CHAT_MESSAGE_LENGTH) return;
        this.handleChatMessage(socket, userId, {
          battle_id: battleId,
          message,
        } as ChatMessage).catch(onFail(SocketEvents.CHAT_MESSAGE));
      });

      socket.on(SocketEvents.DISCONNECT, () => {
        this.handleDisconnect(socket, userId);
      });
    });
  }

  /** Records the socket in Redis and starts the presence heartbeat. */
  private trackConnection(socket: Socket, userId: string) {
    this.pubClient?.sadd(USER_SOCKETS_KEY(userId), socket.id).catch(() => {
      this.userSockets.set(userId, [
        ...(this.userSockets.get(userId) || []),
        socket.id,
      ]);
    });
    this.pubClient
      ?.expire(USER_SOCKETS_KEY(userId), SOCKET_TTL)
      .catch(() => {});

    // Mark user online; TTL auto-expires if the client stops pinging.
    this.pubClient
      ?.setex(PRESENCE_KEY(userId), PRESENCE_TTL, '1')
      .catch(() => {});

    // Client should emit 'ping' every ~25 s; each ping renews the TTL.
    socket.on('ping', () => {
      this.pubClient
        ?.setex(PRESENCE_KEY(userId), PRESENCE_TTL, '1')
        .catch(() => {});
      socket.emit('pong');
    });
  }

  /** Joins, then replays `battle:state` so a reconnect is not blank (FINDINGS.md #15). */
  private async joinAndReplayState(
    socket: Socket,
    userId: string,
    battleId: string
  ) {
    const joined = await this.joinBattleRoom(socket, userId, battleId);
    if (!joined) return;
    // Imported lazily: battleSocket imports this module, so a static import is a cycle.
    const { default: battleSocketService } = await import('./battleSocket.js');
    await battleSocketService.sendStateToSocket(socket.id, battleId, userId);
  }

  /** WAITING/LOBBY rooms are public lobbies; live or finished ones are players-only. */
  private async joinBattleRoom(
    socket: Socket,
    userId: string,
    battleId: string
  ): Promise<boolean> {
    const allowed = await this.canObserveBattle(userId, battleId);
    if (allowed === null) {
      socket.emit(SocketEvents.ERROR, {
        message: 'Could not verify access to this battle — try again',
        battle_id: battleId,
        retryable: true,
      });
      return false;
    }
    if (!allowed) {
      socket.emit(SocketEvents.ERROR, {
        message: 'You are not a participant in this battle',
        battle_id: battleId,
      });
      logger.warn(
        `User ${userId} refused battle room ${battleId} (not a participant)`
      );
      return false;
    }

    socket.join(`battle:${battleId}`);

    // Track user ↔ battle membership in Redis
    this.pubClient?.sadd(BATTLE_USERS_KEY(battleId), userId).catch(() => {
      if (!this.battleRooms.has(battleId))
        this.battleRooms.set(battleId, new Set());
      this.battleRooms.get(battleId)?.add(userId);
    });
    this.pubClient
      ?.expire(BATTLE_USERS_KEY(battleId), SOCKET_TTL)
      .catch(() => {});

    // Reverse index, so disconnect never has to scan the keyspace.
    this.pubClient?.sadd(USER_BATTLES_KEY(userId), battleId).catch(() => {});
    this.pubClient
      ?.expire(USER_BATTLES_KEY(userId), SOCKET_TTL)
      .catch(() => {});

    socket
      .to(`battle:${battleId}`)
      .emit(
        SocketEvents.BATTLE_PARTICIPANT_JOIN,
        participantUpdate(socket, userId, battleId, 'joined')
      );

    logger.info(`User ${userId} joined battle ${battleId}`);
    return true;
  }

  // Participant, creator, or an unstarted (open) lobby. Returns null on a DB
  // error (fails closed); joinBattleRoom refuses with a retryable error.
  private async canObserveBattle(
    userId: string,
    battleId: string
  ): Promise<boolean | null> {
    try {
      const battle = await prisma.battle.findUnique({
        where: { id: battleId },
        select: {
          status: true,
          user_id: true,
          participants: { where: { user_id: userId }, select: { id: true } },
        },
      });
      if (!battle) return false;
      if (battle.user_id === userId) return true;
      if (battle.participants.length > 0) return true;
      return battle.status === 'WAITING' || battle.status === 'LOBBY';
    } catch (err) {
      // Fail closed: a DB blip must not admit a non-participant to a
      // players-only room (room membership is what chat trusts).
      logger.warn(`canObserveBattle ${battleId} check failed — refusing`, {
        err,
      });
      return null;
    }
  }

  private leaveBattleRoom(socket: Socket, userId: string, battleId: string) {
    socket.leave(`battle:${battleId}`);

    this.pubClient?.srem(BATTLE_USERS_KEY(battleId), userId).catch(() => {
      this.battleRooms.get(battleId)?.delete(userId);
    });
    this.pubClient?.srem(USER_BATTLES_KEY(userId), battleId).catch(() => {});

    socket
      .to(`battle:${battleId}`)
      .emit(
        SocketEvents.BATTLE_PARTICIPANT_LEAVE,
        participantUpdate(socket, userId, battleId, 'left')
      );

    logger.info(`User ${userId} left battle ${battleId}`);
  }

  private async handleChatMessage(
    socket: Socket,
    userId: string,
    data: ChatMessage
  ) {
    const { battle_id, message } = data;

    if (!battle_id || !message || message.trim() === '') return;

    // Verify user is in this battle (Redis-backed, cross-server safe)
    let isMember = false;
    try {
      isMember =
        (await this.pubClient?.sismember(
          BATTLE_USERS_KEY(battle_id),
          userId
        )) === 1;
    } catch {
      isMember = this.battleRooms.get(battle_id)?.has(userId) ?? false;
    }
    if (!isMember) return;

    const chatMessage: ChatMessage = {
      battle_id,
      user_id: userId,
      username: socket.data.user?.username || 'Anonymous',
      avatar_url: socket.data.user?.avatar_url,
      message: message.trim(),
      timestamp: Date.now(),
    };

    this.io
      ?.to(`battle:${battle_id}`)
      .emit(SocketEvents.CHAT_MESSAGE, chatMessage);
  }

  private async handleDisconnect(socket: Socket, userId: string) {
    try {
      await this.releaseUserFromRedis(socket, userId);
    } catch {
      this.releaseUserFromMemory(socket, userId);
    }

    logger.info(`User ${userId} disconnected socket ${socket.id}`);
  }

  /** Removes the socket; on the user's last one, leaves every battle they joined. */
  private async releaseUserFromRedis(socket: Socket, userId: string) {
    await this.pubClient?.srem(USER_SOCKETS_KEY(userId), socket.id);
    const remaining = await this.pubClient?.scard(USER_SOCKETS_KEY(userId));

    // Only remove from battle rooms when user has no remaining connections
    if (remaining && remaining !== 0) return;

    // Clear presence — user is fully offline
    this.pubClient?.del(PRESENCE_KEY(userId)).catch(() => {});
    // One SMEMBERS of this user's own set — never `KEYS` over the keyspace.
    const battleIds =
      (await this.pubClient?.smembers(USER_BATTLES_KEY(userId))) ?? [];
    for (const battleId of battleIds) {
      await this.pubClient?.srem(BATTLE_USERS_KEY(battleId), userId);
      socket
        .to(`battle:${battleId}`)
        .emit(
          SocketEvents.BATTLE_PARTICIPANT_LEAVE,
          participantUpdate(socket, userId, battleId, 'left')
        );
    }
    if (battleIds.length > 0) {
      await this.pubClient?.del(USER_BATTLES_KEY(userId));
    }
  }

  /** Fallback when Redis is unreachable: clean up the in-memory maps. */
  private releaseUserFromMemory(socket: Socket, userId: string) {
    const updatedSockets = (this.userSockets.get(userId) || []).filter(
      (id) => id !== socket.id
    );
    if (updatedSockets.length > 0) {
      this.userSockets.set(userId, updatedSockets);
      return;
    }

    this.userSockets.delete(userId);
    this.battleRooms.forEach((users, battleId) => {
      if (users.has(userId)) {
        users.delete(userId);
        socket
          .to(`battle:${battleId}`)
          .emit(
            SocketEvents.BATTLE_PARTICIPANT_LEAVE,
            participantUpdate(socket, userId, battleId, 'left', false)
          );
      }
    });
  }

  // ── Public emit helpers ──────────────────────────────────────────────────

  /** Broadcast an event to everyone in a battle room */
  emitToRoom(battleId: string, event: string, data: unknown) {
    if (!this.io) return;
    this.io.to(`battle:${battleId}`).emit(event, data);
  }

  /** Emit an event only to a specific socket ID (e.g. on reconnect) */
  emitToSocket(socketId: string, event: string, data: unknown) {
    if (!this.io) return;
    this.io.to(socketId).emit(event, data);
  }

  /** Emit a private event to every socket of a user (routed cross-server by the adapter). */
  async emitToUser(
    battleId: string,
    userId: string,
    event: string,
    data: unknown
  ) {
    if (!this.io) return;
    try {
      const socketIds =
        (await this.pubClient?.smembers(USER_SOCKETS_KEY(userId))) ?? [];
      for (const sid of socketIds) {
        this.io.to(sid).emit(event, data);
      }
    } catch {
      // Fallback to in-memory map
      const socketIds = this.userSockets.get(userId) || [];
      for (const sid of socketIds) {
        this.io.to(sid).emit(event, data);
      }
    }
  }
}

export const socketService = new SocketService();
export default socketService;
