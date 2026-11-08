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
function textoCel(ri,ci){const row=G.linhas[ri];if(!row)return "";const x=celulas(row,ri+2)[ci];if(!x)return "";if(typeof x.v==="number")return String(r4(x.v)).replace(".",",");if(x.v==null)return x.txt||("="+x.f);return String(x.v)}
function idsDaSel(){const b=selBox();if(!b)return [];const s=new Set();for(let r=b.r1;r<=b.r2;r++){if(!vis(r))continue;const row=G.linhas[r];if(row)s.add(row.lancId)}return [...s]}
function copiarSel(){const b=selBox();if(!b)return;const lin=[];for(let r=b.r1;r<=b.r2;r++){if(!vis(r))continue;const l=[];for(let c=b.c1;c<=b.c2;c++)l.push(textoCel(r,c));lin.push(l.join("\t"))}
  navigator.clipboard.writeText(lin.join("\n")).then(()=>toast(`${(b.r2-b.r1+1)*(b.c2-b.c1+1)} célula(s) copiada(s).`)).catch(()=>toast("O navegador não liberou a cópia. Use Copiar para o Excel."))}
function limparSel(){const b=selBox();if(!b)return;const antes={};let n=0;
  for(let r=b.r1;r<=Math.min(b.r2,G.linhas.length-1);r++){if(!vis(r))continue;const row=G.linhas[r],l=S.lanc.find(x=>x.id===row.lancId);if(!l)continue;if(!(l.id in antes))antes[l.id]=clone(l.ov||{});
    for(let c=b.c1;c<=b.c2;c++){const L=LET[c];if(L==="E")continue;gravarCel(r,L,"");n++}}
  if(!n)return;undo={tipo:"multi",antes};salvar(false);renderTopo();if(editId)renderForm();toast(`${n} célula(s) limpa(s).`,{t:"Desfazer",fn:desfazer})}
function preencherAbaixo(){const b=selBox();if(!b||b.r2<=b.r1||!G.linhas[b.r1])return;const antes={},src=G.linhas[b.r1];
  for(let r=b.r1+1;r<=Math.min(b.r2,G.linhas.length-1);r++){if(!vis(r))continue;const row=G.linhas[r],l=S.lanc.find(x=>x.id===row.lancId);if(!l)continue;if(!(l.id in antes))antes[l.id]=clone(l.ov||{});
    for(let c=b.c1;c<=b.c2;c++){const L=LET[c];if(L==="E")continue;const v=src.banho&&FORMULA.has(L)&&!src.ovs.includes(L)?"":String(src.v[L]??"");gravarCel(r,L,v)}}
  undo={tipo:"multi",antes};salvar(false);renderTopo();if(editId)renderForm();toast("Preenchido para baixo.",{t:"Desfazer",fn:desfazer})}
function renderSelBar(){
  const el=document.getElementById("selbar");if(!el)return;const b=selBox();
  if(!b){el.innerHTML=vista()==="lista"?"":G&&G.linhas.length?`<span class="hint">Clique numa célula para selecionar · arraste ou <kbd>Shift</kbd>+clique para várias · clique no nome da coluna ou na margem esquerda da linha para selecionar inteira · duplo clique, <kbd>Enter</kbd> ou comece a digitar para editar</span>`:"";return}
  const n=(b.r2-b.r1+1)*(b.c2-b.c1+1);let soma=0,nn=0;
  /* a Soma só vale para uma coluna monetária, de peso ou de quantidade — nunca mistura nem soma códigos (NCM, CFOP…) */
  const kd=L=>MONEY.has(L)?"m":L==="W"?"q":L==="N"?"p":"",ks=new Set();for(let c=b.c1;c<=b.c2;c++)ks.add(kd(LET[c]));const somavel=ks.size===1&&!ks.has("");
  for(let r=b.r1;r<=b.r2;r++){if(!vis(r))continue;const row=G.linhas[r];if(!row)continue;const cs=celulas(row,r+2);for(let c=b.c1;c<=b.c2;c++){const x=cs[c];if(x&&typeof x.v==="number"){if(somavel)soma+=x.v;nn++}}}
  const row=G.linhas[selR.fr],ids=idsDaSel();
  el.innerHTML=`<span class="si"><b class="mono">${LET[b.c1]}${b.r1+2}${n>1?":"+LET[b.c2]+(b.r2+2):""}</b> ${n} célula${n>1?"s":""}${nn>1?` · Soma <b class="mono"${somavel?"":' title="Soma só para colunas de valor, peso ou quantidade (uma por vez)"'}>${somavel?fmt(soma):"—"}</b>`:""}</span>
    ${row?`<button class="btn sm" type="button" data-act="s-edit" title="Abre a peça no lançamento para alterar">✎ Editar ${esc(row.v.E)}</button><button class="btn sm" type="button" data-act="s-nova" title="Copia os dados para o lançamento; ao Adicionar sai com nova referência">＋ Nova referência a partir desta</button><button class="btn sm" type="button" data-act="s-dup">⧉ Duplicar linha</button>`:""}
    <button class="btn sm" type="button" data-act="s-copy">Copiar <kbd>Ctrl+C</kbd></button>${G.linhas[b.r1]?`<button class="btn sm" type="button" data-act="s-clear">Limpar <kbd>Del</kbd></button>`:""}${b.r2>b.r1&&G.linhas[b.r1]?`<button class="btn sm" type="button" data-act="s-fill">Preencher para baixo <kbd>Ctrl+D</kbd></button>`:""}
    ${ids.length?`<button class="btn sm danger" type="button" data-act="s-del">Excluir ${(()=>{const q=Math.min(b.r2,G.linhas.length-1)-b.r1+1;return q>1?q+" linhas":"a linha"})()}</button>`:""}`;
}
function usarModelo(id){
  const l=S.lanc.find(x=>x.id===id);if(!l)return;if(editId)cancelar();
  const c=clone(l);delete c.id;delete c.v.E;c.vinc=false;delete c.excl;delete c.ft;delete c.ftR;if(c.ov)Object.values(c.ov).forEach(o=>{delete o.E;delete o.W});
  S.form={...FORM0(),...c};salvar(false);renderTopo();renderForm();document.getElementById("paneBot").scrollTo({top:0});
  const d=document.getElementById("f-F");if(d){d.focus();d.select()}toast("Dados copiados para o lançamento. Ajuste e aperte Adicionar para criar a nova referência.");
}
