import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'node:http';
import logger from '@/utils/logger';
import { verifyToken } from '@/utils/jwt';
import { CORS_ORIGIN } from '@/config';

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

class SocketService {
  private io: SocketIOServer | null = null;
  private readonly userSockets: Map<string, string[]> = new Map(); // userId -> socketIds
  private readonly battleRooms: Map<string, Set<string>> = new Map(); // battleId -> userIds

  initialize(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('WebSocket server initialized');
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

        const decoded = verifyToken(token) as DecodedToken;
        if (!decoded?.userId) {
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

      // Track user connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)?.push(socket.id);

      logger.info(`User ${userId} connected with socket ${socket.id}`);

      // Handle battle join
      socket.on(SocketEvents.BATTLE_JOIN, (data: { battle_id: string }) => {
        this.joinBattleRoom(socket, userId, data.battle_id);
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
    // Join the socket room for this battle
    socket.join(`battle:${battleId}`);

    // Track user in battle room
    if (!this.battleRooms.has(battleId)) {
      this.battleRooms.set(battleId, new Set());
    }
    this.battleRooms.get(battleId)?.add(userId);

    // Notify others that user joined
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
    // Leave the socket room for this battle
    socket.leave(`battle:${battleId}`);

    // Remove user from battle room tracking
    this.battleRooms.get(battleId)?.delete(userId);
    if (this.battleRooms.get(battleId)?.size === 0) {
      this.battleRooms.delete(battleId);
    }

    // Notify others that user left
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

  private handleChatMessage(socket: Socket, userId: string, data: ChatMessage) {
    const { battle_id, message } = data;

    // Validate message
    if (!battle_id || !message || message.trim() === '') {
      return;
    }

    // Check if user is in this battle
    if (!this.battleRooms.get(battle_id)?.has(userId)) {
      return;
    }

    // Create message object
    const chatMessage: ChatMessage = {
      battle_id,
      user_id: userId,
      username: socket.data.user?.username || 'Anonymous',
      avatar_url: socket.data.user?.avatar_url,
      message: message.trim(),
      timestamp: Date.now(),
    };

    // Broadcast to all users in the battle
    this.io
      ?.to(`battle:${battle_id}`)
      .emit(SocketEvents.CHAT_MESSAGE, chatMessage);
  }

  private handleDisconnect(socket: Socket, userId: string) {
    // Remove socket from user tracking
    const userSockets = this.userSockets.get(userId) || [];
    const updatedSockets = userSockets.filter((id) => id !== socket.id);

    if (updatedSockets.length === 0) {
      this.userSockets.delete(userId);
    } else {
      this.userSockets.set(userId, updatedSockets);
    }

    // Handle leaving all battle rooms
    this.battleRooms.forEach((users, battleId) => {
      if (users.has(userId) && this.getUserSocketCount(userId) === 0) {
        users.delete(userId);

        // Notify others that user left
        socket
          .to(`battle:${battleId}`)
          .emit(SocketEvents.BATTLE_PARTICIPANT_LEAVE, {
            battle_id: battleId,
            user_id: userId,
            username: socket.data.user?.username || 'Anonymous',
            avatar_url: socket.data.user?.avatar_url,
            status: 'left',
          } as ParticipantUpdate);

        if (users.size === 0) {
          this.battleRooms.delete(battleId);
        }
      }
    });

    logger.info(`User ${userId} disconnected socket ${socket.id}`);
  }

  // Get the number of active sockets for a user
  private getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.length || 0;
  }

  // Public methods for emitting events

  // Update battle state for all participants
  updateBattleState(battleId: string, stateUpdate: BattleStateUpdate) {
    if (!this.io) return;
    this.io
      .to(`battle:${battleId}`)
      .emit(SocketEvents.BATTLE_STATE_UPDATE, stateUpdate);
    logger.info(`Battle ${battleId} state updated: ${stateUpdate.status}`);
  }

  // Update score for a participant
  updateScore(battleId: string, scoreUpdate: ScoreUpdate) {
    if (!this.io) return;
    this.io
      .to(`battle:${battleId}`)
      .emit(SocketEvents.BATTLE_SCORE_UPDATE, scoreUpdate);
  }

  // Sync timer for all participants
  syncTimer(battleId: string, timerSync: TimerSync) {
    if (!this.io) return;
    this.io
      .to(`battle:${battleId}`)
      .emit(SocketEvents.BATTLE_TIMER_SYNC, timerSync);
  }

  // Notify about question change
  changeQuestion(battleId: string, questionId: string, questionIndex: number) {
    if (!this.io) return;
    this.io.to(`battle:${battleId}`).emit(SocketEvents.BATTLE_QUESTION_CHANGE, {
      battle_id: battleId,
      question_id: questionId,
      question_index: questionIndex,
    });
  }

  // Notify about battle completion
  completeBattle(battleId: string, results: unknown) {
    if (!this.io) return;
    this.io.to(`battle:${battleId}`).emit(SocketEvents.BATTLE_COMPLETED, {
      battle_id: battleId,
      results,
    });
    logger.info(`Battle ${battleId} completed`);
  }

  // Get connected users in a battle
  getConnectedUsers(battleId: string): string[] {
    return Array.from(this.battleRooms.get(battleId) || []);
  }
}

export const socketService = new SocketService();
export default socketService;
