import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8804),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1400,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8804/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('nav.ir [data-sec="cat"]');pg.wait_for_timeout(400)
    # nomes dos chips de subcategoria não podem ficar cortados
    cortados=pg.evaluate("[...document.querySelectorAll('#cfg .chip .cn')].filter(e=>e.scrollWidth>e.clientWidth+1&&e.clientWidth<150).length")
    ok(cortados==0,"nomes dos chips de subcategoria visíveis (%d cortados)"%cortados)
    # insumos por categoria na aba Banhos
    pg.locator('#cfg [data-act="ctab"]').filter(has_text="Banhos").first.click();pg.wait_for_timeout(400)
    inp=pg.locator('#cfg input[data-cf="insumos"]')
    ok(inp.count()>=2,"aba Banhos tem insumos por categoria (%d linhas)"%inp.count())
    if inp.count():
        inp.nth(1).fill("3,25");inp.nth(1).dispatch_event("change");pg.wait_for_timeout(300)
        pg.locator('#cfg [data-act="ctab"]').filter(has_text="Categorias").first.click();pg.wait_for_timeout(300)
        vals=pg.eval_on_selector_all('#cfg .cards input[data-cf="insumos"]',"e=>e.map(x=>x.value)")
        ok("3,25" in vals,"o valor aparece também no cartão da categoria")
    # cores: botão Adicionar e sigla sugerida
    pg.locator('#cfg [data-act="ctab"]').filter(has_text="Cores").first.click();pg.wait_for_timeout(300)
    pg.fill('[data-enter="cor"]',"Azul Celeste");pg.click('[data-act="cor-add"]');pg.wait_for_timeout(300)
    ok(pg.locator('.cobs .chip',has_text="Azul Celeste").count()==1,"botão Adicionar cria a cor")
    pg.locator('#cfg [data-act="ctab"]').filter(has_text="Categorias").first.click();pg.wait_for_timeout(300)
    pg.locator('#cfg details.gdet summary').filter(has_text="Cor da pedra").first.click();pg.wait_for_timeout(200)
    campo=pg.locator('#cfg [data-enter="cv"]').first;campo.fill("Azul");campo.press("Enter");pg.wait_for_timeout(500)
    letras=pg.eval_on_selector_all('#cfg [data-cvf="letra"]',"e=>e.map(x=>x.value)")
    ok("AZ" in letras,"sigla da cor sugerida pelo nome: Azul → AZ (%s)"%letras[:4])
    print("erros",errs,"FALHAS",f)
    if errs:f.append("erros de página")
