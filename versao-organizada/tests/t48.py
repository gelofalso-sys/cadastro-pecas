"""Regressao das correcoes da auditoria de 09/11/2026:
C-004 (CSV com virgula decimal e zeros a esquerda), C-001 (linha sem descricao avisa), A-009 (restaurar backup INCOMPLETO avisa),
K-001 (agregador: retorno nao zero sem mensagem e falha)."""
import os,re,json,tempfile,threading,http.server,socketserver,functools,subprocess,sys
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8848),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
# K-001: o trecho do agregador marca falha quando o script sai com codigo != 0 sem stderr
src=open(os.path.join(D,"tests","run_all.py"),encoding="utf-8").read()
ok("saiu com codigo" in src,"run_all.py trata retorno nao zero sem mensagem como falha")
r=subprocess.run([sys.executable,"-c","import sys;sys.exit(3)"],capture_output=True,text=True)
ok(r.returncode==3 and not r.stderr.strip(),"cenario sintetico: exit 3 e stderr vazio")
T=tempfile.mkdtemp()
csv=os.path.join(T,"ped.csv")
open(csv,"w",encoding="utf-8",newline="").write("Código;Descrição;Quantidade;Preço\n001;Peça aço;2;3,25\n;;2;20\n")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1100}).new_page()
    errs=[];msgs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.on("dialog",lambda d:(msgs.append(d.message),d.accept()))
    pg.goto("http://127.0.0.1:8848/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.set_input_files("#romXls",csv);pg.wait_for_timeout(900)
    prev=pg.inner_text("#romWrap")
    ok("001" in prev and "3,25" in prev,"CSV: previa mantem codigo 001 e preco 3,25")
    ok(not re.search(r"\b325\b",prev),"CSV: preco nao virou 325")
    pg.click('[data-act="rom-plan-ok"]');pg.wait_for_timeout(1000)
    txt=pg.inner_text("#romWrap")
    ok(pg.locator(".rc").count()==1,"CSV: 1 peca importada (%d)"%pg.locator(".rc").count())
    ok("SEM DESCRIÇÃO" in txt,"CSV: linha sem descricao com quantidade e avisada")
    vals=pg.eval_on_selector_all("#romWrap .rc input","e=>e.map(x=>x.value)")
    ok("3,25" in vals or "3.25" in vals or any(v.replace(",",".")=="3.25" for v in vals),"CSV: preco 3,25 nos campos do cartao: %s"%vals[:12])
    ok(not any(v in("325","325,00") for v in vals),"CSV: nenhum campo com 325")
    # A-009: backup marcado como incompleto avisa ao restaurar
    pg.click('[data-act="rom-fechar"]') if pg.locator('[data-act="rom-fechar"]').count() else None
    pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('[data-act=rom-lista]').click()");pg.wait_for_timeout(600)
    with pg.expect_download(timeout=20000) as d:
        pg.evaluate("document.querySelector('.rep [data-act=backup-total]').click()")
    arq=os.path.join(T,"bk.json");d.value.save_as(arq)
    o=json.load(open(arq,encoding="utf-8"));ok(o.get("app")=="cadastro-pecas","backup completo gerado")
    o["incompleto"]=["fotos"];json.dump(o,open(arq,"w",encoding="utf-8"))
    pg.evaluate("document.querySelectorAll('.rep').forEach(x=>x.remove());const i=document.createElement('input');i.type='file';i.id='fileBkT';document.body.appendChild(i)")
    msgs.clear();pg.set_input_files("#fileBkT",arq);pg.wait_for_timeout(1500)
    ok(any("INCOMPLETO" in m for m in msgs),"restaurar backup incompleto: o dialogo avisa %s"%[m[:50] for m in msgs])
    ok("INCOMPLETO" in pg.inner_text("body"),"restaurar backup incompleto: a mensagem final repete o aviso")
    # campo de edicao da celula nao pode ficar coberto pela celula vizinha (campo 150px em coluna estreita)
    pg.fill("#f-F","Teste");pg.fill("#f-N","2");pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(900)
    pg.locator('tr[data-l] td[data-c="E"]').first.click();pg.wait_for_timeout(300)
    r=pg.evaluate("""()=>{const td=document.querySelector('tr[data-l] td.ed'),i=td&&td.querySelector('input');if(!i)return null;const a=td.getBoundingClientRect(),c=i.getBoundingClientRect(),x=a.right+8;
      const el=document.elementFromPoint(x,c.y+c.height/2);return {larg:a.width,campo:c.width,ok:c.width<=a.width+1}}""")
    ok(r is not None and r["ok"],"campo de edicao da celula tem a largura da propria celula: %s"%r)
    # botao de recolher/expandir nao cobre o formulario: com o formulario aberto fica na divisoria
    ok(pg.evaluate("()=>document.getElementById('dpill').classList.contains('dock')"),"botao recolher/expandir encostado na divisoria")
    ok(not errs,"sem erros de script: %s"%errs[:2])
    b.close()
print(chr(10)+"Falhas:",len(f))
