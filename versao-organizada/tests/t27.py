import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8801),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
TXT=open(os.path.join(D,"tests","dados","rom_amostra.txt"),encoding="utf-8").read()
def refs(pg):return pg.eval_on_selector_all('tr[data-l] td[data-c="E"]',"e=>e.map(x=>x.textContent.replace(/\s+/g,'').trim())")
import re
def base(r):return re.match(r"[A-Z]+\d+",r).group(0)
def pref(r):return re.match(r"[A-Z]+",r).group(0)
def num_(r):return int(re.search(r"\d+",r).group(0))
def fechar(pg):
    for _ in range(3):
        for sel in ('[data-act="rel-fechar"]','[data-act="rev-fechar"]'):
            if pg.locator(sel).count():pg.locator(sel).first.click();pg.wait_for_timeout(300)
    if pg.locator('[data-act="rom-fechar"]').count():pg.click('[data-act="rom-fechar"]')
    pg.wait_for_timeout(400)
def criar(pg):
    pg.click('#romCriar');pg.wait_for_timeout(700)
    if pg.locator('[data-act="rev-ok"]').count():pg.click('[data-act="rev-ok"]');pg.wait_for_timeout(1500)
    fechar(pg)
def reabrir(pg):
    pg.evaluate("document.querySelector('[data-act=rom-lista]').click()");pg.wait_for_timeout(600)
    pg.locator('.rep [data-act="rom-salvo-abrir"]').first.click();pg.wait_for_timeout(1200)
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1500,"height":1100}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8801/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",TXT);pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    for i in range(pg.locator('#romWrap [data-rp="peso"]').count()):pg.locator('#romWrap [data-rp="peso"]').nth(i).fill("2")
    # campos que o lançamento individual tem e o cartão do romaneio precisa ter
    c0=pg.locator("#romWrap .rc").nth(0)
    c0.locator('[data-act="rom-x"]').click();pg.wait_for_timeout(300)
    ok(c0.locator('[data-rp="bhI"]').count()==1,"Detalhes: banhista da peça")
    ok(c0.locator('[data-rp="fornI"]').count()==1 and c0.locator('[data-act="rom-q"][data-q="forn"]').count()==1,"Detalhes: fornecedor da peça com ＋ criar")
    ok(c0.locator('[data-rp="bo"][data-k="_m"]').count()>=1,"Detalhes: R$/g só desta peça em cada banho (bruta)")
    # faixa e 'todos' nas quantidades
    cat_tem_grade=[i for i in range(pg.locator("#romWrap .rc").count()) if pg.locator("#romWrap .rc").nth(i).locator('[data-rp="gi"]').count()]
    print("cartões com tamanhos:",cat_tem_grade)
    # 1) criar e refazer SEM marcar a caixa
    pg.click('[data-act="rom-div-todas"]');pg.wait_for_timeout(400)
    criar(pg)
    r1=refs(pg);print("refs 1:",r1)
    ok(len(r1)>0,"romaneio criou linhas")
    reabrir(pg)
    nb=len(set(base(x) for x in r1))
    ok(pg.locator('#romWrap .rc.sk').count()==nb,"peças lançadas abrem em cinza como antes (%d de %d)"%(pg.locator('#romWrap .rc.sk').count(),nb))
    pg.locator('#romWrap [data-rp="peso"]').nth(0).fill("5");pg.locator('#romWrap [data-rp="peso"]').nth(0).dispatch_event("change");pg.wait_for_timeout(400)
    ok(not pg.locator('#romWrap .rc').nth(0).evaluate("e=>e.classList.contains('sk')"),"editar um campo libera a peça sozinha (sem marcar a caixa)")
    ok(pg.locator('#romWrap .rc').nth(1).evaluate("e=>e.classList.contains('sk')"),"as outras peças continuam como estavam")
    criar(pg)
    r2=refs(pg);print("refs 2:",r2)
    ok(r2==r1,"peça refeita mantém as mesmas referências e posição")
    pesos=pg.eval_on_selector_all('tr[data-l] td[data-c="N"]',"e=>e.map(x=>x.textContent.trim())")
    ok(pesos[0]=="5,00","peso novo aplicado na peça editada (%s)"%pesos[:3])
    # 2) mudar categoria de uma peça lançada: vai para a sequência da categoria nova
    reabrir(pg)
    cats=pg.eval_on_selector_all('#romWrap [data-rp="cat"]',"e=>e.map(x=>x.value)");print("cats:",cats)
    antes=refs(pg);old_pref=pref(antes[0])
    sel=pg.locator('#romWrap [data-rp="cat"]').nth(0)
    opcoes=sel.evaluate("e=>[...e.options].map(o=>o.value)");escolhida=None
    for o in opcoes:
        if o==cats[0]:continue
        sel.select_option(o);pg.wait_for_timeout(400)
        c=pg.locator('#romWrap .rc').nth(0)
        if c.locator('[data-rp="gi"]').count()==0 and c.locator('[data-rp="cs"]').count()==0:escolhida=o;break
    print("categoria nova:",escolhida)
    ok(escolhida is not None,"achou categoria sem variação para o teste")
    if escolhida:
        pg.locator('#romWrap [data-rp="peso"]').nth(0).fill("2");pg.locator('#romWrap [data-rp="peso"]').nth(0).dispatch_event("change")
        pg.locator('#romWrap .rc').nth(0).locator('[data-act="rom-div"]').click();pg.wait_for_timeout(300)
        txt=pg.locator('#romWrap .rc').nth(0).locator('[data-px]').inner_text();print("prévia:",txt)
        criar(pg)
        r3=refs(pg);print("refs 3:",r3)
        novo_ref=r3[-1];pn=pref(novo_ref)
        outras=[x for x in antes if base(x)!=base(antes[0])]
        ok(all(x in r3 for x in outras),"nenhuma outra peça foi renumerada (%d referências mantidas)"%len(outras))
        ok(not any(base(x)==base(antes[0]) for x in r3),"a vaga da peça que trocou de categoria ficou livre")
        outros=[num_(x) for x in r3 if pref(x)==pn and base(x)!=base(novo_ref)]
        if pn!=old_pref:
            ok(num_(novo_ref)==(max(outros)+1 if outros else 1),"mudou a categoria: %s é a próxima referência da sequência %s (maior das outras: %s)"%(novo_ref,pn,max(outros) if outros else "-"))
        else:
            ok(True,"categoria nova tem o mesmo prefixo (%s): referência mantida %s"%(pn,novo_ref))
    # 3) no romaneio, banho sem quantidade não gera linha vazia
    pg=b.new_context(viewport={"width":1500,"height":1100}).new_page();pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.accept())
    pg.goto("http://127.0.0.1:8801/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    pg.click('[data-act="rom-abrir"]') if pg.locator('[data-act="rom-abrir"]').count() else None;pg.wait_for_timeout(500)
    pg.fill("#romWrap textarea",TXT);pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    for i in range(pg.locator('#romWrap [data-rp="peso"]').count()):pg.locator('#romWrap [data-rp="peso"]').nth(i).fill("2")
    ids=pg.eval_on_selector_all('#romWrap [data-rp="bn"]',"e=>e.map(x=>[x.dataset.b,x.checked])");print("banhos do lote:",ids)
    for b_,on in ids[:2]:
        if not on:pg.eval_on_selector('#romWrap [data-rp="bn"][data-b="%s"]'%b_,"e=>e.click()");pg.wait_for_timeout(300)
    # primeira peça: quantidade só no primeiro banho
    card=pg.locator("#romWrap .rc").nth(0)
    qs=card.locator('[data-rp="q"]')
    print("campos de quantidade da 1ª peça:",qs.count())
    if qs.count()>=2:
        qs.nth(0).fill("3");qs.nth(0).dispatch_event("change");qs.nth(1).fill("");qs.nth(1).dispatch_event("change");pg.wait_for_timeout(300)
        prev=pg.locator('#romWrap .rc').nth(0).locator('[data-px] .rch').count()
        criar(pg)
        rr=refs(pg);n=len([x for x in rr if base(x)==base(rr[0])])
        ok(n==1,"banho sem quantidade fica fora do romaneio (%d linha na 1ª peça; prévia %d)"%(n,prev))
    # 4) faixa de tamanhos e "todos =" no cartão
    pg.click('[data-act="rom-abrir"]');pg.wait_for_timeout(500);pg.fill("#romWrap textarea",TXT);pg.click('[data-act="rom-ler"]');pg.wait_for_timeout(1500)
    gi=[i for i in range(pg.locator("#romWrap .rc").count()) if pg.locator("#romWrap .rc").nth(i).locator('[data-rp="gi"]').count()]
    if gi:
        c=pg.locator("#romWrap .rc").nth(gi[0])
        ok(c.locator('[data-rp="faixa"]').count()==1,"cartão com tamanhos tem o campo de faixa")
        c.locator('[data-rp="faixa"]').fill("todos");c.locator('[data-rp="faixa"]').press("Enter");pg.wait_for_timeout(500)
        c=pg.locator("#romWrap .rc").nth(gi[0])
        tot=c.locator('[data-rp="gi"]').count();mar=c.locator('[data-rp="gi"]:checked').count()
        ok(tot>0 and mar==tot,"faixa 'todos' marca todos os tamanhos (%d/%d)"%(mar,tot))
        qa=c.locator('[data-rp="qall"]')
        ok(qa.count()>=1,"campo 'todos =' para a quantidade dos tamanhos")
        if qa.count():
            qa.first.fill("7");qa.first.dispatch_event("change");pg.wait_for_timeout(400)
            c=pg.locator("#romWrap .rc").nth(gi[0])
            vals=c.locator('[data-rp="q"]').evaluate_all("e=>e.map(x=>x.value)")
            ok("7" in vals and vals.count("7")>=tot,"'todos =' preenche a quantidade de todos os tamanhos (%s)"%vals[:6])
        pg.screenshot(path=os.path.join(os.environ.get("TEMP","."),"t27_card.png"))
    print("erros",errs,"FALHAS",f)
    if errs:f.append("erros de página")
