import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import logger from '../utils/logger';
import { verifyToken } from '../utils/jwt';
import { CORS_ORIGIN, REDIS_URL } from '../config';

// Define socket event types
export enum SocketEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Battle events
  BATTLE_JOIN = 'battle:join',
  BATTLE_LEAVE = 'battle:leave',
  BATTLE_STATE_UPDATE = 'battle:state_update',
  BATTLE_PARTICIPANT_JOIN = 'battle:participant_join',
  BATTLE_PARTICIPANT_LEAVE = 'battle:participant_leave',
  BATTLE_SCORE_UPDATE = 'battle:score_update',
  BATTLE_TIMER_SYNC = 'battle:timer_sync',
  BATTLE_QUESTION_CHANGE = 'battle:question_change',
  BATTLE_COMPLETED = 'battle:completed',

  // Chat events
  CHAT_MESSAGE = 'chat:message',
  CHAT_JOIN = 'chat:join',
  CHAT_LEAVE = 'chat:leave',
}

interface DecodedToken {
  userId: string;
  username?: string;
  avatar_url?: string;
}

// Define socket message types
export interface SocketMessage<T = unknown> {
  type: string;
  data: T;
}

// Define battle state update type
export interface BattleStateUpdate {
  battle_id: string;
  status: string;
  current_participants: number;
  current_question_index?: number;
  time_remaining?: number;
}

// Define participant update type
export interface ParticipantUpdate {
  battle_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  status: 'joined' | 'left' | 'active' | 'inactive';
}

// Define score update type
export interface ScoreUpdate {
  battle_id: string;
  user_id: string;
  username: string;
  score: number;
  rank: number;
}

// Define timer sync type
export interface TimerSync {
  battle_id: string;
  question_id: string;
  start_time: number;
  end_time: number;
  time_remaining: number;
}

// Define chat message type
export interface ChatMessage {
  battle_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  message: string;
  timestamp: number;
}

// Redis key helpers — all socket state lives here so it's shared across all server instances
const USER_SOCKETS_KEY = (userId: string) => `eduscale:sockets:${userId}`;
const BATTLE_USERS_KEY = (battleId: string) =>
  `eduscale:battle:users:${battleId}`;
