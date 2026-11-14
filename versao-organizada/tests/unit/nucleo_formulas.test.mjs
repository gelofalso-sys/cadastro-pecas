// Testes de unidade do núcleo (src/core): rodam em Node, sem navegador.
import test from "node:test";
import assert from "node:assert/strict";
import { num, vazio, esc, fmt } from "../../src/core/utilidades.js";
import { avalF, sintaxeF, numRaw, qtdPos, checaCel, lerValor, calcBanho, pesoLinha, FORM_SEGURA } from "../../src/core/formulas.js";
import { r2c, kDesc, LET, NOME } from "../../src/core/colunas.js";

test("num lê pt-BR e en, e recusa texto", () => {
  assert.equal(num("1.234,56"), 1234.56);
  assert.equal(num("1,234.56"), 1234.56);
  assert.equal(num("R$ 5,50"), 5.5);
  assert.equal(num("abc"), null);
  assert.equal(num(""), null);
  assert.equal(num("1.2.3"), null);
});
test("vazio, esc e fmt", () => {
  assert.equal(vazio("  "), true); assert.equal(vazio(0), false);
  assert.equal(esc(`<a href="x">&'`), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
  assert.equal(fmt(1.5), "1,5"); assert.equal(fmt(null), "");
});
test("fórmulas: avaliação, sintaxe e segurança", () => {
  assert.equal(avalF("2*(3+1)", () => null), 8);
  assert.equal(avalF("N2*2", L => (L === "N" ? 1.5 : null)), 3);
  assert.equal(avalF("1/0", () => null), null);
  assert.equal(sintaxeF("N2*(P2+1)"), true);
  assert.equal(sintaxeF("N2*("), false);
  assert.equal(FORM_SEGURA.test("=HYPERLINK(1)"), false);
  assert.equal(FORM_SEGURA.test("=N2*2"), true);
});
test("numRaw resolve referências entre colunas da linha, com desconto no custo", () => {
  assert.equal(numRaw("=N2*2", { N: "1,5" }), 3);
  assert.equal(numRaw("5,5"), 5.5);
  const comDesc = numRaw("=P2", { P: "10" }, 0, 10);
  assert.equal(comDesc, r2c(10 - 10 * kDesc(10)));
  assert.equal(numRaw("=P2", { P: "=P2" }), null, "referência circular não vira número");
});
test("quantidade válida: inteiro de 1 em diante", () => {
  assert.equal(qtdPos("3"), true); assert.equal(qtdPos("0"), false); assert.equal(qtdPos("2,5"), false);
  assert.equal(qtdPos("=1"), true); assert.equal(qtdPos("="), false);
});
test("checaCel valida número e fórmula por coluna", () => {
  assert.deepEqual(checaCel("N", "1,25"), { v: "1,25" });
  assert.match(checaCel("N", "abc").erro, /precisa ser um número/);
  assert.match(checaCel("N", "-1").erro, /negativo/);
  assert.match(checaCel("W", "2,5").erro, /inteiro/);
  assert.match(checaCel("N", "=N2").erro, /própria coluna/);
  assert.deepEqual(checaCel("F", "qualquer texto"), { v: "qualquer texto" });
  assert.ok(LET.includes("N") && NOME.N);
});
test("lerValor: fórmula segura vira fórmula, texto não; peso mantém milésimos e dinheiro centavos", () => {
  assert.equal(lerValor("0,333", "N").v, 0.333);
  assert.equal(lerValor("0,333", "P").v, 0.33);
  assert.deepEqual({ ...lerValor("=N2*2", "P"), txt: undefined }, { v: null, f: "N2*2", txt: undefined });
  assert.deepEqual(lerValor("=HYPERLINK(1)", "P"), { v: "=HYPERLINK(1)" });
  assert.deepEqual(lerValor("=1+1", "F"), { v: "=1+1" });
});
test("calcBanho: por peso, valor fixo e verniz (sem erro de ponto flutuante)", () => {
  const row = { v: { N: "1,334", W: "2" }, banho: { coluna: "R", modo: "peso", mult: 1 }, verniz: 0.42 };
  assert.equal(pesoLinha(row), 1.334);
  assert.deepEqual(calcBanho(row, "R", 4), { v: 1.33, f: "ROUND(N4*1,2)" });
  assert.equal(calcBanho(row, "U", 4).v, 0.56);
  row.banho.modo = "fixo";
  assert.deepEqual(calcBanho(row, "R", 4), { v: 1 });
  assert.equal(calcBanho({ ...row, v: {} , banho: { coluna: "R", modo: "peso", mult: 2 } }, "R", 2), null, "sem peso não há custo de banho");
});
