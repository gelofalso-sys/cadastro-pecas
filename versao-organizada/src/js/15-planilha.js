/* ===== planilha ===== */
const CW0={A:60,B:70,C:120,D:100,E:118,F:260,G:120,H:110,I:100,J:110,K:80,L:80,M:220,N:66,O:84,P:104,Q:92,R:110,S:110,T:110,U:110,V:96,W:84,X:100,Y:104,Z:110,AA:66,AB:56,AC:70,AD:96,AE:78};
let colW={};try{colW=JSON.parse(localStorage.getItem("cadpecas-colw")||"{}")}catch(e){}
const cw=L=>colW[L]||CW0[L]||90;
const larguraTabela=()=>252+LET.reduce((s,L)=>s+cw(L),0);
let FIL={q:"",cat:"",forn:"",ban:"",sit:""},FV=null;
try{FIL={...FIL,...JSON.parse(localStorage.getItem("cadpecas-filtro")||"{}")}}catch(e){}
const guardarFil=()=>{try{localStorage.setItem("cadpecas-filtro",JSON.stringify(FIL))}catch(e){}};
const filtroOn=()=>!!(FIL.q.trim()||FIL.cat||FIL.forn||FIL.ban||FIL.sit);
const low=x=>String(x??"").trim().toLowerCase();
const celular=()=>matchMedia("(max-width:900px)").matches;
/* celular: o formulário vira uma gaveta embaixo; a tabela continua aparecendo em cima */
const ALT_GAVETA=[42,60,80];
function gavetaAlt(){const i=Math.min(2,Math.max(0,Number(abertos.malt==null?1:abertos.malt)||0));document.documentElement.style.setProperty("--msh",ALT_GAVETA[i]+"dvh");return i}
function formAbrir(abre){
  if(!celular())return;
  /* o formulário mora no painel de baixo: se a visão atual esconde esse painel, troca para "Lançar" (que abre a gaveta) */
  if(abre&&(document.body.dataset.vis==="planilha"||document.body.dataset.vis==="cad")){visPara("lancar");return}
  gavetaAlt();document.body.classList.toggle("fopen",!!abre);
  if(abre)requestAnimationFrame(()=>{const sh=document.getElementById("sheet");if(sh)window.scrollTo({top:Math.max(0,sh.getBoundingClientRect().top+window.scrollY-8),behavior:"smooth"})});
}
gavetaAlt();
function vista(){let v=null;try{v=localStorage.getItem("cadpecas-vista")}catch(e){}return v==="lista"||v==="planilha"?v:(celular()?"lista":"planilha")}
const banhoDe=r=>r.banho?(BANHO_COLS[r.col]||r.col||"Banho"):"Pronta";
function pendente(r){const cc=cfg().colcfg;if(r.dup)return "ref. repetida";if(r.banho&&num(r.v.N)==null&&r.banho.modo!=="fixo")return "sem peso";
  if(r.banho&&r.banho.mult==null&&vazio(r.v[r.banho.coluna]))return "banho sem multiplicador";
  for(const L of LET){if(cc[L]&&cc[L].obrig&&(L==="W"?!(num(r.v.W)>0):vazio(r.v[L])))return "sem "+NOME[L].toLowerCase()}return ""}
