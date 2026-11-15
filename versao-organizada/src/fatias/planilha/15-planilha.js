/* ===== planilha ===== */
const CW0={A:60,B:70,C:120,D:100,E:118,F:260,G:120,H:110,I:100,J:110,K:80,L:80,M:220,N:66,O:84,P:104,Q:92,R:110,S:110,T:110,U:110,V:96,W:84,X:100,Y:104,Z:110,AA:66,AB:56,AC:70,AD:96,AE:78};
const estadoPlanilha={colW:{},nfVaz:()=>{},fil:{q:"",cat:"",forn:"",ban:"",sit:""},fv:null,jan:null,janRaf:0,selR:null,arrastando:false,mdTd:null,mdJa:false};
try{estadoPlanilha.colW=JSON.parse(prefLer("colw")||"{}")}catch(e){}
const cw=L=>estadoPlanilha.colW[L]||CW0[L]||90;
const larguraTabela=()=>252+LET.reduce((s,L)=>s+cw(L),0);
try{estadoPlanilha.fil={...estadoPlanilha.fil,...JSON.parse(prefLer("filtro")||"{}")}}catch(e){}
const guardarFil=()=>{try{prefGravar("filtro",JSON.stringify(estadoPlanilha.fil))}catch(e){}};
const filtroOn=()=>!!(estadoPlanilha.fil.q.trim()||estadoPlanilha.fil.cat||estadoPlanilha.fil.forn||estadoPlanilha.fil.ban||estadoPlanilha.fil.sit);
const low=x=>String(x??"").trim().toLowerCase();
const celular=()=>matchMedia("(max-width:900px)").matches;
const toque=()=>matchMedia("(pointer:coarse)").matches;   /* dedo, não mouse */
/* celular: o formulário vira uma gaveta embaixo; a tabela continua aparecendo em cima */
const ALT_GAVETA=[42,60,80];
function gavetaAlt(){const i=Math.min(2,Math.max(0,Number(abertos.malt==null?2:abertos.malt)||0));document.documentElement.style.setProperty("--msh",ALT_GAVETA[i]+"dvh");return i}
function formAbrir(abre){
  if(!celular())return;
  /* o formulário mora no painel de baixo: se a visão atual esconde esse painel, troca para "Lançar" (que abre a gaveta) */
  if(abre&&(document.body.dataset.vis==="planilha"||document.body.dataset.vis==="cad")){visPara("lancar");return}
  gavetaAlt();document.body.classList.toggle("fopen",!!abre);
  if(abre)requestAnimationFrame(()=>{const sh=document.getElementById("sheet");if(sh)window.scrollTo({top:Math.max(0,sh.getBoundingClientRect().top+window.scrollY-8),behavior:"smooth"})});
}
gavetaAlt();
function vista(){let v=null;try{v=prefLer("vista")}catch(e){}return v==="lista"||v==="planilha"?v:(celular()?"lista":"planilha")}
const banhoDe=r=>r.banho?(BANHO_COLS[r.col]||r.col||"Banho"):"Pronta";
function casa(r){
  if(estadoPlanilha.fil.cat&&(r.v.I||"")!==estadoPlanilha.fil.cat)return false;
  if(estadoPlanilha.fil.forn&&(r.v.H||"")!==estadoPlanilha.fil.forn)return false;
  if(estadoPlanilha.fil.ban&&banhoDe(r)!==estadoPlanilha.fil.ban)return false;
  if(estadoPlanilha.fil.sit==="pend"&&!pendente(r))return false;
  if(estadoPlanilha.fil.sit==="mao"&&!(r.ovs&&r.ovs.length))return false;
  const q=semAc(estadoPlanilha.fil.q);if(!q)return true;   /* sem acento e sem maiúsculas; também acha Peso e Preço (2,5 ou 2.5) */
  const nums=["N","V"].map(L=>vazio(r.v[L])?"":String(r.v[L])+" "+String(r.v[L]).replace(".",",")+" "+String(r.v[L]).replace(",","."));
  const t=semAc(["E","F","G","H","I","J","K","L","M","C","Z"].map(L=>r.v[L]).concat(nums).join(" "));
  return q.split(/\s+/).every(w=>t.includes(w));
}
function renderFiltros(g){
  const el=document.getElementById("fil");if(!el)return;
  el.hidden=!g.linhas.length&&!filtroAtivoOuBusca();
  const uni=f=>[...new Set(g.linhas.map(f).filter(x=>!vazio(x)))].sort((a,b)=>a.localeCompare(b,"pt"));
  const sel=(k,rot,list)=>list.length>1||estadoPlanilha.fil[k]?`<select data-fil="${k}" aria-label="${rot}" class="${estadoPlanilha.fil[k]?"on":""}">${opts(list,estadoPlanilha.fil[k],rot)}</select>`:"";
  const h=sel("cat","Categoria",uni(r=>r.v.I))+sel("forn","Fornecedor",uni(r=>r.v.H))+sel("ban","Banho",uni(banhoDe))
    +`<select data-fil="sit" aria-label="Situação" class="${estadoPlanilha.fil.sit?"on":""}">${opts([["pend","Com pendência"],["mao","Editadas à mão"]],estadoPlanilha.fil.sit,"Situação")}</select>`
    +(estadoPlanilha.fil.q.trim()?`<button type="button" class="btn sm" data-act="fil-busca" title="Há uma busca ativa (salva do último uso) escondendo linhas — clique para limpar">Filtro ativo: “${esc(estadoPlanilha.fil.q.trim())}” ✕</button>`:"")
    +(filtroOn()?`<button type="button" class="btn ghost sm" data-act="fil-limpar">× Limpar filtro</button>`:"");
  const s=document.getElementById("filSel");if(s.dataset.sig!==h){s.innerHTML=h;s.dataset.sig=h}
  const b=document.getElementById("fBusca");if(b&&document.activeElement!==b&&b.value!==estadoPlanilha.fil.q)b.value=estadoPlanilha.fil.q;
  document.getElementById("filInfo").textContent=estadoPlanilha.fv?`${estadoPlanilha.fv.size} de ${g.linhas.length} linhas`:"";
  const v=vista();el.querySelectorAll("[data-act=vista]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===v));
}
const filtroAtivoOuBusca=()=>filtroOn();
function cartoes(g){
  const nCat=new Set(g.linhas.map(r=>r.v.I)).size;let h=`<div class="pcards">`,prev=null,n=0;
  g.linhas.forEach((row,ri)=>{if(estadoPlanilha.fv&&!estadoPlanilha.fv.has(ri))return;n++;
    if(nCat>1&&row.v.I!==prev)h+=`<div class="ccat">${esc(row.v.I||"Sem categoria")}</div>`;prev=row.v.I;
    const c=celulas(row,ri+2),gv=L=>{const x=c[LET.indexOf(L)];return x&&typeof x.v==="number"?x.v:x&&x.v==null&&typeof x.calc==="number"?x.calc:null};
    const pv=gv("V"),cus=["P","Q","R","S","T","U"].map(gv),cu=cus.some(x=>x!=null)?cus.reduce((t,x)=>t+(x||0),0):null,q=gv("W"),pd=pendente(row);
    h+=`<div class="pc${row.dup?" dup":""}${editId===row.lancId?" edl":sel.has(row.lancId)?" on":""}" data-l="${row.lancId}" data-ri="${ri}">
      <div class="c1">${(()=>{const lq=S.lanc.find(l=>l.id===row.lancId)||{},ft=lq.ft||lq.ftR;return ft&&ftOk(ft)?`<button type="button" class="foto-abrir" data-act="tab-foto" data-lid="${row.lancId}" aria-label="Ampliar foto de ${esc(row.v.E)}"><img class="pc-ft" src="${fs(ft)}" alt=""></button>`:`<button type="button" class="pc-ftadd" data-act="foto-add" data-lid="${row.lancId}" aria-label="Adicionar foto" title="Adicionar foto">📷</button>`})()}<b class="mono">${esc(row.v.E)}</b>${row.col?`<span class="lt ${row.col}">${esc(BANHO_COLS[row.col]||"")}</span>`:""}${pd?`<span class="pd">${esc(pd)}</span>`:""}<span class="q">${q!=null?fmt(q)+" pç":"sem qtd"}</span></div>
      <div class="c2">${esc(row.v.F||"(sem descrição)")}</div>
      <div class="c3">${[(row.v.I||"")+(row.v.J?" › "+row.v.J:""),row.v.H,row.v.L,row.v.K].filter(x=>!vazio(x)).map(esc).join(" · ")}</div>
      <div class="c4"><span title="Compra + insumos + banhos + verniz">Custo <b>${cu!=null?"R$ "+brl(cu):"—"}</b></span><span>Varejo <b>${pv!=null?"R$ "+brl(pv):"—"}</b></span>
        <span class="ca"><button type="button" class="btn sm" data-act="editar" aria-label="Editar ${esc(row.v.E)}">Editar</button><button type="button" class="btn sm" data-act="dup" title="Duplicar (nova referência)" aria-label="Duplicar">⧉</button><button type="button" class="btn sm danger" data-act="del" title="Excluir só esta linha" aria-label="Excluir">×</button></span></div></div>`});
  if(!n)h+=`<p class="vz">${g.linhas.length?`Nenhuma peça com esse filtro. <button type="button" class="btn sm" data-act="fil-limpar">Limpar filtro</button>`:"Nenhuma peça ainda. Lance pelo formulário abaixo ou troque para Planilha e cole do Excel."}</p>`;
  return h+`</div>`;
}
