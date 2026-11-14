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
let IMPST=null;
async function impAbrirArq(f){const nome=(f&&f.name)||"";IMPST={nome,estado:"lendo"};renderImp();
  try{await impAbrirArq0(f)}catch(e){IMPST={nome,estado:"erro",msg:String((e&&e.message)||e)};renderImp();throw e}
  const n=ROM&&ROM.rows?ROM.rows.length:0;
  if(n){IMPST={nome,estado:"ok",n,msg:ROM.msg||"",conf:ROM.conf||""};toast(`Romaneio importado: ${n} peça${n===1?"":"s"} lida${n===1?"":"s"}. Revise abaixo e clique em “Criar peças”.`)}
  else if(ROM&&ROM.plan)IMPST={nome,estado:"plan"};
  else if(!/[.]pdf$/i.test(nome))IMPST=null;   /* PDF termina sozinho: impStatusFim */
  renderImp()}
function impStatusFim(ok,msg){const nome=(ROM&&ROM.doc)||(IMPST&&IMPST.nome)||"";
  if(ok&&ROM&&ROM.rows&&ROM.rows.length){const n=ROM.rows.length;IMPST={nome,estado:"ok",n,conf:ROM.conf||""};toast(`Romaneio importado: ${n} peça${n===1?"":"s"} lida${n===1?"":"s"}. Revise abaixo e clique em “Criar peças”.`)}
  else IMPST={nome,estado:"erro",msg:msg||(ROM&&ROM.msg)||"não encontrei peças nesse arquivo"};renderImp()}
async function impAbrirArq0(f){
  if(editId){avisoEdicao(()=>impAbrirArq0(f));return}
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
  if(ok.length===1&&!ign.length&&IMPQ.length===1&&!IMPQ[0].dup&&!IMPQ[0].rep){const q=IMPQ.shift();renderImp();impAbrirArq(q.file);return}
  renderImp()}
function renderImp(){const el=document.getElementById("impBar");if(!el)return;
  const st=IMPST?(IMPST.estado==="lendo"?`<div class="imp-st lendo" role="status"><span class="imp-spin" aria-hidden="true"></span>Lendo <b>${esc(IMPST.nome)}</b>…</div>`:IMPST.estado==="ok"?`<div class="imp-st ok" role="status"><span aria-hidden="true">✓</span><span><b>Importado:</b> ${esc(IMPST.nome)} — ${IMPST.n} peça${IMPST.n===1?"":"s"} lida${IMPST.n===1?"":"s"}${IMPST.conf?` · ${esc(IMPST.conf)}`:""}</span><button type="button" class="btn sm pri" data-act="imp-ir">Ir para o romaneio ▾</button></div>`:IMPST.estado==="plan"?`<div class="imp-st ok" role="status"><span aria-hidden="true">✓</span><span><b>${esc(IMPST.nome)}</b> aberto: confirme as colunas no romaneio abaixo.</span><button type="button" class="btn sm pri" data-act="imp-ir">Ir para o romaneio ▾</button></div>`:`<div class="imp-st bad" role="alert"><b>Não consegui importar ${esc(IMPST.nome)}</b>: ${esc(IMPST.msg||"arquivo ilegível")}. Tente outro arquivo ou cole o texto da lista.</div>`):"";
  el.innerHTML=`<button type="button" class="imp-zone" data-act="imp-pick" aria-label="Importar romaneio: escolher arquivos PDF, XML, planilha ou txt"><span class="imp-ic" aria-hidden="true">⤓</span><span class="imp-tx"><b>Importar romaneio</b><span>Arraste o PDF, XML da nota, planilha ou txt para cá — ou clique para escolher. Com um arquivo só, ele abre sozinho; com vários, você escolhe a ordem.</span></span></button>${st}<div class="imp-r"><span class="hint">Ou:</span><button type="button" class="btn" data-act="rom-abrir" title="Colar o texto da lista do fornecedor ou continuar o romaneio em andamento">Colar texto / retomar romaneio</button><button type="button" class="btn" data-act="rom-lista">Romaneios salvos</button></div><p class="hint">O texto importado pode conter CPF, telefone e endereço: ele fica no romaneio salvo e no backup. Proteja os arquivos de backup. A leitura de PDF usa uma biblioteca baixada da internet; o envio de fotos ao imgbb é opcional.</p>${IMPQ.length?`<p class="hint imp-qt"><b>Fila de importação</b> · abra um por vez; o romaneio aberto é guardado antes de abrir o próximo.</p><ol class="imp-q">${IMPQ.map((q,i)=>`<li class="${q.dup||q.rep?"dup":""}"><span class="n">${i+1}</span><b title="${esc(q.name)}">${esc(q.name)}</b><small>${q.dup?"já importado em "+esc(impData(q.dup))+(q.dup.forn?" · "+esc(q.dup.forn):""):q.rep?"repetido nesta fila":"aguardando"}</small><span class="acts"><button type="button" class="x" data-act="imp-up" data-i="${i}" ${i?"":"disabled"} aria-label="Subir na fila">↑</button><button type="button" class="x" data-act="imp-down" data-i="${i}" ${i<IMPQ.length-1?"":"disabled"} aria-label="Descer na fila">↓</button><button type="button" class="btn sm" data-act="imp-abrir" data-i="${i}">Abrir</button><button type="button" class="x" data-act="imp-del" data-i="${i}" aria-label="Tirar da fila">×</button></span></li>`).join("")}</ol><div class="imp-r"><button type="button" class="btn sm pri" data-act="imp-abrir" data-i="0">Abrir o primeiro</button><button type="button" class="btn sm ghost" data-act="imp-limpar">Limpar fila</button><span class="hint">O romaneio aberto é guardado antes de abrir o próximo.</span></div>`:""}`}
{const el=document.getElementById("impBar");if(el){
  el.addEventListener("dragover",e=>{if(e.dataTransfer&&[...(e.dataTransfer.types||[])].includes("Files")){e.preventDefault();e.stopPropagation();el.classList.add("over")}});
  el.addEventListener("dragleave",()=>el.classList.remove("over"));
  el.addEventListener("drop",e=>{e.preventDefault();e.stopPropagation();el.classList.remove("over");const fl=[...((e.dataTransfer&&e.dataTransfer.files)||[])];if(fl.length)impAdd(fl)});
  renderImp()}}
