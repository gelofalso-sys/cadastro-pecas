"""Garante que o runner inclui cenários autônomos e não esconde arquivos de regressão."""
from pathlib import Path
import subprocess,sys
raiz=Path(__file__).resolve().parent.parent
p=subprocess.run([sys.executable,str(raiz/'tests/run_all.py'),'--listar'],capture_output=True,text=True,encoding='utf-8',check=True)
nomes=set(p.stdout.splitlines())
assert {'auditoria_regressoes.js','auditoria_xml_importacao.py','t94_backup_real.py'}<=nomes
assert {p.name for p in (raiz/'tests').glob('*.js')}<=nomes
print('OK runner lista todas as regressões Node e auditoria XML')
