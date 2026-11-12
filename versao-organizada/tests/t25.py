import os,tempfile,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8798),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1100}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8798/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read());pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    # + Banho no cabecalho
    n0=pg.locator('#romWrap [data-rp="bn"]').count()
    pg.click('#romWrap [data-act="rom-q"][data-q="bn"]');pg.wait_for_timeout(700)   # agora leva à página completa de Galvânicas e banhos
    ok(pg.locator('[data-bh="0"] [data-act="bn-pronto"]').first.is_visible(),"＋ Banho leva à página da galvânica, com os modelos de banho")
    pg.locator('[data-bh="0"] [data-act="bn-pronto"][data-tp="negro"]').first.click();pg.wait_for_timeout(700);pg.locator('#side [data-vis="tudo"]').click();pg.wait_for_timeout(500)
    ok(pg.locator('#romWrap [data-rp="bn"]').count()==n0+1,"o banho criado na página aparece no romaneio (%d -> %d)"%(n0,pg.locator('#romWrap [data-rp="bn"]').count()))
    # 2o cartao = brinco (sem tamanhos): + P M G e + tamanho
    card=pg.locator("#romWrap .rc").nth(2)
    cat=card.locator('[data-rp="cat"]').input_value();print("categoria do cartão:",cat)
    ok(card.locator('[data-act="rom-pmg"]').count()>=1,"botão ＋ P M G no cartão")
    card.locator('[data-act="rom-pmg"]').first.click();pg.wait_for_timeout(500)
    card=pg.locator("#romWrap .rc").nth(2)
    chips=card.locator('[data-rp="gi"]').count();ok(chips>=3,"P M G criados e selecionados (%d tamanhos)"%chips)
    card.locator('[data-act="rom-q"][data-q="gi"]').first.click();pg.fill("#q1","GG");pg.press("#q1","Enter");pg.wait_for_timeout(700)
    card=pg.locator("#romWrap .rc").nth(2)
    ok(card.locator('[data-rp="gi"]').count()>=4,"＋ tamanho adiciona GG no cartão")
    # + cor da pedra
    card.locator('[data-act="rom-cor-on"]').first.click();pg.wait_for_timeout(300);card=pg.locator("#romWrap .rc").nth(2)
    card.locator('[data-act="rom-q"][data-q="cv"]').first.click();pg.fill("#q1","Azul; Lilás");pg.press("#q1","Enter");pg.wait_for_timeout(700)
    card=pg.locator("#romWrap .rc").nth(2)
    ok(card.locator('[data-rp="cs"]').count()>=2 and card.locator('[data-rp="cs"]:checked').count()==2,"＋ cor cria e marca as cores no cartão")
    ok(card.locator(".qmx").count()>=1 or card.locator(".szt").count()>=1,"tabela de quantidade por tamanho × cor aparece")
    # fornecedor e desconto por peca
    card.locator('summary, [data-act="rom-x"]').first.click() if card.locator('[data-act="rom-x"]').count() else None
    pg.wait_for_timeout(300)
    ok(pg.locator('#romWrap [data-rp="fornI"]').count()>=1 and pg.locator('#romWrap [data-rp="dscI"]').count()>=1,"fornecedor e desconto por peça nos Detalhes")
    print("erros",errs,"FALHAS",f)
