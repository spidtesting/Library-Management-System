-- ============================================================
-- PUBLIC LIBRARY MVP — SUPABASE DATABASE SCHEMA
-- ============================================================
-- Run this entire file in Supabase SQL Editor (in order).
-- Tables → Enums → Indexes → Functions → Triggers → RLS
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- enables fast LIKE/ILIKE search


-- ============================================================
-- 1. ENUMS
-- ============================================================

CREATE TYPE user_role      AS ENUM ('admin', 'librarian', 'member');
CREATE TYPE book_status    AS ENUM ('available', 'unavailable', 'deleted');
CREATE TYPE issue_status   AS ENUM ('issued', 'returned', 'overdue');
CREATE TYPE fine_status    AS ENUM ('pending', 'paid', 'waived');
CREATE TYPE notif_type     AS ENUM (
  'due_reminder',
  'overdue_alert',
  'book_returned',
  'book_issued',
  'reservation_ready',
  'general'
);
CREATE TYPE reservation_status AS ENUM ('pending', 'ready', 'collected', 'cancelled', 'expired');


-- ============================================================
-- 2. CORE TABLES
-- ============================================================


-- ------------------------------------------------------------
-- 2.1  PROFILES  (extends Supabase auth.users)
-- ------------------------------------------------------------
-- One row per user; id mirrors auth.users.id exactly.
-- Do NOT store passwords here — Supabase Auth handles that.

CREATE TABLE profiles (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role              user_role   NOT NULL DEFAULT 'member',
  full_name         TEXT        NOT NULL,
  email             TEXT        NOT NULL UNIQUE,
  nic_number        TEXT        UNIQUE,                 -- National ID; login with NIC or email
  phone             TEXT,
  address           TEXT,
  avatar_url        TEXT,                          -- Supabase Storage public URL
  borrow_token_limit INT        NOT NULL DEFAULT 3, -- max simultaneous borrows
  borrow_tokens_used INT        NOT NULL DEFAULT 0, -- currently issued count
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tokens_used_lte_limit CHECK (borrow_tokens_used <= borrow_token_limit),
  CONSTRAINT tokens_non_negative   CHECK (borrow_tokens_used >= 0)
);

-- Auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'member'::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ------------------------------------------------------------
-- 2.2  CATEGORIES
-- ------------------------------------------------------------

CREATE TABLE categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed common public library categories
INSERT INTO categories (name, description) VALUES
  ('Fiction',           'Novels, short stories, and literary fiction'),
  ('Non-Fiction',       'Factual books and general non-fiction'),
  ('Science',           'Natural sciences, biology, chemistry, physics'),
  ('Technology',        'Computing, engineering, and technology'),
  ('History',           'World history and historical accounts'),
  ('Biography',         'Biographies and autobiographies'),
  ('Children',          'Books for children and young readers'),
  ('Young Adult',       'Books for teenage and young adult readers'),
  ('Self-Help',         'Personal development and self-improvement'),
  ('Reference',         'Encyclopedias, dictionaries, and reference books');


-- ------------------------------------------------------------
-- 2.3  AUTHORS
-- ------------------------------------------------------------

CREATE TABLE authors (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  bio        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT authors_name_unique UNIQUE (name)
);


-- ------------------------------------------------------------
-- 2.4  PUBLISHERS
-- ------------------------------------------------------------

