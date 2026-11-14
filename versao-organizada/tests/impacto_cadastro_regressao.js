const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('src/js/21d-novidades.js','utf8');const parte=src.slice(src.indexOf('let impConfigAntes='),src.indexOf('/* ===== primeiros passos'));
let tarefa=null,mensagens=[];const ctx={S:{config:{taxa:1},lanc:[{id:'a',peso:2,q:1}]},snapC:'{"taxa":1}',restaurando:false,clone:structuredClone,num:x=>Number(x),r2c:x=>Math.round(x*100)/100,brl:x=>Number(x).toFixed(2).replace('.',','),setTimeout:fn=>(tarefa=fn,1),clearTimeout:()=>{},toast:t=>mensagens.push(t)};
ctx.gerar=ls=>({linhas:ls.map(x=>({lancId:x.id,v:{W:x.q},custo:x.peso*ctx.S.config.taxa}))});ctx.custoLinhaDe=(g,r)=>r.custo;vm.createContext(ctx);vm.runInContext(parte,ctx);
ctx.impactoAgendar();tarefa();assert.equal(mensagens.length,0,'edição anterior de peça não é imputada a cadastro sem impacto');
ctx.snapC=JSON.stringify(ctx.S.config);ctx.S.config={taxa:3};ctx.impactoAgendar();tarefa();assert.match(mensagens[0],/de R\$ 2,00 para R\$ 6,00/);assert.equal(ctx.S.lanc[0].peso,2);assert.equal(ctx.S.config.taxa,3);console.log('OK impacto compara mesma peça antes/depois de mudança no cadastro');
