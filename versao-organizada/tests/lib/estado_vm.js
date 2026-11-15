/* Auxiliar dos testes em vm (Etapa 4): o codigo do app le e grava campos de estadoX (estadoRomaneio.ROM, estadoArmazenamento.TABS...),
   mas os testes antigos montam o contexto com variaveis soltas (ctx.ROM, ctx.TABS). Ao carregar este arquivo, todo vm.createContext(obj)
   ganha os objetos estadoX com acessores ligados as variaveis soltas de mesmo nome; campos ja presentes no objeto estadoX do teste
   ficam como estao. Fora de tests/*.js de proposito: o run_all roda todo .js dessa pasta como teste. */
const vm = require('node:vm');
if (!vm.__estadoLigado) {
  const CAMPOS = {
    estadoRomaneio: ['romCriando', 'romChaveL', 'relTem', 'ROM', 'NF'],
    estadoArmazenamento: ['sT', 'chain', 'snapL', 'snapC', 'restaurando', 'corrompido', 'ftSalvas', 'histSep', 'romGravP', 'romST', 'romTem', 'romInfo', 'romArm', 'tabArm', 'AUTOR', 'ARQ', 'dirty', 'conflito', 'db', 'TABS', 'ROMS', 'romConflito'],
    estadoConfig: ['romUI', 'impT', 'impConfigAntes'],
    estadoPlanilha: ['w'],
    estadoBase: ['bancoAberto', 'HIST_SUG', 'lastExport', 'editId', 'rascunho', 'undo', 'erro', 'celEd', 'G', 'abertos'],
  };
  const original = vm.createContext;
  vm.createContext = function (o, ...resto) {
    if (o && typeof o === 'object') {
      for (const [obj, campos] of Object.entries(CAMPOS)) {
        const tem = Object.prototype.hasOwnProperty.call(o, obj);
        const alvo = tem ? o[obj] : (o[obj] = {});
        for (const c of campos) {
          if (c in alvo) continue;
          Object.defineProperty(alvo, c, { get() { return o[c]; }, set(v) { o[c] = v; }, enumerable: true, configurable: true });
        }
      }
    }
    return original.call(this, o, ...resto);
  };
  vm.__estadoLigado = true;
}
