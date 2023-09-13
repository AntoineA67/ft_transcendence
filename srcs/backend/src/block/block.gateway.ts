import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class BlockGateway {
 

  // Vous pouvez ajouter des méthodes pour gérer les événements liés aux blocs ici
}
