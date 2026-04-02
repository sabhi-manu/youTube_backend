import { z } from "zod";

export const registerUserSchema = z.object({
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20)
    .trim()
    .toLowerCase(),

  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase(),

  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .trim(),

  password: z
    .string()
    .min(2, "Password must be at least 6 characters"),
});