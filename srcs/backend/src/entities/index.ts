import { User } from "./user.entity";
import { Message } from "./message.entity";
import { Game } from "./game.entity";
import { Custom } from "./custom.entity";
import { Room } from "./room.entity";
import { GameUserLink } from "./game-user-link.entity";
import { RoomUserLink } from "./room-user-link.entity";
import { UserFriendshipLink } from "./user-friendship-link.entity";

const entities = [User, Message, Game, Custom, Room, GameUserLink, RoomUserLink, UserFriendshipLink];

export default entities;