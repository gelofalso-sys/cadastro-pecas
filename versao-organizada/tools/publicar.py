"""Gera a pasta para publicar no Netlify (versão COMPLETA, sem travas de demonstração, sem dados de exemplo).
Uso:  python tools/publicar.py [pasta_saida]     (padrão: publicar-netlify/)
Os dados de cada pessoa ficam só no navegador dela (localStorage + IndexedDB); não há servidor."""
import os, subprocess, sys, shutil
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, "publicar-netlify")
subprocess.run([sys.executable, os.path.join(RAIZ, "tools", "montar.py")], check=True, capture_output=True)
s = open(os.path.join(RAIZ, "cadastro-pecas.html"), encoding="utf-8").read()
a = '(function(){\n"use strict";'
assert s.count(a) == 1
# fora do claude.ai o download é um link direto
s = s.replace(a, a + '''
const DL={save:async({filename,data})=>{const b=data instanceof Blob?data:new Blob([data]);const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}};''')
os.makedirs(out, exist_ok=True)
i = s.index('<script>\n(function(){'); j = s.index('</script>', i)
js = s[i + 8:j]
try:
    tmp = os.path.join(out, "_tmp.js"); open(tmp, "w", encoding="utf-8").write(js)
    r = subprocess.run(['npx.cmd' if os.name == 'nt' else 'npx', '--yes', 'terser', tmp, '--compress', '--mangle'], capture_output=True, text=True, encoding='utf-8', timeout=180)
    if r.returncode == 0 and len(r.stdout) > 1000:
        s = s[:i] + '<script>' + r.stdout + s[j:]; print("minificado", len(js), "->", len(r.stdout))
    else: print("sem minificar:", r.stderr[:200])
    os.remove(tmp)
except Exception as e:
    print("sem minificar:", e)
html = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta name="robots" content="noindex,nofollow"><title>Cadastro de Peças</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%277%27 fill=%27%23264a7a%27/%3E%3C/svg%3E"><style>html,body{margin:0}</style></head><body>\n' + s + '\n</body></html>\n')
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(html)
os.makedirs(os.path.join(out, "lib"), exist_ok=True)
shutil.copy(os.path.join(RAIZ, "lib", "xlsx.full.min.js"), os.path.join(out, "lib", "xlsx.full.min.js"))
open(os.path.join(out, "_headers"), "w", encoding="utf-8").write('''/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://i.ibb.co; connect-src 'self' https://cdnjs.cloudflare.com https://api.imgbb.com; worker-src blob: https://cdnjs.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: no-cache
''')
open(os.path.join(out, "LEIA-ME.txt"), "w", encoding="utf-8").write('''CADASTRO DE PECAS - versao para publicar

Como publicar: abra https://app.netlify.com/drop e arraste ESTA PASTA inteira.
Para atualizar depois: gere de novo (python tools/publicar.py) e arraste de novo no mesmo site (Deploys > arraste aqui).

Como funciona: cada pessoa tem os proprios dados, guardados no navegador dela (neste aparelho). Nao ha servidor nem conta.
- Outro aparelho/navegador abre vazio.
- Limpar dados do navegador ou usar aba anonima apaga tudo.
- Por isso: baixar o "Backup completo" (Cadastros > Importar e copia) com frequencia. O app lembra apos 7 dias sem backup.
''')
print("ok", out, os.path.getsize(os.path.join(out, "index.html")))
