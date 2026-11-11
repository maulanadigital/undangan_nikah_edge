CREATE TABLE invitations (
  uid TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  groom_name TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  parent_groom TEXT,
  parent_bride TEXT,
  wedding_date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  address TEXT,
  maps_url TEXT,
  maps_embed TEXT,
  og_image TEXT,
  favicon TEXT,
  audio TEXT
);

CREATE TABLE agenda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_uid TEXT NOT NULL REFERENCES invitations(uid) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  address TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE banks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_uid TEXT NOT NULL REFERENCES invitations(uid) ON DELETE CASCADE,
  bank TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE wishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_uid TEXT NOT NULL REFERENCES invitations(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  attendance TEXT NOT NULL DEFAULT 'MAYBE'
    CHECK (attendance IN ('ATTENDING', 'NOT_ATTENDING', 'MAYBE')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_wish_per_guest UNIQUE (invitation_uid, name)
);

CREATE INDEX idx_agenda_invitation_order
  ON agenda (invitation_uid, order_index, date);
CREATE INDEX idx_banks_invitation_order
  ON banks (invitation_uid, order_index);
CREATE INDEX idx_wishes_invitation_created
  ON wishes (invitation_uid, created_at DESC);
