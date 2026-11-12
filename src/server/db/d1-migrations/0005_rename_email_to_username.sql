ALTER TABLE administrators
RENAME COLUMN email TO username;

CREATE INDEX IF NOT EXISTS idx_administrators_username
  ON administrators (username);