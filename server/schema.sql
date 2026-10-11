CREATE TABLE IF NOT EXISTS accounts (
 id uuid PRIMARY KEY, username text NOT NULL UNIQUE, password_hash text NOT NULL,
 recovery_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash text PRIMARY KEY, account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_account ON sessions(account_id);
CREATE TABLE IF NOT EXISTS characters (
 id uuid PRIMARY KEY, account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 slot smallint NOT NULL CHECK(slot BETWEEN 1 AND 10), name text NOT NULL,
 revision integer NOT NULL DEFAULT 1, save jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(account_id,slot)
);
CREATE TABLE IF NOT EXISTS save_history (
 character_id uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
 revision integer NOT NULL, save jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(character_id,revision)
);
