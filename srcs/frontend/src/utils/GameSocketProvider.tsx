import { Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { gamesSocket } from "./socket";

export const SocketContext = createContext(null);

export const GameSocketProvider = ({ children, store }: any) => {

  const [isConnected, setConnected] = useState(false)
  const socket: any = useRef(null)

  const handleOnMessage = (message: any) => {
  }

  useEffect(() => {
    if (!isConnected) {
      socket.current = gamesSocket;

      socket.current.on('connect', () => {
        setConnected(true)
      });

      socket.current.on('disconnect', () => {
        console.info(`Successfully disconnected`)
        setConnected(false)
      })

      socket.current.on('error', (err: { message: string }) => {
        if (err.message === 'Invalid token') {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      })
      socket.current.on('message', handleOnMessage)
    }

    return () => {
      if (socket.current && socket.current.connected) {
        socket.current.disconnect()
      }
    }
  }, [])

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  )
}

export const useGameSocket = () => useContext(SocketContext) as unknown as Socket;