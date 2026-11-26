"""Read-only row-count verification after pgloader into a dedicated staging database."""
import argparse,os,sqlite3
from pathlib import Path
def verify(source,dsn,schema='public'):
 import psycopg
 from psycopg import sql
 with sqlite3.connect(Path(source).resolve().as_uri()+'?mode=ro',uri=True) as src,psycopg.connect(dsn) as dst:
  dst.execute('SET TRANSACTION READ ONLY')
  names=[x[0] for x in src.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]
  if not names:raise RuntimeError('Snapshot has no tables')
  mismatches=[]
  for name in names:
   count=src.execute('SELECT count(*) FROM "'+name.replace('"','""')+'"').fetchone()[0]
   actual=dst.execute(sql.SQL('SELECT count(*) FROM {}.{}').format(sql.Identifier(schema),sql.Identifier(name))).fetchone()[0]
   print(name,count,actual)
   if count!=actual:mismatches.append(name)
  if mismatches:raise RuntimeError('Row count mismatch: '+','.join(mismatches))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('snapshot');p.add_argument('--schema',default='public');a=p.parse_args();verify(a.snapshot,os.environ['STAGING_DATABASE_URL'],a.schema)
