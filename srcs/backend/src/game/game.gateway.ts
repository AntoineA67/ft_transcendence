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

const hexToNumber = (hex: string): number => parseInt(hex.replace('#', ''), 16);

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
    }

    handleDisconnect(socket: Socket) {
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
        try {
            await this.gamesService.addToQueue(socket, this.wss).catch(() => {
                socket.emit('cancelledMatchmake');
            });
        } catch {
            socket.emit('cancelledMatchmake');
        }
    }
    @SubscribeMessage('matchAgainst')
    async handleMatchAgainst(socket: Socket, payload: { id: string }): Promise<void> {
        await this.gamesService.matchAgainst(socket, this.wss, payload)
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
        const colorValue = hexToNumber(payload);
        if (colorValue < hexToNumber('#000000') || colorValue > hexToNumber('#FFFFFF')) {
            return null;
        }
        try {
            this.gameSettingsService.handleColor(socket.data.user.id, payload);
        } catch (error) {
            return;
        }
    }

    @SubscribeMessage('setGraphicEffects')
    async setGraphicEffects(socket: Socket, payload: boolean): Promise<void> {
        this.gameSettingsService.setGraphicEffects(socket.data.user.id, payload);
    }

    @SubscribeMessage('getMyGameSettings')
    async getMyGameSettings(@ConnectedSocket() client: Socket) {
        const userId: number = client.data.user.id;
        return (await this.gameSettingsService.getUserGameSettings(userId))
    }
}

