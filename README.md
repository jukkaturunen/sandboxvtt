# SandboxVTT

A minimal online Virtual Table Top (VTT) application for playing role-playing games.

## Project Structure

```
sandboxvtt/
├── client/              # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   ├── uploads/         # Image storage
│   └── database.sqlite  # SQLite database
├── package.json         # Root package.json for running both
└── .env                 # Environment variables
```

## Tech Stack

- **Frontend**: React + Vite, Konva.js (canvas), Socket.io-client
- **Backend**: Node.js + Express, Socket.io, SQLite
- **Real-time**: Socket.io

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
# Install root dependencies
npm install

# Install client dependencies
npm install --prefix client
```

### Development

```bash
# Run both client and server concurrently
npm run dev

# Or run separately:
npm run server  # Server on port 3001
npm run client  # Client on port 3000
```

### Production Build

```bash
# Build client
npm run build

# Start server
npm start
```

## Deployment

For deploying to a production server (DigitalOcean, VPS, etc.), see the comprehensive **[DEPLOYMENT.md](DEPLOYMENT.md)** guide.

Quick deployment overview:
1. Set up your Ubuntu server with Node.js and PM2
2. Configure `.env` with your server IP and port
3. Run the deployment script: `bash deploy/deploy.sh`
4. Access at `http://YOUR_IP:YOUR_PORT`

## API Endpoints

- `GET /api/health` - Health check
- See [server/src/routes.js](server/src/routes.js) for full API documentation

## Environment Variables

See [.env.example](.env.example) file for configuration options.

### Key Variables:
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 3001)
- `SERVER_IP` - Your server IP (production only)
- `PUBLIC_CLIENT_PORT` - Public access port (production only)
- `DATABASE_PATH` - SQLite database location

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- [Requirements](requirements.md)
- [Implementation Plan](implementation-plan.md)
- [Status](status.md)
