from pathlib import Path
import os
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent / ('publicar-netlify/index.html' if os.environ.get('CP_TESTAR_PACOTE')=='1' else 'Cadastro de Pecas - abrir no Chrome.html')).as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1400,'height':900});errs=[];dialogs=[];q.on('pageerror',lambda e:errs.append(str(e)));q.on('dialog',lambda d:d.accept() if 'salta mais de 50' in d.message else (dialogs.append(d.message),d.dismiss()));q.goto(url)
 q.fill('#f-F','Teste tamanho');q.fill('#f-N','2');q.fill('#f-P','10')
 for x in q.locator('[id^="f-"][id$="-W"]').all():
  if x.is_visible():x.fill('1')
 q.locator('button.btn.pri.big[type="submit"]').click();q.wait_for_timeout(800)
 data=q.evaluate("JSON.parse(localStorage.getItem('cadpecas4'))");c=next(c for c in data['config']['categorias'] if c['nome']=='Brincos');c['grade']={'id':'grade123','nome':'Tamanho Teste','rotulo':' tamanho ','col':'K','modoRef':'nome','subs':[],'itens':[{'id':'tamanho12','nome':'12','letra':'A'},{'id':'tamanho14','nome':'14','letra':'B'}]};l=data['lanc'][0];l['tipo']='pronta';l['on']={};l['onP']={};l['grade']='grade123';l['gsel']=['tamanho12','tamanho14'];l['ov']={'p~tamanho12':{'W':'1'},'p~tamanho14':{'W':'2'}};q.evaluate("v=>localStorage.setItem('cadpecas4',JSON.stringify(v))",data);q.reload();q.wait_for_timeout(800)
 def rows():return q.locator('tr[data-l]').evaluate_all("es=>es.map(e=>Object.fromEntries(['E','K','W'].map(k=>[k,e.querySelector('[data-c='+k+']')?.innerText.trim()])))")
 before=rows();assert len(before)==2 and [x['W'] for x in before]==['1','2'],before;prefix=before[0]['E'][:-2];assert before[0]['E'].endswith('12') and before[1]['E'].endswith('14'),before
 q.locator('[data-go="sec:cor"]').click();q.wait_for_timeout(300);panel=q.locator('[data-gr]').filter(has=q.locator('[data-gf="nome"][value="Tamanho Teste"]')).first;panel.locator('summary').click();x=panel.locator('[data-gii="0"] [data-gif="nome"]');x.fill('13');x.press('Tab');q.wait_for_timeout(400)
 after=rows();assert [x['E'] for x in after]==[prefix+'13',prefix+'14'] and [x['W'] for x in after]==['1','2'],(before,after);assert not dialogs,dialogs
 # Referência digitada à mão deve continuar intacta após alteração da variação.
 q.locator('#side [data-vis="tudo"]').click();q.locator('tr[data-l] [data-c=E]').nth(1).click();q.locator('#celIn').fill('MANUAL99');q.locator('#celIn').press('Enter');q.wait_for_timeout(250);assert rows()[1]['E']=='MANUAL99',rows()
 # modo por letra e mudança apenas da primeira letra; a segunda e o número-base ficam iguais.
 q.locator('[data-go="sec:cor"]').click();panel=q.locator('[data-gr]').filter(has=q.locator('[data-gf="nome"][value="Tamanho Teste"]')).first
 panel.locator('[data-gf="modoRef"]').select_option('letra');q.wait_for_timeout(300);letters=rows();x=panel.locator('[data-gii="0"] [data-gif="letra"]');x.fill('C');x.press('Tab');q.wait_for_timeout(300);changed=rows();assert [r['E'] for r in changed]==[prefix+'C','MANUAL99'] and [r['W'] for r in changed]==['1','2'],(letters,changed);assert not dialogs,dialogs
 assert not errs,errs;b.close();print('OK referência de tamanho e letra atualiza sem mudar número-base ou quantidade')
