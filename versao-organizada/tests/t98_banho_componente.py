from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1300,'height':900});dialogs=[]
 q.on('dialog',lambda d:(dialogs.append(d.message),d.dismiss()));q.goto(url)
 q.evaluate('''()=>{const s=JSON.parse(localStorage.getItem('cadpecas4'));s.lanc=[{id:'conjunto-teste',tipo:'bruta',banhista:'scarlat',v:{E:'CJ1',F:'Conjunto',I:'Brincos',N:'2',P:'10',W:'1'},comp:[{desc:'Componente',peso:'2',custo:'10',qtd:'1',banho:'ouro'}],conj:true,on:{},ov:{}}];localStorage.setItem('cadpecas4',JSON.stringify(s))}''');q.reload()
 q.locator('[data-act="ctab"][data-id="banho"]').click();btn=q.locator('[data-bh="0"] [data-bn="0"] [data-act="bn-del"]');btn.click();q.wait_for_timeout(500)
 assert dialogs and 'componentes' in dialogs[-1],dialogs
 assert q.locator('[data-bh="0"] [data-bn="0"] [data-bnf="nome"]').input_value()=='Ouro'
 print('OK exclusão de banho usado por componente bloqueada e avisada');b.close()
