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
      <button type="button" class="btn pri" data-act="rom-lote">Aplicar</button></div></div></details>`}
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
/* Um cartão de lote representa uma unidade; distribuir mais ou menos gera conferência enganosa. */
function romLoteDistribuicaoInvalida(r){return !!(r&&r.loteDe&&!r.skip&&romSomaDe(r,romColsR(r))!==r.qtd)}
function romRevisar(){const pv=romPreview(),it=[];
  ROM.rows.forEach((r,i)=>{if(r.skip)return;const p=pv[i],q=romForm(r).q,cols=romColsR(r),al=[],cria=q.length>0;
    if(romLoteDistribuicaoInvalida(r))al.push(`item de lote: distribua ${r.qtd} unidade(s) entre os banhos ou desmarque “criar”; adicione outro item para outra peça`);else if(!cria)al.push("sem quantidade — não será criada");else if(romSomaDe(r,cols)!==r.qtd)al.push(`divisão ${romSomaDe(r,cols)} de ${r.qtd}`);
    if(r.catq)al.push("categoria não confirmada");if(Array.isArray(r.conjComp)&&r.conjOriginal){const o0=num(r.conjOriginal.custo),a0=r.conjComp.reduce((t,c)=>t+(num(c.custo)||0)*(conjQtd(c)||0),0);if(o0!=null&&Math.abs(o0-a0)>=0.005)al.push("soma dos componentes (R$ "+brl(a0)+") difere do valor do romaneio (R$ "+brl(o0)+")")}if(cria&&p&&romTipo(r)==="bruta"&&num(r.peso)>0&&p.rows.some(x=>x.q>0&&x.cb==null))al.push("banho sem valor na galvânica (custo do banho em branco)");if(r.cat&&!catBy(r.cat))al.push("categoria “"+r.cat+"” não existe mais — escolha outra");if(num(r.peso)==null)al.push("sem peso");if(vazio(r.custo))al.push("sem custo");
    if(p&&p.rows.some(x=>x.dup))al.push("referência repetida");if(ROM.pdf&&!r.foto)al.push("sem foto");
    it.push({r,i,p,cria,al})});
  const bloqueiaLote=it.some(x=>romLoteDistribuicaoInvalida(x.r)),cr=it.filter(x=>x.cria),nal=it.filter(x=>x.al.length).length,zeros=[...new Set(cr.map(x=>prefDe(x.r.cat,x.r.sub)))].filter(pf=>!(ultimo(pf)>0));let un=0,cus=0,vr=0,nl=0;
  cr.forEach(x=>x.p.rows.forEach(y=>{nl++;un+=y.q;cus+=y.custo*y.q;vr+=(!y.sugerido&&y.v||0)*y.q}));
  let insRat=0;{const c0=romInsCtx();cr.forEach(x=>{const u=x.p.rows.reduce((t,y)=>t+y.q,0);insRat+=romInsRateio(x.r,c0)*u})}
  const ov=document.createElement("div");ov.className="rev";
  ov.innerHTML=`<div class="rev-c"><div class="rev-h"><b>Revisão final</b><span class="hint">confira antes de criar — nada foi gravado ainda. ${romInsTotal()>0?`Insumos do romaneio: R$ ${brl(romInsTotal())} rateados nas peças (soma aplicada: R$ ${brl(r2c(insRat))}; a diferença é arredondamento).`:"Frete e separação só entram no custo se você os lançar em “Insumos deste romaneio”."}</span><button type="button" class="btn ghost sm" data-act="rev-fechar" style="margin-left:auto">Voltar e corrigir ✕</button></div>
    <div class="rev-s"><span class="tt"><b>${cr.length}</b> peças</span><span class="tt"><b>${nl}</b> linhas</span><span class="tt"><b>${un}</b> unidades</span><span class="tt">Custo <b>${fm(cus)}</b></span><span class="tt tot-v">Varejo definido <b>${fm(vr)}</b></span><span class="tt ${nal?"bad":"ok"}">${nal?`⚠ ${nal} com alerta`:"✓ sem alertas"}</span>${zeros.length?`<span class="tt bad">⚠ Confira a numeração: a última peça ${zeros.map(esc).join(", ")} está em 0 (é a primeira?)</span>`:""}
      <label class="vchk"><input type="checkbox" data-act="rev-filtro"> mostrar só com alerta</label></div>
    <div class="rev-t"><table class="cfg"><thead><tr><th></th><th>Vai receber</th><th>Descrição</th><th>Categoria</th><th>Un.</th><th>Custo</th><th>Varejo</th><th>Alertas</th></tr></thead><tbody>
    ${it.map(x=>`<tr class="${x.al.length?"al":""}${x.cria?"":" nc"}" data-i="${x.i}"><td>${x.r.foto?`<img class="rc-ft sm" src="${fs(x.r.foto)}" alt="">`:""}</td>
      <td class="mono">${x.p?x.p.rows.map(y=>esc(y.ref)).join(" · "):"—"}</td><td><button type="button" class="lnk" data-act="rev-ir" data-i="${x.i}">${esc(x.r.desc)}</button><div class="hint">${esc(x.r.cod||"")}</div></td>
      <td>${esc(x.r.cat)}${x.r.sub?" › "+esc(x.r.sub):""}</td><td class="n">${x.p?x.p.rows.reduce((t,y)=>t+y.q,0):0}</td>
      <td class="n">${esc(x.r.custo||"—")}</td><td class="n">${x.p?x.p.rows.map(y=>y.sugerido?(y.v==null?"A definir":"Sugestão "+brl(y.v)):y.v==null?"A definir":brl(y.v)).join(" / "):"—"}</td><td class="al-t">${x.al.map(esc).join(" · ")}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="rev-f">${bloqueiaLote?`<span class="hint">⚠ Há item de lote com divisão diferente de 1 unidade: será criado com as quantidades distribuídas (alerta, não bloqueio).</span>`:""}<button type="button" class="btn" data-act="rev-fechar">Voltar e corrigir</button><button type="button" class="btn pri big" data-act="rev-ok" ${cr.length?"":"disabled"}>${nal||bloqueiaLote?"Criar mesmo assim":"Confirmar e criar"} ${cr.length} peça${cr.length===1?"":"s"}</button></div></div>`;
  document.body.appendChild(ov)}
const romFq=(rot,inner,cls)=>`<label class="fq ${cls||""}"><span>${rot}</span>${inner}</label>`;
function romCardHTML(r,i){if(r.lote)return romLoteHTML(r,i);const C=cfg(),f=S.form,bruta=romTipo(r)==="bruta",bh=romBh(r),g=gradeDaCat(r.cat,r.sub),cc=catBy(r.cat),fq=romFq,rc=romColsR(r);
  const lcor=coresDaCat(r.cat,r.sub),ids=romIds(r),usaVar=(!!g&&!r.semG)||ids.length>0,dupCod=r.cod&&S.lanc.some(l=>!(r.lancIds||[]).includes(l.id)&&String(l.v.G||"")===String(r.cod)&&String(l.v.H||"")===String(r.forn||f.v.H||""));
  const banhoCard=b=>{const on=romOn(r,b),vz=r.vz&&(b.id in r.vz)?r.vz[b.id]:vzOn(f,bh,b),dis=on?"":"disabled";
    return `<div class="bcard sm${on?"":" off"}"><div class="bh2"><label class="ck"><input type="checkbox" data-rp="bon" data-b="${b.id}" ${on?"checked":""}><span class="dot d-${b.coluna}"></span>${esc(b.letra)} · ${esc(b.nome)}</label>${bruta?`<label class="ck vz" title="Esta peça leva verniz"><input type="checkbox" data-rp="vz" data-b="${b.id}" ${vz?"checked":""} ${dis}>Verniz</label><small data-cb="${b.id}"></small><small class="conta-banho" data-cb-conta="${b.id}"></small>`:""}</div>
      <div class="bf">${usaVar?"":fq("Quantidade",`<input class="n" data-rp="q" data-b="${b.id}" value="${esc(r.q[b.id]??"")}" inputmode="numeric" placeholder="0" ${dis}>`)}${fq("Fator ×",`<input class="n" title="Fator do preço: varejo = custos × este número" data-rp="mk" data-b="${b.id}" value="${esc((r.mk||{})[b.id]??(f.mk||{})[b.id]??"")}" placeholder="${esc(fatorBanho(b.id)||"×")}" inputmode="decimal" ${dis}>`)}${fq("Preço de Varejo",`<input class="n calc" data-rp="bo" data-k="V" data-b="${b.id}" data-auto="V:${b.id}" value="${esc(((r.bo||{})[b.id]||{}).V??"")}" placeholder="—" inputmode="decimal" ${dis}>`)}<small class="bfx" data-cbase="${b.id}"></small></div></div>`};
  const prontaCard=`<div class="bcard sm"><div class="bh2"><b>Quantidade e preço</b></div><div class="bf">${usaVar?"":fq("Quantidade",`<input class="n" data-rp="q" data-b="p" value="${esc(r.q.p??"")}" inputmode="numeric" placeholder="0">`)}${fq("Fator ×",`<input class="n" title="Fator do preço: varejo = custos × este número" data-rp="mk" data-b="p" value="${esc((r.mk||{}).p??(f.mk||{}).p??"")}" placeholder="×" inputmode="decimal">`)}${fq("Preço de Varejo",`<input class="n calc" data-rp="vp" data-auto="V:p" value="${esc(r.vp??"")}" placeholder="—" inputmode="decimal">`)}<small class="bfx" data-cbase="p"></small></div></div>`;
  const dotc=c=>`<span class="dot d-${c.col||"R"}"></span>`;
  const btnQ=(q,rot,tit)=>`<button type="button" class="gi tod" data-act="rom-q" data-q="${q}" data-i="${i}" title="${tit}">${rot}</button>`;
  const chipsSz=g?`<div class="rc-gh"><b>${esc(g.nome)}</b><div class="gch">${g.itens.map(it=>{const on=(r.gsel||[]).includes(it.id);return `<label class="gi${on?" on":""}"><input type="checkbox" data-rp="gi" data-id="${it.id}" ${on?"checked":""}>${esc(it.nome||it.letra)}</label>`}).join("")}<button type="button" class="gi tod" data-act="rom-gt">${(r.gsel||[]).length===g.itens.length?"nenhum":"todos"}</button>${btnQ("gi","＋ tamanho","Adiciona um tamanho novo (número ou letras) a esta variação")}<button type="button" class="gi tod" data-act="rom-pmg" data-i="${i}" title="Cria P, M e G">＋ P M G</button><button type="button" class="gi tod" data-act="rom-gpad" data-i="${i}" title="Guarda os tamanhos marcados como padrão desta categoria">★ padrão</button><input class="faixa" data-rp="faixa" placeholder="faixa: 12-16, 20" title="Digite uma faixa e aperte Enter: 12-16 marca de 12 a 16; 12, 18, 20 marca esses; todos marca tudo" aria-label="Faixa de tamanhos" autocomplete="off"><label class="sg" title="Peça única, sem tamanho"><input type="checkbox" data-rp="semg" ${r.semG?"checked":""}> sem tamanho</label></div></div>`:(cc?`<div class="rc-gh"><div class="gch"><button type="button" class="gi tod" data-act="rom-pmg" data-i="${i}" title="Cria tamanhos P, M e G para ${esc(r.cat)}">＋ Tamanhos P M G em ${esc(r.cat)}</button>${btnQ("gi","＋ tamanho","Cria tamanhos para esta categoria")}${libGradeSel('data-rp="gusar"')}</div></div>`:"");
  const chipsCrFull=cc?`<div class="rc-gh"><b title="Cor da pedra ou do detalhe (não é a cor do banho)">Cor da pedra</b><div class="gch">${lcor.map(x=>{const on=(r.csel||[]).includes(x.id);return `<label class="gi${on?" on":""}"><input type="checkbox" data-rp="cs" data-id="${esc(x.id)}" ${on?"checked":""}>${esc(x.nome)}</label>`}).join("")}${lcor.length?`<button type="button" class="gi tod" data-act="rom-ct">${(r.csel||[]).length===lcor.length?"nenhuma":"todas"}</button>`:""}${btnQ("cv","＋ cor","Cria uma cor de pedra nova para esta categoria")}${lcor.length?`<button type="button" class="gi tod" data-act="rom-cpad" data-i="${i}" title="Guarda as cores marcadas como padrão desta categoria">★ padrão</button>`:""}</div></div>`:"";
  const chipsCr=!cc?"":(r.corOn||(r.csel||[]).length||lcor.some(x=>!x.lib)||coresPadrao(r.cat,r.sub).length>0)?chipsCrFull:`<div class="rc-gh"><button type="button" class="gi tod" data-act="rom-cor-on" title="Pergunta a cor da pedra ou do detalhe nesta peça">＋ Cor da pedra</button></div>`;
  const szSel=g&&!r.semG?(r.gsel||[]):[],crSel=lcor.filter(x=>(r.csel||[]).includes(x.id)),matriz=szSel.length&&crSel.length;
  const tabMx=matriz?rc.map(c=>`<div class="qmxw"><b class="qmx-t">${bruta?dotc(c)+esc(c.nome):"Quantidade"}</b><label class="fq gq all" title="Mesma quantidade em todas as combinações"><span>todos</span><input class="n" data-rp="qall" data-b="${c.id}" placeholder="=" inputmode="numeric" aria-label="Quantidade para todas as combinações"></label><table class="qmx"><thead><tr><th></th>${crSel.map(x=>`<th>${esc(x.nome)}</th>`).join("")}</tr></thead><tbody>${szSel.map(id=>{const it=g.itens.find(y=>y.id===id);return `<tr><th>${esc(it?(it.nome||it.letra):"")}</th>${crSel.map(x=>`<td><input class="n" data-rp="q" data-b="${c.id}~${id}+c_${x.id}" value="${esc(r.q[c.id+"~"+id+"+c_"+x.id]??"")}" inputmode="numeric" placeholder="0" aria-label="Quantidade ${esc(it?(it.nome||it.letra):"")} ${esc(x.nome)}"></td>`).join("")}</tr>`}).join("")}</tbody></table></div>`).join(""):"";
  const tabVar=matriz?tabMx:ids.length?`<table class="szt"><thead><tr><th>Quantidade por ${g&&lcor.length?"tamanho · cor":(lcor.length&&!g?"cor":"tamanho")}</th>${ids.map(id=>`<th>${esc(romNomeId(r.cat,r.sub,id))}</th>`).join("")}<th>todos</th></tr></thead><tbody>${rc.map(c=>`<tr><th>${bruta?dotc(c)+esc(c.nome):"Qtd"}</th>${ids.map(id=>`<td><input class="n" data-rp="q" data-b="${c.id}~${id}" value="${esc(r.q[c.id+"~"+id]??"")}" inputmode="numeric" placeholder="0"></td>`).join("")}<td><input class="n" data-rp="qall" data-b="${c.id}" placeholder="=" inputmode="numeric" aria-label="Mesma quantidade em todos"></td></tr>`).join("")}</tbody></table>`:(g&&!r.semG?`<span class="hint">Escolha os tamanhos (ou as cores) acima para dividir a quantidade.</span>`:"");
  const grade=(g||cc)?`<div class="rc-gr">${chipsSz}${chipsCr}${tabVar}</div>`:"";
  return `<div class="rc${r.skip?" sk":""}${r.open?" op":""}" data-i="${i}">
    <div class="rc-vr"><span class="rc-pl">Vai receber</span><span class="rc-pc" data-px>—</span>${dupCod?`<span class="rch dup" title="Já existe peça com o código deste fornecedor na tabela">código já lançado</span>`:""}${((r.bh&&r.bh!==f.banhista)||(r.tipo&&r.tipo!==f.tipo))?`<span class="rch" title="Esta peça foge do lote (tipo e/ou galvânica próprios)">${esc(romTipo(r)==="bruta"?"Bruta":"Pronta")} · ${esc(romBh(r).nome)}</span>`:""}${romParteTag(r)}${r.extra?`<span class="rch extra" title="Peça criada aqui, fora da lista do fornecedor">＋ fora da lista</span>`:""}<span class="rch ins" data-rins-c hidden></span><span class="rsum">${r.extra?`<label class="fq rc-qx"><span>Quantidade</span><input class="n" data-rp="qtdx" value="${esc(String(r.qtd||""))}" inputmode="numeric" aria-label="Quantidade desta peça"></label>`:`<span class="hint">Na lista <b>${Number(r.qtd)||0}</b></span>`}<span class="soma n" data-soma></span><button type="button" class="x" data-act="rom-div" title="Dividir a quantidade igualmente entre os banhos">÷ dividir</button>${r.parteG||r.arq?"":`<button type="button" class="x" data-act="rom-partir" title="Partir este item em partes (ex.: um trio em 3 pares)">✂ partir</button>`}</span></div>
    <div class="rc-top"><label class="rsel" title="Selecionar para edição em lote"><input type="checkbox" data-rp="sel" ${r.sel?"checked":""}><span>selec.</span></label><label class="rsel" title="Criar esta peça"><input type="checkbox" data-rp="use" ${r.skip?"":"checked"} aria-label="Criar esta peça"><span>criar</span></label>${r.feito?romBadge(r)+(!r.arq?`<button type="button" class="btn sm danger" data-act="rom-revogar" title="Retirar da tabela os lançamentos desta peça, mantendo o item no romaneio">Revogar lançamento</button>`:""):""}
      ${r.foto?`<span class="rc-fw"><button type="button" class="rc-fb" data-act="rom-foto" title="Ampliar a foto"><img class="rc-ft" src="${fs(r.foto)}" alt="Foto da peça"></button><span class="rc-fa"><button type="button" class="x" data-act="rom-foto-add" data-i="${i}" title="Trocar a foto deste item (ou arraste/cole uma imagem sobre o cartão)">trocar</button><button type="button" class="x" data-act="rom-foto-del" data-i="${i}" title="Tirar a foto deste item">remover</button></span></span>`:`<button type="button" class="rc-fadd" data-act="rom-foto-add" data-i="${i}" title="Escolher uma foto deste item (ou arraste/cole uma imagem sobre o cartão)">📷<span>foto</span></button>`}
      ${fq("Código do fornecedor",`<input data-rp="cod" value="${esc(r.cod||"")}">`,"w-c")}
      ${fq("Descrição",`<input data-rp="desc" value="${esc(r.desc)}">`,"rc-desc")}
      ${fq(r.loteDe||r.parteG?"Categoria desta peça (define valor do banho)":"Categoria",`<select data-rp="cat" title="A categoria desta peça determina o valor por grama do banho">${opts(C.categorias.map(c=>c.nome),r.cat)}</select>`,"w-m")}<button type="button" class="x" data-act="rom-q" data-q="cat" data-i="${i}" title="Criar uma categoria nova agora" aria-label="Nova categoria">＋</button>
      ${fq("Subcategoria",`<select data-rp="sub">${opts(cc?cc.subs:[],r.sub,"—")}</select>`,"w-m")}<button type="button" class="x" data-act="rom-q" data-q="sub" data-i="${i}" title="Criar uma subcategoria nova agora" aria-label="Nova subcategoria">＋</button>
      ${!bruta?fq("Cor",`<select data-rp="cor">${opts(C.cores,r.cor||"","(padrão)")}</select>`,"w-s"):""}
      ${fq("Custo de Compra",`<input class="n" data-rp="custo" value="${esc(r.custo)}" inputmode="decimal">`,"w-c")}
      ${fq("Peso (g)",`<input class="n" data-rp="peso" value="${esc(r.peso)}" inputmode="decimal" placeholder="0,0">`,"w-n")}
      <button type="button" class="btn sm" data-act="rom-x">Detalhes ▾</button></div>
    ${r.aviso?`<div class="rc-av">${esc(r.aviso)}</div>`:""}
    <div class="rc-bn">${bruta?bh.banhos.map(banhoCard).join(""):(rc.length&&rc[0].id!=="p"?bh.banhos.map(banhoCard).join(""):prontaCard+`<details class="gdet"><summary><b>Banhos desta peça</b><span>opcional: marque para gerar uma linha por banho (ex.: A ouro, B prata)</span></summary><div class="gb rc-bn">${bh.banhos.map(banhoCard).join("")}</div></details>`)}</div>${grade}
    <div class="rc-b" data-body>${r.open?romBodyHTML(r):""}</div></div>`}
function romBodyHTML(r){const C=cfg(),f=S.form,bruta=romTipo(r)==="bruta",bh=romBh(r),fq=romFq;
  const exL=["E","A","B","C","D","K","Q","X","Y","Z","AA","AB","AC","AD","AE"],nEx=Object.keys(r.ex||{}).length;
  let h=`<div class="rc-r">${fq("Fornecedor desta peça",`<select data-rp="fornI"><option value="">igual ao lote (${esc(f.v.H||"—")})</option>${C.fornecedores.map(x=>`<option value="${esc(x.nome)}" ${r.forn===x.nome?"selected":""}>${esc(x.nome)}</option>`).join("")}</select>`,"w-m")}<button type="button" class="x" data-act="rom-q" data-q="forn" data-i="${ROM.rows.indexOf(r)}" title="Cadastrar um fornecedor novo agora e usar só nesta peça" aria-label="Novo fornecedor">＋</button>${fq("Desc. % desta peça",`<input class="n" data-rp="dscI" value="${esc(r.dsc??"")}" placeholder="${esc(f.desconto||"0")}" inputmode="decimal" title="Desconto só desta peça (vazio = o do fornecedor)">`,"w-c")}</div><div class="rc-r">${fq("Tipo desta peça",`<select data-rp="tipoI"><option value="">igual ao lote (${f.tipo==="bruta"?"Bruta":"Pronta"})</option><option value="bruta" ${r.tipo==="bruta"?"selected":""}>Bruta (vai banhar)</option><option value="pronta" ${r.tipo==="pronta"?"selected":""}>Pronta (já banhada)</option></select>`,"w-m")}${fq("Galvânica desta peça",`<select data-rp="bhI"><option value="">igual ao lote (${esc(banhistaBy(f.banhista).nome)})</option>${C.banhistas.map(b=>`<option value="${esc(b.id)}" ${r.bh===b.id?"selected":""}>${esc(b.nome)}</option>`).join("")}</select>`,"w-m")}</div><div class="rc-r">${fq("Observação só desta peça",`<input data-rp="obs1" value="${esc(r.obs||"")}" placeholder="(usa a observação de cima)">`,"w-l")}${(!bruta&&(romColsR(r)[0]||{}).id==="p"&&!romIds(r).length)?`<label class="vchk" title="Mesma peça em outra cor ou pedra: mesmo número, próxima letra"><input type="checkbox" data-rp="vinc" ${r.vinc?"checked":""}> Variação da anterior</label>`:""}</div>`;
  if(bruta||(romColsR(r)[0]||{}).id!=="p")h+=bh.banhos.filter(b=>romOn(r,b)).map(b=>{const bo=(r.bo||{})[b.id]||{},ai=(k,v)=>`data-auto="${k}:${b.id}" value="${esc(v??"")}" placeholder="—"`;
    return `<div class="rc-r bd"><span class="bd-t"><span class="dot d-${b.coluna}"></span>${esc(b.nome)} <small>${esc(b.letra)}</small></span>
      ${fq("Cor",`<select data-rp="bo" data-k="L" data-b="${b.id}">${opts(C.cores,bo.L||b.cor)}</select>`,"w-s")}
      ${fq("Milésimos",`<input class="n" data-rp="bo" data-k="O" data-b="${b.id}" value="${esc(bo.O??milDe(b,r.cat||f.v.I)??"")}" inputmode="decimal">`,"w-n")}
      ${!bruta?"":fq(b.modo==="fixo"?"R$ banho":"R$/g da peça",`<input class="n" data-rp="bo" data-k="_m" data-b="${b.id}" value="${esc(bo._m??"")}" placeholder="${esc(String(multDe(b,r.cat||f.v.I)||"").replace(".",","))}" inputmode="decimal" title="Valor do banho só desta peça (R$ por grama; ou valor fixo se o banho for assim). Vazio = o valor da categoria na galvânica">`,"w-n")}${!bruta?"":fq("Custo do banho R$",`<input class="n calc" data-rp="bo" data-k="C" data-b="${b.id}" ${ai("C",bo.C)} inputmode="decimal" title="Peso × valor por grama da galvânica ${esc(bh.nome)}. Digite para trocar só nesta peça; apague para voltar ao cálculo.">`,"w-c")}
      ${!bruta?"":fq("Custo do verniz R$",`<input class="n calc" data-rp="bo" data-k="U" data-b="${b.id}" ${ai("U",bo.U)} inputmode="decimal">`,"w-c")}
      ${fq("Descrição desta linha",`<input data-rp="bo" data-k="F" data-b="${b.id}" ${ai("F",bo.F)}>`,"w-l")}</div>`}).join("");
  h+=`<details class="gdet" ${nEx?"open":""}><summary><b>Todos os outros campos</b><span>${nEx} alterado(s) · referência manual, ID, foto, códigos, tamanho, localização, NCM, CFOP, impostos, catálogo, status…</span></summary><div class="gb"><div class="dgrid">${exL.map(L=>fq(esc(NOME[L])+(L==="E"?" (referência manual)":""),`<input data-rp="ex" data-k="${L}" value="${esc((r.ex||{})[L]??padraoDe(r.cat||f.v.I,L)??"")}" ${L==="E"?'placeholder="automática"':""}>`)).join("")}</div></div></details>`;
  return h}
function romUltHTML(){const C=cfg(),ps=[...new Set(ROM.rows.filter(r=>!r.skip).map(r=>prefDe(r.cat,r.sub)))];if(!ps.length)return "";
  return `<div class="rom-ult"><b>Numeração do sistema</b><span class="hint">última peça já cadastrada de cada tipo — é a partir dela que saem as próximas referências</span>${ps.map(p=>`<label class="fq ult${ultimo(p)>0?"":" bad"}"><span>Última peça ${esc(p)}</span><div class="ub"><input class="n" data-rp="ult" data-p="${esc(p)}" value="${esc(C.seqs[p]||"")}" inputmode="numeric"><small data-nx="${esc(p)}">próxima ${esc(p)}<b>${proxDe(p)}</b></small></div></label>`).join("")}</div>`}
let romT0=null;
const romAtualSoon=()=>{clearTimeout(romT0);romT0=setTimeout(romAtual,120);romSalvarSoon()};
function romAtual(){if(!ROM||!ROM.rows.length)return;renderNum();romExtrasAtual();const pv=romPreview(),f=S.form;
  let nl=0,var_=0,cus=0;
  ROM.rows.forEach((r,i)=>{if(r.lote)return;const rc=document.querySelector(`#romWrap .rc[data-i="${i}"]`);if(!rc)return;const cols=romColsR(r),sm=romSomaDe(r,cols),p=pv[i];
    const so=rc.querySelector("[data-soma]");so.textContent=`${sm}/${r.qtd}`;so.className="soma n "+(sm===r.qtd?"ok":"bad");
    rc.querySelector("[data-px]").innerHTML=romLinhasHTML(p,r,cols);
    if(p)p.rows.forEach(x=>{nl++;var_+=(x.v||0)*x.q;cus+=x.custo*x.q});
    const baseTxt=(id,x)=>{const sp=rc.querySelector(`[data-cbase="${CSS.escape(String(id))}"]`);if(!sp)return;if(!x||!(x.custo>0)){sp.textContent="";return}const mk=num((r.mk||{})[id])||num((f.mk||{})[id]),man=(r.bo&&r.bo[id]&&!vazio(r.bo[id].V))||(id==="p"&&!vazio(r.vp));const fat=man&&x.v!=null?Math.round(x.v/x.custo*100)/100:mk;sp.innerHTML=`Soma dos custos <b>R$ ${brl(x.custo)}</b>${fat?` × ${fmt(fat)}${man?" (do preço digitado)":""}`:""}${x.v!=null?` = <b>R$ ${brl(x.v)}</b>${man?"":" (sugestão; não salva como preço)"}`:""}`};
    const fill=(sel,v,k)=>rc.querySelectorAll(sel).forEach(e=>{if(e.tagName!=="INPUT"||document.activeElement===e)return;const bo=(r.bo||{})[e.dataset.b]||{},ov=e.dataset.rp==="vp"?r.vp:bo[k];if(!vazio(ov))return;e.value=v==null?"":(k==="F"?v:brl(v));e.classList.add("isauto")});
    if(p){if(romTipo(r)==="bruta"||(cols[0]&&cols[0].id!=="p"))cols.forEach(c=>{const x=p.rows.find(y=>y.bid===c.id);if(!x)return;{const sp=rc.querySelector(`[data-cb="${CSS.escape(String(c.id))}"]`);if(sp)sp.textContent=x.cb!=null?"banho R$ "+brl(x.cb):(num(r.peso)>0?"⚠ sem valor na galvânica":"⚠ informe o peso");const conta=rc.querySelector(`[data-cb-conta="${CSS.escape(String(c.id))}"]`);if(conta)conta.textContent=x.contaBanho||""}fill(`[data-auto="C:${c.id}"]`,x.cb,"C");fill(`[data-auto="U:${c.id}"]`,x.u,"U");fill(`[data-auto="V:${c.id}"]`,x.v,"V");fill(`[data-auto="F:${c.id}"]`,x.desc,"F");baseTxt(c.id,x)});
      else{const x=p.rows[0];if(x){fill('[data-auto="V:p"]',x.v,"V");baseTxt("p",x)}}}});
  const chk=document.getElementById("romChk");if(chk){const at=ROM.rows.filter(r=>!r.skip),sp=at.filter(r=>num(r.peso)==null).length,dv=at.filter(r=>romSomaDe(r,romColsR(r))!==r.qtd).length,dp=pv.filter(x=>x&&x.rows.some(y=>y.dup)).length,pt=[];
    if(sp)pt.push(`⚠ ${sp} sem peso`);if(dv)pt.push(`⚠ ${dv} com divisão diferente da lista`);if(dp)pt.push(`⚠ ${dp} com referência repetida`);
    const semTam=at.filter(r=>{const g=gradeDaCat(r.cat,r.sub);return g&&!r.semG&&!(r.gsel||[]).length&&!Array.isArray(r.conjComp)});if(semTam.length)pt.push(`⚠ ${semTam.length} sem tamanho (escolha o aro ou marque “sem tamanho”)`);ROM.rows.forEach((r,i)=>{const rc=document.querySelector(`#romWrap .rc[data-i="${i}"]`);if(rc)rc.classList.toggle("semtam",semTam.includes(r))});
    if(ROM.pdf||at.some(r=>r.foto)){const ft=at.filter(r=>r.foto).length;pt.push(`${ft===at.length?"✓":"⚠"} fotos ${ft}/${at.length}`)}
    if(!sp&&!dv&&!dp&&!semTam.length)pt.push("✓ pronto para criar");chk.textContent="Antes de criar: "+pt.join(" · ");chk.className="rom-c "+((sp||dv||dp||semTam.length)?"bad":"")}
  const tt=document.getElementById("romTot");if(tt)tt.textContent=nl?`${nl} linhas · Custo total ${fm(cus)} · Varejo estimado ${fm(var_)}${var_?` · Lucro ${fmt(Math.round((var_-cus)/var_*1000)/10)}%`:""}`:"";
  const b=document.getElementById("romCriar");if(b){const n=ROM.rows.filter(r=>!r.skip).length;b.textContent=`Criar ${n} peça${n===1?"":"s"}`;b.disabled=!n}}
const g3=n=>(Math.round((+n||0)*1000)/1000).toFixed(3).replace(".",",");
const romLoteKids=r=>ROM.rows.filter(x=>x.loteDe===r.lid);
function romLoteResumo(r){const kids=romLoteKids(r);let w=0,v=0;kids.forEach(x=>{const p=num(x.peso);if(p>0)w+=p;v+=r2c(num(x.custo)||0)});
  const dif=Math.round(((r.loteG||0)-w)*1000)/1000,tot=r.total!=null?r.total:(r.loteG||0)*(r.precoG||0);let cls,txt;
  if(!kids.length){cls="warn";txt="Nenhum item ainda: pese as peças e adicione cada uma abaixo."}
  else if(dif===0&&Math.round(v*100)!==Math.round(tot*100)){cls="warn";txt=`o peso fecha (${g3(w)} g), mas há diferença de R$ ${brl(Math.abs(r2c(v)-r2c(tot)))}: os itens somam R$ ${brl(v)} e o lote custou R$ ${brl(tot)}. Confira e ajuste os custos dos itens.`}
  else if(dif===0){cls="ok";txt=`✓ a soma bate: ${g3(w)} g de ${g3(r.loteG)} g`}
  else if(dif>0){cls="warn";txt=`faltam ${g3(dif)} g para fechar o lote (${g3(w)} g de ${g3(r.loteG)} g) — só um alerta${r.ratear!==false&&w>0?`: o valor do lote é rateado pelo peso informado (R$ ${String(Math.round(tot/w*10000)/10000).replace(".",",")}/g)`:""}`}
  else{cls="warn";txt=`os pesos informados somam ${g3(w)} g, ${g3(-dif)} g a mais que o peso do lote (${g3(r.loteG)} g) — só um alerta${r.ratear!==false?`: o valor do lote é rateado pelo peso informado (R$ ${String(Math.round(tot/w*10000)/10000).replace(".",",")}/g)`:""}`}
  return {cls,dif,txt:`${txt} · ${kids.length} item(ns) · valor dos itens R$ ${brl(v)} de R$ ${brl(tot)}`}}
function romLoteHTML(r,i){const R=romLoteResumo(r),tot=r.total!=null?r.total:(r.loteG||0)*(r.precoG||0);
  return `<div class="rc lote" data-i="${i}"><div class="lote-h"><b>Lote por peso · ${esc(r.cod||"")} ${esc(r.desc)}</b><span>${g3(r.loteG)} g × R$ ${String(Math.round((r.precoG||0)*10000)/10000).replace(".",",")}/g = <b>R$ ${brl(tot)}</b></span></div>
    <p class="hint">O fornecedor vendeu este lote por peso, sem separar as peças. Pese cada peça e adicione-a aqui: o custo de cada uma é o peso × o valor da grama, e depois entra o fator. Confira se a soma dos pesos fecha com o lote.</p>
    <label class="vchk"><input type="checkbox" data-rp="lotrat" ${r.ratear!==false?"checked":""}> Ratear o valor do lote (R$ ${brl(tot)}) pelo peso que eu informar em cada item</label>
    <div class="row"><label class="fq"><span>Quantos itens?</span><input class="n" data-lotn value="1" inputmode="numeric" style="width:64px"></label><button type="button" class="btn pri sm" data-act="lote-add" data-i="${i}">＋ Adicionar itens</button><button type="button" class="btn sm" data-act="lote-resto" data-i="${i}" title="Cria um item com o peso que falta para fechar o lote">＋ Item com o que falta</button></div>
    <div class="lote-sum ${R.cls}" data-lsum="${esc(r.lid)}" role="status">${esc(R.txt)}</div></div>`}
function romLoteAtualiza(lot){const el=document.querySelector(`#romWrap [data-lsum="${CSS.escape(lot.lid)}"]`);if(!el)return;const R=romLoteResumo(lot);el.className="lote-sum "+R.cls;el.textContent=R.txt}
/* o valor do lote é o que o fornecedor cobrou: ele é repartido pelo peso que você informou em cada item (centavos exatos), mesmo que a soma dos pesos difira do peso da lista */
function romLoteRecalc(lot){
  if(!lot)return;const kids=romLoteKids(lot),tot=lot.total!=null?lot.total:(lot.loteG||0)*(lot.precoG||0),ws=kids.map(k=>{const p=num(k.peso);return p>0?p:0}),W=ws.reduce((a,b)=>a+b,0);
  if(lot.ratear!==false&&W>0&&tot>0){const cents=Math.round(tot*100),raw=ws.map(w=>cents*w/W),base=raw.map(Math.floor);let rest=cents-base.reduce((a,b)=>a+b,0);
    raw.map((x,i)=>[x-Math.floor(x),i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(rest>0&&ws[i]>0){base[i]++;rest--}});
    kids.forEach((k,i)=>{k.custo=ws[i]>0?virg(base[i]/100):""})}
  else kids.forEach((k,i)=>{k.custo=ws[i]>0&&lot.precoG!=null?virg(ws[i]*lot.precoG):""});
  kids.forEach(k=>{const rc=document.querySelector(`#romWrap .rc[data-i="${ROM.rows.indexOf(k)}"]`),ci=rc&&rc.querySelector('[data-rp="custo"]');if(ci&&document.activeElement!==ci)ci.value=k.custo});
  romLoteAtualiza(lot)}
function romLotePeso(r,rc){const lot=ROM.rows.find(x=>x.lote&&x.lid===r.loteDe);if(lot)romLoteRecalc(lot);else{const w=num(r.peso);r.custo=w>0&&r.precoG!=null?virg(w*r.precoG):"";const ci=rc&&rc.querySelector('[data-rp="custo"]');if(ci)ci.value=r.custo}}
function romLoteAdd(r,n,peso){let pos=ROM.rows.indexOf(r);ROM.rows.forEach((x,j)=>{if(x.loteDe===r.lid)pos=j});const f=S.form,novos=[],k0=romLoteKids(r).length;
  for(let q=0;q<n;q++){const x={cod:(r.cod||"")+"-"+(k0+q+1),desc:r.desc||"",preco:r.precoG,precod:null,total:null,qtd:1,peso:peso!=null?g3(peso):"",q:{},skip:false,aviso:r.catq?"· categoria não reconhecida: confira":"",catq:!!r.catq,cat:r.cat||f.v.I||"",sub:r.sub||"",loteDe:r.lid,precoG:r.precoG,custo:peso!=null?virg(peso*r.precoG):""};
    x.mk={};x.bo={};x.on={};x.vz={};x.ex={};romNovaCat(x);novos.push(x)}
  ROM.rows.splice(pos+1,0,...novos);romLoteRecalc(r);romSalvarSoon();renderRom()}
/* ===== partir um item em partes (ex.: um trio em 3 pares): o custo do item é repartido (centavos exatos) e cada parte vira um cartão com cópia dos banhos/quantidades ===== */
const romPartes=r=>ROM.rows.filter(x=>x.parteG&&x.parteG===r.parteG);
function romPartir(r,n){n=Math.trunc(n);if(!(n>=2&&n<=12)){toast("Escolha de 2 a 12 partes.");return}
  if(Array.isArray(r.conjComp)){toast("Para dividir este item, desfaça o conjunto e configure os componentes de cada parte separadamente.");return}
  if(r.lote||r.parteG||r.arq){toast(r.arq?"Restaure a tabela salva antes de dividir esta peça.":"Este item já é uma parte ou um lote: use “juntar” antes de partir de novo.");return}
  if(num(r.peso)>0&&Math.round(num(r.peso)*1000)<n){toast("O peso é pequeno demais para dividir em partes de 0,001 g.");return}
  const c=num(r.custo),cents=c!=null&&c>=0?Math.round(c*100):null,base=cents!=null?Math.floor(cents/n):null,extra=cents!=null?cents-base*n:0,gid=uid(),pos=ROM.rows.indexOf(r),novos=[];
  r.parteG=gid;r.parteN=n;r.parteK=1;r.parteCusto0=r.custo;r.parteCod0=r.cod;r.parteDesc0=r.desc;r.partePeso0=r.peso;r.parteRefaz0=!!r.refaz;r.parteSkip0=!!r.skip;if(r.feito){r.refaz=true;r.skip=false}
  for(let k=2;k<=n;k++){const x=clone(r);x.lancIds=undefined;x.feito=false;x.refaz=false;x.sel=false;x.open=false;x.bo={};x.vp="";x.parteK=k;novos.push(x)}
  const mg=num(r.partePeso0)>0?Math.round(num(r.partePeso0)*1000):null;
  [r,...novos].forEach((x,i)=>{const k=i+1;x.parteK=k;x.cod=(r.parteCod0||"")+"-"+k;x.desc=(r.parteDesc0||"")+" ("+k+"/"+n+")";if(mg!=null)x.peso=g3((Math.floor(mg/n)+(i<mg%n?1:0))/1000);if(cents!=null)x.custo=virg((base+(k<=extra?1:0))/100)});
  ROM.rows.splice(pos+1,0,...novos);romSalvarSoon();renderRom();toast(`Item dividido em ${n} partes: o custo foi repartido (${n} × quantidade da lista).`)}
function romJuntar(r){const ps=romPartes(r);if(ps.some(x=>x.feito&&!(x.parteK===1&&x.refaz))){toast("Uma das partes já foi lançada. Revogue as partes novas antes de juntar.");return}
  const p1=ps.find(x=>x.parteK===1)||ps[0];p1.custo=p1.parteCusto0;p1.peso=p1.partePeso0;p1.cod=p1.parteCod0;p1.desc=p1.parteDesc0;if(p1.feito){p1.refaz=!!p1.parteRefaz0;p1.skip=!!p1.parteSkip0;p1.aviso=p1.skip?"· já lançada":""}["parteG","parteN","parteK","parteCusto0","parteCod0","parteDesc0","partePeso0","parteRefaz0","parteSkip0"].forEach(k=>{delete p1[k]});
  ROM.rows=ROM.rows.filter(x=>!(ps.includes(x)&&x!==p1));romSalvarSoon();renderRom()}
function romParteTag(r){if(!r.parteG)return "";const ps=romPartes(r),s=ps.reduce((t,x)=>t+(num(x.custo)||0),0),o=num(r.parteCusto0);
  return `<span class="rch" title="Item partido: o custo do item foi repartido entre as partes (edite o custo de cada uma se quiser)">Parte ${r.parteK}/${r.parteN} · partes somam R$ ${brl(s)}${o!=null?" de R$ "+brl(o):""} <button type="button" class="x" data-act="rom-juntar" title="Desfazer a divisão e voltar a um só item">juntar</button></span>`}
function romLoteDecora(){if(!ROM)return;const cs=document.querySelectorAll("#romWrap .rc[data-i]");cs.forEach(c=>{const r=ROM.rows[+c.dataset.i];if(!r||!r.loteDe||c.querySelector(".lote-tag"))return;const lot=ROM.rows.find(x=>x.lote&&x.lid===r.loteDe);
  c.insertAdjacentHTML("afterbegin",`<div class="lote-tag"><span>Item do lote ${esc(lot?lot.cod:"")} · ${lot&&lot.ratear!==false?"valor do lote rateado pelo peso":"custo = peso × R$ "+String(Math.round((r.precoG||0)*10000)/10000).replace(".",",")+"/g"}</span><button type="button" class="x" data-act="lote-del" data-i="${c.dataset.i}" aria-label="Remover este item do lote">×</button></div>`)})}
function romNovaCat(r){const g=gradeDaCat(r.cat,r.sub);r.gsel=g&&g.faixa?selFaixa(g,g.faixa):[];r.csel=coresPadrao(r.cat,r.sub);r.semG=false;r.open=false;r.q={};if(!romIds(r).length&&!g&&romTipo(r)!=="bruta")r.q.p=String(r.qtd)}
/* Conserva quantidades compatíveis ao trocar categoria de uma parte; exige confirmação para descartar distribuições incompatíveis. */
function romTrocarCategoria(r,cat,sub){if(r.cat===cat&&(r.sub||"")===(sub||""))return true;
  const oldq=clone(r.q||{}),novo={...clone(r),cat,sub:sub||""};
  if(romTemVar(r.cat,r.sub)||romTemVar(novo.cat,novo.sub)){romNovaCat(novo);
    const valid=new Set(romKeys(novo,romColsR(novo))),incomp=Object.keys(oldq).filter(k=>!valid.has(k)&&!vazio(oldq[k])&&(num(oldq[k])||0)>0);
    if(incomp.length&&!confirm("A nova categoria tem variações diferentes. As quantidades incompatíveis serão removidas; confira a distribuição após trocar. Continuar?"))return false;
    Object.entries(oldq).forEach(([k,v])=>{if(valid.has(k))novo.q[k]=v});
    r.gsel=novo.gsel;r.csel=novo.csel;r.semG=novo.semG;r.q=novo.q;r.open=novo.open}
  r.cat=novo.cat;r.sub=novo.sub;return true}
const ROM_PAPEIS=[["cod","Código"],["desc","Descrição"],["qtd","Quantidade"],["preco","Valor unitário"],["total","Valor total"]];
const ROM_SIN={cod:/c[oó]d|ref|sku|^item$|^id$/i,desc:/descri|produto|nome|mercadoria|artigo/i,qtd:/qtd|quant|^qt$|^un/i,preco:/unit|pre[cç]o|vlr un|valor un|^valor$/i,total:/total|subtotal/i};
/* texto de arquivo: UTF-8 (com ou sem BOM); se não for UTF-8 válido, Windows-1252 */
function decTexto(buf){try{return new TextDecoder("utf-8",{fatal:true}).decode(buf)}catch(e){return new TextDecoder("windows-1252").decode(buf)}}
async function romPlanilha(file){if(!(await impPrepara(file)))return;return romPlanilha0(file)}
async function romPlanilha0(file){try{checaTam(file,MAX_PLANILHA_BYTES,"A planilha");if(typeof XLSX==="undefined")throw new Error("A biblioteca de planilha não carregou.");
  const buf=await file.arrayBuffer(),ehCsv=/\.(csv|txt)$/i.test(file.name||""),wb=ehCsv?XLSX.read(decTexto(buf),{type:"string",raw:true}):XLSX.read(buf,{type:"array"}),ws=wb.Sheets[wb.SheetNames[0]];checaLinhasPlan(ws);const aoa=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:""});   /* raw:true: número formatado (1.000 / 1,234) vem como número, não como texto */
  if(aoa.length>MAX_PLANILHA_LINHAS)throw new Error(`A planilha tem ${aoa.length} linhas e o limite é ${MAX_PLANILHA_LINHAS}.`);
  let hi=0,best=-1;for(let i=0;i<Math.min(15,aoa.length);i++){let n=0;aoa[i].forEach(c=>{if(Object.values(ROM_SIN).some(rx=>rx.test(String(c))))n++});if(n>best){best=n;hi=i}}
  const head=(aoa[hi]||[]).map((c,j)=>String(c||"").trim()||("Coluna "+(j+1))),map={};
  const dados=aoa.slice(hi+1);   /* só sugere coluna que tem dado: coluna vazia (ex.: ID em branco) não preenche nada */
  Object.entries(ROM_SIN).forEach(([k,rx])=>{const j=head.findIndex((h,q)=>rx.test(h)&&!Object.values(map).includes(q)&&dados.some(r=>String(r[q]==null?"":r[q]).trim()!==""));if(j>=0)map[k]=j});
  ROM.doc=file.name;ROM.hash=IMPH.get(file)||"";ROM.plan={nome:file.name,head,rows:aoa.slice(hi+1).filter(r=>r.some(c=>String(c).trim()!=="")),map};ROM.msg="";renderRom()}catch(e){ROM.msg=e.message||"Não consegui ler a planilha.";renderRom()}}
