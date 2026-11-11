/* ===== armazenamento grande (IndexedDB): fotos em alta qualidade e romaneios salvos ===== */
let ROMS=[],romArm=null,TABS=[],ARQ={},AUTOR="",tabArm=null;
function idbOp(store,mode,fn){return new Promise(res=>{try{const rq=indexedDB.open("cadpecas-big",3);rq.onupgradeneeded=()=>{const d=rq.result;["fotos","roms","tabs","pontos"].forEach(n=>{if(!d.objectStoreNames.contains(n))d.createObjectStore(n)})};rq.onerror=()=>res(null);
  rq.onsuccess=()=>{const d=rq.result;try{const tx=d.transaction(store,mode),st=tx.objectStore(store);let out=null;const r=fn(st);if(r)r.onsuccess=()=>{out=r.result};tx.oncomplete=()=>{d.close();res(out)};tx.onerror=tx.onabort=()=>{d.close();res(null)}}catch(e){d.close();res(null)}}}catch(e){res(null)}})}
const idbPut=(s,k,v)=>idbOp(s,"readwrite",st=>st.put(v,k)),idbGet=(s,k)=>idbOp(s,"readonly",st=>st.get(k)),idbDel=(s,k)=>idbOp(s,"readwrite",st=>st.delete(k));
function romRec(){const f=S.form;return {id:ROM.sid,tid:ROM.tid,texto:ROM.texto,obs:ROM.obs,doc:ROM.doc||"",hash:ROM.hash||"",conf:ROM.conf,bulk:ROM.bulk||null,ins:ROM.ins||null,rows:ROM.rows,form:{H:f.v.H,tipo:f.tipo,banhista:f.banhista,on:f.on,onP:f.onP,mk:f.mk,vz:f.vz,desconto:f.desconto},em:Date.now(),por:ROM.por||"",criado:ROM.criado||Date.now(),log:ROM.log||[]}}
function romIndex(rec){const m={id:rec.id,em:rec.em,por:rec.por||"",doc:rec.doc||"",hash:rec.hash||"",obs:rec.obs||"",forn:(rec.form||{}).H||"",n:rec.rows.length,feitas:rec.rows.filter(r=>r.lancIds&&r.lancIds.length).length,pend:rec.rows.filter(r=>!r.skip||r.refaz).length},i=ROMS.findIndex(x=>x.id===m.id);
  if(i<0)ROMS.unshift(m);else ROMS[i]=m;ROMDEL.delete(m.id);const ok=gravarIdx("cadpecas-roms",ROMS,ROMDEL);try{romAtualizarListaAberta()}catch(e){console.error("cadastro-pecas: não atualizei a lista de romaneios",e)}return ok}
let romGravP=null;const romHistUltimo=new Map();
function romGravarBig(){if(!ROM||!ROM.rows.length||romConflito)return;if(!ROM.sid)ROM.sid=uid();if(!ROM.por)ROM.por=AUTOR;if(!ROM.criado)ROM.criado=Date.now();if(!ROM.log)ROM.log=[{em:Date.now(),por:AUTOR,acao:"Romaneio lido: "+ROM.rows.length+" peças"}];const rec=clone(romRec()),anterior=romGravP;romHistUltimo.set(rec.id,clone(rec));romGravP=Promise.resolve(anterior).catch(()=>false).then(()=>idbPut("roms",rec.id,rec)).then(r=>{if(r===null){avisoIdb("o romaneio");return false}romIndex(rec);return true})}
/* As ações de romaneio registram também o estado dos itens, inclusive os ainda não lançados.
   O histórico é da sessão, como o restante de Desfazer. As gravações do mesmo romaneio são enfileiradas. */
