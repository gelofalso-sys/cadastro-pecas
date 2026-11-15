/* ＋ Galvânica / ＋ Banho dentro do lançamento ou do romaneio levam à página completa de Galvânicas e banhos (letra, cor, cálculo, coluna, milésimos…), em vez de um mini-cadastro limitado */
let qGalvanicaSelecionar=false;
function qIrGalvanica(q){
  const C=cfg();
  if(celular())formAbrir(false);irPara("banho");
  if(q==="bh"){qGalvanicaSelecionar=true;const botao=document.querySelector('#cfg [data-act="bh-add"]');if(botao){botao.click();setTimeout(()=>cadConferir(),0)}else qGalvanicaSelecionar=false}
  setTimeout(()=>{const bi=q==="bh"?C.banhistas.length-1:Math.max(0,C.banhistas.findIndex(b=>b.id===S.form.banhista)),el=document.querySelector(`[data-bh="${bi}"]`);
    if(el){el.scrollIntoView({block:"start",behavior:"smooth"});const f=el.querySelector(q==="bh"?'[data-bhf="nome"]':'[data-act="bn-pronto"]');if(f)f.focus({preventScroll:true})}},150);
  toast(q==="bh"?"Galvânica nova criada na página de Galvânicas e banhos: dê um nome, ajuste os banhos e use no lançamento.":"Escolha o banho (+ Ouro, + Ródio, + Prata, + Outro…) acima da tabela de milésimos; ele já aparece no lançamento.")}

