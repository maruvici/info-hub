"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hash } from "bcrypt";
import { redirect } from "next/navigation";
import { ActionState } from "@/types/types";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export async function signUpUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // 1. Manually extract values for cleaner validation
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const team = formData.get("team") as any;
  const photoIdFile = formData.get("photoId") as File | null;

  // 2. Define the schema inside the function for direct file access
  const SignUpSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    team: z.enum(["Digital Transformation", "Service Delivery", "Project Management", "Infrastructure", "Security", "Product"]),
  });

  // 3. Run primary validation
  const validatedFields = SignUpSchema.safeParse({ fullName, email, password, team });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  // 4. Manual Password Match Check
  if (password !== confirmPassword) {
    return { error: { confirmPassword: ["Passwords do not match"] } };
  }

  // 5. Explicit File Validation 
  if (photoIdFile && photoIdFile.size > 0) {
    if (!ACCEPTED_IMAGE_TYPES.includes(photoIdFile.type)) {
      return { 
        error: { 
          photoId: ["Unsupported file type. Please upload a JPG, PNG, GIF, or WEBP."] 
        } 
      };
    }
    // Limit size to 20MB for safety
    if (photoIdFile.size > 20 * 1024 * 1024) {
      return { error: { photoId: ["File is too large (Max 20MB)"] } };
    }
  }

  try {
    const hashedPassword = await hash(password, 10);
    const photoIdUrl = photoIdFile && photoIdFile.size > 0 ? `uploads/${photoIdFile.name}` : null;

    await db.insert(users).values({
      fullName,
      email,
      password: hashedPassword,
      team,
      photoIdUrl,
      role: "User",
    });
  } catch (error: any) {
    if (error.code === '23505') return { error: { email: ["Email already exists"] } };
    return { error: { message: "Database connection failed." } };
  }

  redirect("/login");
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: { message: "Invalid email or password." } };
        default:
          return { error: { message: "Something went wrong. Please try again." } };
      }
    }
    // You MUST re-throw the error so Next.js can handle the redirect internally
    throw error;
  }
}

export async function handleLogout() {
  await signOut({ redirectTo: "/login" });
}