function casa(r){
  if(FIL.cat&&(r.v.I||"")!==FIL.cat)return false;
  if(FIL.forn&&(r.v.H||"")!==FIL.forn)return false;
  if(FIL.ban&&banhoDe(r)!==FIL.ban)return false;
  if(FIL.sit==="pend"&&!pendente(r))return false;
  if(FIL.sit==="mao"&&!(r.ovs&&r.ovs.length))return false;
  const q=semAc(FIL.q);if(!q)return true;   /* sem acento e sem maiúsculas; também acha Peso e Preço (2,5 ou 2.5) */
  const nums=["N","V"].map(L=>vazio(r.v[L])?"":String(r.v[L])+" "+String(r.v[L]).replace(".",",")+" "+String(r.v[L]).replace(",","."));
  const t=semAc(["E","F","G","H","I","J","K","L","M","C","Z"].map(L=>r.v[L]).concat(nums).join(" "));
  return q.split(/\s+/).every(w=>t.includes(w));
}
function renderFiltros(g){
  const el=document.getElementById("fil");if(!el)return;
  el.hidden=!g.linhas.length&&!filtroAtivoOuBusca();
  const uni=f=>[...new Set(g.linhas.map(f).filter(x=>!vazio(x)))].sort((a,b)=>a.localeCompare(b,"pt"));
  const sel=(k,rot,list)=>list.length>1||FIL[k]?`<select data-fil="${k}" aria-label="${rot}" class="${FIL[k]?"on":""}">${opts(list,FIL[k],rot)}</select>`:"";
  const h=sel("cat","Categoria",uni(r=>r.v.I))+sel("forn","Fornecedor",uni(r=>r.v.H))+sel("ban","Banho",uni(banhoDe))
    +`<select data-fil="sit" aria-label="Situação" class="${FIL.sit?"on":""}">${opts([["pend","Com pendência"],["mao","Editadas à mão"]],FIL.sit,"Situação")}</select>`
    +(FIL.q.trim()?`<button type="button" class="btn sm" data-act="fil-busca" title="Há uma busca ativa (salva do último uso) escondendo linhas — clique para limpar">Filtro ativo: “${esc(FIL.q.trim())}” ✕</button>`:"")
    +(filtroOn()?`<button type="button" class="btn ghost sm" data-act="fil-limpar">× Limpar filtro</button>`:"");
  const s=document.getElementById("filSel");if(s.dataset.sig!==h){s.innerHTML=h;s.dataset.sig=h}
  const b=document.getElementById("fBusca");if(b&&document.activeElement!==b&&b.value!==FIL.q)b.value=FIL.q;
  document.getElementById("filInfo").textContent=FV?`${FV.size} de ${g.linhas.length} linhas`:"";
  const v=vista();el.querySelectorAll("[data-act=vista]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===v));
}
const filtroAtivoOuBusca=()=>filtroOn();
function cartoes(g){
  const nCat=new Set(g.linhas.map(r=>r.v.I)).size;let h=`<div class="pcards">`,prev=null,n=0;
  g.linhas.forEach((row,ri)=>{if(FV&&!FV.has(ri))return;n++;
    if(nCat>1&&row.v.I!==prev)h+=`<div class="ccat">${esc(row.v.I||"Sem categoria")}</div>`;prev=row.v.I;
    const c=celulas(row,ri+2),gv=L=>{const x=c[LET.indexOf(L)];return x&&typeof x.v==="number"?x.v:null};
    const pv=gv("V"),cu=gv("P"),q=num(row.v.W),pd=pendente(row);
    h+=`<div class="pc${row.dup?" dup":""}${editId===row.lancId?" edl":sel.has(row.lancId)?" on":""}" data-l="${row.lancId}" data-ri="${ri}" data-act="editar" role="button" tabindex="0" aria-label="Editar ${esc(row.v.E)}">
      <div class="c1">${(()=>{const lq=S.lanc.find(l=>l.id===row.lancId)||{},ft=lq.ft||lq.ftR;return ft&&ftOk(ft)?`<img class="pc-ft" src="${fs(ft)}" alt="" data-act="tab-foto" data-lid="${row.lancId}">`:`<button type="button" class="pc-ftadd" data-act="foto-add" data-lid="${row.lancId}" aria-label="Adicionar foto" title="Adicionar foto">📷</button>`})()}<b class="mono">${esc(row.v.E)}</b>${row.col?`<span class="lt ${row.col}">${esc(BANHO_COLS[row.col]||"")}</span>`:""}${pd?`<span class="pd">${esc(pd)}</span>`:""}<span class="q">${q!=null?fmt(q)+" pç":"sem qtd"}</span></div>
      <div class="c2">${esc(row.v.F||"(sem descrição)")}</div>
      <div class="c3">${[(row.v.I||"")+(row.v.J?" › "+row.v.J:""),row.v.H,row.v.L,row.v.K].filter(x=>!vazio(x)).map(esc).join(" · ")}</div>
      <div class="c4"><span>Custo <b>${cu!=null?"R$ "+brl(cu):"—"}</b></span><span>Varejo <b>${pv!=null?"R$ "+brl(pv):"—"}</b></span>
        <span class="ca"><button type="button" class="btn sm" data-act="dup" title="Duplicar (nova referência)" aria-label="Duplicar">⧉</button><button type="button" class="btn sm danger" data-act="del" title="Excluir só esta linha" aria-label="Excluir">×</button></span></div></div>`});
  if(!n)h+=`<p class="vz">${g.linhas.length?`Nenhuma peça com esse filtro. <button type="button" class="btn sm" data-act="fil-limpar">Limpar filtro</button>`:"Nenhuma peça ainda. Lance pelo formulário abaixo ou troque para Planilha e cole do Excel."}</p>`;
  return h+`</div>`;
}
function render(){renderListas();renderTopo();renderForm();renderCfg()}
function renderListas(){document.getElementById("lists").innerHTML=LET.map(L=>{const l=listaDe(L,S.form.v.I);return l.length?`<datalist id="dl-${L}">${l.map(o=>`<option value="${esc(o)}">`).join("")}</datalist>`:""}).join("")}
/* tabela grande (mais de 300 linhas): só as linhas perto da área visível ficam no DOM; o resto vira espaço em branco da mesma altura.
   Abaixo disso o desenho é o de sempre. JAN = {lista, row, alt, cum, a, b, ...} */
let JAN=null,janRaf=0;const JAN_MIN=300,JANM={rh:28,hFt:39,head:34};
function janAlturas(){const J=JAN;let s=0;J.cum=new Float64Array(J.lista.length+1);J.lista.forEach((ri,p)=>{J.cum[p]=s;s+=(ri<J.nReais&&J.ft[J.ids[ri]])?J.hFt:J.rh});J.cum[J.lista.length]=s;J.total=s}
function janPos(y){const c=JAN.cum;let lo=0,hi=JAN.lista.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(c[m]<=y)lo=m;else hi=m-1}return lo}
function janelaHtml(){
  const J=JAN,sh=document.getElementById("sheet"),n=J.lista.length,vh=sh.clientHeight||800,y=Math.max(0,(sh.scrollTop||0)-J.head);
  let a=Math.max(0,janPos(y)-45),b=Math.min(n,janPos(y+vh)+60);if(a>0&&a%2===0)a--;   /* a ímpar mantém a listra zebrada igual à do desenho completo */
  J.a=a;J.b=b;const sp=h=>h>0?`<tr class="sp" aria-hidden="true" style="height:${h}px"><td colspan="${LET.length+4}" style="padding:0;border:0"></td></tr>`:"";
  return sp(J.cum[a])+J.lista.slice(a,b).map(J.row).join("")+sp(J.total-J.cum[b])}
