import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('ðŸ”Œ Connected to Socket.io');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('âŒ Disconnected from Socket.io');
      setIsConnected(false);
    });

    newSocket.on('new_food_request', (data) => {
      toast.success(`New request from ${data.foodbankName}: ${data.itemName}`, {
        duration: 6000,
        position: 'top-right',
        icon: 'ðŸž',
      });
    });

    newSocket.on('donation_updated', (data) => {
      console.debug('donation_updated', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const userId = user?._id || user?.id || null;

    if (socket && isConnected && isAuthenticated && userId) {
      socket.emit('join', userId);
      console.log('Socket joined room for user', userId);
    }
  }, [socket, isConnected, isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