function romPlanHTML(){const P=ROM&&ROM.plan;if(!P)return "";
  const sel=(k,n)=>`<label class="fq w-m"><span>${n}</span><select data-rp="planmap" data-k="${k}"><option value="">— não tem —</option>${P.head.map((h,j)=>`<option value="${j}" ${P.map[k]===j?"selected":""}>${letraN(j)} · ${esc(h)}</option>`).join("")}</select></label>`;
  const cel=(r,k)=>P.map[k]==null?"":String(r[P.map[k]]==null?"":r[P.map[k]]);
  return `<div class="cpanel"><b>Planilha “${esc(P.nome)}”</b><span class="hint">${P.rows.length} linhas. Confira qual coluna é cada informação (o app já tentou adivinhar):</span><div class="row">${ROM_PAPEIS.map(([k,n])=>sel(k,n)).join("")}</div>
    <div class="prevg">${P.rows.slice(0,4).map(r=>`<div><small>${esc(cel(r,"cod")||"sem código")} · ${esc(cel(r,"qtd")||"?")} un · ${esc(cel(r,"preco")||"sem valor")}</small><b>${esc(cel(r,"desc")||"(sem descrição)")}</b></div>`).join("")}</div>
    <div class="row"><button type="button" class="btn pri sm" data-act="rom-plan-ok" ${P.map.desc==null?"disabled":""}>Usar estas colunas</button><button type="button" class="btn ghost sm" data-act="rom-plan-no">Cancelar</button></div></div>`}
