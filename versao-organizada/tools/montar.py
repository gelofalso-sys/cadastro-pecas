"""Monta a versão unificada sem alterar os arquivos HTML anteriores.
Uso: python tools/montar.py [caminho_de_saida]"""
from pathlib import Path
import re,sys
RAIZ=Path(__file__).resolve().parent.parent
SRC=RAIZ/"src"
def ler(*partes): return SRC.joinpath(*partes).read_text(encoding="utf-8")
def lista(pasta,manifesto): return [x for x in ler(pasta,manifesto).splitlines() if x.strip()]
css="".join(ler("css",n) for n in lista("css","_ordem.txt"))
# Manifesto unico: src/_ordem.txt (um caminho relativo a src/ por linha). Arquivos de core/ entram sem import/export.
arquivos=lista(".","_ordem.txt")
def tirar_modulo(t):
    """O núcleo (src/core) é escrito como módulo ES; no bloco único do navegador entra sem import/export."""
    t=re.sub(r'^import\s[^;\n]*?from\s+["\'][^"\']+["\'];?[ \t]*$','',t,flags=re.M)
    return re.sub(r'^export\s+(?=(?:async\s+function|function|const|let|var|class)\b)','',t,flags=re.M)
js="".join(tirar_modulo(ler(n)) if n.startswith("core/") else ler(n) for n in arquivos)
def vendor(*partes): return RAIZ.joinpath("vendor",*partes).read_text(encoding="utf-8")
# pdf.js fica em vendor/ e é embutido aqui, para o HTML final continuar de arquivo único e offline.
corpo=(ler("html","02a-corpo.html")+"<script>"+vendor("pdfjs","pdf.min.js")+"</script>"+chr(10)
 +'<script type="text/plain" id="pdfjsWorkerSrc">'+vendor("pdfjs","pdf.worker.min.js")+"</script>"+ler("html","02b-final-do-corpo.html"))
out=ler("html","01-topo.html")+css+corpo+js+ler("html","03-fim.html")
dest=Path(sys.argv[1]) if len(sys.argv)>1 else RAIZ/"Cadastro_de_Pecas_unificado.html"
dest.write_text(out,encoding="utf-8",newline="")
print("Gerado",dest)
