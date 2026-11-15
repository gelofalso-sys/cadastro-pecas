/* ===== rascunho do romaneio (salvo sozinho: neste navegador e na conta) ===== */
/* ===== tabelas salvas: histórico de tabelas, quem montou e o que cada romaneio fez ===== */
/* estado da fatia: sugT/sugSeq = temporizador e geração do histórico de sugestões; semVarredura = o app abriu sem varrer fotos (33 liga) */
const estadoTabelas={sugT:null,sugSeq:0,semVarredura:false};
function histSugAgendar(){clearTimeout(estadoTabelas.sugT);const seq=++estadoTabelas.sugSeq;estadoTabelas.sugT=setTimeout(async()=>{const itens=[],vistos=new Set();try{for(const t of [...TABS]){const rec=await idbGet("tabs",t.id);if(seq!==estadoTabelas.sugSeq)return;if(!rec||!Array.isArray(rec.lanc))continue;for(const l of rec.lanc){if(!l||!l.v||!l.id||vistos.has(l.id))continue;vistos.add(l.id);const v={};["F","H","I","J","L","M"].forEach(k=>{if(typeof l.v[k]==="string")v[k]=l.v[k]});itens.push({id:l.id,v})}}if(seq!==estadoTabelas.sugSeq)return;HIST_SUG=itens;renderListas();bancoAtualizar()}catch(e){console.warn("Não foi possível atualizar as sugestões do histórico.",e)}},250)}
function setAutor(v){definirAutor(String(v||"").trim().slice(0,40));try{prefGravar("autor",AUTOR)}catch(e){}const ai=document.getElementById("autorIn");if(ai&&ai.value!==AUTOR)ai.value=AUTOR}
function arqRef(){definirArq({});TABS.forEach(t=>(t.ids||[]).forEach(i=>{ARQ[i]=t.nome}))}
/* índices (romaneios/tabelas) no armazenamento local (src/store): ao gravar, mescla por id com o que outra aba gravou e respeita o que esta aba apagou */
function gravarIdx(key,arr,apagados){
  try{let cur=[];try{cur=JSON.parse(lerPref(key)||"[]")}catch(e){}
    if(!Array.isArray(cur))cur=[];const ids=new Set(arr.map(x=>x.id));
    cur.forEach(x=>{if(x&&x.id&&!ids.has(x.id)&&!(apagados&&apagados.has(x.id)))arr.push(x)});
    arr.sort((a,b)=>b.em-a.em);gravarPref(key,JSON.stringify(arr));return true}catch(e){return false}}
function tabIndex(rec){const L=rec.linhas||[],m={id:rec.id,nome:rec.nome,em:rec.em,por:rec.por||"",n:(rec.lanc||[]).length,linhas:L.length,un:L.reduce((t,l)=>t+(Number(l&&l.q)||0),0),roms:(rec.roms||[]).length,ids:(rec.lanc||[]).map(l=>l.id),cods:codsDe(rec)},i=TABS.findIndex(x=>x.id===m.id);
  if(i<0)TABS.unshift(m);else TABS[i]=m;TABDEL.delete(m.id);const ok=gravarIdx("cadpecas-tabs",TABS,TABDEL);arqRef();return ok}
/* fotos órfãs: ao excluir uma peça/tabela, a foto (e a miniatura) some do IndexedDB — mas só quando nenhuma peça atual,
   tabela salva ou passo do "desfazer/refazer" ainda precisa dela */
   /* peças que ainda existem em algum ponto de restauração: a foto delas não pode ser apagada */
async function pontosIds(){try{const ks=((await idbOp("pontos","readonly",st=>st.getAllKeys()))||[]).filter(k=>String(k).startsWith("p:"));const n=new Set();for(const k of ks){const r=await idbGet("pontos",k);try{(JSON.parse(r&&r.json||"{}").lanc||[]).forEach(l=>l&&l.id&&n.add(l.id))}catch(e){}}PONTO_IDS.clear();n.forEach(x=>PONTO_IDS.add(x))}catch(e){}}
function fotoViva(id,hist){if(S.lanc.some(l=>l.id===id))return true;if(PONTO_IDS.has(id))return true;if(TABS.some(t=>(t.ids||[]).includes(id)))return true;
  if(hist&&(HIST.some(e=>e.L.includes(id))||REDO.some(e=>e.L.includes(id))||(snapL&&snapL.includes(id))))return true;return false}
