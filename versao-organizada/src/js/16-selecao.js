/* ===== seleção de células, linhas e colunas (como no Excel) ===== */
let selR=null,arrastando=false;
const vis=r=>!FV||!G||r>=G.linhas.length||FV.has(r);
function passo(r,d,max){let n=r+d;while(n>=0&&n<=max&&!vis(n))n+=d;return n<0||n>max?r:n}
function maxRi(){if(JAN)return JAN.lista[JAN.lista.length-1];let m=-1;document.querySelectorAll('#sheet tbody tr[data-ri]').forEach(t=>m=Math.max(m,+t.dataset.ri));return m}
function selBox(){if(!selR)return null;return {r1:Math.min(selR.ar,selR.fr),r2:Math.max(selR.ar,selR.fr),c1:Math.min(selR.ac,selR.fc),c2:Math.max(selR.ac,selR.fc)}}
function selecionar(ar,ac,fr,fc){selR={ar,ac,fr:fr??ar,fc:fc??ac};pintarSel();renderSelBar()}
function pintarSel(){
  document.querySelectorAll('#sheet .sl,#sheet .sa').forEach(x=>x.classList.remove('sl','sa'));const b=selBox();if(!b)return;
  for(let r=b.r1;r<=b.r2;r++){if(!vis(r))continue;const tr=document.querySelector(`#sheet tr[data-ri="${r}"]`);if(!tr)continue;for(let c=b.c1;c<=b.c2;c++){const td=tr.querySelector(`td[data-c="${LET[c]}"]`);if(td)td.classList.add('sl')}}
  const a=document.querySelector(`#sheet tr[data-ri="${selR.fr}"] td[data-c="${LET[selR.fc]}"]`);if(a)a.classList.add('sa');
  for(let c=b.c1;c<=b.c2;c++){const th=document.querySelector(`#sheet th[data-hc="${LET[c]}"]`);if(th)th.classList.add('sl')}
}
function rolarAte(){if(JAN&&selR)janGarantir(selR.fr);const a=document.querySelector('#sheet td.sa');if(a)a.scrollIntoView({block:'nearest',inline:'nearest'})}
function textoCel(ri,ci){const row=G.linhas[ri];if(!row)return "";const x=celulas(row,ri+2)[ci];if(!x)return "";if(typeof x.v==="number")return (DUAS.has(LET[ci])?r2c(x.v).toFixed(2):String(r4(x.v))).replace(".",",");if(x.v==null)return x.txt||("="+x.f);return String(x.v)}
function idsDaSel(){const b=selBox();if(!b)return [];const s=new Set();for(let r=b.r1;r<=b.r2;r++){if(!vis(r))continue;const row=G.linhas[r];if(row)s.add(row.lancId)}return [...s]}
function copiarSel(){const b=selBox();if(!b)return;const lin=[];for(let r=b.r1;r<=b.r2;r++){if(!vis(r))continue;const l=[];for(let c=b.c1;c<=b.c2;c++)l.push(textoCel(r,c));lin.push(l.join("\t"))}
  navigator.clipboard.writeText(lin.join("\n")).then(()=>toast(`${(b.r2-b.r1+1)*(b.c2-b.c1+1)} célula(s) copiada(s).`)).catch(()=>toast("O navegador não liberou a cópia. Use Copiar para o Excel."))}
function limparSel(){const b=selBox();if(!b)return;const antes={};let n=0;
  {const lin=b.r2-b.r1+1,col=b.c2-b.c1+1;if(lin>=3||lin*col>20){if(!confirm(`Limpar ${lin} linha(s) × ${col} coluna(s) de células? (Ctrl+Z desfaz; um ponto de restauração é guardado antes)`))return;pontoAuto("antes de limpar células",true)}}
  for(let r=b.r1;r<=Math.min(b.r2,G.linhas.length-1);r++){if(!vis(r))continue;const row=G.linhas[r],l=S.lanc.find(x=>x.id===row.lancId);if(!l)continue;if(!(l.id in antes))antes[l.id]=clone(l.ov||{});
    for(let c=b.c1;c<=b.c2;c++){const L=LET[c];if(L==="E")continue;gravarCel(r,L,"");n++}}
  if(!n)return;undo={tipo:"multi",antes};salvar(false);renderTopo();if(editId)renderForm();toast(`${n} célula(s) limpa(s).`,{t:"Desfazer",fn:desfazer})}
function preencherAbaixo(){const b=selBox();if(!b||b.r2<=b.r1||!G.linhas[b.r1])return;const antes={},src=G.linhas[b.r1];
  for(let r=b.r1+1;r<=Math.min(b.r2,G.linhas.length-1);r++){if(!vis(r))continue;const row=G.linhas[r],l=S.lanc.find(x=>x.id===row.lancId);if(!l)continue;if(!(l.id in antes))antes[l.id]=clone(l.ov||{});
    for(let c=b.c1;c<=b.c2;c++){const L=LET[c];if(L==="E")continue;const v=src.banho&&FORMULA.has(L)&&!src.ovs.includes(L)?"":String(src.v[L]??"");gravarCel(r,L,v)}}
  undo={tipo:"multi",antes};salvar(false);renderTopo();if(editId)renderForm();toast("Preenchido para baixo.",{t:"Desfazer",fn:desfazer})}
