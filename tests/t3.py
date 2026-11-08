import os,tempfile
import threading,http.server,socketserver,functools,time
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8773),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL="http://127.0.0.1:8773/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1280,"height":900},accept_downloads=True);pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" and "404" not in m.text else None)
    pg.goto(URL);pg.wait_for_timeout(800)
    # undo por clique
    pg.click('[data-act="ctab"][data-id="banho"]')
    n0=pg.locator('[data-bh="0"] tr[data-bn]').count()
    for tp in ["ouro","rodio","prata"]:
        pg.click(f'[data-bh="0"] [data-act="bn-pronto"][data-tp="{tp}"]');pg.wait_for_timeout(150)
    pg.click("#tBtn");pg.wait_for_timeout(300)
    ok(pg.locator('[data-bh="0"] tr[data-bn]').count()==n0+2,"Desfazer volta só 1 banho (%d)"%pg.locator('[data-bh="0"] tr[data-bn]').count())
    # milesimos por categoria
    pg.fill('[data-bh="0"] [data-bmc="0"][data-mcat="Brincos"]',"1");pg.press('[data-bh="0"] [data-bmc="0"][data-mcat="Brincos"]',"Tab")
    pg.fill('[data-bh="0"] [data-bmc="0"][data-mcat="Colares"]',"5");pg.press('[data-bh="0"] [data-bmc="0"][data-mcat="Colares"]',"Tab");pg.wait_for_timeout(300)
    pg.screenshot(path=SC+r"\s_milcat.png")
    pg.reload();pg.wait_for_timeout(800);pg.click('[data-act="ctab"][data-id="banho"]')
    ok(pg.input_value('[data-bh="0"] [data-bmc="0"][data-mcat="Colares"]')=="5","milésimos por categoria persistem")
    # conjunto automatico
    (pg.fill("#f-I","Conjuntos"),pg.press("#f-I","Tab"));pg.wait_for_timeout(500)
    ok(pg.locator("#conj").count()>0,"categoria Conjuntos ativa a aba de conjuntos")
    pg.screenshot(path=SC+r"\s_conj.png")
    # faixa sem erro
    (pg.fill("#f-I","Anél"),pg.press("#f-I","Tab"));pg.wait_for_timeout(400)
    if pg.locator("[data-faixa]").count():
        pg.fill("[data-faixa]","12 - 14");pg.press("[data-faixa]","Enter");pg.wait_for_timeout(300)
    ok(not errs,"sem erro de console: %s"%errs)
    print("FALHAS:",f)
