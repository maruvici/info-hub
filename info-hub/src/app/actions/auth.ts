"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hash } from "bcrypt";
import { redirect } from "next/navigation";
import { ActionState } from "@/types/types";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function signUpUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // 1. Extract values
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const team = formData.get("team") as any;
  const microsoftId = formData.get("microsoftId") as string;

  // 2. Define the schema inside the function for direct file access
  const SignUpSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    team: z.enum([
      "Digital Transformation", 
      "Infrastructure", 
      "Product", 
      "Project Management", 
      "Security", 
      "Service Delivery"
    ]),
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

  // 5. Strict Domain Validation
  if (!email.toLowerCase().endsWith("@ssiph.com")) {
    return {
      error: { message: "Access restricted. You must use an @ssiph.com email address." }
    };
  }

  try {
    const hashedPassword = await hash(password, 10);

    // 6. Insert into DB (including the microsoftId)
    await db.insert(users).values({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      team,
      microsoftId: microsoftId || null, // Link the MS account if it exists
      role: "User",
    });
  } catch (error: any) {
    if (error.code === '23505') return { error: { email: ["Email already exists"] } };
    return { error: { message: "Database error." } };
  }

  redirect("/login?signup=success");
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
    // Re-throw the error so Next.js can handle the redirect internally
    throw error;
  }
}

export async function loginWithMicrosoft() {
  await signIn("microsoft-entra-id", { redirectTo: "/dashboard" });
}

export async function handleLogout() {
  await signOut({ redirectTo: "/" });
}