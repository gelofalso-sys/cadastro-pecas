/* ===== lembrete de backup logo depois de criar peças de um romaneio ===== */
function backupLembrarPosCriar(){
  try{const u=Math.max(+prefLer("backupEm")||0,+prefLer("backupUltimo")||0);if(Date.now()-u<20*3600*1000)return;
    setTimeout(()=>toast("Peças criadas. Faça um backup agora para não perder este trabalho.",{t:"Baixar backup",fn:()=>backupTotal()}),1800)}catch(e){}}

