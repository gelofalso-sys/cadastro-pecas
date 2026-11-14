"""Gera a cópia de visualização (arquivo/ao-vivo/app.html) com dados de um backup, para olhar o app no navegador.
Uso: python tools/ao_vivo.py <backup.json>   e depois:  python -m http.server 8765 --directory ../arquivo/ao-vivo"""
import json,sys,os
raiz=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));dest=os.path.join(raiz,"..","arquivo","ao-vivo");os.makedirs(os.path.join(dest,"lib"),exist_ok=True)
import shutil;shutil.copy(os.path.join(raiz,"lib","xlsx.full.min.js"),os.path.join(dest,"lib"))
b=json.load(open(sys.argv[1],encoding="utf-8"))
o={"config":b["config"],"lanc":b["lanc"][:12],"form":b["form"],"edit":None,"rasc":None}
for l in o["lanc"]:l.pop("ft",None);l.pop("ftR",None)
open(os.path.join(dest,"seed.js"),"w",encoding="utf-8").write("if(!localStorage.getItem('cadpecas4'))localStorage.setItem('cadpecas4',%s);"%json.dumps(json.dumps(o)))
h=open(os.path.join(raiz,"Cadastro_de_Pecas_unificado.html"),encoding="utf-8").read();i=h.index("<body");j=h.index(">",i)+1
open(os.path.join(dest,"app.html"),"w",encoding="utf-8").write(h[:j]+'<script src="seed.js"></script>'+h[j:])
print("ok")
