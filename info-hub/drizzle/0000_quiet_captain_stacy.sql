CREATE TYPE "public"."post_type" AS ENUM('Article', 'Discussion', 'Inquiry');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('User', 'Admin');--> statement-breakpoint
CREATE TYPE "public"."team" AS ENUM('Digital Transformation', 'Service Delivery', 'Project Management', 'Infrastructure', 'Security', 'Product');--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" uuid,
	"comment_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" "post_type" DEFAULT 'Article' NOT NULL,
	"tags" text[],
	"views" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "role" DEFAULT 'User' NOT NULL,
	"team" "team" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"microsoft_id" text,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_microsoft_id_unique" UNIQUE("microsoft_id")
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_post_id_idx" ON "attachments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "comments_post_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "comments_parent_idx" ON "comments" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_post_like" ON "likes" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_comment_like" ON "likes" USING btree ("user_id","comment_id");--> statement-breakpoint
CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "posts_tags_idx" ON "posts" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "users_team_idx" ON "users" USING btree ("team");