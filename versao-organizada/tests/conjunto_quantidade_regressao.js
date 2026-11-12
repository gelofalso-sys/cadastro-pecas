const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const s=fs.readFileSync('src/js/18-conjunto.js','utf8');
const code=s.slice(s.indexOf('function conjQtd'),s.indexOf('function conjResumoHTML'))+s.slice(s.indexOf('function conjCat(c)'),s.indexOf('function conjCatOpts'))+s.slice(s.indexOf('function conjCalc('),s.indexOf('/* ao sair'));
const banho={id:'ouro',coluna:'R',modo:'peso',mult:'5'},bh={banhos:[banho],verniz:'0,42'};
const ctx={banhoSemCalc:b=>!!b&&(b.modo==="nenhum"||!b.coluna),num:x=>x==null||x===''?null:Number(String(x).replace(',','.')),vazio:x=>x==null||x==='',semAc:x=>String(x).toLowerCase(),cfg:()=>({catAlias:{}}),catBy:n=>n==='Colares'?{nome:n}:null,bhDe:()=>bh,bonP:()=>[banho],multItem:()=>5,vzPad:()=>true};vm.createContext(ctx);vm.runInContext(code,ctx);
const f={v:{I:'Colares'},comp:[{desc:'Colar',cat:'Colares',qtd:'3',peso:'2',custo:'4'}]};let r=ctx.conjCalc(f);assert.equal(r.tot.N,6);assert.equal(r.tot.P,12);assert.equal(r.tot.R,30);assert(Math.abs(r.tot.U-2.52)<1e-9);banho.modo='fixo';r=ctx.conjCalc(f);assert.equal(r.tot.R,15);
for(const qtd of ['','0','-1','1,5','10000']){f.comp[0].qtd=qtd;assert.match(ctx.conjErro(f,0),/quantidade/)}delete f.comp[0].qtd;assert.equal(ctx.conjCalc(f).tot.R,5,'legado = 1');console.log('OK quantidade por componente: peso, compra, banho por peso e fixo, verniz e legado');
