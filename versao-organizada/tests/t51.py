"""Regressao (teste ao vivo de 10/11/2026):
1) preco de varejo sugerido arredonda no comercial (7,41 x 2,5 = 18,525 -> 18,53, como o ROUND da planilha; antes dava 18,52);
2) categoria renomeada nos Cadastros depois de guardar o romaneio: ao reabrir o romaneio salvo as pecas seguem o novo nome
   (antes ficavam com o nome antigo, nao eram criadas e a revisao dizia 'sem alertas')."""
import os,re,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8851),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8851/cadastro-pecas.html"
def set_(pg,sel,val,idx=0):
    pg.evaluate("a=>{const i=document.querySelectorAll(a.s)[a.i];i.value=a.v;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))}",{"s":sel,"v":val,"i":idx});pg.wait_for_timeout(500)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":950}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read())
    pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1200)
    rc=pg.locator("#romWrap .rc").first
    cat0=rc.locator('[data-rp="cat"]').input_value();ok(bool(cat0),"primeira peca do romaneio tem categoria (%s)"%cat0)
    # 1) arredondamento do varejo sugerido
    set_(pg,'#romWrap .rc [data-rp="custo"]',"3,45");set_(pg,'#romWrap .rc [data-rp="peso"]',"1,8")
    set_(pg,'#romWrap .rc [data-rp="mk"][data-b="ouro"]',"2,5")
    q=pg.locator('#romWrap .rc [data-rp="q"][data-b="ouro"]').first
    set_(pg,'#romWrap .rc [data-rp="q"][data-b="ouro"]',"1")
    bo=pg.locator('#romWrap .rc [data-rp="bo"][data-b="ouro"]').first.input_value()
    ok(bo=="18,53","varejo sugerido 7,41 x 2,5 = 18,53 (leu %s)"%bo)
    # 2) renomear a categoria com o romaneio guardado e fechado
    pg.click('#romWrap [data-act="rom-fechar"]');pg.wait_for_timeout(1000)
    pg.get_by_text("Categorias",exact=True).locator("visible=true").first.click();pg.wait_for_timeout(600)
    ix=pg.evaluate("n=>[...document.querySelectorAll('#cfg input[data-cf=nome]')].findIndex(i=>i.value===n)",cat0)
    ok(ix>=0,"categoria %s existe nos cadastros"%cat0)
    set_(pg,'#cfg input[data-cf="nome"]',cat0+" Novo",ix)
    pg.get_by_text("Tabela e formulário",exact=False).locator("visible=true").first.click();pg.wait_for_timeout(700)
    pg.locator('button[data-act="rom-lista"]:visible',has_text="salvos").first.click();pg.wait_for_timeout(800)
    pg.locator('.rep [data-act="rom-salvo-abrir"]').first.click();pg.wait_for_timeout(1800)
    cats=pg.eval_on_selector_all('#romWrap .rc [data-rp="cat"]',"e=>e.map(x=>x.value)")
    ok(cats and cats[0]==cat0+" Novo","romaneio salvo reaberto segue o novo nome da categoria: %s"%cats[:3])
    ok(not any(c==cat0 for c in cats),"nenhuma peca ficou com o nome antigo")
    ok(not errs,"sem erro de pagina %s"%errs[:2])
    print("FALHAS",f)
    if f:raise SystemExit(1)