let romUI={ex:false,txt:"",nome:""};
function romExInfo(){const C=cfg(),tx=String(romUI.txt||"");if(!tx.trim())return {html:`<span class="hint">Cole aqui uma lista de exemplo do cliente (texto de um PDF, e-mail ou planilha copiada). Eu mostro como o app entende cada linha.</span>`,ok:false};
  const R=lerRomaneioAuto(tx,clone(C.romaneios[0]));if(R.erro||!R.rows.length)return {html:`<span class="warn">Não reconheci nenhuma peça. Confira se copiou a tabela inteira, com código, quantidade e valores. Se for uma planilha, use o botão “Importar planilha” no romaneio, que deixa você escolher as colunas.</span>`,ok:false};
  return {html:`<b>Reconheci ${R.rows.length} peça(s)</b>${R.conf?` <small>· ${esc(R.conf)}</small>`:""}<div class="prevg">${R.rows.slice(0,6).map(r=>`<div><small>${esc(r.cod||"sem código")} · ${esc(String(r.qtd??"?"))} un · ${esc(String(r.precod??r.preco??"sem valor"))}</small><b>${esc(String(r.desc||"").slice(0,70))}</b></div>`).join("")}</div>${R.rows.some(r=>!r.cod)?`<span class="warn">Algumas linhas ficaram sem código — o app só dá “já lançada” e evita repetição quando há código.</span>`:""}`,ok:true,R}}
