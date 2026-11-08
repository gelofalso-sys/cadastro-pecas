import os,tempfile
import threading,http.server,socketserver,functools,json
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8779),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL="http://127.0.0.1:8779/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1280,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(800)
    pg.fill("#f-F","Teste id");pg.fill("#f-N","2");pg.fill("#f-P","10")
    for i in pg.eval_on_selector_all("[data-on]","e=>e.map(x=>x.dataset.on)"):
        if not pg.is_checked('[data-on="%s"]'%i):pg.check('[data-on="%s"]'%i)
    for i in pg.eval_on_selector_all('[id^="f-"][id$="-W"]',"e=>e.map(x=>x.id)"):pg.fill('[id="%s"]'%i,"1")
    pg.click('button:has-text("Adicionar") >> nth=0');pg.wait_for_timeout(800)
    d=json.loads(pg.evaluate("localStorage.getItem('cadpecas4')"))
    d["lanc"][0]["id"]='x" onmouseover="window.__x=1" data-zz="'
    d["config"]["banhistas"][0]["banhos"][0]["id"]='o" onfocus="window.__y=1'
    pg.evaluate("v=>localStorage.setItem('cadpecas4',v)",json.dumps(d))
    pg.reload();pg.wait_for_timeout(1200)
    n=pg.evaluate("document.querySelectorAll('[onmouseover],[onfocus],[data-zz]').length")
    print(pg.evaluate("[...document.querySelectorAll('[onmouseover],[onfocus],[data-zz]')].map(e=>e.outerHTML.slice(0,160))"))
    ok(n==0,"IDs maliciosos não viram atributos (%d)"%n)
    ok(pg.locator("tr[data-l]").count()>=1,"peça continua na tabela")
    print("erros",errs,"FALHAS",f)
