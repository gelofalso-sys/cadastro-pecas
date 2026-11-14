from pathlib import Path
import ast,json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
module=ast.parse((root/'tests/auditoria_xml_importacao.py').read_text(encoding='utf-8'))
xml=next(ast.literal_eval(n.value) for n in module.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='xml' for t in n.targets))
xml=xml.replace('Anel', 'Colar')
url=(root/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1400,'height':900});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url)
 f={'name':'nota-teste.xml','mimeType':'application/xml','buffer':xml.encode()};q.locator('#nfFile').set_input_files(f);q.locator('#nfGo').click()
 cards=q.locator('#romWrap .rc:not(.lote)');assert cards.count()==2
 for i in range(2):
  card=cards.nth(i);card.locator('[data-act="rom-div"]').click();card.locator('[data-rp="peso"]').fill('1')
 q.locator('#romCriar').click();q.locator('[data-act="rev-ok"]').click();q.locator('.rep').wait_for();q.wait_for_function("() => (JSON.parse(localStorage.getItem('cadpecas4')||'{}').lanc||[]).length === 2")
 lanc=q.evaluate("JSON.parse(localStorage.getItem('cadpecas4')).lanc")
 assert len(lanc)==2 and all(x.get('nfChave')=='12345678901234567890123456789012345678901234' for x in lanc),lanc
 q.locator('.rep [data-act="rel-fechar"]').first.click();q.locator('#nfFile').set_input_files(f);q.wait_for_timeout(500)
 assert 'já' in q.locator('#nfRev').inner_text().lower(),q.locator('#nfRev').inner_text()
 assert not errors,errors;b.close();print('OK XML criado e duplicata identificada')
