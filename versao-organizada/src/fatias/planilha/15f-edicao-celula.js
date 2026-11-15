/* ---- edição de célula ---- */
function abrirCel(ri,L,cursorFim){
  if(!document.querySelector(`#sheet tr[data-ri="${ri}"] td[data-c="${L}"]`))return;
  if(celEd)fecharCel(true);
  const td2=document.querySelector(`#sheet tr[data-ri="${ri}"] td[data-c="${L}"]`);if(!td2)return;
  const row=G.linhas[ri];
  document.getElementById("dl-cel").innerHTML=listaDe(L,row?row.v.I:S.form.v.I).map(o=>`<option value="${esc(o)}">`).join("");
  const formulaVazia=row&&row.banho&&FORMULA.has(L)&&!row.ovs.includes(L);
  /* célula calculada (custo do banho, verniz…): o campo abre com o VALOR atual (não vazio); se você não mudar nada, nada é gravado */
  const calc=formulaVazia?calcBanho(row,L,ri+2):null,calcTxt=calc&&typeof calc.v==="number"?r2c(calc.v).toFixed(2).replace(".",","):"";
  const raw=!row?"":formulaVazia?calcTxt:(row.v[L]??"");celEd={ri,L,orig:String(raw),nova:!row,setas:!!cursorFim};
  const ph=formulaVazia?(calc?(calc.f?"="+calc.f:String(calc.v)):"(vazio)"):(!row?"digite ou cole (Ctrl+V)":"");
  estadoPlanilha.selR={ar:ri,ac:LET.indexOf(L),fr:ri,fc:LET.indexOf(L)};w=td2.offsetWidth;td2.classList.add("ed");
  td2.innerHTML=`<input id="celIn" value="${esc(raw)}" list="dl-cel" ${NUM.has(L)?'class="n"':""} placeholder="${esc(ph)}" title="${esc(formulaVazia&&calc&&calc.f?"Calculado: ="+calc.f+" — digite um valor para substituir":"")}" aria-label="${esc(NOME[L])}" autocomplete="off">`;
  const i=document.getElementById("celIn");i.style.width=w+"px";i.focus({preventScroll:true});try{td2.scrollIntoView({block:"nearest",inline:"nearest"})}catch(x){}if(cursorFim){const n=i.value.length;try{i.setSelectionRange(n,n)}catch(x){}}else i.select();
}
let w=150;
/* linha colada ou digitada direto na tabela: vira uma peça pronta com os valores dados */
function gravarCel(ri,L,valor){
  const row=G.linhas[ri],l=row&&S.lanc.find(x=>x.id===row.lancId);if(!l)return;
  l.ov=l.ov||{};const o=l.ov[row.key]=l.ov[row.key]||{};
  if(L==="E")valor=String(valor).replace(/\s+/g,"").toUpperCase();   /* referência digitada à mão: sem espaços e em maiúsculas */
  const base=row.banho&&FORMULA.has(L)?"":String(row.v0[L]??"");
  if(String(valor)===base)delete o[L];else o[L]=valor;
  if(!Object.keys(o).length)delete l.ov[row.key];
  if(editId===l.id)sincFormCelula(l.id,L,row.key);   /* colar/limpar/preencher em massa numa peça aberta no formulário: o formulário recebe o valor (senão Salvar desfaz) */
}
/* célula editada na tabela de uma peça que está aberta no formulário: o formulário recebe o valor novo (senão "Salvar" apagaria a edição) */
function sincFormCelula(id,L,key){
  if(editId!==id)return;const l=S.lanc.find(x=>x.id===id);if(!l)return;
  const f2=clone(l),G0=G;try{G=gerar()}catch(e){}   /* linhas recalculadas com o valor novo (as de G são de antes da edição) */
  try{dobrarOv(f2,id)}finally{G=G0}const f=S.form;f.v=f.v||{};f.ov=f.ov||{};
  if(vazio(f2.v[L]))delete f.v[L];else f.v[L]=f2.v[L];
  const dobrou=!vazio(f2.v[L])&&f2.v[L]!==l.v[L];   /* valor igual em todas as linhas virou valor da peça: aí vale para todas */
  Object.keys(f.ov).forEach(k=>{if(f.ov[k]&&typeof f.ov[k]==="object"&&!(f2.ov&&f2.ov[k]&&L in f2.ov[k])&&(dobrou||key===undefined||k===key))delete f.ov[k][L]});   /* edições não salvas das outras variações ficam */
  Object.keys(f2.ov||{}).forEach(k=>{if(k!==key&&key!==undefined&&!dobrou)return;   /* só a variação editada: as outras mantêm o que está no formulário */
    if(f2.ov[k]&&typeof f2.ov[k]==="object"&&L in f2.ov[k]){f.ov[k]=f.ov[k]||{};f.ov[k][L]=f2.ov[k][L]}});
  Object.keys(f.ov).forEach(k=>{if(f.ov[k]&&typeof f.ov[k]==="object"&&!Object.keys(f.ov[k]).length)delete f.ov[k]});
}
/* diz o que a edição de uma célula fez: só aquela linha, a peça toda, ou (referência) que deixou de seguir a numeração */
function efeitoCel(antes,lid,L,orig,novo,chave){
  const linhas=G.linhas.filter(r=>r.lancId===lid),tot=linhas.length,nome=NOME[L]||L;
  const mud=linhas.filter(r=>{const a=antes.find(x=>x.lid===r.lancId&&x.key===r.key);return a&&String(a.v??"")!==String(r.v[L]??"")});
  if(L==="E"){
    /* a referência digitada tem prioridade: as referências automáticas das outras linhas se ajustam para não repetir */
    const outras=[];G.linhas.forEach(r=>{if(r.lancId===lid&&r.key===chave)return;const a=antes.find(x=>x.lid===r.lancId&&x.key===r.key);if(a&&String(a.ref||"")!==String(r.v.E||""))outras.push(`${a.ref} → ${r.v.E}`)});
    return `Referência trocada: ${orig} → ${novo}. Agora ela está fixa nesta linha (digitada à mão) e não acompanha mais a numeração automática (para voltar ao automático, apague o valor da célula).`+(outras.length?` Como a digitada tem prioridade, ${outras.length} outra(s) linha(s) automática(s) se ajustaram para não repetir: ${outras.slice(0,4).join(", ")}${outras.length>4?"…":""}.`:"")}
  if(!mud.length)return "";
  if(tot<=1)return "";
  if(mud.length===1)return `${nome} alterado só na linha ${mud[0].v.E}. As outras ${tot-1} linha(s) desta peça continuam como estavam. Para mudar todas, altere o campo no formulário.`;
  if(mud.length===tot)return `${nome} mudou nas ${tot} linhas desta peça (o valor passou a valer para a peça inteira).`;
  return `${nome} mudou em ${mud.length} das ${tot} linhas desta peça.`}
