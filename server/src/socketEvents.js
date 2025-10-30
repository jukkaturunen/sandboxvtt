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
        console.log(`User ${userId} already connected to sandbox ${sandboxId}`);
        socket.emit('user-already-connected', {
          error: 'This user is already connected to the sandbox from another device or tab.'
        });
        return;
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

module.exports = initializeSocketEvents;
