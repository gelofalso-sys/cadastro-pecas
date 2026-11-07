import os,tempfile
import threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8780),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL="http://127.0.0.1:8780/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
def add(pg,desc,cat):
    pg.select_option("#f-I",cat);pg.fill("#f-F",desc);pg.fill("#f-N","2");pg.fill("#f-P","10")
    for i in pg.eval_on_selector_all("[data-on]","e=>e.map(x=>x.dataset.on)"):
        if not pg.is_checked('[data-on="%s"]'%i):pg.check('[data-on="%s"]'%i)
    for i in pg.eval_on_selector_all('[id^="f-"][id$="-W"]',"e=>e.map(x=>x.id)"):pg.fill('[id="%s"]'%i,"1")
    pg.click('button:has-text("Adicionar") >> nth=0');pg.wait_for_timeout(600)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1280,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(800)
    # cores na categoria Anél
    pg.click('[data-act="ctab"][data-id="cat"]')
    pg.click('[data-cat="1"] details:has([data-enter="cv"]) summary');pg.wait_for_timeout(200)
    pg.fill('[data-cat="1"] [data-enter="cv"]',"Dourado; Rosé");pg.press('[data-cat="1"] [data-enter="cv"]',"Enter");pg.wait_for_timeout(300)
    pg.fill('[data-cat="1"] [data-cvi="1"] [data-cvf="letra"]',"R");pg.press('[data-cat="1"] [data-cvi="1"] [data-cvf="letra"]',"Tab")
    pg.fill('[data-cat="1"] [data-cvi="0"] [data-cvf="texto"]',"-");pg.press('[data-cat="1"] [data-cvi="0"] [data-cvf="texto"]',"Tab")
    pg.screenshot(path=SC+r"\s_cores_cfg.png")
    # lancar anel com tamanhos e cores
    pg.select_option("#f-I","Anél");pg.wait_for_timeout(300)
    ok(pg.locator("[data-cs]").count()==2,"form mostra as cores para selecionar")
    pg.fill("#f-F","Anel solitario");pg.fill("#f-N","2");pg.fill("#f-P","10")
    print(pg.eval_on_selector_all('[data-gi]','e=>e.map(x=>x.dataset.gi)')[:5],pg.eval_on_selector('#f-I','e=>e.value'))
    gi=pg.eval_on_selector_all('[data-gi]','e=>e.map(x=>x.dataset.gi)')
    for g in gi[1:3]:pg.eval_on_selector('[data-gi="%s"]'%g,'e=>e.click()');pg.wait_for_timeout(200)
    pg.check("[data-cs]:nth-of-type(1)") if False else None
    for cid in pg.eval_on_selector_all("[data-cs]","e=>e.map(x=>x.dataset.cs)"):pg.eval_on_selector('[data-cs="%s"]'%cid,'e=>e.click()');pg.wait_for_timeout(200)
    for i in pg.eval_on_selector_all("[data-on]","e=>e.map(x=>x.dataset.on)"):
        if not pg.is_checked('[data-on="%s"]'%i):pg.check('[data-on="%s"]'%i)
    ids=pg.eval_on_selector_all('[id^="f-"][id$="-W"]',"e=>e.map(x=>x.id)");print(len(ids),"campos de quantidade")
    for i in ids:pg.fill('[id="%s"]'%i,"1")
    print(pg.inner_text("#gera")[:300])
    t=pg.inner_text("#custos");print(t[:500].replace(chr(10)," | "))
    ok(len(ids)>=8,"quantidade por banho x tamanho x cor (%d)"%len(ids))
    bf=pg.inner_text('[data-bf]:visible >> nth=0') if pg.locator('[data-bf]').count() else ""
    print("base:",bf)
    ok("Base do fator" in bf,"mostra a base do fator")
    pg.click('button:has-text("Adicionar") >> nth=0');pg.wait_for_timeout(700)
    txt=pg.inner_text("#sheet");print([w for w in txt.replace(chr(9)," ").split() if w.startswith("AN") ][:12])
    descs=pg.eval_on_selector_all('#sheet td[data-c="F"]',"e=>e.map(x=>x.textContent)");print(descs[:8])
    ok(any("rosé" in d.lower() for d in descs) and any("dourado" not in d.lower() for d in descs),"cor na descrição (rosé sim, dourado sem palavra)")
    # troca de item ao clicar noutra celula
    add(pg,"Outro brinco","Brincos")
    ln=pg.locator("tr[data-l]");n=ln.count();print("linhas",n)
    pg.click('tr[data-l] td[data-c="F"] >> nth=0');pg.wait_for_timeout(500)
    e1=pg.input_value("#f-F");pg.keyboard.press("Escape")
    pg.click('tr[data-l] >> nth=-1 >> td[data-c="F"]');pg.wait_for_timeout(300);pg.keyboard.press("Escape");pg.wait_for_timeout(300)
    pg.click('tr[data-l] >> nth=-1 >> td[data-c="G"]');pg.wait_for_timeout(500)
    e2=pg.input_value("#f-F") if pg.locator("#f-F").count() else ""
    print("form1:",e1,"| form2:",e2)
    ok(e1!=e2 and "brinco" in e2.lower(),"clicar noutro item sem alteração abre o formulário daquele")
    print("erros",errs,"FALHAS",f)
