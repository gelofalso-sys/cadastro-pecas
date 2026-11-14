/* ===== configurações ===== */
/* cadastros em abas na horizontal: o nome de cada um fica sempre à vista e o conteúdo abre embaixo */
const estadoConfig={secs:[],libtam:"",renBusy:false,faixaBusy:false,resetArm:null,delCat:null};

function sec(id,titulo,resumo,corpo){estadoConfig.secs.push({id,titulo,resumo,corpo});return ""}
function abaCfg(){return estadoConfig.secs.some(s=>s.id===abertos.tab)?abertos.tab:estadoConfig.secs[0].id}
/* ===== Catálogo rápido: colar lista, modelos, duplicar seguro, renomear e ordenar ===== */
const catUI={colar:false,txt:"",dup:null,ren:null,corNova:null};
/* lê "Anéis: Solitário; Aparador" (uma categoria por linha) e diz o que seria criado, sem mexer em nada */
function previaInfo(C){const tx=String(catUI.txt||"");
  if(!tx.trim())return{html:`<span class="hint">Cole ou digite uma categoria por linha. As subcategorias vêm depois dos dois-pontos, separadas por ponto e vírgula.</span>`,ok:false};
  const pl=planoLista(C,tx),[nc,ns]=contaPlano(pl);let h="";
  h+=(nc||ns)?`<b>Vai ${nc?`criar ${nc} categoria${nc>1?"s":""}${ns?" e ":"."}`:"acrescentar "}${ns?`${ns} subcategoria${ns>1?"s":""}.`:""}</b>`:`<b>Nada novo para criar</b> — tudo isso já está cadastrado.`;
  const li=[];pl.novas.forEach(n=>li.push(`<li><b>${esc(n.nome)}</b> <span class="mono">${esc(n.prefixo)}</span>${n.rep?` <span class="warn">prefixo repetido: divide a numeração com outra categoria</span>`:""}${n.subs.length?" — "+esc(n.subs.join(", ")):""}</li>`));
  pl.extra.forEach(e=>li.push(`<li><b>${esc(e.c.nome)}</b> já existe: entram só ${esc(e.add.join(", "))}</li>`));
  pl.erros.forEach(m=>li.push(`<li class="bad">${esc(m)}</li>`));
  if(li.length)h+=`<ul>${li.slice(0,15).join("")}${li.length>15?`<li>…e mais ${li.length-15}</li>`:""}</ul>`;
  return{html:h,ok:!!(nc||ns)}}
function atualizaPrevia(){const p=document.getElementById("colarPrev"),b=document.getElementById("colarOk");if(!p)return;const r=previaInfo(cfg());p.innerHTML=r.html;if(b)b.disabled=!r.ok}
function catTopo(C){
  const banner=(!abertos.catBanner&&!C.categorias.some(c=>!JUERI_CATS.some(j=>j.nome===c.nome)))?`<div class="banner" role="note"><b>Primeira vez aqui?</b><span>Monte o seu catálogo de uma vez: cole a lista de categorias e subcategorias ou comece por um modelo pronto.</span><button type="button" class="btn pri sm" data-act="colar-abrir">Montar meu catálogo</button><button type="button" class="x" data-act="banner-fechar" aria-label="Fechar esta faixa" title="Fechar">×</button></div>`:"";
  const mod=`<details class="mdl"><summary class="btn sm" title="Cria categorias e subcategorias comuns de joalheria; só entra o que ainda não existe">Começar com um modelo</summary><div class="row">${MODELOS_CAT.map(m=>`<button type="button" class="btn sm" data-act="modelo-add" data-m="${m.id}">${esc(m.nome)}</button>`).join("")}<button type="button" class="btn sm pri" data-act="modelo-add" data-m="todos">Todos</button></div><div class="hint">Só entra o que ainda não existe — nada do que você já cadastrou muda.</div></details>`;
  let painel="";
  if(catUI.colar){const r=previaInfo(C);
    painel=`<div class="cpanel" id="colarPanel"><b>Colar lista de categorias</b><span class="hint">Uma categoria por linha, assim: <span class="mono">Anéis: Solitário; Aparador; Meia aliança</span>. Se a categoria já existe, só entram as subcategorias que faltam.</span><textarea id="colarTx" data-colar aria-label="Lista de categorias e subcategorias" placeholder="Anéis: Solitário; Aparador; Meia aliança&#10;Colares: Corrente; Choker">${esc(catUI.txt)}</textarea><div id="colarPrev" class="prev" aria-live="polite">${r.html}</div><div class="row"><button type="button" class="btn pri sm" id="colarOk" data-act="colar-ok" ${r.ok?"":"disabled"}>Criar</button><button type="button" class="btn ghost sm" data-act="colar-fechar">Cancelar</button></div></div>`}
  return banner+`<div class="row"><button type="button" class="btn sm${catUI.colar?" pri":""}" data-act="${catUI.colar?"colar-fechar":"colar-abrir"}" aria-expanded="${catUI.colar?"true":"false"}" title="Cria várias categorias e subcategorias de uma vez a partir de uma lista">Colar lista</button>${mod}</div>`+painel}