function romHistAntes(){
  if(!ROM||romConflito||conflito)return null;
  histNota();romSalvar();
  return {L:JSON.stringify(S.lanc),C:JSON.stringify(S.config),F:JSON.stringify(S.form),E:!!editId,
    R:{id:ROM.sid,estado:clone({...ROM,pdf:null}),rec:clone(romRec())}};
}
function romHistRegistrar(antes){
  const depois={id:antes.R.id,estado:clone({...ROM,pdf:null}),rec:clone(romRec())};
  antes.R.depois=depois;antes.soCfg=false;antes.t=Date.now();HIST.push(antes);
  while(HIST.length>60||(HIST.length>1&&histTam()>40e6))HIST.shift();
  REDO.length=0;histSep=true;histIni();
}
function romHistComparar(rec){
  if(!rec)return "";const rows=(rec.rows||[]).map(r=>{const c={...r};delete c.sel;delete c.aviso;delete c.arq;if(!c.lancIds||!c.lancIds.length)delete c.lancIds;if(!c.revogados||!c.revogados.length)delete c.revogados;return c});
  return JSON.stringify({rows,texto:rec.texto||"",obs:rec.obs||"",doc:rec.doc||"",conf:rec.conf||""});
}
function romHistPode(esperado){
  if(!esperado)return true;const atual=ROM&&ROM.sid===esperado.id?romRec():romHistUltimo.get(esperado.id);
  if(atual&&romHistComparar(atual)!==romHistComparar(esperado.rec)){toast("O romaneio foi alterado depois desta operação. Para preservar essas alterações, não é possível desfazê-la automaticamente.");return false}return true;
}
function romHistAplicar(snap){
  if(!snap||!snap.id)return;
  const estado=clone(snap.estado),rec=clone(snap.rec),id=snap.id;romHistUltimo.set(id,clone(rec));
  const ativo=ROM&&ROM.sid===id;
  if(ativo){const pdf=ROM.pdf;ROM=estado;ROM.sid=id;if(pdf&&pdf.texto===ROM.texto)ROM.pdf=pdf;delete ROM.removidos;clearTimeout(romST);romST=null;
    if(ROM.rows.length)romSalvar();else romLimparRascunho()}
  else if(!ROM){/* preserva também o rascunho retomável, sem sobrescrever outro romaneio em andamento */
    const d=romRascunho();if(!d||d.sid===id){
      if(rec.rows.length){const rasc={...rec,sid:id,rows:rec.rows.map(r=>({...r,foto:null}))};delete rasc.id;
        try{localStorage.setItem(ROMKEY,JSON.stringify(rasc));romTem=true;romInfo=((rec.form||{}).H||"")+" · "+rec.rows.length+" peças";localStorage.setItem("cadpecas-rom-info",romInfo)}catch(e){avisoIdb("o rascunho desfeito")}
        if(db){try{const pr=db.doc("dados/romaneio").set(rasc);if(pr&&pr.catch)pr.catch(()=>{})}catch(e){}}
      }else if(d&&d.sid===id)romLimparRascunho();
    }
  }
  const anterior=romGravP;
  romGravP=Promise.resolve(anterior).catch(()=>false).then(async()=>{
    if(rec.rows.length){const ok=await idbPut("roms",id,rec);if(ok===null){avisoIdb("o romaneio desfeito");return false}romIndex(rec)}
    else{const ok=await idbDel("roms",id);if(ok===null){avisoIdb("a exclusão do romaneio");return false}
      ROMS=ROMS.filter(x=>x.id!==id);ROMDEL.add(id);gravarIdx("cadpecas-roms",ROMS,ROMDEL)}
    return true;
  });
}
let avisoIdbT=0;
function avisoIdb(oque){setStatus("NÃO salvo — memória do navegador cheia ("+oque+"). Baixe o backup.",true);if(Date.now()-avisoIdbT>10000){avisoIdbT=Date.now();toast("NÃO consegui guardar "+oque+" — a memória do navegador pode estar cheia. Baixe o backup completo.")}}
function romExcluirSalvo(id){idbDel("roms",id);ROMS=ROMS.filter(x=>x.id!==id);ROMDEL.add(id);gravarIdx("cadpecas-roms",ROMS,ROMDEL)}
/* mexeu numa peça já lançada: ela passa a ser substituída ao criar (mesma posição e mesma referência; categoria nova = próxima referência da nova sequência). Se ela está numa tabela salva, não dá para substituir aqui. */
function romArma(r){if(r&&r.feito&&r.skip&&!r.arq){r.skip=false;r.refaz=true;r.aviso="";return true}return false}
function romMarcar(){if(!ROM)return;if(ROM.removidos&&ROM.removidos.length){const voltar=ROM.removidos.filter(x=>[...(x.row.lancIds||[]),...(x.row.revogados||[])].some(id=>S.lanc.some(l=>l.id===id)));voltar.sort((a,b)=>a.pos-b.pos).forEach(x=>ROM.rows.splice(Math.min(x.pos,ROM.rows.length),0,x.row));ROM.removidos=ROM.removidos.filter(x=>!voltar.includes(x))}ROM.rows.forEach(r=>{if(!(r.lancIds||[]).length&&(r.revogados||[]).some(i=>S.lanc.some(l=>l.id===i))){r.lancIds=r.revogados.filter(i=>S.lanc.some(l=>l.id===i));r.revogados=[];r.feito=true;r.refaz=false;r.skip=true}const vivos=(r.lancIds||[]).filter(i=>S.lanc.some(l=>l.id===i)),arq=(r.lancIds||[]).filter(i=>!vivos.includes(i)&&ARQ[i]),v=vivos.concat(arq);const sumidos=(r.lancIds||[]).filter(i=>!v.includes(i));if(sumidos.length)r.revogados=[...new Set([...(r.revogados||[]),...sumidos])];r.lancIds=v;r.arq=!vivos.length&&arq.length?ARQ[arq[0]]:"";
  if(v.length){r.feito=true;if(!r.refaz||r.arq){r.refaz=false;r.skip=true;r.aviso="· já lançada"}}else if(r.feito){r.feito=false;r.refaz=false;r.skip=false;r.aviso=""}})}
async function romFotosBig(){if(!ROM||!ROM.sid)return;const sid=ROM.sid,rec=await idbGet("roms",sid);if(!rec||!ROM||ROM.sid!==sid)return;let n=0;
  rec.rows.forEach((r,i)=>{const o=ROM.rows[i];if(o&&r.foto&&!o.foto&&(o.cod||"")===(r.cod||"")){o.foto=r.foto;o.fotoMini=o.fotoMini||r.fotoMini;n++}});if(n)renderRom()}
async function romAbrirSalvo(id){if(editId){toast("Termine ou cancele a edição antes.");return}if(ROM&&romConflito){toast("Resolva o conflito do romaneio antes de abrir outro.");return}
  if(ROM&&ROM.rows.length){const lsOk=romSalvar();const idbOk=await Promise.resolve(romGravP);if(!lsOk&&!idbOk){toast("Não consegui guardar o romaneio atual; ele continua aberto. Baixe o backup antes de trocar.");return}}
  else if(romGravP)await Promise.resolve(romGravP);
  const rec=await idbGet("roms",id);if(!rec){toast("Não achei esse romaneio neste navegador.");return}
  const f=S.form;ROM={sid:rec.id,por:rec.por,criado:rec.criado,log:rec.log,tid:rec.tid,texto:rec.texto||"",obs:rec.obs||"",doc:rec.doc||"",hash:rec.hash||"",conf:rec.conf||"",bulk:rec.bulk||null,ins:rec.ins||null,rows:rec.rows,pdf:null};
  {const A=cfg().catAlias||{};ROM.rows.forEach(r=>{let n=0;while(r.cat&&!catBy(r.cat)&&A[r.cat]&&n++<10)r.cat=A[r.cat]})}   /* categoria renomeada depois de guardar o romaneio */
  if(rec.form){f.v.H=rec.form.H;f.tipo=rec.form.tipo;f.banhista=rec.form.banhista;f.on=rec.form.on||f.on;if(rec.form.onP)f.onP=rec.form.onP;f.mk=rec.form.mk||{};f.vz=rec.form.vz||{};f.desconto=rec.form.desconto??f.desconto;salvar(false)}
  romMarcar();const nf=ROM.rows.filter(r=>r.feito).length,np=ROM.rows.filter(r=>!r.skip).length;
  ROM.msg=`Romaneio salvo aberto · ${nf} já lançada(s) · ${np} para lançar. Mude qualquer campo de uma peça já lançada para corrigir (ela é substituída, mantendo posição e referência; só muda de referência se você trocar a categoria; nesse caso as outras peças nunca são renumeradas).`;
  renderTopo();renderForm();renderRom();romSalvar();const w=document.getElementById("romWrap");if(w)rolarPane(w)}
