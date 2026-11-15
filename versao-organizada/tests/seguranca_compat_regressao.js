// Compatibilidade de unidade e consentimento para envio externo.
const assert=require('node:assert/strict'), fs=require('node:fs'),vm=require('node:vm');
const dc=__dirname+'/../src/core/';const s=fs.readdirSync(dc).filter(n=>n.endsWith('.js')).map(n=>fs.readFileSync(dc+n,'utf8')).join(String.fromCharCode(10));
const {padraoRegex}=require('../src/core/romaneio.js');
let p=padraoRegex('{desc} {qv} {u} {pu}');
let m=p.re.exec('Corrente 81,440 GR 14,7000');assert.equal(m[2],'81,440');assert.equal(m[3],'GR');assert.equal(m[4],'14,7000');
p=padraoRegex('{desc} {qv} {u} {pu}');m=p.re.exec('Corrente 3 14,70');assert.equal(m[2],'3');assert.equal(m[3],undefined);assert.equal(m[4],'14,70');
assert(!s.includes('(?<='));
const fotos=fs.readFileSync('src/fatias/fotos/23-fotos-imgbb.js','utf8');
const pref=fotos.slice(fotos.indexOf('const fotoAuto='),fotos.indexOf('const autoEnviar='));
let store={};const c={localStorage:{getItem:k=>store[k]??null}};vm.createContext(c);vm.runInContext(fs.readFileSync('src/store/local.js','utf8'),c);vm.runInContext(pref+';globalThis.check=fotoAuto',c);   /* src/store (lerPref) sobre o localStorage falso */
assert.equal(c.check(),false);store['cadpecas-imgbb-auto']='1';assert.equal(c.check(),false);store['cadpecas-imgbb-consent-v1']='1';assert.equal(c.check(),true);store['cadpecas-imgbb-consent-v1']='0';assert.equal(c.check(),false);
console.log('OK unidade sem lookbehind e envio automático apenas após consentimento');
