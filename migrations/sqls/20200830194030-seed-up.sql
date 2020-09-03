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
    "createdAt" timestamp,
    "updatedAt" timestamp,
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS frames_id_seq;

CREATE TABLE "frames" (
    "id" int4 NOT NULL DEFAULT nextval('frames_id_seq'::regclass),
    "game_id" int4 NOT NULL,
    "frame_number" int4 NOT NULL,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    CONSTRAINT "frames_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS scores_id_seq;

CREATE TABLE "scores" (
    "id" int4 NOT NULL DEFAULT nextval('scores_id_seq'::regclass),
    "frame_id" int4 NOT NULL,
    "score" int4,
    "user_id" int4 NOT NULL,
    "game_id" int4 NOT NULL,
    "attempt" int4,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    CONSTRAINT "scores_frame_id_fkey" FOREIGN KEY ("frame_id") REFERENCES "frames"("id"),
    CONSTRAINT "scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id"),
    CONSTRAINT "scores_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id"),
    PRIMARY KEY ("id")
);
