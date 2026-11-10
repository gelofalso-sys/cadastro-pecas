"""Partir um item do romaneio em partes (trio -> 3 pares): custo repartido em centavos exatos, juntar desfaz,
lancar cria uma linha por parte e a soma de compra x quantidade continua igual a do item."""
import os,re,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8853),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
TXT=open(os.path.join(D,"tests","dados","pedido_peso.txt"),encoding="utf-8").read()
def num(s):return float(str(s).replace(".","").replace(",",".")) if "," in str(s) else float(s)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1000}).new_page()
    errs=[];resp=["3"];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.on("dialog",lambda d:d.accept(resp[0]) if d.type=="prompt" else d.accept())
    pg.goto("http://127.0.0.1:8853/cadastro-pecas.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"] >> nth=0');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",TXT);pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    pg.locator('#romWrap [data-act="rom-tipo"]',has_text="Pronta").first.click();pg.wait_for_timeout(700)
    def trio():return pg.locator('#romWrap .rc:has([data-rp="cod"][value^="96"])')
    def cards(pref):return pg.eval_on_selector_all('#romWrap .rc','(es,p)=>es.map(rc=>{const g=k=>{const e=rc.querySelector(\'[data-rp="\'+k+\'"]\');return e?e.value:null};return {cod:g("cod"),desc:g("desc"),custo:g("custo"),q:g("q")}}).filter(x=>x.cod&&x.cod.startsWith(p))',pref)
    n0=pg.locator("#romWrap .rc").count()
    pg.locator('#romWrap .rc:has([data-rp="cod"][value="96"]) [data-act="rom-partir"]').click();pg.wait_for_timeout(300);pg.locator('#romWrap .rc:has([data-partn]) [data-act="rom-partir-ok"]').click();pg.wait_for_timeout(800)
    ps=cards("96")
    ok(len(ps)==3 and pg.locator("#romWrap .rc").count()==n0+2,"trio virou 3 cartoes (%s)"%[x["cod"] for x in ps])
    cs=[x["custo"] for x in ps];ok(cs==["6,52","6,52","6,51"],"custo 19,55 repartido em centavos exatos: %s"%cs)
    ok(round(sum(num(c) for c in cs),2)==19.55,"as 3 partes somam R$ 19,55")
    ok(all(x["desc"].startswith("TRIO REDONDO 3/4/5MM (") for x in ps),"descricoes %s"%[x["desc"] for x in ps])
    ok("partes somam R$ 19,55 de R$ 19,55" in pg.inner_text("#romWrap"),"cartao mostra a soma das partes contra o item")
    # juntar desfaz
    pg.locator('#romWrap .rc:has([data-rp="cod"][value="96-1"]) [data-act="rom-juntar"]').click();pg.wait_for_timeout(700)
    ps=cards("96");ok(len(ps)==1 and ps[0]["cod"]=="96" and ps[0]["custo"]=="19,55" and ps[0]["desc"]=="TRIO REDONDO 3/4/5MM","juntar volta ao item original: %s"%ps)
    # parte de novo e lanca
    pg.locator('#romWrap .rc:has([data-rp="cod"][value="96"]) [data-act="rom-partir"]').click();pg.wait_for_timeout(300);pg.locator('#romWrap .rc:has([data-partn]) [data-act="rom-partir-ok"]').click();pg.wait_for_timeout(800)
    pg.click("#romCriar");pg.wait_for_timeout(1500)
    rev=pg.inner_text(".rev")
    if pg.locator('.rev [data-act="rev-ok"]:not([disabled])').count():pg.click('.rev [data-act="rev-ok"]');pg.wait_for_timeout(2500)
    L=pg.evaluate("()=>[...document.querySelectorAll('#sheet tr[data-l]')].map(tr=>{const o={};tr.querySelectorAll('td[data-c]').forEach(t=>o[t.dataset.c]=t.innerText.trim());return o})")
    trio_l=[l for l in L if l.get("G","").startswith("96-")]
    ok(len(trio_l)==3,"3 linhas do trio na tabela (%d)"%len(trio_l))
    ok(round(sum(num(l["P"])*int(l["W"]) for l in trio_l),2)==78.20,"compra x quantidade das 3 partes = 78,20 (4 trios x 19,55)")
    ok(all(l["W"]=="4" for l in trio_l),"cada parte com a quantidade do item (4)")
    # lote nao parte
    ok(pg.locator('#romWrap .rc.lote [data-act="rom-partir"]').count()==0,"lote por peso nao oferece partir")
    ok(not errs,"sem erro de pagina %s"%errs[:2])
    print("FALHAS",f)
    if f:raise SystemExit(1)
