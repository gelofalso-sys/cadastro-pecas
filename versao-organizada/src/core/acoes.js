// Registro de ações de clique: cada fatia registra suas ações (data-act) sem tocar no switch central.
const ORIGEM = Symbol.for("cp.acoes.origem");

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
