/* Ações de clique (data-act) da fatia tabelas. Registradas em ACOES (src/core/acoes.js).
   Convenção: o que era `break` no switch virou `return`. `tabArm` (tabela "armada" para excluir) e o campo estadoArmazenamento.tabArm (fatias/armazenamento). */
registrarAcoes(ACOES,"tabelas",{
  "tab-lista":()=>{tabListaAbrir()},
  "tab-salvar-abrir":()=>{tabSalvarAbrir()},
  "tab-salvar-ok":()=>{tabSalvarOk()},
  "tab-ver":({t})=>{tabVer(t.dataset.id)},
  "tab-del":({t})=>{if(estadoArmazenamento.tabArm!==t.dataset.id){estadoArmazenamento.tabArm=t.dataset.id;tabListaAbrir()}else{const id=estadoArmazenamento.tabArm;estadoArmazenamento.tabArm=null;tabExcluirSalvo(id).then(ok=>{if(ok)toast("Tabela excluída.");const rep=document.querySelector(".rep");if(rep&&rep.querySelector('[data-act="tab-salvar-abrir"]'))tabListaAbrir()}).catch(()=>toast("Não consegui excluir a tabela; confira o armazenamento."))}},
  "tab-restaurar":({t})=>{tabRestaurar(t.dataset.id)},
  "tab-csv":({t})=>{bancoLer("tabs",t.dataset.id).then(rc=>{if(rc)arqSalvar("tabela-"+String(rc.nome).replace(/[^A-Za-z0-9 _-]/g,"-")+".csv",tabCsv(rc))})},
  "rom-ver":({t})=>{romVer(t.dataset.id,t.dataset.de)}
});
