"""Cadastros mudam: tudo acompanha (nomes, referências, descrições, custos). O preço de venda só existe se foi digitado na peça; o fator é só sugestão."""
import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8829),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8829/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
def col(pg,L):return pg.evaluate("L=>[...document.querySelectorAll('#sheet tr[data-l]')].map(tr=>{const t=tr.querySelector('td[data-c=\"'+L+'\"]');return t?t.innerText.trim():''})",L)
def aba(pg,nome):
    pg.get_by_text(nome,exact=True).locator("visible=true").first.click();pg.wait_for_timeout(700)
def set_(pg,sel,val,idx=0):
    pg.evaluate("a=>{const i=document.querySelectorAll(a.s)[a.i];i.value=a.v;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))}",{"s":sel,"v":val,"i":idx});pg.wait_for_timeout(500)
def volta(pg):pg.get_by_text("Tabela e formulário",exact=False).locator("visible=true").first.click();pg.wait_for_timeout(800)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(900)
    aba(pg,"Galvânicas e banhos")
    for i in range(2):set_(pg,'[data-bnf="fator"]',"3",i)   # preço de venda = custo × 3
    volta(pg)
    for desc,peso,compra,precos in (("Argola um","4","10",("100","120")),("Argola dois","6","20",None)):
        pg.fill("#f-F",desc);pg.fill("#f-N",peso);pg.fill("#f-P",compra)
        pg.fill("#f-ouro-V",precos[0] if precos else "");pg.fill("#f-prata-V",precos[1] if precos else "")
        pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(900)
    V0=col(pg,"V");E0=col(pg,"E");F0=col(pg,"F");U0=col(pg,"U");R0=col(pg,"R");P0=col(pg,"P")
    ok(V0[0] and V0[1] and not V0[2] and not V0[3],"preço só onde foi digitado (peça 1), peça 2 sai sem preço apesar do fator: %s"%V0[:4])
    # categoria: nome, prefixo, texto na descrição → acompanham
    aba(pg,"Categorias")
    ix=pg.evaluate("()=>[...document.querySelectorAll('[data-cf=\"nome\"]')].findIndex(i=>i.value==='Brincos')")
    set_(pg,'[data-cf="sufixo"]'," sufixo teste",ix)
    set_(pg,'[data-cf="prefixo"]',"ZZ",ix)
    volta(pg)
    ok(col(pg,"F")==F0 and not any("sufixo teste" in x for x in col(pg,"F")),"peças lançadas (semSufixoCat) conservam a descrição: o texto da categoria não é mais acrescentado: %s"%col(pg,"F")[0])
    ok(col(pg,"E")!=E0 and col(pg,"E")[0].startswith("ZZ"),"referência acompanha o prefixo da categoria: %s → %s"%(E0[0],col(pg,"E")[0]))
    ok(col(pg,"V")==V0,"preço de venda digitado NÃO muda (%s)"%col(pg,"V")[:4])
    # galvânica e fornecedor/padrões: custos acompanham, preço fica
    aba(pg,"Galvânicas e banhos")
    set_(pg,'[data-bhf="verniz"]',"9.99",0)
    set_(pg,'[data-bnf="fator"]',"2.5",0)   # o fator do banho mudou: peças novas calculariam outro preço
    volta(pg)
    ok(col(pg,"U")!=U0,"custo do verniz acompanha a galvânica (%s → %s)"%(U0[0],col(pg,"U")[0]))
    ok(col(pg,"V")==V0,"preço digitado e ausência de preço continuam iguais depois de mudar a galvânica")
    # editar o peso na tabela: custo muda, preço fica
    pg.locator('#sheet tr[data-ri="0"] td[data-c="N"]').first.click();pg.wait_for_timeout(500)
    pg.fill("#celIn","10");pg.keyboard.press("Enter");pg.wait_for_timeout(600)
    ok(col(pg,"R")[0]!=R0[0],"custo do banho acompanha o peso digitado (%s → %s)"%(R0[0],col(pg,"R")[0]))
    ok(col(pg,"V")[0]==V0[0],"preço de venda continua o mesmo (%s)"%col(pg,"V")[0])
    pg.keyboard.press("Escape")
    # reabrir e salvar a peça 1 mantém o preço digitado; a peça 2 continua sem preço
    pg.click("#f-F");pg.wait_for_timeout(400)
    pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(1000)
    ok(col(pg,"V")[0]==V0[0] and col(pg,"V")[1]==V0[1],"peça reaberta e salva mantém o preço digitado (%s)"%col(pg,"V")[:2])
    ok(col(pg,"V")[2]=="" and col(pg,"V")[3]=="","peça sem preço digitado continua sem preço (%s)"%col(pg,"V")[2:4])
    novoV=col(pg,"V")
    pg.reload();pg.wait_for_timeout(1300)
    ok(col(pg,"V")==novoV,"preços sobrevivem ao recarregar")
    ok(not errs,"sem erro de página %s"%errs[:2])
    print("FALHAS",f)
    if f:raise SystemExit(1)