CREATE TABLE publishers (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 2.5  BOOKS  (core catalogue)
-- ------------------------------------------------------------

CREATE TABLE books (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn             TEXT        UNIQUE,                 -- optional but recommended
  title            TEXT        NOT NULL,
  subtitle         TEXT,
  description      TEXT,
  author_id        UUID        REFERENCES authors(id)    ON DELETE SET NULL,
  publisher_id     UUID        REFERENCES publishers(id) ON DELETE SET NULL,
  category_id      UUID        REFERENCES categories(id) ON DELETE SET NULL,
  published_year   SMALLINT,
  edition          TEXT,
  language         TEXT        NOT NULL DEFAULT 'English',
  total_copies     INT         NOT NULL DEFAULT 1,
  available_copies INT         NOT NULL DEFAULT 1,
  shelf_number     TEXT,                               -- e.g. "A3"
  rack_number      TEXT,                               -- e.g. "R2"
  cover_url        TEXT,                               -- Supabase Storage public URL
  pdf_url          TEXT,                               -- for digital/eBook copies
  status           book_status NOT NULL DEFAULT 'available',
  tags             TEXT[]      DEFAULT '{}',           -- searchable tags
  created_by       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,                        -- soft delete timestamp

  CONSTRAINT copies_non_negative     CHECK (available_copies >= 0),
  CONSTRAINT available_lte_total     CHECK (available_copies <= total_copies),
  CONSTRAINT total_copies_positive   CHECK (total_copies > 0)
);


-- ------------------------------------------------------------
-- 2.6  ISSUED BOOKS  (borrow transactions)
-- ------------------------------------------------------------

CREATE TABLE issued_books (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id        UUID        NOT NULL REFERENCES books(id)    ON DELETE RESTRICT,
  member_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  issued_by      UUID        REFERENCES profiles(id)          ON DELETE SET NULL,  -- librarian
  issue_date     DATE        NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE        NOT NULL,
  returned_date  DATE,
  status         issue_status NOT NULL DEFAULT 'issued',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT due_after_issue   CHECK (due_date > issue_date),
  CONSTRAINT returned_after_issue CHECK (
    returned_date IS NULL OR returned_date >= issue_date
  )
);


-- ------------------------------------------------------------
-- 2.7  FINES
-- ------------------------------------------------------------
-- One fine row per issued_books row (created on return if overdue).

CREATE TABLE fines (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  issued_book_id  UUID        NOT NULL UNIQUE REFERENCES issued_books(id) ON DELETE CASCADE,
  member_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  overdue_days    INT         NOT NULL DEFAULT 0,
  rate_per_day    NUMERIC(6,2) NOT NULL DEFAULT 5.00,  -- default LKR 5/day
  total_amount    NUMERIC(10,2) GENERATED ALWAYS AS (overdue_days * rate_per_day) STORED,
  status          fine_status NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  waived_by       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT overdue_days_non_negative CHECK (overdue_days >= 0),
  CONSTRAINT rate_positive             CHECK (rate_per_day > 0)
);


-- ------------------------------------------------------------
-- 2.8  RESERVATIONS
-- ------------------------------------------------------------

CREATE TABLE reservations (
  id            UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id       UUID               NOT NULL REFERENCES books(id)    ON DELETE CASCADE,
  member_id     UUID               NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        reservation_status NOT NULL DEFAULT 'pending',
  reserved_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ        NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  collected_at  TIMESTAMPTZ,
  cancelled_at  TIMESTAMPTZ,
  notes         TEXT,

  -- One active reservation per member per book
  CONSTRAINT one_active_reservation UNIQUE (book_id, member_id, status)
);


-- ------------------------------------------------------------
-- 2.9  NOTIFICATIONS
-- ------------------------------------------------------------

CREATE TABLE notifications (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notif_type  NOT NULL DEFAULT 'general',
  title       TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
  related_id  UUID,       -- optional: book_id, issued_book_id, etc.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 2.10  SETTINGS  (library-wide configuration)
-- ------------------------------------------------------------

CREATE TABLE settings (
  id                  INT         PRIMARY KEY DEFAULT 1,  -- single row
  library_name        TEXT        NOT NULL DEFAULT 'Public Library',
  max_borrow_days     INT         NOT NULL DEFAULT 14,    -- default loan period
  fine_per_day        NUMERIC(6,2) NOT NULL DEFAULT 5.00,
  max_borrow_tokens   INT         NOT NULL DEFAULT 3,
  reservation_expiry_days INT     NOT NULL DEFAULT 7,
  updated_by          UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO settings DEFAULT VALUES;  -- create the one settings row


-- ------------------------------------------------------------
-- 2.11  ACTIVITY LOGS  (audit trail)
-- ------------------------------------------------------------

CREATE TABLE activity_logs (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,   -- e.g. 'book.issued', 'book.returned'
  entity      TEXT,                   -- e.g. 'books', 'issued_books'
  entity_id   UUID,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. INDEXES  (performance)
-- ============================================================

-- Books — search by title/author/isbn
CREATE INDEX idx_books_title         ON books USING gin(title gin_trgm_ops);
CREATE INDEX idx_books_category      ON books(category_id);
CREATE INDEX idx_books_author        ON books(author_id);
CREATE INDEX idx_books_status        ON books(status);
CREATE INDEX idx_books_deleted_at    ON books(deleted_at) WHERE deleted_at IS NULL;

-- Issued books — member lookup, overdue queries
CREATE INDEX idx_issued_member       ON issued_books(member_id);
CREATE INDEX idx_issued_book         ON issued_books(book_id);
CREATE INDEX idx_issued_status       ON issued_books(status);
CREATE INDEX idx_issued_due_date     ON issued_books(due_date) WHERE status = 'issued';

-- Fines
CREATE INDEX idx_fines_member        ON fines(member_id);
CREATE INDEX idx_fines_status        ON fines(status);

-- Notifications
CREATE INDEX idx_notif_user          ON notifications(user_id);
CREATE INDEX idx_notif_unread        ON notifications(user_id) WHERE is_read = FALSE;

-- Reservations
CREATE INDEX idx_reserv_member       ON reservations(member_id);
CREATE INDEX idx_reserv_book         ON reservations(book_id);
CREATE INDEX idx_reserv_status       ON reservations(status);

-- Activity logs
CREATE INDEX idx_activity_actor      ON activity_logs(actor_id);
CREATE INDEX idx_activity_created    ON activity_logs(created_at DESC);


-- ============================================================
-- 4. HELPER FUNCTIONS
-- ============================================================


-- 4.1  Auto-update updated_at on any table
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER trg_profiles_updated    BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_books_updated       BEFORE UPDATE ON books       FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_issued_updated      BEFORE UPDATE ON issued_books FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_fines_updated       BEFORE UPDATE ON fines       FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_settings_updated    BEFORE UPDATE ON settings    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();


-- ------------------------------------------------------------
-- 4.2  ISSUE A BOOK
-- Decrements available_copies + increments tokens_used atomically.
-- Call from server-side only (API route / service role).
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION issue_book(
  p_book_id    UUID,
  p_member_id  UUID,
  p_issued_by  UUID,
  p_due_date   DATE
)
RETURNS issued_books LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_book        books%ROWTYPE;
  v_member      profiles%ROWTYPE;
  v_issue_row   issued_books%ROWTYPE;
  v_settings    settings%ROWTYPE;
BEGIN
  -- Lock rows to prevent race conditions
  SELECT * INTO v_book    FROM books    WHERE id = p_book_id    FOR UPDATE;
  SELECT * INTO v_member  FROM profiles WHERE id = p_member_id  FOR UPDATE;
  SELECT * INTO v_settings FROM settings WHERE id = 1;

  -- Validations
  IF v_book.id IS NULL THEN
    RAISE EXCEPTION 'Book not found';
  END IF;
  IF v_book.available_copies < 1 THEN
    RAISE EXCEPTION 'No copies available';
  END IF;
  IF v_book.status != 'available' THEN
    RAISE EXCEPTION 'Book is not available for borrowing';
  END IF;
  IF v_member.id IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;
  IF NOT v_member.is_active THEN
    RAISE EXCEPTION 'Member account is inactive';
  END IF;
  IF v_member.borrow_tokens_used >= v_member.borrow_token_limit THEN
    RAISE EXCEPTION 'Member has reached borrowing limit (% of %)', 
      v_member.borrow_tokens_used, v_member.borrow_token_limit;
  END IF;
  IF p_due_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Due date must be in the future';
  END IF;

  -- Check member doesn't already have this book issued
  IF EXISTS (
    SELECT 1 FROM issued_books
    WHERE book_id = p_book_id AND member_id = p_member_id AND status = 'issued'
  ) THEN
    RAISE EXCEPTION 'Member already has this book issued';
  END IF;

  -- Decrement stock
  UPDATE books
  SET available_copies = available_copies - 1
  WHERE id = p_book_id;

  -- Increment token usage
  UPDATE profiles
  SET borrow_tokens_used = borrow_tokens_used + 1
  WHERE id = p_member_id;

  -- Create issue record
  INSERT INTO issued_books (book_id, member_id, issued_by, due_date)
  VALUES (p_book_id, p_member_id, p_issued_by, p_due_date)
  RETURNING * INTO v_issue_row;

  -- Notification to member
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    p_member_id,
    'book_issued',
    'Book Issued',
    'You have borrowed "' || v_book.title || '". Due date: ' || p_due_date::TEXT,
    v_issue_row.id
  );

  -- Activity log
  INSERT INTO activity_logs (actor_id, action, entity, entity_id, metadata)
  VALUES (
    p_issued_by,
    'book.issued',
    'issued_books',
    v_issue_row.id,
    jsonb_build_object('book_id', p_book_id, 'member_id', p_member_id, 'due_date', p_due_date)
  );

  RETURN v_issue_row;
END;
$$;


-- ------------------------------------------------------------
-- 4.3  RETURN A BOOK
-- Increments available_copies + decrements tokens_used + calculates fine.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION return_book(
  p_issued_book_id  UUID,
  p_returned_by     UUID  -- librarian id
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_issue       issued_books%ROWTYPE;
  v_book        books%ROWTYPE;
  v_settings    settings%ROWTYPE;
  v_overdue_days INT;
  v_fine_row    fines%ROWTYPE;
BEGIN
  SELECT * INTO v_issue FROM issued_books WHERE id = p_issued_book_id FOR UPDATE;
  IF v_issue.id IS NULL THEN
    RAISE EXCEPTION 'Issue record not found';
  END IF;
  IF v_issue.status = 'returned' THEN
    RAISE EXCEPTION 'Book already returned';
  END IF;

  SELECT * INTO v_book     FROM books    WHERE id = v_issue.book_id FOR UPDATE;
  SELECT * INTO v_settings FROM settings WHERE id = 1;

  -- Mark returned
  UPDATE issued_books
  SET status = 'returned', returned_date = CURRENT_DATE
  WHERE id = p_issued_book_id;

  -- Restore stock
  UPDATE books
  SET available_copies = available_copies + 1
  WHERE id = v_issue.book_id;

  -- Restore token
  UPDATE profiles
  SET borrow_tokens_used = GREATEST(borrow_tokens_used - 1, 0)
  WHERE id = v_issue.member_id;

  -- Calculate fine if overdue
  v_overdue_days := GREATEST((CURRENT_DATE - v_issue.due_date), 0);
  IF v_overdue_days > 0 THEN
    INSERT INTO fines (issued_book_id, member_id, overdue_days, rate_per_day)
    VALUES (p_issued_book_id, v_issue.member_id, v_overdue_days, v_settings.fine_per_day)
    RETURNING * INTO v_fine_row;

    -- Notify member of fine
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
      v_issue.member_id,
      'overdue_alert',
      'Fine Applied',
      'Your return of "' || v_book.title || '" was ' || v_overdue_days || 
      ' day(s) late. Fine: ' || (v_overdue_days * v_settings.fine_per_day)::TEXT,
      v_fine_row.id
    );
  END IF;

  -- Notify member of successful return
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_issue.member_id,
    'book_returned',
    'Book Returned',
    '"' || v_book.title || '" has been successfully returned. Thank you!',
    p_issued_book_id
  );

  -- Activity log
  INSERT INTO activity_logs (actor_id, action, entity, entity_id, metadata)
  VALUES (
    p_returned_by,
    'book.returned',
    'issued_books',
    p_issued_book_id,
    jsonb_build_object(
      'book_id',      v_issue.book_id,
      'member_id',    v_issue.member_id,
      'overdue_days', v_overdue_days,
      'fine_amount',  COALESCE(v_fine_row.overdue_days * v_settings.fine_per_day, 0)
    )
  );

  RETURN jsonb_build_object(
    'success',      TRUE,
    'overdue_days', v_overdue_days,
    'fine_amount',  COALESCE(v_overdue_days * v_settings.fine_per_day, 0),
    'fine_id',      v_fine_row.id
  );
END;
$$;


-- ------------------------------------------------------------
-- 4.4  AUTO-MARK OVERDUE
-- Run this daily via a cron job (pg_cron or Supabase cron).
-- Updates issued_books status + creates overdue notifications.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION mark_overdue_books()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INT;
BEGIN
  -- Update status
  WITH updated AS (
    UPDATE issued_books
    SET status = 'overdue'
    WHERE status = 'issued'
      AND due_date < CURRENT_DATE
    RETURNING id, member_id, book_id, due_date
  )
  -- Notify members (only if not already notified today)
  INSERT INTO notifications (user_id, type, title, message, related_id)
  SELECT
    u.member_id,
    'overdue_alert',
    'Overdue Book',
    'A book you borrowed is overdue since ' || u.due_date::TEXT || '. Please return it to avoid further fines.',
    u.id
  FROM updated u
  WHERE NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = u.member_id
      AND n.related_id = u.id
      AND n.type = 'overdue_alert'
      AND n.created_at::DATE = CURRENT_DATE
  );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


-- ------------------------------------------------------------
-- 4.5  USEFUL VIEWS (read-only, no RLS needed — query via service role)
-- ------------------------------------------------------------

-- Active borrows enriched with book + member info
CREATE OR REPLACE VIEW v_active_borrows AS
SELECT
  ib.id,
  ib.issue_date,
  ib.due_date,
  ib.status,
  GREATEST((CURRENT_DATE - ib.due_date), 0) AS overdue_days,
  b.id           AS book_id,
  b.title        AS book_title,
  b.cover_url,
  b.shelf_number,
  b.rack_number,
  p.id           AS member_id,
  p.full_name    AS member_name,
  p.email        AS member_email,
  p.phone        AS member_phone
FROM issued_books ib
JOIN books    b ON b.id = ib.book_id
JOIN profiles p ON p.id = ib.member_id
WHERE ib.status IN ('issued', 'overdue');


-- Dashboard stats for admin
CREATE OR REPLACE VIEW v_admin_stats AS
SELECT
  (SELECT COUNT(*)                          FROM books    WHERE deleted_at IS NULL)                    AS total_books,
  (SELECT COUNT(*)                          FROM books    WHERE available_copies > 0 AND deleted_at IS NULL) AS available_books,
  (SELECT COUNT(*)                          FROM profiles WHERE role = 'member')                       AS total_members,
  (SELECT COUNT(*)                          FROM profiles WHERE role = 'librarian')                    AS total_librarians,
  (SELECT COUNT(*)                          FROM issued_books WHERE status IN ('issued','overdue'))     AS currently_issued,
  (SELECT COUNT(*)                          FROM issued_books WHERE status = 'overdue')                AS overdue_count,
  (SELECT COUNT(*)                          FROM issued_books WHERE status = 'returned' AND returned_date = CURRENT_DATE) AS returned_today,
  (SELECT COUNT(*)                          FROM issued_books WHERE issue_date = CURRENT_DATE)         AS issued_today,
  (SELECT COALESCE(SUM(total_amount), 0)    FROM fines    WHERE status = 'pending')                    AS pending_fines,
  (SELECT COALESCE(SUM(total_amount), 0)    FROM fines    WHERE status = 'paid')                       AS collected_fines,
  (SELECT COUNT(*)                          FROM books    WHERE available_copies = 0 AND deleted_at IS NULL) AS out_of_stock_books;


-- Monthly borrowing trend (last 12 months)
CREATE OR REPLACE VIEW v_monthly_borrow_trend AS
SELECT
  DATE_TRUNC('month', issue_date)::DATE AS month,
  COUNT(*)                              AS total_issued,
  COUNT(*) FILTER (WHERE status = 'returned') AS total_returned
FROM issued_books
WHERE issue_date >= NOW() - INTERVAL '12 months'
GROUP BY 1
ORDER BY 1;


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Strategy:
--   • members  → see/edit only their own rows
--   • librarians → broader read; can write issue/return/books
--   • admins   → full access (handled via service_role in API)
--   • public   → nothing (all tables private by default)
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE books          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_books   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs  ENABLE ROW LEVEL SECURITY;


-- Helper: returns the role of the current logged-in user
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;


-- ---- PROFILES ------------------------------------------------
CREATE POLICY "Members view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Librarians and admins view all profiles"
  ON profiles FOR SELECT
  USING (current_user_role() IN ('librarian', 'admin'));

CREATE POLICY "Members update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    -- members cannot change their own role
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins full access to profiles"
  ON profiles FOR ALL
  USING (current_user_role() = 'admin');


-- ---- BOOKS ---------------------------------------------------
-- Everyone (even anonymous) can read non-deleted books
CREATE POLICY "Anyone can view available books"
  ON books FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Librarians and admins manage books"
  ON books FOR ALL
  USING (current_user_role() IN ('librarian', 'admin'));


-- ---- CATEGORIES, AUTHORS, PUBLISHERS ------------------------
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage categories"
  ON categories FOR ALL USING (current_user_role() IN ('librarian','admin'));

CREATE POLICY "Public read authors"
  ON authors FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage authors"
  ON authors FOR ALL USING (current_user_role() IN ('librarian','admin'));

CREATE POLICY "Public read publishers"
  ON publishers FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage publishers"
  ON publishers FOR ALL USING (current_user_role() IN ('librarian','admin'));


-- ---- ISSUED BOOKS --------------------------------------------
CREATE POLICY "Members view own issued books"
  ON issued_books FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Librarians and admins view all issued books"
  ON issued_books FOR SELECT
  USING (current_user_role() IN ('librarian', 'admin'));

CREATE POLICY "Librarians and admins manage issued books"
  ON issued_books FOR ALL
  USING (current_user_role() IN ('librarian', 'admin'));


-- ---- FINES ---------------------------------------------------
CREATE POLICY "Members view own fines"
  ON fines FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Librarians and admins view all fines"
  ON fines FOR SELECT
  USING (current_user_role() IN ('librarian', 'admin'));

CREATE POLICY "Librarians and admins manage fines"
  ON fines FOR ALL
  USING (current_user_role() IN ('librarian', 'admin'));


-- ---- RESERVATIONS -------------------------------------------
CREATE POLICY "Members view own reservations"
  ON reservations FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Members create own reservations"
  ON reservations FOR INSERT
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "Members cancel own reservations"
  ON reservations FOR UPDATE
  USING (member_id = auth.uid() AND status = 'pending');

CREATE POLICY "Librarians and admins manage all reservations"
  ON reservations FOR ALL
  USING (current_user_role() IN ('librarian', 'admin'));


-- ---- NOTIFICATIONS ------------------------------------------
CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users mark own notifications read"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Librarians and admins insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (current_user_role() IN ('librarian', 'admin'));


-- ---- SETTINGS -----------------------------------------------
CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can update settings"
  ON settings FOR UPDATE
  USING (current_user_role() = 'admin');


-- ---- ACTIVITY LOGS ------------------------------------------
CREATE POLICY "Admins and librarians view activity logs"
  ON activity_logs FOR SELECT
  USING (current_user_role() IN ('admin', 'librarian'));


-- ============================================================
-- 6. SUPABASE STORAGE BUCKETS  (run via Dashboard or API)
-- ============================================================
-- These cannot be created in SQL — set them up in:
-- Supabase Dashboard → Storage → New bucket
--
-- Create 2 buckets:
--   1. "book-covers"   → Public  (anyone can view cover images)
--   2. "book-pdfs"     → Private (authenticated users only)
--
-- Storage RLS for book-covers (public read):
--   SELECT: true
--   INSERT: (auth.role() IN ('librarian','admin'))
--
-- Storage RLS for book-pdfs (authenticated only):
--   SELECT: auth.role() = 'authenticated'
--   INSERT: current_user_role() IN ('librarian','admin')
-- ============================================================


-- ============================================================
-- 7. SAMPLE / SEED DATA  (optional — remove in production)
-- ============================================================

-- Add a sample author and publisher
INSERT INTO authors (name, bio)
VALUES ('George Orwell', 'English novelist and essayist, journalist and critic.');

INSERT INTO publishers (name)
VALUES ('Secker & Warburg');

-- Add a sample book
INSERT INTO books (title, isbn, description, published_year, total_copies, available_copies, shelf_number, rack_number)
SELECT
  'Nineteen Eighty-Four',
  '978-0-452-28423-4',
  'A dystopian social science fiction novel by George Orwell.',
  1949,
  3,
  3,
  'F1',
  'R1';

-- ============================================================
-- DONE — Schema is ready.
-- ============================================================
-- Next steps:
--   1. Paste into Supabase SQL Editor and run
--   2. Create Storage buckets manually in dashboard
--   3. Set up cron job for mark_overdue_books():
--        SELECT cron.schedule('mark-overdue', '0 1 * * *', 'SELECT mark_overdue_books()');
--   4. In your Next.js app:
--        - Use supabaseClient (anon key) for user-facing queries
--        - Use supabaseAdmin (service_role key) for issue_book() / return_book()
-- ============================================================
