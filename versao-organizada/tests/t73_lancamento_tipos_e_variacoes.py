"""Lançamento pelo formulário de cada tipo de peça do sistema, com tamanhos, cores e conjunto:
bruta simples, bruta com tamanhos, bruta com tamanho × cor (matriz), variação da anterior, pronta com preço digitado e
conjunto de componentes de categorias diferentes. Cada linha criada é conferida contra um cálculo independente."""
from pathlib import Path
import math
from playwright.sync_api import sync_playwright
url = (Path(__file__).resolve().parent.parent / 'Cadastro de Pecas - abrir no Chrome.html').as_uri()
TX = {'ouro': {'Brincos': 1, 'Anel': 2, 'Colares': 3, 'Pingentes': 2.5}, 'prata': {'Brincos': .5, 'Anel': 1, 'Colares': 1.5, 'Pingentes': 1.2}}
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

    def preencher(desc, cat, peso, compra, **kw):
        pg.locator('[data-act="limpar"]').first.click() if pg.locator('[data-act="limpar"]').count() else None
        pg.fill('#f-F', desc); pg.fill('#f-I', cat); pg.press('#f-I', 'Tab'); pg.wait_for_timeout(300)
        if peso: pg.fill('#f-N', peso)
        if compra: pg.fill('#f-P', compra)

    def adicionar():
        pg.locator('button.btn.pri.big[type="submit"]').click(); pg.wait_for_timeout(600)

    contas = {}   # descrição -> componentes para conferir o conjunto
    # 1) bruta simples: brinco, ouro 3 + prata 2
    preencher('Brinco argola', 'Brincos', '1.2', '4'); pg.fill('#f-ouro-W', '3'); pg.fill('#f-prata-W', '2'); adicionar()
    # 2) bruta com 3 tamanhos: aros 12/13/14, 2 de cada em cada banho
    preencher('Anel solitario', 'Anel', '1.8', '5.5')
    for t in ('a12', 'a13', 'a14'): pg.locator(f'label:has([data-gi="{t}"])').click()
    for bn in ('ouro', 'prata'): pg.fill(f'[data-qall="{bn}"]', '2')
    adicionar()
    # 3) bruta tamanho × cor (matriz): só ouro, 1 de cada combinação
    preencher('Anel zirconia', 'Anel', '2.1', '6')
    for t in ('a15', 'a16'): pg.locator(f'label:has([data-gi="{t}"])').click()
    pg.locator('[data-act="cor-on"]').click(); pg.wait_for_timeout(300)
    for c in ('L:rodio', 'L:preto'): pg.locator(f'label:has([data-cs="{c}"])').click()
    pg.locator('[data-on="prata"]').uncheck(); pg.fill('[data-qall="ouro"]', '1'); adicionar()
    # 4) pronta com preço digitado (sem banho)
    preencher('Colar pronto', 'Colares', '3', '12')
    pg.locator('[data-tipo="pronta"]').click(); pg.wait_for_timeout(300)
    pg.fill('#f-W', '4'); pg.fill('#f-V', '55'); adicionar()
    # 5) conjunto pelo formulário: brinco (2×) + colar + pingente, categorias diferentes
    preencher('Conjunto lua', 'Conjuntos', '', '')
    pg.locator('[data-tipo="conjunto"]').click(); pg.wait_for_timeout(400)
    comps = [('Brinco', 'Brincos', '2', '0.5', '1.2'), ('Colar', 'Colares', '1', '2', '5'), ('Pingente', 'Pingentes', '1', '1', '3')]
    for _ in range(3):
        if pg.locator('#conj [data-ci="2"]').count() == 0: pg.locator('[data-act="comp-add"]').first.click(); pg.wait_for_timeout(250)
    for k, (d, ct, qq, ps, cu) in enumerate(comps):
        row = pg.locator(f'#conj [data-ci="{k}"]')
        row.locator('[data-cp="desc"]').fill(d); row.locator('[data-cp="cat"]').select_option(label=ct)
        row.locator('[data-cp="qtd"]').fill(qq); row.locator('[data-cp="peso"]').fill(ps); row.locator('[data-cp="custo"]').fill(cu)
    pg.wait_for_timeout(300)
    print('resumo do conjunto:', pg.inner_text('#conjSum')[:300].replace('\n', ' '))
    for bn in ('ouro', 'prata'): pg.locator(f'[data-on="{bn}"]').check()
    pg.fill('#f-ouro-W', '2'); pg.fill('#f-prata-W', '1'); adicionar()
    cols = 'E F I K L N P Q R S T U V W'.split()
    rows = pg.locator('tr[data-l]').evaluate_all("(es,cols)=>es.map(e=>Object.fromEntries(cols.map(k=>[k,(e.querySelector('[data-c='+k+']')||{innerText:''}).innerText.trim()])))", cols)
    print('linhas criadas', len(rows))
    falhas = []
    for r in rows:
        print(r['E'], r['F'][:24], r['I'], r['K'], r['L'], 'peso', r['N'], 'P', r['P'], 'Q', r['Q'], 'R', r['R'], 'T', r['T'], 'U', r['U'], 'V', r['V'], 'qtd', r['W'])
        bn = 'prata' if r['T'] else 'ouro'; banho = n(r['R']) + n(r['T']); ps = n(r['N'])
        if r['I'] == 'Conjuntos':
            esp = r2(sum(float(c[3]) * int(c[2]) * TX[bn][c[1]] for c in comps)); espv = r2(sum(float(c[3]) * int(c[2]) for c in comps) * VZ)
            if abs(n(r['P']) - sum(float(c[4]) * int(c[2]) for c in comps)) > 0.011: falhas.append(('compra do conjunto', r['E'], n(r['P'])))
        elif r['L'] in ('Ouro', 'Prata') and (r['R'] or r['T']):
            esp = r2(ps * TX[bn][r['I']]); espv = r2(ps * VZ)
        else:
            esp = 0; espv = 0
            if banho or n(r['U']): falhas.append(('peça pronta não deve ter banho', r['E']))
        if abs(esp - banho) > 0.011: falhas.append(('banho', r['E'], esp, banho))
        if abs(espv - n(r['U'])) > 0.011: falhas.append(('verniz', r['E'], espv, n(r['U'])))
    qtd = {r['F'][:12]: 0 for r in rows}
    for r in rows: qtd[r['F'][:12]] += int(r['W'] or 0)
    print('unidades por peça', qtd)
    print('FALHAS', falhas); print('diálogos', dl); print('erros JS', err)
    assert not err and not falhas and len(rows) >= 14
    b.close(); print('OK formulário: bruta, tamanhos, tamanho×cor, pronta e conjunto conferem')
