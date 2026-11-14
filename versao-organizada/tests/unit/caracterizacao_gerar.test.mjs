// Caracterização: compara o NÚCLEO (src/core) com o que o app gerou com o backup real.
// O golden vem de tests/t_caracterizacao_gerar.py (CP_GOLDEN); sem CP_GOLDEN ou CP_BACKUP o teste pula.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { saidaLinhas$ } from "../../src/core/exportacao.js";
import { calcBanho, pesoLinha } from "../../src/core/formulas.js";
import { gerar$ } from "../../src/core/dominio.js";

const G = process.env.CP_GOLDEN, B = process.env.CP_BACKUP;
const pular = !G || !fs.existsSync(G) ? "sem CP_GOLDEN (rode tests/t_caracterizacao_gerar.py)" : !B || !fs.existsSync(B) ? "sem CP_BACKUP" : null;
const gold = pular ? null : JSON.parse(fs.readFileSync(G, "utf8"));
// o estado S do app depois de carregar o backup (o app normaliza/migra a configuração ao abrir)
const S = gold ? gold.estado : null;
const json = x => JSON.parse(JSON.stringify(x));
const gDoApp = () => ({ linhas: gold.linhas });

test("caracterização: pesoLinha e calcBanho do núcleo = app, linha a linha", { skip: pular || false }, () => {
  assert.equal(gold.derivados.length, gold.linhas.length);
  assert.equal(Object.values(gold.pecas).flat().length, gold.linhas.length);
  gold.linhas.forEach((r, i) => {
    const e = gold.derivados[i];
    assert.deepEqual(json({ v: pesoLinha(r) }), json({ v: e.peso }), `peso, ${r.lancId} linha ${i}`);
    if (r.banho) {
      assert.deepEqual(json(calcBanho(r, r.banho.coluna, i + 2)), json(e.banho), `banho, ${r.lancId} linha ${i}`);
      assert.deepEqual(json(calcBanho(r, "U", i + 2)), json(e.verniz), `verniz, ${r.lancId} linha ${i}`);
    }
  });
  console.log(`# pesoLinha/calcBanho: ${Object.keys(gold.pecas).length} peças, ${gold.linhas.length} linhas comparadas`);
  assert.ok(gold.linhas.length > 0);
});

test("caracterização: saidaLinhas do núcleo = app (normal e agrupando pai/filho)", { skip: pular || false }, () => {
  const g = gDoApp();
  const normal = saidaLinhas$(S, g, null).map(e => ({ t: e.t, pai: e.pai || null, attrs: e.attrs || null, row: e.row }));
  const pai = saidaLinhas$(S, g, { agrupar: "sim" }).map(e => ({ t: e.t, pai: e.pai || null, attrs: e.attrs || null, row: e.row }));
  assert.deepEqual(json(normal), gold.saida_normal);
  assert.deepEqual(json(pai), gold.saida_pai);
  console.log(`# saidaLinhas: ${normal.length} linhas (normal) e ${pai.length} (pai/filho) comparadas`);
});

// `gerar` foi para o núcleo (src/core/dominio.js) na Tarefa 8: gerar$(S, S.lanc) deve reproduzir o que o app gerou.
// O estado é copiado: gerar$ sincroniza os conjuntos lançados (conjCalcular$) e pode escrever em S.lanc.
test("caracterização: gerar$(S, S.lanc) do núcleo = linhas do app, peça a peça", { skip: pular || false }, () => {
  const S2 = json(S), g = gerar$(S2, S2.lanc), por = {};
  g.linhas.forEach(r => { (por[r.lancId] = por[r.lancId] || []).push(r) });
  assert.deepEqual(Object.keys(por).sort(), Object.keys(gold.pecas).sort(), "mesmas peças com linhas");
  for (const id of Object.keys(gold.pecas)) assert.deepEqual(json(por[id]), gold.pecas[id], `linhas da peça ${id}`);
  assert.deepEqual(json(g.linhas), gold.linhas, "ordem das linhas");
  assert.ok(gold.gerar_resto, "golden sem gerar_resto: rode de novo tests/t_caracterizacao_gerar.py");
  assert.deepEqual(json({ refs: g.refs, cont: g.cont, manual: g.manual, manualReal: g.manualReal, semQ: g.semQ }), gold.gerar_resto, "refs/cont/manual/manualReal/semQ");
  assert.deepEqual(json(S2.lanc), json(S.lanc), "gerar$ não altera os lançamentos já sincronizados");
  console.log(`# gerar$: ${Object.keys(por).length} peças, ${g.linhas.length} linhas comparadas`);
});
