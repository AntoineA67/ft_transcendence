import io from "socket.io-client";

// Créez une fonction pour personnaliser la connexion WebSocket
function connectToSocketWithToken(token:any) {
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
const token = 'TEST'; // Remplacez 'TEST' par votre token réel
export const socket = connectToSocketWithToken(token);
  
// Vous pouvez maintenant utiliser le socket pour communiquer avec le serveur
socket.on('connect', () => {
    console.log('Connecté au serveur WebSocket');
});