function janRepintar(forca){
  const J=JAN;if(!J||celEd)return;const sh=document.getElementById("sheet"),tb=sh&&sh.querySelector("tbody");if(!tb)return;
  const y=Math.max(0,sh.scrollTop-J.head),p0=janPos(y),p1=janPos(y+(sh.clientHeight||800));
  const n=J.lista.length;if(!forca&&!((J.a>0&&p0<J.a+8)||(J.b<n&&p1>J.b-8)))return;
  tb.innerHTML=janelaHtml();pintarSel();janMedir()}
/* mede a altura real de uma linha comum e de uma com foto; se diferir do chute, recalcula as alturas uma vez */
function janMedir(){const J=JAN;if(!J||J.medido)return;const t1=document.querySelector("#sheet tbody tr[data-ri]:not(.blank):not(:has(td.tf img))"),t2=document.querySelector("#sheet tbody tr:has(td.tf img)");
  let mud=false;if(t1&&Math.abs(t1.offsetHeight-J.rh)>0.5){J.rh=t1.offsetHeight;mud=true}if(t2&&Math.abs(t2.offsetHeight-J.hFt)>0.5){J.hFt=t2.offsetHeight;mud=true}
  const th=document.querySelector("#sheet thead");if(th&&th.offsetHeight&&Math.abs(th.offsetHeight-J.head)>0.5){J.head=th.offsetHeight;mud=true}
  J.medido=true;JANM.rh=J.rh;JANM.hFt=J.hFt;JANM.head=J.head;if(mud){janAlturas();const sh=document.getElementById("sheet");sh.querySelector("tbody").innerHTML=janelaHtml();pintarSel()}}
/* garante que a linha ri (índice da peça na tabela) esteja desenhada e visível — usado pelo teclado e por "mostrar no fim" */
function janGarantir(ri){const J=JAN;if(!J)return true;const p=J.lista.indexOf(ri);if(p<0)return false;
  if(p>=J.a&&p<J.b)return true;const sh=document.getElementById("sheet");sh.scrollTop=Math.max(0,J.head+J.cum[p]-sh.clientHeight/2);janRepintar(true);return true}
