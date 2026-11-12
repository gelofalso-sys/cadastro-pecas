"""Romaneio real com lotes vendidos por grama (GR) + peças avulsas (PC) + trios cadastrados como conjuntos de categorias diferentes.
Cria tudo na tabela e confere banho por categoria, verniz e o custo por grama contra um cálculo independente.
Uso: python tests/t72_romaneio_peso_e_trios.py [caminho.pdf]   (sem o PDF o teste é pulado)"""
from pathlib import Path
import sys, math
from playwright.sync_api import sync_playwright
url = (Path(__file__).resolve().parent.parent / 'Cadastro de Pecas - abrir no Chrome.html').as_uri()
EL = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / 'Downloads' / 'Pedido_59830 (1).pdf'
if not EL.exists():
    print('PULADO: PDF não encontrado', EL); sys.exit(0)
TX = {'ouro': {'Brincos': 1, 'Masculinos': 1.8, 'Pingentes': 2.5, 'Colares': 3, 'Anel': 2}, 'prata': {'Brincos': .5, 'Masculinos': .9, 'Pingentes': 1.2, 'Colares': 1.5, 'Anel': 1}}
VZ = .42


def r2(x): return math.floor(x * 100 + 0.5 + 1e-9) / 100


def n(s):
    s = (s or '').strip()
    return float(s.replace('.', '').replace(',', '.')) if s else 0.0


