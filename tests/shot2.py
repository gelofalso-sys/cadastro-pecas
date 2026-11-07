import os,tempfile,threading,http.server,socketserver,functools,sys
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SC=tempfile.gettempdir()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8800),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
modo=sys.argv[1] if len(sys.argv)>1 else "bruta"
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1100}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8800/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(400)
    if modo=="pronta":
        pg.click('[data-act="rom-tipo"][data-v="pronta"]');pg.wait_for_timeout(300)
        for i in pg.eval_on_selector_all('#romWrap [data-rp="bn"]',"e=>e.map(x=>x.dataset.b)")[:2]:pg.eval_on_selector('#romWrap [data-rp="bn"][data-b="%s"]'%i,"e=>e.click()");pg.wait_for_timeout(200)
    pg.fill("#romWrap textarea",open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read());pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    for k in range(pg.locator('#romWrap [data-rp="peso"]').count()):pg.locator('#romWrap [data-rp="peso"]').nth(k).fill("2")
    pg.click('[data-act="rom-div-todas"]');pg.wait_for_timeout(300)
    for el in pg.locator('#romWrap [data-rp="mkg"]').all():el.fill("3")
    pg.wait_for_timeout(900)
    print("MODO",modo)
    print("data-cb:",pg.eval_on_selector_all('#romWrap [data-cb]',"e=>e.slice(0,4).map(x=>x.textContent)"))
    print("auto V:",pg.eval_on_selector_all('#romWrap [data-auto^="V:"]',"e=>e.slice(0,4).map(x=>[x.value,x.placeholder])"))
    print("px:",pg.eval_on_selector_all('#romWrap [data-px]',"e=>e.slice(0,3).map(x=>x.textContent)"))
    print("romTot:",pg.inner_text("#romTot") if pg.locator("#romTot").count() else "-")
    print("soma:",pg.eval_on_selector_all('#romWrap [data-soma]',"e=>e.slice(0,3).map(x=>x.textContent)"))
    print("base:",pg.eval_on_selector_all('#romWrap [data-cbase]',"e=>e.slice(0,3).map(x=>x.textContent)"))
    print("erros",errs)
    pg.locator("#romWrap .rc").first.screenshot(path=os.path.join(SC,"s_rc_%s.png"%modo))
