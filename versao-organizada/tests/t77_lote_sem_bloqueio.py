"""Lote por peso: o peso informado pode diferir do peso da lista (e a divisão por banho pode estar incompleta) sem bloquear a criação.
O peso divergente não bloqueia; a quantidade física incorreta exige correção. Usa o PDF Elvis (lote 1: 81,440 g = R$ 1.197,17)."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
EL=Path(sys.argv[1]) if len(sys.argv)>1 else Path.home()/'Downloads'/'Pedido_59830 (1).pdf'
if not EL.exists():print('PULADO: PDF não encontrado',EL);sys.exit(0)
def n(s):s=(s or '').strip();return float(s.replace('.','').replace(',','.')) if s else 0.0
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];dl=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:(dl.append(d.message),d.accept()));pg.goto(url)
    pg.locator('#impFile').set_input_files(str(EL));pg.wait_for_selector('#romWrap .rc',timeout=20000);pg.wait_for_timeout(1200)
    l=pg.locator('#romWrap .rc.lote').first;l.locator('[data-lotn]').fill('3');l.locator('[data-act="lote-add"]').click();pg.wait_for_timeout(400)
    cards=lambda:pg.locator('#romWrap .rc:not(.lote)')
    # pesos reais (95 g) diferem do peso da lista (81,44 g)
    for i,ps in enumerate(['30','30','35']):
        c=cards().nth(i);c.locator('[data-rp="cat"]').select_option(label='Masculinos');x=cards().nth(i).locator('[data-rp="peso"]');x.fill(ps);x.press('Tab')
    pg.wait_for_timeout(400)
    resumo=pg.locator('#romWrap [data-lsum]').first.inner_text();print('resumo:',resumo)
    assert 'informados até agora' in resumo and 'valor por grama até agora' in resumo,resumo
    custos=[n(cards().nth(i).locator('[data-rp="custo"]').input_value()) for i in range(3)]
    print('custos',custos,'soma',round(sum(custos),2));assert abs(sum(custos)-1197.17)<0.005,'o valor do lote deve ser o mesmo, rateado pelo peso informado'
    # divisão incompleta (sem quantidade distribuída em um item, 2 unidades em outro) bloqueia
    cards().nth(0).locator('[data-act="rom-div"]').click()
    x=cards().nth(1).locator('[data-rp="q"][data-b="ouro"]');x.fill('1');x.press('Tab')
    y=cards().nth(1).locator('[data-rp="q"][data-b="prata"]');y.fill('1');y.press('Tab')   # 2 unidades num item que vale 1
    pg.wait_for_timeout(400)
    assert pg.locator('#romCriar').is_enabled()
    pg.locator('#romCriar').click();pg.wait_for_timeout(800)
    assert pg.locator('[data-act="rev-ok"]').is_disabled(),'quantidade inconsistente deve bloquear'
    pg.locator('[data-act="rev-fechar"]').first.click()
    y=cards().nth(1).locator('[data-rp="q"][data-b="prata"]');y.fill('0');y.press('Tab')
    x=cards().nth(2).locator('[data-rp="q"][data-b="ouro"]');x.fill('1');x.press('Tab')
    pg.locator('#romCriar').click();assert pg.locator('[data-act="rev-ok"]').is_enabled(),'peso divergente não pode bloquear'
    pg.locator('[data-act="rev-ok"]').click();pg.wait_for_timeout(1500)
    rows=pg.locator('tr[data-l]').evaluate_all("es=>es.map(e=>['G','N','P','W'].map(k=>e.querySelector('[data-c='+k+']').innerText.trim()))")
    print(rows);assert len(rows)>=3,rows
    assert not err,err
    b.close();print('OK lote por peso: diferença de peso é só alerta e o valor do lote é rateado')
