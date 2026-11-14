const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=require('./_fonte').tudo();
const C={colcfg:{Q:{padrao:'0.5'}},categorias:[{nome:'Brincos'},{nome:'Colares'}],insumosItens:[{nome:'Caixa',cat:'',qtd:'2',valor:'0.1'},{nome:'Tarraxa',cat:'Brincos',qtd:'3',valor:'0.2'}]};
const x=vm.createContext({S:{config:C,lanc:[]}});vm.runInContext(code,x);const r=(s)=>vm.runInContext(s,x);
assert.equal(r('padraoDe("Brincos","Q")'),'0.5');C.insumosModo='somar';assert.equal(r('padraoDe("Brincos","Q")'),'1.3');assert.equal(r('padraoDe("Colares","Q")'),'0.7');C.categorias[0].insumos='2';assert.equal(r('padraoDe("Brincos","Q")'),'2.8');assert.equal(r('val({v:{I:"Brincos",Q:"9"}},"Q")'),'9');C.insumosModo='substituir';assert.equal(r('padraoDe("Brincos","Q")'),'0.8');assert.equal(r('padraoDe("Colares","Q")'),'0.2');console.log('OK insumos: regras explícitas, escopo e valor digitado');
