import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class RoomGateway {
  @WebSocketServer()
  server: Server;

  handleRoomEvent(data: any) {
    this.server.emit('roomEvent', data);
  }
}
