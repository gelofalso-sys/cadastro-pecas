const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('src/js/12-motor-linhas.js','utf8');const code=s.slice(s.indexOf('const pesoLinha='),s.indexOf('const modeloAtual='));
const ctx={numRaw:(x)=>x==null||x===''?null:Number(String(x).replace(',','.')),r2c:x=>Math.round(+(x*100).toPrecision(12))/100};vm.createContext(ctx);vm.runInContext(code,ctx);
for(const [category,w,rate,want] of [['Brincos','1,334',1,1.33],['Colares','1,333',3,4]]){
 const row={v:{N:w,W:'2',I:category},banho:{coluna:'R',modo:'peso',mult:rate},verniz:0.42};let calc=ctx.calcBanho(row,'R',4);assert.equal(calc.v,want);assert.equal(calc.f,`ROUND(N4*${rate},2)`);assert.equal(ctx.calcBanho(row,'U',4).v,0.56);
 row.banho.modo='fixo';calc=ctx.calcBanho(row,'R',4);assert.equal(calc.v,rate);assert.equal(calc.f,undefined);
}
console.log('OK divisões: taxa por categoria, valor unitário, fórmula de banho e valor fixo');
