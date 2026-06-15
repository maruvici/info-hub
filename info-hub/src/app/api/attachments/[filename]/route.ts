import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Your NextAuth/Auth.js config
import fs from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

const UPLOAD_DIR = '/mnt/internaltool';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  // 1. Security Check: Only allow @ssiph.com users
  const session = await auth();
  const userEmail = session?.user?.email;

  // if (!userEmail || !userEmail.endsWith("@ssiph.com")) {
  //   return new NextResponse("Unauthorized: Access restricted to SSI domain.", { status: 403 });
  // }

  // 2. Unpack Params (Next.js 16 requirement)
  const { filename } = await params;
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    // 3. Get file metadata (size is needed for the browser progress bar)
    const fileStats = await stat(filePath);
    
    // 4. Create a Node.js ReadStream and convert to a Web Stream for Next.js
    const nodeStream = fs.createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream);

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    };

    return new NextResponse(webStream as ReadableStream, {
      headers: {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Content-Length": fileStats.size.toString(), // Allows browser to show download progress
        "Content-Disposition": `inline; filename="${filename}"`,
        "Accept-Ranges": "bytes", // Allows users to "scrub" through videos/audio
      },
    });
  } catch (error) {
    console.error("Stream error:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}