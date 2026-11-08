import os,tempfile
import threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8786),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1280,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8786/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(800)
    (pg.fill("#f-I","Colares"),pg.press("#f-I","Tab"));pg.wait_for_timeout(300)
    pg.click('[data-act="cor-on"]');pg.wait_for_timeout(200)
    ok(pg.locator('[data-act="q"][data-q="cv"]').count()==1,"botão ＋ cor aparece mesmo sem cores")
    pg.click('[data-act="q"][data-q="cv"]');pg.wait_for_timeout(200)
    pg.fill("#q1","Dourado; Rosé");pg.press("#q1","Enter");pg.wait_for_timeout(400)
    ok(pg.locator("[data-cs]").count()>=2 and pg.locator("[data-cs]:checked").count()==2,"cores criadas e já marcadas")
    pg.click('[data-act="q"][data-q="cv"]');pg.fill("#q1","Preto");pg.fill("#q2","P");pg.press("#q1","Enter");pg.wait_for_timeout(400)
    ok(pg.locator("[data-cs]:checked").count()==3,"terceira cor adicionada")
    pg.fill("#f-F","Colar teste");pg.fill("#f-N","3");pg.fill("#f-P","5")
    for i in pg.eval_on_selector_all("[data-on]","e=>e.map(x=>x.dataset.on)"):
        if not pg.is_checked('[data-on="%s"]'%i):pg.check('[data-on="%s"]'%i)
    ids=pg.eval_on_selector_all('[id^="f-"][id$="-W"]',"e=>e.map(x=>x.id)");print(len(ids),"campos de quantidade")
    ok(len(ids)==6,"quantidade por banho x cor (2x3=6)")
    pg.locator(".z-var >> nth=-1").scroll_into_view_if_needed();pg.screenshot(path=SC+r"\s_corbtn.png")
    print("erros",errs,"FALHAS",f)
