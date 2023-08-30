import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RoomUserLinkGateway {
  @WebSocketServer()
  server: Server;

  handleRoomUserLinkEvent(data: any) {
    this.server.emit('roomUserLinkEvent', data);
  }
}
