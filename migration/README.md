# PostgreSQL migration rehearsal (not live cutover)

The existing application still uses SQLite-specific SQL and transactions. Do not point
WISH_DB at a PostgreSQL URL. Do not merge/deploy while the live SQLite backup is unavailable.
The Render Free filesystem may be discarded on deploy. No paid resource is provisioned.

1. On the current live instance, stop accepting writes (maintenance window), locate WISH_DB
   and create a verified snapshot with `python migration/backup_sqlite.py /path/world.sqlite3 /private/world.snapshot.sqlite3`.
   If shell access is unavailable, recover the database through an authorized existing
   backup/export mechanism before continuing. Do not commit the snapshot or account data.
2. Provision an **empty, dedicated staging PostgreSQL** instance, not an existing shared
   database. Restrict network access. Install pgloader and psycopg (v3).
3. Use pgloader from the private snapshot to the empty staging database:
   `pgloader /private/world.snapshot.sqlite3 "$STAGING_DATABASE_URL"`.
   Keep credentials in a private environment; review logs for conversion warnings.
4. Run `python migration/verify_postgres.py /private/world.snapshot.sqlite3`.
   Counts must match for every table. Additionally compare data/constraints, unique
   indexes, sequences, case-insensitive usernames, boolean/integer semantics and timestamps.
5. Port SQL dialects in all game modules (INSERT OR REPLACE, BEGIN IMMEDIATE,
   rowid, autoincrement, collations, lastrowid, placeholders), then run the full suite
   against PostgreSQL and test concurrent transfers. Do NOT switch production before this.
6. Rehearse a rollback, repeat the final snapshot during maintenance, then cut over with
   a verified restore and monitor. Preserve the original snapshot.

The two tools included here provide backup and read-only count verification. They do not
convert or migrate production automatically. Render free Postgres may have expiry;
confirm current plan and retention before selecting a production database.
