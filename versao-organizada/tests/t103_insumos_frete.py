"""Frete e separação ficam fora do rateio; insumos comuns seguem disponíveis."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
url=Path(os.environ.get('CP_TEST_HTML') or Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').resolve().as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1400,'height':900});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url)
 q.locator('#impBar [data-act="rom-abrir"]').click();q.locator('#romWrap textarea').fill('Romaneio TESTE\nBrinco A [#900001] R$ 1,00 R$ 1,00 6 R$ 6,00\nValor Produtos R$ 6,00\nFrete R$ 5,00\nCusto separação R$ 3,00');q.locator('#romWrap [data-act="rom-ler"]').click();q.locator('#romWrap .rc:not(.lote) [data-act="rom-div"]').click()
 assert q.locator('.rins-sug').count()==2;assert q.locator('[data-act="rins-sug"]').count()==0
 q.locator('[data-act="rins-add"]').click();n=q.locator('[data-rp="rins"][data-k="nome"]');n.fill('Frete');n.press('Tab');v=q.locator('[data-rp="rins"][data-k="valor"]');v.fill('6,00');v.press('Tab');q.locator('#romCriar').click();q.locator('.rev').wait_for();assert 'Frete e separação ficam fora' in q.locator('.rev').inner_text();assert q.locator('[data-act="rev-ok"]').is_disabled()
 q.locator('[data-act="rev-fechar"]').first.click();n=q.locator('[data-rp="rins"][data-k="nome"]');n.fill('Etiquetas');n.press('Tab');q.locator('#romCriar').click();assert q.locator('[data-act="rev-ok"]').is_enabled();assert not errors,errors
 # Uma fórmula de insumos existente não pode ser apagada ao preparar o rateio.
 q2=b.new_page(viewport={'width':1400,'height':900});q2.on('pageerror',lambda e:errors.append(str(e)));q2.on('dialog',lambda d:d.accept());q2.goto(url)
 q2.evaluate("()=>{const s=JSON.parse(localStorage.getItem('cadpecas4'));s.form.v.Q='=P2*2';localStorage.setItem('cadpecas4',JSON.stringify(s))}");q2.reload()
 q2.locator('#impBar [data-act="rom-abrir"]').click();q2.locator('#romWrap textarea').fill('Romaneio TESTE\nBrinco A [#900002] R$ 1,00 R$ 1,00 6 R$ 6,00\nValor Produtos R$ 6,00');q2.locator('#romWrap [data-act="rom-ler"]').click();q2.locator('#romWrap .rc:not(.lote) [data-act="rom-div"]').click();q2.locator('details.rom-ins summary').click();q2.locator('[data-act="rins-add"]').click();n=q2.locator('[data-rp="rins"][data-k="nome"]');n.fill('Etiquetas');n.press('Tab');v=q2.locator('[data-rp="rins"][data-k="valor"]');v.fill('6,00');v.press('Tab');q2.locator('#romCriar').click();q2.locator('.rev').wait_for();assert q2.locator('[data-act="rev-ok"]').is_disabled();assert 'fórmula não foi alterada' in q2.locator('.rev').inner_text();assert q2.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).form.v.Q")=='=P2*2';assert not errors,errors
 b.close();print('OK frete/separação fora, outros insumos preservados e fórmula protegida')
