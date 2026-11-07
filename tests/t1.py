import os,tempfile
import sys,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8771),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL="http://127.0.0.1:8771/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
errs=[];falhas=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:falhas.append(m)
def nomes(pg,sel):return pg.eval_on_selector_all(sel,"e=>e.map(x=>x.value!==undefined&&x.tagName==='INPUT'?x.value:x.textContent)")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge")
    ctx=b.new_context(viewport={"width":1280,"height":900})
    pg=ctx.new_page()
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.on("console",lambda m:errs.append(m.text) if m.type=="error" and "net::" not in m.text and "ERR_" not in m.text else None)
    pg.goto(URL);pg.wait_for_timeout(800)
    ok(pg.locator(".banner").count()==1,"banner de primeiro acesso aparece")
    pg.click('[data-act="colar-abrir"] >> nth=0')
    pg.fill("#colarTx","Anéis: Solitário; Aparador\nTiaras: Noiva; Festa; noiva\n\nBrincos: Argola; Argola\n<b>x</b>: y\nA: b")
    pg.wait_for_timeout(200)
    prev=pg.inner_text("#colarPrev")
    ok("criar 2 categorias" in prev,"prévia: criar 2 categorias -> "+prev.split("\n")[0])
    ok(pg.locator("#colarPrev b:text-is('x')").count()==0,"sem HTML solto na prévia")
    pg.click("#colarOk");pg.wait_for_timeout(500)
    cats=nomes(pg,'[data-cat] [data-cf="nome"]')
    ok("Tiaras" in cats and "<b>x</b>" in cats,"categorias criadas (incl. nome com tag, escapado)")
    ok(pg.locator("#cfg b:text-is('x')").count()==0,"nome com tag não vira HTML")
    pg.fill('[data-cat="0"] [data-enter="sub"]',"X1; X2, X3; x1")
    pg.press('[data-cat="0"] [data-enter="sub"]',"Enter");pg.wait_for_timeout(300)
    subs=nomes(pg,'[data-cat="0"] .chip .cn')
    ok(subs.count("X1")==1 and "X3" in subs and len([x for x in subs if x.lower()=="x1"])==1,"várias subcategorias sem duplicar: %s"%subs)
    pg.fill("#novaCat","Tornozelo Teste");pg.press("#novaCat","Enter");pg.wait_for_timeout(300)
    ok(pg.evaluate("document.activeElement.getAttribute('data-enter')")=="sub","foco em + Subcategoria após criar")
    ok("ainda não tem subcategorias" in pg.inner_text("#cfg"),"aviso suave de sem subcategorias")
    # banhos
    pg.click('[data-act="ctab"][data-id="banho"]');pg.wait_for_timeout(200)
    for tp in ["ouro","negro","negro","rodio","outro"]:
        pg.click(f'[data-bh="0"] [data-act="bn-pronto"][data-tp="{tp}"]');pg.wait_for_timeout(150)
    nm=nomes(pg,'[data-bh="0"] [data-bnf="nome"]');ok(len(set(nm))==len(nm),"nomes de banho únicos: %s"%nm)
    pg.select_option('[data-bh="0"] [data-bn="0"] [data-bnf="cor"]',"__nova");pg.wait_for_timeout(200)
    pg.fill("[data-ncor]","Rosé");pg.press("[data-ncor]","Enter");pg.wait_for_timeout(300)
    ok(pg.input_value('[data-bh="0"] [data-bn="0"] [data-bnf="cor"]')=="Rosé","nova cor criada e escolhida")
    n0=pg.locator('[data-bh="0"] tr[data-bn]').count()
    pg.click('[data-bh="0"] tr[data-bn] [data-act="bn-dup"] >> nth=0');pg.wait_for_timeout(200)
    ok(pg.locator('[data-bh="0"] tr[data-bn]').count()==n0+1,"duplicar linha de banho")
    # nome repetido digitado
    pg.fill('[data-bh="0"] [data-bn="1"] [data-bnf="nome"]',"Ouro");pg.press('[data-bh="0"] [data-bn="1"] [data-bnf="nome"]',"Tab");pg.wait_for_timeout(200)
    ok(pg.input_value('[data-bh="0"] [data-bn="1"] [data-bnf="nome"]')!="Ouro","nome de banho repetido é recusado")
    pg.screenshot(path=SC+r"\s_banho.png")
    # duplicar categoria
    pg.click('[data-act="ctab"][data-id="cat"]');pg.wait_for_timeout(200)
    pg.click('[data-cat="0"] [data-act="cat-dup"]');pg.wait_for_timeout(200)
    ok(pg.locator('[data-dup="nome"]').count()==1,"painel de duplicar aparece")
    pg.fill('[data-dup="pre"]',"AC");ok(pg.locator("#dupAviso:not([hidden])").count()==1,"aviso de prefixo repetido")
    pg.fill('[data-dup="pre"]',"ZQ");ok(pg.locator("#dupAviso:not([hidden])").count()==0,"sem aviso com prefixo livre")
    pg.screenshot(path=SC+r"\s_dup.png")
    pg.press('[data-dup="nome"]',"Enter");pg.wait_for_timeout(300)
    cats=nomes(pg,'[data-cat] [data-cf="nome"]');ok(any("(cópia)" in c for c in cats),"cópia criada")
    # renomear / mover
    pg.click('[data-cat="0"] .chip .cn >> nth=0');pg.wait_for_timeout(100)
    pg.fill('[data-subren]',"Renomeada");pg.press('[data-subren]',"Enter");pg.wait_for_timeout(300)
    n1=nomes(pg,'[data-cat="0"] .chip .cn');ok(n1[0]=="Renomeada","sub renomeada: %s"%n1[:3])
    pg.click('[data-cat="0"] [data-act="sub-down"][data-j="0"]');pg.wait_for_timeout(200)
    n2=nomes(pg,'[data-cat="0"] .chip .cn');ok(n2[1]=="Renomeada","sub desceu")
    pg.click('[data-cat="1"] [data-act="cat-up"]');pg.wait_for_timeout(200)
    pg.click("#tBtn");pg.wait_for_timeout(300)
    pg.screenshot(path=SC+r"\s_cat.png")
    # faixa
    print("erros de console:",errs)
    b.close()
print("FALHAS:",falhas)
