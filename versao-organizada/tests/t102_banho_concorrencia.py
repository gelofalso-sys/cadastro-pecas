"""Duas abas isoladas: reserva impede exclusão e protege até salvar ou descartar."""
from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'cadastro-pecas.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge'); ctx=b.new_context(); ctx.add_init_script("localStorage.setItem('cadpecas-cad-estrito','1')")
 a=ctx.new_page(); dialogs=[]; errors=[]; a.on('dialog',lambda d:(dialogs.append(d.message),d.dismiss())); a.on('pageerror',lambda e:errors.append(str(e)));  a.goto(url); a.locator('[data-act="ctab"][data-id="banho"]').click()
 outra=ctx.new_page(); outra.goto(url); outra.locator('[data-act="ctab"][data-id="banho"]').wait_for()
 botao=a.locator('[data-bh="0"] [data-bn="0"] [data-act="bn-del"]'); botao.click(); a.wait_for_timeout(300)
 assert dialogs and 'outras abas' in dialogs[-1],dialogs
 assert a.locator('[data-bh="0"] [data-bn="0"] [data-bnf="nome"]').input_value()=='Ouro'
 outra.close(); botao.click(); a.locator('#cadBar').wait_for(); assert a.locator('[data-bh="0"] [data-bn="0"] [data-bnf="nome"]').input_value()=='Prata'
 nova=ctx.new_page(); nova.goto(url); nova.wait_for_timeout(300); assert nova.locator('body').evaluate('(e)=>e.inert'), 'nova aba não ficou aguardando a reserva'
 a.locator('#cadBar [data-cad="salvar"]').click(); a.locator('#cadBar').wait_for(state='detached'); nova.wait_for_function('()=>!document.body.inert');
 assert not errors,errors
 assert a.evaluate("()=>!JSON.parse(localStorage.getItem('cadpecas4')).config.banhistas[0].banhos.some(x=>x.id==='ouro')")
 nova.close(); a.locator('[data-bh="0"] [data-bn="0"] [data-act="bn-del"]').click(); a.locator('#cadBar').wait_for()
 a.locator('#cadBar [data-cad="descartar"]').click(); a.locator('#cadBar').wait_for(state='detached')
 assert a.locator('[data-bh="0"] [data-bn="0"] [data-bnf="nome"]').input_value()=='Prata'
 ultima=ctx.new_page(); ultima.goto(url); ultima.wait_for_function('()=>!document.body.inert'); ultima.close()
 b.close(); print('OK reserva impede concorrência e protege a confirmação dos cadastros')




