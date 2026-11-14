// Move declarações PURAS de src/js para um módulo de src/core, sem mudar o código delas.
// Uso: node tools/extrair_para_core.mjs <modulo> <arquivo.js>[,<arquivo2.js>] [--excluir=a,b] [--so=a,b] [--simular]
//   Depois: node tools/extrair_para_core.mjs --imports   (reescreve os import/export e a ordem dos módulos)
// Só move declarações (function/const/class) que o grafo de pureza marcou como puras
// (sem estado mutável, sem DOM, sem armazenamento e sem depender de nada impuro).
import * as espree from "espree";
import * as escope from "eslint-scope";
import fs from "node:fs";
import path from "node:path";
import { analisar } from "./grafo_puro.mjs";
import { dirSrc, dirCore, dirJs, tirarModulo, lerOrdem } from "./_nucleo.mjs";

const args = process.argv.slice(2);
const opt = n => (args.find(a => a.startsWith("--" + n + "=")) || "").split("=")[1];
const simular = args.includes("--simular");

const analisaModulo = f => { const t = tirarModulo(fs.readFileSync(f, "utf8")); const ast = espree.parse(t, { ecmaVersion: 2023, sourceType: "script", range: true, loc: true }); return { t, ast, sc: escope.analyze(ast, { ecmaVersion: 2023 }) } };
const arqOrdem = path.join(dirSrc, "_ordem.txt");
const ordemCore = () => lerOrdem().filter(n => n.startsWith("core/")).map(n => n.slice(5));
// Regrava o manifesto unico trocando so a parte do nucleo (core/ vem sempre primeiro).
const gravarOrdemCore = mods => fs.writeFileSync(arqOrdem, [...mods.map(m => "core/" + m), ...lerOrdem().filter(n => !n.startsWith("core/"))].join("\n") + "\n");

if (args.includes("--imports")) { reescreverImports(); process.exit(0); }

const [modulo, arquivos] = args;
if (!modulo || !arquivos || modulo.startsWith("--")) { console.error("uso: extrair_para_core.mjs <modulo> <arq1.js,arq2.js> [--excluir=..] [--so=..] [--simular]"); process.exit(2); }
const excluir = new Set((opt("excluir") || "").split(",").filter(Boolean)), so = (opt("so") || "").split(",").filter(Boolean);
const { puras } = analisar();
const puro = new Set(puras.map(([n]) => n));

