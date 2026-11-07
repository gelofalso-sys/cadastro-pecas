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
    nomes=pg.eval_on_selector_all('#cfg [data-lcf="nome"]',"e=>e.map(x=>x.value)")
    ok("Azul Celeste" in nomes,"botão Adicionar cria a cor na biblioteca")
    i=nomes.index("Azul Celeste");campo=pg.locator('#cfg [data-lcf="nome"]').nth(i);campo.fill("Azul Marinho");campo.press("Tab");pg.wait_for_timeout(400)
    nomes=pg.eval_on_selector_all('#cfg [data-lcf="nome"]',"e=>e.map(x=>x.value)")
    ok("Azul Marinho" in nomes and "Azul Celeste" not in nomes,"renomear a cor na biblioteca")
    pg.locator('#cfg [data-act="ctab"]').filter(has_text="Categorias").first.click();pg.wait_for_timeout(300)
    pg.locator('#cfg [data-act="ctab"]').filter(has_text="Cores").first.click();pg.wait_for_timeout(300)
    sig=pg.eval_on_selector_all('#cfg [data-lcf="sig"]',"e=>e.map(x=>x.placeholder||x.value)")
    ok("AZ" in sig,"sigla da cor sugerida pelo nome: Azul → AZ (%s)"%sig[:8])
    ok(pg.locator('#cfg [data-act="lib-grade-add"]').count()==1,"aba tem ＋ Nova variação")
    print("erros",errs,"FALHAS",f)
    if errs:f.append("erros de página")
