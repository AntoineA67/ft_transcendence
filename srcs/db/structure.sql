-- database
create database transcendence;

-- tables
create table "user"
(
    user_id     serial
        primary key,
    email       varchar(255) not null
        unique,
    password    varchar(255) not null,
    nickname    varchar(100) not null
        constraint user_un
            unique,
    avatar_path varchar(255),
    u2f_hash    varchar(255),
    otp_hash    varchar(255),
    online      boolean      not null,
    readytoplay integer,
    level       integer
);


alter sequence user_user_id_seq owned by "user".id;

create table room
(
    id       serial
        primary key,
    title    varchar(255) not null,
    private  boolean      not null,
    password varchar(100),
    owner_id integer      not null
        constraint room_user_user_id_fk
            references "user"
);


alter sequence room_room_id_seq owned by room.id;

create table custom
(
    user_id integer not null
        constraint custom_user_user_id_fk
            references "user",
    ball    integer,
    puck    integer
);


create table game
(
    game_id        serial
        primary key,
    status     boolean                                               not null,
    start_date date                                                  not null,
    end_date   date,
    winner_id  integer
        constraint game_user_user_id_fk
            references "user",
    score      varchar
);


alter sequence game_game_id_seq owned by game.id;

create table message
(
    id        serial
        primary key,
    room_id   integer not null
        constraint message_room_room_id_fk
            references room,
    user_id   integer not null
        constraint message_user_user_id_fk
            references "user",
    message   text    not null,
    send_date date    not null
);


alter sequence message_message_id_seq owned by message.id;

create table game_user_link
(
    game_id integer not null
        constraint gameuser_game_id_fkey
        	references game,
    user_id integer not null
        constraint gameuser_user_id_fkey
        	references "user",
	status	boolean not null,
    constraint gameuser_pkey
	    primary key (game_id, user_id)
);


create table room_user_link
(
    room_id      integer not null
        constraint roomuser_room_id_fkey
        	references room,
    user_id      integer not null
        constraint roomuser_user_id_fkey
        	references "user",
    owner_status boolean not null,
    admin_status boolean not null,
    ban_status   boolean not null,
    mute_status  boolean not null,
    constraint roomuser_pkey
    	primary key (room_id, user_id)
);


create table user_friendship_link
(
    user_id        integer               not null
        constraint userfriendship_user_id_fkey
       		references "user",
    friend_id      integer               not null
        constraint userfriendship_friend_id_fkey
        	references "user",
    friend_status  boolean default false not null,
    blocked_status boolean default false not null,
    constraint userfriendship_pkey
    	primary key (user_id, friend_id)
);

-- sequences
create sequence user_user_id_seq
    as integer;

alter sequence user_user_id_seq owner to postgres;

create sequence room_room_id_seq
    as integer;

alter sequence room_room_id_seq owner to postgres;

create sequence game_game_id_seq
    as integer;

alter sequence game_game_id_seq owner to postgres;

create sequence message_message_id_seq
    as integer;

