/* ===== v20: cartões de categoria recolhíveis ===== */
const CARDX=new Set();
function cardsModoCompacto(){return estadoBase.abertos.catc==null?true:!!estadoBase.abertos.catc}
function cardsDecorar(){
  const cs=document.querySelector("#cfg .cards");if(!cs||!cs.querySelector(".card[data-cat]"))return;
  const cmp=cardsModoCompacto();cs.classList.toggle("cmp",cmp);
  cs.querySelectorAll(".card[data-cat]").forEach(c=>{
    c.classList.toggle("exp",CARDX.has(c.dataset.cat));
    const r=c.firstElementChild;if(!r||r.querySelector(".cx"))return;
    const b=document.createElement("button");b.type="button";b.className="cx";b.title="Expandir ou recolher os detalhes desta categoria";b.setAttribute("aria-label","Expandir ou recolher a categoria");b.textContent="▾ Expandir";r.appendChild(b)});
  cs.querySelectorAll(".cx").forEach(b=>{const t=b.closest(".card").classList.contains("exp")||!cmp?"▴ Recolher":"▾ Expandir";if(b.textContent!==t)b.textContent=t});
  if(!document.getElementById("cardsBar")){const bar=document.createElement("div");bar.id="cardsBar";bar.className="cardsbar";
    bar.innerHTML='<button type="button" class="btn sm" id="cardsTog"></button><span class="hint">Cada categoria tem prefixo, impostos, subcategorias e tamanhos — abra só a que for editar.</span>';cs.before(bar)}
  const t=document.getElementById("cardsTog"),tx=cmp?"▾ Expandir todas":"▴ Recolher todas";if(t&&t.textContent!==tx)t.textContent=tx}
{const cf=document.getElementById("cfg");if(cf)new MutationObserver(()=>{try{cardsDecorar()}catch(e){}}).observe(cf,{childList:true,subtree:true});try{cardsDecorar()}catch(e){}}
document.getElementById("cfg").addEventListener("click",e=>{
  const x=e.target.closest(".card .cx");
  if(x){const c=x.closest(".card"),k=c.dataset.cat;
    if(cardsModoCompacto()){if(CARDX.has(k))CARDX.delete(k);else CARDX.add(k)}
    else{/* tudo aberto: o botão recolhe só esta — as demais continuam abertas */estadoBase.abertos.catc=true;guardarAbertos();CARDX.clear();document.querySelectorAll("#cfg .card[data-cat]").forEach(cc=>{if(cc!==c)CARDX.add(cc.dataset.cat)})}
    cardsDecorar();return}
  if(e.target.closest("#cardsTog")){const cmp=cardsModoCompacto();estadoBase.abertos.catc=!cmp;guardarAbertos();CARDX.clear();cardsDecorar();return}
  const pd=e.target.closest(".tabp .sb>p.d");if(pd&&celular())pd.classList.toggle("mais")});

/* ===== v20: rótulos nas células das tabelas de cadastro (para virarem cartões no celular) ===== */
function tabelasRotular(){document.querySelectorAll("#cfg table.cfg:not(.bnt)").forEach(t=>{const hs=[...t.querySelectorAll("thead th")].map(h=>h.textContent.trim());
  if(!hs.length)return;t.querySelectorAll("tbody tr").forEach(tr=>{[...tr.children].forEach((td,i)=>{if(td.tagName==="TD"&&td.dataset.l===undefined)td.dataset.l=hs[i]||""})})})}
{const cf=document.getElementById("cfg");if(cf){new MutationObserver(()=>{try{tabelasRotular()}catch(e){}}).observe(cf,{childList:true,subtree:true});try{tabelasRotular()}catch(e){}}}

