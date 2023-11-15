import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MemberService } from './member.service';
import { Logger, UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from 'src/AllExceptionsFilter';


@UseFilters(AllExceptionsFilter)
@WebSocketGateway({ cors: true, namespace: 'chats'  })
export class MemberGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly memberService: MemberService) { }
  private logger: Logger = new Logger('MemberService');

  async handleConnection(client: Socket) {
    const id: number = client.data.user.id;
    client.join(id.toString());
  }

  async handleDisconnect(client: Socket) {
    const id: number = client.data.user.id;
    client.leave(id.toString());
  }

  @SubscribeMessage('getMemberDatabyRoomId')
  async GetMemberDatabyRoomId(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    const id: number = client.data.user.id;
    const roomid = parseInt(roomId, 10);
    return (await this.memberService.getMemberDatabyRoomId(id, roomid));
  }
}
