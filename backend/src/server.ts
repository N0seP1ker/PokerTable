import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import type { Room, Player, TableSettings, Seat, SocketEvents } from '../../shared/types/index.js';

const app = express();
const server = createServer(app);
const io = new Server<SocketEvents>(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const rooms = new Map<string, Room>();
const playerRooms = new Map<string, string>(); // playerId -> roomId

// Helper functions
function createEmptySeats(): Seat[] {
  return Array.from({ length: 10 }, (_, index) => ({
    position: index,
    player: null,
    isEmpty: true
  }));
}

function createDefaultSettings(): TableSettings {
  return {
    smallBlind: 1,
    bigBlind: 2,
    ante: 0,
    anteEnabled: false,
    straddleEnabled: false,
    runItTwicePolicy: 'ask',
    decisionTimer: 40
  };
}

function createRoom(id: string, name: string, hostId: string): Room {
  return {
    id,
    name,
    hostId,
    players: [],
    seats: createEmptySeats(),
    settings: createDefaultSettings(),
    gameStarted: false,
    maxPlayers: 10
  };
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create_room', (roomName: string, playerName: string) => {
    const roomId = uuidv4();
    const playerId = socket.id;

    const player: Player = {
      id: playerId,
      name: playerName,
      privilege: 'owner',
      isHost: true,
      isConnected: true
    };

    const room = createRoom(roomId, roomName, playerId);
    room.players.push(player);

    rooms.set(roomId, room);
    playerRooms.set(playerId, roomId);

    socket.join(roomId);
    socket.emit('room_created', room, playerId);

    console.log(`Room created: ${roomId} by ${playerName} (owner)`);
  });

  // Join an existing room
  socket.on('join_room', (roomId: string, playerName: string) => {
    const room = rooms.get(roomId);
    const playerId = socket.id;

    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', 'Room is full');
      return;
    }

    const player: Player = {
      id: playerId,
      name: playerName,
      privilege: 'player',
      isHost: false,
      isConnected: true
    };

    room.players.push(player);
    playerRooms.set(playerId, roomId);

    socket.join(roomId);
    socket.emit('room_joined', room, playerId);
    socket.to(roomId).emit('player_joined', player);

    console.log(`Player ${playerName} joined room ${roomId} (player)`);
  });

  // Claim a seat
  socket.on('claim_seat', (seatPosition: number) => {
    const playerId = socket.id;
    const roomId = playerRooms.get(playerId);
    
    if (!roomId) {
      socket.emit('error', 'Not in a room');
      return;
    }

    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      socket.emit('error', 'Player not found');
      return;
    }

    if (seatPosition < 0 || seatPosition >= 10) {
      socket.emit('error', 'Invalid seat position');
      return;
    }

    if (!room.seats[seatPosition].isEmpty) {
      socket.emit('error', 'Seat already taken');
      return;
    }

    // Release previous seat if any
    const previousSeat = room.seats.find(seat => seat.player?.id === playerId);
    if (previousSeat) {
      previousSeat.player = null;
      previousSeat.isEmpty = true;
    }

    // Claim new seat
    room.seats[seatPosition].player = player;
    room.seats[seatPosition].isEmpty = false;
    player.seatPosition = seatPosition;
    player.chips = 1000; // Starting chips - TODO: make configurable

    io.to(roomId).emit('seat_claimed', seatPosition, player);
    console.log(`Player ${player.name} claimed seat ${seatPosition} in room ${roomId}`);
  });

  // Leave seat
  socket.on('leave_seat', () => {
    const playerId = socket.id;
    const roomId = playerRooms.get(playerId);
    
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const seatIndex = room.seats.findIndex(seat => seat.player?.id === playerId);
    if (seatIndex !== -1) {
      room.seats[seatIndex].player = null;
      room.seats[seatIndex].isEmpty = true;
      
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.seatPosition = undefined;
        player.chips = undefined;
      }

      io.to(roomId).emit('seat_released', seatIndex);
      console.log(`Player ${playerId} left seat ${seatIndex} in room ${roomId}`);
    }
  });

  // Update room settings (host only)
  socket.on('update_settings', (newSettings: Partial<TableSettings>) => {
    const playerId = socket.id;
    const roomId = playerRooms.get(playerId);
    
    if (!roomId) {
      socket.emit('error', 'Not in a room');
      return;
    }

    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.hostId !== playerId) {
      socket.emit('error', 'Only host can update settings');
      return;
    }

    if (room.gameStarted) {
      socket.emit('error', 'Cannot update settings during game');
      return;
    }

    // Update settings
    room.settings = { ...room.settings, ...newSettings };
    io.to(roomId).emit('settings_updated', room.settings);
    
    console.log(`Settings updated in room ${roomId}:`, newSettings);
  });

  // Start game (host only)
  socket.on('start_game', () => {
    const playerId = socket.id;
    const roomId = playerRooms.get(playerId);
    
    if (!roomId) {
      socket.emit('error', 'Not in a room');
      return;
    }

    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.hostId !== playerId) {
      socket.emit('error', 'Only host can start the game');
      return;
    }

    const seatedPlayers = room.seats.filter(seat => !seat.isEmpty);
    if (seatedPlayers.length < 2) {
      socket.emit('error', 'Need at least 2 players to start');
      return;
    }

    room.gameStarted = true;
    
    // TODO: Initialize game state with proper poker logic
    // For now, just emit a basic game state
    const gameState = {
      roomId,
      pot: 0,
      communityCards: [],
      currentPlayerIndex: 0,
      dealerPosition: 0,
      smallBlindPosition: 1,
      bigBlindPosition: 2,
      currentBet: room.settings.bigBlind,
      gamePhase: 'preflop' as const,
      playerHands: {},
      playerActions: {},
      timeRemaining: room.settings.decisionTimer
    };

    io.to(roomId).emit('game_started', gameState);
    console.log(`Game started in room ${roomId} with ${seatedPlayers.length} players`);
  });

  // Handle player actions during game
  socket.on('player_action', (action) => {
    const playerId = socket.id;
    const roomId = playerRooms.get(playerId);
    
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || !room.gameStarted) return;

    // TODO: Implement proper game logic validation
    // For now, just broadcast the action
    io.to(roomId).emit('player_action_made', playerId, action);
    console.log(`Player ${playerId} made action:`, action);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const playerId = socket.id;
    const roomId = playerRooms.get(playerId);
    
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        // Mark player as disconnected
        const player = room.players.find(p => p.id === playerId);
        if (player) {
          player.isConnected = false;
          socket.to(roomId).emit('player_left', playerId);
          
          // TODO: Handle host disconnection
          // TODO: Implement reconnection logic
        }
      }
      
      playerRooms.delete(playerId);
    }
    
    console.log('User disconnected:', playerId);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get room info endpoint
app.get('/api/room/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});