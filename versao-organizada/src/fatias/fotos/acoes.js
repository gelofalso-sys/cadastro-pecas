/* Ações de clique (data-act) da fatia fotos: enviar fotos ao imgbb, testar a chave, escolher/remover a foto da peça e ampliar (zoom).
   Registradas em ACOES (src/core/acoes.js). Convenção: o que era `break` no switch virou `return`.
   Desde a Tarefa 14 tambem as fotos dos itens do romaneio: rom-foto (zoom), rom-foto-add, rom-foto-del e foto-rem-rom. */
registrarAcoes(ACOES,"fotos",{
  "fotos-enviar":()=>{enviarFotos();return},
  "foto-testar":()=>{testarChaveImgbb();return},
  "foto-add":({t})=>{estadoFotos.alvo=t.dataset.lid;document.getElementById("ftIn").click();return},
  "foto-form":()=>{estadoFotos.alvo="__form";document.getElementById("ftIn").click();return},
  "foto-rem":()=>{fotoRemover(editId||null);return},
  "tab-foto":({t})=>{const lid=t.dataset.lid,src=t.src||(t.querySelector("img")||{}).src;(lid?idbGet("fotos",lid):Promise.resolve(null)).then(u=>abrirZoom(u||src));return},
  "rom-foto-add":({t})=>{{romFotoEscolher(+t.dataset.i);return}},
  "rom-foto-del":({t})=>{{romFotoRemover(+t.dataset.i);return}},
  "rom-foto":({t})=>{{const im=t.querySelector("img");if(im)abrirZoom(im.src);return}},
  "foto-rem-rom":()=>{{if(editId){const l=S.lanc.find(x=>x.id===editId);if(l)delete l.ftR}delete S.form.ftR;salvar(false);renderTopo();renderForm();toast("Foto do romaneio removida desta peça.");return}}
});
