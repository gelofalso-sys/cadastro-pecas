const fs=require('fs'),vm=require('vm'),assert=require('assert');
const idb=fs.readFileSync('src/fatias/armazenamento/20-armazenamento-idb.js','utf8'),persist=fs.readFileSync('src/fatias/armazenamento/14-persistencia.js','utf8');
const slice=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
const armazLocal=fs.readFileSync('src/store/local.js','utf8')+fs.readFileSync('src/store/prefs.js','utf8')+fs.readFileSync('src/store/dados.js','utf8');   /* src/store (lerPref/gravarPref): roda em cada contexto sobre o localStorage falso */
(async()=>{
 let made=0,removed=[],writes=[],store={};
 const c=vm.createContext({Blob,Date,JSON,Promise,Map,Set,console,MAX_BACKUP_BYTES:100,BK_DIAS:7,localStorage:{setItem:(k,v)=>store[k]=v},bkMontar:async()=>({o:{x:'a'},falhas:['foto'],hoje:'2026-11-12'})});
 vm.runInContext(armazLocal,c);vm.runInContext(slice(persist,'async function bkEscrever(h)','\nasync function bkAuto'),c);
 const dir={getFileHandle:async()=>{made++;return {createWritable:async()=>({write:async x=>writes.push(x),close:async()=>{}})}},async *entries(){for(let i=1;i<=8;i++)yield [`cadastro-pecas-auto-2026-11-0${i}.json`,{}];yield ['cadastro-pecas-auto-2026-11-01-INCOMPLETO.json',{}]},removeEntry:async n=>removed.push(n)};
 assert.strictEqual(await c.bkEscrever(dir),'incompleto');assert.equal(made,0);assert.deepEqual(removed,[]);assert.equal(store['cadpecas-bk-ult'],undefined);
 c.bkMontar=async()=>({o:{x:'x'.repeat(101)},falhas:[],hoje:'2026-11-12'});assert.strictEqual(await c.bkEscrever(dir),'grande-demais');assert.equal(made,0);
 c.bkMontar=async()=>({o:{x:'ok'},falhas:[],hoje:'2026-11-12'});assert((await c.bkEscrever(dir)).startsWith('cadastro'));assert.equal(made,1);assert.equal(removed.length,1);assert(!removed[0].includes('INCOMPLETO'));assert(store['cadpecas-bk-ult']);
 const x=vm.createContext({Promise,Date,JSON,Map,Set,console,ROM:{sid:'r',por:'x',criado:1,log:[],rows:[{}]},romConflito:false,romHistUltimo:new Map(),estadoArmazenamento:{romGravP:null,AUTOR:'x'},exSalvarComLock:fn=>fn(),clone:x=>JSON.parse(JSON.stringify(x)),romRec:()=>({id:'r'}),bancoGravar:async()=>1,romIndex:()=>false,avisoIdb:()=>x.alerts++,alerts:0});
 vm.runInContext(slice(idb,'function romGravarBig()','\n/* As ações'),x);x.romGravarBig();assert.strictEqual(await x.estadoArmazenamento.romGravP,false);assert.equal(x.alerts,1);
 let deleted=0;const y=vm.createContext({Promise,Set,console,estadoArmazenamento:{romGravP:null},ROMS:[{id:'r'}],ROMDEL:new Set(),exComLock:fn=>fn(),exPreparar:async()=>{deleted++;return null},exReverter:async()=>true,bancoApagar:async()=>1,avisoIdb:()=>{},gravarIdx:()=>{throw Error('índice não pode ser modificado')},romAtualizarListaAberta:()=>{},toast:()=>{}});
 vm.runInContext(slice(idb,'async function romExcluirConfirmado(id)','\n/* mexeu'),y);assert.strictEqual(await y.romExcluirSalvo('r'),false);assert.equal(deleted,1);assert.equal(y.ROMS.length,1);
 let regravou=0; y.exPreparar=async()=>({key:'journal'}); y.gravarIdx=()=>false; y.exReverter=async()=>{regravou++;return true}; assert.strictEqual(await y.romExcluirSalvo('r'),false);assert.equal(regravou,1);assert.equal(y.ROMS.length,1);assert.equal(y.ROMDEL.has('r'),false);
 let resume;const z=vm.createContext({Promise,JSON,Date,console,S:{config:{},lanc:[{id:'antigo'}],form:{}},TABS:[],estadoArmazenamento:{AUTOR:'',romST:null,romGravP:null},ROM:{sid:'teste',rows:[{cod:'antes'}]},localStorage:{getItem:()=>null},romRascunho:()=>null,bkLerBanco:()=>new Promise(r=>resume=r)});
 vm.runInContext(armazLocal,z);vm.runInContext(slice(idb,'function bkEstado()','\nasync function backupTotal()'),z);let op=z.bkMontar();await new Promise(setImmediate);z.ROM.rows[0].cod='depois';resume({roms:{},tabs:{},fotos:{}});let resultado=await op;assert(resultado.falhas.some(x=>x.includes('alterados')));assert.equal(resultado.o.lanc[0].id,'antigo');assert(resultado.o.incompleto);
 let indice='antes';z.localStorage={getItem:k=>k==='cadpecas-tabs'?indice:null};op=z.bkMontar();await new Promise(setImmediate);indice='outra aba';resume({roms:{},tabs:{},fotos:{}});resultado=await op;assert(resultado.falhas.some(x=>x.includes('locais alterados')),'mudança local concorrente marca cópia incompleta');
 z.conflito=true;op=z.bkMontar();await new Promise(setImmediate);resume({roms:{},tabs:{},fotos:{}});resultado=await op;assert(resultado.falhas.some(x=>x.includes('conflito entre abas')),'conflito anterior marca cópia incompleta');
 z.conflito=false;z.navigator={locks:{query:async()=>({held:[{name:'cadpecas-uso',mode:'shared'},{name:'cadpecas-uso',mode:'shared'}]}),request:async(_n,f)=>f()}};op=z.bkMontar();await new Promise(setImmediate);resume({roms:{},tabs:{},fotos:{}});resultado=await op;assert(resultado.falhas.some(x=>x.includes('outra aba aberta')),'outra aba ativa impede tratar cópia como completa');
 console.log('OK backup incompleto e grande preservam cópias; mudanças simultâneas são sinalizadas; falhas de índice e exclusão são detectadas');
})().catch(e=>{console.error(e);process.exitCode=1});



