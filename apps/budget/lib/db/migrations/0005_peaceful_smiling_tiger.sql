ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Chat" ALTER COLUMN "userId" SET DATA TYPE text;