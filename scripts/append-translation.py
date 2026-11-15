"""Append an ordered, validated batch to an English catalogue."""
import json, re, sys
from pathlib import Path
name = sys.argv[1]
target = Path('src/locales/en') / (name + '.json')
source = json.loads((Path('scripts/i18n-source') / (name + '.json')).read_text(encoding='utf-8'))
old = json.loads(target.read_text(encoding='utf-8')) if target.exists() else []
batch = json.loads(sys.stdin.buffer.read().decode('utf-8'))
if isinstance(batch, dict):
    expected = list(range(len(old), len(old) + len(batch)))
    assert sorted(map(int, batch)) == expected, 'Batch indices must be contiguous'
    batch = [batch[str(i)] for i in expected]
assert all(isinstance(s, str) and s.strip() for s in batch)
assert not any(re.search(r'[\u0621-\u064a\u067e\u0686\u0698\u06a9\u06af\u06cc]', s) for s in batch)
assert len(old) + len(batch) <= len(source)
target.write_text(json.dumps(old + batch, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{name}: {len(old)} -> {len(old)+len(batch)} / {len(source)}')
