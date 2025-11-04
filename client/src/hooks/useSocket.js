import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function useSocket(sandboxId, userId = null, userName = null, userRole = 'player') {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Don't connect if userId is not available
    if (!userId) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    // Connect to Socket.io server
    // In development: Use Vite proxy (relative path)
    // In production: Use environment variable or window.location.origin
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    const handleConnect = () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);

      // Join the sandbox room with user info
      if (sandboxId && userId && userName) {
        newSocket.emit('join-sandbox', {
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
        newSocket.emit('join-sandbox', {
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

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('reconnect', handleReconnect);
    newSocket.on('user-already-connected', handleUserAlreadyConnected);

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('reconnect', handleReconnect);
      newSocket.off('user-already-connected', handleUserAlreadyConnected);

      if (sandboxId) {
        newSocket.emit('leave-sandbox', sandboxId);
      }
      newSocket.disconnect();
    };
  }, [sandboxId, userId, userName, userRole]);

  return { socket, isConnected, connectionError };
}

export default useSocket;
