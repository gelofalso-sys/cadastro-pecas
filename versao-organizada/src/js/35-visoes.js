/* ===== v19: visões (Dividida · Planilha · Lançar · Cadastros) ===== */
function visAtual(){const v=document.body.dataset.vis||"tudo";return v}
function visPara(v,soSeEscondido){
  if(celular()&&v==="tudo")v="planilha";
  if(!celular()&&v==="lancar")v="tudo"; /* o lançamento nunca é uma tela própria: fica sempre embaixo da tabela */
  const a=visAtual();
  if(soSeEscondido){const escondido=v==="cad"?(a==="planilha"||a==="lancar"):(a==="planilha"||a==="cad");if(!escondido)return}
  document.body.dataset.vis=v;estadoBase.abertos.vis=v;guardarAbertos();
  document.querySelectorAll("#vis [data-vis]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.vis===v)));
  if(celular())formAbrir(v==="lancar");
  const pb=document.getElementById("paneBot");if(pb&&v!=="planilha")pb.scrollTo({top:0});
  if(typeof sideMarcar==="function")sideMarcar();
  pilulaAtualiza();if(celular()&&v!=="lancar")window.scrollTo({top:0});
}
