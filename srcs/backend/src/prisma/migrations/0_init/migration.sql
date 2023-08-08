-- CreateTable
CREATE TABLE "game" (
    "id" SERIAL NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6),
    "score" VARCHAR,
    "winnerId" BIGINT,

    CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "message" VARCHAR NOT NULL,
    "send_date" TIMESTAMP(6) NOT NULL,
    "roomId" INTEGER,
    "userId" BIGINT,

    CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" BIGSERIAL NOT NULL,
    "username" VARCHAR NOT NULL DEFAULT '',
    "email_address" VARCHAR NOT NULL DEFAULT '',
    "password" VARCHAR NOT NULL DEFAULT '',

    CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "custom" (
    "id" SERIAL NOT NULL,
    "ball" INTEGER,
    "puck" INTEGER,
    "userId" BIGINT,

    CONSTRAINT "PK_7913689ead642c66760cf2bf2b9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_user_link" (
    "id" SERIAL NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "gameId" INTEGER,
    "userId" BIGINT,

    CONSTRAINT "PK_b5c4d0f9ae826735c474b188ef5" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "private" BOOLEAN NOT NULL,
    "password" VARCHAR(100),
    "ownerId" BIGINT,

    CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_user_link" (
    "id" SERIAL NOT NULL,
    "ownerStatus" BOOLEAN NOT NULL DEFAULT false,
    "adminStatus" BOOLEAN NOT NULL DEFAULT false,
    "banStatus" BOOLEAN NOT NULL DEFAULT false,
    "muteStatus" BOOLEAN NOT NULL DEFAULT false,
    "roomId" INTEGER,
    "userId" BIGINT,

    CONSTRAINT "PK_42347ce202629a5cda29ce741e5" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_friendship_link" (
    "id" SERIAL NOT NULL,
    "friendStatus" BOOLEAN NOT NULL DEFAULT false,
    "blockedStatus" BOOLEAN NOT NULL DEFAULT false,
    "user_id" BIGINT,
    "friend_id" BIGINT,

    CONSTRAINT "PK_a331d7dca75fc3d7fc1ced56c8d" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "FK_cd57acb58d1147c23da5cd09cae" FOREIGN KEY ("winnerId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "FK_446251f8ceb2132af01b68eb593" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "FK_fdfe54a21d1542c564384b74d5c" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "custom" ADD CONSTRAINT "FK_1371e64d4796f781184c3e79124" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_user_link" ADD CONSTRAINT "FK_4097abc6b24629e7c497802e50b" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_user_link" ADD CONSTRAINT "FK_7e5bcb1cfcc8a1ab3aa757c5fff" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "FK_65283be59094a73fed31ffeee4e" FOREIGN KEY ("ownerId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_user_link" ADD CONSTRAINT "FK_88f8befdb79fd0d39d17f6354a6" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_user_link" ADD CONSTRAINT "FK_b86b11d1abcbbb56a5d6a8ad99e" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_friendship_link" ADD CONSTRAINT "FK_7af4fef2416f97e3984d8cefd59" FOREIGN KEY ("friend_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_friendship_link" ADD CONSTRAINT "FK_9897101c71227987bc6b68aa32d" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

