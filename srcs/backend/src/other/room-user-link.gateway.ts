import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class RoomUserLinkGateway {
  @WebSocketServer()
  server: Server;

  handleRoomUserLinkEvent(data: any) {
    this.server.emit('roomUserLinkEvent', data);
  }
}