let corpo = "", movidas = [];
for (const nome of arquivos.split(",")) {
  const f = path.join(dirJs, nome);
  let src = fs.readFileSync(f, "utf8");
  const comments = [];
  const ast = espree.parse(src, { ecmaVersion: 2023, sourceType: "script", range: true, loc: true, comment: true, onComment: comments });
  const cortes = [];
  ast.body.forEach((st, i) => {
    let nomes = [];
    if (st.type === "FunctionDeclaration" || st.type === "ClassDeclaration") nomes = [st.id.name];
    else if (st.type === "VariableDeclaration" && st.declarations.every(d => d.id.type === "Identifier")) nomes = st.declarations.map(d => d.id.name);
    else return;
    if (!nomes.every(n => puro.has(n) && !excluir.has(n) && (!so.length || so.includes(n)))) {
      if (nomes.some(n => puro.has(n) && !excluir.has(n) && (!so.length || so.includes(n)))) console.error("  ! declaração mista, não movida:", nomes.join(","));
      return;
    }
    const prevFim = i ? ast.body[i - 1].range[1] : 0;
    const prevLinhaFim = i ? ast.body[i - 1].loc.end.line : 0;
    // comentários imediatamente acima (não o cabeçalho "/* ===== ... ===== */" e não o comentário que ficou ao fim da linha anterior)
    const acima = comments.filter(c => c.range[0] >= prevFim && c.range[1] <= st.range[0] && c.loc.start.line > prevLinhaFim && !/^\s*=+/.test(c.value));
    let ini = st.range[0];
    // só vale a sequência contínua de comentários que termina colada na declaração (sem outro código entre)
    for (let k = acima.length - 1; k >= 0; k--) { if (/^\s*$/.test(src.slice(acima[k].range[1], ini))) ini = acima[k].range[0]; else break }
    // comentário no fim da mesma linha
    let fim = st.range[1];
    const mesma = comments.find(c => c.range[0] >= fim && c.loc.start.line === st.loc.end.line && /^[ \t;]*$/.test(src.slice(fim, c.range[0])));
    if (mesma) fim = mesma.range[1];
    const nl = src.indexOf("\n", fim); const resto = src.slice(fim, nl < 0 ? src.length : nl);
    if (/^\s*$/.test(resto)) fim = nl < 0 ? src.length : nl + 1;
    cortes.push({ ini, fim, st, nomes });
  });
  if (!cortes.length) continue;
  for (const c of cortes) {
    const antes = src.slice(c.ini, c.st.range[0]), decl = src.slice(c.st.range[0], c.fim);
    corpo += antes + "export " + decl + (decl.endsWith("\n") ? "" : "\n");
    movidas.push(...c.nomes);
  }
  let novo = src;
  for (const c of [...cortes].reverse()) novo = novo.slice(0, c.ini) + novo.slice(c.fim);
  if (!simular) fs.writeFileSync(f, novo);
  console.log(nome, "->", cortes.length, "declarações");
}
if (!movidas.length) { console.log("nada para mover"); process.exit(0); }
if (simular) { console.log("(simulação)", movidas.length, "nomes:", movidas.join(" ")); process.exit(0); }
fs.mkdirSync(dirCore, { recursive: true });
const alvo = path.join(dirCore, modulo + ".js");
const cab = fs.existsSync(alvo) ? "" : `/* ===== núcleo: ${modulo} — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */\n`;
fs.appendFileSync(alvo, cab + corpo);
const ord = ordemCore(); if (!ord.includes(modulo + ".js")) { ord.push(modulo + ".js"); gravarOrdemCore(ord) }
console.log("movidas", movidas.length, "para", path.relative(process.cwd(), alvo));

// ---------- imports e ordem ----------
function reescreverImports() {
  const mods = ordemCore();
  const info = mods.map(m => {
    const f = path.join(dirCore, m); let texto = fs.readFileSync(f, "utf8");
    texto = texto.replace(/^\/\/ @auto-imports[\s\S]*?\/\/ @fim-imports\n/m, "");
    fs.writeFileSync(f, texto);
    const { ast, sc } = analisaModulo(f);
    const exporta = new Set(); sc.scopes[0].variables.forEach(v => exporta.add(v.name));
    const livres = new Set(); const colhe = s => { s.references.forEach(r => { if (!r.resolved) livres.add(r.identifier.name) }); s.childScopes.forEach(colhe) }; colhe(sc.scopes[0]);
    // referências "de topo" (executadas na carga) servem para ordenar: só consts/classes avaliadas no carregamento importam
    return { m, f, texto, exporta, livres };
  });
  const dono = new Map(); info.forEach(i => i.exporta.forEach(n => dono.set(n, i.m)));
  info.forEach(i => {
    const por = {}; i.livres.forEach(n => { const d = dono.get(n); if (d && d !== i.m) (por[d] = por[d] || []).push(n) });
    const linhas = Object.keys(por).sort().map(d => `import { ${por[d].sort().join(", ")} } from "./${d}";`);
    i.deps = Object.keys(por);
    const bloco = linhas.length ? "// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)\n" + linhas.join("\n") + "\n// @fim-imports\n" : "";
    const t = i.texto.replace(/^\/\* =====.*\n/, m => m + bloco);
    fs.writeFileSync(i.f, bloco && !/^\/\* =====/.test(i.texto) ? bloco + i.texto : t);
  });
  // ordem: dependências antes de quem as usa (ciclos entre módulos são avisados; funções não dependem da ordem, constantes sim)
  const ordem = [], vis = new Map();
  const visita = m => { if (vis.get(m) === 2) return; if (vis.get(m) === 1) { console.error("  ! ciclo entre módulos envolvendo", m); return } vis.set(m, 1); (info.find(i => i.m === m).deps || []).forEach(visita); vis.set(m, 2); ordem.push(m) };
  mods.forEach(visita);
  gravarOrdemCore(ordem);
  console.log("ordem:", ordem.join(" "));
}
