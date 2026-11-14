import test from "node:test";
import assert from "node:assert/strict";
import { gerarMapa, mapaConfere } from "../../tools/mapa.mjs";

const fatias = [
  { nome: "lancamento", descricao: "Lanca pecas", arquivos: ["a.js"], expoe: ["salvarPeca"], usa: ["core"], testes: ["t1.py"], fronteira: "falha" },
  { nome: "romaneio", descricao: "Romaneios", arquivos: ["b.js", "c.js"], expoe: ["gerarRomaneio"], usa: ["lancamento"], testes: [], fronteira: "aponta" },
];
const arestas = [{ de: "romaneio", para: "lancamento", simbolos: ["salvarPeca"] }];
const globais = new Map([["lancamento", 2], ["legado", 40]]);

test("gerarMapa contem nomes, simbolos expostos e arestas", () => {
  const md = gerarMapa(fatias, arestas, globais);
  for (const s of ["lancamento", "romaneio", "salvarPeca", "gerarRomaneio", "t1.py", "falha", "aponta"]) assert.ok(md.includes(s), s);
  assert.ok(/romaneio\s*(->|→)\s*lancamento/.test(md));
});

test("gerarMapa e deterministico e independe da ordem de entrada", () => {
  assert.equal(gerarMapa(fatias, arestas, globais), gerarMapa(fatias, arestas, globais));
  assert.equal(gerarMapa([...fatias].reverse(), arestas, globais), gerarMapa(fatias, arestas, globais));
});

test("gerarMapa sem fatias avisa e mostra globais do legado", () => {
  const md = gerarMapa([], [], new Map([["legado", 40]]));
  assert.ok(md.includes("Nenhuma fatia"));
  assert.ok(md.includes("legado"));
});

test("mapaConfere ignora CRLF e detecta diferenca", () => {
  const md = gerarMapa([], [], new Map());
  assert.ok(mapaConfere(md, md));
  assert.ok(mapaConfere(md.replace(/\n/g, "\r\n"), md));
  assert.ok(!mapaConfere(md + "x", md));
  assert.ok(!mapaConfere((md + "x").replace(/\n/g, "\r\n"), md));
  assert.ok(!mapaConfere(null, md));
});
