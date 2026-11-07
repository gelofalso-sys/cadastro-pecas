import os,tempfile
import threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8791),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1400,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8791/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(800)
    pg.focus('#cfg [data-act="ctab"].on');pg.keyboard.press("ArrowRight");pg.wait_for_timeout(300)
    ok("Cores" in pg.inner_text('#cfg [data-act="ctab"].on'),"seta → troca de aba")
    ok(pg.evaluate("document.activeElement.dataset.act")=="ctab","foco fica na aba")
    pg.keyboard.press("End");pg.wait_for_timeout(300);pg.keyboard.press("Home");pg.wait_for_timeout(300)
    ok("Banhistas" in pg.inner_text('#cfg [data-act="ctab"].on'),"Home volta à primeira")
    pg.click('[data-act="ctab"][data-id="cat"]');pg.wait_for_timeout(300)
    # Tab depois de editar NCM numa categoria nao perde o foco
    pg.fill('[data-cat="0"] [data-cf="ncm"]',"71131100");pg.keyboard.press("Tab");pg.wait_for_timeout(300)
    ok(pg.evaluate("document.activeElement.tagName")!="BODY","Tab após editar NCM mantém o foco ("+pg.evaluate("document.activeElement.tagName")+")")
    # filtro: nome do arquivo
    print("erros",errs,"FALHAS",f)
