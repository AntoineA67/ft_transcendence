import { Logger } from '@nestjs/common';
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
import { GameSettingsService } from 'src/gameSettings/gameSettings.service';

@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private readonly gamesService: GamesService,
        private readonly gameSettingsService: GameSettingsService,
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
        try {
            socket.emit('id', socket.data.user.id)
        } catch (error) {
            socket.disconnect();
        }
    }

    @SubscribeMessage('match')
    async handleMatch(socket: Socket): Promise<void> {
        if (!this.gamesService.isInQueue(socket.data.user.id)) {
            this.gamesService.addToQueue(socket, this.wss);
        }
    }
    @SubscribeMessage('matchAgainst')
    async handleMatchAgainst(socket: Socket, payload: { id: string }): Promise<void> {
        this.gamesService.matchAgainst(socket, this.wss, payload);
    }
    @SubscribeMessage('cancelMatchmake')
    async handleCancelMatchmake(socket: Socket, payload: string): Promise<void> {
        this.gamesService.cancelMatchmake(socket, this.wss, payload);
    }


    @SubscribeMessage('cancel')
    async handleLeave(socket: Socket): Promise<void> {
        this.gamesService.disconnect(socket);
    }


    @SubscribeMessage('keyPresses')
    async handleKeyPresses(socket: Socket, payload: { up: boolean, down: boolean, time: number }): Promise<void> {
        this.gamesService.handleKeysPresses(socket.data.user.id, payload);
    }

    @SubscribeMessage('changeColor')
    async changeColor(socket: Socket, payload: string): Promise<void> {
        this.gameSettingsService.handleColor(socket.data.user.id, payload);
    }

    @SubscribeMessage('setGraphicEffects')
    async setGraphicEffects(socket: Socket, payload: boolean): Promise<void> {
        this.gameSettingsService.setGraphicEffects(socket.data.user.id, payload);
    }

    @SubscribeMessage('getMyGameSettings')
    async getMyGameSettings(@ConnectedSocket() client: Socket) {
        this.logger.log('getMyGameSettings')
        const userId: number = client.data.user.id;
        return (await this.gameSettingsService.getUserGameSettings(userId))
    }
}

