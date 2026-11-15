/* Acoes de clique (data-act) da fatia armazenamento: backup em pasta (bk-*), pontos de restauracao (ponto-*), diagnostico dos dados e backup completo.
   Registradas em ACOES (src/js/30c-clique-acoes.js; carrega antes deste arquivo).
   Convencao: o que era `break` no switch virou `return`; nenhum case pulava o codigo pos-switch (nenhuma destas acoes esta em CFG_UNDO). */
registrarAcoes(ACOES,"armazenamento",{
  "bk-escolher":()=>{{if(typeof showDirectoryPicker!=="function"){toast("Este navegador não deixa escolher pasta. Use o Chrome ou o Edge.");return}
      showDirectoryPicker({mode:"readwrite",id:"cadpecas-bk"}).then(async h=>{await idbPut("pontos","pasta",h);const r=await bkAuto(true,true);toast(typeof r==="string"&&r.startsWith("cadastro")?"Backup automático ligado: "+r:"Pasta escolhida, mas não consegui gravar agora ("+r+").");bkStatus()}).catch(e=>{if(e&&e.name!=="AbortError")toast("Não consegui usar essa pasta.")});return}},
  "bk-agora":()=>{{bkAuto(true,true).then(r=>{toast(typeof r==="string"&&r.startsWith("cadastro")?"Backup salvo na pasta: "+r:r===null?"Escolha uma pasta primeiro.":"Não consegui gravar ("+r+").");bkStatus()});return}},
  "bk-perm":()=>{{bkAuto(true,true).then(()=>bkStatus());return}},
  "bk-desligar":()=>{{idbDel("pontos","pasta").then(()=>{toast("Backup automático desligado.");bkStatus()});return}},
  "ponto-novo":()=>{pontoSalvar("criado por você").then(ok=>{toast(ok?"Ponto de restauração criado.":"Não consegui criar o ponto (armazenamento do navegador).");pontosCarregar()});return;},
  "ponto-voltar":({t})=>{pontoRestaurar(t.dataset.k);return;},
  "diag-dados":()=>{diagnosticoDados();return;},
  "backup-total":()=>{backupTotal();return;},
});