function romListaTabela(){return `<div class="rep-tb rom-lista"><table><thead><tr><th>Data</th><th>Fornecedor</th><th>Observação (documento)</th><th>Montado por</th><th class="n">Peças</th><th class="n">Lançadas</th><th class="n">A lançar</th><th></th></tr></thead><tbody>${ROMS.length?ROMS.map(x=>`<tr><td data-label="Data">${esc(new Date(x.em).toLocaleString("pt-BR"))}</td><td data-label="Fornecedor"><b>${esc(x.forn||"—")}</b></td><td data-label="Documento" class="rdoc" title="${esc((x.doc||"")+(x.doc&&x.obs?" · ":"")+(x.obs||""))}">${esc(x.doc||x.obs||"—")}${x.doc&&x.obs?`<small> · ${esc(x.obs)}</small>`:""}</td><td data-label="Montado por">${esc(x.por||"não informado")}</td><td data-label="Peças" class="n">${x.n}</td><td data-label="Lançadas" class="n">${x.feitas}</td><td data-label="A lançar" class="n">${x.pend}</td><td class="rom-acoes"><button type="button" class="btn sm" data-act="rom-ver" data-id="${esc(x.id)}">Ver</button> <button type="button" class="btn sm pri" data-act="rom-salvo-abrir" data-id="${esc(x.id)}">Abrir</button> <button type="button" class="btn sm danger" data-act="rom-salvo-del" data-id="${esc(x.id)}">${romArm===x.id?"Confirmar exclusão":"Excluir"}</button></td></tr>`).join(""):`<tr class="rom-vazio"><td colspan="8" class="hint">Nenhum romaneio salvo ainda.</td></tr>`}</tbody></table></div>`}
function romListaRef(){if(document.querySelector(".rep"))romListaAbrir();else renderCfg()}
/* Atualiza uma lista aberta quando a gravação em segundo plano termina, preservando a busca. */
function romAtualizarListaAberta(){const lista=document.querySelector(".rep .rom-lista");if(!lista)return;const busca=lista.closest(".rep").querySelector(".rep-busca"),q=busca?busca.value:"",foco=busca===document.activeElement;romListaAbrir();const nova=document.querySelector(".rep .rep-busca");if(nova){nova.value=q;nova.dispatchEvent(new Event("input",{bubbles:true}));if(foco)nova.focus()}}
function romListaAbrir(){document.querySelectorAll(".rep").forEach(x=>x.remove());const ov=document.createElement("div");ov.className="rep";
  ov.innerHTML=`<div class="rep-c"><div class="rep-h"><div><b class="rep-t">Romaneios salvos</b><div class="hint">Cada romaneio colado fica guardado com as fotos e quantidades. Abra para lançar o que faltou ou para editar todas as peças de novo — sem importar o arquivo outra vez.</div></div><div class="rep-ac"><button type="button" class="btn sm" data-act="diag-dados" title="Confere o que está guardado no navegador: romaneios salvos, fotos e espaço">Diagnóstico dos dados</button><button type="button" class="btn sm" data-act="backup-total" title="Um arquivo com tudo: peças, cadastros, romaneios e fotos">Backup completo</button><button type="button" class="btn pri sm" data-act="rel-fechar">Fechar</button></div></div>
  ${romListaTabela()}</div>`;
  document.body.appendChild(ov)}
function romBadge(r){const rf=(G&&G.linhas?G.linhas:[]).filter(x=>(r.lancIds||[]).includes(x.lancId)).map(x=>x.v.E);return `<span class="rfeito" title="Mude qualquer campo (ou marque a caixa) para corrigir esta peça: ao criar, ela é substituída na mesma posição e com a mesma referência">✓ já lançada${rf.length?" · "+esc(rf.join(", ")):(r.refs?" · "+esc(r.refs):"")}${r.arq?" · na tabela salva “"+esc(r.arq)+"”":""}${r.refaz?" · será substituída":""}</span>`}
async function bkMontar(){
  const falhas=[],chaves=async n=>{const k=await idbOp(n,"readonly",st=>st.getAllKeys());if(k===null){falhas.push(n);return []}return k},valor=async(n,k)=>{const v=await idbGet(n,k);if(v===null)falhas.push(n+":"+k);return v};
  const rk=await chaves("roms"),roms={};for(const k of rk)roms[k]=await valor("roms",k);
  const tk=await chaves("tabs"),tabs={};for(const k of tk)tabs[k]=await valor("tabs",k);
  const fk=await chaves("fotos"),fotos={},vivos=new Set(S.lanc.map(l=>l.id).concat([].concat(...TABS.map(t=>t.ids||[]))));
  Object.values(tabs).forEach(t=>{if(!t)return;(t.ids||[]).forEach(i=>vivos.add(i));(t.lanc||[]).forEach(l=>{if(l&&l.id)vivos.add(l.id)})});   /* tabela que está no banco mas não no índice também leva as fotos */
  Object.values(roms).forEach(r=>{if(!r)return;(r.lancIds||[]).forEach(i=>vivos.add(i));(r.rows||[]).forEach(x=>(x.lancIds||[]).forEach(i=>vivos.add(i)))});for(const k of fk)if(vivos.has(String(k).replace(/^[mr]:/,"")))fotos[k]=await valor("fotos",k);   /* inclui as miniaturas (m:) e as de romaneio (r:), não só a original */
  let rel=null;try{rel=JSON.parse(localStorage.getItem("cadpecas-rel")||"null")}catch(e){}
  const d=new Date(),hoje=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const o={app:"cadastro-pecas",tipo:"total",v:1,em:Date.now(),config:S.config,lanc:S.lanc,form:S.form,roms,fotos,rascunho:romRascunho(),rel,tabs,autor:AUTOR};if(falhas.length)o.incompleto=falhas.slice(0,50);
  return {o,falhas,hoje}}
