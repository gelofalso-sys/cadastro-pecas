"""Romaneio: peça nova fora da lista, foto por item (antes e depois de criar) e insumos próprios do romaneio rateados.
Usa o PDF do romaneio Elvis (itens avulsos). Uso: python tests/t74_romaneio_extras.py [caminho.pdf]"""
from pathlib import Path
import sys, zlib, struct, tempfile, math
from playwright.sync_api import sync_playwright
url = (Path(__file__).resolve().parent.parent / 'Cadastro de Pecas - abrir no Chrome.html').as_uri()
EL = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / 'Downloads' / 'Pedido_59830 (1).pdf'
if not EL.exists():
    print('PULADO: PDF não encontrado', EL); sys.exit(0)


def png(path, cor):
    w = h = 40
    raw = b''.join(b'\x00' + bytes(cor) * w for _ in range(h))
    def ch(t, d): c = struct.pack('>I', len(d)) + t + d; return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    Path(path).write_bytes(b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + ch(b'IDAT', zlib.compress(raw)) + ch(b'IEND', b''))


def r2(x): return math.floor(x * 100 + 0.5 + 1e-9) / 100


def n(s):
    s = (s or '').strip()
    return float(s.replace('.', '').replace(',', '.')) if s else 0.0


tmp = Path(tempfile.mkdtemp()); f1 = tmp / 'a.png'; f2 = tmp / 'b.png'; png(f1, (200, 30, 30)); png(f2, (30, 30, 200))
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge')
    pg = b.new_page(viewport={'width': 1400, 'height': 1000})
    err = []; pg.on('pageerror', lambda e: err.append(str(e))); pg.on('dialog', lambda d: d.accept()); pg.goto(url)
    pg.locator('#impFile').set_input_files(str(EL)); pg.wait_for_selector('#romWrap .rc', timeout=20000); pg.wait_for_timeout(1500)
    cards = lambda: pg.locator('#romWrap .rc:not(.lote)')
    n0 = cards().count()
    # 1) peça nova fora da lista
    pg.locator('#romWrap [data-act="rom-nova"]').first.click(); pg.wait_for_timeout(500)
    assert cards().count() == n0 + 1
    nv = cards().nth(n0)
    assert nv.locator('.rch.extra').count() == 1
    nv.locator('[data-rp="desc"]').fill('Pingente extra'); nv.locator('[data-rp="cod"]').fill('EX-1')
    nv.locator('[data-rp="cat"]').select_option(label='Pingentes')
    for k, v in (('peso', '1'), ('custo', '5')):
        x = cards().nth(n0).locator(f'[data-rp="{k}"]'); x.fill(v); x.press('Tab')
    x = cards().nth(n0).locator('[data-rp="qtdx"]'); x.fill('4'); x.press('Tab'); pg.wait_for_timeout(300)
    cards().nth(n0).locator('[data-act="rom-div"]').click(); pg.wait_for_timeout(300)
    assert cards().nth(n0).locator('[data-soma]').inner_text() == '4/4', cards().nth(n0).locator('[data-soma]').inner_text()
    # os outros itens avulsos recebem peso e divisão
    for i in range(n0):
        c = cards().nth(i); c.locator('[data-rp="cat"]').select_option(label='Brincos'); x = cards().nth(i).locator('[data-rp="peso"]'); x.fill('1'); x.press('Tab'); cards().nth(i).locator('[data-act="rom-div"]').click()
    # 2) insumos do romaneio: 12 + 8 = R$ 20 por unidade
    pg.locator('#romWrap details.rom-ins summary').click()
    for nome, v in (('Caixas', '12'), ('Etiquetas', '8')):
        pg.locator('#romWrap [data-act="rins-add"]').click(); pg.wait_for_timeout(200)
        i = pg.locator('#romWrap [data-rp="rins"][data-k="nome"]').count() - 1
        a = pg.locator(f'#romWrap [data-rp="rins"][data-k="nome"][data-i="{i}"]'); a.fill(nome); a.press('Tab')
        c = pg.locator(f'#romWrap [data-rp="rins"][data-k="valor"][data-i="{i}"]'); c.fill(v); c.press('Tab')
    pg.wait_for_timeout(500)
    print('resumo:', pg.locator('#rinsRes').inner_text())
    un = sum(int(cards().nth(i).locator('[data-soma]').inner_text().split('/')[0]) for i in range(cards().count()))
    esperado = r2(20 / un)
    chip = cards().nth(n0).locator('[data-rins-c]').inner_text()
    print('unidades', un, 'rateio esperado', esperado, '| chip:', chip)
    assert f'{esperado:.2f}'.replace('.', ',') in chip, chip
    # 3) fotos: no item novo (antes de criar) e em outro item
    pg.set_input_files('#ftIn', [], timeout=1000) if False else None
    cards().nth(n0).locator('[data-act="rom-foto-add"]').click(); pg.wait_for_timeout(200)
    pg.set_input_files('#ftIn', str(f1)); pg.wait_for_timeout(1200)
    assert cards().nth(n0).locator('img.rc-ft').count() == 1, 'foto do item novo'
    cards().nth(0).locator('[data-act="rom-foto-add"]').click(); pg.wait_for_timeout(200); pg.set_input_files('#ftIn', str(f2)); pg.wait_for_timeout(1500)
    assert cards().nth(0).locator('img.rc-ft').count() == 1, 'foto do item 0'
    # persiste ao recarregar o painel
    ok_fotos = pg.locator('#romWrap .rc img.rc-ft').count(); print('itens com foto', ok_fotos); assert ok_fotos == 2
    # persistência: recarregar a página e retomar o romaneio mantém peça nova, fotos e insumos
    pg.wait_for_timeout(2500); pg.reload(); pg.wait_for_timeout(1200)
    pg.locator('[data-act="rom-abrir"]').first.click(); pg.wait_for_selector('#romWrap .rc', timeout=15000); pg.wait_for_timeout(800)
    assert pg.locator('#romWrap [data-rp="rins"][data-k="nome"]').count() == 2, 'insumos do romaneio persistem'
    assert pg.locator('#romWrap .rc .rch.extra').count() == 1, 'peça nova persiste'
    assert pg.locator('#romWrap .rc img.rc-ft').count() == 2, 'fotos dos itens persistem'
    assert 'Total R$ 20,00' in pg.locator('#rinsRes').inner_text()
    # 4) criar tudo
    pg.locator('#romCriar').click(); pg.wait_for_timeout(700)
    if pg.locator('[data-act="rev-ok"]').count(): pg.locator('[data-act="rev-ok"]').click(); pg.wait_for_timeout(1200)
    pg.wait_for_timeout(500)
    ABRIR = pg.locator('.rep [data-act="rom-salvo-abrir"]').count()
    print('botão Abrir este romaneio no relatório:', ABRIR)
    # 6) foto depois de criar: o item já lançado aceita foto e a peça da tabela recebe também
    pg.locator('.rep [data-act="rom-salvo-abrir"]').first.click(); pg.wait_for_timeout(1500)
    sem = pg.locator('#romWrap .rc:not(.lote):has([data-act="rom-foto-add"]:not(.x))').count(); print('itens lançados sem foto:', sem)
    assert sem > 0
    pg.locator('#romWrap .rc:not(.lote) button.rc-fadd').first.click(); pg.wait_for_timeout(200); pg.set_input_files('#ftIn', str(f2)); pg.wait_for_timeout(2500)
    pg.wait_for_timeout(500)
    cols = 'E F G I Q W'.split()
    rows = pg.locator('tr[data-l]').evaluate_all("(es,cols)=>es.map(e=>Object.fromEntries(cols.map(k=>[k,(e.querySelector('[data-c='+k+']')||{innerText:''}).innerText.trim()])))", cols)
    print('linhas', len(rows))
    base = 0.5
    ruins = [r for r in rows if abs(n(r['Q']) - (base + esperado)) > 0.011]
    print('linhas com insumo diferente do esperado (padrão + rateio):', [(r['E'], r['Q']) for r in ruins][:5], '| esperado', base + esperado)
    ex = [r for r in rows if r['G'] == 'EX-1']; assert ex, 'peça nova criada'; print('peça nova', ex)
    pg.wait_for_timeout(1500)
    LF0 = "()=>[...document.querySelectorAll('#sheet tr[data-l]')].filter(tr=>tr.querySelector('img')).map(tr=>tr.querySelector('[data-c=G]').innerText.trim())"
    fotos = pg.evaluate(LF0); print('linhas com foto na tabela', fotos)
    assert 'EX-1' in fotos and len(set(fotos)) == 3, fotos
    # 5) conta visível na célula de Insumos
    pg.locator('#side [data-vis="tudo"]').click(); pg.locator('tr[data-l] [data-c="Q"]').first.click(); pg.wait_for_timeout(300)
    conta = pg.locator('#selbar .sel-calculo').inner_text(); print('conta:', conta); assert 'romaneio' in conta and 'R$ 20' not in conta
    assert not err, err
    b.close(); print('OK romaneio: peça nova, fotos por item e insumos rateados')
