import io, { Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const hostAdress = '192.168.137.1:3000'

function connectToSocketWithToken(token: any) {
  const options = {
    transports: ['websocket'],
    auth: {
      'Authorization': `Bearer ${token}`,
    },
  };
  const socket = io(`${hostAdress}/game`, options);

  return socket;
}

export const SocketContext = createContext(null);

export const SocketProvider = ({ children, store }: any) => {
  console.log("SocketProvider")

  const [isConnected, setConnected] = useState(false)

  const socketUrl = `${hostAdress}/game`

  const socket: any = useRef(null)

  const handleOnMessage = (message: any) => {
    console.log(message)
    // store.dispatch here
  }

  useEffect(() => {
    console.log("SocketProvider useEffect")
    if (!isConnected) {
      const token = localStorage.getItem('token')
      console.log("SocketProvider useEffect !isConnected", token)
      socket.current = connectToSocketWithToken(token)

      socket.current.on('connect', () => {
        console.info(`Successfully connected to socket at ${socketUrl}`)
        setConnected(true)
      })

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

export const useSocket = () => useContext(SocketContext) as unknown as Socket;