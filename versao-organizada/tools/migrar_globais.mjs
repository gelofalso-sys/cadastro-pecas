// Agrupa globais de nivel superior em objetos de estado (Etapa 4, 4.1): troca cada referencia que RESOLVE ao global por
// estadoX.nome, usando a analise de escopo do ESLint (nunca texto: variavel local de mesmo nome nao muda).
// Nao mexe nas declaracoes (let sT=...): quem migra reescreve a declaracao a mao, no mesmo ponto da carga.
// Uso: node tools/migrar_globais.mjs            (mostra o que trocaria)   |   node tools/migrar_globais.mjs --aplicar
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import * as espree from "espree";
import * as escope from "eslint-scope";
import { arquivosDoBloco, lerBloco } from "./_nucleo.mjs";

export const MAPA = {
  estadoArmazenamento: ["sT", "chain", "snapL", "snapC", "restaurando", "corrompido", "ftSalvas", "histSep", "romGravP", "romST", "romTem", "romInfo", "romArm", "tabArm", "AUTOR", "ARQ"],
  estadoRomaneio: ["romCriando", "romChaveL", "relTem"],
  estadoConfig: ["romUI", "impT", "impConfigAntes"],
  estadoExportacao: ["lastExport"],
  estadoPlanilha: ["w"],
  estadoBase: ["bancoAberto", "HIST_SUG"],
};
const tem = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

function abreviadas(no, out = new Set()) {
  if (!no || typeof no.type !== "string") return out;
  if (no.type === "Property" && no.shorthand && no.value.type === "Identifier") out.add(no.value.range[0]);
  for (const k of Object.keys(no)) {
    if (k === "parent") continue;
    const v = no[k];
    if (Array.isArray(v)) v.forEach(x => abreviadas(x, out)); else if (v && typeof v.type === "string") abreviadas(v, out);
  }
  return out;
}

// codigo: texto JS (script); mapa: { nome: "estadoX" }. Devolve { codigo, trocas, edicoes: [{de, ate, texto}] }.
export function migrar(codigo, mapa) {
  const ast = espree.parse(codigo, { ecmaVersion: "latest", sourceType: "script", range: true });
  const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: "script" });
  const abrev = abreviadas(ast), edicoes = [];
  for (const v of sm.globalScope.variables) {
    if (!tem(mapa, v.name)) continue;
    for (const r of v.references) {
      if (r.init) continue;                                   // inicializador da declaracao
      const [de, ate] = r.identifier.range, obj = mapa[v.name];
      edicoes.push({ de, ate, texto: abrev.has(de) ? `${v.name}:${obj}.${v.name}` : `${obj}.${v.name}` });
    }
  }
  edicoes.sort((a, b) => b.de - a.de);
  let saida = codigo;
  for (const e of edicoes) saida = saida.slice(0, e.de) + e.texto + saida.slice(e.ate);
  return { codigo: saida, trocas: edicoes.length, edicoes };
}

export const mapaPlano = (grupos = Object.keys(MAPA)) => Object.fromEntries(grupos.flatMap(g => MAPA[g].map(n => [n, g])));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const aplicar = process.argv.includes("--aplicar");
  const grupos = process.argv.filter(a => a.startsWith("--grupo=")).map(a => a.slice(8));
  const mapa = mapaPlano(grupos.length ? grupos : undefined);
  const arqs = arquivosDoBloco(); let bloco = ""; const inicios = [];
  for (const a of arqs) { const t = lerBloco(a); inicios.push({ a, de: bloco.length, t }); bloco += t; }
  const r = migrar(bloco, mapa);
  const porArq = new Map();
  for (const e of r.edicoes) {
    const i = [...inicios].reverse().find(x => x.de <= e.de);
    if (i.a.modulo) { console.error("referencia dentro do nucleo (src/core), parar:", i.a.n); process.exit(1); }
    (porArq.get(i.a.n) || porArq.set(i.a.n, []).get(i.a.n)).push({ ...e, de: e.de - i.de, ate: e.ate - i.de, arq: i });
  }
  for (const [n, es] of porArq) {
    console.log(`${n}: ${es.length} troca(s)`);
    if (!aplicar) continue;
    let t = es[0].arq.t;
    for (const e of es) t = t.slice(0, e.de) + e.texto + t.slice(e.ate);
    fs.writeFileSync(es[0].arq.a.f, t);
  }
  console.log(aplicar ? "aplicado" : "simulacao (use --aplicar)", "total", r.trocas);
}
