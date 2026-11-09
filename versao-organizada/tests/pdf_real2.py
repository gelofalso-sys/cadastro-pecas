import os,sys,threading,http.server,socketserver,functools,re
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8846),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL="http://127.0.0.1:8846/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
def col(pg,L):return pg.evaluate("L=>[...document.querySelectorAll('#sheet tr[data-l]')].map(tr=>{const t=tr.querySelector('td[data-c=\"'+L+'\"]');return t?t.innerText.trim():''})",L)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge")
    for f in sys.argv[1:]:
        pg=b.new_context(viewport={"width":1500,"height":900}).new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
        pg.goto(URL);pg.wait_for_timeout(800)
        pg.set_input_files("#impFile",f);pg.wait_for_timeout(1500)
        pg.click('#impBar [data-act="imp-abrir"] >> nth=0')
        pg.wait_for_function("()=>document.querySelectorAll('#romWrap .rc').length>0",timeout=90000);pg.wait_for_timeout(1500)
        c0=pg.evaluate(r"()=>{const cs=[...document.querySelectorAll('#romWrap .rc')];const lista=cs.map(c=>{const m=c.innerText.match(/Na lista\s*(\d+)/);return m?+m[1]:null});return {n:cs.length,lista:lista.reduce((a,b)=>a+(b||0),0),prim:cs[0].innerText.slice(0,60).replace(/\n/g,' ')}}")
        print("==",f[-9:-4],c0)
        pg.evaluate("()=>{}")
        continue
        W=col(pg,"W");P=col(pg,"P");V=col(pg,"V")
        tot=sum(float(re.sub(r"[^\d,]","",x).replace(",",".") or 0) for x in W)
        print("==",f[-9:-4],"| card1:",c0);print("   linhas",len(W),"un",tot,"compra1",P[:3],"venda",V[:3],"erros",errs[:2],"toast",pg.evaluate("()=>(document.getElementById('toast')||{}).innerText||''")[:200])
        pg.context.close()
