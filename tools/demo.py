import sys, os, re, subprocess
src, outdir = sys.argv[1], sys.argv[2]
doms = [d for d in (sys.argv[3] if len(sys.argv) > 3 else "").split(",") if d]
s = open(src, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:100])
    s = s.replace(a, b)

# download direto pelo navegador (sem o recurso de download do claude.ai)
rep('''(function(){
"use strict";''', '''(function(){
"use strict";
if(window.__bloq)return;
const DL={save:async({filename,data})=>{const b=data instanceof Blob?data:new Blob([data]);const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}};
const DEMO_MAX=40,DEMO_EXP=20;''')
# limites da demonstração
rep('''  else{S.lanc.push(novo);undo={tipo:"add"''', '''  else{if(S.lanc.length>=DEMO_MAX){toast("Limite da demonstração: "+DEMO_MAX+" peças. Use “Reiniciar demo” para começar de novo.");return}S.lanc.push(novo);undo={tipo:"add"''')
rep('''function saidaLinhas(g,mo){''', '''function saidaLinhas(g,mo){return saidaLinhas0(g,mo).slice(0,DEMO_EXP)}
function saidaLinhas0(g,mo){''')
rep('''<button class="btn" type="button" data-act="copiar">Copiar para o Excel</button>''',
    '''<button class="btn" type="button" data-act="demo-reset" title="Apaga tudo o que foi lançado neste navegador e volta ao início">Reiniciar demo</button><button class="btn" type="button" data-act="copiar">Copiar para o Excel</button>''')
rep('''    case "imp-ok":aplicarImp();break;''', '''    case "demo-reset":if(confirm("Apagar tudo o que foi lançado nesta demonstração neste navegador?")){try{["cadpecas4","cadpecas3","cadpecas-abertos","cadpecas-colw","cadpecas-split","cadpecas-filtro","cadpecas-vista"].forEach(k=>localStorage.removeItem(k))}catch(x){}location.reload()}break;
    case "imp-ok":aplicarImp();break;''')
rep('''setStatus("Salvando neste navegador");return}''', '''setStatus("Demonstração · salva só neste navegador");return}''')
rep('''<title>Cadastro de Peças</title>''', '')
rep('if(!Array.isArray(o.lanc))erro("o backup não tem a lista de peças");','if(!Array.isArray(o.lanc))erro("o backup não tem a lista de peças");if(o.lanc.length>DEMO_MAX)erro("a demonstração aceita no máximo "+DEMO_MAX+" peças");')
rep('''<div class="app" id="app" role="main">''', '''<div class="demo-tag" role="note">DEMONSTRAÇÃO · dados fictícios ficam só neste navegador · exporta até 20 linhas · cópia não autorizada</div>
<div class="app" id="app" role="main">''')
rep('@media (prefers-reduced-motion:reduce)', '.demo-tag{flex:none;text-align:center;font-size:11px;letter-spacing:.03em;padding:3px 8px;background:var(--accent);color:var(--accent-ink)}\n@media (prefers-reduced-motion:reduce)')

doms_js = ",".join('"%s"' % d for d in doms)
guard = '''<script>
(function(){var D=[%s,"localhost","127.0.0.1"],h=location.hostname,ok=%s||location.protocol==="file:"||D.some(function(d){return h===d||h.slice(-d.length-1)==="."+d});
if(window.top!==window.self)ok=false;
if(!ok){window.__bloq=true;document.addEventListener("DOMContentLoaded",function(){document.body.innerHTML='<p style="font:16px sans-serif;padding:40px;max-width:520px;margin:auto">Esta demonstração só funciona no endereço oficial.</p>'})}
document.addEventListener("contextmenu",function(e){if(!/INPUT|TEXTAREA/.test(e.target.tagName))e.preventDefault()});
})();
</script>''' % (doms_js, "false" if doms else "true")

# minifica o script principal (se o terser estiver disponível)
i = s.index('<script>\n(function(){')
j = s.index('</script>', i)
js = s[i+len('<script>'):j]
try:
    tmp = os.path.join(outdir, '_tmp.js'); os.makedirs(outdir, exist_ok=True)
    open(tmp, 'w', encoding='utf-8').write(js)
    r = subprocess.run(['npx.cmd' if os.name=='nt' else 'npx','--yes','terser',tmp,'--compress','--mangle'], capture_output=True, text=True, encoding='utf-8', timeout=180)
    if r.returncode == 0 and len(r.stdout) > 1000:
        s = s[:i] + '<script>' + r.stdout + s[j:]; print('minificado', len(js), '->', len(r.stdout))
    else: print('sem minificar:', r.stderr[:200])
    os.remove(tmp)
except Exception as e:
    print('sem minificar:', e)

html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow,noarchive"><title>Cadastro de Peças · demo</title><style>html,body{margin:0}</style>' + guard + '</head><body>\n' + s + '\n</body></html>'
open(os.path.join(outdir, 'index.html'), 'w', encoding='utf-8').write(html)
open(os.path.join(outdir, '_headers'), 'w', encoding='utf-8').write('''/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://i.ibb.co; connect-src 'self' https://cdnjs.cloudflare.com https://api.imgbb.com; worker-src blob: https://cdnjs.cloudflare.com; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; object-src 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  X-Robots-Tag: noindex, nofollow, noarchive
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: no-cache
''')
open(os.path.join(outdir, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
print('ok', os.path.getsize(os.path.join(outdir, 'index.html')))
