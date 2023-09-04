import io from "socket.io-client";

// Créez une fonction pour personnaliser la connexion WebSocket
function connectToSocketWithToken(token: any) {
  // Créez un objet avec les options pour la connexion WebSocket
  const options = {
    extraHeaders: {
      // Ajoutez votre token personnalisé dans le header
      Authorization: `Bearer ${token}`,
    },
  };

  // Utilisez les options pour établir la connexion WebSocket
  const socket = io('localhost:3000', options);

  return socket;
}

// Utilisez la fonction pour établir la connexion WebSocket avec le token
const token = localStorage.getItem('token');
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWxvbnNvIiwiZW1haWwiOiJmYWxvbnNvQHN0dWRlbnQuNDJseW9uLmZyIiwibG9naW4iOiJmYWxvbnNvIiwiaWF0IjoxNjkzNTkyNzI3LCJleHAiOjE2OTM1OTYzMjd9.0e2xV6dqvr0wJdA-QUrr3ekoCBxFwqKnVzjk8AdBcEA"
export const socket = connectToSocketWithToken(token);

// Vous pouvez maintenant utiliser le socket pour communiquer avec le serveur
socket.on('connect', () => {
  console.log(token)
  console.log('Connecté au serveur WebSocket');
});