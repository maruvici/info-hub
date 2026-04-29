import { pgTable, text, timestamp, uuid, pgEnum, integer, varchar, uniqueIndex, index, boolean } from "drizzle-orm/pg-core";

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
  microsoftId: text("microsoft_id").unique(),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
  teamIdx: index("users_team_idx").on(table.team),
}));

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
}, (table) => ({
  authorIdx: index("posts_author_idx").on(table.authorId),
  createdIdx: index("posts_created_at_idx").on(table.createdAt),
  tagsIdx: index("posts_tags_idx").using("gin", table.tags),
}));

// --- 3. COMMENTS ---
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  parentId: uuid("parent_id"), 
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("comments_post_idx").on(table.postId),
  parentIdx: index("comments_parent_idx").on(table.parentId),
}));

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
}, (table) => ({
  postAttachmentsIdx: index("attachments_post_id_idx").on(table.postId),
}));

// --- 6. ROOMS ---
export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(), 
  capacity: integer("capacity"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- 7. RESERVATIONS ---
export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id").references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  creatorId: uuid("creator_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  msEventId: text("ms_event_id"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  roomIdx: index("reservations_room_idx").on(table.roomId),
  creatorIdx: index("reservations_creator_idx").on(table.creatorId),
  overlapIdx: index("reservations_overlap_idx").on(table.roomId, table.startTime, table.endTime),
}));

// --- 8. RESERVATION ATTENDEES ---
export const reservationAttendees = pgTable("reservation_attendees", {
  id: uuid("id").defaultRandom().primaryKey(),
  reservationId: uuid("reservation_id").references(() => reservations.id, { onDelete: 'cascade' }).notNull(),
  email: varchar("email", { length: 255 }).notNull(), 
}, (table) => ({
  reservationIdx: index("attendees_reservation_idx").on(table.reservationId),
  emailIdx: index("attendees_email_idx").on(table.email), 
}));

// --- 9. NOTIFICATIONS ---
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  initiatorId: uuid("initiator_id").references(() => users.id, { onDelete: 'set null' }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userUnreadIdx: index("notifications_user_unread_idx").on(table.userId, table.isRead),
}));