/* duplicar categoria com cuidado: nome, prefixo livre e o que copiar */
function dupPainel(C,c){const d=catUI.dup,av=dupAviso(C,d);
  return `<div class="cpanel" data-dup><b>Duplicar “${esc(c.nome)}”</b><div class="row"><label class="fl" style="flex:1 1 160px"><span>Nome da nova categoria</span><input data-dup="nome" value="${esc(d.nome)}" maxlength="40"></label><label class="fl" style="width:84px"><span>Prefixo</span><input data-dup="pre" value="${esc(d.pre)}" maxlength="4" style="text-transform:uppercase" title="1 a 4 letras. Sugerido: um prefixo que ninguém usa ainda"></label></div>
  <label class="vchk"><input type="checkbox" data-dup="subs" ${d.subs?"checked":""}> Copiar as subcategorias</label><label class="vchk"><input type="checkbox" data-dup="grade" ${d.grade?"checked":""}> Copiar a variação (tamanhos, letras…)</label>
  <div class="hint">Os prefixos próprios das subcategorias não são copiados.</div><div class="soft" id="dupAviso" role="status" ${av?"":"hidden"}>${esc(av)}</div>
  <div class="row"><button type="button" class="btn pri sm" data-act="cat-dup-ok">Criar cópia</button><button type="button" class="btn ghost sm" data-act="cat-dup-no">Cancelar</button></div></div>`}
function dupAbrir(ci){const C=cfg(),c=C.categorias[ci];if(!c)return;const nome=nomeCatLivre(C,c.nome.slice(0,30)+" (cópia)"),pf=prefixoNovo(C,nome);
  catUI.dup={i:ci,nome,pre:pf?pf.p:"",preManual:false,subs:true,grade:true};renderCfg();const el=document.querySelector(`[data-cat="${ci}"] [data-dup="nome"]`);if(el){el.focus();el.select()}}
function dupCampo(t){const d=catUI.dup;if(!d)return;const k=t.dataset.dup,C=cfg();
  if(k==="nome"){d.nome=t.value;if(!d.preManual){const pf=prefixoNovo(C,d.nome);d.pre=pf?pf.p:"";const pi=document.querySelector('[data-dup="pre"]');if(pi)pi.value=d.pre}}
  else if(k==="pre"){d.pre=t.value.toUpperCase().replace(/[^A-Z]/g,"").slice(0,4);t.value=d.pre;d.preManual=true}
  else d[k]=t.checked;
  const a=document.getElementById("dupAviso");if(a){const m=dupAviso(C,d);a.textContent=m;a.hidden=!m}}
function dupOk(){const C=cfg(),d=catUI.dup;if(!d)return;const c=C.categorias[d.i];if(!c){catUI.dup=null;renderCfg();return}
  const nome=String(d.nome||"").replace(/\s+/g," ").trim(),er=nomeCatErro(C,nome,null);if(er){toast(er);const el=document.querySelector('[data-dup="nome"]');if(el)el.focus();return}
  const pre=String(d.pre||"").toUpperCase().replace(/[^A-Z]/g,"").slice(0,4);if(!pre){toast("O prefixo precisa ter de 1 a 4 letras.");const el=document.querySelector('[data-dup="pre"]');if(el)el.focus();return}
  const av=dupAviso(C,{pre}),n=clone(c);n.nome=nome;n.prefixo=pre;delete n.subPref;
  if(!d.subs){n.subs=[];delete n.subSoRef}
  if(!d.grade)delete n.grade;else if(n.grade){n.grade.id=uid();if(Array.isArray(n.grade.itens))n.grade.itens.forEach(x=>{x.id=uid()});if(n.grade.subs&&!d.subs)n.grade.subs=[]}
  C.categorias.splice(d.i+1,0,n);if(!(pre in C.seqs))C.seqs[pre]="0";catUI.dup=null;salvar(true,false);render();
  toast(`Categoria “${nome}” criada com o prefixo ${pre}.${av?" "+av:""}`,{t:"Desfazer",fn:desfazer});refocar(`[data-cat="${d.i+1}"] [data-enter="sub"]`)}
