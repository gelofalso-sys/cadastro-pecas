"""Verifica se o pacote não mudou e foi gerado a partir do HTML montado atual.
Uso: python tools/verificar_pacote.py [pasta]. Não substitui testar o pacote no navegador.
"""
import hashlib,json,sys,subprocess,tempfile
from pathlib import Path
raiz=Path(__file__).resolve().parent.parent
pasta=Path(sys.argv[1]) if len(sys.argv)>1 else raiz/"publicar-netlify-unificado"
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
try:
    m=json.loads((pasta/"manifesto-build.json").read_text(encoding="utf-8"))
    falhas=[]
    with tempfile.TemporaryDirectory() as td:
        montado=Path(td)/"montado.html"
        subprocess.run([sys.executable,str(raiz/"tools/montar.py"),str(montado)],check=True,capture_output=True)
        if sha(montado)!=sha(raiz/"Cadastro_de_Pecas_unificado.html"):falhas.append("fontes mudaram após montar o HTML")
    if set(m["artefatos"])!={"index.html","_headers","lib/xlsx.full.min.js"}:raise ValueError("manifesto incompleto")
    if sha(raiz/"Cadastro_de_Pecas_unificado.html")!=m["fonte_sha256"]:falhas.append("HTML montado mudou após gerar o pacote")
    for nome,valor in m["artefatos"].items():
        if sha(pasta/nome)!=valor:falhas.append(nome+" mudou após gerar o pacote")
    if falhas:raise ValueError("; ".join(falhas))
    print("Hashes conferem. Teste o index.html do pacote e rode a suíte antes de publicar.")
except (OSError,ValueError,KeyError) as e:
    print("Pacote NÃO verificado:",e);sys.exit(1)
