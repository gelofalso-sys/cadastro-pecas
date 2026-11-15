// A lista de campos de tests/lib/estado_vm.js precisa ser igual ao MAPA do codemod (tools/migrar_globais.mjs): senao um nome novo
// num dos dois quebra os testes em vm em silencio.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { MAPA } from "../../tools/migrar_globais.mjs";

const require = createRequire(import.meta.url);

test("estado_vm.js lista os mesmos campos do MAPA do codemod", () => {
  const { CAMPOS } = require("../lib/estado_vm.js");
  const ordenado = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [...v].sort()]).sort(([a], [b]) => a.localeCompare(b)));
  assert.deepEqual(ordenado(CAMPOS), ordenado(MAPA));
});
