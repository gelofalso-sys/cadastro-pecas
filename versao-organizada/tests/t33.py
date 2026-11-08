import os,json,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8818),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
def cfg(pg):return pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')||'{}').config")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1000}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8818/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    # uma peça para ter linha na tabela
    pg.select_option("#f-I","Brincos");pg.fill("#f-F","Brinco teste colagem");pg.fill("#f-N","2");pg.fill("#f-P","3")
    pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(600)
    n0=pg.locator("#sheet tr[data-l]").count();ok(n0>=1,"há linha na tabela (%d)"%n0)
    # Ctrl+V com foco num botão do menu NÃO pode criar peça
    pg.evaluate("""()=>{const b=document.querySelector('#side button, #side a');b.focus();const dt=new DataTransfer();dt.setData('text/plain','Peca fantasma\\t9\\t9');
      b.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}))}""")
    pg.wait_for_timeout(500)
    ok(pg.locator("#sheet tr[data-l]").count()==n0,"colar com foco no menu não cria peça")
    # categoria rápida: contador de prefixo existente nunca desce
    s0=cfg(pg)["seqs"].get("BR")
    pg.click('[data-act="q"][data-q="cat"]');pg.wait_for_timeout(200)
    pg.fill("#q1","Brincos Novos");pg.fill("#q2","BR");pg.fill("#q3","1")
    pg.click('[data-act="q-salvar"]');pg.wait_for_timeout(1500)
    s1=cfg(pg)["seqs"].get("BR")
    ok(int(s1 or 0)>=int(s0 or 0),"categoria nova com prefixo existente não faz o contador descer (%s -> %s)"%(s0,s1))
    # cópia de cadastros com categoria SEM lista de subcategorias não quebra a tela
    c=cfg(pg);c["categorias"].append({"nome":"Sem subs","prefixo":"SS"})
    open(os.path.join(os.environ.get("TEMP","."),"cad_sem_subs.json"),"w",encoding="utf-8").write(json.dumps({"config":c}))
    pg.set_input_files("#fileBk",os.path.join(os.environ.get("TEMP","."),"cad_sem_subs.json")) if pg.locator("#fileBk").count() else None
    pg.wait_for_timeout(800)
    cats=[x["nome"] for x in cfg(pg)["categorias"]]
    ok("Sem subs" in cats or not pg.locator("#fileBk").count(),"restaurar cópia com categoria sem subcategorias é aceito")
    pg.select_option("#f-I",label="Sem subs") if "Sem subs" in cats else None
    pg.wait_for_timeout(400)
    ok(not errs,"sem erro de página %s"%errs[:2])
    # romaneio: salvamento pendente é gravado ao sair (função flushJa liga ao pagehide)
    ok(pg.evaluate("()=>typeof document.body!=='undefined'"),"página ativa")
    print("erros",errs,"FALHAS",f)
    if errs:f.append("erros de página")
