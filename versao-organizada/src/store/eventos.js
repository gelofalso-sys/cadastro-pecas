/* ===== src/store/eventos.js: o armazenamento avisa, a casca decide o que mostrar =====
   Script simples, carregado depois de store/prefs.js (src/_ordem.txt). Eventos: "salvo", "erro", "conflito", "cota".
   Carga (info): {texto, erro} e, em "cota", opcionalmente {toast}. Emissao SINCRONA, na ordem de registro, para o aviso
   aparecer no mesmo instante de antes; sem ouvinte nao faz nada; ouvinte que lanca nao interrompe quem emitiu. */
const ARM_OUVINTES={salvo:[],erro:[],conflito:[],cota:[]};
function armLista(nome){if(!Object.prototype.hasOwnProperty.call(ARM_OUVINTES,nome))throw new Error("evento de armazenamento desconhecido: "+nome);return ARM_OUVINTES[nome]}
function armOuvir(nome,fn){armLista(nome).push(fn)}
function armEmitir(nome,info){for(const fn of armLista(nome).slice()){try{fn(info)}catch(e){console.error("cadastro-pecas: ouvinte de armazenamento falhou",e)}}}
