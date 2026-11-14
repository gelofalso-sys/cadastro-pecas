// Regressão de cálculo: valores efetivos de categorias em conjunto com quantidades e banhos múltiplos.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const s=fs.readFileSync('src/js/18-conjunto.js','utf8');
const code=require('./_fonte').tudo()+s.slice(s.indexOf('function conjSync('),s.indexOf('function conjPainel('));
const mult='';
const banho=[{id:'ouro',nome:'Ouro',coluna:'R',modo:'peso',mult:'9',multCat:{Brincos:'2',Colares:'5'}},{id:'prata',nome:'Prata',coluna:'T',modo:'peso',mult:'9',multCat:{Brincos:'3',Colares:'6'}}];
const C={catAlias:{},categorias:[{nome:'Brincos'},{nome:'Colares'},{nome:'Conjuntos'}],banhistas:[{id:'h',banhos:banho,verniz:'0,42'}]};
const ctx={S:{config:C,lanc:[]},document:{getElementById:()=>null,addEventListener(){}}};
vm.createContext(ctx);vm.runInContext(''+'\n'+code,ctx);
const f={tipo:'pronta',v:{I:'Conjuntos'},onP:{ouro:true,prata:true},ov:{},conj:true,comp:[{desc:'Brinco',cat:'Brincos',qtd:'3',peso:'1',custo:'2'},{desc:'Colar',cat:'Colares',qtd:'2',peso:'2',custo:'3'}]};
ctx.conjSync(f);assert.equal(f.v.N,'7');assert.equal(f.v.P,'12');assert.equal(f.ov.ouro.R,'26');assert.equal(f.ov.prata.T,'33');assert.equal(f.ov.ouro.U,'2,94');
banho[0].modo='fixo';ctx.conjSync(f);assert.equal(f.ov.ouro.R,'16');
f.comp[0].banho='-';ctx.conjSync(f);assert.equal(f.ov.ouro.R,'10');
f.comp[0].banho='';banho[0].modo='peso';banho[0].multCat.Brincos='4';ctx.conjSync(f);assert.equal(f.ov.ouro.R,'32');
console.log('OK banho de conjuntos: categorias e quantidades por peso/fixo, verniz, variações e recálculo');
