const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const db = require('./database');
const { processDiceRoll } = require('./diceRoller');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const sandboxId = req.params.id;
    const uploadPath = path.join(__dirname, '../uploads', sandboxId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Generate unique sandbox ID
function generateSandboxId() {
  return crypto.randomBytes(8).toString('hex');
}

// Export a function that takes io instance
module.exports = function(io) {
  const router = express.Router();

  // POST /api/sandbox - Create new sandbox
  router.post('/sandbox', (req, res) => {
    try {
      const sandboxId = generateSandboxId();
      db.createSandbox.run(sandboxId);
      
      res.json({
        id: sandboxId,
        gmUrl: `/sandbox/${sandboxId}?role=gm`,
        playerUrl: `/sandbox/${sandboxId}?role=player`
      });
    } catch (error) {
      console.error('Error creating sandbox:', error);
      res.status(500).json({ error: 'Failed to create sandbox' });
    }
  });

  // GET /api/sandbox/:id - Get sandbox data
  router.get('/sandbox/:id', (req, res) => {
    try {
      const sandbox = db.getSandbox.get(req.params.id);
      
      if (!sandbox) {
        return res.status(404).json({ error: 'Sandbox not found' });
      }
      
      res.json(sandbox);
    } catch (error) {
      console.error('Error getting sandbox:', error);
      res.status(500).json({ error: 'Failed to get sandbox' });
    }
  });

  // POST /api/sandbox/:id/image - Upload image
  router.post('/sandbox/:id/image', upload.single('image'), (req, res) => {
    try {
      const sandboxId = req.params.id;
      const imageName = req.body.name || 'Untitled';
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Check if sandbox exists
      const sandbox = db.getSandbox.get(sandboxId);
      if (!sandbox) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Sandbox not found' });
      }
      
      // Store relative path from uploads directory
      const filePath = `${sandboxId}/${req.file.filename}`;
      
      // Images are not active by default - GM must activate them manually
      const isActive = 0;

      const result = db.createImage.run(sandboxId, imageName, filePath, isActive);
      
      const imageData = {
        id: result.lastInsertRowid,
        name: imageName,
        file_path: filePath,
        is_active: isActive
      };
      
      // Emit socket event to notify all clients
      io.to(sandboxId).emit('image-uploaded', imageData);
      
      res.json(imageData);
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  // GET /api/sandbox/:id/images - Get all images
  router.get('/sandbox/:id/images', (req, res) => {
    try {
      const images = db.getImages.all(req.params.id);
      res.json(images);
    } catch (error) {
      console.error('Error getting images:', error);
      res.status(500).json({ error: 'Failed to get images' });
    }
  });

  // PUT /api/sandbox/:id/image/:imageId/activate - Set active image
  router.put('/sandbox/:id/image/:imageId/activate', (req, res) => {
    try {
      const { id: sandboxId, imageId } = req.params;
      
      // Check if image exists and belongs to sandbox
      const image = db.getImage.get(imageId);
      if (!image || image.sandbox_id !== sandboxId) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      // Clear all active images for this sandbox and set new one
      db.clearActiveImages.run(sandboxId);
      db.setActiveImage.run(1, imageId);
      
      // Emit socket event to notify all clients
      io.to(sandboxId).emit('active-view-changed', { imageId: parseInt(imageId) });
      
      res.json({ success: true, activeImageId: parseInt(imageId) });
    } catch (error) {
      console.error('Error activating image:', error);
      res.status(500).json({ error: 'Failed to activate image' });
    }
  });

  // GET /api/sandbox/:id/tokens - Get all tokens
  router.get('/sandbox/:id/tokens', (req, res) => {
    try {
      const tokens = db.getTokens.all(req.params.id);
      res.json(tokens);
    } catch (error) {
      console.error('Error getting tokens:', error);
      res.status(500).json({ error: 'Failed to get tokens' });
    }
  });

  // POST /api/sandbox/:id/token - Create token
  router.post('/sandbox/:id/token', (req, res) => {
    try {
      const sandboxId = req.params.id;
      const { image_id, name, color, position_x, position_y } = req.body;
      
      if (!image_id || !name || !color || position_x === undefined || position_y === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const result = db.createToken.run(sandboxId, image_id, name, color, position_x, position_y);
      
      const tokenData = {
        id: result.lastInsertRowid,
        sandbox_id: sandboxId,
        image_id,
        name,
        color,
        position_x,
        position_y
      };
      
      // Emit socket event to notify all clients
      io.to(sandboxId).emit('token-created', tokenData);
      
      res.json(tokenData);
    } catch (error) {
      console.error('Error creating token:', error);
      res.status(500).json({ error: 'Failed to create token' });
    }
  });

  // PUT /api/sandbox/:id/token/:tokenId - Update token position
  router.put('/sandbox/:id/token/:tokenId', (req, res) => {
    try {
      const { id: sandboxId, tokenId } = req.params;
      const { position_x, position_y } = req.body;
      
      if (position_x === undefined || position_y === undefined) {
        return res.status(400).json({ error: 'Missing position data' });
      }
      
      db.updateTokenPosition.run(position_x, position_y, tokenId);
      
      // Emit socket event to notify all clients
      io.to(sandboxId).emit('token-moved', {
        tokenId: parseInt(tokenId),
        position_x,
        position_y
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating token:', error);
      res.status(500).json({ error: 'Failed to update token' });
    }
  });

  // DELETE /api/sandbox/:id/token/:tokenId - Delete token
  router.delete('/sandbox/:id/token/:tokenId', (req, res) => {
    try {
      const { id: sandboxId, tokenId } = req.params;
      
      db.deleteToken.run(tokenId);
      
      // Emit socket event to notify all clients
      io.to(sandboxId).emit('token-deleted', { tokenId: parseInt(tokenId) });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting token:', error);
      res.status(500).json({ error: 'Failed to delete token' });
    }
  });

  // GET /api/sandbox/:id/messages - Get chat messages
  router.get('/sandbox/:id/messages', (req, res) => {
    try {
      const sandboxId = req.params.id;
      const playerName = req.query.for_player;

      // If for_player query param is provided, filter messages for that player
      let messages;
      if (playerName) {
        messages = db.getMessagesForPlayer.all(sandboxId, playerName, playerName);
      } else {
        // Return all messages (for backward compatibility)
        messages = db.getMessages.all(sandboxId);
      }

      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  // POST /api/sandbox/:id/message - Create chat message
  router.post('/sandbox/:id/message', (req, res) => {
    try {
      const sandboxId = req.params.id;
      const { sender_name, sender_role, message, recipient_name } = req.body;

      if (!sender_name || !sender_role || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // recipient_name is optional - null means message to ALL
      const recipientName = recipient_name || null;

      // Check if this is a dice roll command
      let isDiceRoll = 0;
      let diceCommand = null;
      let diceResults = null;
      let finalMessage = message;

      if (message.trim().startsWith('/r ')) {
        const rollCommand = message.trim().substring(3).trim();
        const rollResult = processDiceRoll(rollCommand);

        if (!rollResult.isValid) {
          // Return error only to sender (don't broadcast)
          return res.status(400).json({ error: rollResult.error });
        }

        // Dice roll successful
        isDiceRoll = 1;
        diceCommand = rollResult.command;
        diceResults = JSON.stringify({
          count: rollResult.count,
          sides: rollResult.sides,
          rolls: rollResult.rolls,
          droppedIndex: rollResult.droppedIndex,
          modifier: rollResult.modifier,
          dropModifier: rollResult.dropModifier,
          sum: rollResult.sum
        });
        finalMessage = rollResult.formattedOutput;
      }

      const result = db.createMessage.run(
        sandboxId,
        sender_name,
        sender_role,
        finalMessage,
        recipientName,
        isDiceRoll,
        diceCommand,
        diceResults
      );

      const messageData = {
        id: result.lastInsertRowid,
        sandbox_id: sandboxId,
        sender_name,
        sender_role,
        message: finalMessage,
        recipient_name: recipientName,
        is_dice_roll: isDiceRoll,
        dice_command: diceCommand,
        dice_results: diceResults,
        created_at: new Date().toISOString()
      };

      // Emit socket event to notify all clients
      io.to(sandboxId).emit('chat-message', messageData);

      res.json(messageData);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  });

  return router;
};
