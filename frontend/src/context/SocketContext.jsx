import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket.io');
      setIsConnected(true);
    });

    // Auto-join user room when connected
    newSocket.on('connect', () => {
      try {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userId = user?._id || user?.id || null;
        if (userId) {
          newSocket.emit('join', userId);
          console.log('Socket joined room for user', userId);
        }
      } catch (e) {
        // ignore
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io');
      setIsConnected(false);
    });

    // Listen for new food requests from food banks
    newSocket.on('new_food_request', (data) => {
      toast.success(`New request from ${data.foodbankName}: ${data.itemName}`, {
        duration: 6000,
        position: 'top-right',
        icon: '🍞',
      });
    });

    // Listen for donation updates (UI refresh handled in components)
    newSocket.on('donation_updated', (data) => {
      console.debug('donation_updated', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
