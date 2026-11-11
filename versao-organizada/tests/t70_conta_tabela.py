from pathlib import Path
from playwright.sync_api import sync_playwright
import os
root=Path(__file__).resolve().parent.parent
url=(root/('publicar-netlify/index.html' if os.environ.get('CP_TESTAR_PACOTE')=='1' else 'Cadastro de Pecas - abrir no Chrome.html')).as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1400,'height':900});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(url)
 q.fill('#f-F','Teste conferência');q.fill('#f-N','2');q.fill('#f-P','5');q.fill('#f-ouro-W','3');q.locator('button.btn.pri.big[type="submit"]').click();q.wait_for_timeout(500)
 q.locator('tr[data-l] [data-c="R"]').first.click();text=q.locator('#selbar .sel-calculo').inner_text();print('Conta:',text,flush=True);assert '2 g' in text and '/g' in text and '3 un.' in text and 'R$ 9,00' in text,text
 assert not errors,errors;b.close();print('OK conferência ao vivo na tabela')
