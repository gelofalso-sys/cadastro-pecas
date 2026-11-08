import os,json,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8821),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8821/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge")
    for w,h in ((390,844),(320,640)):
        ctx=b.new_context(viewport={"width":w,"height":h},is_mobile=True,has_touch=True,accept_downloads=True);pg=ctx.new_page()
        errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
        pg.goto(URL);pg.wait_for_timeout(900)
        ok(pg.evaluate("()=>document.documentElement.scrollWidth<=innerWidth+1"),"%dpx: sem rolagem horizontal da página"%w)
        vis=pg.evaluate("""()=>{const e=document.querySelector('.mbar [data-act="xlsx"]');if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}""")
        ok(vis,"%dpx: botão Baixar visível na barra de baixo"%w)
        # lança uma peça pelo celular
        pg.get_by_text("Lançar peça").locator("visible=true").last.click();pg.wait_for_timeout(600)
        pg.fill("#f-F","Teste celular");pg.fill("#f-N","2");pg.fill("#f-P","3")
        pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(700)
        n=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).lanc.length")
        ok(n==1,"%dpx: peça lançada pelo celular (%d)"%(w,n))
        ok(not errs,"%dpx: sem erro de página %s"%(w,errs[:2]))
        ctx.close()
    print("FALHAS",f)
    if f:raise SystemExit(1)
