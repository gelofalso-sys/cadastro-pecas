/* ===== conjunto: soma de peças individuais (brincos + colar…). Cada peça tem peso, compra e banho (o do conjunto, ou só dela).
   Marcando banhos no conjunto (Ouro, Prata, Ródio…) sai UMA linha de conjunto por banho, igual às peças individuais; sem marcar, sai uma linha só. ===== */
function conjErro(f,i){const c=(f.comp||[])[i];if(!c)return "";if(vazio(c.desc)&&vazio(c.peso)&&vazio(c.custo))return "";const m=[];
  if(vazio(c.desc))m.push("falta o nome da peça");
  if(vazio(c.peso))m.push("falta o peso");else if(num(c.peso)==null||num(c.peso)<=0)m.push("peso inválido");
  if(vazio(c.custo))m.push("falta o custo de compra");else if(num(c.custo)==null||num(c.custo)<0)m.push("custo inválido");
  if(!vazio(c.desc)&&f.comp.some((o,q)=>q<i&&semAc(o.desc)===semAc(c.desc)))m.push("nome repetido");
  return m.join(" · ")}
function conjResumoHTML(f){const cs=f.comp||[],ok=cs.filter(c=>!vazio(c.desc)||!vazio(c.peso)||!vazio(c.custo)),n=ok.length,peso=ok.reduce((a,c)=>a+(num(c.peso)||0),0),compra=ok.reduce((a,c)=>a+(num(c.custo)||0),0),nErr=cs.filter((c,i)=>{const e=conjErro(f,i);return e&&e!=="nome repetido"}).length,nomes=ok.map(c=>String(c.desc||"").trim()).filter(Boolean);
  return `<span class="cj-p">Conjunto</span> <b>${esc(nomes.length?nomes.join(" + "):"(sem peças ainda)")}</b> <span class="cj-m">${n} peça${n===1?"":"s"} · ${fmt(peso)} g · compra R$ ${brl(compra)}</span>${nErr?` <span class="cj-e2">⚠ ${nErr} peça${nErr>1?"s":""} com dado faltando</span>`:""}`}
const novaComp=desc=>({id:uid(),desc:desc||"",peso:"",custo:"",banho:""});
const r4c=x=>Math.round(x*10000)/10000,txtN=x=>String(r4c(x)).replace(".",",");
const CJ_NOMES=["Brincos","Colar","Pulseira","Anel","Pingente","Tornozeleira","Gargantilha"],CJ_COL=["R","S","T","U"];
/* banho que vale para uma peça do conjunto: "" = o banho da linha do conjunto · "-" = sem banho · id = sempre esse banho */
function conjCalc(f){
  const bh=bhDe(f),bp=bonP(f),temBanho=bp.length>0,vars=temBanho?bp:[null];
  const res=vars.map(vb=>{const tot={N:0,P:0,R:0,S:0,T:0,U:0},lin=[];let semMult=false;
    (f.comp||[]).forEach(c=>{const peso=num(c.peso)||0,custo=num(c.custo)||0,
      b=c.banho==="-"?null:(c.banho?(bh.banhos||[]).find(x=>x.id===c.banho)||null:vb);let banho=0,vern=0;
      if(b){const m=num(multItem(f,b,f.v&&f.v.I));if(m==null)semMult=true;else banho=b.modo==="fixo"?m:peso*m;
        const vzv=c.vz==null?vzPad(bh,b):!!c.vz,vv=num(bh.verniz);if(vzv&&vv!=null)vern=peso*vv;tot[b.coluna]=(tot[b.coluna]||0)+banho}
      tot.N+=peso;tot.P+=custo;tot.U+=vern;lin.push({peso,custo,banho,vern,total:custo+banho+vern})});
    return {b:vb,tot,lin,semMult}});
  return {vars:res,temBanho,tot:res[0].tot,lin:res[0].lin};
}
/* ao sair de Conjunto (ou limpar): tira da peça as somas e a descrição automática; as peças ficam guardadas para quando voltar */
function conjLimpar(f){f.v=f.v||{};["N","P",...CJ_COL].forEach(L=>delete f.v[L]);if(f.fConj&&f.v.F===f.fConj)delete f.v.F;delete f.fConj;
  Object.keys(f.ov||{}).forEach(k=>{const o=f.ov[k];if(o&&typeof o==="object"){if(k!=="p"&&k.indexOf("~")<0)CJ_COL.forEach(L=>delete o[L]);if(!Object.keys(o).length)delete f.ov[k]}})}
