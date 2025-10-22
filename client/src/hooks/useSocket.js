import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function useSocket(sandboxId) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to Socket.io server
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);

      // Join the sandbox room
      if (sandboxId) {
        socket.emit('join-sandbox', sandboxId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (sandboxId) {
        socket.emit('leave-sandbox', sandboxId);
      }
      socket.disconnect();
    };
  }, [sandboxId]);

  return { socket: socketRef.current, isConnected };
}

export default useSocket;
