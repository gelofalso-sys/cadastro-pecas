"""Auditoria de 10/11/2026:
- botao de expandir o formulario fica acima do canto inferior direito (o selo "Powered by Netlify" cobria o botao);
- rodape do romaneio (Valor Total da Compra, Custo Separacao...) nao gera o aviso "sobrou texto";
- banho sem valor por grama aparece no cartao e na revisao; soma de componentes de conjunto diferente do original aparece na revisao."""
import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8858),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
TXT=("Patricinha Joias e semijoias Romaneio do Link 2 LINK SOBRAS Pedido nº GC-2999 Categoria Descrição Valor Unitário Quantidade Valor Total "
     "Anel [#101510] R$ 5,28 4 R$ 21,12 Valor Total da Compra: R$ 21,12 Valor Produtos: R$ 21,12 Custo Separação: R$ 30,00 Quantidade Total de Produtos: 4 Página 1/1")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8858/cadastro-pecas.html");pg.wait_for_timeout(900)
    # botao de expandir
    pg.evaluate("()=>document.querySelector('#dpill').click()");pg.wait_for_timeout(700)
    r=pg.evaluate("()=>{const b=document.getElementById('dpill').getBoundingClientRect();return {txt:document.getElementById('dpill').innerText,fundo:innerHeight-b.bottom,dir:innerWidth-b.right}}")
    ok("Expandir" in r["txt"] and r["fundo"]>=56,"botao 'Expandir o formulario' fica 56px ou mais acima do fundo (selo do Netlify): %s"%r)
    pg.evaluate("()=>document.querySelector('#dpill').click()");pg.wait_for_timeout(500)
    # rodape do romaneio
    pg.click('[data-act="rom-abrir"] >> nth=0');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",TXT);pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1300)
    t=pg.inner_text("#romWrap")
    ok("sobrou texto" not in t,"rodape (Valor Total da Compra, Custo Separacao) nao gera aviso de texto sobrando")
    ok("confere" in t,"conferencia do romaneio continua aparecendo")
    # banho sem valor: ródio novo sem R$/g
    pg.evaluate("()=>document.querySelector('[data-act=\"rom-fechar\"]').click()");pg.wait_for_timeout(700)
    pg.get_by_text("Galvânicas e banhos",exact=True).locator("visible=true").first.click();pg.wait_for_timeout(600)
    pg.locator('#cfg [data-act="bn-pronto"]',has_text="Ródio").first.click();pg.wait_for_timeout(600)
    pg.get_by_text("Tabela e formulário",exact=False).locator("visible=true").first.click();pg.wait_for_timeout(800)
    pg.locator('button[data-act="rom-lista"]:visible',has_text="salvos").first.click();pg.wait_for_timeout(700)
    pg.locator('.rep [data-act="rom-salvo-abrir"]').first.click();pg.wait_for_timeout(1800)
    rc=pg.locator("#romWrap .rc").first
    for k in range(rc.locator(".bcard").count()):
        cb=pg.locator("#romWrap .rc").first.locator(".bcard").nth(k).locator('input[data-rp="bon"]').first
        quer="Ródio" in pg.locator("#romWrap .rc").first.locator(".bcard").nth(k).inner_text()
        if cb.is_checked()!=quer:cb.click();pg.wait_for_timeout(300)
    pg.locator('#romWrap .rc [data-rp="peso"]').first.fill("1,2");pg.locator('#romWrap .rc [data-rp="peso"]').first.dispatch_event("input");pg.wait_for_timeout(300)
    pg.locator('#romWrap .rc').first.locator('label.gi:has(input[data-id="a13"])').click();pg.wait_for_timeout(300)
    pg.locator('#romWrap .rc [data-act="rom-div"]').first.click() if pg.locator('#romWrap .rc [data-act="rom-div"]').count() else None
    pg.wait_for_timeout(400)
    ok("sem valor na galvânica" in pg.inner_text("#romWrap .rc"),"cartao avisa 'sem valor na galvanica' para o banho sem R$/g")
    pg.click("#romCriar");pg.wait_for_timeout(1200)
    ok("banho sem valor na galvânica" in pg.inner_text(".rev"),"revisao alerta banho sem valor na galvanica")
    ok(not errs,"sem erro de pagina %s"%errs[:2])
    print("FALHAS",f)
    if f:raise SystemExit(1)
