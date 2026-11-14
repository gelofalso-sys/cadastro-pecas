// Etapa 2: leva para src/core as funções que só dependem do estado S, passando S como PRIMEIRO ARGUMENTO.
// Cada função f vira f$(S, ...) no núcleo; chamadas entre elas ganham o S; uma referência sem chamada vira um wrapper.
// Em src/js/00-adaptadores-nucleo.js ficam os adaptadores `function f(...a){return f$(S,...a)}`, então o resto do app não muda.
// Uso: node tools/injetar_estado.mjs [--simular]
import * as espree from "espree";
import * as escope from "eslint-scope";
import fs from "node:fs";
import path from "node:path";
import { analisar } from "./grafo_puro.mjs";
import { dirSrc, dirCore, dirJs, lerOrdem } from "./_nucleo.mjs";

const simular = process.argv.includes("--simular");
const { decls, impuro } = analisar();
const API = new Set("document window navigator localStorage sessionStorage indexedDB toast setTimeout setInterval clearTimeout requestAnimationFrame alert confirm prompt fetch XLSX pdfjsLib Blob URL FileReader console location history crypto matchMedia innerWidth innerHeight screen getComputedStyle self globalThis".split(" "));
const memo = new Map();
const sementes = (n, vis = new Set()) => {
  if (memo.has(n)) return memo.get(n); if (vis.has(n)) return new Set(); vis.add(n);
  const d = decls.get(n), out = new Set(); if (d.mut) out.add("var:" + n);
  for (const r of d.refs) { if (API.has(r)) out.add("api:" + r); else if (decls.has(r)) for (const s of sementes(r, vis)) out.add(s) }
  memo.set(n, out); return out;
};
const Q = new Set();
for (const [n, d] of decls) if (impuro.has(n) && !d.mut && d.arq && !d.arq.startsWith("core/")) { const s = [...sementes(n)]; if (s.length && s.every(x => x === "var:S")) Q.add(n) }
// destino por arquivo de origem
const DEST = { "10-limites-e-colunas.js": "configuracao", "11-utilidades.js": "configuracao", "12-motor-linhas.js": "configuracao", "13-modelo-e-variacoes.js": "exportacao", "28-exportar.js": "exportacao", "18-conjunto.js": "dominio", "19c-colar-romaneio.js": "romaneio", "21-edicao-em-lote-e-revisao.js": "romaneio", "33-janelas-busca-e-paleta.js": "romaneio", "23-fotos-imgbb-e-nota-fiscal.js": "notafiscal" };
const arquivos = [...new Set([...Q].map(n => decls.get(n).arq))];
const porModulo = {}, adaptadores = [], relatorio = [];
for (const arq of arquivos) {
  const f = path.join(dirSrc, arq); let src = fs.readFileSync(f, "utf8");
  const comments = [];
  const ast = espree.parse(src, { ecmaVersion: 2023, sourceType: "script", range: true, loc: true, comment: true, onComment: comments });
  const sc = escope.analyze(ast, { ecmaVersion: 2023 });
  const refsPorNo = [];
  const colhe = s => { s.references.forEach(r => refsPorNo.push(r)); s.childScopes.forEach(colhe) }; colhe(sc.scopes[0]);
  const cortes = [];
  ast.body.forEach((st, i) => {
    let nomes = [], fnNodes = [];
    if (st.type === "FunctionDeclaration") { nomes = [st.id.name]; fnNodes = [{ node: st, id: st.id }] }
    else if (st.type === "VariableDeclaration" && st.kind === "const" && st.declarations.every(d => d.id.type === "Identifier")) { nomes = st.declarations.map(d => d.id.name); fnNodes = st.declarations.map(d => ({ node: d.init, id: d.id })) }
    else return;
    if (!nomes.every(n => Q.has(n))) { if (nomes.some(n => Q.has(n))) relatorio.push("declaração mista, ficou: " + nomes.join(",")); return }
    if (fnNodes.some(x => !x.node || !/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(x.node.type))) { relatorio.push("valor não-função lê S na carga, ficou: " + nomes.join(",")); return }
    const edits = [];
    const dentro = r => r.identifier.range[0] >= st.range[0] && r.identifier.range[1] <= st.range[1];
    // 1) nome e parâmetro S da própria declaração
    for (const { node, id } of fnNodes) {
      edits.push([id.range[1], id.range[1], "$"]);
      if (node.type === "ArrowFunctionExpression") {
        let p = node.range[0]; const m = /^async\s+/.exec(src.slice(p)); if (m) p += m[0].length;
        if (src[p] === "(") { const vazio = /^\(\s*\)/.test(src.slice(p)); edits.push([p + 1, p + 1, vazio ? "S" : "S,"]) }
        else edits.push([p, node.params[0].range[1], "(S," + src.slice(p, node.params[0].range[1]) + ")"]);
      } else {
        const ab = src.indexOf("(", node.type === "FunctionDeclaration" ? node.id.range[1] : node.range[0]);
        edits.push([ab + 1, ab + 1, node.params.length ? "S," : "S"]);
      }
    }
    // 2) referências a outras funções de Q (ou a ela mesma) dentro do corpo
    for (const r of refsPorNo) {
      if (!dentro(r) || !Q.has(r.identifier.name)) continue;
      if (r.resolved && r.resolved.scope.type !== "global") continue;   // sombreado por variável local
      const idn = r.identifier; if (fnNodes.some(x => x.id === idn)) continue;
      const a = idn.range[1];
      // chamada direta?  f(…)
      const call = findCall(ast, idn);
      if (call) { const ab = src.indexOf("(", a); edits.push([ab + 1, ab + 1, call.arguments.length ? "S," : "S"]); edits.push([a, a, "$"]) }
      else edits.push([idn.range[0], idn.range[1], "((...a)=>" + idn.name + "$(S,...a))"]);
    }
    // comentários acima e no fim da linha (como no extrator)
    const prevFim = i ? ast.body[i - 1].range[1] : 0, prevLinha = i ? ast.body[i - 1].loc.end.line : 0;
    const acima = comments.filter(c => c.range[0] >= prevFim && c.range[1] <= st.range[0] && c.loc.start.line > prevLinha && !/^\s*=+/.test(c.value));
    let ini = st.range[0]; for (let k = acima.length - 1; k >= 0; k--) { if (/^\s*$/.test(src.slice(acima[k].range[1], ini))) ini = acima[k].range[0]; else break }
    let fim = st.range[1];
    const mesma = comments.find(c => c.range[0] >= fim && c.loc.start.line === st.loc.end.line && /^[ \t;]*$/.test(src.slice(fim, c.range[0])));
    if (mesma) fim = mesma.range[1];
    const nl = src.indexOf("\n", fim); if (/^\s*$/.test(src.slice(fim, nl < 0 ? src.length : nl))) fim = nl < 0 ? src.length : nl + 1;
    // aplica as edições (de trás para a frente) ao texto da declaração
    let txt = src.slice(st.range[0], fim), base = st.range[0];
    for (const [a, b, t] of edits.sort((x, y) => y[0] - x[0] || y[1] - x[1])) txt = txt.slice(0, a - base) + t + txt.slice(b - base);
    cortes.push({ ini, fim, antes: src.slice(ini, st.range[0]), txt, nomes });
  });
  function findCall(ast, idn) { let achou = null; (function v(n) { if (achou || !n || typeof n.type !== "string") return; if (n.range && (idn.range[0] < n.range[0] || idn.range[1] > n.range[1])) return; if (n.type === "CallExpression" && n.callee === idn) { achou = n; return } for (const k of Object.keys(n)) { const c = n[k]; if (Array.isArray(c)) c.forEach(v); else if (c && typeof c.type === "string") v(c) } })(ast); return achou }
  if (!cortes.length) continue;
  const mod = DEST[path.basename(arq)] || "dominio";
  for (const c of cortes) { (porModulo[mod] = porModulo[mod] || []).push(c.antes + "export " + c.txt + (c.txt.endsWith("\n") ? "" : "\n")); c.nomes.forEach(n => adaptadores.push(`function ${n}(...a){return ${n}$(S,...a)}`)) }
  let novo = src; for (const c of [...cortes].reverse()) novo = novo.slice(0, c.ini) + novo.slice(c.fim);
  if (!simular) fs.writeFileSync(f, novo);
  console.log(arq, "->", cortes.length);
}
relatorio.forEach(r => console.log("  !", r));
console.log("total movidas:", adaptadores.length, "de", Q.size);
if (simular) process.exit(0);
for (const [mod, partes] of Object.entries(porModulo)) {
  const alvo = path.join(dirCore, mod + ".js");
  fs.appendFileSync(alvo, (fs.existsSync(alvo) ? "" : `/* ===== núcleo: ${mod} — funções que recebem o estado S como primeiro argumento (nome$) ===== */\n`) + partes.join(""));
  const l = lerOrdem(); if (!l.includes("core/" + mod + ".js")) { const k = l.filter(x => x.startsWith("core/")).length; l.splice(k, 0, "core/" + mod + ".js"); fs.writeFileSync(path.join(dirSrc, "_ordem.txt"), l.join("\n") + "\n") }
}
fs.writeFileSync(path.join(dirJs, "00-adaptadores-nucleo.js"), "/* ===== adaptadores: o app chama f(...); o núcleo recebe o estado: f$(S, ...). Gerado por tools/injetar_estado.mjs ===== */\n" + adaptadores.join("\n") + "\n");
const la = lerOrdem(); if (!la.includes("js/00-adaptadores-nucleo.js")) { const k = la.filter(x => x.startsWith("core/")).length; la.splice(k, 0, "js/00-adaptadores-nucleo.js"); fs.writeFileSync(path.join(dirSrc, "_ordem.txt"), la.join("\n") + "\n") }
