// Compatibilidade de unidade e consentimento para envio externo.
const assert=require('node:assert/strict'), fs=require('node:fs'),vm=require('node:vm');
const s=fs.readFileSync('src/js/19c-colar-romaneio.js','utf8');
const code=s.slice(s.indexOf('const MON='),s.indexOf('/* padrão com quantificador'));
const ctx={num:x=>Number(String(x).replace(',','.'))};vm.createContext(ctx);vm.runInContext(code,ctx);
let p=ctx.padraoRegex('{desc} {qv} {u} {pu}');
let m=p.re.exec('Corrente 81,440 GR 14,7000');assert.equal(m[2],'81,440');assert.equal(m[3],'GR');assert.equal(m[4],'14,7000');
p=ctx.padraoRegex('{desc} {qv} {u} {pu}');m=p.re.exec('Corrente 3 14,70');assert.equal(m[2],'3');assert.equal(m[3],undefined);assert.equal(m[4],'14,70');
assert(!s.includes('(?<='));
const fotos=fs.readFileSync('src/js/23-fotos-imgbb-e-nota-fiscal.js','utf8');
const pref=fotos.slice(fotos.indexOf('const fotoAuto='),fotos.indexOf('const autoEnviar='));
let store={};const c={localStorage:{getItem:k=>store[k]??null}};vm.createContext(c);vm.runInContext(pref+';globalThis.check=fotoAuto',c);
assert.equal(c.check(),false);store['cadpecas-imgbb-auto']='1';assert.equal(c.check(),false);store['cadpecas-imgbb-consent-v1']='1';assert.equal(c.check(),true);store['cadpecas-imgbb-consent-v1']='0';assert.equal(c.check(),false);
console.log('OK unidade sem lookbehind e envio automático apenas após consentimento');
