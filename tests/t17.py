import os,tempfile
import threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8788),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1400,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8788/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(800)
    # cores em Colares (config completa)
    pg.click('[data-act="ctab"][data-id="cat"]')
    cat=pg.eval_on_selector_all('[data-cat] [data-cf="nome"]',"e=>e.map(x=>x.value)").index("Colares")
    pg.click(f'[data-cat="{cat}"] details:has([data-enter="cv"]) summary')
    pg.fill(f'[data-cat="{cat}"] [data-enter="cv"]',"Dourado; Rosé");pg.press(f'[data-cat="{cat}"] [data-enter="cv"]',"Enter");pg.wait_for_timeout(300)
    pg.fill(f'[data-cat="{cat}"] [data-cvg="padrao"]',"Rosé");pg.press(f'[data-cat="{cat}"] [data-cvg="padrao"]',"Tab")
    pg.select_option(f'[data-cat="{cat}"] [data-cvg="modoRef"]',"nome");pg.wait_for_timeout(200)
    pg.select_option(f'[data-cat="{cat}"] [data-cvg="col"]',"L");pg.wait_for_timeout(300)
    # romaneio
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read())
    pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1200)
    print("cards:",pg.locator(".rc").count())
    n=pg.locator('.rc [data-rp="cs"]').count();print("chips de cor no romaneio:",n)
    print("marcadas por padrão:",pg.locator('.rc [data-rp="cs"]:checked').count())
    pg.eval_on_selector('.rc [data-rp="cs"] >> nth=0','e=>e.click()');pg.wait_for_timeout(400)
    print("depois de clicar na 1a cor (marcadas):",pg.locator('.rc [data-rp="cs"]:checked').count())
    print("campos de quantidade por cor:",pg.locator('.rc .szt input[data-rp="q"]').count())
    card=pg.locator('.rc:has([data-rp="cs"])').first
    for inp in card.locator('.szt input[data-rp="q"]').all():inp.fill("1")
    pg.wait_for_timeout(500)
    print("PRÉVIA:",card.locator(".rc-ln, .rch").all_inner_texts()[:8])
    print(card.inner_text()[:600].replace(chr(10)," | "))
    card.scroll_into_view_if_needed()
    pg.screenshot(path=SC+r"\s_romcor.png")
    print("erros",errs)
