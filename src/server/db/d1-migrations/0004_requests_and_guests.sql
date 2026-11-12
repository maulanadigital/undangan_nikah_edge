CREATE TABLE invitation_requests (
  id TEXT PRIMARY KEY NOT NULL,
  groom_name TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  event_date TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'approved', 'rejected')),
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_invitation_requests_status_created
  ON invitation_requests (status, created_at DESC);
CREATE INDEX idx_invitation_requests_ip_created
  ON invitation_requests (ip_hash, created_at DESC);

CREATE TABLE guests (
  id TEXT PRIMARY KEY NOT NULL,
  invitation_uid TEXT NOT NULL REFERENCES invitations(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (invitation_uid, slug)
);

CREATE INDEX idx_guests_invitation_name ON guests (invitation_uid, name);

CREATE TABLE wishes_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_uid TEXT NOT NULL REFERENCES invitations(uid) ON DELETE CASCADE,
  guest_id TEXT REFERENCES guests(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  attendance TEXT NOT NULL DEFAULT 'MAYBE'
    CHECK (attendance IN ('ATTENDING', 'NOT_ATTENDING', 'MAYBE')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO wishes_new (id, invitation_uid, name, message, attendance, created_at)
  SELECT id, invitation_uid, name, message, attendance, created_at FROM wishes;

DROP TABLE wishes;
ALTER TABLE wishes_new RENAME TO wishes;

CREATE INDEX idx_wishes_invitation_created
  ON wishes (invitation_uid, created_at DESC);

CREATE UNIQUE INDEX idx_wishes_invitation_guest
  ON wishes (invitation_uid, guest_id)
  WHERE guest_id IS NOT NULL;