function guiaHTML(){if(abertos.guiaX)return "";return `<span class="ok vaz guia" role="note"><b>Guia rápido:</b> <button type="button" class="gi tod" data-act="ir" data-sec="cat" title="Categorias, subcategorias, tamanhos e cores">1 · Cadastros</button> <button type="button" class="gi tod" data-act="ir" data-sec="lancar">2 · Lançar peça</button> <span class="hint">3 · conferir a tabela</span> <span class="hint">4 · “Exportar para…” e baixar</span> <button type="button" class="x" data-act="guia-fechar" aria-label="Fechar o guia" title="Fechar o guia">×</button></span> `}
function renderTopo(){
  const g=G=gerar(),sh=document.getElementById("sheet"),st=sh.scrollTop,sl=sh.scrollLeft,cc=cfg().colcfg;
  FV=filtroOn()?new Set(g.linhas.map((r,i)=>casa(r)?i:-1).filter(i=>i>=0)):null;renderFiltros(g);
  const ps=[...new Set([...S.lanc.map(l=>prefDe(val(l,"I"),val(l,"J"))),prefDe(S.form.v.I,S.form.v.J)])];
  {const ms=document.getElementById("modSel");if(ms){const C0=cfg(),tem=r=>C0.modelos.some(x=>r.test(String(x.nome||"")));
    ms.innerHTML=opts([...C0.modelos.map(x=>[x.id,x.nome]),...(tem(/bling/i)?[]:[["@bling","＋ Adicionar Bling"]]),...(tem(/jueri/i)?[]:[["@jueri","＋ Adicionar Jueri"]]),["@novo","＋ Outro sistema…"]],C0.modelo)}
    const bx=document.querySelector('[data-act="xlsx"]');if(bx)bx.textContent=(filtroOn()?"Baixar filtro ":"Baixar ")+(modeloAtual().formato==="csv"?".csv":".xlsx");{const bc=document.querySelector('[data-act="copiar"]');if(bc)bc.textContent=filtroOn()?"Copiar filtro para o Excel":"Copiar para o Excel"}}
  document.getElementById("seqs").innerHTML=ps.map(p0=>{const p=esc(p0),u=ultimo(p0),m=(g.manual||{})[p0]||0,i0=Math.max(u,m),f=g.cont[p0];return `<span class="seq">${p}: última <b>${p}${u}</b>${m>u?` · à mão até <b>${p}${m}</b>`:""}${f&&f>i0?` → lista <b>${p}${i0+1}${f>i0+1?"–"+f:""}</b>`:""}<span class="px">próxima <b>${p}${esc(proxDe(p0))}</b></span></span>`}).join("");
  document.getElementById("banner").innerHTML=lastExport?`<div class="banner"><p>Planilha gerada com <b class="mono">${esc(lastExport.faixa)}</b>. Gravar como última peça do sistema?</p>
    <button class="btn pri sm" type="button" data-act="exp-limpar">Gravar e limpar a lista</button><button class="btn sm" type="button" data-act="exp-so">Só gravar o número</button><button class="btn ghost sm" type="button" data-act="exp-nao">Agora não</button></div>`:"";
  const ns=[...sel].filter(id=>S.lanc.some(l=>l.id===id)).length,av=avisos(g);
  document.getElementById("tools").innerHTML=(ns?`<div class="bulk"><b style="font-size:12px">${ns} selecionado${ns>1?"s":""}</b>
      <button class="btn sm" type="button" data-act="b-dup">Duplicar</button><button class="btn sm" type="button" data-act="b-copy">Copiar</button><button class="btn sm danger" type="button" data-act="b-del">Excluir</button>
      <span class="hint">· preencher</span><select id="bCol" aria-label="Coluna">${opts(LET.filter(L=>L!=="E").map(L=>[L,NOME[L]]),"X")}</select><input id="bVal" placeholder="valor" aria-label="Valor"><button class="btn sm" type="button" data-act="b-set">Aplicar</button>
      <button class="btn ghost sm" type="button" data-act="b-none" title="Limpar seleção">×</button></div>`:"")
    +(()=>{const nf=S.lanc.filter(l=>l.ft&&vazio(l.v.B)).length;return nf?`<button class="btn sm" type="button" data-act="fotos-enviar" title="Envia as fotos para o imgbb e põe o link na coluna Foto (os sistemas pedem o link da foto)">↑ Gerar link de ${nf} foto${nf>1?"s":""}</button>`:""})()
    +`<div class="issues">${av.length?av.map(a=>`<span class="${a.bad?"bad":""}">• ${esc(a.t)}</span>`).join(""):!g.linhas.length?`${guiaHTML()}<span class="ok vaz"><b>Comece lançando uma peça abaixo</b> ou importe um romaneio ou nota fiscal. Também dá para colar linhas de outra planilha (clique numa célula e use <kbd>Ctrl</kbd>+<kbd>V</kbd>).</span> <button class="btn sm" type="button" data-act="exemplo">Ver um exemplo</button>`:`<span class="ok">Clique numa célula para editar · <kbd>Enter</kbd> desce · <kbd>Tab</kbd> vai para a direita · pode colar blocos do Excel</span>`}</div>`;
  const cab=`<thead><tr><th class="k"><div class="in"><input type="checkbox" id="selAll" ${S.lanc.length&&S.lanc.every(l=>sel.has(l.id))?"checked":""} aria-label="Selecionar todos"></div></th><th class="k nm" title="Número da linha: ajuda a achar qual peça você está alterando">Nº</th><th class="tfh" title="Foto que veio do romaneio — só referência visual, não vai para a planilha">Foto do romaneio</th><th class="tfh" title="Imagem que você anexou: é ela que gera o link da coluna Foto">Imagem (upload)</th>${LET.map(L=>`<th data-hc="${L}" title="${esc(NOME[L])} — clique para selecionar a coluna"><small>${L}</small>${esc(nomeTela(L))}<span class="rz" data-rz="${L}" title="Arraste para ajustar a largura · duplo clique volta ao padrão"></span></th>`).join("")}</tr></thead>`;
  const ftMap={},ftRMap={},ftUMap={};S.lanc.forEach(l=>{const a=l.ft&&ftOk(l.ft)?l.ft:"",b=l.ftR&&ftOk(l.ftR)?l.ftR:"";if(a||b)ftMap[l.id]=a||b;if(b)ftRMap[l.id]=b;if(a)ftUMap[l.id]=a});
  let h=`<table class="t" style="width:${larguraTabela()}px"><colgroup><col style="width:96px"><col style="width:44px"><col style="width:56px"><col style="width:56px">${LET.map(L=>`<col data-cw="${L}" style="width:${cw(L)}px">`).join("")}</colgroup>${cab}<tbody>`;
  const cel=g.linhas.map((row,ri)=>celulas(row,ri+2));   /* uma vez só por desenho (antes eram duas) */
  const trReal=ri=>{const row=g.linhas[ri];let h="";
    const c=cel[ri],id=row.lancId;
    h+=`<tr data-l="${id}" data-ri="${ri}" class="${editId===id?"edl":sel.has(id)?"on":""}"><td class="k"><div class="in"><input type="checkbox" data-sel ${sel.has(id)?"checked":""} aria-label="Selecionar">
      <button type="button" data-act="editar" title="Abrir a peça no lançamento (todas as linhas dela)">✎</button><button type="button" data-act="dup" title="Duplicar esta linha (mesmo tipo, nova referência)">⧉</button><button type="button" class="del" data-act="del" title="Excluir só esta linha (as outras linhas da mesma peça ficam)">×</button></div></td><td class="k nm" title="Linha ${ri+1}">${ri+1}</td>`+`<td class="tf">${ftRMap[id]?`<img src="${fs(ftRMap[id])}" alt="Foto do romaneio" data-act="tab-foto" title="Foto do romaneio (ampliar)">`:""}</td>`+(ftUMap[id]?`<td class="tf"><img src="${fs(ftUMap[id])}" alt="Imagem enviada" data-act="tab-foto" data-lid="${id}" title="Imagem enviada (é ela que gera o link). Ampliar"></td>`:`<td class="tf"><button type="button" class="ftadd" data-act="foto-add" data-lid="${id}" title="Adicionar foto a esta peça: clique, arraste uma ou várias fotos para a linha (nome do arquivo = referência liga sozinho) ou cole com Ctrl+V">📷 ＋</button></td>`);
    LET.forEach((L,i)=>{const x=c[i],ov=row.ovs.includes(L)?" ov":"",miss=cc[L].obrig&&!x?" miss":"";
      if(L==="E"){h+=`<td class="ref${row.dup?" dup":""}${ov}" data-c="E" title="${row.dup?"Referência repetida":""}">${esc(row.v.E)}${row.col?`<span class="lt ${row.col}">${esc(BANHO_COLS[row.col]||"")}</span>`:""}</td>`;return}
      if(!x){h+=`<td class="${miss}${ov}" data-c="${L}"></td>`;return}
      const isN=typeof x.v==="number",txt=x.v==null?x.txt||("="+x.f):isN?(MONEY.has(L)?brl(x.v):fmt(x.v)):x.v;
      h+=`<td class="${isN?"n":""}${x.f?" fx":""}${ov}" data-c="${L}" title="${x.f?"="+esc(x.f):esc(x.v)}">${esc(txt)}</td>`});
    h+=`</tr>`;return h};
  const nb=Math.max(6,30-g.linhas.length);
  const trBlank=ri=>{const k=ri-g.linhas.length;return `<tr class="blank" data-ri="${ri}"><td class="k"><span class="nb">${k===0?"nova":""}</span></td><td class="k nm"></td><td class="tf"></td><td class="tf"></td>${LET.map((L,x)=>`<td data-c="${L}"${k===0&&x===0?' class="ph"':""}></td>`).join("")}</tr>`};
  {const lista=[];g.linhas.forEach((row,ri)=>{if(!FV||FV.has(ri))lista.push(ri)});for(let k=0;k<nb;k++)lista.push(g.linhas.length+k);
   const rowHtml=ri=>ri<g.linhas.length?trReal(ri):trBlank(ri);
   if(vista()!=="lista"&&lista.length>JAN_MIN){JAN={lista,nReais:g.linhas.length,ids:g.linhas.map(r=>r.lancId),ft:ftMap,row:rowHtml,rh:JANM.rh,hFt:JANM.hFt,head:JANM.head,medido:false,a:0,b:0};janAlturas();h+=janelaHtml()}
   else{JAN=null;h+=lista.map(rowHtml).join("")}}
  const soma=new Array(LET.length).fill(0),ext={},nm=x=>x&&typeof x.v==="number"?x.v:0;
  cel.forEach((cs,ri)=>{if(FV&&!FV.has(ri))return;cs.forEach((x,j)=>{if(x&&typeof x.v==="number")soma[j]+=x.v});const q=nm(cs[LET.indexOf("W")]);ext.W=(ext.W||0)+q;["P","Q","R","S","T","U","V"].forEach(L=>{ext[L]=(ext[L]||0)+nm(cs[LET.indexOf(L)])*q})});
  const somaCols=new Set(["N","P","Q","R","S","T","U","V","W"]);
  h+=`</tbody><tfoot><tr><td class="k"><span class="nb" title="Soma de cada coluna, como na planilha">Σ colunas</span></td><td class="k nm"></td><td></td><td></td>${LET.map((L,j)=>somaCols.has(L)?`<td class="n tot" title="Soma da coluna ${esc(NOME[L])}">${L==="W"?fmt(soma[j]):L==="N"?fmt(soma[j]):brl(soma[j])}</td>`:`<td></td>`).join("")}</tr></tfoot></table>`;
  {const iW2=LET.indexOf("W"),iV=LET.indexOf("V"),D={custo:[["Compra",ext.P||0],["Insumos",ext.Q||0],["Banhos",(ext.R||0)+(ext.S||0)+(ext.T||0)],["Verniz",ext.U||0]],pecas:{},varejo:{},cor:{},forn:{},banho:{},lucro:{}};
    g.linhas.forEach((row,ri)=>{if(FV&&!FV.has(ri))return;const cs=cel[ri],q=nm(cs[iW2]),c=row.v.I||"Sem categoria",cor=row.v.L||"Sem cor";D.pecas[c]=(D.pecas[c]||0)+q;D.varejo[c]=(D.varejo[c]||0)+nm(cs[iV])*q;D.cor[cor]=(D.cor[cor]||0)+q;
      {const fo=row.v.H||"Sem fornecedor",bn=row.banho?(BANHO_COLS[row.col]||"Banho"):"Pronta",cus=["P","Q","R","S","T","U"].reduce((t,L)=>t+nm(cs[LET.indexOf(L)]),0);
       D.forn[fo]=(D.forn[fo]||0)+cus*q;D.banho[bn]=(D.banho[bn]||0)+q;D.lucro[c]=(D.lucro[c]||0)+(nm(cs[iV])-cus)*q}});renderGraf(D)}
  {const compra=ext.P||0,ins=ext.Q||0,ban=(ext.R||0)+(ext.S||0)+(ext.T||0),vz=ext.U||0,custo=compra+ins+ban+vz,vj=ext.V||0,luc=vj-custo,mg=vj?luc/vj*100:0,ord=cfg().ordem==="ab";
    const el=document.getElementById("totais");if(el)el.innerHTML=(FV?`<span class="tt tfil" title="Totais só das linhas que o filtro mostra">Filtro: <b>${FV.size} de ${g.linhas.length}</b></span>`:"")+`<span class="tt" title="Quantidade total de peças">Peças <b>${fmt(ext.W||0)}</b></span><span class="tt" title="Custo de Compra × Quantidade">Compra <b>R$ ${brl(compra)}</b></span><span class="tt" title="Custo de Insumos × Quantidade">Insumos <b>R$ ${brl(ins)}</b></span><span class="tt" title="Custo dos banhos de ouro, ródio e prata × Quantidade">Banhos <b>R$ ${brl(ban)}</b></span><span class="tt" title="Custo do verniz × Quantidade">Verniz <b>R$ ${brl(vz)}</b></span><span class="tt tot-c" title="Compra + Insumos + Banhos + Verniz">Custo total <b>R$ ${brl(custo)}</b></span><span class="tt tot-v" title="Preço de Varejo × Quantidade">Varejo <b>R$ ${brl(vj)}</b></span><span class="tt" title="Varejo − Custo total">Lucro <b>${vj?"R$ "+brl(luc):"—"}</b> <small>${vj?fmt(Math.round(mg*10)/10)+"%":"—"}</small></span>
      <span class="ordsel" role="group" aria-label="Ordem da tabela"><span class="hint">Ordem</span><button type="button" class="${ord?"":"on"}" data-act="ordem" data-v="int" title="Cada peça com seus banhos e tamanhos juntos, na ordem em que foi lançada">Por peça</button><button type="button" class="${ord?"on":""}" data-act="ordem" data-v="ab" title="Todas as A (ouro), depois todas as B (prata), depois as prontas">Por banho</button></span>`}
  const li=vista()==="lista";sh.classList.toggle("lista",li);document.body.classList.toggle("vlista",li);if(li){selR=null;h=cartoes(g)}
  sh.innerHTML=h;sh.scrollTop=st;sh.scrollLeft=sl;sh.style.overflowAnchor=JAN?"none":"";if(JAN)janMedir();pintarSel();renderSelBar();
  renderNum();{const pp=prefDe(S.form.v.I,S.form.v.J),pr=document.getElementById("proxRef");if(pr)pr.textContent=fnum(pp,proxDe(pp));const pb=document.getElementById("proxBig");if(pb)pb.innerHTML=`Próxima referência <b>${esc(pp)}${fnum(pp,proxDe(pp))}</b>`}
}
/* ---- edição de célula ---- */
function abrirCel(ri,L,cursorFim){
  if(!document.querySelector(`#sheet tr[data-ri="${ri}"] td[data-c="${L}"]`))return;
  if(celEd)fecharCel(true);
  const td2=document.querySelector(`#sheet tr[data-ri="${ri}"] td[data-c="${L}"]`);if(!td2)return;
  const row=G.linhas[ri];
  document.getElementById("dl-cel").innerHTML=listaDe(L,row?row.v.I:S.form.v.I).map(o=>`<option value="${esc(o)}">`).join("");
  const formulaVazia=row&&row.banho&&FORMULA.has(L)&&!row.ovs.includes(L);
  const raw=!row||formulaVazia?"":(row.v[L]??"");celEd={ri,L,orig:String(raw),nova:!row};
  const ph=formulaVazia?(()=>{const x=calcBanho(row,L,ri+2);return x?(x.f?"="+x.f:String(x.v)):"(vazio)"})():(!row?"digite ou cole (Ctrl+V)":"");
  selR={ar:ri,ac:LET.indexOf(L),fr:ri,fc:LET.indexOf(L)};w=Math.max(td2.offsetWidth,150);td2.classList.add("ed");
  td2.innerHTML=`<input id="celIn" value="${esc(raw)}" list="dl-cel" ${NUM.has(L)?'class="n"':""} placeholder="${esc(ph)}" aria-label="${esc(NOME[L])}" autocomplete="off">`;
  const i=document.getElementById("celIn");i.style.width=w+"px";i.focus();if(cursorFim){const n=i.value.length;try{i.setSelectionRange(n,n)}catch(x){}}else i.select();
}
let w=150;
/* linha colada ou digitada direto na tabela: vira uma peça pronta com os valores dados */
function novaLivre(v){const l={id:uid(),tipo:"pronta",desconto:"0",banhista:"",vinc:false,v:{...v},on:{},ov:{}};if(vazio(l.v.I))l.v.I=S.form.v.I||"";return l}
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
  Object.keys(f2.ov||{}).forEach(k=>{if(f2.ov[k]&&typeof f2.ov[k]==="object"&&L in f2.ov[k]){f.ov[k]=f.ov[k]||{};f.ov[k][L]=f2.ov[k][L]}});
  Object.keys(f.ov).forEach(k=>{if(f.ov[k]&&typeof f.ov[k]==="object"&&!Object.keys(f.ov[k]).length)delete f.ov[k]});
}
function fecharCel(commit,mover){
  if(!celEd)return;const {ri,L,orig,nova}=celEd,i=document.getElementById("celIn"),lid=!celEd.nova&&G&&G.linhas[ri]?G.linhas[ri].lancId:null,chaveCel=!celEd.nova&&G&&G.linhas[ri]?G.linhas[ri].key:undefined;celEd=null;
  let v=i?i.value:orig;if(L==="E"&&commit)v=v.replace(/\s+/g,"").toUpperCase();
  const rej=commit&&v!==orig?checaCel(L,v).erro:null;
  if(commit&&v!==orig&&!rej){
    if(nova){if(!vazio(v)){const l=novaLivre({[L]:v});S.lanc.push(l);undo={tipo:"cola",antes:{},ids:[l.id]};salvar(false)}}
    else{const l=S.lanc.find(x=>x.id===G.linhas[ri].lancId);undo={tipo:"multi",antes:{[l.id]:clone(l.ov||{})}};gravarCel(ri,L,v);salvar(false)}
  }
  const sj0=formSujo();renderTopo();if(editId&&lid===editId&&commit&&v!==orig&&!rej)sincFormCelula(lid,L,chaveCel);if(editId)renderForm();if(editId&&!sj0)editSnap=JSON.stringify(S.form);
  if(rej){toast(rej+" (valor não gravado)");marcaRuim(ri,L)}
  if(commit&&L==="E"){const d=[...new Set(G.linhas.filter(r=>r.dup).map(r=>r.v.E))];if(d.length)toast("Referência repetida: "+d.join(", ")+" — corrija antes de baixar a planilha.")}
  if(mover){let nri=ri,nL=L;
    if(mover==="down")nri=passo(ri,1,maxRi());else if(mover==="up")nri=passo(ri,-1,maxRi());else{const k=LET.indexOf(L)+(mover==="right"?1:-1);if(k<0||k>=LET.length)return;nL=LET[k]}
    if(JAN)janGarantir(nri);
    if(document.querySelector(`#sheet tr[data-ri="${nri}"]`)){selecionar(nri,LET.indexOf(nL));rolarAte()}}
  document.getElementById("sheet").focus({preventScroll:true});
}
function lerTsv(t){const NL=String.fromCharCode(10),CR=String.fromCharCode(13),TB=String.fromCharCode(9),Q=String.fromCharCode(34),rows=[];let row=[],cel="",q=false;t=String(t).split(CR).join("");
  for(let i=0;i<t.length;i++){const c=t[i];
    if(q){if(c===Q){if(t[i+1]===Q){cel+=Q;i++}else q=false}else cel+=c}
    else if(c===Q&&cel==="")q=true;else if(c===TB){row.push(cel);cel=""}else if(c===NL){row.push(cel);rows.push(row);row=[];cel=""}else cel+=c}
  if(cel!==""||row.length){row.push(cel);rows.push(row)}return rows}
