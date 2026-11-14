"""Roda todos os testes do Cadastro de Pecas (Playwright + Edge).
Uso:  python tests/run_all.py
Requer: pip install playwright openpyxl   (usa o Edge instalado: channel="msedge")
Opcional: defina CP_BACKUP com o caminho de um backup completo real para os testes com dados reais."""
import os,subprocess,sys,tempfile,shutil
for _f in (sys.stdout,sys.stderr):
    try:_f.reconfigure(encoding='utf-8',errors='replace')   # o console do Windows (cp1252) não imprime ⚠ nem ✓
    except Exception:pass
AQUI=os.path.dirname(os.path.abspath(__file__));RAIZ=os.path.dirname(AQUI)
# Casos autônomos de auditoria também fazem parte da suíte; scripts com PDFs ou
# argumentos manuais não são executados silenciosamente como testes automáticos.
def testes_python():
    return sorted(f for f in os.listdir(AQUI) if (f.startswith("t") and f.endswith(".py")) or f in ("auditoria_xml_importacao.py","perf_5000.py"))
def testes_node():
    return sorted(f for f in os.listdir(AQUI) if f.endswith(".js"))
if "--listar" in sys.argv:
    for n in testes_python()+testes_node(): print(n)
    sys.exit(0)
permitir_pulos="--permitir-pulos" in sys.argv
# A suíte usa nomes históricos de HTML. Monta-os numa cópia temporária do projeto,
# sem sobrescrever as versões preservadas ou o aplicativo unificado.
if os.environ.get("CP_SUITE_ISOLADA")!="1":
    with tempfile.TemporaryDirectory(prefix="cadpecas-suite-") as td:
        for pasta in ("src","tests","tools","lib"):
            shutil.copytree(os.path.join(RAIZ,pasta),os.path.join(td,pasta))
        html=os.path.join(td,"cadastro-pecas.html")
        subprocess.run([sys.executable,os.path.join(td,"tools","montar.py"),html],check=True)
        shutil.copy2(html,os.path.join(td,"Cadastro de Pecas - abrir no Chrome.html"))
        env={**os.environ,"CP_SUITE_ISOLADA":"1"}
        sys.exit(subprocess.call([sys.executable,"-u",os.path.join(td,"tests","run_all.py")]+sys.argv[1:],cwd=td,env=env))
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
COM_GALVANICA=set("""t1.py t10.py t15.py t2.py t20.py t21.py t22.py t23.py t24.py t25.py t26.py t27.py t3.py t30.py t31.py t32.py t33.py t34.py t35.py t36.py t38.py t39.py t40.py t41.py t44.py t45.py t46.py t48.py t49.py t50.py t51.py t54.py t56_conjunto_romaneio.py t58.py t6.py t64_acessibilidade.py t65_categoria_conjunto.py t65_div_categoria.py t66_clique_celula.py t67_referencias_cores.py t68_referencias_tamanhos.py t69_banho_categoria_quantidade.py t69_banho_divisoes_exportacao.py t69_banho_fixo_categoria_quantidade.py t69_contas_banho.py t69_insumos.py t69_lote_por_grama_categorias.py t7.py t70_conta_tabela.py t71_romaneios_reais.py t72_romaneio_peso_e_trios.py t73_lancamento_tipos_e_variacoes.py t74_romaneio_extras.py t75_romaneio_frete_e_pendencias.py t76_subcategoria_tamanhos.py t77_lote_sem_bloqueio.py t78_baixar_selecionadas.py t79_sem_banho_por_grama.py t80_abrir_sem_idb.py t81_banho_sem_coluna_abre.py t82_lote_peso_real.py t85_lote_numerado.py t96_fluxos.py t96_auditoria_calculos.py t97_xml_criacao.py t98_banho_componente.py t99_rateio_exato.py t100_xml_precisao.py t101_rom_descartar.py t9.py""".split())
COM_GALVANICA.add("t103_insumos_frete.py")
COM_GALVANICA.update(("t47.py","t56.py","t56_rom_acoes.py","t60_varejo.py","t67_rom_acesso.py"))
falhas=0;pulos=0
for n in testes_python():
    precisa_real=n in ("t16.py","t18.py")
    if precisa_real and not os.environ.get("CP_BACKUP"):
        print(f"{n}: PULADO (defina CP_BACKUP)");pulos+=1;continue
    comando=[sys.executable]+([os.path.join(AQUI,"fixture_galvanica.py")] if n in COM_GALVANICA or n=="t102_banho_concorrencia.py" else [])+[os.path.join(AQUI,n)]
    try:
        r=subprocess.run(comando,capture_output=True,text=True,encoding="utf-8",errors="replace",env={**os.environ,"PYTHONIOENCODING":"utf-8"},timeout=300)
    except subprocess.TimeoutExpired:
        print(f"{n}: FALHOU (tempo limite de 300 segundos)",flush=True);falhas+=1;continue
    motivos_pulo=[l for l in r.stdout.splitlines() if l.strip().casefold().startswith(("pulado", "pulou", "skip", "skipped"))]
    ruim=[l for l in r.stdout.splitlines() if l.startswith("FALHA ")]
    if r.returncode and r.stderr.strip():
        # Preserva contexto e linha da asserção: apenas "AssertionError" não permite diagnóstico.
        linhas=r.stderr.strip().splitlines()
        ruim.append("\n      ".join(linhas[-12:]))
    if r.returncode and not ruim:ruim.append(f"saiu com codigo {r.returncode} sem mensagem de erro: "+((r.stdout.strip().splitlines() or [''])[-1]))   # nenhum retorno nao-zero pode passar como OK
    print(f"{n}: {'FALHOU' if ruim else 'PULADO' if motivos_pulo else 'OK'}")
    for l in motivos_pulo:print("   ",l)
    if motivos_pulo and not ruim:pulos+=1
    for l in ruim:print("   ",l)
    falhas+=bool(ruim)
# ---- testes em Node: regressões puras (*_regressao.js e afins) e cenários com navegador (t*.js) ----
NODE = shutil.which("node")
NP = os.environ.get("NODE_PATH") or next((c for c in (os.path.expanduser("~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"),) if os.path.isdir(c)), "")
js = testes_node()
if not NODE:
    print("\nFALHA: node não encontrado; testes .js obrigatórios não foram executados")
    falhas+=1
else:
    for n in js:
        r = subprocess.run([NODE, os.path.join(AQUI, n)], capture_output=True, text=True, encoding="utf-8", errors="replace",
                           env={**os.environ, "PYTHONIOENCODING": "utf-8", **({"NODE_PATH": NP} if NP else {})}, timeout=300)
        saida = (r.stdout or "") + (r.stderr or "")
        if r.returncode and ("Cannot find module 'playwright'" in saida or "Executable doesn't exist" in saida):
            print(f"{n}: FALHOU (playwright/Chrome não disponível para o Node; defina NODE_PATH)")
            falhas+=1
            continue
        ruim = r.returncode != 0
        print(f"{n}: {'FALHOU' if ruim else 'OK'}")
        if ruim:
            for l in saida.strip().splitlines()[-3:]:
                print("   ", l)
            falhas += 1
print("\nFalhas:",falhas,"· Testes pulados:",pulos)
if pulos: print("Execução incompleta: há testes pulados"+(" (permitidos explicitamente)" if permitir_pulos else "; use --permitir-pulos apenas para uma verificação parcial"))
sys.exit(1 if falhas else 2 if pulos and not permitir_pulos else 0)