/* Mostra a conta da linha selecionada sem alterar a fórmula nem o valor da peça. */
function detalheCelulaSelecionada(row,L,ri){
  if(!row||!["P","Q","R","S","T","U","V"].includes(L))return "";
  const x=celulas(row,ri+2)[LET.indexOf(L)],valor=x&&typeof x.v==="number"?x.v:x&&typeof x.calc==="number"?x.calc:null;
  const l=S.lanc.find(p=>p.id===row.lancId),q=numRaw(row.v.W,row.v,0,row.desconto);
  if(L==="P"){
    if(valor==null)return "";const cg=l&&catBy(l.v.I)&&num(catBy(l.v.I).compraGrama),pe=pesoLinha(row);
    if(cg>0&&pe!=null&&Math.abs(r2c(pe*cg)-valor)<0.011)return `Compra: ${fmt(pe)} g × R$ ${brl(cg)}/g (compra por grama da categoria) = R$ ${brl(valor)} por unidade${q>0?` × ${fmt(q)} un. = R$ ${brl(r2c(valor*q))} na linha`:""}.`;
    return `Compra: R$ ${brl(valor)} por unidade${q>0?` × ${fmt(q)} un. = R$ ${brl(r2c(valor*q))} na linha`:""}${l&&l.lote?` · item ${l.lote.i}/${l.lote.n} de um lote`:""}.`}
  if(L==="V"){
    const cs=celulas(row,ri+2),nv=k=>{const c=cs[LET.indexOf(k)];return c&&typeof c.v==="number"?c.v:c&&typeof c.calc==="number"?c.calc:0},custo=r2c(["P","Q","R","S","T","U"].reduce((t,k)=>t+nv(k),0));
    if(valor!=null)return `Preço de varejo digitado: R$ ${brl(valor)}${custo>0?` · custo R$ ${brl(custo)} (compra + insumos + banho + verniz) → fator ${fmt(Math.round(valor/custo*100)/100)} · lucro R$ ${brl(r2c(valor-custo))} (${fmt(Math.round((valor-custo)/valor*1000)/10)}%)`:""}.`;
    return `Preço de varejo vazio (só entra se digitado). Custo R$ ${brl(custo)} (compra + insumos + banho + verniz)${row.mk?` × fator ${fmt(row.mk)} = sugestão R$ ${brl(r2c(custo*row.mk))}`:""}.`}
  if(L==="Q"){
    if(!l)return "";
    if(l.insRom&&!(row.ovs||[]).includes("Q")&&!vazio(l.v.Q))return `Insumos: padrão R$ ${brl(l.insRom.base)} + parte dos insumos do romaneio${l.insRom.rom?" ("+l.insRom.rom+")":""} R$ ${brl(l.insRom.ins)} = R$ ${brl(valor==null?0:valor)} por unidade${q>0&&valor!=null?` × ${fmt(q)} un. = R$ ${brl(valor*q)} na linha`:""}.`;
    if((row.ovs||[]).includes("Q")||!vazio(l.v.Q))return `Insumos: valor informado na peça ${valor==null?"—":"R$ "+brl(valor)} por unidade${q>0&&valor!=null?` × ${fmt(q)} un. = R$ ${brl(valor*q)} na linha`:""}.`;
    const C=cfg(),cat=l.v.I||"",it=insumosItensResumo(cat),modo=C.insumosModo||"off",parts=it.itens.map(i=>`${i.nome} (${i.cat?"categoria":"geral"}): ${fmt(num(i.qtd)||0)} × R$ ${brl(num(i.valor)||0)}`);
    const base=catBy(cat),anterior=num(base&&!vazio(base.insumos)?base.insumos:C.colcfg.Q.padrao)||0;
    const detalhe=modo==="off"?`valor atual R$ ${brl(anterior)} (itens não aplicados)`:modo==="somar"?`valor atual R$ ${brl(anterior)} + itens ${parts.length?parts.join(" + "):"nenhum"}`:`itens ${parts.length?parts.join(" + "):"nenhum"}`;
    return `Insumos: ${detalhe} = R$ ${brl(valor||0)} por unidade${q>0?` × ${fmt(q)} un. = R$ ${brl((valor||0)*q)} na linha`:""}.`;
  }
  if(l&&l.conj)return `Conjunto · ${NOME[L]}: ${valor==null?"sem valor":"R$ "+brl(valor)+" por conjunto"}. Abra Editar para conferir os componentes.`;
  if(row.ovs&&row.ovs.includes(L))return `${NOME[L]} informado na peça: ${valor==null?"sem valor":"R$ "+brl(valor)+" por unidade"}.`;
  if(!row.banho)return "";
  const peso=pesoLinha(row),taxa=L==="U"?row.verniz:(L===row.banho.coluna?row.banho.mult:null);
  if(taxa==null)return `${NOME[L]}: sem valor configurado para esta linha.`;
  if(L!=="U"&&row.banho.modo==="fixo")return `${NOME[L]}: R$ ${brl(taxa)} por unidade (valor fixo)${q>0?` × ${fmt(q)} un. = R$ ${brl(r2c(taxa)*q)} na linha`:""}.`;
  if(peso==null)return `${NOME[L]}: informe o peso para calcular.`;
  const unidade=r2c(peso*taxa);return `${NOME[L]}: ${fmt(peso)} g × R$ ${fmt(taxa)}/g = R$ ${brl(unidade)} por unidade${q>0?` × ${fmt(q)} un. = R$ ${brl(unidade*q)} na linha`:""}.`;
}
function renderSelBar(){
  const el=document.getElementById("selbar");if(!el)return;const b=selBox();
  if(!b){el.innerHTML=vista()==="lista"?"":G&&G.linhas.length?`<span class="hint">Clique numa célula para selecionar · arraste ou <kbd>Shift</kbd>+clique para várias · clique no nome da coluna ou na margem esquerda da linha para selecionar inteira · duplo clique, <kbd>Enter</kbd> ou comece a digitar para editar</span>`:"";return}
  const n=(b.r2-b.r1+1)*(b.c2-b.c1+1);let soma=0,nn=0;
  /* a Soma só vale para uma coluna monetária, de peso ou de quantidade — nunca mistura nem soma códigos (NCM, CFOP…) */
  const kd=L=>MONEY.has(L)?"m":L==="W"?"q":L==="N"?"p":"",ks=new Set();for(let c=b.c1;c<=b.c2;c++)ks.add(kd(LET[c]));const somavel=ks.size===1&&!ks.has("");
  for(let r=b.r1;r<=b.r2;r++){if(!vis(r))continue;const row=G.linhas[r];if(!row)continue;const cs=celulas(row,r+2);for(let c=b.c1;c<=b.c2;c++){const x=cs[c];if(x&&typeof x.v==="number"){if(somavel)soma+=x.v;nn++}}}
  const row=G.linhas[selR.fr],ids=idsDaSel(),det=n===1?detalheCelulaSelecionada(row,LET[b.c1],b.r1):"";
  el.innerHTML=`<span class="si"><b class="mono">${LET[b.c1]}${b.r1+2}${n>1?":"+LET[b.c2]+(b.r2+2):""}</b> ${n} célula${n>1?"s":""}${nn>1?` · Soma <b class="mono"${somavel?"":' title="Soma só para colunas de valor, peso ou quantidade (uma por vez)"'}>${somavel?fmt(soma):"—"}</b>`:""}</span>
    ${det?`<span class="sel-calculo">${esc(det)}</span>`:""}
    ${row?`<button class="btn sm" type="button" data-act="s-edit" title="Abre a peça no lançamento para alterar">✎ Editar ${esc(row.v.E)}</button><button class="btn sm" type="button" data-act="s-nova" title="Copia os dados para o lançamento; ao Adicionar sai com nova referência">＋ Nova referência a partir desta</button><button class="btn sm" type="button" data-act="s-dup">⧉ Duplicar linha</button>`:""}
    <button class="btn sm" type="button" data-act="s-copy">Copiar <kbd>Ctrl+C</kbd></button>${G.linhas[b.r1]?`<button class="btn sm" type="button" data-act="s-clear">Limpar <kbd>Del</kbd></button>`:""}${b.r2>b.r1&&G.linhas[b.r1]?`<button class="btn sm" type="button" data-act="s-fill">Preencher para baixo <kbd>Ctrl+D</kbd></button>`:""}
    ${ids.length?`<button class="btn sm" type="button" data-act="s-xlsx" title="Baixa um .xlsx só com as peças da seleção">Baixar .xlsx só estas</button>`:""}
    ${ids.length?`<button class="btn sm danger" type="button" data-act="s-del">Excluir ${(()=>{const q=Math.min(b.r2,G.linhas.length-1)-b.r1+1;return q>1?q+" linhas":"a linha"})()}</button>`:""}`;
}
function usarModelo(id){
  const l=S.lanc.find(x=>x.id===id);if(!l)return;if(editId)cancelar();
  const c=clone(l);delete c.id;delete c.v.E;c.vinc=false;delete c.excl;delete c.ft;delete c.ftR;if(c.ov)Object.values(c.ov).forEach(o=>{delete o.E;delete o.W});
  S.form={...FORM0(),...c};salvar(false);renderTopo();renderForm();document.getElementById("paneBot").scrollTo({top:0});
  const d=document.getElementById("f-F");if(d){d.focus();d.select()}toast("Dados copiados para o lançamento. Ajuste e aperte Adicionar para criar a nova referência.");
}
