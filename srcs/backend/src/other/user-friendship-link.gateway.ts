import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class UserFriendshipLinkGateway {
  @WebSocketServer()
  server: Server;

  handleUserFriendshipLinkEvent(data: any) {
    this.server.emit('userFriendshipLinkEvent', data);
  }
}
