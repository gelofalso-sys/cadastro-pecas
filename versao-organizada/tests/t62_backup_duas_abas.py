from pathlib import Path
from playwright.sync_api import sync_playwright
import tempfile,subprocess,sys
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri();backup=Path(tempfile.gettempdir())/'cadpecas-integridade-teste.json'
if not backup.exists():subprocess.run([sys.executable,str(Path(__file__).with_name('t58_backup_integridade.py'))],check=True)
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');c=b.new_context();a=c.new_page();a.on('dialog',lambda d:d.accept());a.goto(url);a.wait_for_timeout(500);other=c.new_page();other.goto(url);other.wait_for_timeout(500)
 a.evaluate("()=>{const i=document.createElement('input');i.type='file';i.id='fileBkT';document.body.appendChild(i)}")
 a.set_input_files('#fileBkT',str(backup));a.wait_for_function("()=>document.getElementById('toast').innerText.includes('feche as outras abas')",timeout=15000)
 assert not a.evaluate("JSON.parse(localStorage.getItem('cadpecas4')||'{}').lanc?.length||0")
 print('OK restauração bloqueada enquanto outra aba usa o aplicativo',flush=True)
 other.close();a.set_input_files('#fileBkT',str(backup));a.wait_for_function("()=>document.getElementById('toast').innerText.includes('Backup restaurado')",timeout=20000)
 assert a.evaluate("JSON.parse(localStorage.getItem('cadpecas4')).lanc.length")==2
 print('OK restauração prossegue após fechar a outra aba',flush=True);c.close();b.close()
