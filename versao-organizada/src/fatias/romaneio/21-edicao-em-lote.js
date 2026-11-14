/* ===== edição em lote ===== */
function romBulkHTML(){const C=cfg(),f=S.form,b=ROM.bulk||{mk:{}},bruta=f.tipo==="bruta",bh=banhistaBy(f.banhista),fq=romFq,cc=catBy(b.cat),ns=ROM.rows.filter(r=>r.sel).length;
  const mks=bruta?bh.banhos.filter(x=>f.on[x.id]).map(x=>({id:x.id,nome:"Multiplicador "+x.nome})):[{id:"p",nome:"Multiplicador"}];
  return `<details class="gdet rom-bulk" ${b.aberto?"open":""}><summary><b>Edição em lote</b><span>aplique peso, multiplicador, categoria ou observação a várias peças de uma vez</span></summary><div class="gb">
    <div class="rc-r">${fq("Selecionar peças",`<select data-rp="rb" data-k="selmode"><option value="">escolha…</option><option value="todas">Todas</option><option value="nenhuma">Nenhuma</option><option value="sempeso">Sem peso</option>${C.categorias.filter(c=>ROM.rows.some(r=>r.cat===c.nome)).map(c=>`<option value="cat:${esc(c.nome)}">Categoria ${esc(c.nome)}</option>`).join("")}</select>`,"w-m")}<span class="hint" id="romSelN">${ns} selecionada(s) — sem seleção, aplicar vale para todas</span><button type="button" class="btn sm danger" data-act="rom-excluir-selecionadas">Excluir selecionadas</button></div>
    <div class="rc-r">${fq("Peso (g)",`<input class="n" data-rp="rb" data-k="peso" value="${esc(b.peso??"")}" inputmode="decimal">`,"w-n")}
      ${mks.map(m=>fq(esc(m.nome),`<input class="n" data-rp="rb" data-k="mk" data-b="${m.id}" value="${esc((b.mk||{})[m.id]??"")}" inputmode="decimal">`,"w-c")).join("")}
      ${fq("Categoria",`<select data-rp="rb" data-k="cat">${opts(C.categorias.map(c=>c.nome),b.cat||"","(manter)")}</select>`)}
      ${fq("Subcategoria",`<select data-rp="rb" data-k="sub">${opts(cc?cc.subs:[],b.sub||"","(manter)")}</select>`)}${fq("Tipo",`<select data-rp="rb" data-k="tipo"><option value="">(manter)</option><option value="bruta" ${b.tipo==="bruta"?"selected":""}>Bruta (vai banhar)</option><option value="pronta" ${b.tipo==="pronta"?"selected":""}>Pronta (já banhada)</option></select>`)}${fq("Galvânica",`<select data-rp="rb" data-k="bh">${opts(C.banhistas.map(x=>[x.id,x.nome]),b.bh||"","(manter)")}</select>`)}
      ${fq("Observação",`<input data-rp="rb" data-k="obs" value="${esc(b.obs??"")}" placeholder="(manter)">`,"w-l")}
      <button type="button" class="btn pri" data-act="rom-lote">Aplicar</button></div>
    <div class="rc-r"><span class="hint">Nas selecionadas (ou em todas, sem seleção):</span><button type="button" class="btn sm" data-act="rom-bulk-div" title="Divide a quantidade igualmente entre os banhos">÷ Dividir entre banhos</button><button type="button" class="btn sm" data-act="rom-bulk-lote" title="Transforma cada uma em lote para pesar peça por peça">⊞ Em lote</button><button type="button" class="btn sm" data-act="rom-bulk-criar" data-v="1">Marcar para criar</button><button type="button" class="btn sm" data-act="rom-bulk-criar" data-v="0">Não criar</button></div></div></details>`}
function romSelecionar(m){ROM.rows.forEach(r=>{r.sel=m==="todas"?true:m==="nenhuma"?false:m==="sempeso"?num(r.peso)==null:m.startsWith("cat:")?r.cat===m.slice(4):r.sel});
  document.querySelectorAll("#romWrap .rc").forEach((rc,i)=>{const c=rc.querySelector("[data-rp=sel]");if(c)c.checked=!!ROM.rows[i].sel});romSelN()}
