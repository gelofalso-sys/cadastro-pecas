"""Roda todos os testes do Cadastro de Pecas (Playwright + Edge).
Uso:  python tests/run_all.py
Requer: pip install playwright openpyxl   (usa o Edge instalado: channel="msedge")
Opcional: defina CP_BACKUP com o caminho de um backup completo real para os testes com dados reais."""
import os,subprocess,sys,tempfile
AQUI=os.path.dirname(os.path.abspath(__file__));RAIZ=os.path.dirname(AQUI)
# o wrapper (ignorado pelo git) e montado a partir do fragmento
frag=open(os.path.join(RAIZ,"cadastro-pecas.html"),encoding="utf-8",newline="").read()
head='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cadastro de Pecas</title></head><body>\n'
open(os.path.join(RAIZ,"Cadastro de Pecas - abrir no Chrome.html"),"w",encoding="utf-8",newline="").write(head+frag+"\n</body></html>\n")
try:
    import openpyxl
    wb=openpyxl.Workbook();ws=wb.active
    ws.append(["Pedido de teste"]);ws.append([]);ws.append(["Ref","Produto","Qtd.","Preço unit.","Total"])
    ws.append(["A100","Brinco argola lisa",3,"5,50","16,50"]);ws.append(["A101","Colar choker perola",2,"8,20","16,40"]);ws.append(["A102","Anel solitario",0,"4,00","0"])
    wb.save(os.path.join(tempfile.gettempdir(),"ped_teste.xlsx"))
except Exception as e:
    print("openpyxl ausente:",e)
falhas=0
for n in sorted(f for f in os.listdir(AQUI) if f.startswith("t") and f.endswith(".py")):
    precisa_real=n in ("t16.py","t18.py")
    if precisa_real and not os.environ.get("CP_BACKUP"):
        print(f"{n}: pulado (defina CP_BACKUP)");continue
    r=subprocess.run([sys.executable,os.path.join(AQUI,n)],capture_output=True,text=True,encoding="utf-8",errors="replace",env={**os.environ,"PYTHONIOENCODING":"utf-8"})
    ruim=[l for l in r.stdout.splitlines() if l.startswith("FALHA ")]
    if r.returncode and r.stderr.strip():ruim.append(r.stderr.strip().splitlines()[-1])
    print(f"{n}: {'OK' if not ruim else 'FALHOU'}")
    for l in ruim:print("   ",l)
    falhas+=bool(ruim)
print("\nFalhas:",falhas)
sys.exit(1 if falhas else 0)
