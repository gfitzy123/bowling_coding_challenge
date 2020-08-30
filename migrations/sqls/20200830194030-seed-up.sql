CREATE SEQUENCE IF NOT EXISTS users_id_seq;

CREATE TABLE "users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "name" varchar,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS games_id_seq;

CREATE TABLE "games" (
    "id" int4 NOT NULL DEFAULT nextval('games_id_seq'::regclass),
    "userId" int4,
    "runningScore" int4,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    "completed" bool NOT NULL DEFAULT false,
    CONSTRAINT "games_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS frames_id_seq;

CREATE TABLE "frames" (
    "id" int4 NOT NULL DEFAULT nextval('frames_id_seq'::regclass),
    "userId" int4 NOT NULL,
    "gameId" int4 NOT NULL,
    "attempts" int4 DEFAULT 0,
    "score" int4 DEFAULT 0,
    "frameNumber" int4 NOT NULL,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    "allowedAttempts" int4 DEFAULT 2,
    CONSTRAINT "frames_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id"),
    CONSTRAINT "frames_game_id_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id"),
    PRIMARY KEY ("id")
);
