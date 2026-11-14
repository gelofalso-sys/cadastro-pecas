// Garante que os módulos de src/core não se importam em círculo (o ESM aceitaria, mas o bloco único montado não).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "core");
const nomes = fs.readdirSync(dir).filter(f => f.endsWith(".js")).map(f => f.slice(0, -3));
const grafo = new Map(nomes.map(n => {
  const t = fs.readFileSync(path.join(dir, n + ".js"), "utf8");
  return [n, [...t.matchAll(/^import\s[^;\n]*?from\s+["']\.\/([^"']+)\.js["']/gm)].map(m => m[1])];
}));

test("src/core não tem import circular", () => {
  const ciclos = [], estado = new Map(), pilha = [];
  const visita = n => {
    if (estado.get(n) === 2) return;
    if (estado.get(n) === 1) { ciclos.push([...pilha.slice(pilha.indexOf(n)), n].join(" -> ")); return; }
    estado.set(n, 1); pilha.push(n);
    for (const d of grafo.get(n) || []) visita(d);
    pilha.pop(); estado.set(n, 2);
  };
  nomes.forEach(visita);
  assert.deepEqual(ciclos, [], "ciclos:\n" + ciclos.join("\n"));
});
