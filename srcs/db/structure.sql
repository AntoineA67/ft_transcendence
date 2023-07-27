create database if not exists db;
create table if not exists "user"
(
    user_id     serial
        primary key,
    email       varchar(255) not null unique,
    password    varchar(255) not null,
    nickname    varchar(100),
    avatarpath  varchar(255),
    u2fhash     varchar(255),
    otphash     varchar(255),
    online      boolean      not null,
    readytoplay integer,
    level       integer
);

alter table "user"
    owner to postgres;

create table if not exists room
(
    room_id  serial
        primary key,
    title    varchar(255) not null,
    private  boolean      not null,
    password varchar(100),
    owner_id integer      not null
        constraint room_user_user_id_fk
            references "user"
);

alter table room
    owner to postgres;

create table if not exists custom
(
    custom_id serial
        primary key,
    user_id   integer not null
        constraint custom_user_user_id_fk
            references "user",
    ball_id   integer,
    puck_id   integer
);

alter table custom
    owner to postgres;

create table if not exists game
(
    game_id        serial
        primary key,
    status         boolean   not null,
    startdate      timestamp not null,
    enddate        timestamp,
    winner_user_id integer
        constraint game_user_user_id_fk
            references "user"
);

alter table game
    owner to postgres;

create table if not exists message
(
    message_id  serial
        primary key,
    room_id     integer   not null
        constraint message_room_room_id_fk
            references room,
    user_id     integer   not null
        constraint message_user_user_id_fk
            references "user",
    message_txt text      not null,
    date        timestamp not null
);

alter table message
    owner to postgres;

create table if not exists gameuser
(
    game_id integer not null
        references game,
    user_id integer not null
        references "user",
    primary key (game_id, user_id)
);

alter table gameuser
    owner to postgres;

create table if not exists roomuser
(
    room_id      integer not null
        references room,
    user_id      integer not null
        references "user",
    owner_status boolean not null,
    admin_status boolean not null,
    ban_status   boolean not null,
    mute_status  boolean not null,
    primary key (room_id, user_id)
);

alter table roomuser
    owner to postgres;

create table if not exists userfriendship
(
    user_id       integer               not null
        references "user",
    friend_id     integer               not null
        references "user",
    is_banned     boolean default false not null,
    user_banned   boolean default false not null,
    friend_banned boolean default false not null,
    primary key (user_id, friend_id)
);

alter table userfriendship
    owner to postgres;

