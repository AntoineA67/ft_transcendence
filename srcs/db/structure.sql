-- tables
create table users
(
    id     serial
        primary key,
    email       varchar(255) not null
        unique,
    password    varchar(255) not null,
    nickname    varchar(100) not null
        constraint user_un
            unique,
    avatar_path varchar(255),
	gamewins	integer,
	gameloses	integer,
	gameplayed	integer,
    u2f_hash    varchar(255),
    otp_hash    varchar(255),
    online      boolean      not null,
    readytoplay integer,
    level       integer
);

alter sequence users_id_seq owned by users.id;

create table room
(
    id       serial
        primary key,
    title    varchar(255) not null,
    private  boolean      not null,
    password varchar(100),
    owner_id integer      not null
        constraint room_user_id_fk
            references users
);

alter sequence room_id_seq owned by room.id;

create table custom
(
    id integer not null
        constraint custom_user_id_fk
            references users,
    ball    integer,
    puck    integer
);

create table game
(
    id        serial
        primary key,
    status     boolean  not null,
    start_date date     not null,
    end_date   date,
	loser_id	integer,
		constraint game_user_id_fk
            references users,
    winner_id  integer
        constraint game_user_id_fk
            references users,
    score      varchar
);

alter sequence game_id_seq owned by game.id;

create table message
(
    id        serial
        primary key,
    room_id   integer not null
        constraint message_room_room_id_fk
            references room,
    id   integer not null
        constraint message_user_id_fk
            references users,
    message   text    not null,
    send_date date    not null
);

alter sequence message_id_seq owned by message.id;

create table game_user_link
(
    game_id integer not null
        constraint gameuser_game_id_fkey
        	references game,
    id integer not null
        constraint gameuser_id_fkey
        	references users,
	status	boolean not null,
    constraint gameuser_pkey
	    primary key (game_id, id)
);


create table room_user_link
(
    room_id      integer not null
        constraint roomuser_room_id_fkey
        	references room,
    id      integer not null
        constraint roomuser_id_fkey
        	references users,
    owner_status boolean not null,
    admin_status boolean not null,
    ban_status   boolean not null,
    mute_status  boolean not null,
    constraint roomuser_pkey
    	primary key (room_id, id)
);

create table user_friendship_link
(
    id        integer               not null
        constraint userfriendship_id_fkey
       		references users,
    friend_id      integer               not null
        constraint userfriendship_friend_id_fkey
        	references users,
    friend_status  boolean default false not null,
    blocked_status boolean default false not null,
    constraint userfriendship_pkey
    	primary key (id, friend_id)
);
