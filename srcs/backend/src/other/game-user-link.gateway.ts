import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class GameUserLinkGateway {
  @WebSocketServer()
  server: Server;

  handleGameUserLinkEvent(data: any) {
    this.server.emit('gameUserLinkEvent', data);
  }
}
