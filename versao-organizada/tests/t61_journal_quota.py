from pathlib import Path
from playwright.sync_api import sync_playwright
import tempfile,subprocess,sys
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri();backup=Path(tempfile.gettempdir())/'cadpecas-integridade-teste.json'
if not backup.exists():subprocess.run([sys.executable,str(Path(__file__).with_name('t58_backup_integridade.py'))],check=True)
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');c=b.new_context(viewport={'width':1200,'height':900});q=c.new_page();q.on('dialog',lambda d:d.accept());q.goto(url);q.wait_for_timeout(800)
 q.evaluate("""()=>{let old=IDBObjectStore.prototype.add;IDBObjectStore.prototype.add=function(v,k){if(k==='backup-restauracao-pendente-v1')throw new DOMException('teste','QuotaExceededError');return old.apply(this,arguments)};let i=document.createElement('input');i.type='file';i.id='fileBkT';document.body.appendChild(i)}""")
 q.set_input_files('#fileBkT',str(backup));q.wait_for_function("()=>[...document.querySelectorAll('#toast, #avisosCriticos')].some(e=>e.innerText.includes('não consegui preparar a recuperação segura'))",timeout=12000)
 state=q.evaluate("""async()=>{let r=indexedDB.open('cadpecas-big',3),db=await new Promise(ok=>r.onsuccess=()=>ok(r.result));let t=db.transaction(['roms','tabs','fotos']),read=s=>new Promise(ok=>{let a=t.objectStore(s).getAllKeys();a.onsuccess=()=>ok(a.result)}),x={roms:await read('roms'),tabs:await read('tabs'),fotos:await read('fotos')};db.close();return x}""")
 assert not any(state.values()),state
 print('OK quota no journal bloqueia restauração antes de qualquer gravação',flush=True);c.close();b.close()
