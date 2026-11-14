const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('src/js/30-eventos-mouse-e-clique.js','utf8');const parte=s.slice(s.indexOf('case "hist-voltar":'),s.indexOf('case "origem-ok":'));
assert.ok(parte.includes('desfazer()'));
function executar(respostas,n){let chamadas=0,msg='';const HIST=[1,2,3],t={dataset:{n:String(n)}},document={querySelectorAll:()=>[]},desfazer=()=>{const v=respostas[chamadas++];if(v)HIST.pop();return v},toast=x=>{msg=x};vm.runInNewContext(`switch('hist-voltar'){${parte}}`,{HIST,t,document,desfazer,toast});return {chamadas,msg};}
let r=executar([true,false,true],3);assert.equal(r.chamadas,2);assert.match(r.msg,/Voltou 1 de 3/);r=executar([false],2);assert.equal(r.chamadas,1);assert.match(r.msg,/Voltou 0 de 2/);r=executar([true,true],2);assert.match(r.msg,/Voltou 2 alteração/);console.log('OK histórico interrompe ao recusar desfazer e informa progresso real');
