"use server";

import { db } from "@/db";
import { attachments, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Change this to Synology path later
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES_PER_POST = 3;
// Basic extension check for server-side safety (MIME types can be spoofed, but this is a good first layer)
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
  '.mp4', '.avi', '.mov', '.webm',
  '.mp3', '.wav', '.ogg',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'
];

export async function uploadAttachment(postId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  // 1. Validate Size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File is too large. Limit is 25MB.`);
  }

  // 2. Validate Type (Extension-based)
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error("Invalid file type.");
  }

  // 3. Validate Count (DB Query)
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(attachments)
    .where(eq(attachments.postId, postId));

  if (Number(result.count) >= MAX_FILES_PER_POST) {
    throw new Error("Maximum attachment limit reached for this post.");
  }

  // 4. Prepare file details
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = path.extname(file.name);
  const uniqueFileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFileName);

  try {
    // 5. Ensure directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // 6. Save file to disk (Local or Synology Mount)
    await fs.writeFile(filePath, buffer);

    // 7. Record in Database
    const fileUrl = `/uploads/${uniqueFileName}`; // Local path for now
    
    await db.insert(attachments).values({
      ownerId: session.user.id,
      postId: postId,
      fileUrl: fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Upload Error:", error);
    throw new Error("Failed to save attachment");
  }
}

export async function deleteAttachment(attachmentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Fetch attachment and verify existence
  const [attachment] = await db
    .select()
    .from(attachments)
    .where(eq(attachments.id, attachmentId));

  if (!attachment) throw new Error("Attachment not found");

  // 2. Permission Check (Admin or Author of the attachment/post)
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  const isAuthorized = currentUser.role === "Admin" || attachment.ownerId === session.user.id;
  if (!isAuthorized) throw new Error("You do not have permission to delete this file.");

  try {
    // 3. Remove physical file from /public/uploads
    // We extract the filename from the saved URL (/uploads/filename.ext)
    const fileName = path.basename(attachment.fileUrl);
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    
    await fs.unlink(filePath).catch((err) => {
      console.warn("File already missing from disk, proceeding with DB deletion:", err.message);
    });

    // 4. Delete DB record
    await db.delete(attachments).where(eq(attachments.id, attachmentId));

    revalidatePath(`/post/${attachment.postId}`);
    return { success: true };
  } catch (error) {
    console.error("Deletion Error:", error);
    throw new Error("Failed to delete attachment");
  }
}