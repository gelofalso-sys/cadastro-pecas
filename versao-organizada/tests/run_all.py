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
# ---- verificações estáticas (rápidas; rodam sempre, inclusive com --so) na raiz real, que tem o node_modules ----
# Rodam só no processo principal; o resultado segue para a reexecução na cópia temporária via CP_FALHAS_PRE.
def verificacoes_estaticas():
    node=shutil.which("node")
    if not node:
        print("FALHA: node não encontrado; verificações estáticas não executadas");return 1
    n=0
    unit=sorted("tests/unit/"+f for f in os.listdir(os.path.join(RAIZ,"tests","unit")) if f.endswith(".test.mjs"))
    for rotulo,cmd in (("fatias --validar",["tools/fatias.mjs","--validar"]),("checar_fronteiras",["tools/checar_fronteiras.mjs"]),("mapa --conferir",["tools/mapa.mjs","--conferir"]),("unit",["--test"]+unit)):
        r=subprocess.run([node]+cmd,cwd=RAIZ,capture_output=True,text=True,encoding="utf-8",errors="replace",timeout=300)
        print(f"{rotulo}: {'FALHOU' if r.returncode else 'OK'}",flush=True)
        if r.returncode:
            n+=1;print(((r.stdout or "")+(r.stderr or ""))[-1500:])
    return n
if os.environ.get("CP_SUITE_ISOLADA")!="1":
    _pre=verificacoes_estaticas()
else:
    _pre=int(os.environ.get("CP_FALHAS_PRE","0"))
# A suíte usa nomes históricos de HTML. Monta-os numa cópia temporária do projeto,
# sem sobrescrever as versões preservadas ou o aplicativo unificado.
if os.environ.get("CP_SUITE_ISOLADA")!="1":
    with tempfile.TemporaryDirectory(prefix="cadpecas-suite-") as td:
        for pasta in ("src","tests","tools","lib","vendor"):
            shutil.copytree(os.path.join(RAIZ,pasta),os.path.join(td,pasta))
        html=os.path.join(td,"cadastro-pecas.html")
        subprocess.run([sys.executable,os.path.join(td,"tools","montar.py"),html],check=True)
        shutil.copy2(html,os.path.join(td,"Cadastro de Pecas - abrir no Chrome.html"))
        env={**os.environ,"CP_SUITE_ISOLADA":"1","CP_FALHAS_PRE":str(_pre)}
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
COM_GALVANICA.update(("t47.py","t56.py","t56_rom_acoes.py","t60_varejo.py","t67_rom_acesso.py","t120_edicao_romaneio_menu_numeracao.py"))
falhas=_pre;pulos=0
import re as _re
from concurrent.futures import ThreadPoolExecutor
def _opt(nome,padrao=None):
    for a in sys.argv:
        if a.startswith("--"+nome+"="):return a.split("=",1)[1]
    return padrao
FILTRO=_re.compile(_opt("so")) if _opt("so") else None
PARALELO=int(_opt("paralelo","1"))   # --paralelo=N roda N testes ao mesmo tempo (feedback rápido; a conferência final continua sendo sequencial)
def rodar_py(n):
    """devolve (linhas_impressas, falhou, pulado)"""
    precisa_real=n in ("t16.py","t18.py")
    if precisa_real and not os.environ.get("CP_BACKUP"):
        return [f"{n}: PULADO (defina CP_BACKUP)"],False,True
    comando=[sys.executable]+([os.path.join(AQUI,"fixture_galvanica.py")] if n in COM_GALVANICA or n=="t102_banho_concorrencia.py" else [])+[os.path.join(AQUI,n)]
    try:
        r=subprocess.run(comando,capture_output=True,text=True,encoding="utf-8",errors="replace",env={**os.environ,"PYTHONIOENCODING":"utf-8"},timeout=300)
    except subprocess.TimeoutExpired:
        return [f"{n}: FALHOU (tempo limite de 300 segundos)"],True,False
    motivos_pulo=[l for l in r.stdout.splitlines() if l.strip().casefold().startswith(("pulado", "pulou", "skip", "skipped"))]
    ruim=[l for l in r.stdout.splitlines() if l.startswith("FALHA ")]
    if r.returncode and r.stderr.strip():
        # Preserva contexto e linha da asserção: apenas "AssertionError" não permite diagnóstico.
        linhas=r.stderr.strip().splitlines()
        ruim.append(chr(10)+"      ".join(linhas[-12:]) if False else (chr(10)+"      ").join(linhas[-12:]))
    if r.returncode and not ruim:ruim.append(f"saiu com codigo {r.returncode} sem mensagem de erro: "+((r.stdout.strip().splitlines() or [''])[-1]))   # nenhum retorno nao-zero pode passar como OK
    out=[f"{n}: {'FALHOU' if ruim else 'PULADO' if motivos_pulo else 'OK'}"]+["    "+l for l in motivos_pulo]+["    "+l for l in ruim]
    return out,bool(ruim),bool(motivos_pulo and not ruim)
def varios(fn,nomes):
    nomes=[n for n in nomes if not FILTRO or FILTRO.search(n)]
    with ThreadPoolExecutor(max_workers=max(1,PARALELO)) as ex:
        for out,f,pu in ex.map(fn,nomes):
            for l in out:print(l,flush=True)
            yield f,pu
for f,pu in varios(rodar_py,testes_python()):
    falhas+=f;pulos+=pu
# ---- testes em Node: regressões puras (*_regressao.js e afins) e cenários com navegador (t*.js) ----
NODE = shutil.which("node")
NP = os.environ.get("NODE_PATH") or next((c for c in (os.path.expanduser("~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"),) if os.path.isdir(c)), "")
js = testes_node()
def rodar_js(n):
    r = subprocess.run([NODE, os.path.join(AQUI, n)], capture_output=True, text=True, encoding="utf-8", errors="replace",
                       env={**os.environ, "PYTHONIOENCODING": "utf-8", **({"NODE_PATH": NP} if NP else {})}, timeout=300)
    saida = (r.stdout or "") + (r.stderr or "")
    if r.returncode and ("Cannot find module 'playwright'" in saida or "Executable doesn't exist" in saida):
        return [f"{n}: FALHOU (playwright/Chrome não disponível para o Node; defina NODE_PATH)"],True,False
    ruim = r.returncode != 0
    out=[f"{n}: {'FALHOU' if ruim else 'OK'}"]
    if ruim:out+=["    "+l for l in saida.strip().splitlines()[-3:]]
    return out,ruim,False
if not NODE:
    print(chr(10)+"FALHA: node não encontrado; testes .js obrigatórios não foram executados")
    falhas+=1
else:
    for f,pu in varios(rodar_js,js):falhas+=f
print("\nFalhas:",falhas,"· Testes pulados:",pulos)
if pulos: print("Execução incompleta: há testes pulados"+(" (permitidos explicitamente)" if permitir_pulos else "; use --permitir-pulos apenas para uma verificação parcial"))
sys.exit(1 if falhas else 2 if pulos and not permitir_pulos else 0)
