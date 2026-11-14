const assert=require('node:assert/strict');
const {ligar}=require('./unit/_contexto.mjs');
const banho={id:'ouro',coluna:'R',modo:'peso',mult:'5'},bh={id:'h',banhos:[banho],verniz:'0,42'};
const ctx=ligar({config:{catAlias:{},categorias:[{nome:'Colares'}],banhistas:[bh]},lanc:[]});
const f={tipo:'pronta',onP:{ouro:true},v:{I:'Colares'},comp:[{desc:'Colar',cat:'Colares',qtd:'3',peso:'2',custo:'4'}]};let r=ctx.conjCalc(f);assert.equal(r.tot.N,6);assert.equal(r.tot.P,12);assert.equal(r.tot.R,30);assert(Math.abs(r.tot.U-2.52)<1e-9);banho.modo='fixo';r=ctx.conjCalc(f);assert.equal(r.tot.R,15);
for(const qtd of ['','0','-1','1,5','10000']){f.comp[0].qtd=qtd;assert.match(ctx.conjErro(f,0),/quantidade/)}delete f.comp[0].qtd;assert.equal(ctx.conjCalc(f).tot.R,5,'legado = 1');console.log('OK quantidade por componente: peso, compra, banho por peso e fixo, verniz e legado');