function romExAtualiza(){const p=document.getElementById("romExPrev"),b=document.getElementById("romExOk");if(!p)return;const r=romExInfo();p.innerHTML=r.html;if(b)b.disabled=!r.ok}
let romBusy=false;
function romCampo(t,fin){if(!ROM)return;if(t.dataset.rp==="planmap"){if(ROM.plan){ROM.plan.map[t.dataset.k]=t.value===""?null:+t.value;renderRom()}return}const k=t.dataset.rp;if(!k)return;const f=S.form;romSalvarSoon();
  if(k==="texto"){ROM.texto=t.value;return}
  if(k==="obs"){ROM.obs=t.value;romAtualSoon();return}
  if(k==="rins"){romInsCampo(t,fin);return}
  if(k==="lotrat"){const rc=t.closest(".rc"),lot=rc&&ROM.rows[+rc.dataset.i];if(lot&&lot.lote){lot.ratear=t.checked;romLoteRecalc(lot);romAtualSoon()}return}
  if(k==="qtdx"){const rc=t.closest(".rc"),r=rc&&ROM.rows[+rc.dataset.i];if(r&&r.extra){const n=Math.trunc(num(t.value)||0);r.qtd=Math.max(0,Math.min(1e6,n));romAtualSoon()}return}
  if(k==="tid"){ROM.tid=t.value;abertos.romT=t.value;guardarAbertos();ROM.msg="Modelo trocado: clique em Ler lista para reler com ele.";const T=romT();if(T&&T.forn&&fornBy(T.forn))romSetForn(T.forn);renderRom();return}
  if(k==="forn"){const t0=S.form.tipo;romSetForn(t.value);if(S.form.tipo!==t0)ROM.rows.forEach(r=>{if(r.feito)return;r.q={};romNovaCat(r)});renderRom();return}
  if(k==="bh"){trocarBanhista(f,t.value);salvar(false);renderForm();ROM.rows.forEach(r=>{if(r.feito)return;r.on={};r.bo={};r.vz={};r.mk={}});renderRom();return}
  if(k==="bn"){(f.tipo==="bruta"?f.on:(f.onP=f.onP||{}))[t.dataset.b]=t.checked;salvar(false);renderForm();renderRom();return}
  if(k==="ult"){const pf=t.dataset.p;cfg().seqs[pf]=limpaUlt(t.value);salvar(true,false);renderTopo();document.querySelectorAll(`#romWrap [data-nx="${pf}"] b`).forEach(b=>b.textContent=proxDe(pf));const lb=t.closest("label");if(lb)lb.classList.toggle("bad",!(ultimo(pf)>0));romAtualSoon();return}
  if(k==="rb"){ROM.bulk=ROM.bulk||{mk:{}};const kk=t.dataset.k;
    if(kk==="selmode"){romSelecionar(t.value);t.value="";return}
    if(kk==="mk"){ROM.bulk.mk=ROM.bulk.mk||{};ROM.bulk.mk[t.dataset.b]=t.value;return}
    ROM.bulk[kk]=t.value;if(kk==="cat"){ROM.bulk.sub="";const ss=document.querySelector("#romWrap [data-rp=rb][data-k=sub]"),cc=catBy(t.value);if(ss)ss.innerHTML=opts(cc?cc.subs:[],"","(manter)")}return}
  if(k==="mkg"){f.mk=f.mk||{};const bm=t.dataset.b;if(vazio(t.value))delete f.mk[bm];else f.mk[bm]=t.value;salvar(false);document.querySelectorAll(`#romWrap [data-rp=mk][data-b="${bm}"]`).forEach(e=>{const rr=ROM.rows[+e.closest(".rc").dataset.i];if(rr&&!(rr.mk&&rr.mk[bm]!==undefined))e.value=t.value});romAtualSoon();return}
  const rc=t.closest(".rc");if(!rc)return;const i=+rc.dataset.i,r=ROM.rows[i];if(!r)return;const estadoAntes={skip:r.skip,refaz:r.refaz,aviso:r.aviso};
  if(k!=="sel"&&k!=="use"){if(r.feito&&r.arq){if(fin)toast("Esta peça está na tabela salva “"+r.arq+"”. Restaure a tabela para corrigir.");return}
    if(romArma(r)){rc.classList.remove("sk");const u=rc.querySelector('[data-rp="use"]');if(u)u.checked=true;const bd=rc.querySelector(".rfeito");if(bd)bd.outerHTML=romBadge(r);if(fin)toast("Peça já lançada: ao criar ela é substituída, na mesma posição e com a mesma referência.")}}
  if(k==="qall"){const v=t.value;if(!vazio(v)){const n=num(v);if(n==null||n<0||!Number.isInteger(n)){if(fin)toast("Quantidade precisa ser um número inteiro, 0 ou mais.");return}}if(!fin||romBusy)return;romBusy=true;try{romKeys(r,[{id:t.dataset.b}]).forEach(kk=>{r.q[kk]=vazio(v)?"":String(num(v))});renderRom()}finally{romBusy=false}return}
  if(k==="gusar"){if(!fin)return;const c=catBy(r.cat),v=t.value;if(c&&v&&!c.grade){romArma(r);if(v.startsWith("o:")){const og=(cfg().grades||[]).find(x=>x.id===v.slice(2));if(og)c.grade={id:uid(),nome:og.nome,subs:[],usaId:og.id,itens:[]}}else{const src=catBy(v.slice(2));if(src&&src.grade){const o=src.grade.usa?(catBy(src.grade.usa)||src):src;c.grade={id:uid(),nome:o.grade.nome,subs:[],usa:o.nome,itens:[]}}}salvar(true,false);renderRom()}return}
  if(k==="faixa"){if(!fin||romBusy)return;romBusy=true;try{const g0=gradeDaCat(r.cat,r.sub);if(g0){r.gsel=selFaixa(g0,t.value);r.semG=false}renderRom()}finally{romBusy=false}return}
  if(k==="dscI"){const n=num(t.value);if(!vazio(t.value)&&(n==null||n<0||n>100)){if(fin)toast("Desconto precisa estar entre 0 e 100%.");return}r.dsc=t.value;romAtualSoon();return}
  if(k==="fornI"||k==="tipoI"||k==="bhI"){const temAj=x=>Object.keys(x.q||{}).some(z=>z!=="p"&&!vazio(x.q[z]))||(x.q&&x.q.p!==undefined&&String(x.q.p).trim()!==String(x.qtd).trim())||["bo","mk","vz"].some(z=>Object.keys(x[z]||{}).length>0);
    if(temAj(r)&&!confirm("Trocar isto apaga as quantidades distribuídas e os ajustes desta peça (fatores, preços, banhos). Continuar?")){renderRom();return}}
  if(k==="fornI"){r.forn=t.value||undefined;romReset(r);renderRom();return}
  if(k==="tipoI"||k==="bhI"){if(k==="tipoI")r.tipo=t.value||undefined;else r.bh=t.value||undefined;romReset(r);renderRom();return}
  if(k==="sel"){r.sel=t.checked;romSelN();return}
  if(k==="use"){if(r.feito&&r.arq){t.checked=false;toast("Esta peça está na tabela salva “"+r.arq+"”. Restaure a tabela para corrigir.");return}r.skip=!t.checked;if(r.feito){r.refaz=!r.skip;r.aviso=r.skip?"· já lançada":"";renderRom();return}rc.classList.toggle("sk",r.skip);romAtualSoon();return}
  if(k==="desc"){r.desc=t.value;return}
  if(k==="cod"){r.cod=t.value;return}
  if(!vazio(t.value)){   /* sem texto, sem negativo; quantidade inteira >= 0; multiplicador >= 0 */
    let m="";const col={custo:"P",peso:"N",vp:"V"}[k];
    if(col)m=checaCel(col,t.value).erro||"";
    else if(k==="q"){const n=num(t.value);if(n==null||n<0||!Number.isInteger(n))m="Quantidade precisa ser um número inteiro, 0 ou mais."}
    else if(k==="mk"){const n=num(t.value);if(n==null||n<0)m="Multiplicador precisa ser um número maior ou igual a 0."}
    else if(k==="bo"&&["C","U","V","O","_m"].includes(t.dataset.k)){const n=num(t.value);if(n==null||n<0)m="Digite um número maior ou igual a 0."}
    if(m){t.classList.add("bad");t.style.outline="2px solid #c0392b";if(fin)toast(m+" (não gravado)");return}
    t.classList.remove("bad");t.style.outline=""}
  if(k==="custo")r.custo=t.value;else if(k==="peso"){r.peso=t.value;if(r.loteDe)romLotePeso(r,rc)}else if(k==="cor")r.cor=t.value;else if(k==="vp")r.vp=t.value;else if(k==="obs1")r.obs=t.value;
  else if(k==="cat"){if(!romTrocarCategoria(r,t.value,"")){Object.assign(r,estadoAntes);renderRom();return}r.catq=false;r.aviso=String(r.aviso||"").replace("· categoria não reconhecida: confira","").trim();renderRom();return}
  else if(k==="sub"){if(!romTrocarCategoria(r,r.cat,t.value))Object.assign(r,estadoAntes);renderRom();return}
  else if(k==="vinc"){r.vinc=t.checked}
  else if(k==="semg"){r.semG=t.checked;if(t.checked)r.gsel=[];renderRom();return}
  else if(k==="cs"){const id=t.dataset.id;r.csel=(r.csel||[]).filter(x=>x!==id);if(t.checked)r.csel.push(id);r.csel=coresDaCat(r.cat,r.sub).map(x=>x.id).filter(x=>r.csel.includes(x));renderRom();return}
  else if(k==="gi"){const id=t.dataset.id;r.gsel=(r.gsel||[]).filter(x=>x!==id);if(t.checked)r.gsel.push(id);const g=gradeDaCat(r.cat,r.sub);if(g)r.gsel=g.itens.map(x=>x.id).filter(x=>r.gsel.includes(x));renderRom();return}
  else if(k==="bon"){r.on=r.on||{};r.on[t.dataset.b]=t.checked;renderRom();return}
  else if(k==="vz"){r.vz=r.vz||{};r.vz[t.dataset.b]=t.checked}
  else if(k==="mk"){r.mk=r.mk||{};if(vazio(t.value)||String(t.value)===String((f.mk||{})[t.dataset.b]??""))delete r.mk[t.dataset.b];else r.mk[t.dataset.b]=t.value;
    /* mudou o fator: o Preço de Varejo digitado à mão volta a ser calculado */
    {const b=t.dataset.b;if(b==="p")r.vp="";else if(r.bo&&r.bo[b])delete r.bo[b].V;const vi=t.closest(".bf")&&t.closest(".bf").querySelector('[data-auto^="V:"]');if(vi){vi.value="";vi.classList.add("isauto")}}}
  else if(k==="bo"){r.bo=r.bo||{};const b=t.dataset.b,kk=t.dataset.k,o=r.bo[b]=r.bo[b]||{},bb=banhistaBy(f.banhista).banhos.find(x=>x.id===b)||{},def=kk==="L"?bb.cor:kk==="O"?milDe(bb,r.cat||f.v.I):null;
    if(vazio(t.value)||(def!=null&&String(t.value)===String(def)))delete o[kk];else o[kk]=t.value;t.classList.toggle("isauto",!o[kk]&&"CUVF".includes(kk))}
  else if(k==="ex"){r.ex=r.ex||{};const L=t.dataset.k,d=padraoDe(r.cat||f.v.I,L);if(vazio(t.value)||String(t.value)===String(d??""))delete r.ex[L];else r.ex[L]=t.value}
  else if(k==="exk"){r._k=t.value;return}
  else if(k==="exv"){r._v=t.value;return}
  else if(k==="q"){r.q[t.dataset.b]=t.value}
  if(fin&&!vazio(t.value)&&(k==="vp"||(k==="bo"&&t.dataset.k==="V"))){const rc2=t.closest(".rc");if(rc2)romFatorDoPreco(r,k==="vp"?"p":t.dataset.b,rc2)}
  romAtualSoon()}
