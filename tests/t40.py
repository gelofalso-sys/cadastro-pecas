"""Auditoria independente das fórmulas: recalcula em Python (fora do app) e compara com a tabela e com o arquivo exportado."""
import os,re,json,random,threading,http.server,socketserver,functools,tempfile
from decimal import Decimal,ROUND_HALF_UP
from playwright.sync_api import sync_playwright
import openpyxl
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8828),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
def r2(x):return float(Decimal(repr(x)).quantize(Decimal("0.01"),rounding=ROUND_HALF_UP))
def num(s):
    s=str(s).strip().replace(".","").replace(",",".") if "," in str(s) else str(s).strip()
    return float(s) if s not in ("","None") else None
random.seed(7)
URL="http://127.0.0.1:8828/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html"
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");ctx=b.new_context(viewport={"width":1500,"height":900},accept_downloads=True);pg=ctx.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto(URL);pg.wait_for_timeout(800)
    cfg=pg.evaluate("()=>{const t=localStorage.getItem('cadpecas4');return t?JSON.parse(t).config:null}")
    if not cfg:
        pg.fill("#f-F","x");pg.fill("#f-N","1");pg.fill("#f-P","1");pg.click('button.btn.pri.big[type="submit"]');pg.wait_for_timeout(1200)
        cfg=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config")
    bh=cfg["banhistas"][0];verniz=float(str(bh["verniz"]).replace(",","."))
    banhos={x["id"]:x for x in bh["banhos"]}
    print("galvanica",bh["nome"],"verniz",verniz,{k:(v["mult"],v["coluna"],v.get("fator")) for k,v in banhos.items()})
    # peças com valores variados, direto no armazenamento
    lanc=[];casos=[]
    for i in range(14):
        peso=round(random.uniform(0.3,14),2);compra=round(random.uniform(0.5,40),2);ins=round(random.uniform(0,2),2);desc=random.choice([0,0,5,10,15])
        mk={"ouro":round(random.uniform(3,7),4),"prata":round(random.uniform(3,7),4)}
        l={"id":"t%d"%i,"tipo":"bruta","desconto":str(desc),"banhista":bh["id"],"v":{"I":"Brincos","F":"Peca %d"%i,"N":str(peso).replace(".",","),"P":str(compra).replace(".",","),"Q":str(ins).replace(".",",")},"on":{"ouro":True,"prata":True},"ov":{},"vz":{},"mk":mk,"vinc":False,"grade":"","gsel":[],"semGrade":False}
        lanc.append(l);casos.append((peso,compra,ins,desc,mk))
    pg.evaluate("a=>{const o=JSON.parse(localStorage.getItem('cadpecas4'));o.lanc=a;localStorage.setItem('cadpecas4',JSON.stringify(o))}",lanc);pg.reload();pg.wait_for_timeout(1500)
    rows=pg.evaluate("()=>[...document.querySelectorAll('#sheet tr[data-l]')].map(tr=>{const g=L=>{const t=tr.querySelector('td[data-c=\"'+L+'\"]');return t?t.innerText.trim():''};return {l:tr.dataset.l,N:g('N'),P:g('P'),Q:g('Q'),R:g('R'),S:g('S'),T:g('T'),U:g('U'),V:g('V')}})")
    ok(len(rows)==28,"28 linhas (14 peças × 2 banhos): %d"%len(rows))
    erros=[]
    for rw in rows:
        i=int(rw["l"][1:]);peso,compra,ins,desc,mk=casos[i]
        banho="ouro" if rows.index(rw)%2==0 else "prata"
        # ordem das linhas: por peça (A depois B)
        pr=banhos[banho];col=pr["coluna"];mult=float(str(pr["mult"]).replace(",","."))
        compra_c=r2(compra-compra*round(desc/100,4))
        exp={"P":compra_c,"Q":ins,col:round(peso*mult,4),"U":round(peso*verniz,4)}
        total=compra_c+ins+round(peso*mult,4)+round(peso*verniz,4)
        ok_v=(rw["V"]=="")
        if not ok_v:erros.append((rw["l"],banho,"V deveria estar vazio",rw["V"]))
        for L,e in exp.items():
            got=num(rw[L])
            if got is None or abs(got-e)>0.0051:erros.append((rw["l"],banho,L,rw[L],e))
    ok(not erros,"tabela confere com o cálculo independente (%d divergências) %s"%(len(erros),erros[:4]))
    # exportação: custos do arquivo (fórmulas) recalculados fora do app; preço de venda sai vazio quando não foi digitado
    with pg.expect_download(timeout=20000) as d:
        pg.evaluate("()=>document.querySelector('[data-act=\"xlsx\"]').click()");pg.wait_for_timeout(900)
        if pg.locator('[data-act="exp-assim"]').count():pg.evaluate("()=>document.querySelector('[data-act=\"exp-assim\"]').click()")
    nome=os.path.join(tempfile.gettempdir(),"t40.xlsx");d.value.save_as(nome)
    ws=openpyxl.load_workbook(nome).active;hdr=[c.value for c in ws[1]]
    def idx(h):return hdr.index(h)+1
    cache={}
    def val(r,c):
        k=(r,c)
        if k in cache:return cache[k]
        x=ws.cell(r,c).value
        if isinstance(x,str) and x.startswith("="):
            fx=re.sub(r"([A-Z]{1,2})(\d+)",lambda m:"val(%s,%d)"%(m.group(2),openpyxl.utils.column_index_from_string(m.group(1))),x[1:]).replace("ROUND(","rnd(")
            x=eval(fx,{"val":val,"rnd":lambda a,n:r2(a) if n==2 else round(a,n)})
        elif isinstance(x,str):x=num(x)
        cache[k]=0 if x is None else x
        return cache[k]
    n=0;dif=[];vazios=0
    for r in range(2,ws.max_row+1):
        if ws.cell(r,idx("Referência")).value is None:continue
        n+=1
        if ws.cell(r,idx("Preço de Varejo")).value in (None,""):vazios+=1
        pr=num(ws.cell(r,idx("Custo de Compra")).value) if not str(ws.cell(r,idx("Custo de Compra")).value).startswith("=") else val(r,idx("Custo de Compra"))
    ok(n==28 and vazios==28,"arquivo: 28 linhas e preço de venda vazio nas 28 (%d linhas, %d vazias)"%(n,vazios))
    # sugestão pelo fator: no formulário (placeholder), conferida fora do app
    fatores={"ouro":3.2,"prata":4.15}
    pg.reload();pg.wait_for_timeout(1200)
    cfg2=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config");cat=[c for c in cfg2['categorias'] if c['nome']=='Brincos'][0]
    ins=num(cat.get('insumos') if cat.get('insumos') not in (None,'') else cfg2['colcfg']['Q'].get('padrao') or 0) or 0
    falhas=[]
    for peso,compra in ((1,1),(4,10),(7.5,22.3),(0.8,3.5)):
        pg.fill("#f-F","sug");pg.fill('#form [data-mk="ouro"]',"3,2");pg.fill('#form [data-mk="prata"]',"4,15");pg.wait_for_timeout(300);pg.fill("#f-N",str(peso).replace(".",","));pg.fill("#f-P",str(compra).replace(".",","));pg.wait_for_timeout(1100)
        ph=pg.evaluate("()=>[...document.querySelectorAll('[data-ph$=\"-V\"]')].map(i=>i.placeholder)")
        if (peso,compra)==(1,1):continue
        for banho,txt_ in zip(("ouro","prata"),ph[:2]):
            pr=banhos[banho];mult=float(str(pr["mult"]).replace(",","."))
            total=r2(compra)+ins+round(peso*mult,4)+round(peso*verniz,4)
            esp=r2(total*fatores[banho]);got=num(re.search(r"([0-9.,]+)",txt_.replace("R$","")).group(1)) if txt_ else None
            if got is None or abs(got-esp)>0.011:falhas.append((peso,compra,banho,txt_,esp))
    ok(not falhas,"sugestão de preço do formulário (custo × fator) confere fora do app %s"%falhas[:2])
    ok(not errs,"sem erro de página %s"%errs[:2])
    print("FALHAS",f)
    if f:raise SystemExit(1)
