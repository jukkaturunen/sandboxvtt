const db = require('./database');

// Store connected players per sandbox
const sandboxPlayers = new Map(); // Map<sandboxId, Map<socketId, playerInfo>>

// Initialize socket event handlers
function initializeSocketEvents(io) {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a sandbox room with player info
    socket.on('join-sandbox', ({ sandboxId, playerName, role }) => {
      socket.join(sandboxId);
      console.log(`Socket ${socket.id} joined sandbox ${sandboxId} as ${playerName} (${role})`);

      // Initialize sandbox player map if needed
      if (!sandboxPlayers.has(sandboxId)) {
        sandboxPlayers.set(sandboxId, new Map());
      }

      // Store player info
      const playerInfo = {
        socketId: socket.id,
        name: playerName || 'Anonymous',
        role: role || 'player',
        joinedAt: new Date().toISOString()
      };
      sandboxPlayers.get(sandboxId).set(socket.id, playerInfo);

      // Broadcast updated player list to all players in the room
      const players = Array.from(sandboxPlayers.get(sandboxId).values());
      io.to(sandboxId).emit('players-list', players);

      // Also notify others with player-joined event for optional handling
      socket.to(sandboxId).emit('player-joined', playerInfo);
    });

    // Request current players list
    socket.on('request-players-list', () => {
      // Find which sandbox this socket is in
      for (const [sandboxId, players] of sandboxPlayers.entries()) {
        if (players.has(socket.id)) {
          const playersList = Array.from(players.values());
          console.log(`Sending player list to ${socket.id}:`, playersList);
          socket.emit('players-list', playersList);
          break;
        }
      }
    });

    // Leave a sandbox room
    socket.on('leave-sandbox', (sandboxId) => {
      socket.leave(sandboxId);
      console.log(`Socket ${socket.id} left sandbox ${sandboxId}`);

      // Remove player from tracking
      if (sandboxPlayers.has(sandboxId)) {
        const playerInfo = sandboxPlayers.get(sandboxId).get(socket.id);
        sandboxPlayers.get(sandboxId).delete(socket.id);

        // Send updated player list to remaining players
        const remainingPlayers = Array.from(sandboxPlayers.get(sandboxId).values());
        io.to(sandboxId).emit('players-list', remainingPlayers);

        // Clean up empty sandbox maps
        if (sandboxPlayers.get(sandboxId).size === 0) {
          sandboxPlayers.delete(sandboxId);
        }

        // Also notify with player-left event
        socket.to(sandboxId).emit('player-left', {
          socketId: socket.id,
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

      // Remove player from all sandboxes they were in
      for (const [sandboxId, players] of sandboxPlayers.entries()) {
        if (players.has(socket.id)) {
          const playerInfo = players.get(socket.id);
          players.delete(socket.id);

          // Send updated player list to remaining players
          const remainingPlayers = Array.from(players.values());
          io.to(sandboxId).emit('players-list', remainingPlayers);

          // Also notify with player-left event
          io.to(sandboxId).emit('player-left', {
            socketId: socket.id,
            name: playerInfo?.name || 'Unknown',
            timestamp: new Date().toISOString()
          });

          // Clean up empty sandbox maps
          if (players.size === 0) {
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
