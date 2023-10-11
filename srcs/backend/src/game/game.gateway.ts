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
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { WsJwtGuard } from 'src/auth/ws-auth.guard';
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

    handleDisconnect(client: Socket) {
        this.logger.log(`Player Disconnected: ${client.id} from ${client.rooms}`);
        this.gamesService.disconnect(client);
    }

    handleConnection(client: Socket, ...args: any[]) {
        //const token = client.handshake.auth.Authorization?.split(' ')[1];
        //console.log(`Received new connection with token "${token}", is it valid ? 🤔`)

        // try {
        //     const payload = this.jwtService.verify(token, { secret: jwtConstants.secret });
        //     console.log('Token is valid! decoded:', payload)
        // } catch (e) {
        //     console.log('Error', e)
        //     client.emit('error', { message: 'Invalid token' });
        //     client.disconnect();
        //     return;
        // }
        console.log(`Client successfully connected! 🆔  ${client.id}`)
        client.emit('id', client.id)
    }

    @SubscribeMessage('match')
    async handleMatch(client: Socket, payload: string): Promise<void> {
        if (!this.gamesService.isInQueue(client)) {
            this.gamesService.addToQueue(client, this.wss);
        }
    }

    @SubscribeMessage('cancel')
    async handleLeave(client: Socket, payload: string): Promise<void> {
        this.gamesService.disconnect(client);
    }

    @SubscribeMessage('keyPresses')
    async handleKeyPresses(client: Socket, payload: { up: boolean, down: boolean, time: number }): Promise<void> {
        this.gamesService.handleKeysPresses(client.id, payload);
    }
}

