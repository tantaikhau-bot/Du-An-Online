"""Make a transactionally consistent SQLite snapshot (including WAL), then validate it."""
import argparse,sqlite3,os
from pathlib import Path
def snapshot(source,destination):
 source=Path(source).resolve();destination=Path(destination).resolve()
 if source==destination or not source.is_file() or destination.exists():raise ValueError('Use existing source and new destination')
 fd=os.open(destination,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600);os.close(fd)
 try:
  with sqlite3.connect(source.as_uri()+'?mode=ro',uri=True) as src,sqlite3.connect(destination) as dst:
   src.backup(dst)
   if dst.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise RuntimeError('Integrity check failed')
 except BaseException:
  destination.unlink(missing_ok=True);raise
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('destination');a=p.parse_args();snapshot(a.source,a.destination);print('Verified snapshot created; keep private.')