function focoChip(ci,j){const el=document.querySelectorAll(`[data-cat="${ci}"] .chip .cn`)[j];if(el)el.focus()}
function subRenomear(ci,j,novo){if(estadoConfig.renBusy)return;estadoConfig.renBusy=true;try{subRenomear0(ci,j,novo)}finally{estadoConfig.renBusy=false}}
function subRenomear0(ci,j,novo){const C=cfg(),c=C.categorias[ci];catUI.ren=null;if(!c||j>=c.subs.length){renderCfg();return}
  const old=c.subs[j];novo=String(novo||"").replace(/\s+/g," ").trim();
  if(!novo||novo===old){renderCfg();return}
  if(novo.length>60){toast("O nome da subcategoria é longo demais (máximo 60 letras).");renderCfg();return}
  if(c.subs.some((x,k)=>k!==j&&semAc(x)===semAc(novo))){toast(`Já existe a subcategoria “${novo}” em ${c.nome}.`);renderCfg();return}
  c.subs[j]=novo;
  const mv=o=>{if(o&&Object.prototype.hasOwnProperty.call(o,old)){o[novo]=o[old];delete o[old]}};mv(c.subPref);mv(c.subSoRef);mv(c.subPalavra);mv(c.subAlias);mv(c.bancoPalavras);
  if(c.grade&&Array.isArray(c.grade.subs))c.grade.subs=c.grade.subs.map(x=>x===old?novo:x);
  if(c.coresCfg&&Array.isArray(c.coresCfg.subs))c.coresCfg.subs=c.coresCfg.subs.map(x=>x===old?novo:x);
  let n=0;S.lanc.forEach(l=>{if(l.v&&l.v.I===c.nome&&l.v.J===old){l.v.J=novo;n++}});
  if(S.form&&S.form.v&&S.form.v.I===c.nome&&S.form.v.J===old)S.form.v.J=novo;
  (C.romaneios||[]).forEach(T=>{if(T&&T.mapa)T.mapa=String(T.mapa).split(";").map(it=>{const q=it.indexOf("=");if(q<0)return it;return it.slice(q+1).trim()===c.nome+">"+old?it.slice(0,q+1)+c.nome+">"+novo:it}).join(";")});
  if(rascunho&&rascunho.v&&rascunho.v.I===c.nome&&rascunho.v.J===old)rascunho.v.J=novo;
  sincGrade(S.form);salvar(true,n>0);render();
  toast(`Subcategoria “${old}” agora é “${novo}”.${n?` ${n} peça(s) já lançadas foram atualizadas.`:""}`,{t:"Desfazer",fn:desfazer})}
/* banhos prontos */
function corNovaOk(){const C=cfg(),cn=catUI.corNova;if(!cn)return;const inp=document.querySelector("[data-ncor]"),nome=String(inp?inp.value:"").replace(/[;,]+/g," ").replace(/\s+/g," ").trim().slice(0,40);
  if(!nome){toast("Digite o nome da cor.");if(inp)inp.focus();return}
  const b=C.banhistas[cn.bi],bn=b&&b.banhos[cn.j];if(!bn){catUI.corNova=null;renderCfg();return}
  let cor=C.cores.find(c=>semAc(c)===semAc(nome));if(!cor){cor=nome;C.cores.push(cor)}
  bn.cor=cor;catUI.corNova=null;salvar(true,false);render();toast(`Cor “${cor}” pronta e escolhida para o banho ${bn.nome}.`,{t:"Desfazer",fn:desfazer});refocar(`[data-bh="${cn.bi}"] [data-bn="${cn.j}"] [data-bnf="cor"]`)}
