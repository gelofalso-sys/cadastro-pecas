"""Auditoria 2: peso/quantidade com compra com desconto, ROUND do XLSX em banho automatico, resumo da tabela salva e aviso de quantidade ajustada."""
import os,subprocess,json,tempfile,re
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import glob
def _fontes(arq):
    """texto do arquivo de src/js seguido do núcleo (src/core, sem export): o código puro mudou de arquivo, não de comportamento"""
    t=[open(os.path.join(D,"src",*arq.split("/")) if "/" in arq else os.path.join(D,"src","js",arq),encoding="utf-8").read()]
    for f in sorted(glob.glob(os.path.join(D,"src","core","*.js"))):
        t.append(re.sub(r'(?m)^export\s+(?=(?:async\s+function|function|const|let|var|class)\b)','',open(f,encoding="utf-8").read()))
    return chr(10).join(t)
rd=_fontes
def grab(arq,ini):
    L=rd(arq).splitlines();out=[];on=False
    for l in L:
        if not on and l.startswith(ini):on=True;out.append(l);continue
        if on:
            if l[:1] in (" ","	"):out.append(l)
            else:
                if l.startswith("}"):out.append(l)
                break
    assert out,ini
    return "\n".join(out)
src="\n".join([grab("11-utilidades.js","function num("),grab("11-utilidades.js","const r4="),grab("11-utilidades.js","const vazio") if "const vazio" in rd("11-utilidades.js") else "const vazio=v=>v==null||String(v).trim()===''",
 grab("10-limites-e-colunas.js","const NUM="),
 grab("12-motor-linhas.js","const FORM_SEGURA"),grab("12-motor-linhas.js","const QTD_MAX"),grab("12-motor-linhas.js","function qtdPos"),grab("12-motor-linhas.js","function lerValor"),
 grab("12-motor-linhas.js","function calcExpr"),grab("12-motor-linhas.js","function avalF"),grab("12-motor-linhas.js","function sintaxeF"),
 grab("12-motor-linhas.js","function numRaw"),grab("12-motor-linhas.js","const pesoLinha"),grab("12-motor-linhas.js","function calcBanho"),
 grab("13-modelo-e-variacoes.js","const r2c"),grab("13-modelo-e-variacoes.js","const kDesc"),grab("13-modelo-e-variacoes.js","function valorCol"),"const valorCol=(...a)=>valorCol$(null,...a);"])
teste='''
const out={};
const rw={desconto:50,v:{P:"10",N:"=P2*2"},banho:{coluna:"R",mult:1.5,modo:"peso"}};
out.peso=pesoLinha(rw);out.banho=calcBanho(rw,"R",2).v;
out.qtd=qtdPos("=P2",{P:"3"},50);out.qtd_sem=qtdPos("=P2",{P:"3"});
out.xl=valorCol({tipo:"dinheiro"},{v:1.005,f:"N2*1.005"});
console.log(JSON.stringify(out));
'''
p=os.path.join(tempfile.gettempdir(),"t43_run.js");open(p,"w",encoding="utf-8").write(src+"\n"+teste)
r=subprocess.run(["node",p],capture_output=True,text=True,encoding="utf-8")
if r.returncode:print("FALHA node:",r.stderr[-600:]);raise SystemExit(1)
o=json.loads(r.stdout.strip().splitlines()[-1])
res=[]
def ok(c,m):print(("OK    " if c else "FALHA ")+m);res.append(c)
ok(o["peso"]==10,"peso =P2*2 com compra 10 e desconto 50% = 10 g")
ok(o["banho"]==15,"banho 1,50/g sobre 10 g = 15 (igual ao Excel)")
ok(o["qtd"] is False and o["qtd_sem"] is True,"quantidade =P2 com compra 3 e desconto 50% = 1,5: reprovada")
ok(o["xl"]["f"]=="ROUND(N2*1.005,2)" and o["xl"]["v"]==1.01,"banho automatico em coluna de dinheiro: formula com ROUND, valor 1,01")
ok("n(\"W\")" in rd("fatias/tabelas/19d2-tabelas-salvar-e-ver.js") and "c.calc" in rd("fatias/tabelas/19d2-tabelas-salvar-e-ver.js"),"resumo da tabela salva usa o resultado das formulas")
ok("x.q.p!==undefined" in rd("fatias/romaneio/21a6-campos-e-leitura.js"),"trocar fornecedor/tipo/banho avisa quando a quantidade ajustada difere da lista")
raise SystemExit(0 if all(res) else 1)
