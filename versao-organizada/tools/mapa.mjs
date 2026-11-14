// Gera docs/ARQUITETURA.md a partir dos manifestos de fatia e do grafo real.
// Uso: node tools/mapa.mjs --escrever | --conferir   (--conferir sai com 1 se o arquivo estiver desatualizado)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz } from "./_nucleo.mjs";

const lista = l => (l && l.length ? l.map(x => "`" + x + "`").join(", ") : "-");

export function gerarMapa(fatias, arestas, globais) {
  const fs_ = [...fatias].sort((a, b) => a.nome.localeCompare(b.nome));
  const ar = [...arestas].sort((a, b) => a.de.localeCompare(b.de) || a.para.localeCompare(b.para));
  const L = [];
  L.push("# Arquitetura (gerado)", "", "Gerado por `npm run mapa` (tools/mapa.mjs). Nao edite a mao; `node tools/mapa.mjs --conferir` falha se estiver desatualizado.", "");
  L.push("## Fatias", "");
  if (!fs_.length) L.push("Nenhuma fatia declarada ainda (src/fatias/<nome>/FATIA.json).", "");
  for (const f of fs_) {
    const usadaPor = [...new Set(ar.filter(e => e.para === f.nome).map(e => e.de))].sort();
    L.push(`### ${f.nome}`, "", f.descricao || "", "");
    L.push(`- Arquivos: ${lista([...(f.arquivos || [])].sort())}`);
    L.push(`- Expoe: ${lista([...(f.expoe || [])].sort())}`);
    L.push(`- Usa: ${lista([...(f.usa || [])].sort())}`);
    L.push(`- Usada por: ${lista(usadaPor)}`);
    L.push(`- Testes: ${lista([...(f.testes || [])].sort())}`);
    L.push(`- Globais mutaveis: ${globais.get(f.nome) || 0}`);
    L.push(`- Fronteira: ${f.fronteira}`, "");
  }
  L.push("## Dependencias reais entre donos", "");
  if (!ar.length) L.push("Nenhuma.", "");
  else {
    L.push("| de -> para | simbolos |", "|---|---|");
    for (const e of ar) L.push(`| ${e.de} -> ${e.para} | ${e.simbolos.length}: ${e.simbolos.slice(0, 8).map(s => "`" + s + "`").join(", ")}${e.simbolos.length > 8 ? ", ..." : ""} |`);
    L.push("");
  }
  L.push("## Globais mutaveis por dono", "");
  const g = [...globais].sort((a, b) => a[0].localeCompare(b[0]));
  if (!g.length) L.push("Nenhum.", "");
  else { L.push("| dono | globais |", "|---|---|"); for (const [k, n] of g) L.push(`| ${k} | ${n} |`); L.push(""); }
  return L.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const modo = process.argv.includes("--escrever") ? "escrever" : process.argv.includes("--conferir") ? "conferir" : null;
  if (!modo) { console.error("uso: node tools/mapa.mjs --escrever | --conferir"); process.exit(2); }
  const { analisar } = await import("./grafo_puro.mjs");
  const { carregarFatias } = await import("./fatias.mjs");
  const { arestas, globaisPorFatia, donoEfetivo } = await import("./acoplamento.mjs");
  const { decls } = analisar();
  const fatias = carregarFatias();
  const dono = donoEfetivo(fatias);
  const md = gerarMapa(fatias, arestas(decls, dono).filter(e => fatias.some(f => f.nome === e.de || f.nome === e.para)), globaisPorFatia(decls, dono));
  const alvo = path.join(raiz, "docs", "ARQUITETURA.md");
  if (modo === "escrever") { fs.writeFileSync(alvo, md, "utf8"); console.log("docs/ARQUITETURA.md escrito"); }
  else {
    const atual = fs.existsSync(alvo) ? fs.readFileSync(alvo, "utf8") : null;
    if (atual !== md) { console.error("docs/ARQUITETURA.md desatualizado; rode: npm run mapa"); process.exit(1); }
    console.log("docs/ARQUITETURA.md em dia");
  }
}
