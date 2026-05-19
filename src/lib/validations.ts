import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const optionalUuid = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z.string().uuid().nullable().optional()
);

const optionalText = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : v),
  z.string().optional()
);

export const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: optionalText,
  isbn: optionalText,
  description: optionalText,
  author_id: optionalUuid,
  publisher_id: optionalUuid,
  category_id: optionalUuid,
  published_year: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().int().min(1000).max(2100).nullable().optional()
  ),
  edition: optionalText,
  language: z.string().min(1),
  total_copies: z.coerce.number().int().min(1),
  shelf_number: optionalText,
  rack_number: optionalText,
  status: z.enum(["available", "unavailable"]),
});

export const issueSchema = z.object({
  book_id: z.string().uuid(),
  member_id: z.string().uuid(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export const returnSchema = z.object({
  issued_book_id: z.string().uuid(),
});

export const finePaySchema = z.object({
  action: z.enum(["pay", "waive"]),
  notes: z.string().optional(),
});

export const settingsSchema = z.object({
  library_name: z.string().min(1),
  max_borrow_days: z.number().int().min(1).max(90),
  fine_per_day: z.number().min(0),
  max_borrow_tokens: z.number().int().min(1).max(20),
  reservation_expiry_days: z.number().int().min(1).max(30),
});

export const profileSelfUpdateSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.string().nullable().optional()
  ),
  address: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.string().nullable().optional()
  ),
});

export const memberCreateSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.string().nullable().optional()
  ),
  address: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.string().nullable().optional()
  ),
  borrow_token_limit: z.coerce.number().int().min(1).max(20),
  is_active: z.boolean(),
});

export const memberUpdateSchema = z.object({
  is_active: z.boolean().optional(),
  borrow_token_limit: z.coerce.number().int().min(1).max(20).optional(),
  full_name: z.string().min(2).optional(),
  phone: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.string().nullable().optional()
  ),
  address: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.string().nullable().optional()
  ),
});

export const reservationSchema = z.object({
  book_id: z.string().uuid(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookInput = z.infer<typeof bookSchema>;
export type IssueInput = z.infer<typeof issueSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type MemberCreateInput = z.infer<typeof memberCreateSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
export type ProfileSelfUpdateInput = z.infer<typeof profileSelfUpdateSchema>;
