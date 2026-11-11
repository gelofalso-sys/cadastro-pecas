from pathlib import Path
import os
from playwright.sync_api import sync_playwright
from tempfile import TemporaryDirectory
url=(Path(__file__).resolve().parent.parent / ('publicar-netlify/index.html' if os.environ.get('CP_TESTAR_PACOTE')=='1' else 'Cadastro de Pecas - abrir no Chrome.html')).as_uri()
with TemporaryDirectory() as tmp, sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');ctx=b.new_context(viewport={'width':1400,'height':900});q=ctx.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url)
 q.fill('#f-F','Brinco com pedra');q.fill('#f-N','2');q.fill('#f-P','10')
 for x in q.locator('[id^="f-"][id$="-W"]').all():
  if x.is_visible():x.fill('1')
 q.locator('button.btn.pri.big[type="submit"]').click();q.wait_for_timeout(900)
 data=q.evaluate("JSON.parse(localStorage.getItem('cadpecas4'))");l=data['lanc'][0];l['tipo']='pronta';l['on']={};l['onP']={};l['grade']='';l['gsel']=[];l['csel']=['L:azul'];l['corOn']=True;l['ov']={'p~c_L:azul':{'W':'3','V':'25'}};q.evaluate("v=>localStorage.setItem('cadpecas4',JSON.stringify(v))",data);q.reload();q.wait_for_timeout(800)
 def linha(pg):
  return pg.locator('tr[data-l]').evaluate_all("es=>es.map(e=>Object.fromEntries(['E','F','W','V'].map(k=>[k,e.querySelector('[data-c='+k+']')?.innerText.trim()])))")
 inicial=linha(q);assert len(inicial)==1 and inicial[0]['W']=='3' and inicial[0]['V']=='25,00',inicial
 def backup(pg,n):
  pg.evaluate("document.querySelector('[data-act=rom-lista]').click()")
  with pg.expect_download() as d:pg.locator('.rep [data-act="backup-total"]').click()
  f=Path(tmp)/n;d.value.save_as(f);pg.locator('.rep [data-act="rel-fechar"]').click();return f
 antigo=backup(q,'antigo.json')
 q.locator('[data-go="sec:cor"]').click();q.wait_for_timeout(400)
 azul=q.locator('[data-lc]').filter(has=q.locator('[data-lcf="nome"][value="Azul"]')).first
 azul.locator('[data-lcf="nome"]').fill('Cor Marinha Teste');azul.locator('[data-lcf="nome"]').press('Tab');q.wait_for_timeout(700)
 alterado=linha(q);assert len(alterado)==1 and alterado[0]['W']=='3' and alterado[0]['V']=='25,00',alterado
 assert alterado[0]['E'][:6]==inicial[0]['E'][:6],(inicial,alterado)
 novo=backup(q,'novo.json')
 # recriar o nome antigo não pode tomar a identidade da cor renomeada
 q.locator('[data-go="sec:cor"]').click();q.locator('[data-enter="cor"]').fill('Azul');q.locator('[data-enter="cor"]').press('Enter');q.wait_for_timeout(600)
 apos=linha(q);assert apos==alterado,(apos,alterado)
 q.wait_for_timeout(900);q.reload();q.wait_for_timeout(700);assert linha(q)==alterado,linha(q)
 state=q.evaluate("JSON.parse(localStorage.getItem('cadpecas4')).config");assert state['coresMeta']['azul']['idCor'] != state['coresMeta']['cor marinha teste']['idCor'],state['coresMeta']
 for file,expected in [(antigo,inicial),(novo,alterado)]:
  c=b.new_context(viewport={'width':1400,'height':900});x=c.new_page();x.on('dialog',lambda d:d.accept());x.goto(url);x.evaluate("()=>{const i=document.createElement('input');i.type='file';i.id='fileBkT';document.body.appendChild(i)}");x.set_input_files('#fileBkT',str(file));x.wait_for_function("()=>document.getElementById('toast').innerText.includes('Backup restaurado')",timeout=20000);x.wait_for_timeout(500);assert linha(x)==expected,(file.name,linha(x),expected);c.close()
 assert not errors,errors;ctx.close();b.close();print('OK cor renomeada preserva quantidade, preço, número-base e backups antigo/novo')
