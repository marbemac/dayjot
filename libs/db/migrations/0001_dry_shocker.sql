CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" bigint NOT NULL,
	"purpose" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_tokens_user_id_idx" ON "verification_tokens" ("user_id");