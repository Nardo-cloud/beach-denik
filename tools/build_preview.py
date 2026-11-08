"""Sestaví náhled aplikace pro připomínkování na claude.ai (Artifact).

Použití:  python3 tools/build_preview.py VYSTUP.html
Vezme index.html, místo Supabase vloží napodobeninu s ukázkovými daty (tools/preview_mock.js)
a přidá lištu pro přepnutí pohledu trenér / hráčka.
"""
import re, sys, json, os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, 'nahled.html')
src = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
mock = open(os.path.join(root, 'tools', 'preview_mock.js'), encoding='utf-8').read()
sample = open(os.path.join(root, 'tools', 'preview_sample.json'), encoding='utf-8').read()
mock = mock.replace('__SAMPLE__', sample)

head = src[src.index('<head>') + 6:src.index('</head>')]
body = src[src.index('<body') :src.index('</body>')]
body = body[body.index('>') + 1:]

title = re.search(r'<title>.*?</title>', head).group(0)
links = ''.join(l + '\n' for l in re.findall(r'<link rel="stylesheet"[^>]+>', head))
styles = ''.join(re.findall(r'<style>.*?</style>', head, re.S)[1:])  # bez resetu

body = re.sub(r'<script src="https://cdn\.jsdelivr\.net/npm/@supabase[^"]+"></script>\s*<script src="config\.js"></script>',
              lambda m: '<script>' + mock + '</script>', body)
assert 'preview' in body or '__nahledRole' in body, 'mock not inserted'

bar = '''<div class="nahled-bar" role="note">
  <span><b>NÁHLED</b> · ukázková data, změny se neukládají</span>
  <span class="nr">Zobrazit jako
    <button type="button" id="nrCoach">Trenér</button><button type="button" id="nrPlayer">Hráčka</button></span>
</div>
<script>(function(){const r=window.__nahledRole||"coach";const set=v=>{try{localStorage.setItem("nahled-role",v)}catch(e){}location.reload()};
const c=document.getElementById("nrCoach"),p=document.getElementById("nrPlayer");c.setAttribute("aria-pressed",String(r!=="player"));p.setAttribute("aria-pressed",String(r==="player"));
c.onclick=()=>set("coach");p.onclick=()=>set("player")})();</script>
'''
bar_css = '''<style>
.nahled-bar{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;justify-content:space-between;max-width:720px;margin:8px auto 0;padding:8px max(16px,env(safe-area-inset-left,0px));border:1px dashed var(--accent);color:var(--ink);font-family:var(--f-num);font-size:12px;background:var(--bg)}
.nahled-bar b{color:var(--accent)}
.nahled-bar .nr{display:flex;gap:4px;align-items:center}
.nahled-bar button{font:inherit;padding:4px 10px;border:1px solid var(--line2);background:none;color:var(--ink);cursor:pointer}
.nahled-bar button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
</style>'''

page = title + '\n<meta name="claude:viewport-fit-sides" content="cover">\n' + links + styles + bar_css + '\n' + body.replace('<div class="wrap">', bar + '<div class="wrap">', 1)
open(out, 'w', encoding='utf-8').write(page)
print('ok', out, len(page))