/* grava as somas na peça: Peso e Compra (iguais em todas as linhas), Banhos e Verniz (de cada banho marcado, em f.ov[banho]) e a Descrição; o Fator × de cada linha dá o Preço de Varejo */
/* foto dos custos de banho/verniz gravados no conjunto: se continuam iguais à última soma, ninguém digitou por cima e o cadastro de galvânicas pode atualizar */
const conjSnap=f=>JSON.stringify([CJ_COL.map(L=>(f.v||{})[L]),Object.keys(f.ov||{}).sort().map(k=>[k,f.ov[k]&&typeof f.ov[k]==="object"?CJ_COL.map(L=>f.ov[k][L]):null])]);
function conjSync(f,dom){
  if(!f.conj||!Array.isArray(f.comp))return;
  const R=conjCalc(f),temComp=f.comp.some(c=>!vazio(c.peso)||!vazio(c.custo));f.v=f.v||{};f.ov=f.ov||{};
  if(temComp){f.v.N=txtN(R.tot.N);f.v.P=txtN(R.tot.P);f.somaNP=1}else if(f.somaNP){delete f.v.N;delete f.v.P;delete f.somaNP}   /* só apaga Peso/Compra se foram as somas do conjunto que os criaram */
  if(R.temBanho){CJ_COL.forEach(L=>delete f.v[L]);
    const ids=R.vars.map(x=>x.b.id);
    R.vars.forEach(x=>{const o=f.ov[x.b.id]=f.ov[x.b.id]||{};CJ_COL.forEach(L=>{if(temComp&&x.tot[L]>0)o[L]=txtN(x.tot[L]);else delete o[L]})});
    Object.keys(f.ov).forEach(k=>{if(!ids.includes(k)&&k!=="p"&&k.indexOf("~")<0){const o=f.ov[k];if(o&&typeof o==="object")CJ_COL.forEach(L=>delete o[L])}})}
  else{CJ_COL.forEach(L=>{if(temComp&&R.tot[L]>0)f.v[L]=txtN(R.tot[L]);else delete f.v[L]});
    Object.keys(f.ov).forEach(k=>{if(k!=="p"&&k.indexOf("~")<0){const o=f.ov[k];if(o&&typeof o==="object")CJ_COL.forEach(L=>delete o[L])}})}
  Object.keys(f.ov).forEach(k=>{const o=f.ov[k];if(o&&typeof o==="object"&&!Object.keys(o).length)delete f.ov[k]});
  const nomes=f.comp.map(c=>String(c.desc||"").trim()).filter(Boolean),auto=nomes.length?"Conjunto "+nomes.join(" + "):"";
  if(vazio(f.v.F)||f.fConj===f.v.F){if(auto)f.v.F=auto;else delete f.v.F;f.fConj=auto}
  f.cjSnap=conjSnap(f);
  if(dom){["N","P","F"].forEach(L=>{const el=document.getElementById("f-"+L);if(el&&document.activeElement!==el)el.value=f.v[L]??""});
    f.comp.forEach((c,i)=>{const e=document.getElementById("cj-c-"+i);if(e)e.innerHTML=conjLinTxt(R,i,c)});
    const t=document.getElementById("conjTot");if(t)t.innerHTML=conjTotHTML(f);
    const sm=document.getElementById("conjSum");if(sm)sm.innerHTML=conjResumoHTML(f);f.comp.forEach((c,i)=>{const e=document.getElementById("cj-e-"+i);if(e)e.textContent=conjErro(f,i)})}
}
const conjLinTxt=(R,i,c)=>{if(c&&!num(c.peso)&&!num(c.custo))return "";return R.temBanho?R.vars.map(x=>`<span>${esc(x.b.nome)} R$ ${brl((x.lin[i]||{}).total||0)}</span>`).join(" "):`R$ ${brl((R.lin[i]||{}).total||0)}`};
/* somatória: uma linha por banho marcado, com peso, compra, banho, verniz, insumos, custo, fator e Preço de Varejo */
function conjTotHTML(f){
  const R=conjCalc(f),q=num(vazio(f.v.Q)?padraoDe(f.v.I,"Q"):f.v.Q)||0,mk=f.mk||{},ov=f.ov||{};
  if(!(f.comp||[]).some(c=>!vazio(c.peso)||!vazio(c.custo)))return `<p class="hint">Preencha o peso e o custo das peças para ver a somatória por banho.</p>`;
  const linhas=R.vars.map(x=>{const id=x.b?x.b.id:"p",t=x.tot,dsc=num(f.desconto)||0,P=dsc>0?r2c(r4c(t.P)-r4c(t.P)*kDesc(dsc)):r4c(t.P),qq=r4c(q),custo=0+P+qq+r4c(t.R)+r4c(t.S)+r4c(t.T)+r4c(t.U),m=num(mk[id]),man=x.b?(ov[id]||{}).V:f.v.V,
    vr=!vazio(man)&&num(man)!=null?num(man):(m?r2c(custo*m):null);
    return `<tr><th>${x.b?`<span class="dot d-${x.b.coluna}"></span>${esc(x.b.letra)} · ${esc(x.b.nome)}`:"Conjunto"}</th><td>${fmt(t.N)} g</td><td>${brl(P)}</td><td>${brl(r4c(t.R)+r4c(t.S)+r4c(t.T))}</td><td>${brl(r4c(t.U))}</td><td>${q?brl(qq):"–"}</td><td><b>${brl(custo)}</b></td><td>${m?fmt(m):"–"}</td><td><b>${vr!=null?"R$ "+brl(vr):"digite o Fator × abaixo"}</b></td></tr>`}).join("");
  const aviso=R.vars.some(x=>x.semMult)?`<p class="hint cj-w">⚠ Um banho usado aqui está sem o R$ por grama (Cadastros › Galvânicas): o custo dela entra como zero.</p>`:"";
  return `<table class="cj-s"><thead><tr><th>Somatória</th><th>Peso</th><th>Compra</th><th>Banho</th><th>Verniz</th><th>Insumos</th><th>Custo</th><th>Fator ×</th><th>Varejo</th></tr></thead><tbody>${linhas}</tbody></table>${aviso}`}
