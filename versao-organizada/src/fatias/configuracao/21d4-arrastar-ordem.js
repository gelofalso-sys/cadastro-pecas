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

