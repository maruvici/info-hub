import { pgTable, text, timestamp, uuid, pgEnum, integer, varchar, uniqueIndex } from "drizzle-orm/pg-core";

// --- Enums ---
export const roleEnum = pgEnum("role", ["User", "Admin"]);

export const teamEnum = pgEnum("team", [
  "Digital Transformation",
  "Service Delivery",
  "Project Management",
  "Infrastructure",
  "Security",
  "Product"
]);

export const postTypeEnum = pgEnum("post_type", ["Article", "Discussion", "Inquiry"]);

// --- Tables ---

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(), // Hashed
  fullName: text("full_name").notNull(),
  photoIdUrl: text("photo_id_url"), // Nullable
  role: roleEnum("role").default("User").notNull(),
  team: teamEnum("team").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: postTypeEnum("type").default("Article").notNull(),
  tags: text("tags").array(), // string_array
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  parentId: uuid("parent_id"), // Self-referencing FK is handled in application logic or separate alter statement if strict needed
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// To strictly enforce Referential Integrity for Likes, we use nullable FKs.
export const likes = pgTable("likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: 'cascade' }),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Prevents duplicate likes on the same post by the same user
  uniquePostLike: uniqueIndex("unique_post_like").on(table.userId, table.postId),
  // Prevents duplicate likes on the same comment
  uniqueCommentLike: uniqueIndex("unique_comment_like").on(table.userId, table.commentId),
}));

export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});