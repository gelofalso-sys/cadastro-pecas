/* ===== src/store/local.js: todo acesso ao localStorage e ao sessionStorage do app =====
   Script simples (nao e modulo), carregado antes de qualquer usuario (src/_ordem.txt). Funcoes finas, sem try/catch:
   lancam exatamente o que o navegador lancaria (armazenamento bloqueado, cota estourada etc.), e quem chama mantem o seu
   try/catch de sempre. Mesmas chaves, mesmo formato (texto), mesmo retorno (null quando a chave nao existe). */
function lerPref(chave){return localStorage.getItem(chave)}
function gravarPref(chave,valor){localStorage.setItem(chave,valor)}
function removerPref(chave){localStorage.removeItem(chave)}
/* evento "storage" de outra aba: diz se a area alterada e o localStorage deste app */
function ehAreaLocal(area){return area===localStorage}
/* sessionStorage: so o aviso de restauracao recuperada ("cadpecas-recuperou-backup") */
function lerSessao(chave){return sessionStorage.getItem(chave)}
function gravarSessao(chave,valor){sessionStorage.setItem(chave,valor)}
function removerSessao(chave){sessionStorage.removeItem(chave)}
/* rotulo da area no texto do diagnostico dos dados (armazenamento/21c): o texto mostrado continua "localStorage <chave>: ..." */
const AREA_LOCAL_NOME="localStorage";
