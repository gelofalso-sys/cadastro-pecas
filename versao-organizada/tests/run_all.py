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
# Cenários históricos trabalham com uma galvânica de teste explícita; a instalação
# nova continua vazia e é verificada separadamente no t87 e no t88.
COM_GALVANICA=set("""t1.py t10.py t15.py t2.py t20.py t21.py t22.py t23.py t24.py t25.py t26.py t27.py t3.py t30.py t31.py t32.py t33.py t34.py t35.py t36.py t38.py t39.py t40.py t41.py t44.py t45.py t46.py t48.py t49.py t50.py t51.py t54.py t56_conjunto_romaneio.py t58.py t6.py t64_acessibilidade.py t65_categoria_conjunto.py t65_div_categoria.py t66_clique_celula.py t67_referencias_cores.py t68_referencias_tamanhos.py t69_banho_categoria_quantidade.py t69_banho_divisoes_exportacao.py t69_banho_fixo_categoria_quantidade.py t69_contas_banho.py t69_insumos.py t69_lote_por_grama_categorias.py t7.py t70_conta_tabela.py t71_romaneios_reais.py t72_romaneio_peso_e_trios.py t73_lancamento_tipos_e_variacoes.py t74_romaneio_extras.py t75_romaneio_frete_e_pendencias.py t76_subcategoria_tamanhos.py t77_lote_sem_bloqueio.py t78_baixar_selecionadas.py t79_sem_banho_por_grama.py t80_abrir_sem_idb.py t81_banho_sem_coluna_abre.py t82_lote_peso_real.py t85_lote_numerado.py t9.py""".split())
falhas=0
for n in sorted(f for f in os.listdir(AQUI) if f.startswith("t") and f.endswith(".py")):
    precisa_real=n in ("t16.py","t18.py")
    if precisa_real and not os.environ.get("CP_BACKUP"):
        print(f"{n}: pulado (defina CP_BACKUP)");continue
    comando=[sys.executable]+([os.path.join(AQUI,"fixture_galvanica.py")] if n in COM_GALVANICA else [])+[os.path.join(AQUI,n)]
    r=subprocess.run(comando,capture_output=True,text=True,encoding="utf-8",errors="replace",env={**os.environ,"PYTHONIOENCODING":"utf-8"})
    pulos=[l for l in r.stdout.splitlines() if l.startswith("PULADO") or l.startswith("pulou") or l.startswith("PULOU")]
    ruim=[l for l in r.stdout.splitlines() if l.startswith("FALHA ")]
    if r.returncode and r.stderr.strip():ruim.append(r.stderr.strip().splitlines()[-1])
    if r.returncode and not ruim:ruim.append(f"saiu com codigo {r.returncode} sem mensagem de erro: "+((r.stdout.strip().splitlines() or [''])[-1]))   # nenhum retorno nao-zero pode passar como OK
    print(f"{n}: {'FALHOU' if ruim else 'PULADO' if pulos else 'OK'}")
    for l in pulos:print("   ",l)
    for l in ruim:print("   ",l)
    falhas+=bool(ruim)
# ---- testes em Node: regressões puras (*_regressao.js e afins) e cenários com navegador (t*.js) ----
import shutil
NODE = shutil.which("node")
NP = os.environ.get("NODE_PATH") or next((c for c in (os.path.expanduser("~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"),) if os.path.isdir(c)), "")
js = sorted(f for f in os.listdir(AQUI) if f.endswith(".js") and (f.startswith("t") or f.endswith("_regressao.js") or f.startswith("banho_") or f.startswith("backup_")))
if not NODE:
    print("\nnode não encontrado: testes .js pulados")
else:
    for n in js:
        r = subprocess.run([NODE, os.path.join(AQUI, n)], capture_output=True, text=True, encoding="utf-8", errors="replace",
                           env={**os.environ, "PYTHONIOENCODING": "utf-8", **({"NODE_PATH": NP} if NP else {})}, timeout=300)
        saida = (r.stdout or "") + (r.stderr or "")
        if r.returncode and ("Cannot find module 'playwright'" in saida or "Executable doesn't exist" in saida):
            print(f"{n}: PULADO (playwright/Chrome não disponível para o Node; defina NODE_PATH)")
            continue
        ruim = r.returncode != 0
        print(f"{n}: {'FALHOU' if ruim else 'OK'}")
        if ruim:
            for l in saida.strip().splitlines()[-3:]:
                print("   ", l)
            falhas += 1
print("\nFalhas:",falhas)
sys.exit(1 if falhas else 0)
