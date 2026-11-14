// Divide um arquivo de src/ em pedaços sem mudar o HTML montado (o hash tem de ficar igual).
// Uso: node tools/dividir_arquivo.mjs <arquivo> <corte>:<destino> ... <destino-final>
//   <corte> = número da linha (1-based) onde começa o próximo pedaço; <destino> = nome do arquivo (na pasta do original).
//   Ex.: node tools/dividir_arquivo.mjs src/js/50-x.js 120:50a-x.js 300:50b-x.js 50c-x.js
// O corte só é aceito entre instruções de nível superior (confirmado com espree). A linha do arquivo em
// src/_ordem.txt é trocada pelas linhas dos pedaços, na mesma posição. Se o hash do HTML mudar, tudo é desfeito.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as espree from "espree";

function analisar(texto) {
  const op = { ecmaVersion: "latest", range: true, comment: true };
  try { return espree.parse(texto, { ...op, sourceType: "script" }) }
  catch (e1) { try { return espree.parse(texto, { ...op, sourceType: "module" }) } catch { throw new Error("não consegui ler o arquivo como JavaScript: " + e1.message) } }
}

export function dividir(texto, cortes) {
  const linhas = texto.match(/[^\n]*\n|[^\n]+$/g) || [];
  const ini = [0]; for (const l of linhas) ini.push(ini[ini.length - 1] + l.length); // ini[i] = deslocamento da linha i+1
  let ant = 1;
  for (const c of cortes) {
    if (!Number.isInteger(c) || c <= ant || c > linhas.length) throw new Error(`corte inválido: ${c} (use linhas crescentes entre 2 e ${linhas.length})`);
    ant = c;
  }
  const ast = analisar(texto);
  const offs = cortes.map(c => ini[c - 1]);
  for (let i = 0; i < cortes.length; i++) {
    const o = offs[i];
    for (const s of ast.body) if (s.range[0] < o && o < s.range[1]) throw new Error(`corte na linha ${cortes[i]} cai dentro de uma instrução de nível superior (função, bloco, template ou expressão); escolha uma linha entre instruções`);
    for (const c of ast.comments) if (c.range[0] < o && o < c.range[1]) throw new Error(`corte na linha ${cortes[i]} cai dentro de um comentário`);
  }
  const pedacos = []; let a = 0;
  for (const o of [...offs, texto.length]) { pedacos.push(texto.slice(a, o)); a = o }
  return pedacos;
}

function hash() { return execFileSync("python", [path.join(raiz, "tools", "hash_html.py")], { encoding: "utf8" }).trim() }
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function cli(args) {
  if (args.length < 3) { console.error("uso: node tools/dividir_arquivo.mjs <arquivo> <corte>:<destino> ... <destino-final>"); process.exit(2) }
  const arq = path.resolve(args[0]), dir = path.dirname(arq);
  const dirSrc = path.join(raiz, "src"), rel = path.relative(dirSrc, arq).split(path.sep).join("/");
  const cortes = [], destinos = [];
  for (const a of args.slice(1, -1)) { const m = /^(\d+):(.+)$/.exec(a); if (!m) { console.error("argumento inválido (esperado <corte>:<destino>): " + a); process.exit(2) } cortes.push(+m[1]); destinos.push(m[2]) }
  destinos.push(args[args.length - 1]);
  const arqOrdem = path.join(dirSrc, "_ordem.txt");
  const ordemAnt = fs.readFileSync(arqOrdem, "utf8"), linhas = ordemAnt.split(/\r?\n/).filter(l => l.trim());
  const pos = linhas.indexOf(rel);
  if (pos < 0) { console.error(`${rel} não está em src/_ordem.txt`); process.exit(2) }
  const alvos = destinos.map(d => path.join(dir, d));
  const novos = alvos.map(f => path.relative(dirSrc, f).split(path.sep).join("/"));
  if (new Set(novos).size !== novos.length) { console.error("destinos repetidos"); process.exit(2) }
  for (let i = 0; i < alvos.length; i++) if (fs.existsSync(alvos[i]) && alvos[i] !== arq) { console.error("destino já existe: " + destinos[i]); process.exit(2) }
  const original = fs.readFileSync(arq); // Buffer: restauração exata
  let pedacos; try { pedacos = dividir(original.toString("utf8"), cortes) } catch (e) { console.error("recusado: " + e.message); process.exit(1) }
  const antes = hash();
  const criados = [];
  const desfazer = () => {
    for (const f of criados) if (f !== arq) fs.rmSync(f, { force: true });
    fs.writeFileSync(arq, original); fs.writeFileSync(arqOrdem, ordemAnt);
  };
  try {
    alvos.forEach((f, i) => { fs.writeFileSync(f, pedacos[i]); criados.push(f) });
    if (!alvos.includes(arq)) fs.rmSync(arq);
    const nl = linhas.slice(); nl.splice(pos, 1, ...novos);
    fs.writeFileSync(arqOrdem, nl.join("\n") + "\n");
    const depois = hash();
    if (depois !== antes) { desfazer(); console.error(`hash mudou (${antes} -> ${depois}); desfeito`); process.exit(1) }
  } catch (e) { desfazer(); console.error("erro, desfeito: " + e.message); process.exit(1) }
  console.log(`OK: ${rel} -> ${novos.join(", ")}\nhash idêntico: ${antes}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) cli(process.argv.slice(2));
