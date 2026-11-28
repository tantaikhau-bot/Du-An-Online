"""V35.0 end-to-end authentication and save contract; disposable local SQLite only."""
import concurrent.futures
import http.client
import json
import tempfile
import threading
import unittest
from pathlib import Path
import server

class Foundation(unittest.TestCase):
    def test_auth_save_lifecycle(self):
        previous = server.DB
        with tempfile.TemporaryDirectory() as folder:
            server.DB = str(Path(folder) / "foundation.sqlite3")
            try:
                server.init()
                srv = server.BoundedServer(("127.0.0.1", 0), server.Handler)
                thread = threading.Thread(target=srv.serve_forever, daemon=True)
                thread.start()
                def request(method, path, data=None, cookie=None):
                    headers = {"Content-Type": "application/json"}
                    if cookie: headers["Cookie"] = cookie
                    conn = http.client.HTTPConnection("127.0.0.1", srv.server_port, timeout=15)
                    try:
                        conn.request(method, path, None if data is None else json.dumps(data), headers)
                        res = conn.getresponse()
                        return res.status, json.loads(res.read()), res.getheader("Set-Cookie")
                    finally:
                        conn.close()
                def post(path, data, cookie=None, expect=200):
                    status, payload, header = request("POST", path, data, cookie)
                    self.assertEqual(status, expect, (path, payload))
                    return payload, header
                def get(path, cookie=None, expect=200):
                    status, payload, _ = request("GET", path, cookie=cookie)
                    self.assertEqual(status, expect, (path, payload))
                    return payload
                def state(coins):
                    return dict(name="Test", coins=coins, xp=1, petXp=0, streak=0,
                                wishes=[], lanterns=[], plants=[], owned=[], collection=[],
                                decor=[], daily={"claimed":[]})
                try:
                    get("/api/save", expect=401)
                    _, a = post("/api/register", {"name":"foundation_a","password":"test-password-35"})
                    _, b = post("/api/register", {"name":"foundation_b","password":"test-password-35"})
                    a, b = a.split(";")[0], b.split(";")[0]
                    first, second = get("/api/save", a), get("/api/save", b)
                    self.assertNotEqual(first["owner"],second["owner"])
                    self.assertIsNone(first["state"])
                    owner = first["owner"]
                    def write(rev, coins):
                        return {"revision":rev,"owner":owner,"state":state(coins)}
                    post("/api/save", write(0,10), b, 403)
                    self.assertEqual(post("/api/save",write(0,10),a)[0]["revision"],1)
                    self.assertTrue(post("/api/save",write(0,10),a)[0]["replayed"])
                    post("/api/save",write(0,11),a,409)
                    self.assertEqual(get("/api/save",a)["state"]["coins"],10)
                    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                        futures=[executor.submit(request,"POST","/api/save",write(1,n),a) for n in (20,30)]
                        self.assertEqual(sorted(f.result()[0] for f in futures),[200,409])
                    self.assertEqual(get("/api/save",a)["revision"],2)
                    for rev in (2,3,4):
                        post("/api/save",write(rev,rev*10),a)
                    history=get("/api/save/history",a)["history"]
                    self.assertEqual([x["revision"] for x in history],[4,3,2])
                    self.assertEqual(get("/api/save/history/4",a)["state"]["coins"],30)
                    get("/api/save/history/1",a,404)
                    self.assertEqual(get("/api/save/history",b)["history"],[])
                    get("/api/save/history/4",b,404)
                    post("/api/logout",{},a)
                    get("/api/save",a,401)
                    post("/api/login",{"name":"foundation_a","password":"wrong-password"},expect=401)
                    _, login=post("/api/login",{"name":"foundation_a","password":"test-password-35"})
                    fresh=login.split(";")[0]
                    self.assertEqual(get("/api/save",fresh)["revision"],5)
                    self.assertEqual(get("/api/save",fresh)["state"]["coins"],40)
                    # Reopen database via a new connection and confirm committed state.
                    with server.db() as db:
                        self.assertEqual(db.execute("SELECT revision FROM users WHERE id=?",(owner,)).fetchone()[0],5)
                finally:
                    srv.shutdown()
                    srv.server_close()
                    thread.join(timeout=5)
            finally:
                server.DB=previous

if __name__ == "__main__":
    unittest.main(verbosity=2)
