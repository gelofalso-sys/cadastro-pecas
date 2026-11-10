"""Pedido por peso (Pedido 59830): descricao sem unidade nao perde o fim ("3/4/5MM", "CORACAO");
item de lote nasce com a descricao do lote; lote fechado e dividido em itens nao aparece como "nao lancado" no relatorio."""
import os,re,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8852),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
TXT=open(os.path.join(D,"tests","dados","pedido_peso.txt"),encoding="utf-8").read()
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8852/cadastro-pecas.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"] >> nth=0');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",TXT);pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    descs=pg.eval_on_selector_all('#romWrap .rc:not(.lote) [data-rp="desc"]',"e=>e.map(x=>x.value)")
    ok("TRIO REDONDO 3/4/5MM" in descs and "3/4/5MM TRIO CORAÇÃO" in descs,"descricoes sem unidade ficam inteiras: %s"%descs[:3])
    lc=pg.locator("#romWrap .rc.lote").first
    lc.locator("[data-lotn]").fill("1");lc.locator('[data-act="lote-add"]').click();pg.wait_for_timeout(600)
    d=pg.locator('#romWrap .rc:has(.lote-tag) [data-rp="desc"]').first.input_value()
    ok("CORRENTARIA" in d.upper(),"item de lote herda a descricao do lote (%s)"%d)
    for i in range(7):
        c=pg.locator("#romWrap .rc.lote").nth(i)
        if i==0:c.locator('[data-act="lote-resto"]').click()
        else:c.locator('[data-act="lote-resto"]').click()
        pg.wait_for_timeout(300)
    pg.locator('#romWrap [data-act="rom-tipo"]',has_text="Pronta").first.click();pg.wait_for_timeout(800)
    pg.click("#romCriar");pg.wait_for_timeout(1500)
    if pg.locator('.rev [data-act="rev-ok"]').count():pg.click('.rev [data-act="rev-ok"]');pg.wait_for_timeout(2500)
    rel=pg.inner_text(".rep") if pg.locator(".rep").count() else ""
    ok("ficaram de fora" not in rel,"relatorio nao lista os lotes divididos como nao lancados")
    ok(not errs,"sem erro de pagina %s"%errs[:2])
    print("FALHAS",f)
    if f:raise SystemExit(1)