function romSelN(){const e=document.getElementById("romSelN");if(e)e.textContent=`${ROM.rows.filter(r=>r.sel).length} selecionada(s) — sem seleção, aplicar vale para todas`}
/* Revogar retira apenas os lançamentos da tabela atual; o item permanece para novo lançamento. */
function romRevogar(rows){if(!ROM||romConflito){toast("Resolva o conflito do romaneio antes de alterar.");return}const ids=[...new Set(rows.flatMap(r=>r.lancIds||[]))],arquivados=ids.filter(id=>ARQ[id]&&!S.lanc.some(l=>l.id===id)),vivos=ids.filter(id=>S.lanc.some(l=>l.id===id));
  if(arquivados.length){toast("Há peças em tabela salva. Restaure essa tabela antes de revogar.");return}if(!vivos.length){toast("Nenhum lançamento na tabela atual para revogar.");return}
  if(!confirm(`Revogar ${vivos.length} lançamento(s) da tabela atual? Os itens permanecem no romaneio para novo lançamento.`))return;
  const antes=romHistAntes();if(!antes){toast("Não foi possível registrar o histórico do romaneio.");return}
  pontoAviso(pontoAuto("antes de revogar lançamentos do romaneio",true));fixarRefs();S.lanc=S.lanc.filter(l=>!vivos.includes(l.id));vivos.forEach(id=>{sel.delete(id);candFoto.add(id)});if(vivos.includes(editId)){editId=null;if(rascunho)S.form=rascunho;rascunho=null;renderForm()}
  rows.forEach(r=>{r.revogados=[...new Set([...(r.revogados||[]),...(r.lancIds||[]).filter(id=>vivos.includes(id))])];r.lancIds=(r.lancIds||[]).filter(id=>!vivos.includes(id));r.feito=false;r.refaz=false;r.skip=false;r.aviso=""});romHistRegistrar(antes);salvar(false);renderTopo();romSalvarSoon();renderRom();toast(`${vivos.length} lançamento(s) revogado(s); itens mantidos no romaneio.`)}
/* Exclusão em lote só age sobre seleção explícita, inclusive quando todas estão selecionadas. */
function romExcluirSelecionadas(){if(!ROM||romConflito){toast("Resolva o conflito do romaneio antes de alterar.");return}const escolhidas=ROM.rows.filter(r=>r.sel);if(!escolhidas.length){toast("Selecione ao menos um item para excluir.");return}
  const lotes=escolhidas.filter(r=>r.lote);if(lotes.some(l=>ROM.rows.some(r=>r.loteDe===l.lid&&!r.sel))){toast("Selecione também todos os itens do lote antes de excluí-lo.");return}
  const ids=[...new Set(escolhidas.flatMap(r=>r.lancIds||[]))];if(ids.some(id=>ARQ[id]&&!S.lanc.some(l=>l.id===id))){toast("Há peças em tabela salva. Restaure essa tabela antes de excluir os itens.");return}const vivos=ids.filter(id=>S.lanc.some(l=>l.id===id));
  if(!confirm(`Excluir ${escolhidas.length} item(ns) do romaneio${vivos.length?` e ${vivos.length} lançamento(s) vinculado(s) da tabela atual`:""}? Esta exclusão remove os itens do romaneio.`))return;
  const antes=romHistAntes();if(!antes){toast("Não foi possível registrar o histórico do romaneio.");return}
  if(vivos.length){pontoAviso(pontoAuto("antes de excluir itens do romaneio",true));fixarRefs();S.lanc=S.lanc.filter(l=>!vivos.includes(l.id));vivos.forEach(id=>{sel.delete(id);candFoto.add(id)});if(vivos.includes(editId)){editId=null;if(rascunho)S.form=rascunho;rascunho=null;renderForm()}}
  ROM.rows=ROM.rows.filter(r=>!r.sel);romHistRegistrar(antes);salvar(false);renderTopo();if(ROM.rows.length)romSalvarSoon();else{romLimparRascunho();romHistAplicar(antes.R.depois)}renderRom();toast(`${escolhidas.length} item(ns) excluído(s) do romaneio.`)}
function romLote(){const b=ROM.bulk||{mk:{}},f=S.form;let alvo=ROM.rows.filter(r=>r.sel);if(!alvo.length)alvo=ROM.rows.filter(r=>!r.skip);
  if(!vazio(b.peso)){const ck=checaCel("N",b.peso);if(ck.erro){toast(ck.erro);return}}
  for(const k of Object.keys(b.mk||{})){if(!vazio(b.mk[k])){const x=num(b.mk[k]);if(x==null||x<=0){toast("Multiplicador inválido (use um número maior que 0).");return}}}
  let n=0;
  alvo.forEach(r=>{let m=false;if(r.feito&&r.arq)return;
    if(b.cat&&!romTrocarCategoria(r,b.cat,b.sub||""))return;
    if(!vazio(b.peso)){r.peso=b.peso;m=true}
    Object.keys(b.mk||{}).forEach(k=>{if(vazio(b.mk[k]))return;r.mk=r.mk||{};if(String(b.mk[k])===String((f.mk||{})[k]??""))delete r.mk[k];else r.mk[k]=b.mk[k];m=true});
    if(!vazio(b.obs)){r.obs=b.obs;m=true}
    if(b.cat)m=true
    if(b.tipo||b.bh){if(b.tipo)r.tipo=b.tipo;if(b.bh)r.bh=b.bh;romReset(r);m=true}
    if(m){romArma(r);n++}});
  ROM.bulk={...b,aberto:true};renderRom();toast(`Aplicado a ${n} peça(s).`)}
/* ===== revisão final ===== */
