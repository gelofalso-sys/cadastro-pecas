"""Restaura backup real em contexto isolado e compara backup completo baixado após recarga."""
import json,os,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
if not os.environ.get('CP_BACKUP'):
 print('PULADO: defina CP_BACKUP com o backup completo real');sys.exit(0)
p=Path(os.environ['CP_BACKUP']); original=json.loads(p.read_text(encoding='utf-8'))
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as pw:
 b=pw.chromium.launch(channel='msedge');ctx=b.new_context(accept_downloads=True);q=ctx.new_page();errs=[];q.on('pageerror',lambda e:errs.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url);q.wait_for_timeout(1000)
 q.locator('#side [data-go="sec:opc"]').click();q.locator('#fileBkT').set_input_files(str(p));q.wait_for_function("n=>{try{return JSON.parse(localStorage.getItem('cadpecas4')).lanc.length===n}catch(e){return false}}",arg=len(original['lanc']),timeout=30000);q.wait_for_timeout(1500);q.reload();q.wait_for_timeout(1200)
 q.locator('#side [data-go="sec:opc"]').click()
 with q.expect_download(timeout=30000) as dl:q.locator('[data-act="backup-total"]').click()
 result=json.loads(Path(dl.value.path()).read_text(encoding='utf-8'))
 assert not result.get('incompleto'), 'download indica backup incompleto'
 assert len(result['lanc'])==len(original['lanc']), 'contagem de peças mudou'
 assert {x['id'] for x in result['lanc']}=={x['id'] for x in original['lanc']}, 'identificadores de peças mudaram'
 por_id={x['id']:x for x in result['lanc']}
 for antigo in original['lanc']:
  novo=por_id[antigo['id']]
  for campo in ('E','F','G','H','J','N','P','W'):
   assert antigo.get('v',{}).get(campo)==novo.get('v',{}).get(campo), f'campo {campo} de uma peça foi alterado'
  assert antigo.get('on',{})==novo.get('on',{}), 'seleção de banhos mudou'
  assert antigo.get('ov',{})==novo.get('ov',{}), 'quantidades ou valores por banho mudaram'
 for k in ('roms','tabs'):
  assert set(result.get(k,{}))==set(original.get(k,{})),f'{k}: identificadores diferentes'
  for chave,antes in original.get(k,{}).items():
   depois=result[k][chave]
   if k=='roms': assert len(antes.get('rows',[]))==len(depois.get('rows',[])), 'quantidade de itens de um romaneio mudou'
 fotos=original.get('fotos',{});saidaf=result.get('fotos',{});missing=set(fotos)-set(saidaf)
 assert not missing, f'{len(missing)} fotos do backup original não foram incluídas na cópia'
 assert all(saidaf[k]==v for k,v in fotos.items()),'conteúdo de foto mudou'
 assert not errs, 'erros JavaScript: '+str(errs)
 print(f"OK backup completo: {len(result['lanc'])} peças, {len(result['roms'])} romaneios, {len(result['tabs'])} tabelas e {len(saidaf)} fotos; IDs e fotos preservados")
 b.close()
