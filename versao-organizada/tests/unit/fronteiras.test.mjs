// Testes de tools/acoplamento.mjs e tools/checar_fronteiras.mjs (funcoes puras), com decls montado a mao.
import test from "node:test";
import assert from "node:assert/strict";
import { arestas, violacoes, globaisPorFatia, fronteiraDoConjunto } from "../../tools/acoplamento.mjs";
import { donoDoArquivo } from "../../tools/fatias.mjs";
import { novasDuplicadas } from "../../tools/checar_fronteiras.mjs";

const d = (arq, refs = [], escritas = [], mut = false) => ({ arq, linha: 1, tipo: "FunctionName", mut, refs: new Set(refs), escritas: new Set(escritas) });
const fA = { nome: "a", arquivos: ["a.js"], expoe: ["fa"], usa: ["b"], fronteira: "falha" };
const fB = { nome: "b", arquivos: ["b.js"], expoe: ["fb"], usa: ["core"], fronteira: "falha" };
const fatias = [fA, fB];

test("uso de simbolo nao exposto da dona e violacao uso-nao-exposto", () => {
  const decls = new Map([["fa", d("fatias/a/a.js", ["interno"])], ["interno", d("fatias/b/b.js")]]);
  const v = violacoes(decls, fatias);
  assert.deepEqual(v, [{ fatia: "a", arquivo: "fatias/a/a.js", simbolo: "interno", dona: "b", tipo: "uso-nao-exposto" }]);
});
test("uso de simbolo exposto sem a dona em usa e fatia-nao-declarada", () => {
  const decls = new Map([["fb", d("fatias/b/b.js", ["fa"])], ["fa", d("fatias/a/a.js")]]);
  const v = violacoes(decls, fatias);
  assert.equal(v.length, 1);
  assert.equal(v[0].tipo, "fatia-nao-declarada");
  assert.equal(v[0].fatia, "b"); assert.equal(v[0].dona, "a");
});
test("uso de simbolo exposto com a dona em usa nao e violacao", () => {
  const decls = new Map([["fa", d("fatias/a/a.js", ["fb"])], ["fb", d("fatias/b/b.js")]]);
  assert.deepEqual(violacoes(decls, fatias), []);
});
test("escrita em variavel de outra fatia e escrita-externa", () => {
  const decls = new Map([["fa", d("fatias/a/a.js", ["fb"], ["fb"])], ["fb", d("fatias/b/b.js", [], [], true)]]);
  const v = violacoes(decls, fatias);
  assert.ok(v.some(x => x.tipo === "escrita-externa" && x.fatia === "a" && x.simbolo === "fb" && x.dona === "b"));
});
test("uso de simbolo de core ou legado nunca e violacao; arquivo legado nunca e origem", () => {
  const decls = new Map([
    ["fa", d("fatias/a/a.js", ["util", "velho"], ["velho"])],
    ["util", d("core/u.js")], ["velho", d("js/10-x.js")],
    ["leg", d("js/11-y.js", ["fb", "interno"], ["fb"])], ["fb", d("fatias/b/b.js")], ["interno", d("fatias/b/b.js")]]);
  assert.deepEqual(violacoes(decls, fatias), []);
});
test("arestas agrupa por dono de origem e destino, sem laco", () => {
  const decls = new Map([["x", d("js/1.js", ["y", "z", "x2"])], ["x2", d("js/1.js")], ["y", d("js/2.js")], ["z", d("core/c.js")]]);
  const dono = a => a.startsWith("core/") ? "core" : "legado";
  const r = arestas(decls, a => a);
  assert.deepEqual(r.map(e => [e.de, e.para, e.simbolos]), [["js/1.js", "core/c.js", ["z"]], ["js/1.js", "js/2.js", ["y"]]]);
  assert.equal(arestas(decls, dono).length, 1);
});
test("globaisPorFatia conta so declaracoes mut", () => {
  const decls = new Map([["a", d("js/1.js", [], [], true)], ["b", d("js/1.js", [], [], true)], ["c", d("js/2.js")], ["k", d("core/c.js", [], [], true)]]);
  const m = globaisPorFatia(decls, a => a.startsWith("core/") ? "core" : "legado");
  assert.equal(m.get("legado"), 2); assert.equal(m.get("core"), 1);
});
test("donoDoArquivo e compativel com violacoes (chaves fatias/nome/arq)", () => {
  assert.equal(donoDoArquivo(fatias).get("fatias/a/a.js"), "a");
});
test("novasDuplicadas ignora as listadas na base e acusa as novas", () => {
  const dup = [{ nome: "f", arqs: ["a", "b"] }, { nome: "g", arqs: ["a", "b"] }];
  assert.deepEqual(novasDuplicadas(dup, [{ nome: "f", arqs: ["a", "b"] }]).map(x => x.nome), ["g"]);
  assert.equal(novasDuplicadas(dup, []).length, 2);
});
test("fronteiraDoConjunto lista o que o conjunto usa de fora e o que dele e usado de fora", () => {
  const decls = new Map([["a1", d("x.js", ["a2", "ext"])], ["a2", d("x.js")], ["ext", d("y.js")], ["out", d("z.js", ["a2", "ext"])]]);
  const f = fronteiraDoConjunto(decls, ["x.js"]);
  assert.deepEqual(f.usa, [{ simbolo: "ext", arqs: ["y.js"] }]);
  assert.deepEqual(f.usados, [{ simbolo: "a2", arqs: ["z.js"] }]);
});
