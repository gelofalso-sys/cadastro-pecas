// Registro de ações de clique: cada fatia registra suas ações (data-act) sem tocar no switch central.
const ORIGEM = Symbol.for("cp.acoes.origem");

// Registro unico do app (sem prototipo): os acoes.js das fatias registram nele e o despacho do clique (src/fatias/app/30c-clique-acoes.js) consulta.
export const ACOES = Object.create(null);

export function registrarAcoes(registro, fatia, mapa) {
  if (!Object.prototype.hasOwnProperty.call(registro, ORIGEM)) {
    Object.defineProperty(registro, ORIGEM, { value: new Map(), enumerable: false });
  }
  const origem = registro[ORIGEM];
  for (const nome of Object.keys(mapa)) {
    if (Object.prototype.hasOwnProperty.call(registro, nome)) {
      throw new Error(`Ação "${nome}" já registrada pela fatia "${origem.get(nome) || "?"}"; duplicada na fatia "${fatia}".`);
    }
  }
  for (const nome of Object.keys(mapa)) {
    registro[nome] = mapa[nome];
    origem.set(nome, fatia);
  }
}
