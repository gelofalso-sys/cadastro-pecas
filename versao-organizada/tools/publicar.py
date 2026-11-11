"""Gera a pasta para publicar no Netlify (versão COMPLETA, sem travas de demonstração, sem dados de exemplo).
Uso:  python tools/publicar.py [pasta_saida] [rotulo_do_cliente]
Os dados de cada pessoa ficam só no navegador dela (localStorage + IndexedDB); não há servidor.

Cada publicação recebe uma marca-d'água própria (um id), invisível na tela: só aparece para quem abrir o
código-fonte. Serve para identificar de qual cópia veio um site clonado. O registro (id, data, rótulo) fica em
marcas-dagua.csv, fora da pasta publicada e fora do Git."""
import os, re, shutil, subprocess, sys, time, random, csv, hashlib, json

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = (sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] else os.path.join(RAIZ, "publicar-netlify"))
rotulo = sys.argv[2] if len(sys.argv) > 2 else ""

subprocess.run([sys.executable, os.path.join(RAIZ, "tools", "montar.py")], check=True, capture_output=True)
s = open(os.path.join(RAIZ, "cadastro-pecas.html"), encoding="utf-8").read()
a = '(function(){\n"use strict";'
assert s.count(a) == 1

# marca-d'água: um id só desta publicação, gravado num ponto do código que o minificador não remove
# (atribuição a propriedade do window conta como efeito colateral real, então sobrevive)
wm = "%06x%04x" % (int(time.time()), random.randrange(0, 0xFFFF))
os.makedirs(os.path.dirname(os.path.join(RAIZ, "marcas-dagua.csv")), exist_ok=True)
novo = not os.path.exists(os.path.join(RAIZ, "marcas-dagua.csv"))
with open(os.path.join(RAIZ, "marcas-dagua.csv"), "a", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    if novo:
        w.writerow(["id", "quando", "rotulo", "pasta"])
    w.writerow([wm, time.strftime("%Y-%m-%d %H:%M"), rotulo, out])

# fora do claude.ai o download é um link direto; window.__wm é a marca-d'água (efeito colateral: não é removido)
s = s.replace(a, a + '''
window.__wm="%s";
const DL={save:async({filename,data})=>{const b=data instanceof Blob?data:new Blob([data]);const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}};''' % wm)

os.makedirs(out, exist_ok=True)
i = s.index('<script>\n(function(){'); j = s.index('</script>', i)
js = s[i + 8:j]
try:
    if not shutil.which("terser"): raise FileNotFoundError("terser não instalado; pacote gerado sem minificação")
    tmp = os.path.join(out, "_tmp.js"); open(tmp, "w", encoding="utf-8").write(js)
    r = subprocess.run(
        [shutil.which('terser'), tmp,
         '--compress', 'passes=3,toplevel=true,unsafe=false,drop_debugger=true',
         '--mangle', 'toplevel=true',
         '--format', 'comments=false'],
        capture_output=True, text=True, encoding='utf-8', timeout=180)
    if r.returncode == 0 and len(r.stdout) > 1000:
        s = s[:i] + '<script>' + r.stdout + s[j:]; print("minificado", len(js), "->", len(r.stdout))
    else: print("sem minificar:", r.stderr[:200])
    os.remove(tmp)
except Exception as e:
    print("sem minificar:", e)

# aviso de direitos autorais: comentário HTML, não aparece na tela, só em "ver código-fonte"
aviso = ('<!-- © Cadastro de Peças — sistema desenvolvido sob encomenda; uso e cópia não autorizados. '
         'Cópia nº %s, %s. -->\n') % (wm, time.strftime("%Y-%m-%d"))
html = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta name="robots" content="noindex,nofollow"><meta name="generator" content="' + wm + '">'
        '<title>Cadastro de Peças</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%277%27 fill=%27%23264a7a%27/%3E%3C/svg%3E"><style>html,body{margin:0}</style></head><body>\n'
        + aviso + s + '\n</body></html>\n')
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
def sha256(path):
    with open(path,"rb") as f:return hashlib.sha256(f.read()).hexdigest()
manifest={"fonte_sha256":sha256(os.path.join(RAIZ,"cadastro-pecas.html")),"artefatos":{n:sha256(os.path.join(out,n)) for n in ("index.html","_headers","lib/xlsx.full.min.js")},"gerado_em":time.strftime("%Y-%m-%d %H:%M:%S")}
with open(os.path.join(out,"manifesto-build.json"),"w",encoding="utf-8") as f:json.dump(manifest,f,ensure_ascii=False,indent=2)
print("ok", out, os.path.getsize(os.path.join(out, "index.html")), "marca-dagua", wm)
print("Confira os hashes e execute os testes no pacote antes de publicar.")
