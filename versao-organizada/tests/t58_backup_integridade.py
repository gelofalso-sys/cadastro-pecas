from pathlib import Path
from playwright.sync_api import sync_playwright
import json,tempfile
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge')
 c=b.new_context(viewport={'width':1200,'height':900});pg=c.new_page();pg.on('dialog',lambda d:d.accept());pg.goto(url)
 pg.locator('[data-act="rom-abrir"]').first.click();pg.locator('#romWrap [data-act="rom-tipo"][data-v="pronta"]').click()
 pg.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar 45+5, [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nBrinco [#900002] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 37,08')
 pg.locator('#romWrap [data-act="rom-ler"]').click();pg.locator('#romWrap [data-act="rom-criar"]').click();pg.locator('[data-act="rev-ok"]').click();pg.locator('[data-act="rel-fechar"]').click();pg.wait_for_timeout(1200)
 data=pg.evaluate("JSON.parse(localStorage.getItem('cadpecas4'))")
 assert len(data['lanc'])==2
 for x in data['lanc']:x['ft']=png;x['ftR']=png
 pg.evaluate("v=>localStorage.setItem('cadpecas4',JSON.stringify(v))",data);pg.reload();pg.wait_for_timeout(1000)
 pg.evaluate('''async ({ids,png})=>{let req=indexedDB.open('cadpecas-big',3);let db=await new Promise((res,rej)=>{req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)});await new Promise((res,rej)=>{let tx=db.transaction('fotos','readwrite');ids.forEach(id=>{tx.objectStore('fotos').put(png,'m:'+id);tx.objectStore('fotos').put(png,'r:'+id)});tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}''',{'ids':[x['id'] for x in data['lanc']],'png':png})
 pg.evaluate("document.querySelector('[data-act=tab-lista]').click()")
 pg.locator('[data-act="tab-salvar-abrir"]').click();pg.locator('#tsNome').fill('Tabela de teste');pg.locator('#tsNova').uncheck();pg.locator('[data-act="tab-salvar-ok"]').click();pg.wait_for_timeout(1200)
 pg.evaluate("document.querySelector('[data-act=rom-lista]').click()")
 with pg.expect_download() as dl:pg.locator('.rep [data-act="backup-total"]').click()
 path=Path(tempfile.gettempdir())/'cadpecas-integridade-teste.json';dl.value.save_as(str(path));orig=json.loads(path.read_text(encoding='utf8'))
 print({k:len(orig[k]) for k in ('lanc','roms','tabs','fotos')},orig.get('incompleto'),flush=True)
 assert len(orig['lanc'])==2 and len(orig['roms'])==1 and len(orig['tabs'])==1 and orig['fotos'] and not orig.get('incompleto')
 fresh=b.new_context(viewport={'width':1200,'height':900});q=fresh.new_page();q.on('dialog',lambda d:d.accept());q.goto(url)
 q.evaluate("()=>{const i=document.createElement('input');i.type='file';i.id='fileBkT';document.body.appendChild(i)}")
 q.set_input_files('#fileBkT',str(path));q.wait_for_function("()=>document.getElementById('toast').innerText.includes('Backup restaurado')",timeout=20000);q.wait_for_timeout(1200)
 q.evaluate("document.querySelector('[data-act=rom-lista]').click()")
 with q.expect_download() as dl2:q.locator('.rep [data-act="backup-total"]').click()
 outpath=Path(tempfile.gettempdir())/'cadpecas-integridade-restaurado.json';dl2.value.save_as(str(outpath));rest=json.loads(outpath.read_text(encoding='utf8'))
 for k in ('config','lanc','roms','tabs','fotos'):assert orig[k]==rest[k],f'Diferença em {k}'
 print('OK backup completo: 2 lançamentos, 1 romaneio, 1 tabela, %d fotos e cadastros comparados integralmente em navegador isolado'%len(orig['fotos']),flush=True)
 fresh.close();c.close();b.close()
