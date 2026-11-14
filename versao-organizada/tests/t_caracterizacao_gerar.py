"""Caracterização de `gerar` com o backup real (rede de segurança da extração para src/core).
Carrega o app com CP_BACKUP, captura as linhas que o app gera por peça de `lanc` (gerar/saidaLinhas/
pesoLinha/calcBanho) em %TEMP%/cp_golden_linhas.json e roda o teste Node, que compara o NÚCLEO com isso.
Sem CP_BACKUP: imprime PULADO e sai 0 (run_all.py conta como teste pulado)."""
import os,tempfile,subprocess,shutil,sys
import threading,http.server,socketserver,functools,json
try:sys.stdout.reconfigure(encoding='utf-8',errors='replace')
except Exception:pass
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.environ.get("CP_BACKUP") or not os.path.exists(os.environ["CP_BACKUP"]):
    print("PULADO: defina CP_BACKUP com o caminho de um backup .json real para este teste");raise SystemExit(0)
from playwright.sync_api import sync_playwright
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8790),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
bk=json.load(open(os.environ["CP_BACKUP"],encoding="utf-8"))
dados=json.dumps({"config":bk["config"],"lanc":bk["lanc"],"form":bk["form"],"edit":None,"rasc":None})
# o app roda dentro de uma função anônima: uma cópia do HTML expõe as funções internas em window.__cp
html=open(os.path.join(D,"Cadastro de Pecas - abrir no Chrome.html"),encoding="utf-8").read();i=html.rindex("})();")
TMP=os.path.join(D,"_cp_caracterizacao_tmp.html")
open(TMP,"w",encoding="utf-8").write(html[:i]+"window.__cp={S:()=>S,gerar,saidaLinhas,pesoLinha,calcBanho};"+chr(10)+html[i:])
URL="http://127.0.0.1:8790/_cp_caracterizacao_tmp.html"
GOLDEN=os.path.join(tempfile.gettempdir(),"cp_golden_linhas.json")
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
JS="""()=>{
  const A=window.__cp,S=A.S(),{gerar,saidaLinhas,pesoLinha,calcBanho}=A,g=gerar(S.lanc),por={},der=[];
  g.linhas.forEach((r,i)=>{(por[r.lancId]=por[r.lancId]||[]).push(r);
    der.push({peso:pesoLinha(r),banho:r.banho?calcBanho(r,r.banho.coluna,i+2):null,verniz:r.banho?calcBanho(r,"U",i+2):null})});
  const sl=m=>saidaLinhas(g,m).map(e=>({t:e.t,pai:e.pai||null,attrs:e.attrs||null,row:e.row}));
  return JSON.stringify({pecas:por,linhas:g.linhas,derivados:der,saida_normal:sl(null),saida_pai:sl({agrupar:"sim"}),estado:{config:S.config,lanc:S.lanc,form:S.form}})}"""
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1500,"height":1000});pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.on("dialog",lambda d:d.dismiss())
    pg.goto(URL);pg.evaluate("v=>localStorage.setItem('cadpecas4',v)",dados);pg.reload();pg.wait_for_timeout(1800)
    try:cap=json.loads(pg.evaluate(JS))
    finally:
        b.close()
        try:os.remove(TMP)
        except OSError:pass
ok(not errs,"sem erros de página: %s"%errs[:1])
pecas=cap["pecas"];nl=sum(len(v) for v in pecas.values())
ok(len(pecas)>0 and nl>0,"o app gerou %d peças e %d linhas"%(len(pecas),nl))
semlinha=[l["id"] for l in bk["lanc"] if l and l.get("id") not in pecas]
print("peças do backup sem linhas geradas:",len(semlinha))
# {id_da_peca: linhas} na chave "pecas"; o restante são derivados que o núcleo também deve reproduzir
json.dump(cap,open(GOLDEN,"w",encoding="utf-8"))
print("golden gravado em",GOLDEN)
node=shutil.which("node")
ok(bool(node),"node disponível")
if node:
    r=subprocess.run([node,"--test","tests/unit/caracterizacao_gerar.test.mjs"],cwd=D,capture_output=True,text=True,encoding="utf-8",errors="replace",env={**os.environ,"CP_GOLDEN":GOLDEN})
    print((r.stdout or "")[-3000:]+(r.stderr or "")[-1500:])
    ok(r.returncode==0,"teste Node de caracterização (núcleo x app)")
if f:sys.exit(1)
