"""Romaneio Patricinha: separação fora do custo, aviso de anel sem tamanho e banho sem quantidade que não gera linha vazia.
Uso: python tests/t75_romaneio_frete_e_pendencias.py [caminho.pdf]"""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright
url = (Path(__file__).resolve().parent.parent / 'Cadastro de Pecas - abrir no Chrome.html').as_uri()
PAT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / 'Downloads' / 'patricinhasemijoias-andrelisesantanalavinobittencourt-link-2836.pdf'
if not PAT.exists():
    print('PULADO: PDF não encontrado', PAT); sys.exit(0)
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge')
    pg = b.new_page(viewport={'width': 1400, 'height': 1000})
    err = []; pg.on('pageerror', lambda e: err.append(str(e))); pg.on('dialog', lambda d: d.accept()); pg.goto(url)
    pg.locator('#impFile').set_input_files(str(PAT)); pg.wait_for_selector('#romWrap .rc', timeout=20000); pg.wait_for_timeout(1500)
    # status da importação visível
    assert 'Importado' in pg.locator('#impBar .imp-st').inner_text(), pg.locator('#impBar').inner_text()[:200]
    # Informação do PDF, sem ação para ratear o custo de separação.
    sug = pg.locator('#romWrap .rins-sug').filter(has_text='Custo de separação')
    assert sug.count() == 1 and '30,00' in sug.inner_text(), sug.all_inner_texts()
    assert sug.locator('[data-act="rins-sug"]').count() == 0
    assert 'fora do custo' in sug.inner_text()
    assert pg.locator('#romWrap [data-rp="rins"][data-k="valor"]').count() == 0
    print('resumo:', pg.locator('#rinsRes').inner_text()[:140])
    # anel sem tamanho: aviso no topo e cartão marcado
    cards = lambda: pg.locator('#romWrap .rc:not(.lote)')
    cards().nth(1).locator('[data-rp="cat"]').select_option(label='Anel'); pg.wait_for_timeout(500)
    chk = pg.locator('#romChk').inner_text(); print(chk)
    assert 'sem tamanho' in chk and cards().nth(1).evaluate("e=>e.classList.contains('semtam')")
    # banho sem quantidade não gera linha: card 0 só no ouro
    cards().nth(1).locator('[data-rp="peso"]').fill('1.5')
    for t in ('a11', 'a12'): cards().nth(1).locator(f'label:has([data-rp="gi"][data-id="{t}"])').click()
    for i, k in enumerate(('ouro~a11', 'ouro~a12')):
        x = cards().nth(1).locator(f'[data-rp="q"][data-b="{k}"]'); x.fill('3'); x.press('Tab')
    pg.wait_for_timeout(400)
    vr = cards().nth(1).locator('.rc-vr').inner_text()
    assert 'Prata' not in vr, vr
    cards().nth(1).locator('[data-rp="use"]').check()
    # criar só este item e conferir
    for i in range(cards().count()):
        if i != 1: cards().nth(i).locator('[data-rp="use"]').uncheck()
    pg.locator('#romCriar').click(); pg.wait_for_timeout(700)
    rev = pg.locator('.rev').inner_text()
    assert 'Frete e separação ficam fora do custo' in rev, rev[:300]
    pg.locator('[data-act="rev-ok"]').click(); pg.wait_for_timeout(1200)
    if pg.locator('.rep [data-act="rel-fechar"]').count(): pg.locator('.rep [data-act="rel-fechar"]').click()
    pg.wait_for_timeout(400)
    rows = pg.locator('tr[data-l]').evaluate_all("es=>es.map(e=>['E','K','Q','R','T','W'].map(k=>e.querySelector('[data-c='+k+']').innerText.trim()))")
    print(rows)
    assert len(rows) == 2 and all(r[5] == '3' and r[4] == '' for r in rows), rows   # só ouro, sem linha de prata vazia
    assert all(r[2] == '0,50' for r in rows), rows    # apenas o padrão; separação fica fora
    assert not err, err
    b.close(); print('OK romaneio: separação fora do custo, aviso de tamanho e banho sem quantidade')
