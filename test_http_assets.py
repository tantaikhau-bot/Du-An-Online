"""Focused, offline smoke tests for V23.1 text delivery."""
import gzip
import tempfile
from pathlib import Path
from http_assets import accepts_gzip, etag_matches, text_representation, MAX_TEXT_BYTES

def smoke():
    assert accepts_gzip('br, gzip')
    assert accepts_gzip('*;q=0.5')
    assert not accepts_gzip('gzip;q=0, *;q=1')
    assert not accepts_gzip('gzip;q=nan')
    assert not accepts_gzip(None)
    with tempfile.TemporaryDirectory() as directory:
        p=Path(directory)/'sample.js'
        raw=b'const x = 123;\n'*300
        p.write_bytes(raw)
        stat=p.stat()
        original,packed,tag=text_representation(str(p),stat.st_mtime_ns,stat.st_size)
        assert original==raw and gzip.decompress(packed)==raw
        assert etag_matches(tag,tag) and etag_matches(tag.removeprefix('W/'),tag)
        assert etag_matches('*',tag) and not etag_matches('"other"',tag)
        p.write_bytes(raw+b'// changed')
        stat=p.stat()
        assert text_representation(str(p),stat.st_mtime_ns,stat.st_size)[2]!=tag
        assert text_representation(str(p),stat.st_mtime_ns,MAX_TEXT_BYTES+1) is None
    text_representation.cache_clear()

if __name__=='__main__':
    smoke()
    print('V23.1 HTTP asset smoke tests passed')
