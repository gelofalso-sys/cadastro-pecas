import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8820),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8820/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1500,"height":1000},accept_downloads=True);pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(800)
    for nome in ("Argola A","Argola B"):
        (pg.fill("#f-I","Brincos"),pg.press("#f-I","Tab"));pg.fill("#f-F",nome);pg.fill("#f-N","2");pg.fill("#f-P","3")
        pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(500)
    n0=pg.locator("#sheet tr[data-l]").count();ok(n0>=2,"peças lançadas (%d linhas)"%n0)
    with pg.expect_download(timeout=15000):
        pg.evaluate("()=>document.querySelector('[data-act=\"xlsx\"]').click()");pg.wait_for_timeout(700)
        if pg.locator('[data-act="exp-assim"]').count():pg.evaluate("()=>document.querySelector('[data-act=\"exp-assim\"]').click()")
    pg.wait_for_timeout(600)
    ok(pg.locator('[data-act="exp-limpar"]').count()==1,"banner gravar e limpar aparece")
    pg.evaluate("()=>document.querySelector('#sheet tr[data-l] [data-act=\"editar\"]').click()");pg.wait_for_timeout(500)
    pg.fill("#f-F","Argola A EDITADA depois");pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(600)
    ok(pg.locator('[data-act="exp-limpar"]').count()==1,"banner continua depois da edição")
    pg.evaluate("()=>document.querySelector('[data-act=\"exp-limpar\"]').click()");pg.wait_for_timeout(700)
    n1=pg.locator("#sheet tr[data-l]").count()
    ok(0<n1<n0,"gravar e limpar mantém a peça editada depois da exportação (%d de %d linhas)"%(n1,n0))
    # cadastro rápido: categoria com nome já usado como subcategoria é recusada
    pg.click('[data-act="q"][data-q="cat"]');pg.wait_for_timeout(200)
    pg.fill("#q1","Brincos");pg.fill("#q2","ZZ");pg.fill("#q3","1")
    pg.click('[data-act="q-salvar"]');pg.wait_for_timeout(800)
    pref=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config.categorias.find(c=>c.nome==='Brincos').prefixo")
    seqz=pg.evaluate("()=>'ZZ' in JSON.parse(localStorage.getItem('cadpecas4')).config.seqs")
    ok(pref!="ZZ" and not seqz,"categoria existente no cadastro rápido não troca prefixo nem cria contador novo (%s)"%pref)
    ok(not errs,"sem erro de página %s"%errs[:2])
    if errs:f.append("erros")
    print('seqs',pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config.seqs"));print("FALHAS",f)
