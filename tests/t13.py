import os,tempfile
import threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8784),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1280,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8784/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(800)
    pg.click('[data-act="ctab"][data-id="mod"]');pg.wait_for_timeout(300)
    ok(pg.locator('.mod-chips .chipbtn').count()>=2,"chips de sistemas")
    pg.click('.mdl summary');pg.wait_for_timeout(100)
    ok(pg.locator('[data-act="mod-bling"]').count()==1,"Mais ações tem + Bling")
    pg.click('[data-act="mod-bling"]');pg.wait_for_timeout(400)
    n=pg.locator('.mod-chips .chipbtn').count();ok(n>=3,"Bling criado (%d chips)"%n)
    pg.click('.mod-chips .chipbtn >> nth=0');pg.wait_for_timeout(400)
    ok("Jueri" in pg.inner_text('.mod-chips .chipbtn.on'),"trocar de sistema pelo chip")
    pg.locator('#sec-mod, .tabp').first.scroll_into_view_if_needed();pg.screenshot(path=SC+r"\s_mod.png")
    pg.click('[data-act="ctab"][data-id="rom"]');pg.wait_for_timeout(300)
    n0=pg.locator('[data-rom="0"] .rmr').count()
    pg.click('[data-rom="0"] [data-act="rom-map-auto"]');pg.wait_for_timeout(400)
    n1=pg.locator('[data-rom="0"] .rmr').count();ok(n1>n0,"palavras criadas a partir das categorias (%d -> %d)"%(n0,n1))
    pg.screenshot(path=SC+r"\s_rom.png")
    print("erros",errs,"FALHAS",f)
