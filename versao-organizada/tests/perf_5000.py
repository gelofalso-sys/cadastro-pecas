"""Medição sintética local, 5.000 peças sem fotos; contexto isolado do Edge."""
from pathlib import Path
from time import perf_counter
from playwright.sync_api import sync_playwright
import platform
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');ctx=b.new_context(viewport={'width':1400,'height':900},accept_downloads=True);page=ctx.new_page();page.set_default_timeout(120000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
 page.goto(url);page.locator('[data-tipo="pronta"]').click();page.locator('#f-H').fill('Evidência');page.locator('#f-H').press('Tab');page.locator('#f-I').fill('Pulseiras');page.locator('#f-I').press('Tab');page.locator('#f-F').fill('Peça sintética 00001');page.locator('#f-P').fill('10');page.locator('#f-N').fill('1');page.locator('#f-W').fill('1');page.locator('button.btn.pri.big[type="submit"]').click()
 page.wait_for_function("() => { const s=JSON.parse(localStorage.getItem('cadpecas4')||'{}');return s.lanc?.length===1 }")
 print("Peça inicial criada",flush=True)
 size=page.evaluate('''() => {let s=JSON.parse(localStorage.getItem('cadpecas4'));const base=s.lanc[0];s.lanc=Array.from({length:5000},(_,i)=>{let l=structuredClone(base);l.id='perf-'+i;l.v.F='Peça sintética '+String(i+1).padStart(5,'0');l.v.E='PF'+(i+1);l.rf=1;return l});let j=JSON.stringify(s);localStorage.setItem('cadpecas4',j);return j.length}''')
 print("Dados sintéticos gerados",size,flush=True)
 cdp=ctx.new_cdp_session(page);cdp.send('Profiler.enable');cdp.send('Profiler.start')
 t=perf_counter();page.reload(wait_until='domcontentloaded');page.wait_for_function("() => document.querySelector('#totais')?.innerText.includes('5000')",timeout=180000);opening=(perf_counter()-t)*1000
 profile=cdp.send('Profiler.stop')['profile'];nodes=sorted(profile['nodes'],key=lambda n:n.get('hitCount',0),reverse=True)[:12];print('CPU amostras principais:',[(n['callFrame']['functionName'],n.get('hitCount',0)) for n in nodes],flush=True)
 print('Página carregada',flush=True)
 count=page.locator('#sheet tr[data-l]').count(); search=page.locator('#fBusca');t=perf_counter();search.fill('sintética 04999');page.wait_for_function("() => document.querySelectorAll('#sheet tr[data-l]').length === 1",timeout=120000);search_ms=(perf_counter()-t)*1000
 search.fill('');page.wait_for_function("() => document.querySelector('#totais')?.innerText.includes('5000')",timeout=120000)
 t=perf_counter();scroll=page.locator('#sheet').evaluate('(e)=>{e.scrollTop=e.scrollHeight;return {top:e.scrollTop,max:e.scrollHeight-e.clientHeight}}');scroll_ms=(perf_counter()-t)*1000
 t=perf_counter()
 with page.expect_download(timeout=180000) as dl:
  page.locator('#mbar > [data-act="xlsx"]').evaluate('(e)=>e.click()')
  if page.locator('[data-act="exp-assim"]').is_visible():page.locator('[data-act="exp-assim"]').click()
 export_ms=(perf_counter()-t)*1000
 path=dl.value.path();import openpyxl,io
 wb=openpyxl.load_workbook(io.BytesIO(Path(path).read_bytes()),read_only=True,data_only=False);rows=wb.active.max_row;wb.close()
 print(f'Edge {b.version}; {platform.system()} {platform.release()}; viewport 1400x900; linhas_visíveis={count}; peças=5000; localStorage={size} caracteres; fotos=0',flush=True)
 print(f'abertura={opening:.0f} ms; busca={search_ms:.0f} ms; rolagem_comando={scroll_ms:.0f} ms; scroll={scroll}; exportação={export_ms:.0f} ms; linhas_xlsx={rows}; erros={errors}',flush=True)
 assert count>0 and rows>=5001 and not errors
 ctx.close();b.close()
