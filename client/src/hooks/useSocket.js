import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function useSocket(sandboxId, playerName = null, role = 'player') {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
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

      // Join the sandbox room with player info
      if (sandboxId && playerName) {
        socket.emit('join-sandbox', {
          sandboxId,
          playerName: playerName || 'Anonymous',
          role: role || 'player'
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

      // Rejoin the sandbox room after reconnection
      if (sandboxId && playerName) {
        socket.emit('join-sandbox', {
          sandboxId,
          playerName: playerName || 'Anonymous',
          role: role || 'player'
        });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

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

      if (sandboxId) {
        socket.emit('leave-sandbox', sandboxId);
      }
      socket.disconnect();
    };
  }, [sandboxId, playerName, role]);

  return { socket: socketRef.current, isConnected };
}

export default useSocket;
