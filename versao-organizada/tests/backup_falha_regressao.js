const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source=fs.readFileSync('src/js/20-armazenamento-idb.js','utf8');
const code=source.slice(source.indexOf('async function aplicarBackupTotal('),source.indexOf('\nconst ROMKEY=',source.indexOf('async function aplicarBackupTotal(')));
let calls=0, message='', status='';
const ctx={clone:x=>structuredClone(x),ROMS:[],TABS:[],ROMDEL:new Set(),TABDEL:new Set(),bkPrepararJournal:async()=>({}),bkReverterJournal:async()=>false,document:{getElementById:()=>null,createElement:()=>({setAttribute:()=>{},style:{}}),body:{appendChild:()=>{}}},S:{config:{},lanc:[],form:{}},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},
 idbGet:async()=>({anterior:true}),idbPut:async()=>{calls++;return calls===1?'ok':null},idbDel:async()=>null,
 toast:s=>message=s,setStatus:s=>status=s};
vm.createContext(ctx);vm.runInContext(code,ctx);
(async()=>{await ctx.aplicarBackupTotalComLock({roms:{a:{},b:{}},fotos:{},tabs:{}});assert.match(message,/não consegui reverter todos/i);assert.match(status,/restauração incompleta/i);assert.doesNotMatch(message,/Nada foi alterado/i);console.log('OK restauração: falha ao reverter é comunicada sem alegar ausência de alterações')})().catch(e=>{console.error(e);process.exitCode=1});