function colarCel(texto,inicio){
  const {ri,L}=inicio||celEd,c0=LET.indexOf(L);celEd=null;
  let linhas=lerTsv(texto);
  /* cabeçalho colado junto: as colunas são reconhecidas pelo nome (qualquer sistema); sem cabeçalho vale a posição na tabela */
  let keys=null;{const mp=(linhas[0]||[]).map(c=>chaveDoCabecalho(c));if(mp.filter(Boolean).length>=2){keys=mp;linhas=linhas.slice(1)}}
  const keyAt=j=>keys?keys[j]:LET[c0+j];
  const antes={},ids=[],alvo=[],recus=[];let n=0;{let r=ri;linhas.forEach(()=>{while(!vis(r))r++;alvo.push(r);r++})}
  const aceita=(LL,x,ri2)=>{const ck=checaCel(LL,x);if(ck.erro){recus.push({msg:ck.erro,ri:ri2,L:LL});return false}return true};
  linhas.forEach((cels,i)=>{
    const row=G.linhas[alvo[i]];
    if(row){const l=S.lanc.find(x=>x.id===row.lancId);if(!(l.id in antes))antes[l.id]=clone(l.ov||{});
      cels.forEach((v,j)=>{const LL=keyAt(j);if(LL&&aceita(LL,v,alvo[i])){gravarCel(alvo[i],LL,v.trim());n++}});return}
    const v={};cels.forEach((x,j)=>{const LL=keyAt(j);if(LL&&!vazio(x)&&aceita(LL,x,alvo[i])){v[LL]=x.trim();n++}});
    if(Object.keys(v).length){const l=novaLivre(v);S.lanc.push(l);ids.push(l.id)}
  });
  undo={tipo:"cola",antes,ids};salvar(false);renderTopo();if(editId)renderForm();
  recus.slice(0,20).forEach(z=>marcaRuim(z.ri,z.L));
  toast(`${n} célula(s) coladas${ids.length?` · ${ids.length} linha(s) nova(s)`:""}${recus.length?` · ${recus.length} RECUSADA(S): ${recus[0].msg}`:""}.`,n?{t:"Desfazer",fn:desfazer}:null);
}


