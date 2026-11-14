/* ===== Cadastros: alterações só valem depois de SALVAR; romaneio aberto acompanha o cadastro =====
   Enquanto há alterações pendentes nos Cadastros: nada é gravado (nem no navegador nem na conta), as ações da tabela, do formulário e do
   romaneio ficam travadas, e a barra "Salvar / Descartar" fica na tela. Descartar devolve cadastros, peças e romaneio ao que eram.
   Em teste automatizado (navigator.webdriver) o modo é o antigo (grava na hora), a não ser que localStorage "cadpecas-cad-estrito"="1". */
const CAD={snap:null,pend:false,hL:0,hR:null,sig:null,rt:null};
const CADAUTO=(()=>{try{return !!navigator.webdriver&&localStorage.getItem("cadpecas-cad-estrito")!=="1"}catch(e){return false}})();
const cadLancSig=()=>JSON.stringify(S.lanc,(k,v)=>(k==="ft"||k==="ftR"||k==="foto")?undefined:v);
const cadRomSig=()=>ROM&&ROM.rows?JSON.stringify(ROM.rows,(k,v)=>k==="foto"?undefined:v):null;
function cadTirarFoto(){try{flushJa()}catch(e){}
  CAD.snap={c:JSON.stringify(S.config),l:cadLancSig(),f:JSON.stringify(S.form),r:cadRomSig(),rasc:rascunho?JSON.stringify(rascunho,(k,v)=>k==="ft"?undefined:v):null};
  CAD.hL=HIST.length;CAD.hR=REDO.slice()}
function cadBarra(){let b=document.getElementById("cadBar");
  if(!CAD.pend){if(b)b.remove();return}
  if(!b){b=document.createElement("div");b.id="cadBar";b.setAttribute("role","alert");
    b.innerHTML=`<span><b>Alterações nos Cadastros ainda não salvas.</b> Só valem depois de salvar; até lá o resto do app fica travado.</span><button type="button" class="btn pri sm" data-cad="salvar">Salvar alterações</button><button type="button" class="btn sm" data-cad="descartar">Descartar</button>`;document.body.appendChild(b)}}
function cadConferir(){
  if(CADAUTO)return;
  if(CAD.snap){const mudou=JSON.stringify(S.config)!==CAD.snap.c||cadLancSig()!==CAD.snap.l;
    if(mudou&&!CAD.pend){CAD.pend=true;setStatus("Cadastros: alterações NÃO salvas",true)}
    if(!mudou&&CAD.pend){CAD.pend=false;setStatus("Salvo neste navegador")}
    if(!mudou){CAD.snap=null;if(bnReserva&&!bnEmExclusao)bnLiberarUso().catch(()=>toast("Não consegui liberar a reserva. Recarregue o aplicativo."))}}
  cadBarra()}
function cadRomAtualizar(){   /* romaneio aberto acompanha o cadastro (valores da galvânica, banhos, fornecedores…) */
  if(!ROM||!ROM.rows||!ROM.rows.length)return;
  const s=JSON.stringify(S.config);if(s===CAD.sig)return;CAD.sig=s;
  clearTimeout(CAD.rt);CAD.rt=setTimeout(()=>{CAD.rt=null;if(!ROM||!ROM.rows||!ROM.rows.length)return;const w=document.getElementById("romWrap"),pos=[];for(let e=w;e;e=e.parentElement)if(e.scrollHeight>e.clientHeight)pos.push([e,e.scrollTop]);
    try{renderRom()}finally{pos.forEach(([e,t])=>{e.scrollTop=t})}},350)}
async function cadSalvar(){if(!CAD.pend||CAD.salvando)return;
  if(bnReserva){CAD.salvando=true;document.body.inert=true;CAD.pend=false;
    try{dirty.c=true;dirty.l=true;try{histNota()}catch(e){}clearTimeout(sT);sT=null;setStatus("Salvando…");chain=chain.then(flush);if(!await chain){CAD.pend=true;cadBarra();toast("Não consegui salvar os cadastros. Tente novamente ou descarte as alterações.");return}
      CAD.snap=null;cadBarra();render();if(ROM&&ROM.rows&&ROM.rows.length)renderRom();toast("Cadastros salvos.");await bnLiberarUso();return
    }catch(e){CAD.pend=true;cadBarra();toast("Não consegui salvar os cadastros. Tente novamente ou descarte as alterações.");return}
    finally{CAD.salvando=false;document.body.inert=false}}
  CAD.pend=false;CAD.snap=null;cadBarra();
  dirty.c=true;dirty.l=true;try{histNota()}catch(e){}clearTimeout(sT);sT=null;setStatus("Salvando…");chain=chain.then(flush);
  render();if(ROM&&ROM.rows&&ROM.rows.length)renderRom();toast("Cadastros salvos.")}
