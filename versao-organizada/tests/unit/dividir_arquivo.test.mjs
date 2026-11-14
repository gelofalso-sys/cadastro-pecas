// Testes da ferramenta tools/dividir_arquivo.mjs (corte só entre instruções de nível superior).
import test from "node:test";
import assert from "node:assert/strict";
import { dividir } from "../../tools/dividir_arquivo.mjs";

test("dividir em linha limpa: dois pedaços cuja concatenação é o original", () => {
  const t = "const a=1;\nconst b=2;\nfunction f(){return a+b}\nf();\n";
  const p = dividir(t, [3]);
  assert.equal(p.length, 2);
  assert.equal(p.join(""), t);
  assert.equal(p[0], "const a=1;\nconst b=2;\n");
});

test("vários cortes", () => {
  const t = "a();\nb();\nc();\nd();\n";
  assert.deepEqual(dividir(t, [2, 4]), ["a();\n", "b();\nc();\n", "d();\n"]);
});

test("corte dentro de função é recusado", () => {
  const t = "function f(){\n  return 1;\n}\nf();\n";
  assert.throws(() => dividir(t, [2]), /instru/i);
});

test("corte dentro de template literal é recusado", () => {
  const t = "const x=`linha1\nlinha2\nlinha3`;\nx;\n";
  assert.throws(() => dividir(t, [2]), /instru|template/i);
});

test("corte dentro de comentário de bloco é recusado", () => {
  const t = "a();\n/* um\n dois */\nb();\n";
  assert.throws(() => dividir(t, [3]), /coment/i);
});

test("CRLF é preservado", () => {
  const t = "a();\r\nb();\r\nc();\r\n";
  const p = dividir(t, [2]);
  assert.equal(p.join(""), t);
  assert.equal(p[0], "a();\r\n");
});

test("corte inválido (fora do intervalo ou fora de ordem) é recusado", () => {
  const t = "a();\nb();\n";
  assert.throws(() => dividir(t, [1]));
  assert.throws(() => dividir(t, [9]));
  assert.throws(() => dividir("a();\nb();\nc();\n", [3, 2]));
});
