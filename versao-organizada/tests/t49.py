"""Cadastros: alterações só valem depois de Salvar (modo estrito); Descartar devolve tudo; ações fora ficam travadas;
sem salvar nada é gravado; romaneio aberto acompanha o valor da galvânica."""
import os,threading,http.server,socketserver,functools,json
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8850),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8850/cadastro-pecas.html"
def mults(pg):return pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')||'{}')")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1500,"height":950});ctx.add_init_script("try{localStorage.setItem('cadpecas-cad-estrito','1')}catch(e){}")
    pg=ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(900)
    pg.evaluate("()=>{const b=document.querySelector('[data-go=\"sec:banho\"]');if(b)b.click()}");pg.wait_for_timeout(500)
    loc=pg.locator('#cfg input[data-bmv][data-mcat="__padrao"]');ok(loc.count()>0,"campo de valor da galvânica existe")
    antes=loc.first.input_value()
    loc.first.fill("9,99");loc.first.dispatch_event("change");pg.wait_for_timeout(900)
    ok(pg.locator("#cadBar").count()==1,"barra Salvar/Descartar aparece depois da alteração")
    pg.wait_for_timeout(1000)
    ok("9,99" not in json.dumps(mults(pg).get("config",{})),"nada gravado enquanto não salva")
    # ação fora dos cadastros fica travada
    pg.evaluate("()=>{const v=document.querySelector('#view-lancar,#form');}");
    pg.evaluate("()=>document.querySelector('button[data-vis=tudo]').click()");pg.wait_for_timeout(500)
    pg.click("#f-F",force=True);pg.keyboard.type("xyz");pg.wait_for_timeout(300)
    ok(pg.input_value("#f-F")=="","digitar no formulário fica travado enquanto há alteração pendente")
    # descartar
    pg.click('#cadBar [data-cad="descartar"]');pg.wait_for_timeout(700)
    ok(pg.locator("#cadBar").count()==0,"barra some ao descartar")
    ok(pg.locator('#cfg input[data-bmv][data-mcat="__padrao"]').first.input_value()==antes,"descartar devolve o valor: %s"%pg.locator('#cfg input[data-bmv][data-mcat="__padrao"]').first.input_value())
    # salvar
    loc=pg.locator('#cfg input[data-bmv][data-mcat="__padrao"]');loc.first.fill("8,88");loc.first.dispatch_event("change");pg.wait_for_timeout(700)
    ok(pg.locator("#cadBar").count()==1,"barra volta com nova alteração")
    pg.click('#cadBar [data-cad="salvar"]');pg.wait_for_timeout(1200)
    ok(pg.locator("#cadBar").count()==0,"barra some ao salvar")
    ok("8,88" in json.dumps(mults(pg).get("config",{})),"valor gravado depois de salvar")
    pg.click("#f-F");pg.keyboard.type("ok");ok(pg.input_value("#f-F")=="ok","formulário liberado depois de salvar")
    # romaneio aberto acompanha o valor da galvânica (custo do banho = peso × R$/g da categoria)
    pg.evaluate("()=>document.querySelector('button[data-vis=tudo]').click()");pg.wait_for_timeout(400)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read())
    pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1200)
    pg.click('#romWrap [data-act="rom-x"] >> nth=0');pg.wait_for_timeout(400)
    pg.fill('#romWrap .rc.op [data-rp="peso"]','3');pg.wait_for_timeout(600)
    cb=lambda:pg.input_value('#romWrap .rc.op [data-auto="C:ouro"]')
    c0=cb()
    pg.evaluate("()=>document.querySelector('[data-go=\"sec:banho\"]').click()");pg.wait_for_timeout(400)
    l=pg.locator('#cfg input[data-bmv][data-mcat="Colares"]');l.first.fill("6,6");l.first.dispatch_event("change");pg.wait_for_timeout(1500)
    ok(c0!=cb() and cb().startswith("19,8"),"romaneio aberto acompanha o valor da galvânica: %s -> %s"%(c0,cb()))
    pg.click('#cadBar [data-cad="descartar"]');pg.wait_for_timeout(1200)
    ok(cb()==c0,"descartar devolve o romaneio ao valor anterior: %s"%cb())
    ok(not errs,"sem erros de script: %s"%errs[:2])
    b.close()
print("\nFalhas:",len(f))
import sys;sys.exit(1 if f else 0)