async function backupTotal(){const dl=await obterDL();toast("Preparando o backup completo…");let o,falhas,hoje,bl;try{({o,falhas,hoje}=await bkMontar());bl=new Blob([JSON.stringify(o)],{type:"application/json"})}catch(e){toast("Não consegui montar o backup completo (muitas fotos ou arquivo grande demais). Use Baixar cópia dos cadastros.");return}
  let leve=false;if(bl.size>MAX_BACKUP_BYTES&&confirm(`Esse backup tem ${Math.round(bl.size/1048576)} MB e o aplicativo só restaura até ${Math.round(MAX_BACKUP_BYTES/1048576)} MB.

OK = salvar uma versão LEVE (sem as fotos originais grandes; ficam as miniaturas), que dá para restaurar.
Cancelar = salvar completo mesmo assim (só restauraria por fora do aplicativo).`)){const lev={};Object.keys(o.fotos||{}).forEach(k=>{if(/^[mr]:/.test(k))lev[k]=o.fotos[k]});bl=new Blob([JSON.stringify({...o,fotos:lev,leve:true})],{type:"application/json"});leve=true}
  const grande=bl.size>MAX_BACKUP_BYTES;
  try{await dl.save({filename:"cadastro-pecas-backup-"+(leve?"LEVE-sem-fotos-originais":"completo")+(falhas.length?"-INCOMPLETO-":"-")+hoje+".json",data:bl});if(!falhas.length&&!grande){try{localStorage.setItem("cadpecas-bk-em",String(Date.now()))}catch(e){}}if(grande){toast(`Backup salvo, mas tem ${Math.round(bl.size/1048576)} MB${leve?" mesmo na versão leve":""} e o limite para RESTAURAR é ${Math.round(MAX_BACKUP_BYTES/1048576)} MB: este arquivo seria recusado. ${leve?"Apague romaneios e tabelas antigos que não usa":"Apague fotos que não usa"} ou faça o backup em partes. O lembrete de backup continua ligado.`);return}toast(falhas.length?`Backup salvo, mas INCOMPLETO: não consegui ler ${falhas.length} item(ns) do armazenamento do navegador (${[...new Set(falhas.map(x=>x.split(":")[0]))].join(", ")}). Não conte com ele para restaurar tudo.`:leve?"Backup LEVE salvo: tem as peças, cadastros, romaneios e miniaturas, mas NÃO as fotos originais grandes.":"Backup completo salvo.")}catch(e){if(!e||e.code!=="declined")toast("Não consegui salvar o backup.")}}
/* restaurar backup completo: valida TUDO e monta objetos novos antes de mexer em qualquer coisa. Semântica: SUBSTITUI peças,
   cadastros e formulário atuais pelos do backup (confirmação antes); romaneios, tabelas e fotos do backup são adicionados
   (mesmo id = sobrescreve; o que só existe aqui é mantido). Se algo falhar, nada muda (nem no IndexedDB). */
