import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8813),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
TXT=open(os.path.join(D,"tests","dados","pedido_peso.txt"),encoding="utf-8").read()
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8813/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"] >> nth=0');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",TXT);pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    lotes=pg.locator("#romWrap .rc.lote").count();todos=pg.locator("#romWrap .rc").count()
    ok(lotes==7,"7 lotes por peso (GR) reconhecidos (%d)"%lotes)
    ok(todos==15,"15 itens do pedido lidos (%d)"%todos)
    ok("confere" in pg.inner_text("#romWrap"),"valor total do pedido confere (3.031,62)")
    hd=pg.locator("#romWrap .rc.lote .lote-h").first.inner_text()
    ok("81,440 g" in hd and "14,7" in hd,"lote mostra peso e valor da grama (%s)"%hd.replace("\n"," ")[:90])
    # expande o lote 1 em itens reais
    c=pg.locator("#romWrap .rc.lote").first
    c.locator("[data-lotn]").fill("2");c.locator('[data-act="lote-add"]').click();pg.wait_for_timeout(600)
    kids=pg.locator("#romWrap .rc .lote-tag").count()
    ok(kids==2,"lote expandido em 2 itens (%d)"%kids)
    pesos=pg.locator('#romWrap .rc:has(.lote-tag) [data-rp="peso"]')
    pesos.nth(0).fill("40,5");pesos.nth(0).dispatch_event("input");pg.wait_for_timeout(200)
    custo=pg.locator('#romWrap .rc:has(.lote-tag) [data-rp="custo"]').nth(0).input_value()
    ok(custo=="595,35","custo do item = peso × valor da grama (%s)"%custo)
    ok("faltam" in pg.locator("#romWrap .rc.lote .lote-sum").first.inner_text(),"resumo avisa o peso que falta")
    pesos.nth(1).fill("40,94");pesos.nth(1).dispatch_event("input");pg.wait_for_timeout(300)
    ok(pg.locator("#romWrap .rc.lote .lote-sum.ok").count()>=1,"soma dos pesos fecha com o lote")
    # criar não cria o lote em si, só os itens
    print("erros",errs,"FALHAS",f)
    if errs:f.append("erros de página")
