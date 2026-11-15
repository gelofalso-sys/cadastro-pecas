/* ===== src/store/prefs.js: preferencias de tela e de controle por nome logico =====
   Script simples, carregado depois de store/local.js (src/_ordem.txt). Mesmas chaves e mesmo formato (texto) de sempre; so
   o nome usado pelo codigo mudou. Chaves de dado de negocio (cadpecas4, roms, tabs, rel...) NAO entram aqui: passam por
   store/dados.js (dadoLer, dadoGravar, dadoRemover). Funcoes finas: lancam como o navegador. */
const PREFS={
  /* tela */
  zoom:"cadpecas-zoom",vista:"cadpecas-vista",colw:"cadpecas-colw",split:"cadpecas-split",filtro:"cadpecas-filtro",
  abertos:"cadpecas-abertos",autor:"cadpecas-autor",numbarAberta:"cadpecas-numbar-aberta",mostrarVazias:"cadpecas-mostrar-vazias",
  /* controle de backup e servicos */
  backupUltimo:"cadpecas-bk-ult",backupEm:"cadpecas-bk-em",usoEm:"cadpecas-uso-em",persistAviso:"cadpecas-persist-aviso",
  origemOk:"cadpecas-origem-ok",cadEstrito:"cadpecas-cad-estrito",imgbb:"cadpecas-imgbb",imgbbAuto:"cadpecas-imgbb-auto",imgbbConsent:"cadpecas-imgbb-consent-v1"
};
function prefChave(nome){if(!Object.prototype.hasOwnProperty.call(PREFS,nome))throw new Error("preferencia desconhecida: "+nome);return PREFS[nome]}
function prefLer(nome){return lerPref(prefChave(nome))}
function prefGravar(nome,valor){gravarPref(prefChave(nome),valor)}
function prefRemover(nome){removerPref(prefChave(nome))}
