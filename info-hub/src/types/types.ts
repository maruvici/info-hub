export type ActionState = {
  error?: {
    fullName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    team?: string[];
    photoId?: string[]; // Adding this for the photo upload validation
    message?: string;    // For general database errors
  };
  success?: boolean;
} | null;