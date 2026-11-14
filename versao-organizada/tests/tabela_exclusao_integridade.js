const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('src/fatias/tabelas/19d-tabelas-indice-e-fotos.js','utf8'),body='const tabExcluindo=new Set();'+s.slice(s.indexOf('async function tabExcluirSalvo'));
(async()=>{let prep=null,reverted=0,writes=0,removed=0,refresh=0,msg=[];const x=vm.createContext({Promise,Set,TABS:[{id:'t',ids:['p']}],TABDEL:new Set(),candFoto:new Set(),exComLock:fn=>fn(),exPreparar:async()=>prep,exReverter:async()=>{reverted++;return true},idbDel:async()=>1,gravarIdx:()=>{writes++;return false},arqRef:()=>{},histSugAgendar:()=>refresh++,varrerFotos:()=>removed++,toast:t=>msg.push(t)});vm.runInContext(body,x);
 assert.equal(await x.tabExcluirSalvo('t'),false);assert.equal(x.TABS.length,1);assert.equal(writes,0);assert.equal(removed,0);
 prep={key:'j'};assert.equal(await x.tabExcluirSalvo('t'),false);assert.equal(reverted,1);assert.equal(x.TABS.length,1);assert.equal(x.TABDEL.has('t'),false);assert.equal(removed,0);
 x.gravarIdx=()=>true;assert.equal(await x.tabExcluirSalvo('t'),true);assert.equal(x.TABS.length,0);assert.equal(x.TABDEL.has('t'),true);assert.equal(x.candFoto.has('p'),true);assert.equal(removed,1);assert.equal(refresh,1);
 console.log('OK exclusão de tabela exige diário e reverte falha de índice');
})().catch(e=>{console.error(e);process.exitCode=1});