/* digitou o Preço de Varejo no cartão: o Fator × passa a ser o que dá esse preço (preço ÷ soma dos custos), como no formulário */
function romFatorDoPreco(r,id,rc){const p=romPreview()[ROM.rows.indexOf(r)];if(!p)return;const x=id==="p"?p.rows[0]:p.rows.find(y=>y.bid===id);
  if(!x||!(x.custo>0)){toast("Para o fator ser calculado, informe antes o peso e os custos.");return}
  const alvo=num(id==="p"?r.vp:((r.bo||{})[id]||{}).V);if(alvo==null||alvo<0)return;
  const fator=String(Math.round(alvo/x.custo*10000)/10000).replace(".",",");r.mk=r.mk||{};r.mk[id]=fator;
  const inp=rc.querySelector(`[data-rp="mk"][data-b="${CSS.escape(String(id))}"]`);if(inp)inp.value=fator}
function romLer(){if(ROM&&String(ROM.texto||"").length>MAX_TEXTO_COLADO){ROM.msg=`O texto tem ${String(ROM.texto).length} caracteres e o limite é ${MAX_TEXTO_COLADO}. Cole em partes.`;renderRom();return}if(ROM&&ROM.pdf&&ROM.texto!==ROM.pdf.texto)ROM.pdf=null;let f=S.form,T=romT(),R=lerRomaneioAuto(ROM.texto,T);
  {const pts=r=>r.erro?-1e9:romScore(r)+(/✓ valor/.test(r.conf||"")?1000:0);let bp=pts(R);for(const T2 of cfg().romaneios){if(T2.id===T.id)continue;const R2=lerRomaneioAuto(ROM.texto,T2),p2=pts(R2);if(p2>bp){bp=p2;ROM.tid=T2.id;T=T2;R=R2}}}
  if(R.erro){const tinha=ROM.rows&&ROM.rows.length;ROM.rows=[];ROM.pdf=null;ROM.conf="";ROM.msg=R.erro+(tinha?" Os cartões da leitura anterior foram removidos.":"");romSalvarSoon();renderRom();return}
  romAplicaR(R)}
