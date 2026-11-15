function renderListas(){document.getElementById("lists").innerHTML=LET.map(L=>{const l=listaDe(L,S.form.v.I),ex=L==="I"?entradasAtalho():[];return l.length||ex.length?`<datalist id="dl-${L}">${l.map(o=>`<option value="${esc(o)}">`).join("")}${ex.map(([a,cam])=>`<option value="${esc(a)}" label="${esc(cam)}">`).join("")}</datalist>`:""}).join("")}
/* tabela grande (mais de 300 linhas): só as linhas perto da área visível ficam no DOM; o resto vira espaço em branco da mesma altura.
   Abaixo disso o desenho é o de sempre. estadoPlanilha.jan = {lista, row, alt, cum, a, b, ...} */
const JAN_MIN=300,JANM={rh:28,hFt:39,head:34};
function janAlturas(){const J=estadoPlanilha.jan;let s=0;J.cum=new Float64Array(J.lista.length+1);J.lista.forEach((ri,p)=>{J.cum[p]=s;s+=(ri<J.nReais&&J.ft[J.ids[ri]])?J.hFt:J.rh});J.cum[J.lista.length]=s;J.total=s}
function janPos(y){const c=estadoPlanilha.jan.cum;let lo=0,hi=estadoPlanilha.jan.lista.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(c[m]<=y)lo=m;else hi=m-1}return lo}
function janelaHtml(){
  const J=estadoPlanilha.jan,sh=document.getElementById("sheet"),n=J.lista.length,vh=sh.clientHeight||800,y=Math.max(0,(sh.scrollTop||0)-J.head);
  let a=Math.max(0,janPos(y)-45),b=Math.min(n,janPos(y+vh)+60);if(a>0&&a%2===0)a--;   /* a ímpar mantém a listra zebrada igual à do desenho completo */
  J.a=a;J.b=b;const sp=h=>h>0?`<tr class="sp" aria-hidden="true" style="height:${h}px"><td colspan="${LET.length+4}" style="padding:0;border:0"></td></tr>`:"";
  return sp(J.cum[a])+J.lista.slice(a,b).map(J.row).join("")+sp(J.total-J.cum[b])}
function janRepintar(forca){
  const J=estadoPlanilha.jan;if(!J||celEd)return;const sh=document.getElementById("sheet"),tb=sh&&sh.querySelector("tbody");if(!tb)return;
  const y=Math.max(0,sh.scrollTop-J.head),p0=janPos(y),p1=janPos(y+(sh.clientHeight||800));
  const n=J.lista.length;if(!forca&&!((J.a>0&&p0<J.a+8)||(J.b<n&&p1>J.b-8)))return;
  tb.innerHTML=janelaHtml();pintarSel();janMedir()}
/* mede a altura real de uma linha comum e de uma com foto; se diferir do chute, recalcula as alturas uma vez */
function janMedir(){const J=estadoPlanilha.jan;if(!J||J.medido)return;const t1=document.querySelector("#sheet tbody tr[data-ri]:not(.blank):not(:has(td.tf img))"),t2=document.querySelector("#sheet tbody tr:has(td.tf img)");
  let mud=false;if(t1&&Math.abs(t1.offsetHeight-J.rh)>0.5){J.rh=t1.offsetHeight;mud=true}if(t2&&Math.abs(t2.offsetHeight-J.hFt)>0.5){J.hFt=t2.offsetHeight;mud=true}
  const th=document.querySelector("#sheet thead");if(th&&th.offsetHeight&&Math.abs(th.offsetHeight-J.head)>0.5){J.head=th.offsetHeight;mud=true}
  J.medido=true;JANM.rh=J.rh;JANM.hFt=J.hFt;JANM.head=J.head;if(mud){janAlturas();const sh=document.getElementById("sheet");sh.querySelector("tbody").innerHTML=janelaHtml();pintarSel()}}
/* garante que a linha ri (índice da peça na tabela) esteja desenhada e visível — usado pelo teclado e por "mostrar no fim" */
function janGarantir(ri){const J=estadoPlanilha.jan;if(!J)return true;const p=J.lista.indexOf(ri);if(p<0)return false;
  if(p>=J.a&&p<J.b)return true;const sh=document.getElementById("sheet");sh.scrollTop=Math.max(0,J.head+J.cum[p]-sh.clientHeight/2);janRepintar(true);return true}
function guiaHTML(){if(abertos.guiaX)return "";return `<span class="ok vaz guia" role="note"><b>Guia rápido:</b> <button type="button" class="gi tod" data-act="ir" data-sec="cat" title="Categorias, subcategorias, tamanhos e cores">1 · Cadastros</button> <button type="button" class="gi tod" data-act="ir" data-sec="lancar">2 · Lançar peça</button> <span class="hint">3 · conferir a tabela</span> <span class="hint">4 · “Exportar para…” e baixar</span> <button type="button" class="x" data-act="guia-fechar" aria-label="Fechar o guia" title="Fechar o guia">×</button></span> `}