function varrerFotos(){if(estadoTabelas.semVarredura)return;[...candFoto].forEach(id=>{if(fotoViva(id,true))return;candFoto.delete(id);idbDel("fotos",id);idbDel("fotos","m:"+id);idbDel("fotos","r:"+id);ftSalvas.delete(id);ftRSalvas.delete(id)})}
async function varrerTudo(){if(estadoTabelas.semVarredura||(!S.lanc.length&&!TABS.length))return;await pontosIds();const ks=(await idbOp("fotos","readonly",st=>st.getAllKeys()))||[];
  for(const k of ks){const id=String(k).replace(/^[mr]:/,"");if(!fotoViva(id,false))await idbDel("fotos",k)}}
/* tabelas salvas antes desta versão não guardavam cód.+fornecedor no índice: lê do IndexedDB uma vez */
async function tabsMigrar(){let mudou=false;for(const t of TABS){if(Array.isArray(t.cods))continue;const rec=await idbGet("tabs",t.id);if(rec===null)return false;t.cods=rec?codsDe(rec):[];mudou=true}if(mudou&&!gravarIdx("cadpecas-tabs",TABS,TABDEL))return false;
  /* se a lista (índice) de tabelas falhou ao ser gravada, as tabelas continuam no IndexedDB: refaz a lista a partir de lá */
  try{const ks=await idbOp("tabs","readonly",st=>st.getAllKeys());if(!Array.isArray(ks))return false;let n=0;
    for(const k of ks){if(typeof k!=="string"||TABS.some(t=>t.id===k)||TABDEL.has(k))continue;const rec=await idbGet("tabs",k);
      if(rec===null)return false;
      if(!ehObj(rec)||!Array.isArray(rec.lanc)||!rec.lanc.every(ehObj))continue;if(!rec.id)rec.id=k;if(!ehNumLike(rec.em))rec.em=Date.now();
      if(!tabIndex(rec))return false;n++}
    if(n)toast(`Encontrei ${n} tabela(s) salva(s) que não apareciam na lista e coloquei de volta em “Tabelas salvas”.`);return true}catch(e){return false}}
/* O diário permite recuperar o registro se a aba fechar antes de retirar o índice. */
async function tabExcluirSalvo(id){if(tabExcluindo.has(id))return false;tabExcluindo.add(id);
  try{return await exComLock(async()=>{const prep=await exPreparar("tabs",id);if(!prep){toast("Não consegui proteger e excluir a tabela no armazenamento. Ela continua na lista.");return false}
    const antiga=TABS,jaApagado=TABDEL.has(id),atual=TABS.find(x=>x.id===id),nova=TABS.filter(x=>x.id!==id);TABDEL.add(id);
    if(!gravarIdx("cadpecas-tabs",nova,TABDEL)){if(!jaApagado)TABDEL.delete(id);definirTabs(antiga);
      const voltou=await exReverter(prep.key);
      toast(voltou?"Não consegui atualizar a lista; a tabela foi mantida.":"ATENÇÃO: não consegui atualizar a lista nem restaurar a tabela excluída. Confira seu backup.");return false}
    if(prep.key&&await idbDel("pontos",prep.key)===null){if(!jaApagado)TABDEL.delete(id);definirTabs(antiga);const voltou=await exReverter(prep.key);toast(voltou?"Não consegui concluir a exclusão; a tabela foi mantida.":"ATENÇÃO: exclusão incompleta; recarregue para tentar recuperar a tabela e confira seu backup.");return false}
    definirTabs(nova);arqRef();histSugAgendar();if(atual)(atual.ids||[]).forEach(i=>candFoto.add(i));varrerFotos();return true;
  })}finally{tabExcluindo.delete(id)}}
