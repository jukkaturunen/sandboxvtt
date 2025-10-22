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

### Production

```bash
# Build client
npm run build --prefix client

# Start server
npm start
```

## API Endpoints

- `GET /api/health` - Health check

## Environment Variables

See `.env` file for configuration options.

## Documentation

- [Requirements](requirements.md)
- [Implementation Plan](implementation-plan.md)
- [Status](status.md)
