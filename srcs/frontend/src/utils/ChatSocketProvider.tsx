import io, { Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const hostAdress = 'localhost:3000';

function connectToSocketWithToken(token: any) {
  const options = {
    transports: ['websocket'],
    auth: {
      'Authorization': `Bearer ${token}`,
    },
  };
  const socket = io(`${hostAdress}/chat`, options);

  return socket;
}

export const ChatSocketContext = createContext(null);

export const ChatSocketProvider = ({ children, store }: any) => {

  const [isConnected, setConnected] = useState(false);

  const socketUrl = `${hostAdress}/chat`;

  const socket: any = useRef(null);

  const handleOnMessage = (message: any) => {
    console.log(message);
  }

  useEffect(() => {
    if (!isConnected) {
      const token = localStorage.getItem('token');
      socket.current = connectToSocketWithToken(token);

      socket.current.on('connect', () => {
        console.info(`Successfully connected to socket at ${socketUrl}`);
        setConnected(true);
      });

      socket.current.on('disconnect', () => {
        console.info(`Successfully disconnected`);
        setConnected(false);
      });

      socket.current.on('error', (err: { message: string }) => {
        console.log('Socket Error:', err.message);
        if (err.message === 'Invalid token') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      });

      socket.current.on('message', handleOnMessage);
    }

    return () => {
      if (socket.current && socket.current.connected) {
        socket.current.disconnect();
      }
    }
  }, [isConnected, socketUrl]);

  return (
    <ChatSocketContext.Provider value={socket.current}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export const useChatSocket = () => useContext(ChatSocketContext) as unknown as Socket;
