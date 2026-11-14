from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page();q.on('dialog',lambda d:d.accept());q.goto(url)
 q.locator('[data-act="rom-abrir"]').first.click();q.locator('#romWrap [data-act="rom-tipo"][data-v="pronta"]').click()
 q.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar 45+5, [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 18,54')
 q.locator('#romWrap [data-act="rom-ler"]').click();q.locator('#romWrap [data-act="rom-criar"]').click();q.locator('[data-act="rev-ok"]').click();q.locator('[data-act="rel-fechar"]').click()
 q.evaluate("document.querySelector('[data-act=tab-lista]').click()")
 q.locator('[data-act="tab-salvar-abrir"]').click();q.locator('#tsNome').fill('Tabela exclusão');q.locator('#tsNova').uncheck();q.locator('[data-act="tab-salvar-ok"]').click()
 q.locator('[data-act="tab-del"]').wait_for();k=q.locator('[data-act="tab-del"]').get_attribute('data-id');q.locator('[data-act="tab-del"]').click();q.locator('[data-act="tab-del"]').click();q.locator('[data-act="tab-del"]').wait_for(state='detached')
 result=q.evaluate('''async id=>{const req=indexedDB.open('cadpecas-big',3);const db=await new Promise((ok,no)=>{req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error)});return await new Promise((ok,no)=>{const r=db.transaction('tabs').objectStore('tabs').get(id);r.onsuccess=()=>ok(r.result===undefined);r.onerror=()=>no(r.error)})}''',k)
 assert result and not any(x['id']==k for x in q.evaluate("JSON.parse(localStorage.getItem('cadpecas-tabs')||'[]')"))
 b.close();print('OK exclusão confirmada da tabela no índice e no IndexedDB')
