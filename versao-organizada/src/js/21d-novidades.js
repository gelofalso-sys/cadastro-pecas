/* ===== "O que mudou": últimas novidades, para conferir o que veio na versão publicada ===== */
const NOVIDADES=[
  {d:"2026-11-12",t:"Lote em qualquer cadastro, apelidos e fiscal em massa",i:["Criar em lote (N peças numeradas 1/N) no formulário e “⊞ em lote” em qualquer item do romaneio; dá para desativar","Apelidos de categoria e subcategoria: digitar “argolinhas” já escolhe Brincos › Argolas e o prefixo","Fiscal (NCM, CFOP, FCP) e insumos de todas as categorias numa tabela só","Anel no lugar de “Anél”; instalação nova começa sem galvânica, fornecedores nem observações","Palavras da categoria/subcategoria acima da descrição, com preenchimento automático e banco de palavras"]},
  {d:"2026-11-11",t:"Lotes por grama, banho sem cálculo e abertura resiliente",i:["Valor do lote por grama rateado pelo peso informado, recalculado a cada item","Banho com letra, cor, cálculo e coluna opcionais; categoria “Sem banho” e “Compra por grama”","Tela de recuperação mostra a etapa que falhou e permite abrir mesmo assim; Diagnóstico dos dados"]},
  {d:"2026-11-10",t:"Romaneio sem bloqueios",i:["Alertas no lugar de bloqueios ao criar peças do romaneio","Peça nova fora da lista, foto por item e insumos próprios do romaneio rateados","Baixar .xlsx só das peças selecionadas"]}];
