import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AchievementGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Gestion de la connexion du client
  }

  handleDisconnect(client: Socket) {
    // Gestion de la déconnexion du client
  }

  // Vous pouvez ajouter des méthodes pour gérer les événements liés aux réalisations ici
}
