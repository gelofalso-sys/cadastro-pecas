import os,tempfile,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8795),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1400,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8795/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    (pg.fill("#f-I","Anel"),pg.press("#f-I","Tab"));pg.wait_for_timeout(300)
    pg.click('[data-act="cor-on"]');pg.wait_for_timeout(200)
    pg.click('[data-act="q"][data-q="cv"]');pg.fill("#q1","Azul; Lilás; Verde");pg.press("#q1","Enter");pg.wait_for_timeout(400)
    gi=pg.eval_on_selector_all("[data-gi]","e=>e.map(x=>x.dataset.gi)")
    for g in gi[3:6]:pg.eval_on_selector('[data-gi="%s"]'%g,"e=>e.click()");pg.wait_for_timeout(200)
    pg.fill("#f-F","Anel com pedra");pg.fill("#f-N","2");pg.fill("#f-P","10")
    for i in pg.eval_on_selector_all("[data-on]","e=>e.map(x=>x.dataset.on)"):
        if not pg.is_checked('[data-on="%s"]'%i):pg.check('[data-on="%s"]'%i)
    ok(pg.locator(".qmx").count()>=1,"matriz tamanho × cor aparece (%d tabelas)"%pg.locator(".qmx").count())
    ths=pg.eval_on_selector('.qmx >> nth=0','e=>[...e.querySelectorAll("thead th")].map(x=>x.textContent)');print("colunas:",ths)
    ok(ths[1:4]==["Azul","Verde","Lilás"],"colunas na ordem da biblioteca de cores")
    rows=pg.eval_on_selector('.qmx >> nth=0','e=>[...e.querySelectorAll("tbody th")].map(x=>x.textContent)');print("linhas:",rows)
    ok(len(rows)==3,"3 tamanhos nas linhas na ordem")
    pg.fill('[data-qall]:visible >> nth=0',"1");pg.wait_for_timeout(300)
    n=pg.eval_on_selector_all('.qmx input',"e=>e.filter(x=>x.value=='1').length");ok(n>=9,"'todos' preenche as combinações (%d)"%n)
    pg.locator(".qmx >> nth=0").scroll_into_view_if_needed();pg.screenshot(path=os.path.join(SC,"s_matriz.png"))
    print(pg.inner_text("#gera")[:300].replace(chr(10)," | "))
    print("erros",errs,"FALHAS",f)
