/* ===== src/store/banco.js: lojas do IndexedDB "cadpecas-big" por funcao nomeada =====
   Script simples, carregado depois de store/dados.js (src/_ordem.txt). Embrulha idbGet/idbPut/idbDel/idbOp de store/idb.js sem
   mudar a semantica: nenhuma rejeita; erro ou transacao abortada devolve null; bancoLer devolve undefined quando a chave nao
   existe. Loja fora de fotos, roms, tabs e pontos lanca na hora (antes de tocar o banco). */
const BANCO_LOJAS=new Set(["fotos","roms","tabs","pontos"]);
function bancoLoja(loja){if(!BANCO_LOJAS.has(loja))throw new Error("loja desconhecida: "+loja);return loja}
function bancoLer(loja,chave){return idbGet(bancoLoja(loja),chave)}
function bancoGravar(loja,chave,valor){return idbPut(bancoLoja(loja),chave,valor)}
function bancoApagar(loja,chave){return idbDel(bancoLoja(loja),chave)}
function bancoChaves(loja){return idbOp(bancoLoja(loja),"readonly",st=>st.getAllKeys())}
function bancoTodos(loja){return idbOp(bancoLoja(loja),"readonly",st=>st.getAll())}
function bancoAdicionar(loja,chave,valor){return idbOp(bancoLoja(loja),"readwrite",st=>st.add(valor,chave))}
