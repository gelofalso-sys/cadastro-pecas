/* lembrete de backup: os dados ficam só neste navegador; passada uma semana sem backup completo (e com peças lançadas), avisa uma vez por abertura */
function lembreteBackup(){try{const k="cadpecas-bk-em",u="cadpecas-uso-em";if(!lerPref(u))gravarPref(u,String(Date.now()));
  const ult=+lerPref(k)||+lerPref(u)||Date.now();
  if(S.lanc.length>=5&&Date.now()-ult>7*864e5)setTimeout(()=>toast("Faz mais de uma semana que você não baixa um backup completo. Seus dados ficam só neste navegador.",{t:"Fazer backup",fn:backupTotal}),2500)}catch(e){}}
