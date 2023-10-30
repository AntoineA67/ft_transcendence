import { Logger, UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
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
import { GameSettingsService } from 'src/gameSettings/gameSettings.service';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private matches = {};

    constructor(
        private readonly gamesService: GamesService,
        private jwtService: JwtService,
        private readonly gameSettingsService: GameSettingsService,
        private readonly prisma: PrismaService,
    ) { }

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
    @SubscribeMessage('matchAgainst')
    async handleMatchAgainst(socket: Socket, payload: string): Promise<void> {
        console.log(`Trying match ${socket.data.user.id} against ${payload}`)
        const sockets = await this.wss.fetchSockets();
        // if (socket.data.user.id == payload) {
        //     return;
        // }
        if (this.matches[payload] == socket.data.user.id) {
            delete this.matches[payload];
            console.log("LAUNCHING MATCH " + payload + " " + socket.data.user.id)
            for (let s of sockets) {
                if (s.data.user.id == payload) {
                    this.gamesService.matchmakePlayers(this.wss, socket, s as unknown as Socket);
                    break;
                }
            }
        } else {
            for (let s of sockets) {
                if (s.data.user.id == payload) {
                    s.emit('ponged', { nick: "", id: socket.data.user.id })
                    this.matches[socket.data.user.id] = payload;
                    console.log(`Matched ${socket.data.user.id} with ${payload}, now matches are ${this.matches.toString()}`)
                    break;
                }
            }
        }
    }


    @SubscribeMessage('cancel')
    async handleLeave(socket: Socket, payload: string): Promise<void> {
        this.gamesService.disconnect(socket);
    }

    @SubscribeMessage('keyPresses')
    async handleKeyPresses(socket: Socket, payload: { up: boolean, down: boolean, time: number }): Promise<void> {
        // console.log(socket.data.user.id);
        this.gamesService.handleKeysPresses(socket.data.user.id, payload);
    }

    @SubscribeMessage('changeColor')
    async handleColor(socket: Socket, payload: string): Promise<void> {
        this.gameSettingsService.handleColor(socket.data.user.id, payload);
    }

    // @SubscribeMessage('getMyPaddleColor')
    // async getColor(socket: Socket, payload: string): Promise<void> {
    //     this.gameSettingsService.handleColor(socket.data.user.id, payload);
    // }
    @SubscribeMessage('getMyPaddleColor')
    async handleMyProfile(@ConnectedSocket() client: Socket) {
        this.logger.log('getMyPaddleColor')
        const userId: number = client.data.user.id;
        return (await this.gameSettingsService.getUserGameSettings(userId))
    }
}

