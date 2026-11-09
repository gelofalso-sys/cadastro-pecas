"""Refazer romaneio: se a peça lançada foi editada depois, avisa antes de sobrescrever com os dados guardados do romaneio."""
import os,re,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8847),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
TXT=open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read()
def col(pg,L):return pg.eval_on_selector_all('tr[data-l] td[data-c="%s"]'%L,"e=>e.map(x=>x.textContent.trim())")
def fechar(pg):
    for _ in range(3):
        for sel in ('[data-act="rel-fechar"]','[data-act="rev-fechar"]'):
            if pg.locator(sel).count():pg.locator(sel).first.click();pg.wait_for_timeout(300)
    if pg.locator('[data-act="rom-fechar"]').count():pg.click('[data-act="rom-fechar"]')
    pg.wait_for_timeout(400)
def criar(pg):
    pg.click('#romCriar');pg.wait_for_timeout(700)
    if pg.locator('[data-act="rev-ok"]').count():pg.click('[data-act="rev-ok"]');pg.wait_for_timeout(1500)
def reabrir(pg):
    pg.evaluate("document.querySelector('[data-act=rom-lista]').click()");pg.wait_for_timeout(600)
    pg.locator('.rep [data-act="rom-salvo-abrir"]').first.click();pg.wait_for_timeout(1200)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1100}).new_page()
    errs=[];msgs=[];modo={"ok":True}
    pg.on("pageerror",lambda e:errs.append(str(e)))
    def dlg(d):
        msgs.append(d.message)
        d.accept() if modo["ok"] else d.dismiss()
    pg.on("dialog",dlg)
    pg.goto("http://127.0.0.1:8847/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",TXT);pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    for i in range(pg.locator('#romWrap [data-rp="peso"]').count()):pg.locator('#romWrap [data-rp="peso"]').nth(i).fill("2")
    pg.click('[data-act="rom-div-todas"]');pg.wait_for_timeout(400)
    criar(pg);fechar(pg)
    ok(len(col(pg,"N"))>0,"romaneio criou linhas")
    # edita o peso da 1ª peça direto na peça lançada
    pg.click('tr[data-l] [data-act="editar"] >> nth=0');pg.wait_for_timeout(600)
    pg.fill("#f-N","8");pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(900)
    ok(col(pg,"N")[0]=="8","peso da peça editado para 8 na tabela: %s"%col(pg,"N")[:2])
    # refazer sem mudar o card: deve avisar; cancelando, o peso 8 fica
    reabrir(pg)
    pg.click('[data-act="rom-refazer-todas"]');pg.wait_for_timeout(500)
    msgs.clear();modo["ok"]=False
    criar(pg)
    ok(any("SOBRESCREVER" in m for m in msgs),"aviso de sobrescrita aparece: %s"%[m[:60] for m in msgs])
    fechar(pg)
    ok(col(pg,"N")[0]=="8","cancelar mantém o peso editado: %s"%col(pg,"N")[:2])
    ok(not errs,"sem erros de script: %s"%errs[:2])
    b.close()
print("\nFalhas:",len(f))
