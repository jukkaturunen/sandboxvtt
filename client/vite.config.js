import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Suppress EPIPE errors from WebSocket proxy (they're harmless reconnection events)
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorMessage = args.join(' ');
  if (errorMessage.includes('EPIPE') && errorMessage.includes('ws proxy error')) {
    // Suppress EPIPE WebSocket proxy errors
    return;
  }
  originalConsoleError.apply(console, args);
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
        // Handle proxy errors silently
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Silently ignore EPIPE errors (normal WebSocket reconnection)
            if (err.code !== 'EPIPE') {
              console.log('proxy error', err);
            }
          });
          proxy.on('proxyReqWs', (_proxyReq, _req, _socket, _options, _head) => {
            // Handle WebSocket proxy requests
          });
        },
      },
    },
  },
})
