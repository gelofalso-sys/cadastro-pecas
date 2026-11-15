/* ===== src/store/dados.js: chaves de dado de negocio do localStorage, por funcao nomeada =====
   Script simples, carregado depois de store/prefs.js (src/_ordem.txt). Lista fechada (DADOS): as mesmas chaves, o mesmo formato
   (texto) e o mesmo retorno (null quando falta) de sempre; chave fora da lista lanca. Funcoes finas: lancam como o navegador,
   o try/catch fica em quem chama. Preferencias de tela e de controle ficam em store/prefs.js. */
const DADOS=new Set(["cadpecas4","cadpecas3","cadpecas4-corrompido","cadpecas-rom","cadpecas-roms","cadpecas-rom-info","cadpecas-tabs","cadpecas-rel","cadpecas-nf"]);
function dadoChave(chave){if(!DADOS.has(chave))throw new Error("chave de dado desconhecida: "+chave);return chave}
function dadoLer(chave){return lerPref(dadoChave(chave))}
function dadoGravar(chave,valor){gravarPref(dadoChave(chave),valor)}
function dadoRemover(chave){removerPref(dadoChave(chave))}
