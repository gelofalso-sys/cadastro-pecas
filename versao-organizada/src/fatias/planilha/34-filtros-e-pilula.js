/* ===== v20: filtros recolhidos, avisos em uma linha, botão de recolher formulário ===== */
document.getElementById("filTog").addEventListener("click",()=>{const f=document.getElementById("fil");const on=f.classList.toggle("fopen");document.getElementById("filTog").setAttribute("aria-expanded",String(on))});
document.getElementById("tools").addEventListener("click",e=>{if(e.target.closest(".issues")&&!e.target.closest("a,button"))document.getElementById("tools").classList.toggle("aberto")});
function pilulaAtualiza(){const b=document.getElementById("dpill");if(!b)return;const v=document.body.dataset.vis||"tudo";
  const alvo=v==="planilha"?["tudo","▴ Expandir o formulário"]:v==="cad"?["tudo","Tabela e formulário"]:["planilha","▾ Recolher o formulário"];
  b.dataset.alvo=alvo[0];b.textContent=alvo[1];b.hidden=celular();pilulaPos()}
/* com o formulário aberto o botão fica ENCOSTADO na divisória entre a tabela e o formulário (não flutua sobre os campos); sem o formulário ele volta para o canto */
function pilulaPos(){const b=document.getElementById("dpill"),sp=document.getElementById("splitter");if(!b)return;const v=document.body.dataset.vis||"tudo",r=sp&&sp.getBoundingClientRect();
  if(!b.hidden&&v==="tudo"&&r&&r.height>0){b.classList.add("dock");b.style.top=Math.round(r.top+r.height/2-b.offsetHeight/2)+"px";b.style.bottom="auto"}else{b.classList.remove("dock");b.style.top="";b.style.bottom=""}}
window.addEventListener("resize",pilulaAtualiza);
try{new ResizeObserver(pilulaPos).observe(document.getElementById("paneTop"))}catch(e){}
document.getElementById("dpill").addEventListener("click",e=>{const a=e.currentTarget.dataset.alvo;visPara(a);if(a==="tudo")refocar("#f-F")});

