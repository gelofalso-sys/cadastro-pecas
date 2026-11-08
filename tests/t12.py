import os,tempfile
import threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8783),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1280,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8783/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(800)
    (pg.fill("#f-I","Conjuntos"),pg.press("#f-I","Tab"));pg.wait_for_timeout(500)
    ok(pg.locator("#conjSum").count()==1,"resumo do conjunto")
    pg.fill('#conj [data-ci="0"] [data-cp="desc"]',"Brincos");pg.fill('#conj [data-ci="0"] [data-cp="peso"]',"2")
    pg.fill('#conj [data-ci="1"] [data-cp="desc"]',"Colar");pg.fill('#conj [data-ci="1"] [data-cp="peso"]',"3");pg.fill('#conj [data-ci="1"] [data-cp="custo"]',"20")
    pg.wait_for_timeout(300)
    t=pg.inner_text("#cj-e-0");print("erro linha 1:",t)
    ok("falta o custo" in t,"mostra o que falta na peça 1")
    print(pg.inner_text("#conjSum"))
    pg.scroll_into_view_if_needed if False else None
    pg.locator("#conj").scroll_into_view_if_needed();pg.screenshot(path=SC+r"\s_conj2.png")
    pg.click('#conj [data-ci="1"] [data-act="comp-up"]');pg.wait_for_timeout(300)
    ok(pg.input_value('#conj [data-ci="0"] [data-cp="desc"]')=="Colar","subir peça muda a ordem")
    for i in pg.eval_on_selector_all("[data-on]","e=>e.map(x=>x.dataset.on)"):
        if not pg.is_checked('[data-on="%s"]'%i):pg.check('[data-on="%s"]'%i)
    pg.fill("#f-F","Conj");pg.click('button:has-text("Adicionar") >> nth=0');pg.wait_for_timeout(500)
    ok(pg.locator("tr[data-l]").count()==0,"não adiciona com peça incompleta: "+pg.inner_text("#gera")[:80])
    print("erros",errs,"FALHAS",f)
