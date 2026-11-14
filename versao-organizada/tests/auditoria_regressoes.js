// Testes isolados das regras de divisão e conferência de lotes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/js/21-edicao-em-lote-e-revisao.js', 'utf8');
const resumo = source.slice(source.indexOf('const romLoteReal='), source.indexOf('function romLoteHTML'));
const partir = source.slice(source.indexOf('function romPartir'), source.indexOf('function romJuntar'));
const ctx = {
  ROM: {rows: []}, uid: () => 'grupo', clone: x => structuredClone(x),
  num: x => x == null || x === '' ? null : Number(String(x).replace(',', '.')),
  r2c: x => Math.round(+(x*100).toPrecision(12))/100,
  virg: x => String(x).replace('.', ','), g3: x => Number(x).toFixed(3).replace('.', ','),
  brl: x => Number(x).toFixed(2).replace('.', ','), toast: () => {},
  romSalvarSoon: () => {}, renderRom: () => {}
};
vm.createContext(ctx);
vm.runInContext('const romLoteKids=r=>ROM.rows.filter(x=>x.loteDe===r.lid);\n' + resumo + '\n' + partir, ctx);
const lote = {lote:true, lid:'l', loteG:10, pesoReal:'10', precoG:2, total:20};
const filho = {loteDe:'l', precoG:2, peso:'9,980', custo:'19,96', cod:'1-1', desc:'teste', qtd:1, q:{ouro:'1'}, feito:true, skip:true, lancIds:['id']};
ctx.ROM.rows = [lote, filho];
assert.notEqual(ctx.romLoteResumo(lote).cls, 'ok', 'diferença de 0,020 g não deve fechar');
filho.peso='10,000'; filho.custo='20';
ctx.romPartir(filho, 2);
const parts=ctx.ROM.rows.slice(1);
assert.equal(parts.length, 2);
assert.deepEqual(parts.map(x => x.peso), ['5,000', '5,000']);
assert.equal(parts.reduce((s,x) => s + ctx.num(x.custo), 0), 20);
assert.equal(parts[0].refaz, true);
assert.equal(parts[0].lancIds[0], 'id');
assert.equal(parts[1].feito, false);
assert.equal(ctx.romLoteResumo(lote).cls, 'ok');
ctx.ROM.rows = [{loteDe:'l', peso:'5', custo:'10,024'}, {loteDe:'l', peso:'5', custo:'9,936'}];
assert.equal(ctx.romLoteResumo(lote).cls, 'warn', 'diferença de quatro centavos não deve aparecer como conferida');
assert.match(ctx.romLoteResumo(lote).txt, /0,04/);
console.log('Regras de lote e divisão: OK');
const pesoSource = fs.readFileSync('src/js/12-motor-linhas.js', 'utf8');
const lerValor = pesoSource.slice(pesoSource.indexOf('function lerValor('), pesoSource.indexOf('/* avalia uma fórmula segura'));
const pesoCtx = {NUM: new Set(['N','P']), DUAS: new Set(['P']), num: ctx.num, r2c: n => Math.round(n*100)/100};
vm.createContext(pesoCtx);
vm.runInContext(lerValor, pesoCtx);
assert.equal(pesoCtx.lerValor('0,333','N').v, 0.333, 'peso conserva milésimos até a planilha');
assert.equal(pesoCtx.lerValor('0,333','P').v, 0.33, 'dinheiro permanece em centavos');
const lote2 = {lote:true, lid:'l2', loteG:1, precoG:1, total:1};
const filho2 = {loteDe:'l2', precoG:1, peso:'1,000', custo:'1,00', cod:'2-1', desc:'teste', qtd:1, q:{}};
ctx.ROM.rows = [lote2, filho2];
ctx.romPartir(filho2, 3);
const partes2=ctx.ROM.rows.slice(1);
assert.deepEqual(partes2.map(x => x.peso), ['0,334','0,333','0,333']);
assert.equal(Math.round(partes2.reduce((s,x) => s + ctx.num(x.custo), 0)*100), 100, 'divisão preserva centavos do custo');
assert.equal(ctx.romLoteResumo(lote2).cls, 'ok');
console.log('Precisão de peso e divisão em centavos: OK');
const cjSource=fs.readFileSync('src/js/19c-colar-romaneio.js','utf8');
const validar=cjSource.slice(cjSource.indexOf('function romConjVerificar()'));
const conjSource=fs.readFileSync('src/js/18-conjunto.js','utf8');
const conjErro=conjSource.slice(conjSource.indexOf('function conjQtd('),conjSource.indexOf('function conjResumoHTML'));
let avisos=0,confirmacoes=0;
const cctx={ROM:{rows:[]},num:ctx.num,vazio:x=>x==null||String(x).trim()==='',semAc:x=>String(x||'').toLowerCase(),brl:ctx.brl,romBh:()=>({banhos:[{id:'ouro'}]}),toast:()=>avisos++,alert:()=>avisos++,confirm:()=>{confirmacoes++;return false}};
vm.createContext(cctx);vm.runInContext(conjErro+'\n'+validar,cctx);
cctx.ROM.rows=[{desc:'Conjunto',conjOriginal:{custo:'10'},conjComp:[{desc:'Colar',peso:'1',custo:'5'},{desc:'',peso:'',custo:''}]}];
assert.equal(cctx.romConjVerificar(),false,'aviso de componente vazio pode ser cancelado');
confirmacoes=0;
cctx.ROM.rows[0].conjComp[1]={desc:'Brinco',peso:'1',custo:'4'};
assert.equal(cctx.romConjVerificar(),false,'custo divergente precisa de confirmação');assert.equal(confirmacoes,1);
cctx.ROM.rows[0].conjComp[1].custo='5';assert.equal(cctx.romConjVerificar(),true);
console.log('Conjunto de romaneio: validação e divergência de custo OK');

// Nunca duplicar silenciosamente o peso dos componentes ao dividir um conjunto.
const conjunto={desc:'Conjunto',peso:'2',custo:'10',qtd:1,q:{p:'1'},conjComp:[{desc:'Colar',peso:'2',custo:'10'}]};
ctx.ROM.rows=[conjunto];ctx.romPartir(conjunto,2);
assert.equal(ctx.ROM.rows.length,1,'conjunto permanece intacto ao tentar divisão');
assert.equal(conjunto.conjComp[0].peso,'2');
// Repartição em milésimos e centavos conserva os totais em diferentes quantidades de partes.
for(const n of [2,3,7,12]) {
 const item={desc:'Peça',peso:'12,347',custo:'9,97',qtd:5,q:{p:'5'}};ctx.ROM.rows=[item];ctx.romPartir(item,n);
 assert.equal(ctx.ROM.rows.length,n);
 assert.equal(Math.round(ctx.ROM.rows.reduce((t,x)=>t+ctx.num(x.peso),0)*1000),12347);
 assert.equal(Math.round(ctx.ROM.rows.reduce((t,x)=>t+ctx.num(x.custo),0)*100),997);
 assert.ok(ctx.ROM.rows.every(x=>x.qtd===5&&x.q.p==='5'));
}
cctx.ROM.rows=[{desc:'Conjunto',conjComp:[{desc:'Colar',peso:'1',custo:'1',banho:'antigo'}]}];
assert.equal(cctx.romConjVerificar(),false,'usuário pode cancelar aviso de banho ausente');
assert.equal(cctx.ROM.rows[0].conjComp[0].banho,'antigo','cancelar não altera banho');
cctx.ROM.rows[0].conjComp[0].banho='ouro';assert.equal(cctx.romConjVerificar(),true);
console.log('Divisão de conjuntos protegida e banhos validados: OK');