function romAplicaR(R){const f=S.form,T=romT();
  {const vi=new Set();R.rows.forEach(r=>{if(!r.cod)return;const k=r.cod+"|"+r.qtd;if(vi.has(k)){r.skip=true;r.aviso=(r.aviso?r.aviso+" ":"")+"· linha repetida na lista — desmarcada"}else vi.add(k)})}
  R.rows.forEach(r=>{const mc=String(mapaCat(r.desc,T)||"").split(">");r.cat=mc[0]||f.v.I||"";if(!mc[0]){r.catq=true;r.aviso=(r.aviso?r.aviso+" ":"")+"· categoria não reconhecida: confira"}r.sub=(mc[1]||"").trim();const cc=catBy(r.cat);if(r.sub&&!(cc&&cc.subs.includes(r.sub)))r.sub="";
    const c=T.custo==="preco"?(r.preco??r.precod):(r.precod??r.preco);r.custo=virg(c!=null?c:(r.total!=null&&r.qtd?r.total/r.qtd:null));
    r.mk={};r.bo={};r.on={};r.vz={};r.ex={};romNovaCat(r);
    if(r.cod&&S.lanc.some(l=>String(l.v.G||"")===r.cod&&(l.v.H||"")===(f.v.H||""))){r.skip=true;r.aviso="· já lançada"}
    else if(r.cod){const tb=TABS.find(t=>(t.cods||[]).includes(chaveCod(f.v.H,r.cod)));if(tb){r.skip=true;r.arq=tb.nome;r.aviso="· já lançada na tabela salva “"+tb.nome+"” — desmarcada"}}});
  if(ROM.pdf)romFotos(R.rows);
  {const vel={},n1={},n2={};(ROM.rows||[]).forEach(o=>{if(o.cod){n1[o.cod]=(n1[o.cod]||0)+1;vel[o.cod+"|"+n1[o.cod]]=o}});let mant=0;R.rows.forEach(r=>{if(r.cod)n2[r.cod]=(n2[r.cod]||0)+1;const o=r.cod&&vel[r.cod+"|"+n2[r.cod]];if(!o)return;mant++;["peso","desc","cat","sub","custo","q","gsel","mk","bo","on","vz","ex","obs","vp","cor","sel","open","catq"].forEach(k=>{if(o[k]!==undefined)r[k]=o[k]})});R._mant=mant}
  {const kids=(ROM.rows||[]).filter(x=>x.loteDe);if(kids.length){const old={};(ROM.rows||[]).forEach(x=>{if(x.lote&&x.cod)old[x.cod]=x});const out=[];R.rows.forEach(x=>{out.push(x);if(x.lote&&old[x.cod]){x.lid=old[x.cod].lid;kids.filter(k=>k.loteDe===x.lid).forEach(k=>out.push(k))}});R.rows=out}}
  {const ex=(ROM.rows||[]).filter(x=>x.extra);if(ex.length)R.rows=R.rows.concat(ex)}   /* peças criadas à mão no romaneio sobrevivem a uma nova leitura da lista */
  ROM.rows=R.rows;ROM.obs=R.obs||ROM.obs||"";ROM.conf=R.conf;ROM.msg=`${R.rows.length} peças lidas${R._mant?` · ${R._mant} com as suas edições mantidas`:""}`;romSalvarSoon();renderRom();{const pe=[...document.querySelectorAll('#romWrap [data-rp=peso]')].find(x=>!x.value);if(pe)pe.focus({preventScroll:true})}}
function romDividir(r,cols){const ks=romKeys(r,cols),n=ks.length;if(!n)return;const base=Math.floor(r.qtd/n);let resto=r.qtd-base*n;ks.forEach(k=>{r.q[k]=String(base+(resto-->0?1:0))})}
