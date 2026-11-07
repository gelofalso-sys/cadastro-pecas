import os,tempfile,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8796),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8796/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    # um segundo banhista para testar
    pg.click('[data-act="ctab"][data-id="banho"]');pg.click('[data-act="bh-add"]');pg.wait_for_timeout(400)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read());pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    n=pg.locator(".rc").count();ok(n>=6,"cards lidos (%d)"%n)
    card=pg.locator(".rc").first
    card.locator("summary, [data-act='rom-x']").first.click() if card.locator("summary, [data-act='rom-x']").count() else None
    pg.wait_for_timeout(300)
    ok(pg.locator('#romWrap [data-rp="tipoI"]').count()>=1,"campo Tipo desta peça existe (%d)"%pg.locator('#romWrap [data-rp="tipoI"]').count())
    pg.locator('#romWrap [data-rp="tipoI"]').first.select_option("pronta");pg.wait_for_timeout(500)
    ok(pg.locator('.rc >> nth=0').locator(".rch").filter(has_text="Pronta").count()>=1,"selo 'Pronta · banhista' aparece na peça")
    ok(pg.locator('.rc >> nth=0').locator('[data-rp="q"][data-b="p"]').count()>=1,"peça pronta mostra quantidade simples")
    pg.locator('.rc >> nth=1').locator('[data-rp="bhI"]').count()
    # lote
    ok(pg.locator('[data-rp="rb"][data-k="tipo"]').count()==1 and pg.locator('[data-rp="rb"][data-k="bh"]').count()==1,"edição em lote tem Tipo e Banhista")
    # criar de verdade com tipo e banhista por peça
    for k in range(pg.locator('#romWrap [data-rp="peso"]').count()):pg.locator('#romWrap [data-rp="peso"]').nth(k).fill("2")
    pg.locator('.rc >> nth=0').locator('[data-rp="q"][data-b="p"]').fill("2")
    pg.click('[data-act="rom-div-todas"]');pg.wait_for_timeout(300)
    pg.locator('.rc >> nth=0').locator('[data-rp="q"][data-b="p"]').fill("2")
    pg.click('#romCriar');pg.wait_for_timeout(800)
    if pg.locator('[data-act="rev-ok"]').count():pg.click('[data-act="rev-ok"]');pg.wait_for_timeout(1500)
    ln=pg.locator("tr[data-l]").count();print("linhas:",ln)
    ok(ln>=8,"romaneio com peça pronta e as demais brutas criou %d linhas"%ln)
    refs=pg.eval_on_selector_all('tr[data-l] td[data-c="E"]',"e=>e.map(x=>x.textContent.replace(/\s+/g,' ').trim())");print(refs[:12])
    pg.click('[data-act="ctab"][data-id="col"]') if False else None
    print("erros",errs,"FALHAS",f)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8796/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read());pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    ok(pg.locator('#romWrap [data-act="rom-q"]').count()>=4,"botões ＋ de criação rápida no romaneio (%d)"%pg.locator('#romWrap [data-act="rom-q"]').count())
    pg.locator('#romWrap .rc >> nth=0').locator('[data-act="rom-q"][data-q="cat"]').click();pg.wait_for_timeout(400)
    pg.fill("#q1","Piercings Novos");pg.press("#q1","Enter");pg.wait_for_timeout(700)
    cat0=pg.locator('#romWrap .rc >> nth=0').locator('[data-rp="cat"]').input_value();print("categoria da 1a peça:",cat0)
    ok(cat0=="Piercings Novos","categoria criada na hora e aplicada só à peça")
    ok(pg.locator('#romWrap .rc >> nth=1').locator('[data-rp="cat"]').input_value()!="Piercings Novos","as outras peças não mudaram")
    print("erros",errs,"FALHAS",f)