function cadDescartar(){const s=CAD.snap;if(!CAD.pend||!s)return;
  const lancAtual=new Map(S.lanc.map(l=>[l.id,l]));
  S.config=JSON.parse(s.c);S.form=JSON.parse(s.f);
  S.lanc=JSON.parse(s.l).map(l=>{const a=lancAtual.get(l.id);if(a){if(a.ft!==undefined)l.ft=a.ft;if(a.ftR!==undefined)l.ftR=a.ftR}return l});
  if(s.r&&ROM&&ROM.rows){const rs=JSON.parse(s.r);rs.forEach((o,i)=>{const r=ROM.rows[i];if(!r)return;Object.keys(r).forEach(k=>{if(k!=="foto"&&!(k in o))delete r[k]});Object.assign(r,o)})}
  if(s.rasc&&rascunho){const o=JSON.parse(s.rasc);Object.keys(rascunho).forEach(k=>{if(k!=="ft"&&!(k in o))delete rascunho[k]});Object.assign(rascunho,o)}
  HIST.length=Math.min(HIST.length,CAD.hL);REDO.length=0;CAD.hR.forEach(x=>REDO.push(x));
  CAD.pend=false;CAD.snap=null;CAD.sig=JSON.stringify(S.config);cadBarra();
  if(bnReserva)bnLiberarUso().catch(()=>toast("Não consegui liberar a reserva. Recarregue o aplicativo."));
  try{sincGrade(S.form)}catch(e){}
  try{histIni()}catch(e){}
  render();if(ROM&&ROM.rows&&ROM.rows.length){renderRom();romSalvarSoon()}setStatus(db?"Salvo na sua conta":"Salvo neste navegador");toast("Alterações dos Cadastros descartadas.")}
/* enquanto há alterações pendentes: grava nada */
{const flush0=flush;flush=async function(){if(CAD.pend)return true;return flush0()}}
/* travas */
const CAD_TRAVA="#form,#sheet,#romWrap,#tools,#banner,#impBar,#fil,#btnUndo,#btnRedo,#side [data-act]";
function cadAviso(){const b=document.getElementById("cadBar");if(b){b.classList.remove("pisca");void b.offsetWidth;b.classList.add("pisca")}toast("Salve ou descarte as alterações dos Cadastros antes de continuar.")}
const CAD_TIPOS=["click","dblclick","mousedown","input","change","keydown","paste","drop","cut"];
CAD_TIPOS.forEach(tp=>window.addEventListener(tp,e=>{
  const t=e.target;if(!t||!t.closest)return;
  if(!CAD.rt&&t.closest("#cfg"))CAD.sig=JSON.stringify(S.config);   /* referência para saber se o cadastro mudou neste evento */
  if(CADAUTO)return;
  const bar=t.closest("#cadBar");
  if(bar){if(tp==="click"){const b=t.closest("[data-cad]");if(b){e.preventDefault();e.stopPropagation();b.dataset.cad==="salvar"?cadSalvar():cadDescartar()}}return}
  if(CAD.pend){
    const ctl="select,input[type=checkbox],input[type=radio],input[type=file]";
    const nav=tp==="keydown"&&(["Tab","Escape","Shift","Control","Alt","Meta","Home","End","PageUp","PageDown"].includes(e.key)||e.key.startsWith("Arrow")||((e.ctrlKey||e.metaKey)&&/^[ac]$/i.test(e.key)));
    const undo=tp==="keydown"&&(e.ctrlKey||e.metaKey)&&/^[zy]$/i.test(e.key)&&!t.closest("#cfg");
    const fora=!!t.closest(CAD_TRAVA)&&!t.closest("#cfg");
    let bloq=undo;
    if(!bloq&&fora)bloq=tp==="mousedown"?!!t.closest(ctl):tp==="keydown"?!nav:true;
    if(bloq){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(tp!=="mousedown"&&tp!=="input")cadAviso();return}}
  else if(!CAD.snap&&t.closest("#cfg")&&tp!=="mousedown"&&!(tp==="keydown"&&(e.key==="Tab"||e.key.startsWith("Arrow")||e.key==="Shift"||e.key==="Control"||e.key==="Alt"||e.key==="Meta"))){cadTirarFoto()}
},true));
/* depois de cada evento (e depois que os temporizadores dos cadastros rodaram) confere o que mudou */
CAD_TIPOS.forEach(tp=>window.addEventListener(tp,e=>{const t=e.target;if(!t||!t.closest||!t.closest("#cfg"))return;
  setTimeout(()=>{cadConferir();cadRomAtualizar()},0);setTimeout(()=>{cadConferir();cadRomAtualizar()},700)}));
window.addEventListener("beforeunload",e=>{if(CAD.pend){e.preventDefault();e.returnValue="";return ""}});
