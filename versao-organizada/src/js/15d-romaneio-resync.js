/* apagou (ou voltou) peças da tabela com o romaneio aberto: as linhas dele que já não existem na tabela deixam de ser "já lançada" */
let romChaveL="",romCriando=false;
function romResync(){if(romCriando||!ROM||!ROM.rows||(!ROM.rows.length&&!(ROM.removidos||[]).length))return;const k=S.lanc.map(l=>l.id).join(",");if(k===romChaveL)return;romChaveL=k;
  const antes=ROM.rows.map(r=>(r.feito?1:0)+(r.skip?1:0)+(r.refaz?1:0)).join("");romMarcar();if(ROM.rows.map(r=>(r.feito?1:0)+(r.skip?1:0)+(r.refaz?1:0)).join("")!==antes){romSalvarSoon();setTimeout(()=>{if(ROM)renderRom()},0)}}
