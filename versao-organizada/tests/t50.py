"""Fator × e Preço de Varejo se acompanham: no romaneio (cartão) e no formulário. Digitar o fator mostra o preço;
digitar o preço calcula o fator."""
import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8853),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
def n(s):
    s=str(s).strip().replace(".","").replace(",",".") if "," in str(s) else str(s).strip()
    try:return float(s)
    except:return None
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":950}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8853/cadastro-pecas.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read())
    pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1200)
    pg.click('#romWrap [data-act="rom-x"] >> nth=0');pg.wait_for_timeout(500)
    pg.fill('#romWrap .rc.op [data-rp="peso"]','3');pg.fill('#romWrap .rc.op [data-rp="q"] >> nth=0','2');pg.wait_for_timeout(700)
    mk='#romWrap .rc.op [data-rp="mk"] >> nth=0';V='#romWrap .rc.op [data-auto^="V:"] >> nth=0'
    pg.fill(mk,'2');pg.locator(mk).dispatch_event("change");pg.wait_for_timeout(900)
    v=n(pg.input_value(V));ok(v is not None and v>0,"romaneio: digitar o fator mostra o Preço de Varejo: %s"%pg.input_value(V))
    pg.fill(V,'50');pg.locator(V).dispatch_event("change");pg.wait_for_timeout(900)
    fa=n(pg.input_value(mk));ok(fa is not None and fa>0 and fa!=2,"romaneio: digitar o preço calcula o fator: %s"%pg.input_value(mk))
    pg.fill(mk,'3');pg.locator(mk).dispatch_event("change");pg.wait_for_timeout(900)
    ok(n(pg.input_value(V)) not in (None,50.0),"romaneio: trocar o fator recalcula o preço: %s"%pg.input_value(V))
    # formulário
    pg.reload();pg.wait_for_timeout(900)
    pg.fill("#f-F","Teste");pg.fill("#f-N","3");pg.fill("#f-P","10");pg.fill("#f-ouro-W","2");pg.wait_for_timeout(500)
    fm='#form input[data-mk="ouro"]';fv='#f-ouro-V'
    pg.fill(fm,'2');pg.locator(fm).dispatch_event("change");pg.wait_for_timeout(700)
    ph=pg.get_attribute(fv,"placeholder") or "";ok(any(c.isdigit() for c in ph) and "×" in ph,"formulário: digitar o fator mostra o preço sugerido: %r"%ph)
    pg.fill(fv,'80');pg.locator(fv).dispatch_event("change");pg.wait_for_timeout(700)
    ok(n(pg.input_value(fm)) not in (None,2.0),"formulário: digitar o preço calcula o fator: %s"%pg.input_value(fm))
    ok(not errs,"sem erros de script: %s"%errs[:2])
    b.close()
print("\nFalhas:",len(f))
import sys;sys.exit(1 if f else 0)
