/* ===== v20: filtros recolhidos, avisos em uma linha, botão de recolher formulário ===== */
document.getElementById("filTog").addEventListener("click",()=>{const f=document.getElementById("fil");const on=f.classList.toggle("fopen");document.getElementById("filTog").setAttribute("aria-expanded",String(on))});
document.getElementById("tools").addEventListener("click",e=>{if(e.target.closest(".issues")&&!e.target.closest("a,button"))document.getElementById("tools").classList.toggle("aberto")});
function pilulaAtualiza(){const b=document.getElementById("dpill");if(!b)return;const v=document.body.dataset.vis||"tudo";
  const alvo=v==="planilha"?["tudo","▴ Expandir o formulário"]:v==="cad"?["tudo","Tabela e formulário"]:["planilha","▾ Recolher o formulário"];
  b.dataset.alvo=alvo[0];b.textContent=alvo[1];b.hidden=celular();pilulaPos()}
/* com o formulário aberto o botão fica ENCOSTADO na divisória entre a tabela e o formulário (não flutua sobre os campos); sem o formulário ele volta para o canto */
function pilulaPos(){const b=document.getElementById("dpill"),sp=document.getElementById("splitter");if(!b)return;const v=document.body.dataset.vis||"tudo",r=sp&&sp.getBoundingClientRect();
  if(!b.hidden&&v==="tudo"&&r&&r.height>0){b.classList.add("dock");b.style.top=Math.round(r.top+r.height/2-b.offsetHeight/2)+"px";b.style.bottom="auto"}else{b.classList.remove("dock");b.style.top="";b.style.bottom=""}}
window.addEventListener("resize",pilulaAtualiza);
try{new ResizeObserver(pilulaPos).observe(document.getElementById("paneTop"))}catch(e){}
document.getElementById("dpill").addEventListener("click",e=>{const a=e.currentTarget.dataset.alvo;visPara(a);if(a==="tudo")refocar("#f-F")});

