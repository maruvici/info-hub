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

// --- 1. USERS ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(), 
  fullName: text("full_name").notNull(),
  role: roleEnum("role").default("User").notNull(),
  team: teamEnum("team").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // THIS REPLACES THE ACCOUNTS TABLE
  microsoftId: text("microsoft_id").unique(), 
});

// --- 2. POSTS ---
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: postTypeEnum("type").default("Article").notNull(),
  tags: text("tags").array(), 
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- 3. COMMENTS ---
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  parentId: uuid("parent_id"), 
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- 4. LIKES ---
export const likes = pgTable("likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: 'cascade' }),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniquePostLike: uniqueIndex("unique_post_like").on(table.userId, table.postId),
  uniqueCommentLike: uniqueIndex("unique_comment_like").on(table.userId, table.commentId),
}));

// --- 5. ATTACHMENTS ---
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