import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Suppress WebSocket proxy errors (they're harmless reconnection events)
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorMessage = args.join(' ');
  // Suppress all WebSocket proxy errors related to connection issues
  if (errorMessage.includes('ws proxy') ||
      (errorMessage.includes('proxy error') && (errorMessage.includes('EPIPE') || errorMessage.includes('ECONNRESET')))) {
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
            // Silently ignore connection errors (normal WebSocket reconnection)
            if (err.code !== 'EPIPE' && err.code !== 'ECONNRESET') {
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