const ehObj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
/* ---- conferência de formato: tudo o que vem de um arquivo é conferido antes de ser usado. Mensagens em português simples. ---- */
const ehTxt=x=>typeof x==="string",ehLista=(a,f)=>Array.isArray(a)&&a.every(f);
const ehNumLike=x=>typeof x==="number"?isFinite(x):(typeof x==="string"&&x.trim()!==""&&isFinite(Number(x)));
const campoOk=x=>x==null||ehTxt(x)||typeof x==="boolean"||(typeof x==="number"&&isFinite(x));   /* valor de um campo digitado */
const PREFIXO_RUIM=/[<>"'&`\\]/;
function checarConfig(c){
  const erro=m=>{throw new Error(m)};
  if(!ehObj(c))erro("os cadastros estão em formato errado");
  if(c.cores!=null&&!ehLista(c.cores,ehTxt))erro("a lista de cores está errada");
  if(c.observacoes!=null&&!ehLista(c.observacoes,ehTxt))erro("a lista de observações está errada");
  if(c.ordem!=null&&!ehTxt(c.ordem))erro("a ordem da tabela, nos cadastros, está errada");
  if(c.modelo!=null&&!ehTxt(c.modelo))erro("o modelo de planilha escolhido está errado");
  if(c.seqs!=null&&!(ehObj(c.seqs)&&Object.values(c.seqs).every(campoOk)))erro("a numeração (última peça de cada tipo) está errada");
  if(c.categorias!=null){if(!Array.isArray(c.categorias))erro("a lista de categorias está errada");
    c.categorias.forEach((x,i)=>{if(!ehObj(x)||!ehTxt(x.nome)||!x.nome.trim())erro("a categoria "+(i+1)+" está sem nome ou em formato errado");
      const nm="“"+x.nome.slice(0,30)+"”";
      if(x.prefixo!=null&&(!ehTxt(x.prefixo)||PREFIXO_RUIM.test(x.prefixo)))erro("a categoria "+nm+" tem um prefixo inválido");
      if(x.sufixo!=null&&!ehTxt(x.sufixo))erro("a categoria "+nm+" tem um sufixo inválido");
      if(x.subs!=null&&!ehLista(x.subs,ehTxt))erro("as subcategorias de "+nm+" estão erradas");
      if(x.subPref!=null&&!(ehObj(x.subPref)&&Object.values(x.subPref).every(v=>ehTxt(v)&&!PREFIXO_RUIM.test(v))))erro("os prefixos das subcategorias de "+nm+" estão errados");
      if(x.subSoRef!=null&&!ehObj(x.subSoRef))erro("as subcategorias de "+nm+" estão erradas");
      if(x.grade!=null&&!(ehObj(x.grade)&&Array.isArray(x.grade.itens)&&x.grade.itens.every(ehObj)))erro("a variação (tamanhos) de "+nm+" está errada")})}
  if(c.fornecedores!=null&&!ehLista(c.fornecedores,f=>ehObj(f)&&ehTxt(f.nome)))erro("a lista de fornecedores está errada");
  if(c.banhistas!=null&&!ehLista(c.banhistas,b=>ehObj(b)&&Array.isArray(b.banhos)&&b.banhos.every(ehObj)))erro("a lista de galvânicas está errada");
  if(c.grades!=null&&!ehLista(c.grades,g=>ehObj(g)&&Array.isArray(g.itens)&&g.itens.every(ehObj)))erro("a lista de variações está errada");
  if(c.modelos!=null&&!ehLista(c.modelos,m=>ehObj(m)&&Array.isArray(m.cols)&&m.cols.every(ehObj)))erro("a lista de modelos de planilha está errada");
  if(c.romaneios!=null&&!ehLista(c.romaneios,ehObj))erro("a lista de modelos de romaneio está errada");
  if(c.colcfg!=null&&!(ehObj(c.colcfg)&&Object.values(c.colcfg).every(ehObj)))erro("a configuração das colunas está errada")}
function checarLanc(l,i,quem){const n=(quem||"peça")+" "+(i+1),erro=m=>{throw new Error(n+": "+m)};
  if(!ehObj(l))erro("está em formato errado");
  if(l.id!=null&&!ehTxt(l.id))erro("o código interno é inválido");
  if(l.v!=null&&!(ehObj(l.v)&&Object.values(l.v).every(campoOk)))erro("os campos da peça (descrição, preço…) precisam ser texto ou número");
  if(l.ov!=null&&!(ehObj(l.ov)&&Object.values(l.ov).every(o=>ehObj(o)&&Object.values(o).every(campoOk))))erro("os valores digitados na tabela estão em formato errado");
  ["on","vz","q","dsc"].forEach(k=>{if(l[k]!=null&&!ehObj(l[k]))erro("o campo “"+k+"” está em formato errado")});
  if(l.gsel!=null&&!ehLista(l.gsel,ehTxt))erro("a seleção de tamanhos está errada");
  if(l.comp!=null&&!(Array.isArray(l.comp)&&l.comp.length<=60&&l.comp.every(c=>ehObj(c)&&["desc","peso","custo","banho"].every(k=>c[k]==null||campoOk(c[k]))&&["peso","custo"].every(k=>vazio(c[k])||(num(c[k])!=null&&num(c[k])>=0))&&(c.id==null||typeof c.id==="string"))))erro("as peças do conjunto estão em formato errado");
  if(l.desconto!=null&&!campoOk(l.desconto))erro("o desconto é inválido");
  if(l.tipo!=null&&!ehTxt(l.tipo))erro("o tipo é inválido")}
function romLimpo(k,r,exigeRows){const n="o romaneio “"+String(k).slice(0,20)+"”",erro=m=>{throw new Error(n+" "+m)};
  if(!ehObj(r))erro("está em formato errado");
  if(r.rows==null&&!exigeRows)return r;
  if(!Array.isArray(r.rows)||!r.rows.every(ehObj))erro("tem a lista de peças em formato errado");
  if(r.log!=null&&!ehLista(r.log,ehObj))erro("tem o histórico em formato errado");
  if(r.form!=null&&!ehObj(r.form))erro("tem o formulário em formato errado");
  const rows=r.rows.map((x,i)=>{["qtd","qLanc"].forEach(f=>{if(x[f]!=null&&!ehNumLike(x[f]))erro("tem, na peça "+(i+1)+", uma "+(f==="qtd"?"quantidade":"quantidade lançada")+" que não é número")});
    if(x.lancIds!=null&&!ehLista(x.lancIds,ehTxt))erro("tem, na peça "+(i+1)+", a ligação com as peças lançadas em formato errado");
    return {...x,qtd:x.qtd==null?x.qtd:Number(x.qtd),qLanc:x.qLanc==null?x.qLanc:Number(x.qLanc)}});
  return {...r,rows}}
function tabLimpa(k,r){const n="a tabela salva “"+String(k).slice(0,20)+"”",erro=m=>{throw new Error(n+" "+m)};
  if(!ehObj(r)||!Array.isArray(r.lanc))erro("está em formato errado");
  r.lanc.forEach((l,i)=>{try{checarLanc(l,i)}catch(e){erro("tem, em "+e.message)}});
  if(r.linhas!=null&&!(Array.isArray(r.linhas)&&r.linhas.every(ehObj)))erro("tem a lista de linhas em formato errado");
  if(r.roms!=null&&!ehLista(r.roms,ehTxt))erro("tem a lista de romaneios em formato errado");
  const linhas=(r.linhas||[]).map((l,i)=>{["q","custo","varejo"].forEach(f=>{if(l[f]!=null&&!ehNumLike(l[f]))erro("tem, na linha "+(i+1)+", um valor de "+(f==="q"?"quantidade":f)+" que não é número")});
    return {...l,q:l.q==null?0:Number(l.q),custo:l.custo==null?0:Number(l.custo),varejo:l.varejo==null?null:Number(l.varejo)}});
  if(r.em!=null&&!ehNumLike(r.em))erro("tem a data em formato errado");
  return {...r,linhas,em:r.em==null?Date.now():Number(r.em)}}
function validarBackup(o){
  const erro=m=>{throw new Error(m)};
  if(!ehObj(o))erro("o conteúdo do arquivo não é um backup");
  if(o.app!=="cadastro-pecas"||o.tipo!=="total")erro("este arquivo não é um backup completo do Cadastro de Peças");
  if(!(Number.isInteger(o.v)&&o.v>=1&&o.v<=1))erro("este backup é de uma versão que este programa não conhece ("+String(o.v).slice(0,10)+")");
  if(!ehObj(o.config))erro("o backup não tem os cadastros");
  try{checarConfig(o.config)}catch(e){erro("cadastros: "+e.message)}
  if(!Array.isArray(o.lanc))erro("o backup não tem a lista de peças");
  const ids=new Set();o.lanc.forEach((l,i)=>{checarLanc(l,i);if(l.id!=null){if(ids.has(l.id))erro("há peças repetidas no backup (código interno "+String(l.id).slice(0,20)+")");ids.add(l.id)}});
  if(o.form!=null&&!ehObj(o.form))erro("o formulário do backup está em formato errado");
  if(o.form&&o.form.v)checarLanc(o.form,0,"formulário");
  const roms=o.roms==null?{}:o.roms,tabs=o.tabs==null?{}:o.tabs,fotos=o.fotos==null?{}:o.fotos;
  if(!ehObj(roms)||!ehObj(tabs)||!ehObj(fotos))erro("os romaneios, tabelas ou fotos do backup estão em formato errado");
  if(o.rascunho!=null&&!ehObj(o.rascunho))erro("o rascunho de romaneio do backup está em formato errado");
  if(o.autor!=null&&!ehTxt(o.autor))erro("o nome de quem montou está em formato errado");
  /* objetos novos (nada é aplicado aqui) */
  let cfgNova;try{cfgNova=lerConfig(clone(o.config))}catch(e){erro("não consegui ler os cadastros do backup")}
  const r={config:cfgNova,lanc:clone(o.lanc).map(lerLanc),form:null,roms:{},tabs:{},fotos:{},descartadas:0,incompleto:Array.isArray(o.incompleto)?o.incompleto.map(x=>String(x).slice(0,40)).slice(0,50):null,leve:o.leve===true};
  if(o.form&&o.form.v)r.form=lerForm(clone(o.form));
  Object.entries(roms).forEach(([k,x])=>{const l=romLimpo(k,x,true);r.roms[k]={...l,id:ehTxt(l.id)&&l.id?l.id:k}});
  Object.entries(tabs).forEach(([k,x])=>{const l=tabLimpa(k,x);r.tabs[k]={...l,id:ehTxt(l.id)&&l.id?l.id:k}});
  Object.entries(fotos).forEach(([k,u])=>{if(ftOk(u))r.fotos[k]=u;else r.descartadas++});
  r.rascunho=o.rascunho?romLimpo("rascunho",o.rascunho,false):null;r.rel=o.rel!=null?relNormalizar(o.rel):null;r.autor=typeof o.autor==="string"?o.autor:"";
  return r}
/* Registro durável anterior à restauração. A recuperação é idempotente: um fechamento
   durante a própria recuperação deixa o registro para nova tentativa na próxima abertura. */
const BK_JOURNAL="backup-restauracao-pendente-v1";
/* Cada aba aberta conserva um bloqueio compartilhado. Uma restauração exige o
   bloqueio exclusivo, por isso nunca começa enquanto outra aba usa os dados. */
let bkUsoLiberar=null,bkUsoPedido=null;
function bkUsoIniciar(){if(!navigator.locks)return Promise.resolve();return new Promise((resolve,reject)=>{bkUsoPedido=navigator.locks.request("cadpecas-uso",{mode:"shared"},()=>{resolve();return new Promise(r=>{bkUsoLiberar=r})});bkUsoPedido.catch(reject)})}
async function bkUsoParar(){const fim=bkUsoPedido;if(bkUsoLiberar){const f=bkUsoLiberar;bkUsoLiberar=null;f()}if(fim)await fim;bkUsoPedido=null}
async function bkReverterJournal(j){
  let ok=true;
  for(const w of j.idb||[]){const r=w.existe?await idbPut(w.s,w.k,w.valor):await idbDel(w.s,w.k);if(r===null)ok=false}
  for(const [k,v] of Object.entries(j.ls||{})){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){ok=false}}
  if(!ok)return false;
  return (await idbDel("pontos",BK_JOURNAL))!==null;
}
async function bkRecuperarPendenteSemLock(){
  const j=await idbGet("pontos",BK_JOURNAL);if(j===undefined)return true;
  if(!j||j.v!==1||!Array.isArray(j.idb)||!j.ls)return false;
  const ok=await bkReverterJournal(j);if(ok){try{sessionStorage.setItem("cadpecas-recuperou-backup","1")}catch(e){}}return ok;
}
async function bkRecuperarPendente(){if(!navigator.locks){const j=await idbGet("pontos",BK_JOURNAL);return j===undefined}return navigator.locks.request("cadpecas-restauracao",async()=>{const j=await idbGet("pontos",BK_JOURNAL);if(j===undefined)return true;if(j===null)return false;return navigator.locks.request("cadpecas-uso",{mode:"exclusive"},()=>bkRecuperarPendenteSemLock())})}
async function bkPrepararJournal(n){
  const ls={};for(const k of ["cadpecas4","cadpecas-rom","cadpecas-rom-info","cadpecas-rel","cadpecas-roms","cadpecas-tabs"])ls[k]=localStorage.getItem(k);
  const idb=[];for(const [s,obj] of [["roms",n.roms],["fotos",n.fotos],["tabs",n.tabs]])for(const k of Object.keys(obj)){
    const v=await idbGet(s,k);if(v===null)throw new Error("não consegui verificar os dados anteriores");idb.push({s,k,existe:v!==undefined,valor:v});
  }
  const j={v:1,ls,idb};if(await idbOp("pontos","readwrite",st=>st.add(j,BK_JOURNAL))===null)throw new Error("não consegui preparar a recuperação segura (memória cheia ou outra restauração em andamento)");return j;
}
function restaurarTotal(file){try{checaTam(file,MAX_BACKUP_BYTES,"O backup")}catch(e){toast("Backup NÃO restaurado — "+e.message+". Nada foi alterado.");return}const fr=new FileReader();fr.onload=async()=>{
  let n;try{n=validarBackup(JSON.parse(fr.result))}catch(e){toast("Backup NÃO restaurado — "+(e instanceof SyntaxError?"o arquivo está danificado ou não é um backup (não consegui ler o texto dele)":e&&e.message?e.message:"arquivo inválido")+". Nada foi alterado.");return}
  if(!confirm(`Restaurar o backup?\n\nIsto SUBSTITUI as ${S.lanc.length} peça(s), os cadastros e o formulário atuais por ${n.lanc.length} peça(s) do backup.\nRomaneios (${Object.keys(n.roms).length}), tabelas salvas (${Object.keys(n.tabs).length}) e fotos (${Object.keys(n.fotos).length}) do backup serão adicionados ou substituídos quando tiverem o mesmo identificador (o que só existe aqui é mantido).\n\nCtrl+Z desfaz apenas as peças e os cadastros, não os romaneios, tabelas ou fotos restaurados.${n.incompleto&&n.incompleto.length?`\n\n⚠ ATENÇÃO: este backup foi marcado como INCOMPLETO quando foi criado (não leu: ${[...new Set(n.incompleto.map(x=>x.split(":")[0]))].join(", ")}). Pode estar faltando coisa.`:""}${n.leve?"\n\nÉ um backup LEVE: não tem as fotos originais grandes, só as miniaturas.":""}`))return;
  aplicarBackupTotal(n)};fr.onerror=()=>toast("Backup NÃO restaurado — não consegui ler o arquivo. Nada foi alterado.");fr.readAsText(file)}
