import { Logger, UseGuards } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GamesService } from './game.service';
import { FortyTwoAuthGuard } from 'src/auth/guards/forty-two-auth.guard';
// import { WsJwtGuard } from 'src/auth/ws-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';

@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly gamesService: GamesService, private jwtService: JwtService) { }

    private logger: Logger = new Logger('Game Gateway');

    @WebSocketServer() wss: Server;

    afterInit(server: Server) {
        this.logger.log('Initialized');
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Player Disconnected: ${socket.id} from ${socket.rooms}`);
        this.gamesService.disconnect(socket);
    }

    handleConnection(socket: Socket, ...args: any[]) {
        console.log(`Client successfully connected! 🆔  ${socket.data.user.id}`)
        socket.emit('id', socket.data.user.id)
    }

    @SubscribeMessage('match')
    async handleMatch(socket: Socket, payload: string): Promise<void> {
        if (!this.gamesService.isInQueue(socket)) {
            this.gamesService.addToQueue(socket, this.wss);
        }
    }

    @SubscribeMessage('cancel')
    async handleLeave(socket: Socket, payload: string): Promise<void> {
        this.gamesService.disconnect(socket);
    }

    @SubscribeMessage('keyPresses')
    async handleKeyPresses(socket: Socket, payload: { up: boolean, down: boolean, time: number }): Promise<void> {
        console.log(socket.data.user.id);
        this.gamesService.handleKeysPresses(socket.data.user.id, payload);
    }
}

