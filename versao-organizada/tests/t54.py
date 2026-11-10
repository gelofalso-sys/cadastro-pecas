"""Edge cases de cadastro: campos fiscais/insumos/fator invalidos voltam ao valor anterior com aviso; "ultima peca" mostra o que foi guardado;
nomes de fornecedor e galvanica sem espacos nas pontas."""
import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8854),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
def aba(pg,n):pg.get_by_text(n,exact=True).locator("visible=true").first.click();pg.wait_for_timeout(600)
def tenta(pg,sel,idx,val):
    l=pg.locator(sel).nth(idx);l.fill(val);l.dispatch_event("change");pg.wait_for_timeout(450);return pg.locator(sel).nth(idx).input_value()
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":950}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8854/cadastro-pecas.html");pg.wait_for_timeout(900)
    aba(pg,"Categorias")
    i=pg.evaluate("()=>[...document.querySelectorAll('#cfg input[data-cf=nome]')].findIndex(i=>i.value==='Brincos')")
    for campo,ruim,bom in (("insumos","abc","1,25"),("insumos","-1","0,5"),("ncm","7113","71131100"),("cfop","12345","5102"),("fcp","150","2")):
        s='#cfg input[data-cf="%s"]'%campo
        ant=pg.locator(s).nth(i).input_value()
        ok(tenta(pg,s,i,ruim)==ant,"%s '%s' e recusado e volta ao anterior ('%s')"%(campo,ruim,ant))
        ok(tenta(pg,s,i,bom)==bom,"%s '%s' e aceito"%(campo,bom))
    ok(tenta(pg,'#cfg input[data-cf="ultimo"]',i,"-5")=="5","ultima peca '-5' mostra o valor guardado (5)")
    aba(pg,"Galvânicas e banhos")
    for v in ("0","-2","abc"):ok(tenta(pg,'#cfg input[data-bnf="fator"]',0,v)=="","fator '%s' e recusado"%v)
    ok(tenta(pg,'#cfg input[data-bnf="fator"]',0,"2,5")=="2,5","fator '2,5' e aceito")
    ok(tenta(pg,'#cfg input[data-bhf="nome"]',0,"Scarlat  ")=="Scarlat","nome da galvanica sem espacos nas pontas")
    aba(pg,"Fornecedores")
    ok(tenta(pg,'#cfg input[data-ff="nome"]',0,"  xangai novo  ")=="xangai novo","nome do fornecedor sem espacos nas pontas")
    ok(not errs,"sem erro de pagina %s"%errs[:2])
    print("FALHAS",f)
    if f:raise SystemExit(1)
