/* lembrete de backup: os dados ficam só neste navegador; passada uma semana sem backup completo (e com peças lançadas), avisa uma vez por abertura */
function lembreteBackup(){try{const k="backupEm",u="usoEm";if(!prefLer(u))prefGravar(u,String(Date.now()));
  const ult=+prefLer(k)||+prefLer(u)||Date.now();
  if(S.lanc.length>=5&&Date.now()-ult>7*864e5)setTimeout(()=>toast("Faz mais de uma semana que você não baixa um backup completo. Seus dados ficam só neste navegador.",{t:"Fazer backup",fn:backupTotal}),2500)}catch(e){}}
