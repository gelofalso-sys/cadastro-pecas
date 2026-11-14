"""Importar planilha: só sugere coluna que tem dado (ID vazio não vira código)."""
import os,tempfile,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
import openpyxl
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8849),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
wb=openpyxl.Workbook();ws=wb.active
ws.append(["ID","Referência","Descrição","Quantidade","Preço de Varejo","Peso"])
ws.append([None,"AB10","Brinco x",2,0,0]);ws.append([None,"AB11","Colar y",1,19.9,3.5])
nome=os.path.join(tempfile.gettempdir(),"t47.xlsx");wb.save(nome)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":950}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8849/cadastro-pecas.html");pg.wait_for_timeout(900)
    pg.set_input_files("#impFile",nome);pg.wait_for_timeout(1500)
    if pg.locator("text=Abrir o primeiro").count():pg.click("text=Abrir o primeiro")   # um arquivo só abre sozinho; com arquivo repetido ou vários, a fila continua
    pg.wait_for_timeout(1500)
    # Planilhas no formato do sistema são reconhecidas pelo cabeçalho e dispensam o mapeamento de colunas.
    if pg.locator('select[data-k="cod"]').count():
        sel=pg.eval_on_selector('select[data-k="cod"]',"e=>e.selectedOptions[0].text")
        ok("Referência" in sel,"código vem da coluna Referência, não do ID vazio: %s"%sel)
        prev=pg.inner_text(".prevg")
    else:
        prev=pg.inner_text("#romWrap")
        ok("Formato do sistema identificado" in prev and "AB10" in prev and "Colar y" in prev,"formato do sistema: código vem da coluna Referência, não do ID vazio")
    ok("AB10" in prev and "Brinco x" in prev,"prévia mostra os dados da planilha")
    pg.click('[data-act="rom-plan-ok"]');pg.wait_for_timeout(1500)
    ok(pg.locator("#romWrap").count()>0 and not errs,"planilha com preço 0 e peso 0 importa sem bloquear: %s"%errs[:2])
    b.close()
print("\nFalhas:",len(f))
