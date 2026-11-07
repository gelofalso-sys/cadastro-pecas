import os,tempfile,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8799),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1100}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8799/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.click('[data-act="rom-tipo"][data-v="pronta"]');pg.wait_for_timeout(400)
    ok(pg.locator('#romWrap [data-rp="bn"]').count()>=2,"lote Pronta também mostra os banhos para escolher (%d)"%pg.locator('#romWrap [data-rp="bn"]').count())
    ok(pg.locator('#romWrap [data-rp="bh"]').count()==1,"lote Pronta mostra o banhista")
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read());pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    # sem banho marcado: peca unica
    ok(pg.locator('#romWrap .rc >> nth=0').locator('[data-rp="q"][data-b="p"]').count()>=1,"sem banho marcado: quantidade simples da peça pronta")
    # marca Ouro e Prata no lote
    for i in pg.eval_on_selector_all('#romWrap [data-rp="bn"]',"e=>e.map(x=>x.dataset.b)")[:2]:pg.eval_on_selector('#romWrap [data-rp="bn"][data-b="%s"]'%i,"e=>e.click()");pg.wait_for_timeout(300)
    ok(pg.locator('#romWrap .rc >> nth=0').locator('[data-rp="bon"]:checked').count()==2,"cartões herdam Ouro e Prata marcados")
    for k in range(pg.locator('#romWrap [data-rp="peso"]').count()):pg.locator('#romWrap [data-rp="peso"]').nth(k).fill("2")
    pg.click('[data-act="rom-div-todas"]');pg.wait_for_timeout(400)
    pg.click('#romCriar');pg.wait_for_timeout(800)
    if pg.locator('[data-act="rev-ok"]').count():pg.click('[data-act="rev-ok"]');pg.wait_for_timeout(1500)
    refs=pg.eval_on_selector_all('tr[data-l] td[data-c="E"]',"e=>e.map(x=>x.textContent.replace(/\s+/g,' ').trim())");print(refs[:10])
    cores=pg.eval_on_selector_all('tr[data-l] td[data-c="L"]',"e=>[...new Set(e.map(x=>x.textContent.trim()))]");print("cores:",cores)
    ok(any("Ouro" in r for r in refs) and any("Prata" in r for r in refs),"peças prontas geraram linhas por banho (Ouro e Prata)")
    banho=pg.eval_on_selector_all('tr[data-l] td[data-c="R"], tr[data-l] td[data-c="T"]',"e=>e.map(x=>x.textContent.trim()).filter(Boolean)")
    ok(len(banho)==0,"peça pronta não gera custo de banho (%s)"%banho[:3])
    print("erros",errs,"FALHAS",f)
