import { Logger } from '@nestjs/common';
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

@WebSocketGateway({ cors: true })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gamesService: GamesService) { }

  private logger: Logger = new Logger('MessageGateway');
  private clients: { [id: string]: Player } = {};
  private ball: Ball | null = null;
  private interval: NodeJS.Timeout | null = null;

  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log('Initialized');
    this.interval = setInterval(() => {
      this.updateGameTick();
      this.wss.emit('clients', { clients: this.clients, ball: this.ball });
    }, 50);
  }

  private updateGameTick() {
    if (!this.ball) return
    Object.values(this.clients).forEach((client) => {
      client.update();
    });
    this.ball?.update(this.clients);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Player Disconnected: ${client.id}`);
    if (this.clients && this.clients[client.id]) {
      console.log('deleting ' + client.id)
      delete this.clients[client.id]
      this.wss.emit('removePlayer', client.id)
    }
    if (Object.keys(this.clients).length < 2) {
      this.ball = null
      // this.clients[Object.keys(this.clients)[0]].invertedSide = false
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Player Connected: ${client.id}`);
    if (Object.keys(this.clients).length === 1) {
      this.clients[client.id] = new Player(client.id, true)
      this.ball = new Ball()
    } else {
      this.clients[client.id] = new Player(client.id, false)
    }
    client.emit('id', client.id)
  }

  // @SubscribeMessage('sendMessage')
  // async handleSendMessage(client: Socket, payload: string): Promise<void> {
  //   this.logger.log('payload', payload);
  //   const newMessage = await this.messagesService.createMessage(payload);
  //   this.wss.emit('receiveMessage', newMessage);
  // }
  @SubscribeMessage('UpKeyPressed')
  async handleUpKeyPressed(client: Socket, payload: string): Promise<void> {
    console.log('UpKeyPressed', payload)
    this.clients[client.id].direction = 1
  }
  @SubscribeMessage('UpKeyReleased')
  async handleUpKeyReleased(client: Socket, payload: string): Promise<void> {
    console.log('UpKeyReleased', payload)
    this.clients[client.id].direction = 0
  }
  @SubscribeMessage('DownKeyPressed')
  async handleDownKeyPressed(client: Socket, payload: string): Promise<void> {
    console.log('DownKeyPressed', payload)
    this.clients[client.id].direction = -1
  }
  @SubscribeMessage('DownKeyReleased')
  async handleDownKeyReleased(client: Socket, payload: string): Promise<void> {
    console.log('DownKeyReleased', payload)
    this.clients[client.id].direction = 0
  }
}

class Ball {
  static speed = .01
  constructor(
    public x: number = .5,
    public y: number = .5,
    public velocityX: number = Math.random() > 0.5 ? Ball.speed : -Ball.speed,
    public velocityY: number = 0) { }

  update(clients: { [id: string]: Player; }) {
    // console.log(clients)
    this.x += this.velocityX;
    this.y += this.velocityY;
    if (this.y < 0) {
      this.y = 0;
      this.velocityY = -this.velocityY;
    }
    else if (this.y > 1) {
      this.y = 1;
      this.velocityY = -this.velocityY;
    }
    if (this.x < 0 || this.x > 1) {
      this.reset();
    }
    const client = clients[Object.keys(clients)[this.x < .5 ? 0 : 1]]
    // console.log(client)
    if (this.collide(client)) {
      let collidePoint = this.y - client.y;
      collidePoint = collidePoint / Player.halfPaddleHeight;
      const angleRad = (Math.PI / 4) * collidePoint;
      const direction = client.invertedSide ? -1 : 1;

      this.velocityX = direction * .01 * Math.cos(angleRad);
      this.velocityY = .01 * Math.sin(angleRad);
    }
  }

  private collide(client: Player) {
    return (client.invertedSide ? (this.x >= client.xDistance) : (this.x <= client.xDistance)) && Math.abs(this.y - client.y) <= Player.halfPaddleHeight
  }

  private reset() {
    this.x = 0.5;
    this.y = 0.5;
    this.velocityX = Math.random() > 0.5 ? Ball.speed : -Ball.speed;
    this.velocityY = 0;
  }
}

class Player {
  static speedFactor: number = .01;
  static distanceFromWall: number = .02;
  static halfPaddleHeight: number = .05;
  public xDistance: number;

  constructor(public id: string, public invertedSide: boolean = false, public y: number = .5, public direction: number = 0) {
    this.xDistance = invertedSide ? 1 - Player.distanceFromWall : Player.distanceFromWall;
  }

  update() {
    if (this.direction !== 0) {
      this.y += this.direction * Player.speedFactor;
      if (this.y < 0) {
        this.y = 0;
      }
      else if (this.y > 1) {
        this.y = 1;
      }
    }
  }
}
