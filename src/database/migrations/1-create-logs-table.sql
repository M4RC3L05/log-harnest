create table "main"."logs" (
  "name" text not null,
  "level" text not null,
  "message" text not null default '',
  "timestamp" text not null,
  "data" text not null
) strict;
