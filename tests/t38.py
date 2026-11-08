import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8823),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8823/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
CFG="()=>JSON.parse(localStorage.getItem('cadpecas4')).config"
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1400,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(900)
    ok(pg.evaluate("()=>['f-H','f-I','f-J'].map(i=>document.getElementById(i)&&document.getElementById(i).tagName)")==["INPUT","INPUT","INPUT"],"fornecedor, categoria e subcategoria são campos de escrita com lista")
    ok(pg.evaluate("()=>document.getElementById('f-I').getAttribute('list')")=="dl-I" and pg.evaluate("()=>document.querySelectorAll('#dl-I option').length")>2,"a lista de categorias cadastradas está ligada ao campo")
    # escolher categoria da lista (digitando um nome existente)
    ex=pg.evaluate("()=>[...document.querySelectorAll('#dl-I option')].map(o=>o.value).filter(v=>v!==document.getElementById('f-I').value)[0]")
    pg.fill("#f-I",ex);pg.press("#f-I","Tab");pg.wait_for_timeout(400)
    ok(pg.input_value("#f-I")==ex,"categoria existente é aceita (%s)"%pg.input_value("#f-I"))
    # categoria inexistente: abre o cadastro rápido com o nome
    pg.fill("#f-I","Chaveiros");pg.press("#f-I","Tab");pg.wait_for_timeout(500)
    ok(pg.locator("#q1").count()==1 and pg.input_value("#q1")=="Chaveiros","categoria nova abre o cadastro rápido já com o nome")
    ok(pg.input_value("#f-I")!="Chaveiros","o campo não fica com categoria não cadastrada (%s)"%pg.input_value("#f-I"))
    pg.fill("#q2","CV");pg.fill("#q3","0");pg.click('[data-act="q-salvar"]');pg.wait_for_timeout(900)
    ok(pg.input_value("#f-I")=="Chaveiros","depois de cadastrar, a categoria nova fica escolhida")
    # fornecedor e subcategoria livres entram no cadastro ao adicionar
    pg.fill("#f-H","Fornecedor Livre XYZ");pg.press("#f-H","Tab");pg.wait_for_timeout(300)
    pg.fill("#f-J","Sub Livre ABC");pg.press("#f-J","Tab");pg.wait_for_timeout(300)
    pg.fill("#f-F","Chaveiro teste");pg.fill("#f-N","2");pg.fill("#f-P","3")
    pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(1500)
    c=pg.evaluate(CFG)
    ok(any(x["nome"]=="Fornecedor Livre XYZ" for x in c["fornecedores"]),"fornecedor digitado entrou no cadastro ao adicionar a peça")
    ok(any("Sub Livre ABC" in (x.get("subs") or []) for x in c["categorias"] if x["nome"]=="Chaveiros"),"subcategoria digitada entrou no cadastro da categoria")
    ok(not errs,"sem erro de página %s"%errs[:2])
    print("FALHAS",f)
    if f:raise SystemExit(1)
