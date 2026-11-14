from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1400,'height':900});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(url)
 q.locator('[data-act="rom-abrir"]').first.click();q.locator('#romWrap [data-act="rom-tipo"][data-v="pronta"]').click()
 q.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 18,54');q.locator('#romWrap [data-act="rom-ler"]').click();q.locator('#romWrap .rc').first.wait_for()
 q.evaluate("""()=>{window._deleteOriginal=IDBObjectStore.prototype.delete;IDBObjectStore.prototype.delete=function(...a){if(this.name==='roms')throw new Error('falha simulada');return window._deleteOriginal.apply(this,a)}}""")
 q.locator('[data-act="rom-descartar"]').click();q.wait_for_function("()=>[...document.querySelectorAll('#toast, #avisosCriticos')].some(e=>e.innerText.includes('Não consegui descartar'))")
 assert q.locator('#romWrap .rc').count()==1 and 'Romaneio descartado.' not in q.locator('#toast').inner_text()
 q.evaluate("()=>{IDBObjectStore.prototype.delete=window._deleteOriginal}")
 q.locator('[data-act="rom-descartar"]').click();q.wait_for_function("()=>document.querySelector('#toast')?.innerText.includes('Romaneio descartado.')")
 assert q.locator('#romWrap .rc').count()==0 and not errors,errors
 b.close();print('OK descarte aguarda exclusão; falha mantém romaneio e sucesso fecha')
