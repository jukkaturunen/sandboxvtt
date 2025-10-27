const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database
require('./database'); // Initialize database
const createApiRoutes = require('./routes');
const initializeSocketEvents = require('./socketEvents');

const app = express();
const server = http.createServer(app);

// Determine client URL for CORS
// In production, use SERVER_IP and PUBLIC_CLIENT_PORT to construct the client URL
const isProduction = process.env.NODE_ENV === 'production';
let clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

if (isProduction && process.env.SERVER_IP && process.env.PUBLIC_CLIENT_PORT) {
  clientUrl = `http://${process.env.SERVER_IP}:${process.env.PUBLIC_CLIENT_PORT}`;
}

const io = socketIo(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors({
  origin: clientUrl,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes (pass io instance)
const apiRoutes = createApiRoutes(io);
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize Socket.io events
initializeSocketEvents(io);

// In production, serve the built React app
if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));

  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (isProduction) {
    console.log(`Client accessible at: ${clientUrl}`);
  }
});
