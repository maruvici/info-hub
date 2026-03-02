import { db } from "./index";
import { users, posts, comments } from "./schema";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function seed() {
  console.log("🌱 Starting Seeding...");

  // 1. Create Users
  const insertedUsers = await db.insert(users).values(
  Array.from({ length: 30 }).map(() => ({
    email: faker.internet.email({ provider: "ssiph.com" }),
    password: "hashed_password_here", 
    fullName: faker.person.fullName(),
    // Use "as const" here to tell TS these are the specific enum values
    team: faker.helpers.arrayElement([
      "Digital Transformation", "Service Delivery", "Project Management", 
      "Infrastructure", "Security", "Product"
    ] as const), 
    role: "User" as const, // <--- Add "as const" here
    isActive: true,
  }))
).returning();

  console.log(`✅ Created ${insertedUsers.length} users`);

  // 2. Create Posts
  const insertedPosts = await db.insert(posts).values(
    Array.from({ length: 1000 }).map(() => ({
      authorId: faker.helpers.arrayElement(insertedUsers).id,
      title: faker.lorem.sentence(),
      content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: faker.lorem.paragraphs(2) }] }] }),
      type: faker.helpers.arrayElement(["Article", "Discussion", "Inquiry"]),
      tags: faker.helpers.arrayElements(["Digital Transformation", "Service Delivery", "Project Management", "Infrastructure", "Security", "Product"], { min: 1, max: 6 }),
      views: faker.number.int({ min: 0, max: 1000 }),
    }))
  ).returning();

  console.log(`✅ Created ${insertedPosts.length} posts`);

  // 3. Create Comments (some as replies)
  for (const post of insertedPosts) {
    const rootComments = await db.insert(comments).values(
      Array.from({ length: 5 }).map(() => ({
        authorId: faker.helpers.arrayElement(insertedUsers).id,
        postId: post.id,
        content: faker.lorem.sentence(),
      }))
    ).returning();

    // Create replies to root comments
    for (const parent of rootComments) {
      await db.insert(comments).values({
        authorId: faker.helpers.arrayElement(insertedUsers).id,
        postId: post.id,
        parentId: parent.id,
        content: "This is a synthetic reply for testing nested trees.",
      });
    }
  }

  console.log("🚀 Seeding Complete!");
}

seed().catch(console.error);