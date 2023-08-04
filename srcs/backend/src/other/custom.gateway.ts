import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class CustomGateway {
  @WebSocketServer()
  server: Server;

  handleCustomEvent(data: any) {
    this.server.emit('customEvent', data);
  }
}
