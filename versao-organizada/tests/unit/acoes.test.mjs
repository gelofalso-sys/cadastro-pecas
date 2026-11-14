// Testes do registro de ações de clique (src/core/acoes.js).
import test from "node:test";
import assert from "node:assert/strict";
import { registrarAcoes } from "../../src/core/acoes.js";

test("ações distintas de fatias diferentes ficam todas no registro", () => {
  const reg = {};
  registrarAcoes(reg, "a", { x() {}, y() {} });
  registrarAcoes(reg, "b", { z() {} });
  assert.deepEqual(Object.keys(reg).sort(), ["x", "y", "z"]);
});

test("ação duplicada lança erro citando a ação e as duas fatias", () => {
  const reg = {};
  registrarAcoes(reg, "fatia-um", { salvar() {} });
  assert.throws(
    () => registrarAcoes(reg, "fatia-dois", { salvar() {} }),
    (e) => e instanceof Error && /salvar/.test(e.message) && /fatia-um/.test(e.message) && /fatia-dois/.test(e.message),
  );
});

test("a origem fica no próprio registro sem aparecer nas chaves", () => {
  const reg = {};
  registrarAcoes(reg, "a", { x() {} });
  assert.deepEqual(Object.keys(reg), ["x"]);
});
