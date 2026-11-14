// Analisa o JavaScript do app como o navegador o vê (um bloco só) e devolve cada aviso
// com arquivo e linha de src/js. Uso: node tools/lint.mjs [--estrito] [--resumo]
import { ESLint } from "eslint";
import path from "node:path";
import { raiz, arquivosDoBloco, lerBloco } from "./_nucleo.mjs";
let bloco = "", inicios = [];
const linhas = t => t.split(String.fromCharCode(10)).length;
for (const a of arquivosDoBloco()) { inicios.push({ n: a.n, ate: 0, de: linhas(bloco) }); bloco += lerBloco(a); inicios.at(-1).ate = linhas(bloco); }
const eslint = new ESLint({ cwd: raiz });
const [r] = await eslint.lintText(bloco, { filePath: path.join(raiz, "bloco-montado.js") });
const msgs = r.messages;
const contagem = {};
for (const m of msgs) contagem[m.ruleId || "erro-de-sintaxe"] = (contagem[m.ruleId || "erro-de-sintaxe"] || 0) + 1;
if (!process.argv.includes("--resumo")) for (const m of msgs) console.log(`${onde(m.line)}  ${m.ruleId || "sintaxe"}  ${m.message}`);
console.log("\nResumo:", JSON.stringify(contagem), "total", msgs.length);
const sintaxe = msgs.some(m => m.fatal);
if (sintaxe || (process.argv.includes("--estrito") && msgs.length)) process.exit(1);
