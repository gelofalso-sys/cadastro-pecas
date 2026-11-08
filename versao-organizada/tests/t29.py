import os,re,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8809),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
EMOJI=re.compile("[\U0001F300-\U0001FAFF\u2600-\u27BF]")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1400,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8809/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.wait_for_timeout(300)
    ok(not EMOJI.search(pg.inner_text("#side")),"menu lateral sem emojis")
    ok(pg.locator('#side [data-vis]').count()==1,"menu lateral só tem a página principal (sem visões)")
    ok(pg.locator('[data-vis="lancar"]').count()==0,"não existe visão/aba Lançar")
    ok(pg.locator("#paneBot").is_visible() and pg.locator("#paneTop").is_visible(),"tabela e formulário juntos na tela")
    # recolher e expandir o formulário
    pg.click("#dpill");pg.wait_for_timeout(300)
    ok(not pg.locator("#paneBot").is_visible(),"botão recolhe o formulário")
    pg.click("#dpill");pg.wait_for_timeout(300)
    ok(pg.locator("#paneBot").is_visible(),"botão expande o formulário de novo")
    # menu lateral → Romaneios lançados como aba
    pg.click('#side [data-go="sec:roml"]');pg.wait_for_timeout(500)
    ok(pg.locator('#cfg [data-act="ctab"].on',has_text="Romaneios lançados").count()==1,"Romaneios lançados abre como aba")
    # abas: sem rolagem horizontal e com explicação no fim
    ov=pg.evaluate("(()=>{const e=document.querySelector('#cfg .ctabs');return e.scrollWidth>e.clientWidth+1})()")
    ok(not ov,"abas de cadastro sem rolagem horizontal (1400px)")
    ids=pg.eval_on_selector_all('#cfg [data-act="ctab"]',"e=>e.map(x=>x.dataset.id)")
    sem=[]
    for i in ids:
        pg.click('#cfg [data-act="ctab"][data-id="%s"]'%i);pg.wait_for_timeout(250)
        if pg.locator("#cfg .expl").count()!=1:sem.append(i)
    ok(not sem,"todas as abas têm explicação no fim (sem: %s)"%sem)
    ok(len(ids)==10,"10 abas (%d)"%len(ids))
    # estreito: abas uma embaixo da outra
    pg.set_viewport_size({"width":700,"height":900});pg.wait_for_timeout(400)
    ys=pg.eval_on_selector_all('#cfg .ctabs .ctab',"e=>e.map(x=>Math.round(x.getBoundingClientRect().top))")
    ok(len(set(ys))==len(ys),"em tela estreita as abas ficam uma embaixo da outra")
    print("erros",errs,"FALHAS",f)
    if errs:f.append("erros de página")
