"""Padroniza o fim de linha (LF) em src/, tests/ e tools/: scripts que editam arquivos às vezes deixam CRLF e LF misturados.
Uso: python tools/normalizar_eol.py        (só mostra)   |   python tools/normalizar_eol.py --aplicar"""
import os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
aplicar = "--aplicar" in sys.argv
n = 0
for pasta in ("src", "tests", "tools"):
    for d, _, fs in os.walk(os.path.join(RAIZ, pasta)):
        if "__pycache__" in d or (os.sep + "dados") in d:
            continue
        for f in fs:
            if not f.endswith((".js", ".css", ".html", ".py", ".txt", ".json", ".md")):
                continue
            p = os.path.join(d, f)
            b = open(p, "rb").read()
            if b"\r" in b:
                n += 1
                if aplicar:
                    open(p, "wb").write(b.replace(b"\r\n", b"\n").replace(b"\r", b"\n"))
                else:
                    print("CRLF/misto:", os.path.relpath(p, RAIZ))
print("normalizados" if aplicar else "com CRLF ou misto", n, "arquivo(s)")
