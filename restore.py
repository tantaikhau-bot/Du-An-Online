"""Restore to a NEW database; stop server before replacing live database."""
import sqlite3,sys
from pathlib import Path
if len(sys.argv)!=3:raise SystemExit('Usage: python restore.py BACKUP NEW_DATABASE')
src,dst=map(Path,sys.argv[1:]);src=src.resolve();dst=dst.resolve()
if not src.is_file() or dst.exists():raise SystemExit('Source must exist and destination must not exist')
with sqlite3.connect(src.as_uri()+'?mode=ro',uri=True) as a:
 if a.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise SystemExit('Invalid backup')
 with sqlite3.connect(dst) as b:a.backup(b);assert b.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
print('Restored to',dst)