async function aplicarBackupTotal(n,quieto){
  if(!navigator.locks){toast("Backup NÃO restaurado — este navegador não oferece o bloqueio necessário para uma restauração segura. Use um Chrome ou Edge atualizado.");return false}
  await bkUsoParar();try{return await navigator.locks.request("cadpecas-uso",{mode:"exclusive",ifAvailable:true},async uso=>{if(!uso){toast("Backup NÃO restaurado — feche as outras abas deste aplicativo antes de restaurar.");return false}
  return navigator.locks.request("cadpecas-restauracao",{ifAvailable:true},async lock=>{if(!lock){toast("Backup NÃO restaurado — outra aba está restaurando um backup.");return false}
    const overlay=document.createElement("div");overlay.setAttribute("role","status");overlay.style.cssText="position:fixed;inset:0;z-index:100001;background:#fff;display:grid;place-content:center;padding:24px;font:16px system-ui;text-align:center";overlay.textContent="Restaurando backup… mantenha esta aba aberta.";document.documentElement.appendChild(overlay);document.body.inert=true;
    try{
      if(romST){clearTimeout(romST);romST=null;romSalvar()}if(romGravP&&await romGravP===false){toast("Backup NÃO restaurado — não consegui guardar o romaneio atual.");return false}
      if(sT){clearTimeout(sT);sT=null}await chain;if((dirty.c||dirty.l)&&await (chain=chain.then(flush))!==true){toast("Backup NÃO restaurado — não consegui salvar os dados atuais.");return false}
      if(conflito||romConflito){toast("Backup NÃO restaurado — resolva o conflito com a outra aba.");return false}
      return await aplicarBackupTotalComLock(n,quieto)
    }finally{document.body.inert=false;overlay.remove()}})})}finally{await bkUsoIniciar()}
}
async function aplicarBackupTotalComLock(n,quieto){
  let journal;try{journal=await bkPrepararJournal(n)}catch(e){toast("Backup NÃO restaurado — "+(e&&e.message?e.message:"não consegui preparar a recuperação segura")+". Nada foi alterado.");return}
  const ant={config:S.config,lanc:S.lanc,form:S.form,roms:clone(ROMS),tabs:clone(TABS),romdel:[...ROMDEL],tabdel:[...TABDEL]};
  const lsSet=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const reverter=async()=>bkReverterJournal(journal);
  const avisoReversao=ok=>ok?"As alterações já gravadas foram revertidas.":"ATENÇÃO: não consegui reverter todos os dados gravados. Romaneios, tabelas ou fotos podem ter sido alterados. Não feche o aplicativo; libere espaço e confira seus backups.";
  const falhaReversao=()=>{setStatus("ATENÇÃO: restauração incompleta; não consegui reverter todos os dados.",true);let el=document.getElementById("backupReversaoFalhou");if(!el){el=document.createElement("div");el.id="backupReversaoFalhou";el.setAttribute("role","alert");el.style.cssText="position:fixed;top:0;left:0;right:0;z-index:100000;background:#fff3cd;color:#664d03;border-bottom:2px solid #c9a227;padding:12px;font:14px system-ui,sans-serif";document.body.appendChild(el)}el.textContent=avisoReversao(false)};
  try{
    if(n.rascunho)lsSet(ROMKEY,n.rascunho);if(n.rel)lsSet("cadpecas-rel",n.rel);
    const grava=async(s,k,v)=>{if(await idbPut(s,k,v)===null)throw new Error("memória do navegador cheia");};
    for(const k of Object.keys(n.roms))await grava("roms",k,n.roms[k]);
    for(const k of Object.keys(n.fotos))await grava("fotos",k,n.fotos[k]);
    for(const k of Object.keys(n.tabs))await grava("tabs",k,n.tabs[k]);
  }catch(e){const voltou=await reverter();toast("Backup NÃO restaurado — "+(e&&e.message?e.message:"erro ao gravar")+". "+avisoReversao(voltou));if(!voltou)falhaReversao();return}
  /* aplicar em bloco */
  try{
    S.config=n.config;S.lanc=n.lanc;if(n.form)S.form=n.form;editId=null;rascunho=null;sel.clear();selR=null;
    migrarJueri();migrarGrades();sincGrade(S.form);
  }catch(e){S.config=ant.config;S.lanc=ant.lanc;S.form=ant.form;const voltou=await reverter();toast("Backup NÃO restaurado — erro ao aplicar os cadastros. "+avisoReversao(voltou));if(!voltou)falhaReversao();return}
  /* só diz "restaurado" depois de confirmar a gravação dos dados principais (peças e cadastros); se falhar, desfaz tudo */
  ftSalvas.clear();ftRSalvas.clear();resolverCorrompido();
  dirty={c:true,l:true};try{histNota()}catch(e){}clearTimeout(sT);sT=null;
  let okGrav=false;try{okGrav=(await (chain=chain.then(flush)))===true}catch(e){okGrav=false}
  if(!okGrav){S.config=ant.config;S.lanc=ant.lanc;S.form=ant.form;editId=null;rascunho=null;const voltou=await reverter();histIni();salvar(true);render();
    toast("Backup NÃO restaurado — não consegui gravar as peças e os cadastros (memória do navegador cheia ou bloqueada). "+avisoReversao(voltou));if(!voltou)falhaReversao();return}
  let indicesOk=true;try{for(const r of Object.values(n.roms))if(!romIndex(r))indicesOk=false;for(const r of Object.values(n.tabs))if(!tabIndex(r))indicesOk=false}catch(e){indicesOk=false}
  if(!indicesOk){S.config=ant.config;S.lanc=ant.lanc;S.form=ant.form;ROMS=ant.roms;TABS=ant.tabs;ROMDEL.clear();ant.romdel.forEach(x=>ROMDEL.add(x));TABDEL.clear();ant.tabdel.forEach(x=>TABDEL.add(x));arqRef();const voltou=await reverter();histIni();render();toast("Backup NÃO restaurado — não consegui atualizar as listas de romaneios e tabelas. "+avisoReversao(voltou));if(!voltou)falhaReversao();return false}arqRef();
  if(await idbDel("pontos",BK_JOURNAL)===null){falhaReversao();return}
  if(n.rascunho)romTem=true;if(n.rel)relTem=true;if(n.autor&&!AUTOR)setAutor(n.autor);
  render();
  if(!quieto)toast(`Backup restaurado: ${S.lanc.length} peças, ${Object.keys(n.roms).length} romaneio(s), ${Object.keys(n.tabs).length} tabela(s)${n.descartadas?` · ${n.descartadas} foto(s) inválida(s) descartada(s)`:""}.${n.incompleto&&n.incompleto.length?" ⚠ Este backup estava marcado como INCOMPLETO: confira romaneios, tabelas e fotos.":""}${n.leve?" (backup leve: sem as fotos originais grandes.)":""} Peças e cadastros podem ser desfeitos; romaneios, tabelas e fotos não.`,{t:"Desfazer peças",fn:desfazer});return true}
