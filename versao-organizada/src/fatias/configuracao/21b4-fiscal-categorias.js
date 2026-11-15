/* ---------- fiscal (NCM, CFOP, FCP) e insumos de todas as categorias numa tabela só ---------- */
function fiscalTodasHTML(C){
  const pad=k=>esc((C.colcfg[FISC_PAD[k]]||{}).padrao||"");
  return `<details class="gdet" data-open="fiscall" ${estadoBase.abertos.fiscall?"open":""}><summary><b>Fiscal e insumos de todas as categorias</b><span>edite tudo numa tabela só, ou aplique um valor a todas de uma vez</span></summary><div class="gb">
    <p class="hint">Vazio = usa o padrão da coluna (Cadastros › Padrões das colunas). A linha de cima aplica o valor digitado a todas as categorias.</p>
    <div class="tw"><table class="cfg"><thead><tr><th>Categoria</th>${FISC_COLS.map(c=>`<th class="n" title="${c[2]}">${c[1]}</th>`).join("")}</tr></thead><tbody>
      <tr class="fall"><td><b>Todas as categorias</b></td>${FISC_COLS.map(c=>`<td><input class="n" data-fall="${c[0]}" placeholder="${pad(c[0])||"valor"}" style="width:${c[3]}px" inputmode="${c[0]==="ncm"||c[0]==="cfop"?"numeric":"decimal"}" aria-label="${c[1]} para todas as categorias"></td>`).join("")}</tr>
      <tr><td colspan="${FISC_COLS.length+1}" style="text-align:right"><button type="button" class="btn sm pri" data-act="fisc-aplicar" title="Grava os campos preenchidos acima em todas as categorias (os vazios não mudam nada)">Aplicar a todas as categorias</button></td></tr>
      ${C.categorias.map((c,i)=>`<tr><td>${esc(c.nome)}</td>${FISC_COLS.map(f=>`<td><input class="n" data-fc="${i}" data-fk="${f[0]}" value="${esc(c[f[0]]||"")}" placeholder="${pad(f[0])}" style="width:${f[3]}px" inputmode="${f[0]==="ncm"||f[0]==="cfop"?"numeric":"decimal"}" aria-label="${f[1]} de ${esc(c.nome)}"></td>`).join("")}</tr>`).join("")}
    </tbody></table></div></div></details>`}
function fiscalCampo(t,fin){
  if(t.dataset.fall!==undefined)return;   /* a linha "todas" só vale ao clicar em Aplicar */
  const C=cfg(),c=C.categorias[+t.dataset.fc],k=t.dataset.fk;if(!c)return;
  if(!fin)return;const v=t.value.trim(),m=fiscalErro(k,v);
  if(m){t.value=c[k]||"";toast(m+" Voltei ao valor anterior.");return}
  if(v==="")delete c[k];else c[k]=v;t.value=v;salvar(true,false);renderTopo();renderForm()}
function fiscalAplicarTodas(){
  const C=cfg(),vals={};let n=0;
  for(const [k] of FISC_COLS){const el=document.querySelector(`[data-fall="${k}"]`),v=el?el.value.trim():"";if(v==="")continue;const m=fiscalErro(k,v);if(m){toast(m);if(el)el.focus();return}vals[k]=v}
  Object.entries(vals).forEach(([k,v])=>{C.categorias.forEach(c=>{c[k]=v;n++})});
  if(!n){toast("Preencha pelo menos um campo na linha “Todas as categorias”.");return}
  estadoBase.abertos.fiscall=true;guardarAbertos();salvar(true,false);render();toast(`${Object.keys(vals).length} campo(s) aplicado(s) a ${C.categorias.length} categorias.`)}