/* ===== importação de romaneios: vários arquivos, ordem na fila e aviso de arquivo repetido ===== */
let IMPQ=[];const IMPH=new WeakMap();
async function impHash(f){try{const b=await f.arrayBuffer();if(window.crypto&&crypto.subtle){const h=await crypto.subtle.digest("SHA-256",b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("")}}catch(e){}return "n:"+f.size+":"+f.lastModified+":"+f.name}
const impAcha=h=>h?ROMS.find(x=>x.hash===h):null;
const impData=x=>new Date(x.em).toLocaleString("pt-BR");
/* confere se este arquivo já foi importado; devolve false se o usuário preferiu abrir o romaneio guardado */
async function impPrepara(f){let h=IMPH.get(f);if(!h){h=await impHash(f);IMPH.set(f,h)}
  const d=impAcha(h);
  if(d&&confirm("Este arquivo é exatamente o mesmo romaneio importado em "+impData(d)+(d.forn?" ("+d.forn+")":"")+": "+d.n+" peças, "+d.feitas+" já lançadas.\n\nOK = abrir o romaneio que já está guardado\nCancelar = importar de novo mesmo assim")){document.querySelectorAll(".rep").forEach(x=>x.remove());romAbrirSalvo(d.id);return false}
  return true}
function romGaranteRom(){if(!ROM){if(!romRetomar()){ROM={tid:abertos.romT&&cfg().romaneios.some(x=>x.id===abertos.romT)?abertos.romT:cfg().romaneios[0].id,texto:"",rows:[],obs:"",conf:"",msg:""};const T0=romT();if(T0&&T0.forn&&fornBy(T0.forn))romSetForn(T0.forn)}}}
async function impAbrirArq(f){
  if(editId){toast("Termine ou cancele a edição antes.");return}
  if(ROM&&ROM.rows&&ROM.rows.length){romSalvar();ROM=null;renderRom()}
  const n=f.name||"";
  if(/[.](xlsx?|csv)$/i.test(n)){romGaranteRom();renderRom();rolarPane(document.getElementById("romWrap"));return romPlanilha(f)}
  if(/[.]txt$/i.test(n)){if(!(await impPrepara(f)))return;romGaranteRom();ROM.doc=n;ROM.hash=IMPH.get(f)||"";ROM.texto=await(async()=>{const b=await f.arrayBuffer();try{return new TextDecoder("utf-8",{fatal:true}).decode(b)}catch(e){return new TextDecoder("windows-1252").decode(b)}})();romLer();renderRom();rolarPane(document.getElementById("romWrap"));return}
  return nfRotear(f)}
async function impAdd(files){const ok=[],ign=[];
  for(const f of files){if(!/[.](pdf|xml|xlsx?|csv|txt)$/i.test(f.name||"")){ign.push(f.name);continue}
    let h=IMPH.get(f);if(!h){h=await impHash(f);IMPH.set(f,h)}
    IMPQ.push({id:uid(),file:f,name:f.name,hash:h,dup:impAcha(h)||null,rep:IMPQ.some(q=>q.hash===h)});ok.push(f.name)}
  if(ign.length)toast("Formato não aceito: "+ign.join(", ")+" (use PDF, XML, xlsx, xls, csv ou txt).");
  else if(ok.length&&IMPQ.some(q=>q.dup))toast("Atenção: há arquivo(s) já importado(s) na fila (marcados).");
  renderImp()}
function renderImp(){const el=document.getElementById("impBar");if(!el)return;
  el.innerHTML=`<div class="imp-r"><button type="button" class="btn pri" data-act="rom-abrir" title="Colar o texto da lista do fornecedor ou continuar o romaneio em andamento">Romaneio</button><button type="button" class="btn" data-act="imp-pick" title="Escolher um ou vários arquivos">Importar arquivos…</button><span class="hint">PDF, XML da nota, planilha (xlsx, xls, csv) ou txt · escolha ou arraste vários arquivos para cá e ajuste a ordem</span></div>${IMPQ.length?`<ol class="imp-q">${IMPQ.map((q,i)=>`<li class="${q.dup||q.rep?"dup":""}"><span class="n">${i+1}</span><b title="${esc(q.name)}">${esc(q.name)}</b><small>${q.dup?"já importado em "+esc(impData(q.dup))+(q.dup.forn?" · "+esc(q.dup.forn):""):q.rep?"repetido nesta fila":"aguardando"}</small><span class="acts"><button type="button" class="x" data-act="imp-up" data-i="${i}" ${i?"":"disabled"} aria-label="Subir na fila">↑</button><button type="button" class="x" data-act="imp-down" data-i="${i}" ${i<IMPQ.length-1?"":"disabled"} aria-label="Descer na fila">↓</button><button type="button" class="btn sm" data-act="imp-abrir" data-i="${i}">Abrir</button><button type="button" class="x" data-act="imp-del" data-i="${i}" aria-label="Tirar da fila">×</button></span></li>`).join("")}</ol><div class="imp-r"><button type="button" class="btn sm pri" data-act="imp-abrir" data-i="0">Abrir o primeiro</button><button type="button" class="btn sm ghost" data-act="imp-limpar">Limpar fila</button><span class="hint">O romaneio aberto é guardado antes de abrir o próximo.</span></div>`:""}`}
{const el=document.getElementById("impBar");if(el){
  el.addEventListener("dragover",e=>{if(e.dataTransfer&&[...(e.dataTransfer.types||[])].includes("Files")){e.preventDefault();e.stopPropagation();el.classList.add("over")}});
  el.addEventListener("dragleave",()=>el.classList.remove("over"));
  el.addEventListener("drop",e=>{e.preventDefault();e.stopPropagation();el.classList.remove("over");const fl=[...((e.dataTransfer&&e.dataTransfer.files)||[])];if(fl.length)impAdd(fl)});
  renderImp()}}
/* ===== v20: cartões de categoria recolhíveis ===== */
const CARDX=new Set();
function cardsModoCompacto(){return abertos.catc==null?celular():!!abertos.catc}
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
    else{/* tudo aberto: o botão recolhe só esta — as demais continuam abertas */abertos.catc=true;guardarAbertos();CARDX.clear();document.querySelectorAll("#cfg .card[data-cat]").forEach(cc=>{if(cc!==c)CARDX.add(cc.dataset.cat)})}
    cardsDecorar();return}
  if(e.target.closest("#cardsTog")){const cmp=cardsModoCompacto();abertos.catc=!cmp;guardarAbertos();CARDX.clear();cardsDecorar();return}
  const pd=e.target.closest(".tabp .sb>p.d");if(pd&&celular())pd.classList.toggle("mais")});

/* ===== v20: rótulos nas células das tabelas de cadastro (para virarem cartões no celular) ===== */
function tabelasRotular(){document.querySelectorAll("#cfg table.cfg:not(.bnt)").forEach(t=>{const hs=[...t.querySelectorAll("thead th")].map(h=>h.textContent.trim());
  if(!hs.length)return;t.querySelectorAll("tbody tr").forEach(tr=>{[...tr.children].forEach((td,i)=>{if(td.tagName==="TD"&&td.dataset.l===undefined)td.dataset.l=hs[i]||""})})})}
{const cf=document.getElementById("cfg");if(cf){new MutationObserver(()=>{try{tabelasRotular()}catch(e){}}).observe(cf,{childList:true,subtree:true});try{tabelasRotular()}catch(e){}}}

