const assert=require('node:assert/strict');
const {calcBanho}=require('../src/core/formulas.js');
for(const [category,w,rate,want] of [['Brincos','1,334',1,1.33],['Colares','1,333',3,4]]){
 const row={v:{N:w,W:'2',I:category},banho:{coluna:'R',modo:'peso',mult:rate},verniz:0.42};let calc=calcBanho(row,'R',4);assert.equal(calc.v,want);assert.equal(calc.f,`ROUND(N4*${rate},2)`);assert.equal(calcBanho(row,'U',4).v,0.56);
 row.banho.modo='fixo';calc=calcBanho(row,'R',4);assert.equal(calc.v,rate);assert.equal(calc.f,undefined);
}
console.log('OK divisões: taxa por categoria, valor unitário, fórmula de banho e valor fixo');
