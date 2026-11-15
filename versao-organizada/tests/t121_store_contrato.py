"""Contrato do store (Etapa 3, 3.4): a bateria de tests/contrato_store.js roda contra o adaptador local no navegador real."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
aqui=Path(__file__).resolve().parent
url=Path(os.environ.get('CP_TEST_HTML') or aqui.parent/'Cadastro de Pecas - abrir no Chrome.html').resolve().as_uri()
contrato=(aqui/'contrato_store.js').read_text(encoding='utf-8')
# o app roda dentro de uma IIFE (sem globais): o teste carrega os arquivos reais de src/store/ na pagina, no mesmo navegador e banco
fontes=''.join((aqui.parent/'src'/'store'/f).read_text(encoding='utf-8')+chr(10) for f in ('local.js','idb.js','store-local.js'))
AMB="""{
 chaves:{blob:'cadpecas4',romsIdx:'cadpecas-roms',tabsIdx:'cadpecas-tabs'},
 limpar(){Object.values(this.chaves).forEach(k=>localStorage.removeItem(k))},
 plantar(n,v){localStorage.setItem(this.chaves[n],v)},
 ler(n){return localStorage.getItem(this.chaves[n])}
}"""
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page();errs=[];q.on('pageerror',lambda e:errs.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url);q.wait_for_timeout(800)
 falhas=q.evaluate("(async()=>{const storeLocal=new Function("+__import__('json').dumps(fontes+";return storeLocal")+")();"+contrato+";return await contrato(storeLocal,"+AMB+")})()")
 assert falhas==[],'contrato do store falhou:\n  '+'\n  '.join(falhas)
 assert not errs,errs
 b.close()
print('t121_store_contrato.py: OK')
