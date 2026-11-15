/* a peça nova aparece sempre no fim da tabela: rola até a última linha dela e dá um destaque */
function mostrarNoFim(id){if(estadoPlanilha.jan&&G){let li=-1;G.linhas.forEach((r,i)=>{if(r.lancId===id)li=i});if(li>=0)janGarantir(li)}
  const trs=[...document.querySelectorAll(`#sheet tr[data-l="${CSS.escape(String(id))}"]`)];if(!trs.length)return;const last=trs[trs.length-1],sh=document.getElementById("sheet");
  const a=last.getBoundingClientRect(),b=sh.getBoundingClientRect(),folga=28+30;
  if(a.bottom>b.bottom-folga)sh.scrollTop+=a.bottom-(b.bottom-folga);else if(a.top<b.top+34)sh.scrollTop-=(b.top+34)-a.top;
  trs.forEach(t=>{t.classList.add("flash");setTimeout(()=>t.classList.remove("flash"),1600)})}
