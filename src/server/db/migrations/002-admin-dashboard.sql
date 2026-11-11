BEGIN;

ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'id';

CREATE TABLE administrators (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  administrator_id TEXT NOT NULL REFERENCES administrators(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL
);

CREATE TABLE admin_login_attempts (
  ip_hash TEXT PRIMARY KEY NOT NULL,
  failures INTEGER NOT NULL DEFAULT 0,
  window_started_at BIGINT NOT NULL
);

ALTER TABLE invitations
  ADD COLUMN owner_id TEXT REFERENCES administrators(id) ON DELETE SET NULL;

CREATE INDEX idx_invitations_owner ON invitations (owner_id);
CREATE INDEX idx_admin_sessions_expiry ON admin_sessions (expires_at);

COMMIT;
