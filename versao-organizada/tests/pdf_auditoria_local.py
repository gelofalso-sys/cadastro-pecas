from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
if len(sys.argv)!=3: raise SystemExit('Uso: python tests/pdf_auditoria_local.py PEDIDO.pdf LINK.pdf')
files=[Path(x) for x in sys.argv[1:]]
expected=[{'5603':('1','27,70'),'96':('4','19,55'),'95':('3','19,65'),'90':('6','9,20'),'92':('6','13,30'),'70':('6','8,15'),'73':('6','12,30'),'75':('6','18,00')},dict(zip('103708 103711 103712 103713 103730 103736 103738 103743 103748 103750 103768 103771 103787 103789 103792 103794 103806 103808 103810 103813 103820'.split(),zip('6 3 7 12 6 9 3 9 8 6 3 3 3 6 8 3 3 9 5 5 10'.split(),'5,33 9,17 34,58 4,17 3,89 11,67 21,67 5,83 12,08 6,25 15,42 7,50 15,42 7,50 12,08 6,67 7,67 5,83 7,67 6,83 4,17'.split())))]
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge')
 for i,f in enumerate(files):
  page=b.new_page(viewport={'width':1200,'height':900});page.on('dialog',lambda d:d.accept());err=[];page.on('pageerror',lambda e:err.append(str(e)))
  page.goto(url);page.locator('#impFile').set_input_files(str(f.resolve()));page.wait_for_timeout(1500)
  page.locator('#impBar [data-act="imp-abrir"]').first.click()
  page.wait_for_function("() => /peças lidas do PDF/.test(document.querySelector('#romWrap')?.innerText||'')",timeout=120000)
  dados=page.locator('#romWrap .rc').evaluate_all("els=>els.map(e=>e.classList.contains('lote')?{lote:e.querySelector('.lote-h').innerText}:{cod:e.querySelector('[data-rp=cod]').value,custo:e.querySelector('[data-rp=custo]').value,qtd:e.querySelector('.rsum b').innerText,foto:!!e.querySelector('.rc-ft')})")
  assert len(dados)==[15,21][i] and not err,err
  assert {d['cod']:(d['qtd'],d['custo']) for d in dados if 'cod' in d}==expected[i]
  if i==0:
   assert sum('lote' in d for d in dados)==7
   for codigo,peso,preco,total in [('61','81,440','14,7','1.197,17'),('62','0,870','13,9','12,09'),('64','14,220','16,3','231,79'),('66','8,210','17,5','143,68'),('5586','12,010','22,85','274,43'),('5587','26,060','21,5','560,29'),('5588','3,850','21,2','81,62')]:
    assert any(all(x in d.get('lote','') for x in (codigo,peso,preco,total)) for d in dados)
   assert page.locator('#romWrap .rc-ft').count()==0
  else:assert sum(d['foto'] for d in dados)==21
  print(f'{f.name}: {len(dados)} itens, quantidades e valores unitários conferidos',flush=True);page.close()
 b.close()