const ROMKEY="cadpecas-rom";let romTem=false,romST=null,romInfo="";
function romSalvarSoon(){clearTimeout(romST);romST=setTimeout(romSalvar,800)}
let romConflito=false;
function romSalvar(){if(!ROM||!ROM.rows.length)return true;if(romConflito)return false;romGravarBig();let lsOk=false;const f=S.form,semFoto=rs=>rs.map(r=>({...r,foto:null}));
  const snap={sid:ROM.sid,por:ROM.por,criado:ROM.criado,log:ROM.log,tid:ROM.tid,texto:ROM.texto,obs:ROM.obs,doc:ROM.doc||"",hash:ROM.hash||"",conf:ROM.conf,bulk:ROM.bulk||null,ins:ROM.ins||null,rows:ROM.rows,form:{H:f.v.H,tipo:f.tipo,banhista:f.banhista,on:f.on,onP:f.onP,mk:f.mk,vz:f.vz,desconto:f.desconto},em:Date.now()};
  romInfo=`${f.v.H||""} · ${ROM.rows.length} peças`;try{localStorage.setItem("cadpecas-rom-info",romInfo)}catch(e){}
  /* as fotos já ficam no IndexedDB (romGravarBig): o rascunho do localStorage vai sem elas, para não serializar dezenas de MB a cada edição */
  try{localStorage.setItem(ROMKEY,JSON.stringify({...snap,rows:semFoto(snap.rows)}));romTem=true;lsOk=true}catch(x){}
  if(db){try{const pr=db.doc("dados/romaneio").set({...snap,rows:semFoto(snap.rows),texto:String(ROM.texto||"").slice(0,200000)});if(pr&&pr.catch)pr.catch(()=>{})}catch(e){}}return lsOk}
