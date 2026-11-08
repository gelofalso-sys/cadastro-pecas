import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8827),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8827/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
def cel(pg,ri,L):return pg.locator('#sheet tr[data-ri="%d"] td[data-c="%s"]'%(ri,L)).first
def txt(pg,ri,L):return cel(pg,ri,L).inner_text().strip()
def toast(pg):return pg.evaluate("()=>{const t=document.getElementById('toast');return t&&!t.hidden?t.innerText:''}")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(900)
    # peça bruta: Brincos, 4 g, R$ 10, banhos Ouro e Prata
    pg.fill("#f-F","Argola galv");pg.fill("#f-N","4");pg.fill("#f-P","10")
    pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(900)
    n=pg.locator("#sheet tr[data-l]").count();ok(n>=2,"peça gera linhas por banho (%d)"%n)
    r0=txt(pg,0,"R");ok(r0!="","custo do banho calculado na linha 0 (%s)"%r0)
    # 1) célula calculada abre com o valor, não vazia
    cel(pg,0,"R").click();pg.wait_for_timeout(400)
    v=pg.input_value("#celIn");ok(v!="","célula de custo do banho abre com o valor atual (%s)"%v)
    # 2) setas andam: sem ter digitado, ↓ sai do editor e marca a célula de baixo
    pg.keyboard.press("ArrowDown");pg.wait_for_timeout(300)
    st=pg.evaluate("()=>{const a=document.querySelector('#sheet td.sa');return {ed:!!document.getElementById('celIn'),ri:a&&a.parentElement.dataset.ri,c:a&&a.dataset.c}}")
    ok(not st["ed"] and st["ri"]=="1" and st["c"]=="R","seta ↓ após clicar: marca a célula de baixo (%s)"%st)
    pg.keyboard.press("ArrowRight");pg.wait_for_timeout(200)
    st=pg.evaluate("()=>{const a=document.querySelector('#sheet td.sa');return a&&a.dataset.c}");ok(st=="S","seta → move para a coluna ao lado (%s)"%st)
    # 3) digitando, ← continua mexendo no texto
    cel(pg,0,"N").click();pg.wait_for_timeout(300);pg.keyboard.type("12");pg.keyboard.press("ArrowLeft");pg.wait_for_timeout(200)
    ok(pg.evaluate("()=>!!document.getElementById('celIn')"),"depois de digitar, ← mexe no cursor e não sai do campo")
    pg.keyboard.press("Escape");pg.wait_for_timeout(200)
    # 4) mensagem ao trocar a referência para uma que já existe
    import re
    ref1=re.match(r"[A-Z]+[0-9]+[A-Z]",txt(pg,0,"E")).group(0)
    cel(pg,1,"E").click();pg.wait_for_timeout(300);pg.fill("#celIn",ref1);pg.keyboard.press("Enter");pg.wait_for_timeout(500)
    t=toast(pg);print("EREFS2",pg.evaluate("()=>[...document.querySelectorAll('#sheet tr[data-ri] td[data-c=E]')].slice(0,3).map(t=>t.innerText.trim()+'|'+t.className)"));print("EREFS",pg.evaluate("()=>[...document.querySelectorAll('#sheet tr[data-ri] td[data-c=E]')].slice(0,3).map(t=>t.innerText.trim()+'|'+t.className)"),"REP" ,"repetida" in pg.evaluate("()=>document.body.innerText"));print("TOAST",t,pg.evaluate("()=>document.querySelectorAll('#sheet tr.dup,#sheet td.dup,#sheet .dup').length"));ok("Referência trocada" in t and "se ajustaram" in t,"troca de referência explica o efeito e a renumeração das outras linhas")
    pg.keyboard.press("Control+z");pg.wait_for_timeout(500)
    # 5) mudar a galvânica não altera peça já lançada
    custo0=txt(pg,0,"U")
    pg.evaluate("()=>{const b=document.querySelector('#side [data-vis]');}")
    pg.get_by_text("Galvânicas e banhos",exact=False).locator("visible=true").first.click();pg.wait_for_timeout(700)
    print("BNF",pg.locator('[data-bnf]').count(),pg.evaluate("()=>[...new Set([...document.querySelectorAll('[data-bnf]')].map(e=>e.dataset.bnf))]"),pg.evaluate("()=>document.body.dataset.vis"))
    ok(pg.locator('[data-bhf="verniz"]').count()>0,"tela de galvânicas aberta")
    pg.evaluate("()=>{const i=document.querySelector('[data-bhf=\"verniz\"]');i.value='9.99';i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))}");pg.wait_for_timeout(700)
    pg.get_by_text("Tabela e formulário",exact=False).locator("visible=true").first.click();pg.wait_for_timeout(700)
    ok(txt(pg,0,"U")==custo0,"peça já lançada NÃO muda ao alterar a galvânica (%s → %s)"%(custo0,txt(pg,0,"U")))
    # peça nova usa o valor novo
    pg.evaluate("()=>{const c=document.querySelector('[data-act=cancel]');c&&c.click()}");pg.wait_for_timeout(500)
    pg.fill("#f-F","Argola nova");pg.fill("#f-N","4");pg.fill("#f-P","10");pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(900)
    print("ERRO_FORM",pg.evaluate("()=>(document.querySelector('.err,.erro,[role=alert]')||{}).innerText"),pg.evaluate("()=>document.querySelectorAll('#sheet tr[data-l]').length"))
    novo=pg.evaluate("()=>[...document.querySelectorAll('#sheet tr[data-ri] td[data-c=\"U\"]')].map(t=>t.innerText.trim())")
    ok(any(x not in ("",custo0) for x in novo),"peça lançada depois usa o valor novo da galvânica %s"%novo)
    # 6) aplicar às lançadas
    pg.get_by_text("Galvânicas e banhos",exact=False).locator("visible=true").first.click();pg.wait_for_timeout(700)
    ok(pg.locator('[data-act="bh-aplicar"]').count()==1,"aparece o botão Aplicar às peças lançadas")
    pg.evaluate("()=>document.querySelector('[data-act=\"bh-aplicar\"]').click()");pg.wait_for_timeout(700)
    pg.get_by_text("Tabela e formulário",exact=False).locator("visible=true").first.click();pg.wait_for_timeout(700)
    ok(txt(pg,0,"U")!=custo0,"depois de aplicar, a peça antiga acompanha a galvânica (%s → %s)"%(custo0,txt(pg,0,"U")))
    # sobrevive a recarregar
    pg.reload();pg.wait_for_timeout(1200)
    ok(txt(pg,0,"U")!=custo0,"valores guardados sobrevivem ao recarregar")
    ok(not errs,"sem erro de página %s"%errs[:2])
    print("FALHAS",f)
    if f:raise SystemExit(1)
