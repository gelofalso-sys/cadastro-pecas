// Manifestos de fatia: src/fatias/<nome>/FATIA.json. Uso: node tools/fatias.mjs --validar
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz, lerOrdem } from "./_nucleo.mjs";

const CAMPOS = ["nome", "descricao", "arquivos", "expoe", "usa", "testes", "fronteira"];
const LISTAS = ["arquivos", "expoe", "usa", "testes"];

export function carregarFatias(r = raiz) {
  const dir = path.join(r, "src", "fatias");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(dir, d.name, "FATIA.json")))
    .map(d => ({ ...JSON.parse(fs.readFileSync(path.join(dir, d.name, "FATIA.json"), "utf8")), _pasta: d.name }));
}

export function donoDoArquivo(fatias) {
  const m = new Map();
  for (const f of fatias) for (const a of f.arquivos || []) m.set(`fatias/${f.nome}/${a}`, f.nome);
  return m;
}

export function validarFatias(fatias, ordem, existe) {
  const erros = [];
  const nomes = new Set(fatias.map(f => f.nome));
  for (const f of fatias) {
    const id = `fatia "${f.nome ?? f._pasta ?? "?"}"`;
    for (const c of CAMPOS) if (!(c in f)) erros.push(`${id}: campo obrigatorio ausente em FATIA.json: ${c}`);
    for (const c of LISTAS) if (c in f && !Array.isArray(f[c])) erros.push(`${id}: campo ${c} deve ser lista`);
    if ("fronteira" in f && f.fronteira !== "aponta" && f.fronteira !== "falha") erros.push(`${id}: fronteira invalida (${JSON.stringify(f.fronteira)}); use "aponta" ou "falha"`);
    if (Array.isArray(f.usa)) for (const u of f.usa) if (u !== "core" && !nomes.has(u)) erros.push(`${id}: usa cita fatia inexistente: ${u}`);
    if (Array.isArray(f.arquivos)) for (const a of f.arquivos) {
      const rel = `fatias/${f.nome}/${a}`;
      if (!existe(rel)) erros.push(`${id}: arquivo listado nao existe: ${rel}`);
      if (!ordem.includes(rel)) erros.push(`${id}: arquivo ${rel} esta no FATIA.json mas falta em src/_ordem.txt`);
    }
  }
  const donos = donoDoArquivo(fatias);
  for (const o of ordem) if (o.startsWith("fatias/") && !donos.has(o)) erros.push(`arquivo ${o} esta em src/_ordem.txt mas nenhum FATIA.json o lista`);
  return erros;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes("--validar")) {
  const fatias = carregarFatias();
  const erros = validarFatias(fatias, lerOrdem(), rel => fs.existsSync(path.join(raiz, "src", rel)));
  if (erros.length) { console.error(erros.join("\n")); process.exit(1); }
  console.log(`fatias: ${fatias.length} validada(s), sem erros`);
}
