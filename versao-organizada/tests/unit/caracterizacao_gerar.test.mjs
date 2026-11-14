// Caracterização: compara o NÚCLEO (src/core) com o que o app gerou com o backup real.
// O golden vem de tests/t_caracterizacao_gerar.py (CP_GOLDEN); sem CP_GOLDEN ou CP_BACKUP o teste pula.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { saidaLinhas$ } from "../../src/core/exportacao.js";
import { calcBanho, pesoLinha } from "../../src/core/formulas.js";

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

// `gerar` ainda vive no app (src/js/12-motor-linhas.js); a Tarefa 8 leva para o núcleo e ativa este teste:
// gerar$(S, S.lanc).linhas agrupadas por lancId devem ser iguais a gold.pecas.
test.todo("caracterização: gerar$(S, S.lanc) do núcleo = linhas do app, peça a peça (ativar na Tarefa 8)");
