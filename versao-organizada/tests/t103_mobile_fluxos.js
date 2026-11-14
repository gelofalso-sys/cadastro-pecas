const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const b=await chromium.launch({channel:'chrome'}),ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(pathToFileURL(path.resolve(process.env.CP_HTML || 'Cadastro de Pecas - abrir no Chrome.html')).href);
 await p.evaluate(()=>{const x=document.createElement('div');Object.assign(x.style,{position:'fixed',right:'0',bottom:'0',width:'197px',height:'64px',zIndex:'999999',background:'black'});document.body.appendChild(x)});
 const menu=p.locator('#mobileMenu');await p.locator('#mobileMenu summary').click();assert(await menu.evaluate(e=>e.open));await p.locator('#mobileMenu .mobile-menu-close').click();assert(!(await menu.evaluate(e=>e.open)));
 await p.locator('[data-act="ir-form"]').click();const descricao=p.locator('#f-F');await descricao.fill('Peça de teste');assert.equal(await descricao.inputValue(),'Peça de teste');
 await descricao.focus();await p.setViewportSize({width:390,height:540});assert(await descricao.evaluate(e=>document.activeElement===e));await p.setViewportSize({width:390,height:844});
 const foto=p.locator('#form [data-act="foto-form"]');const [chooser]=await Promise.all([p.waitForEvent('filechooser'),foto.click()]);
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
 await chooser.setFiles({name:'teste.png',mimeType:'image/png',buffer:png});await p.locator('#form .ftslot.has img').waitFor();
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);assert.deepEqual(errors,[]);await b.close();console.log('OK menu, formulário, foco com viewport reduzida e foto em contexto móvel isolado');
})().catch(e=>{console.error(e);process.exitCode=1});

