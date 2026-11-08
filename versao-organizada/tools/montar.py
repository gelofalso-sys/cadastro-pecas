"""Monta o cadastro-pecas.html a partir de src/ (CSS e JS divididos). Uso: python tools/montar.py [saida.html]
Ordem: html/01-topo + css/* + html/02-corpo... + js/* + html/03-fim. O JS vai dentro do mesmo IIFE (sem módulos ES),
por isso o arquivo final abre direto do disco (file://) e é um arquivo só."""
import os,sys
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));S=os.path.join(RAIZ,"src")
def ler(*p):return open(os.path.join(S,*p),encoding="utf-8",newline="").read()
def lista(pasta,*manifestos):
    nomes=[]
    for m in manifestos:
        nomes+=[x.strip() for x in ler(pasta,m).split("\n") if x.strip()]
    return nomes
css="".join(ler("css",n) for n in lista("css","_ordem.txt"))
js="".join(ler("js",n) for n in lista("js","_ordem-a.txt","_ordem-b.txt"))
out=ler("html","01-topo.html")+css+ler("html","02-corpo-e-abertura-script.html")+js+ler("html","03-fim.html")
dest=sys.argv[1] if len(sys.argv)>1 else os.path.join(RAIZ,"cadastro-pecas.html")
open(dest,"w",encoding="utf-8",newline="").write(out)
print("ok",dest,len(out))
