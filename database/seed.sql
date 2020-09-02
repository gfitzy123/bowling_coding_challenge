CREATE TABLE "bowling-test"."public"."users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "name" varchar,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    PRIMARY KEY ("id")
);

CREATE TABLE "bowling-test"."public"."frames" (
    "id" int4 NOT NULL DEFAULT nextval('frames_id_seq'::regclass),
    "userId" int4 NOT NULL,
    "gameId" int4 NOT NULL,
    "attempts" int4 DEFAULT 0,
    "score" int4 DEFAULT 0,
    "frameNumber" int4 NOT NULL,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    "allowedAttempts" int4 DEFAULT 2,
    CONSTRAINT "frames_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id"),
    CONSTRAINT "frames_game_id_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id"),
    PRIMARY KEY ("id")
);

CREATE TABLE "bowling-test"."public"."games" (
    "id" int4 NOT NULL DEFAULT nextval('games_id_seq'::regclass),
    "userId" int4,
    "runningScore" int4,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    "completed" bool NOT NULL DEFAULT false,
    CONSTRAINT "games_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);

CREATE TABLE "bowling"."public"."users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "name" varchar,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    PRIMARY KEY ("id")
);

CREATE TABLE "bowling"."public"."frames" (
    "id" int4 NOT NULL DEFAULT nextval('frames_id_seq'::regclass),
    "userId" int4 NOT NULL,
    "gameId" int4 NOT NULL,
    "attempts" int4 DEFAULT 0,
    "score" int4 DEFAULT 0,
    "frameNumber" int4 NOT NULL,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    "allowedAttempts" int4 DEFAULT 2,
    CONSTRAINT "frames_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id"),
    CONSTRAINT "frames_game_id_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id"),
    PRIMARY KEY ("id")
);


CREATE TABLE "bowling"."public"."games" (
    "id" int4 NOT NULL DEFAULT nextval('games_id_seq'::regclass),
    "userId" int4,
    "runningScore" int4,
    "createdAt" timestamp,
    "updatedAt" timestamp,
    "completed" bool NOT NULL DEFAULT false,
    CONSTRAINT "games_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);
