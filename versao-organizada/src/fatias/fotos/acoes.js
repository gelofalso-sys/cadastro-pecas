/* Ações de clique (data-act) da fatia fotos: enviar fotos ao imgbb, testar a chave, escolher/remover a foto da peça e ampliar (zoom).
   Registradas em ACOES (src/js/30-eventos-mouse-e-clique.js; carrega antes deste arquivo). Convenção: o que era `break` no switch virou `return`.
   `foto-rem-rom` (foto do romaneio) e `rom-foto` ficam em 30 porque pertencem ao fluxo do romaneio. */
registrarAcoes(ACOES,"fotos",{
  "fotos-enviar":()=>{enviarFotos();return},
  "foto-testar":()=>{testarChaveImgbb();return},
  "foto-add":({t})=>{estadoFotos.alvo=t.dataset.lid;document.getElementById("ftIn").click();return},
  "foto-form":()=>{estadoFotos.alvo="__form";document.getElementById("ftIn").click();return},
  "foto-rem":()=>{fotoRemover(editId||null);return},
  "tab-foto":({t})=>{const lid=t.dataset.lid,src=t.src||(t.querySelector("img")||{}).src;(lid?idbGet("fotos",lid):Promise.resolve(null)).then(u=>abrirZoom(u||src));return}
});