function fecharCel(commit,mover){
  if(!celEd)return;let antesPeca=null;const {ri,L,orig,nova}=celEd,i=document.getElementById("celIn"),lid=!celEd.nova&&G&&G.linhas[ri]?G.linhas[ri].lancId:null,chaveCel=!celEd.nova&&G&&G.linhas[ri]?G.linhas[ri].key:undefined;celEd=null;
  let v=i?i.value:orig;if(L==="E"&&commit)v=v.replace(/\s+/g,"").toUpperCase();
  if(commit&&L==="E"&&v!==orig){const m=String(v).match(/^([A-Z]+)(\d+)/);if(m){const atual=Math.max(inicioDe(m[1]),(G&&G.cont&&G.cont[m[1]])||0);if(+m[2]>atual+50&&!confirm("A referência "+v+" salta mais de 50 números em relação à numeração atual. Isso pode alterar as próximas referências automáticas. Continuar?"))commit=false}}
  const rej=commit&&v!==orig?(checaCel(L,v).erro||(L==="I"&&!vazio(v)&&!catBy(v)?"Essa categoria não está cadastrada (cadastre em Cadastros › Categorias)":null)):null;
  if(commit&&v!==orig&&!rej){
    if(nova){if(!vazio(v)){const l=novaLivre({[L]:v});S.lanc.push(l);undo={tipo:"cola",antes:{},ids:[l.id]};salvar(false)}}
    else{const l=S.lanc.find(x=>x.id===G.linhas[ri].lancId);undo={tipo:"multi",antes:{[l.id]:clone(l.ov||{})}};antesPeca=G.linhas.filter(r=>r.lancId===l.id||L==="E").map(r=>({lid:r.lancId,key:r.key,ref:r.v.E,v:r.v[L]}));gravarCel(ri,L,v);salvar(false)}
  }
  const sj0=formSujo();renderTopo();if(editId&&lid===editId&&commit&&v!==orig&&!rej)sincFormCelula(lid,L,chaveCel);if(editId)renderForm();if(editId&&!sj0)editSnap=JSON.stringify(S.form);
  if(rej){toast(rej+" (valor não gravado)");marcaRuim(ri,L)}
  let jaAvisou=false;if(commit&&antesPeca&&!rej){let msg=efeitoCel(antesPeca,lid,L,orig,v,chaveCel);if(msg){if(L==="E"){const d=[...new Set(G.linhas.filter(r=>r.dup).map(r=>r.v.E))];if(d.length)msg+=` ATENÇÃO: outra linha já usa a referência ${d.join(", ")} (aparece em vermelho): corrija antes de baixar a planilha.`}toast(msg);jaAvisou=true}}
  if(commit&&L==="E"&&!jaAvisou){const d=[...new Set(G.linhas.filter(r=>r.dup).map(r=>r.v.E))];if(d.length)toast("Referência repetida: "+d.join(", ")+" — outra linha já usa essa referência. Corrija antes de baixar a planilha.")}
  if(mover){let nri=ri,nL=L;
    if(mover==="down")nri=passo(ri,1,maxRi());else if(mover==="up")nri=passo(ri,-1,maxRi());else{const k=LET.indexOf(L)+(mover==="right"?1:-1);if(k<0||k>=LET.length)return;nL=LET[k]}
    if(estadoPlanilha.jan)janGarantir(nri);
    if(document.querySelector(`#sheet tr[data-ri="${nri}"]`)){selecionar(nri,LET.indexOf(nL));rolarAte()}}
  document.getElementById("sheet").focus({preventScroll:true});
}
