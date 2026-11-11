from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1400,'height':950});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(url)
 q.evaluate("localStorage.setItem('cadpecas-cad-estrito','1')");q.reload()
 q.locator('details[data-open="insit"] summary').click();q.locator('[data-act="insitem-add"]').click()
 a=q.locator('[data-insrow="0"]');a.locator('[data-inscampo="nome"]').fill('Caixa');a.locator('[data-inscampo="nome"]').press('Tab');a=q.locator('[data-insrow="0"]');a.locator('[data-inscampo="qtd"]').fill('2');a.locator('[data-inscampo="qtd"]').press('Tab');a=q.locator('[data-insrow="0"]');a.locator('[data-inscampo="valor"]').fill('0,10');a.locator('[data-inscampo="valor"]').press('Tab')
 q.locator('[data-act="insitem-add"]').click();a=q.locator('[data-insrow="1"]');a.locator('[data-inscampo="nome"]').fill('Tarraxa');a.locator('[data-inscampo="nome"]').press('Tab');a=q.locator('[data-insrow="1"]');a.locator('[data-inscampo="cat"]').select_option('Brincos');a=q.locator('[data-insrow="1"]');a.locator('[data-inscampo="qtd"]').fill('3');a.locator('[data-inscampo="qtd"]').press('Tab');a=q.locator('[data-insrow="1"]');a.locator('[data-inscampo="valor"]').fill('0,20');a.locator('[data-inscampo="valor"]').press('Tab')
 assert q.locator('[data-insmodo]').input_value()=='off';assert q.locator('#cadBar').is_visible();q.locator('[data-cad="salvar"]').click();q.wait_for_timeout(900)
 q.fill('#f-F','Brinco teste');q.fill('#f-N','1');q.fill('#f-P','2')
 for e in q.locator('[id^="f-"][id$="-W"]').all():
  if e.is_visible():e.fill('1')
 q.locator('button.btn.pri.big[type="submit"]').click();q.wait_for_timeout(600)
 def valores():return q.locator('tr[data-l] [data-c="Q"]').all_inner_texts()
 assert valores() and all(x=='0,50' for x in valores()),valores()
 q.locator('details[data-open="insit"] summary').click() if q.locator('details[data-open="insit"]').get_attribute('open') is None else None
 q.locator('[data-insmodo]').select_option('somar');q.locator('[data-cad="salvar"]').click();q.wait_for_timeout(500);assert all(x=='1,30' for x in valores()),valores()
 q.locator('[data-insmodo]').select_option('substituir');q.locator('[data-cad="salvar"]').click();q.wait_for_timeout(700);assert all(x=='0,80' for x in valores()),valores();exp=q.locator('#custos').inner_text();assert 'Caixa' in exp and 'Tarraxa' in exp,exp
 q.reload();q.wait_for_timeout(500);assert all(x=='0,80' for x in valores()),valores();assert q.locator('[data-insmodo]').input_value()=='substituir'
 q.evaluate("document.querySelector('[data-act=rom-lista]').click()")
 with q.expect_download() as d:q.locator('.rep [data-act="backup-total"]').click()
 backup=Path(d.value.path()).read_bytes();fresh=b.new_context(viewport={'width':1400,'height':950});z=fresh.new_page();z.on('dialog',lambda d:d.accept());z.goto(url);z.evaluate("()=>{const i=document.createElement('input');i.type='file';i.id='fileBkT';document.body.appendChild(i)}");z.locator('#fileBkT').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':backup});z.wait_for_function("()=>document.getElementById('toast').innerText.includes('Backup restaurado')",timeout=20000);z.reload();assert z.locator('[data-insmodo]').input_value()=='substituir';assert z.locator('[data-insrow]').count()==2;assert all(x=='0,80' for x in z.locator('tr[data-l] [data-c="Q"]').all_inner_texts())
 assert not errors,errors;fresh.close();b.close();print('OK insumos geral/categoria: legado, soma, substituição, salvar, recarga e backup')
