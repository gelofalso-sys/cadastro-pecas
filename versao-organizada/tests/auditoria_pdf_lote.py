from pathlib import Path
import json, tempfile, collections, sys
from playwright.sync_api import sync_playwright
if len(sys.argv)!=2: raise SystemExit('Uso: python '+Path(__file__).name+' extracao_independente.json')
items=json.loads(Path(sys.argv[1]).read_text(encoding='utf8'))
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
checked=0;matches=0;partial=[];errors=[]
def cents(s):return int(round(float(s.replace('.','').replace(',','.'))*100))
with sync_playwright() as p:
 browser=p.chromium.launch(channel='msedge')
 for item in items:
  if not item.get('markers'):partial.append(item['name']);continue
  ctx=browser.new_context(viewport={'width':390,'height':844}); page=ctx.new_page()
  try:
   page.goto(url);page.locator('#mobileMenu summary').click();page.locator('[data-mobile="act:rom-abrir"]').click()
   page.locator('#romWrap textarea').fill(item['text']);page.locator('#romWrap [data-act="rom-ler"]').click()
   actual=page.locator('#romWrap .rc:not(.lote)').evaluate_all("els=>els.map(e=>({cod:e.querySelector('[data-rp=cod]')?.value||'',qtd:e.querySelector('.rsum b')?.innerText||'0',custo:e.querySelector('[data-rp=custo]')?.value||'0'}))")
   exp=collections.Counter((x[0],int(x[1]),cents(x[2])) for x in item['expected'])
   got=collections.Counter((x['cod'],int(x['qtd']),int(round(cents(x['custo'])*int(x['qtd'])))) for x in actual)
   checked+=1
   if not (exp-got) and len(actual)==item['markers']:
    matches+=1
    if item['markers']!=len(item['expected']):partial.append(item['name'])
   else:errors.append((item['name'],item['markers'],len(actual),list((exp-got).items())[:2],list((got-exp).items())[:2]))
  except Exception as e:errors.append((item['name'],str(e)[:160]))
  finally:ctx.close()
 browser.close()
print('Documentos comparados:',checked,'iguais:',matches,'divergentes/erro:',len(errors),'parciais ou outros formatos:',len(partial),flush=True)
for e in errors:print('DIVERGÊNCIA',e,flush=True)

