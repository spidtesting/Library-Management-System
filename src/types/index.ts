export type UserRole = "admin" | "librarian" | "member";

export type BookStatus = "available" | "unavailable" | "deleted";
export type IssueStatus = "issued" | "returned" | "overdue";
export type FineStatus = "pending" | "paid" | "waived";
export type NotificationType =
  | "due_reminder"
  | "overdue_alert"
  | "book_returned"
  | "book_issued"
  | "reservation_ready"
  | "general";
export type ReservationStatus =
  | "pending"
  | "ready"
  | "collected"
  | "cancelled"
  | "expired";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  nic_number: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  borrow_token_limit: number;
  borrow_tokens_used: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  isbn: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  author_id: string | null;
  publisher_id: string | null;
  category_id: string | null;
  published_year: number | null;
  edition: string | null;
  language: string;
  total_copies: number;
  available_copies: number;
  cover_url: string | null;
  pdf_url: string | null;
  shelf_number: string | null;
  rack_number: string | null;
  status: BookStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  author?: { name: string } | null;
  category?: { name: string } | null;
  publisher?: { name: string } | null;
}

export interface IssuedBook {
  id: string;
  book_id: string;
  member_id: string;
  issued_by: string;
  issue_date: string;
  due_date: string;
  returned_date: string | null;
  status: IssueStatus;
  created_at: string;
  updated_at: string;
  book?: Pick<Book, "id" | "title" | "cover_url" | "shelf_number" | "rack_number">;
  member?: Pick<Profile, "id" | "full_name" | "email" | "phone">;
}

export interface BorrowHistoryRow {
  id: string;
  issue_date: string;
  due_date: string;
  returned_date: string | null;
  status: IssueStatus;
  book_title: string;
  member_name: string;
  member_email: string;
}

export interface ActiveBorrow {
  id: string;
  issue_date: string;
  due_date: string;
  status: IssueStatus;
  overdue_days: number;
  book_id: string;
  book_title: string;
  cover_url: string | null;
  shelf_number: string | null;
  rack_number: string | null;
  member_id: string;
  member_name: string;
  member_email: string;
  member_phone: string | null;
}

export interface Fine {
  id: string;
  issued_book_id: string;
  member_id: string;
  overdue_days: number;
  rate_per_day: number;
  total_amount: number;
  status: FineStatus;
  paid_at: string | null;
  waived_at: string | null;
  waived_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  member?: Pick<Profile, "full_name" | "email">;
  issued_book?: {
    book?: Pick<Book, "title">;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Reservation {
  id: string;
  book_id: string;
  member_id: string;
  status: ReservationStatus;
  reserved_at: string;
  expires_at: string;
  collected_at: string | null;
  book?: Pick<Book, "title" | "cover_url">;
}

export interface LibrarySettings {
  id: number;
  library_name: string;
  max_borrow_days: number;
  fine_per_day: number;
  max_borrow_tokens: number;
  reservation_expiry_days: number;
  updated_by: string | null;
  updated_at: string;
}

export interface AdminStats {
  total_books: number;
  available_books: number;
  total_members: number;
  total_librarians: number;
  currently_issued: number;
  overdue_count: number;
  returned_today: number;
  issued_today: number;
  pending_fines: number;
  collected_fines: number;
  out_of_stock_books: number;
}

export interface MonthlyBorrowTrend {
  month: string;
  total_issued: number;
  total_returned: number;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: Pick<Profile, "full_name"> | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReturnBookResult {
  success: boolean;
  overdue_days: number;
  fine_amount: number;
  fine_id: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Author {
  id: string;
  name: string;
  bio: string | null;
}

export interface Publisher {
  id: string;
  name: string;
}
