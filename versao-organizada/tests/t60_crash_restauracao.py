from pathlib import Path
from playwright.sync_api import sync_playwright
import tempfile,json,subprocess,sys
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
backup=Path(tempfile.gettempdir())/'cadpecas-integridade-teste.json'
if not backup.exists():
 subprocess.run([sys.executable,str(Path(__file__).with_name('t58_backup_integridade.py'))],check=True)
o=json.loads(backup.read_text(encoding='utf8')); assert o['roms'] and o['fotos'] and o['tabs']
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge')
 for alvo in ('roms','fotos','tabs','local'):
  ctx=b.new_context(viewport={'width':1200,'height':900});page=ctx.new_page();page.on('dialog',lambda d:d.accept());page.goto(url);page.wait_for_timeout(800)
  page.evaluate("""alvo=>{const oldOpen=indexedDB.open.bind(indexedDB),oldPut=IDBObjectStore.prototype.put,oldSet=Storage.prototype.setItem;let armed=false;IDBObjectStore.prototype.put=function(){if(this.name===alvo)armed=true;return oldPut.apply(this,arguments)};Storage.prototype.setItem=function(k,v){if(alvo==='local'&&k==='cadpecas4')armed=true;return oldSet.call(this,k,v)};indexedDB.open=function(){if(armed){console.warn('RESTORE_PAUSED');return {}}return oldOpen(...arguments)};const i=document.createElement('input');i.type='file';i.id='fileBkT';document.body.appendChild(i)}""",alvo)
  with page.expect_console_message(predicate=lambda m:'RESTORE_PAUSED' in m.text, timeout=30000):page.set_input_files('#fileBkT',str(backup))
  page.close(run_before_unload=False)
  if alvo=='roms':
   qfail=ctx.new_page();qfail.add_init_script("const old=IDBObjectStore.prototype.delete; IDBObjectStore.prototype.delete=function(k){if(this.name==='roms')throw new DOMException('teste','QuotaExceededError');return old.call(this,k)}");qfail.goto(url);qfail.wait_for_timeout(1200)
   assert 'Não foi possível verificar ou recuperar' in qfail.locator('html').inner_text()
   assert qfail.evaluate('document.body.inert')
   print('OK recuperação com falha bloqueia edição e mantém journal para nova tentativa',flush=True);qfail.close()
  q=ctx.new_page();q.goto(url);q.wait_for_timeout(1200)
  state=q.evaluate("""async()=>{const req=indexedDB.open('cadpecas-big',3);const db=await new Promise((r,j)=>{req.onsuccess=()=>r(req.result);req.onerror=()=>j(req.error)});const read=s=>new Promise((r,j)=>{const tx=db.transaction(s),x=tx.objectStore(s).getAllKeys();x.onsuccess=()=>r(x.result);x.onerror=()=>j(x.error)});const result={roms:await read('roms'),fotos:await read('fotos'),tabs:await read('tabs'),data:JSON.parse(localStorage.getItem('cadpecas4')||'{}')};db.close();return result}""")
  assert not state['roms'] and not state['fotos'] and not state['tabs'] and not state['data'].get('lanc'),(alvo,state)
  print('OK interrupção após gravação de',alvo,': estado anterior recuperado',flush=True);ctx.close()
 b.close()
