/* desfazer/refazer em vários níveis (até 30): restaura peças e cadastros guardados em histNota() */
function desfazer(refazer){try{return desfazer0(refazer)}finally{undoBtns()}}
function desfazer0(refazer){
  const pilha=refazer===true?REDO:HIST,outra=refazer===true?HIST:REDO;
  if(!pilha.length){toast(refazer===true?"Nada para refazer.":"Nada para desfazer.");return}
  const e=pilha.pop();
  if(e.R&&(estadoArmazenamento.romConflito||estadoArmazenamento.conflito)){pilha.push(e);toast("Resolva o conflito de dados antes de desfazer o romaneio.");return}
  if(e.R&&!romHistPode(e.R.depois)){pilha.push(e);return}
  const troca={L:estadoArmazenamento.snapL,C:estadoArmazenamento.snapC,F:e.F?JSON.stringify(S.form):null,E:!!estadoBase.editId,soCfg:e.soCfg,t:Date.now()};
  if(e.R){troca.R=e.R.depois;troca.R.depois={id:e.R.id,estado:e.R.estado,rec:e.R.rec}}
  outra.push(troca);
  estadoArmazenamento.restaurando=true;const eidAntes=estadoBase.editId||null;
  const idsAntes=S.lanc.map(l=>l.id);
  try{
    S.lanc=JSON.parse(e.L).map(lerLanc);
    {const agora=new Set(S.lanc.map(l=>l.id));idsAntes.forEach(i=>{if(!agora.has(i))candFoto.add(i)})}S.config=JSON.parse(e.C);
    if(e.F&&!estadoBase.editId&&!e.E){S.form=lerForm(JSON.parse(e.F))}
    if(estadoBase.editId&&!S.lanc.some(l=>l.id===estadoBase.editId)){estadoBase.editId=null;if(estadoBase.rascunho)S.form=estadoBase.rascunho;estadoBase.rascunho=null}
    [...sel].forEach(i=>{if(!S.lanc.some(l=>l.id===i))sel.delete(i)});estadoPlanilha.selR=null;
    if(e.R)romHistAplicar(e.R);
    histIni();
  }finally{estadoArmazenamento.restaurando=false}
  salvar(true);render();
  if(eidAntes&&estadoBase.editId===eidAntes&&S.lanc.some(l=>l.id===eidAntes)){const rs=estadoBase.rascunho;estadoBase.editId=null;if(rs){S.form=rs;estadoBase.rascunho=null}editar(eidAntes)}
  toast(refazer===true?"Refeito.":"Desfeito.",refazer===true?null:(REDO.length?{t:"Refazer",fn:()=>desfazer(true)}:null));return true;
}
