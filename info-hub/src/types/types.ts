export type ActionState = {
  error?: {
    fullName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    team?: string[];
    message?: string;    // For general database errors
  };
  success?: boolean;
} | null;