function novidadesAbrir(){
  repModal(`<div class="rep-h"><div><b class="rep-t">O que mudou</b><div class="hint">Versão ${esc(((document.querySelector(".build-version")||{}).textContent||"").replace(/·.*$/,"").replace("Versão","").trim())}</div></div><div class="rep-ac"><button type="button" class="btn pri sm" data-act="rel-fechar">Fechar</button></div></div><div class="rep-b">${NOVIDADES.map(n=>`<h4 style="margin:10px 0 2px">${esc(n.d.split("-").reverse().join("/"))} · ${esc(n.t)}</h4><ul style="margin:0 0 6px 18px">${n.i.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`).join("")}</div>`)}

/* mensagem de erro no próprio campo (ao lado), além do aviso passageiro */
function campoMsg(t,msg){
  if(!t||!t.parentElement)return;let s=t.parentElement.querySelector(":scope > .campo-msg");
  if(!msg){t.removeAttribute("aria-invalid");t.classList.remove("bad");if(s)s.remove();return}
  t.setAttribute("aria-invalid","true");t.classList.add("bad");
  if(!s){s=document.createElement("small");s.className="campo-msg";s.setAttribute("role","alert");t.insertAdjacentElement("afterend",s)}
  s.textContent=msg}

/* ===== simulador de fator × margem ===== */
function custoLinhaDe(g,r){const gi=g.linhas.indexOf(r),cs=celulas(r,gi+2),nv=k=>{const c=cs[LET.indexOf(k)];return c&&typeof c.v==="number"?c.v:c&&typeof c.calc==="number"?c.calc:0};return r2c(["P","Q","R","S","T","U"].reduce((t,k)=>t+nv(k),0))}
function simuladorFator(){
  const g=previsao(),meu=editId||"__p",rows=g.linhas.filter(r=>r.lancId===meu).slice(0,4);
  const custos=rows.map(r=>({r,custo:custoLinhaDe(g,r)})).filter(x=>x.custo>0);
  if(!custos.length){toast("Preencha o peso e o custo de compra da peça para simular o fator.");return}
  const fatores=[1.5,2,2.5,3,3.5,4,4.5,5],tab=x=>{const atual=num(x.r.mk);return `<div class="sim-t"><b>${esc(x.r.v.E||"linha")}</b> · custo R$ ${brl(x.custo)}${atual?` · fator atual ${fmt(atual)}`:""}<table class="cfg"><thead><tr><th>Fator ×</th><th class="n">Varejo</th><th class="n">Lucro R$</th><th class="n">Margem</th><th></th></tr></thead><tbody>${fatores.map(f=>{const v=r2c(x.custo*f),l=r2c(v-x.custo);return `<tr${atual===f?' class="sim-at"':""}><td>${fmt(f)}</td><td class="n">R$ ${brl(v)}</td><td class="n">R$ ${brl(l)}</td><td class="n">${fmt(Math.round(l/v*1000)/10)}%</td><td><button type="button" class="btn sm" data-act="sim-usar" data-bid="${esc(x.r.bid||"p")}" data-fator="${f}">Usar</button></td></tr>`}).join("")}</tbody></table></div>`};
  repModal(`<div class="rep-h"><div><b class="rep-t">Simular fator</b><div class="hint">Varejo = custo × fator. Escolha “Usar” para aplicar o fator na peça que está sendo lançada.</div></div><div class="rep-ac"><button type="button" class="btn pri sm" data-act="rel-fechar">Fechar</button></div></div><div class="rep-b">${custos.map(tab).join("")}</div>`)}

/* ===== aviso de impacto: quando um cadastro muda e as peças já criadas passam a custar outro valor ===== */
let impConfigAntes=null,impT=null;
/* Compara a MESMA lista de peças com os cadastros anterior e atual. Uma edição de
   peça ocorrida antes do cadastro não pode ser atribuída à alteração do cadastro. */
function custoPorLanc(config,pecas){const anterior=S.config;try{S.config=config;const g=gerar(clone(pecas)),m={};g.linhas.forEach(r=>{const q=num(r.v.W);m[r.lancId]=(m[r.lancId]||0)+custoLinhaDe(g,r)*(q==null?1:q)});return m}finally{S.config=anterior}}
function impactoAgendar(){if(typeof restaurando!=="undefined"&&restaurando)return;
  if(!impT){try{impConfigAntes=snapC?JSON.parse(snapC):null}catch(e){impConfigAntes=null}}
  clearTimeout(impT);impT=setTimeout(impactoConferir,1500)}
function impactoConferir(){const anterior=impConfigAntes;impConfigAntes=null;impT=null;if(!anterior)return;
  let antes,depois;try{const pecas=clone(S.lanc);antes=custoPorLanc(anterior,pecas);depois=custoPorLanc(S.config,pecas)}catch(e){return}
  let n=0,a=0,b=0;Object.keys(depois).forEach(id=>{if(!(id in antes))return;const x=antes[id],y=depois[id];if(Math.abs(x-y)>=0.005){n++;a+=x;b+=y}});
  if(n)toast(`Esta mudança alterou o custo de ${n} peça(s) já criadas: de R$ ${brl(r2c(a))} para R$ ${brl(r2c(b))} (${b>=a?"+":"−"}R$ ${brl(r2c(Math.abs(b-a)))}).`)}

/* ===== primeiros passos (instalação nova) ===== */
function primeirosHtml(){
  const C=cfg();if(abertos.primeiros===false||S.lanc.length>=3)return "";
  const passos=[["banho","Cadastre a galvânica e os banhos",C.banhistas.length>0,"Nome, banhos (ouro, prata…) e valor por grama"],["cat","Confira as categorias",true,"Prefixos, apelidos e fiscal de cada uma"],["forn","Cadastre os fornecedores",C.fornecedores.length>0,"Desconto e tipo (bruta/pronta) de cada um"],["lancar","Lance a primeira peça ou importe um romaneio",S.lanc.length>0,"Pelo formulário abaixo ou em Importar romaneio"]];
  if(passos[0][2]&&passos[2][2]&&S.lanc.length)return "";
  return `<div class="primeiros" role="region" aria-label="Primeiros passos"><b>Primeiros passos</b><span>Já tem uma planilha? Importe a última em Cadastros › Importar e backup para continuar a numeração.</span>${passos.map((p,i)=>`<button type="button" class="prim-p ${p[2]?"ok":""}" data-act="prim-ir" data-p="${p[0]}" title="${esc(p[3])}"><span>${i+1}</span> ${esc(p[1])}</button>`).join("")}<button type="button" class="btn ghost sm" data-act="prim-fechar" title="Não mostrar mais">Dispensar</button></div>`}
/* atualiza o cartão de primeiros passos só na abertura e depois de ações explícitas (não a cada clique: o cartão aparecendo e sumindo deslocaria a tela) */
function primeirosAtualizar(){const pw=document.getElementById("primeirosWrap");if(pw)pw.innerHTML=primeirosHtml()}
setTimeout(primeirosAtualizar,1200);
function primeirosIr(p){
  const C=cfg();
  if(p==="banho"&&!C.banhistas.length){C.banhistas.push({id:uid(),nome:"Galvânica 1",verniz:"0.42",vernizOn:true,banhos:clone(BANHISTA0.banhos)});if(!S.form.banhista)S.form.banhista=C.banhistas[0].id;if(typeof marcadosPadrao==="function"&&!Object.values(S.form.on||{}).some(Boolean))marcadosPadrao(S.form);salvar(true,false);render()}
  if(celular())formAbrir(false);
  if(p==="lancar"){const f=document.getElementById("f-F");if(f){f.scrollIntoView({block:"center",behavior:"smooth"});f.focus({preventScroll:true})}return}
  irPara(p==="banho"?"banho":p==="cat"?"cat":"forn")}

/* ===== arrastar e soltar para reordenar categorias e banhos (as setas continuam valendo) ===== */
let DRAG=null;
document.addEventListener("dragstart",e=>{const h=e.target.closest&&e.target.closest("[data-dk]");if(!h)return;DRAG={k:h.dataset.dk,i:+h.dataset.di,bi:h.dataset.bi!=null?+h.dataset.bi:null};try{e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain","reordenar")}catch(x){}});
document.addEventListener("dragover",e=>{if(!DRAG)return;const alvo=DRAG.k==="cat"?e.target.closest(".card[data-cat]"):e.target.closest("tr[data-bn]");if(alvo){e.preventDefault();alvo.classList.add("dh-alvo")}});
document.addEventListener("dragleave",e=>{const a=e.target.closest&&e.target.closest(".dh-alvo");if(a)a.classList.remove("dh-alvo")});
document.addEventListener("dragend",()=>{DRAG=null;document.querySelectorAll(".dh-alvo").forEach(x=>x.classList.remove("dh-alvo"))});
document.addEventListener("drop",e=>{
  if(!DRAG)return;const C=cfg(),d=DRAG;DRAG=null;document.querySelectorAll(".dh-alvo").forEach(x=>x.classList.remove("dh-alvo"));
  if(d.k==="cat"){const a=e.target.closest(".card[data-cat]");if(!a)return;e.preventDefault();const para=+a.dataset.cat;if(para===d.i||isNaN(para))return;const [c]=C.categorias.splice(d.i,1);C.categorias.splice(para,0,c);salvar(true,false);render();toast(`“${c.nome}” movida para a posição ${para+1}.`)}
  else if(d.k==="bn"){const tr=e.target.closest("tr[data-bn]"),bl=tr&&tr.closest("[data-bh]");if(!tr||!bl||+bl.dataset.bh!==d.bi)return;e.preventDefault();const para=+tr.dataset.bn,b=C.banhistas[d.bi];if(!b||para===d.i)return;const [x]=b.banhos.splice(d.i,1);b.banhos.splice(para,0,x);salvar(true,false);render();toast(`Banho “${x.nome}” movido para a posição ${para+1}.`)}
});

/* ===== histórico legível das últimas alterações (com "voltar antes desta") ===== */
function histDescrever(antesL,depoisL,e){
  try{const A=JSON.parse(antesL),B=JSON.parse(depoisL),ma=new Map(A.map(l=>[l.id,JSON.stringify(l)])),mb=new Map(B.map(l=>[l.id,JSON.stringify(l)]));
    let add=0,del=0,mud=0;mb.forEach((v,id)=>{if(!ma.has(id))add++;else if(ma.get(id)!==v)mud++});ma.forEach((v,id)=>{if(!mb.has(id))del++});
    const p=[];if(add)p.push(`criou ${add} peça(s)`);if(mud)p.push(`alterou ${mud} peça(s)`);if(del)p.push(`excluiu ${del} peça(s)`);
    if(!p.length)return e.soCfg?"mudou cadastros (categorias, banhos, fornecedores…)":"alteração";
    return (e.R?"romaneio: ":"")+p.join(", ")}catch(x){return "alteração"}}
function historicoAbrir(){
  const n=HIST.length;if(!n){toast("Ainda não há alterações para listar.");return}
  const atual=JSON.stringify(S.lanc),ini=Math.max(0,n-15),linhas=[];
  for(let k=n-1;k>=ini;k--){const e=HIST[k],depois=k===n-1?atual:HIST[k+1].L;linhas.push({k,desc:histDescrever(e.L,depois,e),t:e.t||0,volta:n-k})}
  const ago=t=>{const s=Math.max(0,Math.round((Date.now()-t)/1000));return s<60?"agora há pouco":s<3600?`há ${Math.round(s/60)} min`:s<86400?`há ${Math.round(s/3600)} h`:new Date(t).toLocaleDateString("pt-BR")};
  repModal(`<div class="rep-h"><div><b class="rep-t">Histórico de alterações</b><div class="hint">As ${linhas.length} mais recentes. “Voltar antes desta” desfaz esta alteração e todas as mais novas.</div></div><div class="rep-ac"><button type="button" class="btn pri sm" data-act="rel-fechar">Fechar</button></div></div><div class="rep-b"><div class="rep-tb"><table><tbody>${linhas.map(l=>`<tr><td>${esc(ago(l.t))}</td><td>${esc(l.desc)}</td><td><button type="button" class="btn sm" data-act="hist-voltar" data-n="${l.volta}">Voltar antes desta</button></td></tr>`).join("")}</tbody></table></div></div>`)}

/* ===== lembrete de backup logo depois de criar peças de um romaneio ===== */
function backupLembrarPosCriar(){
  try{const u=Math.max(+localStorage.getItem("cadpecas-bk-em")||0,+localStorage.getItem("cadpecas-bk-ult")||0);if(Date.now()-u<20*3600*1000)return;
    setTimeout(()=>toast("Peças criadas. Faça um backup agora para não perder este trabalho.",{t:"Baixar backup",fn:()=>backupTotal()}),1800)}catch(e){}}

/* ===== de onde vêm os dados: cada endereço/arquivo guarda os seus, separados ===== */
function origemAviso(){
  try{if(localStorage.getItem("cadpecas-origem-ok"))return;
    const web=/^https?:$/.test(location.protocol),txt=web?"Site publicado: os dados daqui ficam só neste navegador e são separados do arquivo local. Para levar peças e cadastros de um para o outro, use Backup completo e Restaurar.":"Arquivo local: os dados ficam só neste navegador e são separados do site publicado. Para levar peças e cadastros entre eles, use Backup completo e Restaurar.";
    const mk=()=>{const d=document.createElement("div");d.className="origem-aviso";d.setAttribute("role","note");d.innerHTML=`<span><b>Nota:</b> ${esc(txt)}</span><button type="button" class="btn sm" data-act="origem-ok">Entendi</button>`;return d};
    /* no menu lateral e no menu do celular: nunca no meio da tela de trabalho, para não deslocar a tabela */
    const side=document.getElementById("side"),pn=document.querySelector("#mobileMenu .mobile-menu-panel");
    if(side&&!side.querySelector(".origem-aviso"))side.appendChild(mk());
    if(pn&&!pn.querySelector(".origem-aviso"))pn.insertBefore(mk(),pn.firstChild)}catch(e){}}
origemAviso();   /* já na abertura: aparecer depois deslocaria a tela */
