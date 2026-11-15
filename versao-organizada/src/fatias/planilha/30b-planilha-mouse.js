document.addEventListener("mousedown",e=>{
  if(e.target.classList&&e.target.classList.contains("rz")){e.preventDefault();e.stopPropagation();
    const L=e.target.dataset.rz,col=document.querySelector(`#sheet col[data-cw="${L}"]`),tb=document.querySelector("#sheet table"),x0=e.clientX,w0=cw(L),t0=tb.offsetWidth;
    e.target.classList.add("on");document.body.classList.add("resizing");
    const mv=ev=>{const w=Math.max(36,Math.round(w0+(ev.clientX-x0)/(ZM.t||1)));estadoPlanilha.colW[L]=w;col.style.width=w+"px";tb.style.width=(t0+w-w0)+"px"};
    const up=()=>{document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);document.body.classList.remove("resizing");try{prefGravar("colw",JSON.stringify(estadoPlanilha.colW))}catch(x){}renderTopo()};
    document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up);return}
  if(e.target.closest("td.ed"))return;
  const sh=document.getElementById("sheet");
  const th=e.target.closest("#sheet th[data-hc]");
  if(th){e.preventDefault();if(celEd)fecharCel(true);const c=LET.indexOf(th.dataset.hc),mr=Math.max(Math.min(maxRi(),(G?G.linhas.length:1)-1),0);if(e.shiftKey&&estadoPlanilha.selR)selecionar(0,estadoPlanilha.selR.ac,mr,c);else selecionar(0,c,mr,c);sh.focus({preventScroll:true});return}
  const kc=e.target.closest("#sheet td.k");
  if(kc&&!e.target.closest("input,button")){const r=+kc.closest("tr").dataset.ri;if(isNaN(r))return;e.preventDefault();if(celEd)fecharCel(true);if(e.shiftKey&&estadoPlanilha.selR)selecionar(estadoPlanilha.selR.ar,0,r,LET.length-1);else selecionar(r,0,r,LET.length-1);sh.focus({preventScroll:true});return}
  const td=e.target.closest("#sheet td[data-c]");
  if(td){e.preventDefault();if(celEd)fecharCel(true);const r=+td.closest("tr").dataset.ri,c=LET.indexOf(td.dataset.c);estadoPlanilha.mdTd=td;estadoPlanilha.mdJa=!!estadoPlanilha.selR&&estadoPlanilha.selR.ar===r&&estadoPlanilha.selR.fr===r&&estadoPlanilha.selR.ac===c&&estadoPlanilha.selR.fc===c;if(e.shiftKey&&estadoPlanilha.selR)selecionar(estadoPlanilha.selR.ar,estadoPlanilha.selR.ac,r,c);else selecionar(r,c);estadoPlanilha.arrastando=true;sh.focus({preventScroll:true});return}
  if(celEd)fecharCel(true);
});
document.addEventListener("mousemove",e=>{if(!estadoPlanilha.arrastando||!estadoPlanilha.selR)return;const td=e.target.closest&&e.target.closest("#sheet td[data-c]");if(!td)return;const r=+td.closest("tr").dataset.ri,c=LET.indexOf(td.dataset.c);if(r!==estadoPlanilha.selR.fr||c!==estadoPlanilha.selR.fc){estadoPlanilha.selR.fr=r;estadoPlanilha.selR.fc=c;pintarSel();renderSelBar()}});
document.addEventListener("mouseup",e=>{const was=estadoPlanilha.arrastando;estadoPlanilha.arrastando=false;
  /* um clique simples numa célula já abre para digitar (sem duplo clique); arrastar ou Shift só seleciona */
  if(!was||e.shiftKey||e.button||celEd||!estadoPlanilha.selR||estadoPlanilha.selR.ar!==estadoPlanilha.selR.fr||estadoPlanilha.selR.ac!==estadoPlanilha.selR.fc)return;
  if(toque()&&!estadoPlanilha.mdJa){estadoPlanilha.mdTd=null;return}   /* no celular o primeiro toque só MARCA a célula; tocar de novo na marcada abre para digitar (senão o teclado abre e a tabela pula) */
  const td=estadoPlanilha.mdTd&&estadoPlanilha.mdTd.isConnected?estadoPlanilha.mdTd:(e.target.closest&&e.target.closest("#sheet td[data-c]"));estadoPlanilha.mdTd=null;if(!td||td.classList.contains("ed"))return;
  const r=+td.closest("tr").dataset.ri,c=LET.indexOf(td.dataset.c);if(r===estadoPlanilha.selR.fr&&c===estadoPlanilha.selR.fc){
    /* clique numa célula: abre a peça no formulário (se o formulário não tem alterações por salvar) e já deixa a célula pronta para digitar */
    const row=G&&G.linhas[r];if(row&&row.lancId&&row.lancId!==editId&&!formSujo()&&!celular()){const lid=row.lancId;editar(lid);if(G.linhas[r]&&G.linhas[r].lancId===lid)estadoPlanilha.selR={ar:r,ac:c,fr:r,fc:c}}
    abrirCel(r,td.dataset.c,true)}});
document.addEventListener("dblclick",e=>{const td=e.target.closest&&e.target.closest("#sheet td[data-c]");if(td&&!td.classList.contains("ed"))abrirCel(+td.closest("tr").dataset.ri,td.dataset.c)});
