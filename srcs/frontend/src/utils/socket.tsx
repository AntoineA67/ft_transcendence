import io, { Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useRef, useState } from 'react';

function connectToSocketWithToken(token: any) {
  const options = {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  };
  const socket = io('localhost:3000/game', options);

  return socket;
}

// Utilisez la fonction pour établir la connexion WebSocket avec le token
// const token = localStorage.getItem('token');
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWxvbnNvIiwiZW1haWwiOiJmYWxvbnNvQHN0dWRlbnQuNDJseW9uLmZyIiwibG9naW4iOiJmYWxvbnNvIiwiaWF0IjoxNjkzNTkyNzI3LCJleHAiOjE2OTM1OTYzMjd9.0e2xV6dqvr0wJdA-QUrr3ekoCBxFwqKnVzjk8AdBcEA"
// export const socket = connectToSocketWithToken(token);

export const SocketContext = createContext(null);

export const SocketProvider = ({ children, store }: any) => {

  const [isConnected, setConnected] = useState(false)

  const socketUrl = `localhost:3000/game`

  const socket: any = useRef(null)

  const handleOnMessage = (message: any) => {
    console.log(message)
    // store.dispatch here
  }

  useEffect(() => {
    if (!isConnected) {
      socket.current = connectToSocketWithToken(localStorage.getItem('token'))

      socket.current.on('connect', () => {
        console.info(`Successfully connected to socket at ${socketUrl}`)
        setConnected(true)
      })

      socket.current.on('disconnect', () => {
        console.info(`Successfully disconnected`)
        setConnected(false)
      })

      socket.current.on('error', (err: { message: any; }) => {
        console.log('Socket Error:', err.message)
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

// // Vous pouvez maintenant utiliser le socket pour communiquer avec le serveur
// socket.on('connect', () => {
//   console.log(token)
//   console.log('Connecté au serveur WebSocket');
// });

// socket.on('disconnect', () => {
//   console.log('Déconnecté du serveur WebSocket');
// })