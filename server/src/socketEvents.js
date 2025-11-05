const db = require('./database');

// Store connected players per sandbox
// Map<sandboxId, Map<userId, playerInfo>>
const sandboxPlayers = new Map();

// Map socket IDs to user IDs for cleanup
// Map<socketId, { sandboxId, userId }>
const socketToUser = new Map();

// Initialize socket event handlers
function initializeSocketEvents(io) {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a sandbox room with user info
    socket.on('join-sandbox', ({ sandboxId, userId, userName, role }) => {
      // Initialize sandbox player map if needed
      if (!sandboxPlayers.has(sandboxId)) {
        sandboxPlayers.set(sandboxId, new Map());
      }

      const sandboxUsers = sandboxPlayers.get(sandboxId);

      // Check if user is already connected
      if (sandboxUsers.has(userId)) {
        const existingPlayer = sandboxUsers.get(userId);
        const existingSocketId = existingPlayer.socketId;

        // Check if the existing socket is still connected
        const existingSocket = io.sockets.sockets.get(existingSocketId);

        if (existingSocket && existingSocket.connected) {
          // Socket is still connected - this is a duplicate login attempt
          console.log(`User ${userId} already connected to sandbox ${sandboxId} from another tab/device`);
          socket.emit('user-already-connected', {
            error: 'This user is already connected to the sandbox from another device or tab.'
          });
          return;
        } else {
          // Old socket is disconnected - clean up stale data and allow rejoin
          console.log(`Cleaning up stale connection for user ${userId} in sandbox ${sandboxId}`);
          sandboxUsers.delete(userId);
          socketToUser.delete(existingSocketId);
        }
      }

      socket.join(sandboxId);
      console.log(`Socket ${socket.id} joined sandbox ${sandboxId} as ${userName} (${role})`);

      // Store player info keyed by userId
      const playerInfo = {
        userId: userId,
        socketId: socket.id,
        name: userName || 'Anonymous',
        role: role || 'player',
        joinedAt: new Date().toISOString()
      };
      sandboxUsers.set(userId, playerInfo);

      // Store socket-to-user mapping for cleanup
      socketToUser.set(socket.id, { sandboxId, userId });

      // Broadcast updated player list to all players in the room
      const players = Array.from(sandboxUsers.values());
      io.to(sandboxId).emit('players-list', players);

      // Also notify others with player-joined event for optional handling
      socket.to(sandboxId).emit('player-joined', playerInfo);
    });

    // Request current players list
    socket.on('request-players-list', () => {
      // Find which sandbox this socket is in using socket-to-user mapping
      const mapping = socketToUser.get(socket.id);
      if (mapping) {
        const { sandboxId } = mapping;
        const players = sandboxPlayers.get(sandboxId);
        if (players) {
          const playersList = Array.from(players.values());
          console.log(`Sending player list to ${socket.id}:`, playersList);
          socket.emit('players-list', playersList);
        }
      }
    });

    // Leave a sandbox room
    socket.on('leave-sandbox', (sandboxId) => {
      const mapping = socketToUser.get(socket.id);
      if (!mapping) return;

      const { userId } = mapping;

      socket.leave(sandboxId);
      console.log(`Socket ${socket.id} (user ${userId}) left sandbox ${sandboxId}`);

      // Remove player from tracking
      if (sandboxPlayers.has(sandboxId)) {
        const sandboxUsers = sandboxPlayers.get(sandboxId);
        const playerInfo = sandboxUsers.get(userId);
        sandboxUsers.delete(userId);

        // Remove socket-to-user mapping
        socketToUser.delete(socket.id);

        // Send updated player list to remaining players
        const remainingPlayers = Array.from(sandboxUsers.values());
        io.to(sandboxId).emit('players-list', remainingPlayers);

        // Clean up empty sandbox maps
        if (sandboxUsers.size === 0) {
          sandboxPlayers.delete(sandboxId);
        }

        // Also notify with player-left event
        socket.to(sandboxId).emit('player-left', {
          userId,
          name: playerInfo?.name || 'Unknown',
          timestamp: new Date().toISOString()
        });
      }
    });

    // ========== IMAGE EVENTS ==========

    // Image uploaded event (broadcasted by server after upload)
    socket.on('image-uploaded', ({ sandboxId, image }) => {
      socket.to(sandboxId).emit('image-uploaded', image);
    });

    // Active view changed
    socket.on('active-view-changed', ({ sandboxId, imageId }) => {
      // Broadcast to all clients in the room including sender
      io.to(sandboxId).emit('active-view-changed', { imageId });
    });

    // ========== TOKEN EVENTS ==========

    // Token created
    socket.on('token-created', ({ sandboxId, token }) => {
      // Broadcast to all other clients in the room
      socket.to(sandboxId).emit('token-created', token);
    });

    // Token moved
    socket.on('token-moved', ({ sandboxId, tokenId, position_x, position_y }) => {
      // Update database
      try {
        db.updateTokenPosition.run(position_x, position_y, tokenId);
        
        // Broadcast to all other clients
        socket.to(sandboxId).emit('token-moved', {
          tokenId,
          position_x,
          position_y
        });
      } catch (error) {
        console.error('Error updating token position:', error);
        socket.emit('error', { message: 'Failed to update token position' });
      }
    });

    // Token deleted
    socket.on('token-deleted', ({ sandboxId, tokenId }) => {
      // Broadcast to all other clients
      socket.to(sandboxId).emit('token-deleted', { tokenId });
    });

    // ========== CHAT EVENTS ==========

    // Chat message sent
    socket.on('chat-message', ({ sandboxId, message }) => {
      // Message should already be saved to DB via API
      // Just broadcast to all other clients
      socket.to(sandboxId).emit('chat-message', message);
    });

    // ========== CONNECTION EVENTS ==========

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Get user mapping
      const mapping = socketToUser.get(socket.id);
      if (mapping) {
        const { sandboxId, userId } = mapping;

        // Remove player from sandbox
        if (sandboxPlayers.has(sandboxId)) {
          const sandboxUsers = sandboxPlayers.get(sandboxId);
          const playerInfo = sandboxUsers.get(userId);
          sandboxUsers.delete(userId);

          // Remove socket-to-user mapping
          socketToUser.delete(socket.id);

          // Send updated player list to remaining players
          const remainingPlayers = Array.from(sandboxUsers.values());
          io.to(sandboxId).emit('players-list', remainingPlayers);

          // Also notify with player-left event
          io.to(sandboxId).emit('player-left', {
            userId,
            name: playerInfo?.name || 'Unknown',
            timestamp: new Date().toISOString()
          });

          // Clean up empty sandbox maps
          if (sandboxUsers.size === 0) {
            sandboxPlayers.delete(sandboxId);
          }
        }
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
}

// Helper function to emit dice rolls based on visibility settings
function emitDiceRollByVisibility(io, sandboxId, messageData, blindedMessageData, visibility, senderId) {
  const players = sandboxPlayers.get(sandboxId);

  if (!players) {
    console.error(`No players found for sandbox ${sandboxId}`);
    return;
  }

  switch(visibility) {
    case 'public':
      // Emit to entire sandbox
      io.to(sandboxId).emit('chat-message', messageData);
      break;

    case 'to_gm':
      // Emit to GMs and sender
      players.forEach((playerData, userId) => {
        if (playerData.role === 'gm' || userId === senderId) {
          io.to(playerData.socketId).emit('chat-message', messageData);
        }
      });
      break;

    case 'blind_to_gm':
      // Emit full roll to GMs, blinded version to sender
      players.forEach((playerData, userId) => {
        if (playerData.role === 'gm') {
          // GM sees full results
          io.to(playerData.socketId).emit('chat-message', messageData);
        } else if (userId === senderId) {
          // Sender sees blinded version (???)
          io.to(playerData.socketId).emit('chat-message', blindedMessageData);
        }
      });
      break;

    case 'to_self':
      // Emit only to sender
      const senderData = players.get(senderId);
      if (senderData) {
        io.to(senderData.socketId).emit('chat-message', messageData);
      }
      break;

    default:
      // Default to public if visibility is not recognized
      console.warn(`Unknown dice visibility: ${visibility}, defaulting to public`);
      io.to(sandboxId).emit('chat-message', messageData);
  }
}

module.exports = initializeSocketEvents;
module.exports.emitDiceRollByVisibility = emitDiceRollByVisibility;
module.exports.sandboxPlayers = sandboxPlayers;
