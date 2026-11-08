import os,json,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8822),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8822/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
ST="()=>({ed:!!document.getElementById('celIn'),sa:!!document.querySelector('#sheet td.sa'),sl:document.querySelectorAll('#sheet td.sl').length,sx:document.getElementById('sheet').scrollLeft})"
def lanca(pg,n):
    for i in range(n):
        pg.select_option("#f-I","Brincos");pg.fill("#f-F","Peca %d"%i);pg.fill("#f-N","2");pg.fill("#f-P","3")
        pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(400)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge")
    # celular: 1o toque só marca; 2o toque abre para digitar; sem pulo de rolagem
    ctx=b.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True);pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(800)
    pg.get_by_text("Lançar peça").locator("visible=true").last.click();pg.wait_for_timeout(500)
    lanca(pg,2)
    pg.evaluate("()=>{const b=document.querySelector('[data-act=vista][data-v=planilha]');b&&b.click()}");pg.wait_for_timeout(600)
    ok(pg.evaluate("()=>matchMedia('(pointer:coarse)').matches"),"emulação de toque ativa")
    td=pg.locator('#sheet tr[data-ri="0"] td[data-c="F"]').first
    td.scroll_into_view_if_needed();pg.wait_for_timeout(300)
    bx=td.bounding_box();x0=pg.evaluate(ST)["sx"];pg.touchscreen.tap(bx["x"]+bx["width"]/2,bx["y"]+bx["height"]/2);pg.wait_for_timeout(500);s1=pg.evaluate(ST)
    ok(s1["sx"]==x0,"celular: o toque não rola a tabela para o lado (%s -> %s)"%(x0,s1["sx"]))
    ok(s1["sa"] and s1["sl"]>=1,"celular: 1º toque marca a célula (%s)"%s1)
    ok(not s1["ed"],"celular: 1º toque NÃO abre o editor/teclado")
    bx=td.bounding_box();pg.touchscreen.tap(bx["x"]+bx["width"]/2,bx["y"]+bx["height"]/2);pg.wait_for_timeout(500);s2=pg.evaluate(ST)
    ok(s2["sx"]==x0,"celular: abrir para digitar também não pula a rolagem (%s -> %s)"%(x0,s2["sx"]))
    ok(s2["ed"],"celular: 2º toque na célula marcada abre para digitar (%s)"%s2)
    ok(not errs,"celular: sem erro de página %s"%errs[:2]);ctx.close()
    # desktop: um clique ainda abre para digitar
    ctx=b.new_context(viewport={"width":1400,"height":900});pg=ctx.new_page();pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(800);lanca(pg,2)
    pg.locator('#sheet tr[data-ri="0"] td[data-c="F"]').first.click();pg.wait_for_timeout(500)
    s=pg.evaluate(ST);ok(s["ed"] and s["sa"],"desktop: um clique marca e abre para digitar (%s)"%s)
    print("FALHAS",f)
    if f:raise SystemExit(1)
