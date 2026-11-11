from pathlib import Path
from playwright.sync_api import sync_playwright
import tempfile,json,subprocess,sys
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri();backup=Path(tempfile.gettempdir())/'cadpecas-integridade-teste.json'
if not backup.exists():subprocess.run([sys.executable,str(Path(__file__).with_name('t58_backup_integridade.py'))],check=True)
o=json.loads(backup.read_text(encoding='utf8'));config=o['config'];config.pop('v10',None);config.pop('catAlias',None)
old={'config':config,'lanc':[{'id':'legado1','tipo':'pronta','desc':'Peça legada','codForn':'ANT001','forn':'xangai','cat':'Brincos','peso':'1,25','custo':'4,50','preco':'20,00','qtd':'2'}]}
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');c=b.new_context();q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(url);q.evaluate("o=>{localStorage.removeItem('cadpecas4');localStorage.setItem('cadpecas3',JSON.stringify(o))}",old);q.reload();q.wait_for_timeout(1200)
 assert q.locator('#sheet').inner_text().find('Peça legada')>=0
 assert '1,25' in q.locator('#sheet').inner_text() and '4,50' in q.locator('#sheet').inner_text()
 assert not errors,errors
 state=q.evaluate("JSON.parse(localStorage.getItem('cadpecas4')||localStorage.getItem('cadpecas3'))")
 assert len(state['lanc'])==1
 print('OK migração simulada cadpecas3: descrição e peso de peça legada abrem sem erro',flush=True);c.close();b.close()
