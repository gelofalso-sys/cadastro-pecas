// Checa fronteiras entre fatias. Uso: node tools/checar_fronteiras.mjs [--base]
// Sai com 1 se houver nomes declarados em mais de um arquivo (duplicadas) que nao estejam em docs/fronteiras-base.json,
// ou violacao em fatia com fronteira "falha". Fatia "aponta" so lista. --base grava docs/fronteiras-base.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz } from "./_nucleo.mjs";
import { analisar } from "./grafo_puro.mjs";
import { carregarFatias } from "./fatias.mjs";
import { violacoes, globaisPorFatia, donoEfetivo } from "./acoplamento.mjs";

export function novasDuplicadas(duplicadas, base) {
  const conhecidas = new Set((base || []).map(b => b.nome));
  return duplicadas.filter(d => !conhecidas.has(d.nome));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arqBase = path.join(raiz, "docs", "fronteiras-base.json");
  const { decls, duplicadas } = analisar();
  const fatias = carregarFatias();
  if (process.argv.includes("--base")) {
    const porArq = {};
    for (const d of decls.values()) if (d.mut) porArq[d.arq] = (porArq[d.arq] || 0) + 1;
    const total = Object.values(porArq).reduce((a, b) => a + b, 0);
    const ordenado = Object.fromEntries(Object.entries(porArq).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
    fs.writeFileSync(arqBase, JSON.stringify({ globaisMutaveisTotal: total, globaisMutaveisPorArquivo: ordenado, duplicadas, violacoes: violacoes(decls, fatias).length }, null, 2) + "\n", "utf8");
    console.log(`docs/fronteiras-base.json escrito: ${total} globais mutaveis, ${duplicadas.length} duplicada(s)`);
    process.exit(0);
  }
  const base = fs.existsSync(arqBase) ? JSON.parse(fs.readFileSync(arqBase, "utf8")).duplicadas : [];
  const novas = novasDuplicadas(duplicadas, base);
  for (const d of duplicadas) if (!novas.includes(d)) console.warn(`aviso: nome duplicado (na linha de base): ${d.nome} em ${d.arqs.join(", ")}`);
  for (const d of novas) console.error(`ERRO: nome declarado em mais de um arquivo: ${d.nome} em ${d.arqs.join(", ")}`);
  const modo = new Map(fatias.map(f => [f.nome, f.fronteira]));
  const vs = violacoes(decls, fatias);
  let falhou = novas.length > 0;
  for (const v of vs) {
    const falha = modo.get(v.fatia) === "falha";
    if (falha) falhou = true;
    (falha ? console.error : console.warn)(`${falha ? "ERRO" : "aviso"}: [${v.tipo}] fatia ${v.fatia} (${v.arquivo}) -> ${v.simbolo} de ${v.dona}`);
  }
  const g = globaisPorFatia(decls, donoEfetivo(fatias));
  console.log(`fronteiras: ${fatias.length} fatia(s), ${vs.length} violacao(oes), ${duplicadas.length} duplicada(s); globais mutaveis: ${[...g].map(([k, n]) => `${k}=${n}`).join(" ") || "0"}`);
  if (falhou) process.exit(1);
}
