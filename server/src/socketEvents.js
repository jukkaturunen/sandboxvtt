const db = require('./database');

// Initialize socket event handlers
function initializeSocketEvents(io) {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a sandbox room
    socket.on('join-sandbox', (sandboxId) => {
      socket.join(sandboxId);
      console.log(`Socket ${socket.id} joined sandbox ${sandboxId}`);
      
      // Notify others in the room
      socket.to(sandboxId).emit('user-joined', {
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    // Leave a sandbox room
    socket.on('leave-sandbox', (sandboxId) => {
      socket.leave(sandboxId);
      console.log(`Socket ${socket.id} left sandbox ${sandboxId}`);
      
      socket.to(sandboxId).emit('user-left', {
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
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
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
}

module.exports = initializeSocketEvents;
