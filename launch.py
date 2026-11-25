import os, sys, time, threading, webbrowser, getpass
from pathlib import Path
os.chdir(Path(__file__).resolve().parent)
os.environ['HOST']='127.0.0.1'
os.environ['PORT']='8080'
if '--admin' in sys.argv:
 p=getpass.getpass('Admin password (at least 14 characters): ')
 if len(p)<14: raise SystemExit('Password too short')
 os.environ['WISH_ADMIN_PASSWORD']=p
import server
server.init()
httpd=server.BoundedServer(('127.0.0.1',8080),server.Handler)
threading.Thread(target=httpd.serve_forever,daemon=True).start()
url='http://127.0.0.1:8080'+('/admin' if '--admin' in sys.argv else '')
print('WISH WORLD V2.0 RC — '+url+'\nPress Ctrl+C to stop.',flush=True)
webbrowser.open(url)
try:
 while True: time.sleep(1)
except KeyboardInterrupt: httpd.shutdown();httpd.server_close()
