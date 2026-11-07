import os,tempfile
import threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8792),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1400,"height":1000});pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8792/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    ok(pg.is_disabled("#btnUndo"),"Desfazer começa desabilitado")
    pg.fill("#f-F","Peça A");pg.fill("#f-N","2");pg.fill("#f-P","10")
    for i in pg.eval_on_selector_all("[data-on]","e=>e.map(x=>x.dataset.on)"):
        if not pg.is_checked('[data-on="%s"]'%i):pg.check('[data-on="%s"]'%i)
    for i in pg.eval_on_selector_all('[id^="f-"][id$="-W"]',"e=>e.map(x=>x.id)"):pg.fill('[id="%s"]'%i,"1")
    pg.click('button:has-text("Adicionar") >> nth=0');pg.wait_for_timeout(700)
    n1=pg.locator("tr[data-l]").count();ok(n1>0 and not pg.is_disabled("#btnUndo"),"botão Desfazer habilita após adicionar (%d linhas)"%n1)
    # ponto de restauracao
    pg.click('[data-act="ctab"][data-id="opc"]');pg.wait_for_timeout(300)
    pg.click('[data-act="ponto-novo"]');pg.wait_for_timeout(800)
    ok(pg.locator(".pt").count()==1,"ponto criado e listado")
    pg.click("#btnUndo");pg.wait_for_timeout(500)
    ok(pg.locator("tr[data-l]").count()==0,"botão Desfazer remove a peça")
    pg.click("#btnRedo");pg.wait_for_timeout(500)
    ok(pg.locator("tr[data-l]").count()==n1,"botão Refazer traz de volta")
    # sai da peca, volta ao ponto
    pg.evaluate("document.querySelector('tr[data-l] [data-act=del]')&&0")
    pg.click('[data-act="ctab"][data-id="opc"]');pg.wait_for_timeout(300)
    pg.locator('.pt [data-act="ponto-voltar"]').first.click();pg.wait_for_timeout(1200)
    ok(pg.locator("tr[data-l]").count()==n1,"voltar ao ponto restaura o estado (%d linhas)"%pg.locator("tr[data-l]").count())
    ok(pg.locator(".pt").count()>=2,"estado anterior fica guardado como outro ponto")
    # romaneio por planilha
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.set_input_files("#romXls",os.path.join(SC,"ped_teste.xlsx"));pg.wait_for_timeout(900)
    ok(pg.locator('[data-rp="planmap"]').count()==5,"painel de colunas aparece")
    vals=pg.eval_on_selector_all('[data-rp="planmap"]',"e=>e.map(x=>x.options[x.selectedIndex].text)");print(vals)
    ok("Produto" in vals[1] and "Ref" in vals[0] and "Qtd" in vals[2],"colunas adivinhadas")
    pg.click('[data-act="rom-plan-ok"]');pg.wait_for_timeout(1000)
    ok(pg.locator(".rc").count()==2,"2 peças (a de quantidade 0 fica de fora): %d"%pg.locator(".rc").count())
    # modelo a partir de exemplo
    pg.click('[data-act="ctab"][data-id="rom"]');pg.wait_for_timeout(300)
    n0=pg.locator("[data-rom]").count()
    pg.click('[data-act="rom-ex-abrir"]');pg.fill("#romExTx",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read());pg.wait_for_timeout(500)
    print(pg.inner_text("#romExPrev")[:200].replace(chr(10)," | "))
    ok(not pg.is_disabled("#romExOk"),"exemplo reconhecido habilita Criar modelo")
    pg.click("#romExOk");pg.wait_for_timeout(500)
    ok(pg.locator("[data-rom]").count()==n0+1,"modelo criado")
    pg.screenshot(path=SC+r"\s_romex.png")
    print("erros",errs,"FALHAS",f)
