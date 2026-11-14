from pathlib import Path
import os
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/('publicar-netlify/index.html' if os.environ.get('CP_TESTAR_PACOTE')=='1' else 'Cadastro de Pecas - abrir no Chrome.html')).as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1200,'height':900});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url)
 for cat,preco in [('Brincos','2'),('Colares','5')]:
  a=q.locator(f'[data-bh="0"] [data-bmv="0"][data-mcat="{cat}"]');a.fill(preco);a.press('Tab')
 q.locator('[data-tipo="conjunto"]').click();rows=q.locator('#conj .conj-r[data-ci]')
 for i,(nome,cat,quant,peso,custo) in enumerate([('Brinco','Brincos','3','1','2'),('Colar','Colares','2','2','3')]):
  r=rows.nth(i);r.locator('[data-cp="desc"]').fill(nome);r.locator('[data-cp="cat"]').select_option(label=cat);r.locator('[data-cp="qtd"]').fill(quant);r.locator('[data-cp="peso"]').fill(peso);r.locator('[data-cp="custo"]').fill(custo)
 q.locator('#form [data-on="ouro"]').check();q.wait_for_timeout(600);text=q.locator('#conjTot .contas-componentes').inner_text();assert '3 × 1 g × R$ 2/g' in text and '2 × 2 g × R$ 5/g' in text and 'R$ 6,00' in text and 'R$ 20,00' in text,text
 q.reload();q.locator('[data-act="rom-abrir"]').first.click();q.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar [#900001] R$ 12,00 R$ 12,00 2 R$ 24,00\nValor Produtos R$ 24,00');q.locator('#romWrap [data-act="rom-ler"]').click();rc=q.locator('#romWrap .rc').first;rc.locator('[data-rcj="ativar"]').count() and (rc.locator('.rom-conjunto summary').click(), rc.locator('[data-rcj="ativar"]').click())
 for i,(nome,cat,quant,peso,custo) in enumerate([('Brinco','Brincos','3','1','2'),('Colar','Colares','2','2','3')]):
  r=rc.locator('[data-rcji]').nth(i);r.locator('[data-rcjf="desc"]').fill(nome);r.locator('[data-rcjf="cat"]').select_option(label=cat);r.locator('[data-rcjf="qtd"]').fill(quant);r.locator('[data-rcjf="peso"]').fill(peso);r.locator('[data-rcjf="custo"]').fill(custo)
 text=rc.locator('[data-rcj-contas]').inner_text();assert '3 × 1 g × R$ 2/g' in text and '2 × 2 g × R$ 5/g' in text,text
 assert not errors,errors;b.close();print('OK detalhes por categoria e quantidade no formulário e no romaneio')