with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge')
    pg = b.new_page(viewport={'width': 1400, 'height': 1000})
    err = []; dl = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('dialog', lambda d: (dl.append(d.message), d.accept()))
    pg.goto(url)
    for bi, bn in enumerate(['ouro', 'prata']):
        for cat, v in TX[bn].items():
            i = pg.locator(f'[data-bh="0"] [data-bmv="{bi}"][data-mcat="{cat}"]')
            if i.count(): i.fill(str(v)); i.press('Tab')
    pg.locator('#impFile').set_input_files(str(EL))
    pg.wait_for_selector('#romWrap .rc', timeout=20000); pg.wait_for_timeout(1500)
    lotes = pg.locator('#romWrap .rc.lote')
    assert lotes.count() == 7, lotes.count()
    # lotes pesados: [índice do lote, nº de itens]; a grama vem do PDF (14,70 / 13,90 / 16,30)
    for i, qt in [(0, 4), (1, 1), (2, 3)]:
        l = pg.locator('#romWrap .rc.lote').nth(i); l.locator('[data-lotn]').fill(str(qt)); l.locator('[data-act="lote-add"]').click(); pg.wait_for_timeout(300)
    cards = lambda: pg.locator('#romWrap .rc:not(.lote)')
    cod = lambda i: cards().nth(i).locator('[data-rp="cod"]').input_value()
    idx = lambda c: next(i for i in range(cards().count()) if cod(i) == c)
    allc = [cod(i) for i in range(cards().count())]
    print('cartões:', allc)

    def sel_cat(c, cat): cards().nth(idx(c)).locator('[data-rp="cat"]').select_option(label=cat)

    def peso(c, v):
        x = cards().nth(idx(c)).locator('[data-rp="peso"]'); x.fill(v); x.press('Tab')

    def click(c, sel): cards().nth(idx(c)).locator(sel).first.click()

    esperado = {}   # cod -> dict(custo, cat, peso, qtd)
    # lote 1: CORRENTARIA MASCULINA, 81,440 g a R$ 14,70/g -> 4 itens que fecham o lote
    for k, ps in enumerate(['20', '20', '20', '21.44'], 1):
        c = f'61-{k}'; sel_cat(c, 'Masculinos'); peso(c, ps); click(c, '[data-act="rom-div"]'); esperado[c] = ('Masculinos', float(ps), 14.7)
    sel_cat('62-1', 'Pingentes'); peso('62-1', '0.87'); click('62-1', '[data-act="rom-div"]'); esperado['62-1'] = ('Pingentes', .87, 13.9)
    for k, (ps, cat) in enumerate([('5', 'Colares'), ('5', 'Pingentes'), ('4.22', 'Brincos')], 1):
        c = f'64-{k}'; sel_cat(c, cat); peso(c, ps); click(c, '[data-act="rom-div"]'); esperado[c] = (cat, float(ps), 16.3)
    pg.wait_for_timeout(400)
    # peças avulsas (PC): ear jacket, brincos de 6 unidades
    for c, ps in [('5603', '2.4'), ('90', '1.1'), ('92', '1.6'), ('70', '0.9'), ('73', '1.4'), ('75', '2.2')]:
        sel_cat(c, 'Brincos'); peso(c, ps); click(c, '[data-act="rom-div"]')
    # cores e quantidades divergentes: 90 em duas cores, 75 em 3 cores
    click('90', '[data-act="rom-cor-on"]')
    for cr in ('L:rodio', 'L:preto'): click('90', f'label:has([data-rp="cs"][data-id="{cr}"])')
    r = cards().nth(idx('90')); keys = r.locator('[data-rp="q"]').evaluate_all("es=>es.map(e=>e.dataset.b)")
    qs = {k: 0 for k in keys}; og = [k for k in keys if k.startswith('ouro')]; pr = [k for k in keys if k.startswith('prata')]
    for j in range(6):
        grp = og if (j % 2 == 0 and og) or not pr else pr; qs[grp[(j // 2) % len(grp)]] += 1
    for k, v in qs.items():
        x = cards().nth(idx('90')).locator(f'[data-rp="q"][data-b="{k}"]'); x.fill(str(v)); x.press('Tab')
    # trios como conjunto: 96 = três brincos de 3/4/5 mm (mesma categoria), 95 = colar + pingente + brinco (categorias diferentes)
    TRIOS = {'96': [('Brinco 3mm', 'Brincos', '1', '0.3', '6.5'), ('Brinco 4mm', 'Brincos', '1', '0.4', '6.5'), ('Brinco 5mm', 'Brincos', '1', '0.5', '6.55')],
             '95': [('Colar', 'Colares', '1', '2', '8'), ('Pingente', 'Pingentes', '1', '1', '6'), ('Brinco', 'Brincos', '2', '0.6', '2.825')]}
    for c, comps in TRIOS.items():
        sel_cat(c, 'Conjuntos'); r = cards().nth(idx(c)); r.locator('.rom-conjunto summary').click(); r.locator('[data-rcj="ativar"]').click(); r = cards().nth(idx(c))
        while r.locator('[data-rcji]').count() < len(comps): r.locator('[data-rcj="adicionar"]').click()
        for k, (d, ct, qq, ps, cu) in enumerate(comps):
            it = r.locator('[data-rcji]').nth(k); it.locator('[data-rcjf="desc"]').fill(d); it.locator('[data-rcjf="cat"]').select_option(label=ct)
            it.locator('[data-rcjf="qtd"]').fill(qq); it.locator('[data-rcjf="peso"]').fill(ps); it.locator('[data-rcjf="custo"]').fill(cu)
        click(c, '[data-act="rom-div"]')
        print('conjunto', c, 'peso', cards().nth(idx(c)).locator('[data-rp="peso"]').input_value(), 'custo', cards().nth(idx(c)).locator('[data-rp="custo"]').input_value())
    pg.wait_for_timeout(500)
    print('avisos:', pg.locator('#romWrap').inner_text().split('Antes de criar:')[1][:200].replace('\n', ' '))
    pg.locator('#romCriar').click(); pg.wait_for_timeout(700)
    if pg.locator('[data-act="rev-ok"]').count(): pg.locator('[data-act="rev-ok"]').click(); pg.wait_for_timeout(900)
    if pg.locator('.rep [data-act="rel-fechar"]').count(): pg.locator('.rep [data-act="rel-fechar"]').click()
    pg.wait_for_timeout(500)
    cols = 'E F G I K L N P Q R S T U W'.split()
    rows = pg.locator('tr[data-l]').evaluate_all("(es,cols)=>es.map(e=>Object.fromEntries(cols.map(k=>[k,(e.querySelector('[data-c='+k+']')||{innerText:''}).innerText.trim()])))", cols)
    print('linhas criadas', len(rows), '| unidades', sum(int(r['W'] or 0) for r in rows))
    for r in rows: print(r['G'], r['E'], r['F'][:26], r['I'], 'peso', r['N'], 'P', r['P'], 'Q', r['Q'], 'R', r['R'], 'T', r['T'], 'U', r['U'], 'qtd', r['W'])
    falhas = []
    COMP = {'96': [('Brincos', 1, .3), ('Brincos', 1, .4), ('Brincos', 1, .5)], '95': [('Colares', 1, 2), ('Pingentes', 1, 1), ('Brincos', 2, .6)]}
    for r in rows:
        bn = 'prata' if r['T'] else 'ouro'; banho = n(r['R']) + n(r['T']); ps = n(r['N']); cod_ = r['G']
        if cod_ in COMP:
            esp = r2(sum(ps_ * q_ * TX[bn][ct] for ct, q_, ps_ in COMP[cod_])); espv = r2(sum(ps_ * q_ for ct, q_, ps_ in COMP[cod_]) * VZ)
        elif cod_ in esperado:
            ct, pe, gr = esperado[cod_]; esp = r2(pe * TX[bn][ct]); espv = r2(pe * VZ)
            if abs(n(r['P']) - r2(pe * gr)) > 0.011: falhas.append(('custo por grama', cod_, r2(pe * gr), n(r['P'])))
        else:
            esp = r2(ps * TX[bn][r['I']]); espv = r2(ps * VZ)
        if abs(esp - banho) > 0.011: falhas.append(('banho', r['E'], esp, banho))
        if abs(espv - n(r['U'])) > 0.011: falhas.append(('verniz', r['E'], espv, n(r['U'])))
    print('FALHAS', falhas); print('diálogos', dl); print('erros JS', err)
    assert not err and not falhas and rows
    b.close(); print('OK romaneio por peso: lotes pesados, peças avulsas e trios em conjuntos conferem')
