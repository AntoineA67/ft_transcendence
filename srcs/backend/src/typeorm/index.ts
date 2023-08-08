import { User } from "./user.entity";
import {Message} from "./message.entity";
import { Custom } from "./custom.entity";
import { GameUserLink } from "./game-user-link.entity";
import { Game } from "./game.entity";
import { Room } from "./room.entity";
import { RoomUserLink } from "./room-user-link.entity";
import { UserFriendshipLink } from "./user-friendship-link.entity";

const entities = [User, Message, Custom, GameUserLink, Game, Room, RoomUserLink, UserFriendshipLink, User];

export default entities;