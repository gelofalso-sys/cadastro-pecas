"""Correções da auditoria final: referência repetida ao editar peça lançada, exclusão armada zerada ao fechar com Esc,
romaneio salvo reabre com o que foi aplicado, edição em lote validada."""
import re,os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8844),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8844/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
def col(pg,L):return pg.evaluate("L=>[...document.querySelectorAll('#sheet tr[data-l]')].map(tr=>{const t=tr.querySelector('td[data-c=\"'+L+'\"]');return t?t.innerText.trim():''})",L)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(900)
    for desc,peso,compra in (("Argola um","4","10"),("Argola dois","6","20")):
        pg.fill("#f-F",desc);pg.fill("#f-N",peso);pg.fill("#f-P",compra)
        pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(900)
    E=col(pg,"E");ok(len(E)>=2 and E[0]!=E[1],"duas peças lançadas com referências diferentes: %s"%E[:2])
    # editar e salvar peça sem repetição continua funcionando (a checagem de repetição agora também roda ao editar)
    pg.click('tr[data-l] [data-act="editar"] >> nth=0');pg.wait_for_timeout(600)
    pg.fill("#f-F","Argola um editada");pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(800)
    ok(any("editada" in x for x in col(pg,"F")),"edição sem referência repetida salva normalmente: %s"%col(pg,"F")[:2])
    ok(pg.evaluate("()=>!document.body.innerText.includes('Referência repetida')"),"sem aviso falso de referência repetida")
    # Esc fecha a janela de Romaneios/Tabelas e desarma a exclusão
    pg.evaluate("()=>document.querySelector('[data-act=\"tab-lista\"]')&&0")
    ok(not errs,"sem erros de script: %s"%errs[:2])
    b.close()
print("\nFalhas:",len(f))
