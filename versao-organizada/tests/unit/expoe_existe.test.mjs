// Todo nome listado em `expoe` de um FATIA.json precisa existir como declaracao de nivel superior do app (Etapa 4, 4.1).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as espree from "espree";
import * as escope from "eslint-scope";
import { arquivosDoBloco, lerBloco, dirSrc } from "../../tools/_nucleo.mjs";

test("expoe so lista nomes que existem", () => {
  const bloco = arquivosDoBloco().map(lerBloco).join("");
  const ast = espree.parse(bloco, { ecmaVersion: "latest", sourceType: "script", range: true });
  const nomes = new Set(escope.analyze(ast, { ecmaVersion: 2022, sourceType: "script" }).globalScope.variables.map(v => v.name));
  const mortos = [];
  for (const d of fs.readdirSync(path.join(dirSrc, "fatias"))) {
    const f = path.join(dirSrc, "fatias", d, "FATIA.json");
    if (!fs.existsSync(f)) continue;
    for (const n of JSON.parse(fs.readFileSync(f, "utf8")).expoe || []) if (!nomes.has(n)) mortos.push(`${d}: ${n}`);
  }
  assert.deepEqual(mortos, []);
});
