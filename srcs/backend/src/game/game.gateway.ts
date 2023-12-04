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

const keyPressesPayloadSchema = z.object({
    up: z.boolean(),
    down: z.boolean(),
    time: z.number(),
});

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

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

    async handleDisconnect(socket: Socket) {
        await this.gamesService.disconnect(socket);
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
            await this.gamesService.matchAgainst(socket, this.wss, payload)
        } catch (error) {
            socket.emit('cancelledMatchmake');
        }
    }
    @SubscribeMessage('cancelMatchmake')
    async handleCancelMatchmake(socket: Socket, payload: string): Promise<void> {
        try {
            await this.gamesService.cancelMatchmake(socket, this.wss, payload.toString());
        } catch (error) {
            socket.emit('cancelledMatchmake');
        }
    }


    @SubscribeMessage('cancel')
    async handleLeave(socket: Socket): Promise<void> {
        try {
            await this.gamesService.disconnect(socket);
        } catch (error) {
            return;
        }
    }


    @SubscribeMessage('keyPresses')
    async handleKeyPresses(socket: Socket, payload: { up: boolean, down: boolean, time: number }): Promise<void> {
        try {
            const validatedPayload = keyPressesPayloadSchema.parse(payload);
            this.gamesService.handleKeysPresses(socket.data.user.id, { up: validatedPayload.up, down: validatedPayload.down, time: validatedPayload.time });
        } catch (error) {
            socket.emit('invalidKeyPressesPayload');
        }
    }

    @SubscribeMessage('changeColor')
    async changeColor(socket: Socket, payload: string): Promise<void> {
        try {
            const colorValue = hexToNumber(payload);
            if (colorValue < hexToNumber('#000000') || colorValue > hexToNumber('#FFFFFF')) {
                return;
            }
            // Convert hex color to RGB 
            const rgbColor = hexToRgb(payload);
            if (rgbColor.b + rgbColor.g + rgbColor.r < 255) {
                return;
            }
            // Convert RGB color back to hex
            const halfBrightnessColor = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
            await this.gameSettingsService.handleColor(socket.data.user.id, halfBrightnessColor);
        } catch (error) {
            return;
        }
    }

    @SubscribeMessage('setGraphicEffects')
    async setGraphicEffects(socket: Socket, payload: boolean): Promise<void> {
        try {
            const validatedPayload = z.boolean().parse(payload);
            await this.gameSettingsService.setGraphicEffects(socket.data.user.id, validatedPayload);
        } catch (error) {
            return;
        }
    }

    @SubscribeMessage('getMyGameSettings')
    async getMyGameSettings(@ConnectedSocket() client: Socket) {
        try {

            const userId: number = client.data.user.id;
            return (await this.gameSettingsService.getUserGameSettings(userId))
        } catch (error) {
            return;
        }
    }
}

