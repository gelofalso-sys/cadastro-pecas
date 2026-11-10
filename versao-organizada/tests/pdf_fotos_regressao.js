const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const src = fs.readFileSync('src/js/22-importar-pdf-romaneio.js','utf8');
const fn = src.slice(src.indexOf('function romFotos('),src.indexOf('async function romPdf('));
const ctx={ROM:{pdf:{itens:[
 {pg:1,y:700,s:'Endereço: Rua X, 61'},
 {pg:1,y:400,s:'61'}, {pg:1,y:400,s:'CORRENTARIA'}, {pg:1,y:400,s:'14,700'},
 {pg:2,y:300,s:'[#103708]'}, {pg:2,y:300,s:'R$ 5,33'}
],fotos:[{pg:1,cy:700,h:80,url:'logo',mini:'logo'}, {pg:2,cy:300,h:60,url:'peca',mini:'mini'}]}}};
vm.createContext(ctx); vm.runInContext(fn,ctx);
const rows=[{cod:'61'},{cod:'103708'}]; ctx.romFotos(rows);
assert.equal(rows[0].foto,undefined,'logo do cabeçalho não é foto de peça');
assert.equal(rows[1].foto,'peca','foto de produto continua associada');
console.log('Vínculo de fotos do PDF: OK');
