import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8817),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8817/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.select_option("#f-I","Brincos");pg.wait_for_timeout(300)
    pg.click('[data-act="q"][data-q="multi"]');pg.wait_for_timeout(200)
    pg.fill("#q1","Brinco gota; 2,1; 3,60\nArgola lisa; 1,7; 3,36\nPingente coracao; 0,9; 2,00")
    pg.click('[data-act="q-salvar"]');pg.wait_for_timeout(500)
    ok(pg.locator("#multiPanel tr[data-mi]").count()==3,"Várias linhas cria 3 linhas editáveis dentro do formulário")
    ok(pg.locator("#sheet tr[data-l]").count()==0,"nada foi para a tabela ainda")
    pg.fill('#multiPanel tr[data-mi="1"] [data-mf="F"]',"Argola lisa grande");pg.dispatch_event('#multiPanel tr[data-mi="1"] [data-mf="F"]',"input")
    pg.click('#multiPanel [data-act="multi-del"] >> nth=2');pg.wait_for_timeout(300)
    ok(pg.locator("#multiPanel tr[data-mi]").count()==2,"remover uma linha")
    pg.click('#multiPanel [data-act="multi-mais"]');pg.wait_for_timeout(300)
    ok(pg.locator("#multiPanel tr[data-mi]").count()==3,"＋ Linha adiciona uma linha vazia")
    pg.click('#multiPanel [data-act="multi-del"] >> nth=2');pg.wait_for_timeout(300)
    pg.click('#multiPanel [data-act="multi-ok"]');pg.wait_for_timeout(800)
    n=pg.locator("#sheet tr[data-l]").count()
    ok(n>=2,"Adicionar leva as linhas editadas para a tabela (%d)"%n)
    ok(pg.locator("#multiPanel").count()==0,"painel some depois de adicionar")
    print("erros",errs,"FALHAS",f)
    if errs:f.append("erros de página")
