import os,tempfile
import threading,http.server,socketserver,functools,json
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8777),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL="http://127.0.0.1:8777/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
PNG1="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
PNG2="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg=="
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge")
    ctx=b.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True,color_scheme="dark");pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(800)
    bg=pg.evaluate("getComputedStyle(document.body).backgroundColor");ok(bg in("rgb(241, 243, 247)","rgb(255, 255, 255)"),"celular em modo escuro continua claro: "+bg)
    pg.screenshot(path=SC+r"\s_claro.png")
    ctx.close()
    ctx=b.new_context(viewport={"width":1280,"height":900});pg=ctx.new_page();pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(800)
    pg.click('[data-act="ctab"][data-id="banho"]');
    th=pg.eval_on_selector_all('[data-bh="0"] table.bnt >> nth=0 >> thead th',"e=>e.map(x=>x.textContent)") if False else pg.eval_on_selector_all('[data-bh="0"] .tw >> nth=0 >> css=th',"e=>e.map(x=>x.textContent)")
    print(th)
    ok("Milésimos de Banho" not in th and "Valor R$" not in th,"tabela de banhos sem colunas redundantes")
    ok(pg.locator('[data-bh="0"] [data-mcat="__padrao"]').count()>=2,"linha Padrão na tabela por categoria")
    pg.fill('[data-bh="0"] [data-bmv="0"][data-mcat="__padrao"]',"1,6");pg.press('[data-bh="0"] [data-bmv="0"][data-mcat="__padrao"]',"Tab")
    # peça com foto do app + romaneio simulada
    pg.fill("#f-F","Foto teste");pg.fill("#f-N","2");pg.fill("#f-P","10")
    for i in pg.eval_on_selector_all("[data-on]","e=>e.map(x=>x.dataset.on)"):
        pg.check('[data-on="%s"]'%i) if not pg.is_checked('[data-on="%s"]'%i) else None
    for i in pg.eval_on_selector_all('[id^="f-"][id$="-W"]',"e=>e.map(x=>x.id)"):pg.fill('[id="%s"]'%i,"1")
    pg.click('button:has-text("Adicionar") >> nth=0');pg.wait_for_timeout(800)
    # injeta as duas fotos no armazenamento e recarrega
    chave=pg.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('cadpecas4'))")
    print(chave)
    d=json.loads(pg.evaluate("localStorage.getItem('cadpecas4')"))
    for l in d["lanc"]:
        l["ft"]=PNG1;l["ftR"]=PNG2
    pg.evaluate("v=>localStorage.setItem('cadpecas4',v)",json.dumps(d))
    pg.reload();pg.wait_for_timeout(900)
    n=pg.locator("tr[data-l] td.tf img").count();ok(n>=2,"tabela mostra as duas fotos (%d miniaturas do romaneio)"%n)
    pg.screenshot(path=SC+r"s_tabfotos.png",clip={"x":0,"y":60,"width":900,"height":260});pg.click('tr[data-l] [data-act="editar"] >> nth=0');pg.wait_for_timeout(500)
    ok(pg.locator(".ftslot.ftr").count()==1 and pg.locator(".ftslot.has").count()==2,"formulário mostra as duas")
    pg.screenshot(path=SC+r"\s_fotos.png")
    pg.click('[data-act="foto-rem-rom"]');pg.wait_for_timeout(300)
    ok(pg.locator(".ftslot.ftr").count()==0,"remover foto do romaneio")
    print("erros",errs);print("FALHAS",f)