const PRESENCE_KEY = (userId: string) => `eduscale:presence:${userId}`;
const SOCKET_TTL = 24 * 60 * 60; // 1 day — auto-expire orphaned keys
const PRESENCE_TTL = 35; // 35 s — client pings every 25 s; gone after 35 s silence

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
        origin: function (origin, callback) {
          if (!origin) return callback(null, true);

          if (process.env.NODE_ENV === 'production') {
            const allowedOrigins = (CORS_ORIGIN || '')
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean);
            if (
              allowedOrigins.length === 0 ||
              allowedOrigins.includes(origin)
            ) {
              return callback(null, true);
            }
            return callback(new Error('Origin not allowed by CORS'));
          }

          // Development: allow localhost + private network
          const isAllowed =
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
            /^https?:\/\/(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(
              origin
            );
          callback(
            isAllowed ? null : new Error('Origin not allowed'),
            isAllowed
          );
        },
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

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          (socket.handshake.query.token as string);

        if (!token) {
          return next(new Error('Authentication token is missing'));
        }

        const decoded = (await verifyToken(token)) as DecodedToken;
        if (!decoded || !decoded.userId) {
          return next(new Error('Invalid authentication token'));
        }

        // Attach user data to socket
        socket.data.user = {
          id: decoded.userId,
          username: decoded.username || 'Anonymous',
          avatar_url: decoded.avatar_url,
        };

        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on(SocketEvents.CONNECT, (socket) => {
      const userId = socket.data.user?.id;

      if (!userId) {
        socket.disconnect();
        return;
      }

      // Track user connections in Redis
      this.pubClient?.sadd(USER_SOCKETS_KEY(userId), socket.id).catch(() => {
        this.userSockets.set(userId, [
          ...(this.userSockets.get(userId) || []),
          socket.id,
        ]);
      });
      this.pubClient
        ?.expire(USER_SOCKETS_KEY(userId), SOCKET_TTL)
        .catch(() => {});

      // ─── Presence heartbeat ────────────────────────────────────────────
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

      logger.info(`User ${userId} connected with socket ${socket.id}`);

      // Handle battle join (also used for reconnect)
      socket.on(SocketEvents.BATTLE_JOIN, (data: { battle_id: string }) => {
        this.joinBattleRoom(socket, userId, data.battle_id);
        // battle:state is sent by the battleSocketService via emitToSocket
        // after the HTTP join call; on reconnect the client re-emits battle:join
        // and the state broadcast is triggered externally by the controller.
      });

      // Handle battle leave
      socket.on(SocketEvents.BATTLE_LEAVE, (data: { battle_id: string }) => {
        this.leaveBattleRoom(socket, userId, data.battle_id);
      });

      // Handle chat messages
      socket.on(SocketEvents.CHAT_MESSAGE, (data: ChatMessage) => {
        this.handleChatMessage(socket, userId, data);
      });

      // Handle disconnect
      socket.on(SocketEvents.DISCONNECT, () => {
        this.handleDisconnect(socket, userId);
      });
    });
  }

  private joinBattleRoom(socket: Socket, userId: string, battleId: string) {
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

    socket.to(`battle:${battleId}`).emit(SocketEvents.BATTLE_PARTICIPANT_JOIN, {
      battle_id: battleId,
      user_id: userId,
      username: socket.data.user?.username || 'Anonymous',
      avatar_url: socket.data.user?.avatar_url,
      status: 'joined',
    } as ParticipantUpdate);

    logger.info(`User ${userId} joined battle ${battleId}`);
  }

  private leaveBattleRoom(socket: Socket, userId: string, battleId: string) {
    socket.leave(`battle:${battleId}`);

    this.pubClient?.srem(BATTLE_USERS_KEY(battleId), userId).catch(() => {
      this.battleRooms.get(battleId)?.delete(userId);
    });

    socket
      .to(`battle:${battleId}`)
      .emit(SocketEvents.BATTLE_PARTICIPANT_LEAVE, {
        battle_id: battleId,
        user_id: userId,
        username: socket.data.user?.username || 'Anonymous',
        avatar_url: socket.data.user?.avatar_url,
        status: 'left',
      } as ParticipantUpdate);

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
    // Remove this socket from the user's Redis set
    try {
      await this.pubClient?.srem(USER_SOCKETS_KEY(userId), socket.id);
      const remaining = await this.pubClient?.scard(USER_SOCKETS_KEY(userId));

      // Only remove from battle rooms when user has no remaining connections
      if (!remaining || remaining === 0) {
        // Clear presence — user is fully offline
        this.pubClient?.del(PRESENCE_KEY(userId)).catch(() => {});
        const battleIds =
          (await this.pubClient?.keys(BATTLE_USERS_KEY('*'))) ?? [];
        for (const key of battleIds) {
          const isMember = await this.pubClient?.sismember(key, userId);
          if (isMember) {
            const battleId = key.replace('eduscale:battle:users:', '');
            await this.pubClient?.srem(key, userId);
            socket
              .to(`battle:${battleId}`)
              .emit(SocketEvents.BATTLE_PARTICIPANT_LEAVE, {
                battle_id: battleId,
                user_id: userId,
                username: socket.data.user?.username || 'Anonymous',
                avatar_url: socket.data.user?.avatar_url,
                status: 'left',
              } as ParticipantUpdate);
          }
        }
      }
    } catch {
      // Fallback: clean up in-memory maps
      const updatedSockets = (this.userSockets.get(userId) || []).filter(
        (id) => id !== socket.id
      );
      if (updatedSockets.length === 0) {
        this.userSockets.delete(userId);
        this.battleRooms.forEach((users, battleId) => {
          if (users.has(userId)) {
            users.delete(userId);
            socket
              .to(`battle:${battleId}`)
              .emit(SocketEvents.BATTLE_PARTICIPANT_LEAVE, {
                battle_id: battleId,
                user_id: userId,
                username: socket.data.user?.username || 'Anonymous',
                status: 'left',
              } as ParticipantUpdate);
          }
        });
      } else {
        this.userSockets.set(userId, updatedSockets);
      }
    }

    logger.info(`User ${userId} disconnected socket ${socket.id}`);
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

  /**
   * Emit a private event to a specific user.
   * With the Redis adapter, io.to(socketId) is routed to the correct server automatically.
   */
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

  // ── Legacy helpers (kept for backwards compat during transition) ─────────

  updateBattleState(battleId: string, stateUpdate: BattleStateUpdate) {
    this.emitToRoom(battleId, SocketEvents.BATTLE_STATE_UPDATE, stateUpdate);
  }

  updateScore(battleId: string, scoreUpdate: ScoreUpdate) {
    this.emitToRoom(battleId, SocketEvents.BATTLE_SCORE_UPDATE, scoreUpdate);
  }

  syncTimer(battleId: string, timerSync: TimerSync) {
    this.emitToRoom(battleId, SocketEvents.BATTLE_TIMER_SYNC, timerSync);
  }

  changeQuestion(battleId: string, questionId: string, questionIndex: number) {
    this.emitToRoom(battleId, SocketEvents.BATTLE_QUESTION_CHANGE, {
      battle_id: battleId,
      question_id: questionId,
      question_index: questionIndex,
    });
  }

  completeBattle(battleId: string, results: unknown) {
    this.emitToRoom(battleId, SocketEvents.BATTLE_COMPLETED, {
      battle_id: battleId,
      results,
    });
    logger.info(`Battle ${battleId} completed`);
  }

  async getConnectedUsers(battleId: string): Promise<string[]> {
    try {
      return (await this.pubClient?.smembers(BATTLE_USERS_KEY(battleId))) ?? [];
    } catch {
      return Array.from(this.battleRooms.get(battleId) || []);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
