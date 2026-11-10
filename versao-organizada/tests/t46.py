"""Auditoria de cenário: referências fixas não geram aviso 'digitada à mão'; Preço de Varejo de peça pronta não vaza para a bruta seguinte; quantidade inválida escondida não bloqueia peça pronta; planilha sai com formato de moeda."""
import os,tempfile,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
import openpyxl
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8848),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
def col(pg,L):return pg.eval_on_selector_all('tr[data-l] td[data-c="%s"]'%L,"e=>e.map(x=>x.textContent.trim())")
def nl(pg):return pg.locator('#sheet tr[data-l]').count()
def preenche(pg,tipo,forn,cat,sub,F,N,P):
    pg.click(f'[data-tipo="{tipo}"]');pg.fill("#f-H",forn);pg.press("#f-H","Tab");pg.fill("#f-I",cat);pg.press("#f-I","Tab");pg.wait_for_timeout(250)
    pg.fill("#f-J",sub);pg.press("#f-J","Tab");pg.fill("#f-F",F);pg.fill("#f-N",N);pg.fill("#f-P",P)
def add(pg):
    n=nl(pg);pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(800);return nl(pg)-n
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":950},accept_downloads=True).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8848/cadastro-pecas.html");pg.wait_for_timeout(900)
    preenche(pg,"bruta","xangai","Brincos","Argolas","Argola A","2,5","12,90");pg.fill("#f-ouro-W","3");pg.fill("#f-prata-W","2")
    ok(add(pg)==2,"bruta 1 adicionada")
    preenche(pg,"bruta","Rosah","Colares","Correntes","Corrente B","8,35","45,99");pg.fill("#f-ouro-W","1");pg.fill("#f-prata-W","1")
    ok(add(pg)==2,"bruta 2 adicionada")
    ok("digitada à mão" not in pg.inner_text("body"),"sem aviso falso de 'digitada à mão' com referências automáticas")
    # quantidade inválida numa bruta, depois peça pronta: não pode ficar bloqueada por um campo escondido
    preenche(pg,"bruta","xangai","Brincos","Argolas","Teste","2","10");pg.fill("#f-ouro-W","0");pg.fill("#f-prata-W","0")
    ok(add(pg)==0,"quantidade 0 recusada na bruta")
    preenche(pg,"pronta","Evidência","Pulseiras","","Pulseira C","4","33,33");pg.fill("#f-W","4");pg.fill("#f-V","99,90")
    ok(add(pg)==1,"peça pronta adicionada apesar da quantidade 0 que sobrou escondida")
    # preço da pronta não vaza para a bruta seguinte
    preenche(pg,"bruta","xangai","Brincos","Argolas","Argola D","3","11");pg.fill("#f-ouro-W","1");pg.fill("#f-prata-W","1")
    ok(add(pg)==2,"bruta 3 adicionada")
    V=col(pg,"V");F=col(pg,"F")
    vz=[v for v,x in zip(V,F) if x.startswith("Argola D")]
    ok(vz and all(v=="" for v in vz),"bruta depois de pronta não herda o Preço de Varejo: %s"%vz)
    with pg.expect_download(timeout=20000) as d:
        pg.evaluate("()=>document.querySelector('[data-act=\"xlsx\"]').click()");pg.wait_for_timeout(900)
        if pg.locator('[data-act="exp-assim"]').count():pg.evaluate("()=>document.querySelector('[data-act=\"exp-assim\"]').click()")
    nome=os.path.join(tempfile.gettempdir(),"t46.xlsx");d.value.save_as(nome)
    ws=openpyxl.load_workbook(nome).active;h=[c.value for c in ws[1]]
    ok(ws.cell(2,h.index("Custo de Compra")+1).number_format=="0.00","Custo de Compra com 2 casas: %s"%ws.cell(2,h.index("Custo de Compra")+1).number_format)
    ok(ws.cell(2,h.index("Custo do Banho de Ouro")+1).number_format=="0.00","banho com 2 casas")
    ok(ws.cell(2,h.index("Peso")+1).number_format=="0.000","peso com 3 casas")
    # peso conserva milésimos e compra é arredondada a centavos; zero é aceito
    preenche(pg,"pronta","Spina Joias","Pingentes","","Zero e casas","1,2345","9,999");pg.fill("#f-W","1")
    ok(add(pg)==1,"peça com 3 casas adicionada")
    preenche(pg,"pronta","Spina Joias","Pingentes","","Tudo zero","0","0");pg.fill("#f-W","1")
    ok(add(pg)==1,"peso 0 e compra 0 não bloqueiam")
    F=col(pg,"F");N=col(pg,"N");P=col(pg,"P")
    i=F.index("Zero e casas");ok((N[i],P[i])==("1,235","10,00"),"peso com milésimos e compra com 2 casas: %s %s"%(N[i],P[i]))
    # custo total = soma exata dos componentes mostrados
    tx=pg.evaluate("()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length>=5&&/Custo total/.test(x.innerText)&&/^Pe/.test(x.innerText.trim())&&x.innerText.length<400);return e?e.innerText:''}")
    import re
    v=lambda k:float(re.search(k+r"\s*R\$\s*([\d.]+,\d\d)",tx).group(1).replace(".","").replace(",","."))
    soma=round(v("Compra")+v("Insumos")+v("Banhos")+v("Verniz"),2)
    ok(abs(soma-v("Custo total"))<0.001,"Custo total %s = soma dos componentes %s"%(v("Custo total"),soma))
    ok(not errs,"sem erros de script: %s"%errs[:2])
    b.close()
print("\nFalhas:",len(f))
