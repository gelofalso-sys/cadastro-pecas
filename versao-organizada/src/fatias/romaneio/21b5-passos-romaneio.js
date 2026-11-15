/* ---------- seleção para ações em massa ---------- */
function romSelRows(){const s=estadoRomaneio.ROM.rows.filter(r=>r.sel&&!r.lote);return s.length?s:estadoRomaneio.ROM.rows.filter(r=>!r.lote)}

/* ---------- passos do romaneio: 1 Importar · 2 Pesos · 3 Revisar · 4 Criar ---------- */
function romPassosEstado(){
  const rs=estadoRomaneio.ROM.rows.filter(r=>!r.lote),at=estadoRomaneio.ROM.rows.filter(r=>!r.skip&&!r.lote);
  const sp=at.filter(r=>num(r.peso)==null).length,dv=at.filter(r=>romSomaDe(r,romColsR(r))!==r.qtd).length,dp=0,
    tam=at.filter(r=>{const g=gradeDaCat(r.cat,r.sub);return g&&!r.semG&&!(r.gsel||[]).length&&!Array.isArray(r.conjComp)}).length,
    lotes=estadoRomaneio.ROM.rows.filter(r=>r.lote&&romLoteResumo(r).cls!=="ok").length,pend=sp+dv+tam+lotes;
  return {n:rs.length,pend,sp,dv,tam,lotes,conf:estadoRomaneio.ROM.conf||"",pronto:rs.length>0&&pend===0}}
function romPassosHTML(){
  if(!estadoRomaneio.ROM||!estadoRomaneio.ROM.rows.length)return "";
  const e=romPassosEstado(),ok=/✓/.test(e.conf)&&!/⚠/.test(e.conf);
  const p=(n,txt,estado,tit)=>`<li class="${estado}"><button type="button" data-act="rom-passo" data-p="${n}" title="${esc(tit)}"><b>${estado==="ok"?"✓":n}</b> ${txt}</button></li>`;
  return `<ol class="rom-passos" id="romPassos" aria-label="Passos do romaneio">${p(1,`Importar <small>${e.n} peça(s)</small>`,"ok","Voltar ao topo para importar de novo")}${p(2,`Pesos e divisão <small>${e.pend?e.pend+" pendente(s)":"tudo certo"}</small>`,e.pend?"pend":"ok","Ir para a próxima pendência")}${p(3,`Conferir <small>${ok?"lista confere":e.conf?"há diferença":"ainda não conferida"}</small>`,ok?"ok":"pend","Ver a conferência com a lista do fornecedor")}${p(4,"Criar peças",e.pronto?"":"off","Ir para o botão Criar")}</ol>`}
function romPassosAtual(){const el=document.getElementById("romPassos");if(!el||!estadoRomaneio.ROM)return;const t=document.createElement("div");t.innerHTML=romPassosHTML();const n=t.firstElementChild;if(n)el.replaceWith(n)}
function romPassoIr(p){
  if(p===1){const b=document.getElementById("impBar");if(b)b.scrollIntoView({block:"start",behavior:"smooth"});return}
  if(p===2){const lote=estadoRomaneio.ROM.rows.findIndex(r=>r.lote&&romLoteResumo(r).cls!=="ok");if(lote>=0){const el=document.querySelector(`#romWrap .rc[data-i="${lote}"]`);if(el){el.scrollIntoView({block:"center",behavior:"smooth"});const b=el.querySelector('[data-act="lote-add"]');if(b)b.focus({preventScroll:true});return}}const bt=document.querySelector('#romWrap [data-act="rom-pend"]');if(bt)bt.click();return}
  if(p===3){const c=document.getElementById("romChk");if(c)c.scrollIntoView({block:"center",behavior:"smooth"});return}
  const b=document.getElementById("romCriar");if(b){b.scrollIntoView({block:"center",behavior:"smooth"});b.focus({preventScroll:true})}}
