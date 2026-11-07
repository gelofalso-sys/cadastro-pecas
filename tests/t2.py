import os,tempfile
import threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8772),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL="http://127.0.0.1:8772/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
def nomes(pg,sel):return pg.eval_on_selector_all(sel,"e=>e.map(x=>x.textContent)")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1280,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(800)
    pg.click('[data-act="ctab"][data-id="cat"]');pg.wait_for_timeout(300)
    n0=nomes(pg,'[data-cat="2"] .chip .cn')
    pg.click('[data-cat="2"] .chip .cn >> nth=0');pg.fill('[data-subren]',"EscTeste");pg.press('[data-subren]',"Escape");pg.wait_for_timeout(300)
    ok(nomes(pg,'[data-cat="2"] .chip .cn')==n0,"Esc cancela a renomeação")
    # clicar em outro botao durante renomear
    pg.click('[data-cat="2"] .chip .cn >> nth=0');pg.fill('[data-subren]',"Nome Novo")
    k0=len(n0);pg.click('[data-cat="2"] .chip [data-act="sub-del"] >> nth=1');pg.wait_for_timeout(1200)
    n1=nomes(pg,'[data-cat="2"] .chip .cn');ok(len(n1)==k0-1 and "Nome Novo" in n1,"clique em × durante renomear não se perde: %s"%n1)
    # modelo sem duplicar quase-iguais
    pg.click('.mdl summary');pg.click('[data-act="modelo-add"][data-m="brincos"]');pg.wait_for_timeout(300)
    n2=nomes(pg,'[data-cat="2"] .chip .cn');print(n2)
    ok(not("Argola" in n2 and "Argolas" in n2),"modelo não duplica Argola/Argolas")
    # XSS resumo
    pg.click('[data-act="ctab"][data-id="banho"]');pg.fill('[data-bh="0"] [data-bn="0"] [data-bnf="nome"]','"><img src=x onerror=window.__x=1>');pg.wait_for_timeout(300)
    pg.click('[data-act="ctab"][data-id="cat"]');pg.wait_for_timeout(300)
    ok(pg.evaluate("window.__x")is None,"sem XSS no resumo")
    ok(pg.is_disabled('[data-cat="0"] [data-act="cat-up"]'),"seta ↑ desabilitada na 1ª")
    print("erros:",errs)
print("FALHAS:",f)
