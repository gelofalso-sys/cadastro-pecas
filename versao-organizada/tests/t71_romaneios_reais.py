"""Cria peças a partir de um romaneio real (Patricinha: conjunto, anéis, brincos) com tamanhos, cores, divisão e conjunto,
e confere cada linha criada contra um cálculo independente (banho por categoria, verniz, fator) e contra o XLSX exportado.
Uso: python tests/t71_romaneios_reais.py [caminho.pdf]   (sem o PDF o teste é pulado)"""
from pathlib import Path
from io import BytesIO
import sys, math, re
from playwright.sync_api import sync_playwright
from openpyxl import load_workbook
url = (Path(__file__).resolve().parent.parent / 'Cadastro de Pecas - abrir no Chrome.html').as_uri()
PAT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / 'Downloads' / 'patricinhasemijoias-andrelisesantanalavinobittencourt-link-2836.pdf'
if not PAT.exists():
    print('PULADO: PDF não encontrado', PAT); sys.exit(0)
TX = {'ouro': {'Brincos': 1, 'Anel': 2, 'Colares': 3}, 'prata': {'Brincos': .5, 'Anel': 1, 'Colares': 2}}
FATOR = {'ouro': 3, 'prata': 2.5}
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
            i = pg.locator(f'[data-bh="0"] [data-bmv="{bi}"][data-mcat="{cat}"]'); i.fill(str(v)); i.press('Tab')
    pg.locator('#impFile').set_input_files(str(PAT))
    pg.wait_for_selector('#romWrap .rc', timeout=20000); pg.wait_for_timeout(1500)
    for bn, f in FATOR.items():
        x = pg.locator(f'#romWrap [data-rp="mkg"][data-b="{bn}"]'); x.fill(str(f)); x.press('Tab')
    cards = lambda: pg.locator('#romWrap .rc:not(.lote)')
    cats = ['Conjuntos', 'Anel', 'Brincos', 'Brincos', 'Brincos', 'Brincos', 'Anel', 'Anel', 'Anel', 'Anel', 'Brincos']
    for i, c in enumerate(cats):
        cards().nth(i).locator('[data-rp="cat"]').select_option(label=c)

    def peso(i, v):
        x = cards().nth(i).locator('[data-rp="peso"]'); x.fill(v); x.press('Tab')

    def click(i, sel): cards().nth(i).locator(sel).first.click()

    def distribui(i):
        """metade da quantidade da lista no ouro e o resto na prata, repartindo entre tamanhos/cores"""
        r = cards().nth(i); total = int(r.locator('.rsum .hint b').inner_text())
        keys = r.locator('[data-rp="q"]').evaluate_all("es=>es.map(e=>e.dataset.b)")
        og = [k for k in keys if k.startswith('ouro')]; pr = [k for k in keys if k.startswith('prata')]
        q = {k: 0 for k in keys}
        for j in range(total):
            grp = og if ((j % 2 == 0 and og) or not pr) else pr
            q[grp[(j // 2) % len(grp)]] += 1
        for k, v in q.items():
            x = cards().nth(i).locator(f'[data-rp="q"][data-b="{k}"]'); x.fill(str(v)); x.press('Tab')

    # 0: conjunto com 3 componentes de categorias diferentes
    r = cards().nth(0); r.locator('[data-rcj="ativar"]').count() and (r.locator('.rom-conjunto summary').click(), r.locator('[data-rcj="ativar"]').click()); r = cards().nth(0)
    while r.locator('[data-rcji]').count() < 3: r.locator('[data-rcj="adicionar"]').click()
    for k, (d, c, qq, ps, cu) in enumerate([('Colar', 'Colares', '1', '2', '5'), ('Brinco', 'Brincos', '2', '0.8', '2.5'), ('Anel', 'Anel', '1', '1.5', '3.5')]):
        it = r.locator('[data-rcji]').nth(k)
        it.locator('[data-rcjf="desc"]').fill(d); it.locator('[data-rcjf="cat"]').select_option(label=c)
        it.locator('[data-rcjf="qtd"]').fill(qq); it.locator('[data-rcjf="peso"]').fill(ps); it.locator('[data-rcjf="custo"]').fill(cu)
    r = cards().nth(0)
    assert r.locator('[data-rp="peso"]').input_value() == '5,1' and r.locator('[data-rp="custo"]').input_value() == '13,5'
    distribui(0)
    # 1: anel com 3 tamanhos | 2,3: brincos divididos | 4: brinco com 3 cores | 5: brinco dividido
    peso(1, '1.5')
    for t in ('a11', 'a12', 'a13'): click(1, f'label:has([data-rp="gi"][data-id="{t}"])')
    distribui(1)
    peso(2, '0.3'); click(2, '[data-act="rom-div"]'); peso(3, '0.2'); click(3, '[data-act="rom-div"]')
    peso(4, '3.2')
    click(4, '[data-act="rom-cor-on"]')
    for c in ('L:rodio', 'L:preto', 'L:branco'): click(4, f'label:has([data-rp="cs"][data-id="{c}"])')
    distribui(4)
    peso(5, '2'); click(5, '[data-act="rom-div"]')
    # 6: anel com tamanho E cor | 7: três tamanhos | 8: fator manual | 9: sem tamanho (fica pendente) | 10: partido
    peso(6, '1.8')
    for t in ('a14', 'a15'): click(6, f'label:has([data-rp="gi"][data-id="{t}"])')
    click(6, '[data-act="rom-cor-on"]')
    for c in ('L:rodio', 'L:rose'): click(6, f'label:has([data-rp="cs"][data-id="{c}"])')
    distribui(6)
    peso(7, '2')
    for t in ('a16', 'a17', 'a18'): click(7, f'label:has([data-rp="gi"][data-id="{t}"])')
    distribui(7)
    peso(8, '1.2'); click(8, 'label:has([data-rp="gi"][data-id="a19"])'); distribui(8)
    MK = {'ouro': '4', 'prata': '3.5'}
    for bn, v in MK.items():
        x = cards().nth(8).locator(f'[data-rp="mk"][data-b="{bn}"]'); x.fill(v); x.press('Tab')
    peso(9, '2.5')
    peso(10, '1.1'); click(10, '[data-act="rom-partir"]'); pg.locator('[data-act="rom-partir-ok"]').click(); pg.wait_for_timeout(600)
    ncards = cards().count()
    for i in range(10, ncards):
        cards().nth(i).locator('[data-rp="cat"]').select_option(label='Brincos' if i == 10 else 'Colares')
        if not cards().nth(i).locator('[data-rp="peso"]').input_value(): peso(i, '1.1')
        click(i, '[data-act="rom-div"]')
    pg.wait_for_timeout(500)
    print('cartões', ncards, '| avisos:', pg.locator('#romWrap').inner_text().split('Antes de criar:')[1][:170].replace('\n', ' '))
    preview = pg.locator('#romWrap').inner_text()
    pg.locator('#romCriar').click(); pg.wait_for_timeout(700)
    if pg.locator('[data-act="rev-ok"]').count(): pg.locator('[data-act="rev-ok"]').click(); pg.wait_for_timeout(900)
    if pg.locator('.rep [data-act="rel-fechar"]').count(): pg.locator('.rep [data-act="rel-fechar"]').click()
    pg.wait_for_timeout(500)
    cols = 'E F I K L N P Q R S T U V W'.split()
    rows = pg.locator('tr[data-l]').evaluate_all("(es,cols)=>es.map(e=>Object.fromEntries(cols.map(k=>[k,(e.querySelector('[data-c='+k+']')||{innerText:''}).innerText.trim()])))", cols)
    print('linhas criadas', len(rows), '| unidades', sum(int(r['W'] or 0) for r in rows))
    # Expectativa do cenário preenchido acima: divisão de banhos, três cores e partes.
    assert len(rows)==38 and sum(int(r['W'] or 0) for r in rows)==142, 'linhas ou unidades do cenário divergentes'
    falhas = []; est = 0.0
    for r in rows:
        bn = 'prata' if (r['T'] or 'Prata' in r['L']) else 'ouro'
        peso_ = n(r['N']); cat = r['I']; taxa = TX[bn].get(cat); banho = n(r['R']) + n(r['T'])
        if taxa is not None:
            if abs(r2(peso_ * taxa) - banho) > 0.011: falhas.append(('banho', r['E'], r2(peso_ * taxa), banho))
            if abs(r2(peso_ * VZ) - n(r['U'])) > 0.011: falhas.append(('verniz', r['E'], r2(peso_ * VZ), n(r['U'])))
        custo = n(r['P']) + n(r['Q']) + banho + n(r['U'])
        # decisão do projeto: o varejo só entra na tabela se digitado; a sugestão é custos × fator (mostrada nos cartões)
        fx = float(MK[bn]) if r['E'].startswith('AN4') else FATOR[bn]
        est += r2(custo * fx) * int(r['W'] or 0)
        if r['V']: falhas.append(('varejo preenchido sem ser digitado', r['E'], r['V']))
    m = re.search(r'Varejo estimado R\$ ([\d.,]+)', preview)
    print('varejo estimado na tela', m.group(1) if m else None, '| calculado pelas linhas criadas', f'{est:.2f}')
    assert m, 'prévia de varejo estimado ausente'
    if m and abs(n(m.group(1)) - est) > 0.5: falhas.append(('varejo estimado', n(m.group(1)), est))
    for r in rows:
        print(r['E'], r['I'], r['K'], r['L'], 'peso', r['N'], 'P', r['P'], 'Q', r['Q'], 'R', r['R'], 'T', r['T'], 'U', r['U'], 'V', r['V'], 'qtd', r['W'])
    print('FALHAS', falhas[:5])
    pg.locator('#side [data-vis="tudo"]').click()
    with pg.expect_download() as d:
        pg.locator('[data-act="xlsx"]').first.click()
        if pg.locator('[data-act="exp-assim"]').count() and pg.locator('[data-act="exp-assim"]').is_visible(): pg.locator('[data-act="exp-assim"]').click()
    wb = load_workbook(BytesIO(Path(d.value.path()).read_bytes()), data_only=False); ws = wb.active
    data = list(ws.iter_rows(values_only=True)); head = list(data[0])
    print('XLSX linhas', len(data) - 1, '| iguais às da tabela:', len(data) - 1 == len(rows))
    for x, original in zip(data[1:], rows):
        for col, nome in [('E','Referência'), ('I','Categoria'), ('N','Peso'), ('P','Custo de Compra'), ('Q','Custo de Insumos'), ('W','Quantidade')]:
            valor=x[head.index(nome)]
            if isinstance(valor,str) and valor.startswith('='):
                assert valor != '=', (nome, original['E'])
            elif col in ('N','P','Q','W'):
                assert abs(float(valor or 0)-n(original[col])) < .001, (nome, original['E'], valor, original[col])
            else:
                assert (original[col].startswith(str(valor)) if col=='E' and valor else str(valor or '') == original[col]), (nome, original['E'], valor, original[col])
    for nome in ('Custo do Banho de Ouro', 'Custo do Banho de Prata', 'Custo do Banho de Verniz', 'Preço de Varejo'):
        print(nome, [str(x[head.index(nome)]) for x in data[1:4]])
    print('diálogos', dl); print('erros JS', err)
    assert not err and not falhas and len(data) - 1 == len(rows)
    b.close(); print('OK romaneio Patricinha: conjunto, tamanhos, cores, divisão e fatores conferem')
