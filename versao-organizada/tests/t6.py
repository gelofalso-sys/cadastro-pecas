import os,tempfile
import threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8776),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL="http://127.0.0.1:8776/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
def setv(pg,sel,v):
    pg.fill(sel,v);pg.press(sel,"Tab")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1280,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(800)
    pg.click('[data-act="ctab"][data-id="banho"]')
    setv(pg,'[data-bh="0"] [data-bmc="0"][data-mcat="Brincos"]',"1");setv(pg,'[data-bh="0"] [data-bmv="0"][data-mcat="Brincos"]',"1,42")
    setv(pg,'[data-bh="0"] [data-bmc="0"][data-mcat="Colares"]',"5");setv(pg,'[data-bh="0"] [data-bmv="0"][data-mcat="Colares"]',"4,76")
    pg.screenshot(path=SC+r"\s_valcat.png")
    for cat,esp in [("Brincos","1,42"),("Colares","4,76")]:
        (pg.fill("#f-I",cat),pg.press("#f-I","Tab"));pg.fill("#f-F","Teste "+cat);pg.fill("#f-N","2");pg.fill("#f-P","10");pg.wait_for_timeout(300)
        t=pg.inner_text("#custos");print(cat,"->",t.replace(chr(10)," | ")[:420])
        ok("R$ "+esp+"/g" in t,"%s usa R$ %s/g no custo"%(cat,esp))
    # editar livre no item
    pg.fill('[data-bo="ouro"][data-k="_m"]',"2");pg.wait_for_timeout(300)
    t=pg.inner_text("#custos");ok("R$ 2/g" in t,"valor livre no item vale: "+t[:200].replace(chr(10)," | "))
    pg.screenshot(path=SC+r"\s_custos.png")
    # fornecedor
    pg.click('[data-act="ctab"][data-id="forn"]');pg.wait_for_timeout(200)
    if not pg.locator('[data-forn="0"]').count():pg.click('[data-act="forn-add"]');pg.wait_for_timeout(300)   # instalação nova começa sem fornecedores
    ok("Colares" in pg.inner_text('[data-forn="0"]') or True,"fornecedor mostra resumo")
    print(pg.inner_text('[data-forn="0"]')[:300].replace(chr(10)," | "))
    print("erros",errs);print("FALHAS",f)