function romRascunho(){try{const j=localStorage.getItem(ROMKEY);return j?JSON.parse(j):null}catch(e){return null}}
function romLimparRascunho(){romTem=false;romInfo="";try{localStorage.removeItem("cadpecas-rom-info")}catch(e){}clearTimeout(romST);try{localStorage.removeItem(ROMKEY)}catch(e){}if(db){try{const pr=db.doc("dados/romaneio").delete();if(pr&&pr.catch)pr.catch(()=>{})}catch(e){}}}
async function romSync(){if(!db||romTem)return;try{const d=await db.doc("dados/romaneio").get();if(d.exists&&d.data()&&d.data().rows&&d.data().rows.length){localStorage.setItem(ROMKEY,JSON.stringify(d.data()));romTem=true;romInfo=((d.data().form||{}).H||"")+" · "+d.data().rows.length+" peças";renderForm()}}catch(e){}}
function romRetomar(){const d=romRascunho();if(!d||!d.rows||!d.rows.length)return false;const f=S.form;
  ROM={sid:d.sid,por:d.por,criado:d.criado,log:d.log,tid:d.tid,texto:d.texto||"",obs:d.obs||"",doc:d.doc||"",hash:d.hash||"",conf:d.conf||"",bulk:d.bulk||null,ins:d.ins||null,rows:d.rows,msg:`Romaneio em andamento retomado · ${d.rows.length} peças`,pdf:null};
  if(d.form){f.v.H=d.form.H;f.tipo=d.form.tipo;f.banhista=d.form.banhista;f.on=d.form.on||f.on;if(d.form.onP)f.onP=d.form.onP;f.mk=d.form.mk||{};f.vz=d.form.vz||{};f.desconto=d.form.desconto??f.desconto;salvar(false);renderForm();renderTopo()}romMarcar();romFotosBig();return true}
