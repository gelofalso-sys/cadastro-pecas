// Fábrica de teste: importa o núcleo (src/core) e devolve as funções prontas para um estado S.
// Para cada `f$(S, ...)` exportado entrega também `f(...)` ligado a S (como os adaptadores do app, src/js/00-adaptadores-nucleo.js);
// o que não recebe S (constantes e funções puras) vem como está. Sem `vm` e sem recortar texto do código-fonte.
import * as utilidades from "../../src/core/utilidades.js";
import * as colunas from "../../src/core/colunas.js";
import * as formulas from "../../src/core/formulas.js";
import * as configuracao from "../../src/core/configuracao.js";
import * as dominio from "../../src/core/dominio.js";
import * as acoes from "../../src/core/acoes.js";
import * as romaneio from "../../src/core/romaneio.js";
import * as backup from "../../src/core/backup.js";
import * as notafiscal from "../../src/core/notafiscal.js";
import * as exportacao from "../../src/core/exportacao.js";

export const modulos = { utilidades, colunas, formulas, configuracao, dominio, acoes, romaneio, backup, notafiscal, exportacao };
export const nucleo = Object.assign({}, ...Object.values(modulos));

// `get` devolve o estado atual a cada chamada (o app reatribui S); aceita também o próprio objeto S.
export function ligar(S) {
  const get = typeof S === "function" ? S : () => S;
  const f = { ...nucleo };
  for (const [nome, fn] of Object.entries(nucleo)) {
    if (typeof fn === "function" && nome.endsWith("$")) f[nome.slice(0, -1)] = (...a) => fn(get(), ...a);
  }
  return f;
}
