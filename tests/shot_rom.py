import os,tempfile,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8797),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1100}).new_page()
    pg.goto("http://127.0.0.1:8797/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="ctab"][data-id="banho"]')
    for tp in ["rodio","negro","outro"]:pg.click(f'[data-bh="0"] [data-act="bn-pronto"][data-tp="{tp}"]');pg.wait_for_timeout(150)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read());pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    print("banhos no cabeçalho:",pg.eval_on_selector_all('#romWrap [data-rp="bn"]',"e=>e.length"))
    print("banhos no 1o cartão:",pg.locator('#romWrap .rc >> nth=0').locator('[data-rp="bon"]').count())
    pg.locator("#romWrap").scroll_into_view_if_needed()
    pg.screenshot(path=os.path.join(SC,"s_romfull.png"),full_page=False)
    pg.locator("#romWrap .rc >> nth=0").screenshot(path=os.path.join(SC,"s_romcard.png"))
