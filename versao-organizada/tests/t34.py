import os,json,threading,http.server,socketserver,functools,tempfile
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8819),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
URL="http://127.0.0.1:8819/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1500,"height":1000},accept_downloads=True);pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(800)
    (pg.fill("#f-I","Brincos"),pg.press("#f-I","Tab"));pg.fill("#f-F","Argola");pg.fill("#f-N","2");pg.fill("#f-P","3")
    pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(600)
    # monta uma peça de anel com 2 tamanhos x 1 cor x 1 banho e recarrega
    pg.evaluate("""()=>{const o=JSON.parse(localStorage.getItem('cadpecas4'));const cat=o.config.categorias.find(c=>c.grade&&c.grade.itens&&c.grade.itens.length>2);
      const l=o.lanc[0];l.v.I=cat.nome;l.v.F='Anel teste';delete l.v.J;l.grade=cat.grade.id;l.gsel=[cat.grade.itens[0].id,cat.grade.itens[1].id];l.csel=['L:azul'];l.on={ouro:true};l.ov={};
      localStorage.setItem('cadpecas4',JSON.stringify(o))}""")
    pg.reload();pg.wait_for_timeout(900)
    n0=pg.locator("#sheet tr[data-l]").count()
    ok(n0==2,"peça de anel gera 2 linhas (tamanho × cor) (%d)"%n0)
    pg.evaluate("()=>document.querySelector('#sheet tr[data-l] [data-act=\"dup\"]').click()");pg.wait_for_timeout(600)
    n1=pg.locator("#sheet tr[data-l]").count()
    ok(n1==n0+1,"duplicar linha cria UMA linha (tamanho+cor), não uma combinação inteira (%d -> %d)"%(n0,n1))
    # exportação com filtro: só as linhas que o filtro mostra
    pg.evaluate("()=>{const i=document.getElementById('fBusca');i.value='';}")
    refs=pg.evaluate("()=>[...document.querySelectorAll('#sheet tr[data-l] td[data-c=\"E\"]')].map(x=>x.innerText.trim())")
    ok(len(refs)>=2,"há referências na tabela %s"%refs)
    alvo=refs[0].replace("Ouro","")
    pg.fill("#fBusca",alvo);pg.wait_for_timeout(500)
    with pg.expect_download(timeout=15000) as d:
        pg.evaluate("()=>document.querySelector('[data-act=\"xlsx\"]').click()")
        pg.wait_for_timeout(700)
        if pg.locator('[data-act="exp-assim"]').count():pg.evaluate("()=>document.querySelector('[data-act=\"exp-assim\"]').click()")
    nome=os.path.join(tempfile.gettempdir(),"t34_saida.xlsx");d.value.save_as(nome)
    import openpyxl
    ws=openpyxl.load_workbook(nome).active
    linhas=[r for r in ws.iter_rows(min_row=2,values_only=True) if any(v not in (None,"") for v in r)]
    ok(len(linhas)==1,"exportar com filtro de 1 referência leva só 1 linha (%d)"%len(linhas))
    ok(not errs,"sem erro de página %s"%errs[:2])
    print("erros",errs,"FALHAS",f)
    if errs:f.append("erros de página")
