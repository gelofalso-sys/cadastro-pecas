import os,tempfile,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8794),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1500,"height":1000});pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8794/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    ok(pg.locator('header [data-act="rom-lista"], [data-act="rom-lista"]').count()>=1,"botão Romaneios lançados está no topo")
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read());pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    for i in range(pg.locator('#romWrap [data-rp="peso"]').count()):pg.locator('#romWrap [data-rp="peso"]').nth(i).fill("2")
    pg.click('[data-act="rom-div-todas"]');pg.wait_for_timeout(400)
    pg.click('#romCriar');pg.wait_for_timeout(700)
    if pg.locator('[data-act="rev-ok"]').count():pg.click('[data-act="rev-ok"]');pg.wait_for_timeout(1500)
    n1=pg.locator("tr[data-l]").count();print("linhas criadas:",n1)
    ok(n1>0,"romaneio lançado criou peças")
    for _ in range(3):
        for sel in ('[data-act="rel-fechar"]','[data-act="rev-fechar"]'):
            if pg.locator(sel).count():pg.locator(sel).first.click();pg.wait_for_timeout(300)
    pg.click('[data-act="rom-fechar"]') if pg.locator('[data-act="rom-fechar"]').count() else None;pg.wait_for_timeout(500)
    pg.evaluate("document.querySelector('[data-act=rom-lista]').click()");pg.wait_for_timeout(600)
    ok(pg.locator('.rep [data-act="rom-salvo-abrir"]').count()>=1,"lista mostra o romaneio lançado")
    pg.locator('.rep [data-act="rom-salvo-abrir"]').first.click();pg.wait_for_timeout(1200)
    ok(pg.locator('[data-act="rom-refazer-todas"]').count()==1,"botão Editar todas as já lançadas aparece")
    pg.click('[data-act="rom-refazer-todas"]');pg.wait_for_timeout(500)
    ok(pg.locator('#romWrap .rc:not(.sk)').count()>0,"peças liberadas para edição")
    for i in range(pg.locator('#romWrap [data-rp="peso"]').count()):pg.locator('#romWrap [data-rp="peso"]').nth(i).fill("3")
    pg.click('#romCriar');pg.wait_for_timeout(700)
    if pg.locator('[data-act="rev-ok"]').count():pg.click('[data-act="rev-ok"]');pg.wait_for_timeout(1500)
    n2=pg.locator("tr[data-l]").count();print("linhas depois:",n2)
    ok(n2==n1,"editar de novo substitui as peças (sem duplicar): %d -> %d"%(n1,n2))
    pesos=set(pg.eval_on_selector_all('tr[data-l] td[data-c="N"]',"e=>e.map(x=>x.textContent.trim())"))
    ok(pesos=={"3,00"},"pesos novos aplicados: %s"%pesos)
    print("erros",errs,"FALHAS",f)
