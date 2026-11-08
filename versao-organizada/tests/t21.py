import os,tempfile
import threading,http.server,socketserver,functools,json
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8793),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1400,"height":1000});pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8793/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    ok(pg.locator(".guia").count()==1,"guia rápido aparece na primeira vez")
    pg.click('[data-act="guia-fechar"]');pg.wait_for_timeout(200);ok(pg.locator(".guia").count()==0,"guia fecha")
    pg.fill("#f-F","Peça B");pg.fill("#f-N","2");pg.fill("#f-P","10")
    for i in pg.eval_on_selector_all("[data-on]","e=>e.map(x=>x.dataset.on)"):
        if not pg.is_checked('[data-on="%s"]'%i):pg.check('[data-on="%s"]'%i)
    for i in pg.eval_on_selector_all('[id^="f-"][id$="-W"]',"e=>e.map(x=>x.id)"):pg.fill('[id="%s"]'%i,"1")
    pg.click('button:has-text("Adicionar") >> nth=0');pg.wait_for_timeout(700)
    pg.click('[data-act="ctab"][data-id="opc"]');pg.wait_for_timeout(500)
    print("status:",pg.inner_text("#bkStatus"))
    # pasta do navegador (OPFS) no lugar do seletor de pasta
    pg.evaluate("""async()=>{const h=await navigator.storage.getDirectory();const d=await h.getDirectoryHandle('bkteste',{create:true});
      await new Promise((ok,no)=>{const rq=indexedDB.open('cadpecas-big',3);rq.onsuccess=()=>{const tx=rq.result.transaction('pontos','readwrite');tx.objectStore('pontos').put(d,'pasta');tx.oncomplete=ok;tx.onerror=no};rq.onerror=no})}""")
    pg.click('[data-act="ctab"][data-id="cat"]');pg.click('[data-act="ctab"][data-id="opc"]');pg.wait_for_timeout(500)
    print("status:",pg.inner_text("#bkStatus"))
    pg.click('[data-act="bk-agora"]');pg.wait_for_timeout(1500)
    arq=pg.evaluate("""async()=>{const h=await navigator.storage.getDirectory();const d=await h.getDirectoryHandle('bkteste');const out=[];for await(const [n,fh] of d.entries()){const t=await (await fh.getFile()).text();out.push([n,t.length,JSON.parse(t).lanc.length])}return out}""")
    print(arq)
    ok(len(arq)==1 and arq[0][0].startswith("cadastro-pecas-auto-") and arq[0][2]>0,"arquivo diário gravado com as peças")
    print(pg.inner_text("#bkStatus"))
    print("erros",errs,"FALHAS",f)