function conjPainel(f){
  const bh=banhistaBy(f.banhista),R=conjCalc(f),nB=R.temBanho,v0=R.vars[0].b;
  const optB=c=>`<option value="" ${!c.banho?"selected":""}>${nB?"banho do conjunto":"sem banho"}</option>${(bh.banhos||[]).map(b=>`<option value="${esc(b.id)}" ${c.banho===b.id?"selected":""}>${nB?"só ":""}${esc(b.letra)} · ${esc(b.nome)}</option>`).join("")}${nB?`<option value="-" ${c.banho==="-"?"selected":""}>sem banho</option>`:""}`;
  const efe=c=>c.banho==="-"?null:(c.banho?(bh.banhos||[]).find(x=>x.id===c.banho)||null:v0);
  const jaLancadas=S.lanc.filter(l=>!l.conj&&l.id!==editId&&(num(l.v.N)!=null||num(l.v.P)!=null)).slice(-200).reverse();
  return `<div class="conj" id="conj"><div class="conj-h"><b>Peças do conjunto</b><span class="hint">1) escolha as peças · 2) preencha nome, peso e custo de cada uma · 3) marque os banhos do conjunto abaixo: sai uma linha de conjunto para cada · <b>Enter</b> avança, <b>Ctrl+Enter</b> adiciona</span></div>
  <div class="conj-sum" id="conjSum">${conjResumoHTML(f)}</div>
  <div class="conj-b cj-q"><span class="hint">Adicionar:</span>${CJ_NOMES.map(n=>`<button type="button" class="gi tod" data-act="comp-add" data-nome="${esc(n)}">＋ ${esc(n)}</button>`).join("")}<button type="button" class="gi tod" data-act="comp-add">＋ outra</button>${jaLancadas.length?`<select class="cj-pick" data-cjpick aria-label="Trazer uma peça já lançada" title="Traz descrição, peso e custo de uma peça que você já lançou"><option value="">＋ trazer peça já lançada…</option>${jaLancadas.map(l=>`<option value="${esc(l.id)}">${esc(((G&&G.refs[l.id])||[])[0]||"")} · ${esc(String(l.v.F||"").slice(0,40))} · ${esc(l.v.N||"?")} g · R$ ${esc(l.v.P||"?")}</option>`).join("")}</select>`:""}</div>
  <div class="conj-r conj-hd" aria-hidden="true"><span></span><span>Peça</span><span>Peso (g)</span><span>Compra (R$)</span><span>Banho</span><span>Verniz</span><span>Custo da peça</span><span></span></div>
  ${(f.comp||[]).map((c,i)=>{const e=efe(c),er=conjErro(f,i),iv=ok=>er&&ok?' aria-invalid="true"':"";return `<div class="cj-i"><div class="conj-r" data-ci="${i}"><span class="cj-no" aria-hidden="true">${i+1}</span><input class="cj-d" data-cp="desc" value="${esc(c.desc||"")}" placeholder="Peça (ex.: Brincos)" aria-label="Peça ${i+1} do conjunto: nome"${iv(vazio(c.desc))}><input class="n cj-n" data-cp="peso" value="${esc(c.peso||"")}" placeholder="g" inputmode="decimal" aria-label="Peça ${i+1}: peso em gramas"${iv(vazio(c.peso)||num(c.peso)==null||num(c.peso)<=0)}><input class="n cj-n" data-cp="custo" value="${esc(c.custo||"")}" placeholder="R$" inputmode="decimal" aria-label="Peça ${i+1}: custo de compra"${iv(vazio(c.custo)||num(c.custo)==null||num(c.custo)<0)}><select data-cp="banho" aria-label="Peça ${i+1}: banho" title="Banho desta peça: o do conjunto (muda em cada linha de banho) ou fixo só para ela">${optB(c)}</select><label class="vchk" title="Verniz da galvânica nesta peça"><input type="checkbox" data-cp="vz" aria-label="Peça ${i+1}: verniz" ${(c.vz==null?(e?vzPad(bh,e):false):c.vz)?"checked":""} ${e?"":"disabled"}> verniz</label><span class="cj-c" id="cj-c-${i}" title="Custo desta peça: compra + banho + verniz">${conjLinTxt(R,i,c)}</span><span class="cj-act"><button type="button" class="x" data-act="comp-up" data-ci="${i}" ${i===0?"disabled":""} aria-label="Subir a peça ${i+1}" title="Subir (muda a ordem no nome do conjunto)">↑</button><button type="button" class="x" data-act="comp-down" data-ci="${i}" ${i===(f.comp.length-1)?"disabled":""} aria-label="Descer a peça ${i+1}" title="Descer">↓</button><button type="button" class="x" data-act="comp-dup" data-ci="${i}" aria-label="Repetir a peça ${i+1}" title="Repetir esta peça (copia peso, custo e banho)">⧉</button><button type="button" class="x" data-act="comp-del" data-ci="${i}" aria-label="Tirar a peça ${i+1} do conjunto" title="Tirar esta peça">×</button></span></div><div class="cj-e" id="cj-e-${i}" role="status">${esc(er)}</div></div>`}).join("")}
  <div class="conj-t" id="conjTot">${conjTotHTML(f)}</div></div>`}
