"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import bcrypt from "bcrypt"; // Or whatever hashing library you are using
import { revalidatePath } from "next/cache";

type ValidTeam = "Digital Transformation" | "Service Delivery" | "Project Management" | "Infrastructure" | "Security" | "Product";
type ValidRole = "User" | "Admin";

export async function changeTeam(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const newTeam = formData.get("team") as ValidTeam; 

  if (!newTeam) throw new Error("Team name is required");

  try {
    // Simply update the team for the currently authenticated user
    await db.update(users)
      .set({ team: newTeam })
      .where(eq(users.id, session.user.id));

    revalidatePath("/user"); // Refresh the user page to show the new team
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update team.");
  }
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All fields are required.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords do not match.");
  }

  // 1. Fetch the current user from the database to get their hashed password
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser) throw new Error("User not found.");

  // 2. Verify the current password
  const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
  if (!isPasswordValid) {
    throw new Error("Incorrect current password.");
  }

  // 3. Hash the new password and update
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  try {
    await db.update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, session.user.id));

    return { success: true };
  } catch (error) {
    throw new Error("Failed to update password.");
  }
}

export async function changeUserRole(targetUserId: string, newRole: ValidRole) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Verify the current user is an Admin
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (currentUser?.role !== "Admin") {
    throw new Error("Forbidden: You do not have permission to change roles.");
  }

  // 2. Update the target user's role
  try {
    await db.update(users)
      .set({ role: newRole })
      .where(eq(users.id, targetUserId));

    revalidatePath("/user"); // Refresh the page to reflect changes
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update user role.");
  }
}