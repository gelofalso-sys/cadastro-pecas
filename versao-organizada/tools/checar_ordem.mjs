// Procura uso, na carga, de const/let/class declarados DEPOIS no bloco montado (erro de ordem: "Cannot access before initialization").
// Só vê referências feitas diretamente no nível superior (as dentro de funções rodam depois da carga).
import * as espree from "espree";
import * as escope from "eslint-scope";
import { arquivosDoBloco, lerBloco } from "./_nucleo.mjs";
let bloco = "", marcos = [];
for (const a of arquivosDoBloco()) { marcos.push({ n: a.n, de: bloco.length }); bloco += lerBloco(a); }
const ast = espree.parse(bloco, { ecmaVersion: 2023, sourceType: "script", range: true, loc: true });
const sc = escope.analyze(ast, { ecmaVersion: 2023 }), g = sc.scopes[0];
const onde = pos => { const m = [...marcos].reverse().find(x => x.de <= pos); return m.n + ":" + (bloco.slice(m.de, pos).split("\n").length) };
let ruins = 0;
for (const r of g.references) {
  const v = r.resolved; if (!v || !v.defs.length) continue;
  const d = v.defs[0]; if (d.type !== "Variable" && d.type !== "ClassName") continue;
  if (d.parent && d.parent.kind === "var") continue;
  if (r.identifier.range[0] < d.name.range[0]) { ruins++; console.log("uso antes da declaração:", v.name, "usado em", onde(r.identifier.range[0]), "declarado em", onde(d.name.range[0])) }
}
console.log(ruins ? "\nFALHA: " + ruins + " uso(s) na carga antes da declaração" : "OK: nenhuma ordem de carga problemática");
process.exit(ruins ? 1 : 0);
