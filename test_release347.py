"""V34.7: offline release contract and actual static handler regression tests."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import gzip
import io
import shutil
import subprocess
import tempfile
import unittest
from static_files import FILES, serve_static

ROOT = Path(__file__).resolve().parent
MODULES = ("notices wallet cosmetics housing visits festival sharing royal "
           "navigation hud save-recovery character-studio together groups").split()

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = []
        self.current = None
    def handle_starttag(self, tag, attrs):
        if tag == "script":
            self.current = [dict(attrs), ""]
    def handle_data(self, data):
        if self.current is not None:
            self.current[1] += data
    def handle_endtag(self, tag):
        if tag == "script" and self.current is not None:
            self.scripts.append(self.current)
            self.current = None

class Handler:
    def __init__(self, headers=None, method="GET"):
        self.headers = headers or {}
        self.command = method
        self.wfile = io.BytesIO()
        self.response_headers = {}
        self.status = None
    def send_response(self, status): self.status = status
    def send_header(self, key, value): self.response_headers[key] = value
    def end_headers(self): pass
    def reply(self, status, data): self.status = status

def scripts():
    p = Scripts()
    p.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    return p.scripts

class ReleaseTests(unittest.TestCase):
    def test_module_order(self):
        actual = [(i, a) for i, (a, _) in enumerate(scripts())
                  if a.get("src", "").startswith("/assets/ww346-")]
        self.assertEqual([a["src"] for _, a in actual],
                         ["/assets/ww346-" + n + ".js?v=3527" for n in MODULES])
        self.assertEqual([i for i, _ in actual], list(range(actual[0][0], actual[0][0]+14)))
        for _, a in actual:
            self.assertFalse({"async", "defer", "type"} & a.keys())

    def test_local_script_assets(self):
        for attrs, _ in scripts():
            src = attrs.get("src", "")
            if not src.startswith("/assets/"):
                continue
            path = urlsplit(src).path
            name = path.removeprefix("/assets/")
            with self.subTest(name=name):
                self.assertIn(name, FILES)
                self.assertTrue((ROOT / "assets" / name).is_file())
                h = Handler()
                serve_static(h, ROOT, path)
                self.assertEqual(h.status, 200)
                self.assertIn("javascript", h.response_headers["Content-Type"])
                self.assertEqual(urlsplit(src).query, 'v=3527')
                self.assertEqual(h.response_headers['Cache-Control'], 'public, no-cache')
                self.assertEqual(h.wfile.getvalue(), (ROOT / "assets" / name).read_bytes())
                h2 = Handler({"If-None-Match": h.response_headers["ETag"]})
                serve_static(h2, ROOT, path)
                self.assertEqual(h2.status, 304)
                self.assertEqual(h2.response_headers['Cache-Control'], 'public, no-cache')
                self.assertEqual(h2.wfile.getvalue(), b"")
                h3 = Handler({"Accept-Encoding": "gzip"})
                serve_static(h3, ROOT, path)
                self.assertEqual(h3.status, 200)
                body = h3.wfile.getvalue()
                if h3.response_headers.get("Content-Encoding") == "gzip":
                    body = gzip.decompress(body)
                self.assertEqual(body, h.wfile.getvalue())
                h4 = Handler(method="HEAD")
                serve_static(h4, ROOT, path)
                self.assertEqual(h4.status, 200)
                self.assertEqual(h4.wfile.getvalue(), b"")

    def test_unknown_asset_denied(self):
        for path in ("/assets/not-allowed.js", "/assets/../server.py"):
            h = Handler()
            serve_static(h, ROOT, path)
            self.assertEqual(h.status, 404)

    @unittest.skipUnless(shutil.which("node"), "Node required for JS syntax checks")
    def test_javascript_syntax(self):
        with tempfile.TemporaryDirectory() as folder:
            for i, (attrs, body) in enumerate(scripts()):
                if attrs.get("type") == "importmap":
                    continue
                src = attrs.get("src")
                if src:
                    path = ROOT / urlsplit(src).path.lstrip("/")
                else:
                    path = Path(folder) / ("inline-%d.js" % i)
                    path.write_text(body, encoding="utf-8")
                with self.subTest(script=str(path)):
                    result = subprocess.run(["node", "--check", str(path)],
                                            capture_output=True, text=True, timeout=30)
                    self.assertEqual(result.returncode, 0, result.stderr)

def smoke():
    suite = unittest.TestSuite(ReleaseTests(name) for name in
        ("test_module_order", "test_local_script_assets", "test_unknown_asset_denied"))
    if not unittest.TextTestRunner(verbosity=1).run(suite).wasSuccessful():
        raise RuntimeError("Release asset contract failed")

if __name__ == "__main__":
    unittest.main(verbosity=2)
