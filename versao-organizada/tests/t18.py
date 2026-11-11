import os,tempfile
import threading,http.server,socketserver,functools,json
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8789),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
if not os.environ.get("CP_BACKUP") or not os.path.exists(os.environ["CP_BACKUP"]):
    print("PULADO: defina CP_BACKUP com o caminho de um backup .json real para este teste");raise SystemExit(0)
bk=json.load(open(os.environ["CP_BACKUP"],encoding="utf-8"))
dados=json.dumps({"config":bk["config"],"lanc":bk["lanc"],"form":bk["form"],"edit":None,"rasc":None})
URL="http://127.0.0.1:8789/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1500,"height":1000});pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    msgs=[];pg.on("dialog",lambda d:(msgs.append(d.message),d.dismiss()))
    pg.goto(URL);pg.evaluate("v=>localStorage.setItem('cadpecas4',v)",dados);pg.reload();pg.wait_for_timeout(1800)
    n0=pg.locator("tr[data-l]").count()
    pg.click('[data-act="ctab"][data-id="banho"]')
    pg.click('[data-bh="0"] [data-bn="0"] [data-act="bn-del"]');pg.wait_for_timeout(300)
    ok(len(msgs)==1 and "peça" in msgs[0],"remover banho pede confirmação: "+(msgs[0][:70] if msgs else ""))
    ok(pg.locator("tr[data-l]").count()==n0,"nada removido ao cancelar")
    # nome de banhista vazio
    pg.fill('[data-bh="0"] [data-bhf="nome"]',"");pg.press('[data-bh="0"] [data-bhf="nome"]',"Tab");pg.wait_for_timeout(300)
    ok(pg.input_value('[data-bh="0"] [data-bhf="nome"]')!="","nome de banhista vazio é recusado")
    # desconto invalido
    pg.click('[data-act="ctab"][data-id="forn"]')
    pg.fill('[data-forn="0"] [data-ff="desconto"]',"150");pg.press('[data-forn="0"] [data-ff="desconto"]',"Tab");pg.wait_for_timeout(300)
    ok(pg.input_value('[data-forn="0"] [data-ff="desconto"]')!="150","desconto 150 recusado com volta ao valor")
    # renomear categoria -> mapa do romaneio
    pg.click('[data-act="ctab"][data-id="cat"]')
    nomes=pg.eval_on_selector_all('[data-cat] [data-cf="nome"]',"e=>e.map(x=>x.value)");i=nomes.index("Colares")
    pg.fill(f'[data-cat="{i}"] [data-cf="nome"]',"Colares X");pg.press(f'[data-cat="{i}"] [data-cf="nome"]',"Tab");pg.wait_for_timeout(500)
    pg.click('[data-act="ctab"][data-id="rom"]')
    vals=pg.eval_on_selector_all('[data-rom] [data-rm="c"]',"e=>e.map(x=>x.value)")
    ok("Colares" not in vals,"mapa do romaneio acompanha o novo nome: %s"%sorted(set(vals)))
    # palavras auto
    pg.click('[data-rom="0"] [data-act="rom-map-auto"]');pg.wait_for_timeout(500)
    pals=pg.eval_on_selector_all('[data-rom="0"] .rmr',"e=>e.map(r=>[r.querySelector('[data-rm=w]').value,r.querySelector('[data-rm=c]').value,r.querySelector('[data-rm=s]').value])")
    col=[x for x in pals if x[0].lower()=="colares x"]
    print("palavra Colares X:",col)
    ok(all(x[1]=="Colares X" for x in col) and col,"palavra da categoria aponta para a categoria certa")
    # romaneio sem tamanho
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read());pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    card=pg.locator('.rc:has([data-rp="semg"])').first
    print("cards com opção sem tamanho:",pg.locator('.rc:has([data-rp="semg"])').count())
    if pg.locator('.rc:has([data-rp="semg"])').count():
        card.locator('[data-rp="semg"]').evaluate("e=>e.click()");pg.wait_for_timeout(500)
        ok(pg.locator('.rc:has([data-rp="semg"]) [data-rp="q"][data-b]').count()>0,"marcando 'sem tamanho' aparece a quantidade por banho")
    print("erros",errs,"FALHAS",f)
