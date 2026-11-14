"""Imprime o SHA-256 do HTML que tools/montar.py gera (monta em arquivo temporario).
Prova de que reorganizar src/ nao muda o produto. Uso: python tools/hash_html.py"""
import hashlib, subprocess, sys, tempfile, os
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with tempfile.TemporaryDirectory() as d:
    destino = os.path.join(d, "saida.html")
    subprocess.run([sys.executable, os.path.join(RAIZ, "tools", "montar.py"), destino], check=True, capture_output=True)
    with open(destino, "rb") as f:
        print(hashlib.sha256(f.read()).hexdigest())