/* Enter anda entre os campos da peça do conjunto: descrição → peso → custo → próxima peça (na última, cria outra); Ctrl+Enter adiciona o conjunto */
document.addEventListener("keydown",e=>{const t=e.target;
  if(!t||!t.dataset||!t.dataset.cp||!t.closest||!t.closest("#conj")||e.key!=="Enter"||e.ctrlKey||e.metaKey||e.shiftKey||t.tagName==="SELECT")return;
  const ordem=["desc","peso","custo"],k=t.dataset.cp;if(!ordem.includes(k))return;
  e.preventDefault();const row=t.closest("[data-ci]"),i=+row.dataset.ci;
  if(k!=="custo"){const nx=row.querySelector(`[data-cp="${ordem[ordem.indexOf(k)+1]}"]`);if(nx){nx.focus();try{nx.select()}catch(x){}}return}
  const prox=document.querySelector(`#conj [data-ci="${i+1}"] [data-cp="desc"]`);
  if(prox){prox.focus();try{prox.select()}catch(x){}return}
  const f=S.form,c=f.comp&&f.comp[i];if(c&&(!vazio(c.custo)||!vazio(c.peso))&&f.comp.length<60){f.comp.push(novaComp());conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${i+1}"] [data-cp="desc"]`)}
},true);
function atualizarGera(){
  const el=document.getElementById("gera");if(!el)return;const f=S.form,g=previsao(),id=editId||"__p";
  const rows=g.linhas.filter(r=>r.lancId===id),ri0=g.linhas.findIndex(r=>r.lancId===id);let h="";
  const grf=gradeBy(f.grade);
  if(grf&&!(f.gsel||[]).length&&!(f.csel||[]).length)h=`<span class="warn">Escolha ${esc(grf.nome.toLowerCase())} acima.</span>`;
  else if(!rows.length)h=`<span class="warn">${f.tipo==="bruta"?"Marque pelo menos um banho.":""}</span>`;
  rows.forEach(r=>{const q=num(r.v.W);h+=`<span class="ch${r.dup?" dupe":""}" title="${esc(r.v.F)}${r.dup?" · referência repetida":""}">${esc(r.v.E)}${q>0?` · ${q}`:""}</span>`});
  if(g.semQ&&g.semQ[id])h+=`<span class="warn" title="Quando só algumas combinações têm quantidade, as sem quantidade não viram linha">⚠ ${g.semQ[id]} combinação(ões) sem quantidade ficam de fora da tabela.</span>`;
  if(erro&&!h.includes(">"+esc(erro)+"<"))h+=`<span class="err">${esc(erro)}</span>`;
  el.innerHTML=h;
  {const el2=document.getElementById("custos");if(el2){const ix=L=>LET.indexOf(L);let linhas=rows.slice(0,8).map((r,k)=>{const cs=celulas(r,ri0+k+2,true),n=L=>{const x=cs[ix(L)];return x&&typeof x.v==="number"?x.v:x&&x.v==null&&typeof x.calc==="number"?x.calc:null},P=n("P"),Q=n("Q"),B=r.banho?n(r.banho.coluna):(()=>{const q=["R","S","T"].map(L=>n(L));return q.some(x=>x!=null)?q.reduce((a,x)=>a+(x||0),0):null})(),U=n("U"),V=n("V"),peso=num(r.v.N),pt=[];
      if(P==null&&B==null&&U==null)return "";
      if(P!=null)pt.push(`Compra <b>${brl(P)}</b>${r.desconto>0?` <small>(com ${fmt(r.desconto)}% de desconto)</small>`:""}`);
      if(Q!=null)pt.push(`Insumos <b>${brl(Q)}</b>`);
      if(r.banho){const how=r.banho.modo==="fixo"?`valor fixo R$ ${fmt(r.banho.mult)}`:(peso!=null&&r.banho.mult!=null?`${fmt(peso)} g × R$ ${fmt(r.banho.mult)}/g`:"falta peso ou valor do banho");pt.push(`Banho <b>${B!=null?brl(B):"—"}</b> <small>(${how})</small>`)}
      if(U!=null)pt.push(`Verniz <b>${brl(U)}</b> ${r.verniz!=null?`<small>(${fmt(peso)} g × R$ ${fmt(r.verniz)}/g)</small>`:""}`);
      const custo=[P,Q,B,U].reduce((a,x)=>a+(x||0),0),mk=(custo>0&&V!=null&&cs[LET.indexOf("V")]&&!cs[LET.indexOf("V")].f)?Math.round(V/custo*100)/100:(r.mk||(custo>0&&V!=null?Math.round(V/custo*100)/100:null));
      return `<div class="ck-l"><b>${esc(r.v.E)}</b>${r.v.L?` <small>${esc(r.v.L)}</small>`:""}: ${pt.join(" + ")||"<small>sem custos ainda</small>"} = <b>Custo ${brl(custo)}</b>${V!=null?` · ${mk?`× fator <b>${fmt(mk)}</b>${r.mk?"":" <small>(calculado do preço digitado)</small>"} `:""}= Varejo <b>${brl(V)}</b>`:""}</div>`}).join("");
    if(rows.length>8)linhas+=`<div class="ck-l"><small>…e mais ${rows.length-8} linha(s)</small></div>`;
    el2.innerHTML=linhas.replace(/<div class="ck-l"><small>…e mais[^]*$/,m=>m)&&linhas.indexOf("ck-l")>=0&&/ck-l"><b>/.test(linhas)?`<details class="custos" data-open="custos" ${abertos.custos===false?"":"open"}><summary>De onde vem o custo <small>(Compra + Insumos + Banho + Verniz = Custo; Custo × fator = Varejo)</small></summary>${linhas}</details>`:""}}
  {const visto=new Set();rows.forEach((r,k)=>{const kb=String(r.bid||r.key);if(visto.has(kb))return;visto.add(kb);
    const cs=celulas(r,ri0+k+2,true),n=L=>{const x=cs[LET.indexOf(L)];return x&&typeof x.v==="number"?x.v:null},P=n("P"),Q=n("Q"),B=r.banho?n(r.banho.coluna):(()=>{const q=["R","S","T"].map(L=>n(L));return q.some(x=>x!=null)?q.reduce((a,x)=>a+(x||0),0):null})(),U=n("U"),V=n("V"),
      partes=[["compra",P],["insumos",Q],["banho",B],["verniz",U]].filter(x=>x[1]!=null),custo=partes.reduce((a,x)=>a+x[1],0),mk=(custo>0&&V!=null&&cs[LET.indexOf("V")]&&!cs[LET.indexOf("V")].f)?Math.round(V/custo*100)/100:(r.mk||(custo>0&&V!=null?Math.round(V/custo*100)/100:null));
    const sp=document.querySelector(`[data-bf="${CSS.escape(kb)}"]`);
    const inc=r.banho&&B==null;if(sp)sp.innerHTML=custo>0?`${inc?`<span class="bfx-n">sem peso: banho e verniz não entram na base (normal em peça pronta/banhada).</span> `:""}Base do fator <b>R$ ${brl(custo)}</b> <span class="bfx-d">= ${partes.map(x=>x[0]+" "+brl(x[1])).join(" + ")}</span>${mk&&V!=null?` · × ${fmt(mk)} = <b>R$ ${brl(V)}</b>`:""}`:"";
    const mi=document.querySelector(`[data-mk="${CSS.escape(kb)}"]`);if(mi&&mi.tagName==="INPUT")mi.placeholder=!r.mk&&mk&&!inc?fmt(mk):(fatorBanho(kb)||"×")})}
  rows.forEach((r,k)=>{if(!r.banho)return;const cel=celulas(r,ri0+k+2)[LET.indexOf(r.banho.coluna)],sp=document.querySelector(`[data-cb="${CSS.escape(String(r.bid||r.key))}"]`);
    if(sp)sp.textContent=cel&&typeof cel.v==="number"?"banho R$ "+brl(cel.v):(cel&&cel.f?"="+cel.f:(pesoLinha(r)==null&&r.banho.modo!=="fixo"?"⚠ informe o peso":"sem valor na galvânica"))});
  rows.forEach((r,k)=>{const x=celulas(r,ri0+k+2,true)[LET.indexOf("V")],ph=r.mk&&x&&x.f&&typeof x.v==="number"?brl(x.v)+" (×"+fmt(r.mk)+")":"";
    const kb=r.bid||r.key,i=document.querySelector(kb==="p"?"#f-V":`[data-ph="${kb}-V"]`);if(i&&i.tagName==="INPUT")i.placeholder=ph});
  // dicas (placeholder) com o que vai entrar quando o campo fica vazio
  const setPh=(sel,t)=>{const i=document.querySelector(sel);if(i&&i.tagName==="INPUT")i.placeholder=t};
  if(rows[0])setPh('[data-ph="E"]',rows[0].v.E.replace(/([0-9])[A-Z][A-Z0-9]*$/,"$1"));
  rows.forEach((r,k)=>{
    if(!r.banho)return;const c=celulas({...r,v:{...r.v,[r.banho.coluna]:""},ovs:[]},ri0+k+2),x=c[LET.indexOf(r.banho.coluna)];
    setPh(`[data-ph="${r.bid||r.key}-${r.banho.coluna}"]`,x?(x.f?`${fmt(x.v)} (=${x.f.replace(/N\d+/,"Peso")})`:fmt(x.v)):"Peso × valor");
    if(!r.gi)setPh(`[data-ph="${r.key}-F"]`,r.v0.F||"");
    {const u=calcBanho({...r},"U",ri0+k+2);setPh(`[data-ph="${r.bid||r.key}-U"]`,u?`${fmt(u.v)} (=Peso×${r.verniz})`:(r.verniz==null?"sem verniz":"Peso × verniz"))}
  });
}

function renderFormSoon(){clearTimeout(renderFormSoon.t);renderFormSoon.t=setTimeout(()=>{const a=document.activeElement&&document.activeElement.id;renderForm();if(a)refocar("#"+a)},0)}
function ajustarAltura(){const f=document.getElementById("form");if(!f||f.classList.contains("auto-mini"))return;const h=Math.ceil(f.getBoundingClientRect().height);document.documentElement.style.setProperty("--fh",h+"px")}
window.addEventListener("resize",ajustarAltura);
const roForm=typeof ResizeObserver!=="undefined"?new ResizeObserver(()=>ajustarAltura()):null;
let foraDaPlanilha=false;
(function(){const sp=document.getElementById("splitter"),app=document.getElementById("app");
  try{const v=localStorage.getItem("cadpecas-split");if(v)document.documentElement.style.setProperty("--split",v)}catch(e){}
  sp.addEventListener("mousedown",e=>{e.preventDefault();sp.classList.add("on");document.body.classList.add("splitting");const top=app.getBoundingClientRect().top,H=app.clientHeight;
    const mv=ev=>{const y=Math.min(Math.max(ev.clientY-top,120),H-130);document.documentElement.style.setProperty("--split",y+"px")};
    const up=()=>{document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);sp.classList.remove("on");document.body.classList.remove("splitting");try{localStorage.setItem("cadpecas-split",getComputedStyle(document.documentElement).getPropertyValue("--split").trim())}catch(x){}};
    document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up)});
  sp.addEventListener("dblclick",()=>{document.documentElement.style.setProperty("--split","48%");try{localStorage.removeItem("cadpecas-split")}catch(x){}});
})();
function rolarPane(el){if(!el)return;visPara(el.closest&&el.closest("#cfg")?"cad":"lancar",true);if(celular()&&el.id==="romWrap")formAbrir(false);if(celular()){el.scrollIntoView({block:"start",behavior:"smooth"});return}
  const pb=document.getElementById("paneBot");if(pb)pb.scrollTo({top:pb.scrollTop+el.getBoundingClientRect().top-pb.getBoundingClientRect().top-6,behavior:"smooth"})}
function irPara(id){
  if(id==="lancar"&&celular()){visPara("lancar");formAbrir(true);return}
  if(id==="lancar"){visPara("lancar");document.getElementById("paneBot").scrollTo({top:0,behavior:"smooth"});refocar("#f-F");return}
  visPara("cad");abertos.tab=id;guardarAbertos();renderCfg();const d=document.querySelector("#cfg .ctabs");if(d)rolarPane(d);
}
