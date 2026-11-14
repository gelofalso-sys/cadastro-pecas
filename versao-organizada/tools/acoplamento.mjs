// Acoplamento entre arquivos/fatias a partir do grafo real. Uso: node tools/acoplamento.mjs [--escrever]
// Funcoes puras (arestas, violacoes, globaisPorFatia) sao testadas em tests/unit/fronteiras.test.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz } from "./_nucleo.mjs";
import { analisar } from "./grafo_puro.mjs";
import { carregarFatias, donoDoArquivo } from "./fatias.mjs";

// Arestas de dependencia entre donos: de usa simbolos declarados em para. Sem lacos (de === para).
export function arestas(decls, dono) {
  const m = new Map();
  for (const [, d] of decls) for (const r of d.refs) {
    const alvo = decls.get(r); if (!alvo) continue;
    const de = dono(d.arq), para = dono(alvo.arq);
    if (de === para) continue;
    const k = de + "\0" + para;
    if (!m.has(k)) m.set(k, { de, para, simbolos: new Set() });
    m.get(k).simbolos.add(r);
  }
  return [...m.values()].map(e => ({ ...e, simbolos: [...e.simbolos].sort() }))
    .sort((a, b) => a.de.localeCompare(b.de) || a.para.localeCompare(b.para));
}

// Violacoes de fronteira. Origem sempre numa fatia declarada; alvo so conta se a dona for outra fatia declarada.
export function violacoes(decls, fatias) {
  const donos = donoDoArquivo(fatias);
  const porNome = new Map(fatias.map(f => [f.nome, f]));
  const out = [], visto = new Set();
  const add = v => { const k = JSON.stringify(v); if (!visto.has(k)) { visto.add(k); out.push(v) } };
  for (const [, d] of decls) {
    const fatia = donos.get(d.arq); if (!fatia) continue;
    for (const r of d.refs) {
      const alvo = decls.get(r); if (!alvo) continue;
      const dona = donos.get(alvo.arq); if (!dona || dona === fatia) continue;
      if (!(porNome.get(dona).expoe || []).includes(r)) add({ fatia, arquivo: d.arq, simbolo: r, dona, tipo: "uso-nao-exposto" });
      else if (!(porNome.get(fatia).usa || []).includes(dona)) add({ fatia, arquivo: d.arq, simbolo: r, dona, tipo: "fatia-nao-declarada" });
    }
    for (const r of d.escritas || []) {
      const alvo = decls.get(r); if (!alvo) continue;
      const dona = donos.get(alvo.arq); if (!dona || dona === fatia) continue;
      add({ fatia, arquivo: d.arq, simbolo: r, dona, tipo: "escrita-externa" });
    }
  }
  return out;
}

export function globaisPorFatia(decls, dono) {
  const m = new Map();
  for (const [, d] of decls) if (d.mut) m.set(dono(d.arq), (m.get(dono(d.arq)) || 0) + 1);
  return m;
}

// Dono efetivo: fatia do manifesto, senao "core" (src/core/) ou "legado" (src/js/).
export const donoEfetivo = fatias => { const m = donoDoArquivo(fatias); return arq => m.get(arq) ?? (arq.startsWith("core/") ? "core" : "legado") };

// Proposta do spec (tabela "Fatias propostas"): prefixo numerico do arquivo -> fatia. Arquivos de "partes de" ficam na primeira fatia citada.
export const PROPOSTA = {
  configuracao: ["19", "36", "37"], lancamento: ["12", "13", "17", "18", "26", "27"], planilha: ["15", "16", "24", "34"],
  romaneio: ["19c", "21", "21b", "25", "22"], notafiscal: ["23"], exportacao: ["28", "19b", "29"], tabelas: ["19d"],
  armazenamento: ["14", "20", "21c"], app: ["33", "35", "21d"],
};
export function fatiaProposta(arq) {
  const m = /^js\/(\d+[a-z]?)-/.exec(arq); if (!m) return arq.startsWith("core/") ? "core" : "(sem proposta)";
  for (const [f, ps] of Object.entries(PROPOSTA)) if (ps.includes(m[1])) return f;
  return "(sem proposta)";
}

// Acoplamento de cada arquivo com cada fatia proposta: simbolos compartilhados nos dois sentidos.
export function acoplamentoPorFatia(decls) {
  const r = new Map();
  for (const e of arestas(decls, a => a)) {
    for (const [x, y] of [[e.de, e.para], [e.para, e.de]]) {
      if (!r.has(x)) r.set(x, new Map());
      const g = fatiaProposta(y); r.get(x).set(g, (r.get(x).get(g) || 0) + e.simbolos.length);
    }
  }
  return r;
}

function relatorio() {
  const { decls } = analisar();
  const L = [];
  L.push("# Acoplamento medido (estado base)", "", "Gerado por `node tools/acoplamento.mjs --escrever`. Nao editar a mao.", "");
  const mut = globaisPorFatia(decls, a => a);
  const total = [...mut.values()].reduce((a, b) => a + b, 0);
  L.push(`Declaracoes: ${decls.size}. Globais mutaveis (let/var de nivel superior): ${total}.`, "");
  L.push("## Globais mutaveis por arquivo", "", "| Arquivo | Globais |", "|---|---|");
  for (const [a, n] of [...mut].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))) L.push(`| ${a} | ${n} |`);
  const ed = arestas(decls, a => a);
  L.push("", "## Matriz arquivo -> arquivo (simbolos usados)", "", "Cada linha: o arquivo da esquerda usa N simbolos declarados no da direita. Todas as arestas, maiores primeiro.", "", "| De | Para | Simbolos | Exemplos |", "|---|---|---|---|");
  for (const e of [...ed].sort((a, b) => b.simbolos.length - a.simbolos.length || a.de.localeCompare(b.de) || a.para.localeCompare(b.para)))
    L.push(`| ${e.de} | ${e.para} | ${e.simbolos.length} | ${e.simbolos.slice(0, 4).join(", ")} |`);
  L.push("", "## Proposta de agrupamento (tabela do spec) contra o acoplamento medido", "",
    "Para cada arquivo de `src/js/`: fatia proposta, acoplamento (simbolos nos dois sentidos) com a propria fatia proposta e com a outra fatia proposta mais acoplada. `!` marca arquivo mais acoplado a outra fatia que a sua.", "",
    "| Arquivo | Proposta | Com a propria | Outra mais acoplada | Simbolos |", "|---|---|---|---|---|");
  const ac = acoplamentoPorFatia(decls);
  const arqs = [...new Set([...decls.values()].map(d => d.arq))].filter(a => a.startsWith("js/")).sort();
  for (const a of arqs) {
    const prop = fatiaProposta(a), m = ac.get(a) || new Map();
    const outras = [...m].filter(([g]) => g !== "core" && g !== "(sem proposta)" && g !== prop).sort((x, y) => y[1] - x[1]);
    const propria = prop === "(sem proposta)" ? 0 : (m.get(prop) || 0);
    const melhor = outras[0];
    const flag = prop !== "(sem proposta)" && melhor && melhor[1] > propria ? " !" : "";
    L.push(`| ${a}${flag} | ${prop} | ${propria} | ${melhor ? melhor[0] : "-"} | ${melhor ? melhor[1] : 0} |`);
  }
  return L.join("\n") + "\n";
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const t = relatorio();
  if (process.argv.includes("--escrever")) { fs.writeFileSync(path.join(raiz, "docs", "acoplamento-base.md"), t, "utf8"); console.log("docs/acoplamento-base.md escrito"); }
  else console.log(t);
}
