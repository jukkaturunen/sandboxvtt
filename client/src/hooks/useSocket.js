import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function useSocket(sandboxId, userId = null, userName = null, userRole = 'player') {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Don't connect if userId is not available
    if (!userId) {
      return;
    }

    // Connect to Socket.io server
    // In development: Use Vite proxy (relative path)
    // In production: Use environment variable or window.location.origin
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);

      // Join the sandbox room with user info
      if (sandboxId && userId && userName) {
        socket.emit('join-sandbox', {
          sandboxId,
          userId,
          userName,
          role: userRole || 'player'
        });
      }
    };

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    };

    const handleReconnect = () => {
      console.log('Socket reconnected');
      setIsConnected(true);
      setConnectionError(null);

      // Rejoin the sandbox room after reconnection
      if (sandboxId && userId && userName) {
        socket.emit('join-sandbox', {
          sandboxId,
          userId,
          userName,
          role: userRole || 'player'
        });
      }
    };

    const handleUserAlreadyConnected = (data) => {
      console.error('User already connected:', data);
      setConnectionError(data.error);
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('user-already-connected', handleUserAlreadyConnected);

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('user-already-connected', handleUserAlreadyConnected);

      if (sandboxId) {
        socket.emit('leave-sandbox', sandboxId);
      }
      socket.disconnect();
    };
  }, [sandboxId, userId, userName, userRole]);

  return { socket: socketRef.current, isConnected, connectionError };
}

export default useSocket;
