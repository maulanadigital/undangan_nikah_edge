BEGIN;

CREATE TABLE invitation_requests (
  id TEXT PRIMARY KEY NOT NULL,
  groom_name TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  event_date TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'approved', 'rejected')),
  ip_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (invitation_uid, slug)
);

CREATE INDEX idx_guests_invitation_name ON guests (invitation_uid, name);

ALTER TABLE wishes DROP CONSTRAINT IF EXISTS unique_wish_per_guest;

ALTER TABLE wishes
  ADD COLUMN guest_id TEXT REFERENCES guests(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX idx_wishes_invitation_guest
  ON wishes (invitation_uid, guest_id)
  WHERE guest_id IS NOT NULL;

COMMIT;
