import os, getpass, runpy
p=getpass.getpass('Mat khau Admin (toi thieu 14 ky tu): ')
if len(p)<14:raise SystemExit('Mat khau qua ngan')
os.environ['WISH_ADMIN_PASSWORD']=p
runpy.run_module('server',run_name='__main__')
