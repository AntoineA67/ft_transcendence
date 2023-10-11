import io, { Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { gamesSocket } from "./socket";

const hostAdress = 'localhost:3000'

function connectToSocketWithToken(token: any) {
  return gamesSocket;
}

export const SocketContext = createContext(null);

export const GameSocketProvider = ({ children, store }: any) => {

  const [isConnected, setConnected] = useState(false)
  const socket: any = useRef(null)

  const handleOnMessage = (message: any) => {
    console.log(message)
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
        console.log('Socket Error:', err.message)
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