// Analisa o JavaScript do app como o navegador o vê (um bloco só) e devolve cada aviso
// com arquivo e linha de src/js. Uso: node tools/lint.mjs [--estrito] [--resumo]
import { ESLint } from "eslint";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const js = path.join(raiz, "src", "js");
const ordem = ["_ordem-a.txt", "_ordem-b.txt"].flatMap(m => fs.readFileSync(path.join(js, m), "utf8").split(/\r?\n/).filter(l => l.trim()));
let bloco = "", inicios = [];
for (const n of ordem) { inicios.push({ n, ate: 0, de: bloco.split("\n").length }); bloco += fs.readFileSync(path.join(js, n), "utf8"); inicios.at(-1).ate = bloco.split("\n").length; }
const onde = l => { const f = inicios.find(i => l >= i.de && l <= i.ate) || inicios.at(-1); return `${f.n}:${l - f.de + 1}`; };
const eslint = new ESLint({ cwd: raiz });
const [r] = await eslint.lintText(bloco, { filePath: path.join(raiz, "bloco-montado.js") });
const msgs = r.messages;
const contagem = {};
for (const m of msgs) contagem[m.ruleId || "erro-de-sintaxe"] = (contagem[m.ruleId || "erro-de-sintaxe"] || 0) + 1;
if (!process.argv.includes("--resumo")) for (const m of msgs) console.log(`${onde(m.line)}  ${m.ruleId || "sintaxe"}  ${m.message}`);
console.log("\nResumo:", JSON.stringify(contagem), "total", msgs.length);
const sintaxe = msgs.some(m => m.fatal);
if (sintaxe || (process.argv.includes("--estrito") && msgs.length)) process.exit(1);
