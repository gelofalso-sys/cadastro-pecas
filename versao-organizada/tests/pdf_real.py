"""Importa PDFs reais de romaneio (passados como argumentos) e relata o que o app leu."""
import os,sys,threading,http.server,socketserver,functools,re
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8845),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL="http://127.0.0.1:8845/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge")
    for f in sys.argv[1:]:
        pg=b.new_context(viewport={"width":1500,"height":900}).new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
        pg.goto(URL);pg.wait_for_timeout(800)
        pg.set_input_files("#impFile",f);pg.wait_for_timeout(1500)
        if pg.locator('#impBar [data-act="imp-abrir"]').count():pg.click('#impBar [data-act="imp-abrir"] >> nth=0')
        
        try:pg.wait_for_function("()=>document.querySelectorAll('#romWrap .rc').length>0",timeout=90000)
        except Exception:pass
        pg.wait_for_timeout(1500)
        n=pg.locator("#romWrap .rc").count()
        info=pg.evaluate("()=>({msg:(document.querySelector('#romWrap .rom-msg,#romWrap .msg,#romWrap .hint')||{}).innerText||'',chk:(document.getElementById('romChk')||{}).innerText||'',toast:(document.getElementById('toast')||{}).innerText||''})")
        print("==",os.path.basename(f),"cartoes:",n,"erros:",errs[:2]);print("  ",info["chk"].replace("\n"," | ")[:300]);print("  ",info["msg"][:200].replace("\n"," "),"|",info["toast"][:150])
        pg.screenshot(path=os.path.join(os.environ["TEMP"],"pdf_"+os.path.basename(f)[-9:-4]+".png"))
        pg.context.close()
