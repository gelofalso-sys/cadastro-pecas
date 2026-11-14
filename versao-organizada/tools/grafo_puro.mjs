// Classifica cada declaração de nível superior do bloco JS como "pura" (só depende de outras puras e de
// constantes/globais do navegador sem estado) ou "impura" (toca estado, DOM, armazenamento ou depende de algo que toca).
// Uso: node tools/grafo_puro.mjs [--json]   — lista de trabalho da Etapa 2.
import * as espree from "espree";
import * as escope from "eslint-scope";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { arquivosDoBloco, lerBloco } from "./_nucleo.mjs";
export function analisar() {
const decls = new Map();           // nome -> {arq, linha, tipo, refs:Set, mut, escritas:Set}
const arqsPorNome = new Map();     // nome -> arquivos que o declaram (para achar duplicadas)
const IMPUROS = new Set("matchMedia innerWidth innerHeight screen getComputedStyle self globalThis document window navigator localStorage sessionStorage indexedDB toast setTimeout setInterval clearTimeout requestAnimationFrame alert confirm prompt fetch XLSX pdfjsLib Blob URL FileReader Date Math.random crypto console location history".split(" "));
IMPUROS.delete("Date"); IMPUROS.delete("Math.random");
for (const a of arquivosDoBloco()) {
  const arq = a.n, src = lerBloco(a);
  const ast = espree.parse(src, { ecmaVersion: 2023, sourceType: "script", loc: true, range: true });
  const sc = escope.analyze(ast, { ecmaVersion: 2023, sourceType: "script" });
  const glob = sc.scopes[0];
  for (const v of glob.variables) {
    const d = v.defs[0]; if (!d) continue;
    const refs = new Set(); 
    // referências feitas dentro do corpo da declaração (qualquer escopo aninhado)
    const dentro = r => d.node.range && r.identifier.range[0] >= d.node.range[0] && r.identifier.range[1] <= d.node.range[1];
    const todas = []; const colhe = s => { s.references.forEach(r => todas.push(r)); s.childScopes.forEach(colhe) }; colhe(glob);
    for (const r of todas) if (dentro(r) && r.resolved === null || (dentro(r) && r.resolved && r.resolved.scope === glob)) refs.add(r.identifier.name);
    const escritas = new Set();
    for (const r of todas) if (dentro(r) && r.isWrite() && (r.resolved === null || r.resolved.scope === glob) && r.identifier.name !== v.name) escritas.add(r.identifier.name);
    if (!arqsPorNome.has(v.name)) arqsPorNome.set(v.name, []);
    arqsPorNome.get(v.name).push(arq);
    const mut = d.kind === "let" || d.kind === "var" || (d.type === "Variable" && d.parent && d.parent.kind !== "const");
    // escrita fora da declaração em variável const é impossível; em let/var conta como estado
    decls.set(v.name, { arq, linha: d.node.loc.start.line, tipo: d.type, mut, refs: new Set([...refs].filter(n => n !== v.name)), escritas });
  }
}
// semente de impureza: estado mutável de nível superior, globais de navegador com efeito e nomes S/G/ROM
const impuro = new Map();
const marca = (n, porque) => { if (!impuro.has(n)) impuro.set(n, porque) };
for (const [n, d] of decls) {
  if (d.mut) marca(n, "estado mutável");
  for (const r of d.refs) if (IMPUROS.has(r)) marca(n, "usa " + r);
}
let mudou = true;
while (mudou) { mudou = false; for (const [n, d] of decls) { if (impuro.has(n)) continue; for (const r of d.refs) if (impuro.has(r)) { marca(n, "depende de " + r); mudou = true; break } } }
const puras = [...decls].filter(([n]) => !impuro.has(n));
const duplicadas = [...arqsPorNome].filter(([, a]) => new Set(a).size > 1).map(([nome, a]) => ({ nome, arqs: [...new Set(a)] }));
return { decls, impuro, puras, duplicadas };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const { decls, impuro, puras } = analisar();
if (process.argv.includes("--json")) { console.log(JSON.stringify({ puras: puras.map(([n, d]) => ({ n, arq: d.arq, linha: d.linha })), total: decls.size }, null, 1)); }
else {
  const porArq = {};
  for (const [n, d] of puras) (porArq[d.arq] = porArq[d.arq] || []).push(n);
  for (const a of Object.keys(porArq)) console.log(a.padEnd(40), porArq[a].length, porArq[a].join(" ").slice(0, 300));
  console.log("\nDeclarações:", decls.size, " puras:", puras.length, " impuras:", decls.size - puras.length);
}
}
