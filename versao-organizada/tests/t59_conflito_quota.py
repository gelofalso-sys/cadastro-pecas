from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
def adicionar(pg,nome):
 pg.locator('#f-F').fill(nome);pg.locator('#f-N').fill('2');pg.locator('#f-P').fill('10')
 for elem in pg.locator('[id^="f-"][id$="-W"]').all():
  if elem.is_visible():elem.fill('1')
 pg.locator('button.btn.pri.big[type="submit"]').click()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');ctx=b.new_context(viewport={'width':1400,'height':900});a=ctx.new_page();a.goto(url);a.wait_for_timeout(600)
 z=ctx.new_page();z.goto(url);z.wait_for_timeout(600)
 adicionar(a,'Primeira aba');a.wait_for_timeout(1200)
 assert z.locator('#outraAba').is_visible()
 antes=a.evaluate("localStorage.getItem('cadpecas4')")
 adicionar(z,'Segunda aba');z.wait_for_timeout(1200)
 assert a.evaluate("localStorage.getItem('cadpecas4')")==antes
 assert 'NÃO está salvando' in z.locator('#saveStatus').inner_text()
 print('OK duas abas: segunda detectou conflito e não sobrescreveu a primeira',flush=True)
 ctx.close()
 ctx=b.new_context(viewport={'width':1400,'height':900});q=ctx.new_page();q.goto(url);q.wait_for_timeout(600)
 q.evaluate("""()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='cadpecas4')throw new DOMException('teste','QuotaExceededError');return original.call(this,k,v)}}""")
 adicionar(q,'Falha quota');q.wait_for_timeout(1200)
 assert 'NÃO salvo' in q.locator('#saveStatus').inner_text()
 assert 'NÃO salvo' in ' '.join(q.locator('#toast, #avisosCriticos').all_inner_texts())
 print('OK falha localStorage: aviso NÃO salvo visível',flush=True)
 ctx.close()
 ctx=b.new_context(viewport={'width':1400,'height':900});q=ctx.new_page();q.goto(url);q.wait_for_timeout(600)
 q.evaluate("""()=>{const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){if(this.name==='roms')throw new DOMException('teste','QuotaExceededError');return original.apply(this,arguments)}}""")
 q.locator('[data-act=rom-abrir]').first.click();q.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar, [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 18,54');q.locator('#romWrap [data-act=rom-ler]').click();q.wait_for_timeout(2000)
 assert 'NÃO salvo' in q.locator('#saveStatus').inner_text()
 assert 'não consegui guardar' in ' '.join(q.locator('#toast, #avisosCriticos').all_inner_texts()).lower()
 print('OK falha IndexedDB: erro ao guardar romaneio é comunicado',flush=True)
 ctx.close();b.close()
