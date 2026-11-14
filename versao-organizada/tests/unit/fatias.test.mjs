// Testes de tools/fatias.mjs (validação dos manifestos FATIA.json), com fixtures em objetos.
import test from "node:test";
import assert from "node:assert/strict";
import { validarFatias, donoDoArquivo } from "../../tools/fatias.mjs";

const base = () => ({ nome: "x", descricao: "d", arquivos: ["a.js"], expoe: ["f"], usa: ["core"], testes: ["x"], fronteira: "aponta" });
const ordem = ["core/c.js", "fatias/x/a.js"];
const existe = () => true;

test("tudo certo devolve lista vazia", () => {
  assert.deepEqual(validarFatias([base()], ordem, existe), []);
});
test("arquivo listado que não existe cita o arquivo", () => {
  const e = validarFatias([base()], ordem, () => false);
  assert.ok(e.some(m => m.includes("fatias/x/a.js")));
});
test("arquivo do FATIA.json ausente da ordem cita o arquivo", () => {
  const e = validarFatias([base()], ["core/c.js"], existe);
  assert.ok(e.some(m => m.includes("fatias/x/a.js") && m.includes("_ordem")));
});
test("arquivo em ordem sob fatias/x/ sem dono cita o arquivo", () => {
  const e = validarFatias([base()], [...ordem, "fatias/x/orfao.js"], existe);
  assert.ok(e.some(m => m.includes("fatias/x/orfao.js")));
});
test("usa citando fatia inexistente cita a fatia", () => {
  const f = base(); f.usa = ["fantasma"];
  const e = validarFatias([f], ordem, existe);
  assert.ok(e.some(m => m.includes("fantasma") && m.includes("x")));
});
test("fronteira inválida cita a fatia", () => {
  const f = base(); f.fronteira = "talvez";
  const e = validarFatias([f], ordem, existe);
  assert.ok(e.some(m => m.includes("fronteira") && m.includes("x")));
});
test("campo obrigatório ausente cita campo e fatia", () => {
  const f = base(); delete f.expoe;
  const e = validarFatias([f], ordem, existe);
  assert.ok(e.some(m => m.includes("expoe") && m.includes("x")));
});
test("donoDoArquivo mapeia fatias/<nome>/<arq> para o nome", () => {
  assert.equal(donoDoArquivo([base()]).get("fatias/x/a.js"), "x");
});
