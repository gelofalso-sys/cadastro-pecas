// tools/escritas_entre_fatias.mjs: acha escritas em estadoX.campo feitas fora da fatia dona (Etapa 4.3).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { escritasEntreFatias } from "../../tools/escritas_entre_fatias.mjs";

function projeto(arquivos) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "escritas-"));
  for (const [n, t] of Object.entries(arquivos)) { fs.mkdirSync(path.dirname(path.join(d, n)), { recursive: true }); fs.writeFileSync(path.join(d, n), t); }
  return d;
}

test("acha atribuicao, incremento e escrita em subcampo de outra fatia; ignora leitura e a propria dona", () => {
  const d = projeto({
    "fatias/armazenamento/a.js": "estadoArmazenamento.tabArm=null;",
    "fatias/romaneio/b.js": "estadoArmazenamento.romArm=1;estadoArmazenamento.dirty.c=true;x=estadoArmazenamento.tabArm;if(estadoArmazenamento.romArm===2){}",
    "fatias/tabelas/c.js": "estadoArmazenamento.n++;estadoRomaneio.ROM.log=[]",
    "js/10-x.js": "estadoBase.editId=1;",
  });
  const r = escritasEntreFatias(d).map(e => `${e.arquivo}:${e.objeto}.${e.campo}`).sort();
  assert.deepEqual(r, ["fatias/romaneio/b.js:estadoArmazenamento.dirty", "fatias/romaneio/b.js:estadoArmazenamento.romArm", "fatias/tabelas/c.js:estadoArmazenamento.n", "fatias/tabelas/c.js:estadoRomaneio.ROM"]);
});

test("estadoBase nao tem dona: escrita de qualquer um e permitida", () => {
  const d = projeto({ "fatias/lancamento/a.js": "estadoBase.erro='x';" });
  assert.deepEqual(escritasEntreFatias(d), []);
});
