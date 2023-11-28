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
import { z } from 'zod';

const matchAgainstPayloadSchema = z.object({
    id: z.string(),
});
const cancelMatchmakePayloadSchema = z.string();
const keyPressesPayloadSchema = z.object({
    up: z.boolean(),
    down: z.boolean(),
    time: z.number(),
});

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
        try {
            const validatedPayload = matchAgainstPayloadSchema.parse(payload);
            await this.gamesService.matchAgainst(socket, this.wss, validatedPayload)
        } catch (error) {
            socket.emit('cancelledMatchmake');
        }
    }
    @SubscribeMessage('cancelMatchmake')
    async handleCancelMatchmake(socket: Socket, payload: string): Promise<void> {
        try {
            const validatedPayload = cancelMatchmakePayloadSchema.parse(payload);
            await this.gamesService.cancelMatchmake(socket, this.wss, validatedPayload);
        } catch (error) {
            socket.emit('cancelledMatchmake');
        }
    }


    @SubscribeMessage('cancel')
    async handleLeave(socket: Socket): Promise<void> {
        this.gamesService.disconnect(socket);
    }


    @SubscribeMessage('keyPresses')
    async handleKeyPresses(socket: Socket, payload: { up: boolean, down: boolean, time: number }): Promise<void> {
        try {
            const validatedPayload = keyPressesPayloadSchema.parse(payload);
            this.gamesService.handleKeysPresses(socket.data.user.id, validatedPayload);
        } catch (error) {
            socket.emit('invalidKeyPressesPayload');
        }
    }

    @SubscribeMessage('changeColor')
    async changeColor(socket: Socket, payload: string): Promise<void> {
        try {
            const colorValue = hexToNumber(payload);
            ;
            if (colorValue < hexToNumber('#000000') || colorValue > hexToNumber('#FFFFFF')) {
                return;
            }
            this.gameSettingsService.handleColor(socket.data.user.id, payload);
        } catch (error) {
            return;
        }
    }

    @SubscribeMessage('setGraphicEffects')
    async setGraphicEffects(socket: Socket, payload: boolean): Promise<void> {
        try {
            const validatedPayload = z.boolean().parse(payload);
            this.gameSettingsService.setGraphicEffects(socket.data.user.id, validatedPayload);
        } catch (error) {
            return;
        }
    }

    @SubscribeMessage('getMyGameSettings')
    async getMyGameSettings(@ConnectedSocket() client: Socket) {
        const userId: number = client.data.user.id;
        return (await this.gameSettingsService.getUserGameSettings(userId))
    }
}

