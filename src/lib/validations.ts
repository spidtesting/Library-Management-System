import { z } from "zod";
import { isValidCoverDataUrl } from "@/lib/cover-image";

const staffRoleSchema = z.enum(["member", "librarian", "admin"]);

export const nicNumberSchema = z
  .string()
  .min(9, "NIC must be at least 9 characters")
  .max(12, "NIC must be at most 12 characters")
  .regex(/^[A-Za-z0-9]+$/, "NIC must contain only letters and numbers");

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or NIC is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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
  author_name: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(1, "Author is required")
  ),
  author_id: optionalUuid,
  publisher_id: optionalUuid,
  category_id: z.preprocess(
    (v) => (v === "" || v === undefined || v === "none" ? null : v),
    z.string().uuid("Select a valid category").nullable().optional()
  ),
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
  cover_base64: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .union([
        z.null(),
        z.string().refine(
          (val) => isValidCoverDataUrl(val),
          "Cover must be a JPEG/PNG/WebP image up to 2MB"
        ),
      ])
      .optional()
  ),
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
  nic_number: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    nicNumberSchema.nullable().optional()
  ),
  phone: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.string().nullable().optional()
  ),
  address: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.string().nullable().optional()
  ),
});

const optionalNic = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : v),
  nicNumberSchema.optional()
);

export const memberCreateSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    nic_number: optionalNic,
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
    role: staffRoleSchema.default("member"),
    borrow_token_limit: z.coerce.number().int().min(0).max(20).default(3),
    is_active: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.role === "member" && !data.nic_number) {
      ctx.addIssue({
        code: "custom",
        message: "NIC number is required for library members",
        path: ["nic_number"],
      });
    }
    if (data.role === "member" && data.borrow_token_limit < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Members need at least 1 borrow token",
        path: ["borrow_token_limit"],
      });
    }
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
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
