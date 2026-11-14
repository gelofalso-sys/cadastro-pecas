const assert = require('node:assert/strict');
const {detalheBanhoLinha}=require('../src/core/dominio.js');
let r={v:{I:'Brincos',N:'2',W:'3',R:''},banho:{coluna:'R',modo:'peso',mult:5}};
assert.match(detalheBanhoLinha(r,10),/2 g × R\$ 5\/g = R\$ 10,00 por peça/);
assert.match(detalheBanhoLinha(r,10),/3 peças × R\$ 10,00 = R\$ 30,00/);
r.banho.modo='fixo';assert.match(detalheBanhoLinha(r,5),/valor fixo R\$ 5 por peça = R\$ 5,00/);
r.v.R='7';assert.match(detalheBanhoLinha(r,7),/valor de banho informado: R\$ 7,00/);assert.doesNotMatch(detalheBanhoLinha(r,7),/2 g ×/);
console.log('OK explicação por peso, fixo e valor informado');
