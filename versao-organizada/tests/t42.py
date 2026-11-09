"""Fórmulas e totais (auditoria): avaliador sem Function/eval, vírgula decimal, linha própria, quantidade por fórmula, desconto exato.
As funções puras são extraídas do código-fonte e rodam no Node (sem navegador)."""
import os,re,subprocess,json,tempfile
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def grab(arq,ini):
    L=open(os.path.join(D,"src","js",arq),encoding="utf-8").read().splitlines();out=[];on=False
    for l in L:
        if not on and l.startswith(ini):on=True;out.append(l);continue
        if on:
            if l[:1] in (" ","\t") :out.append(l)
            else:break
    assert out,ini
    return "\n".join(out)
src="\n".join([
 grab("11-utilidades.js","function num("),grab("11-utilidades.js","const r4="),
 grab("10-limites-e-colunas.js","const NUM="),
 grab("12-motor-linhas.js","const FORM_SEGURA"),grab("12-motor-linhas.js","const QTD_MAX"),grab("12-motor-linhas.js","function qtdPos"),
 grab("12-motor-linhas.js","function lerValor"),grab("12-motor-linhas.js","function calcExpr"),
 grab("12-motor-linhas.js","function avalF"),grab("12-motor-linhas.js","function sintaxeF"),grab("12-motor-linhas.js","function numRaw"),
 grab("13-modelo-e-variacoes.js","const r2c"),grab("13-modelo-e-variacoes.js","const kDesc"),grab("13-modelo-e-variacoes.js","const fLinha"),grab("19c-colar-romaneio.js","const rxPerigo"),

])
teste='''
const out={};
const rv={N:"5",O:"",W:"=1+1"};
out.sem_function=(()=>{const F=Function;globalThis.Function=function(){throw new Error("Function proibido")};try{return numRaw("=2*3+1",{})}finally{globalThis.Function=F}})();
out.linha=fLinha("N3*2",2);
out.calc_linha=numRaw("=N3*2",{N:"5"});
out.qtd_formula=numRaw("=1+1",rv);
out.qtd_ok=qtdPos("=1+1",rv); out.qtd_neg=qtdPos("=1-2",rv); out.qtd_frac=qtdPos("=1/2",rv);
out.virgula=numRaw("=1,5*2",{});
const lv=lerValor("=1,5*2","P",{});out.virg_f=lv.f;
out.invalida=lerValor("=1,,5*","P",{}).v;
out.paren=numRaw("=(2+3)*-4",{});
out.zero=numRaw("=1/0",{});
const k=kDesc(1.234);out.desc1=r2c(10000-10000*k);
out.desc2=r2c(2.01-2.01*kDesc(50));
out.rx1=rxPerigo("(a+)+$");out.rx2=rxPerigo("(\\d+)\\s*x");out.rx3=rxPerigo("(?:\\d*)*");
console.log(JSON.stringify(out));
'''
p=os.path.join(tempfile.gettempdir(),"t42_run.js");open(p,"w",encoding="utf-8").write(src+"\n"+teste)
r=subprocess.run(["node",p],capture_output=True,text=True,encoding="utf-8")
if r.returncode:print("FALHA node:",r.stderr[-400:]);raise SystemExit(1)
o=json.loads(r.stdout.strip().splitlines()[-1])
def ok(c,m):print(("OK    " if c else "FALHA ")+m)
ok(o["sem_function"]==7,"avaliador funciona sem Function (compatível com o cabeçalho do Netlify)")
ok(o["linha"]=="N2*2","referência reescrita para a linha real (N3 na linha 2 vira N2)")
ok(o["calc_linha"]==10,"avaliador usa a própria linha (5*2)")
ok(o["qtd_formula"]==2,"quantidade =1+1 calcula 2")
ok(o["qtd_ok"] is True and o["qtd_neg"] is False and o["qtd_frac"] is False,"quantidade por fórmula: inteiro >= 1")
ok(o["virgula"]==3,"=1,5*2 vale 3")
ok(o["virg_f"]=="1.5*2","vírgula decimal vira ponto na fórmula do arquivo")
ok(o["invalida"]=="=1,,5*","fórmula inválida vira texto, não fórmula")
ok(o["paren"]==-20,"parênteses e sinal negativo")
ok(o["zero"] is None,"divisão por zero não vira número")
ok(o["desc1"]==9876.6,"desconto 1,234% de 10.000 = 9.876,60")
ok(o["desc2"]==1.01,"2,01 com 50% = 1,01")
ok(o["rx1"] is True and o["rx3"] is True and o["rx2"] is False,"regex de romaneio com grupo repetido (ReDoS) é recusada; comum passa")
