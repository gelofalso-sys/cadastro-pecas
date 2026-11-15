// Inventario das chaves de armazenamento do navegador (Etapa 3, 3.1). Uso: node tools/inventario_store.mjs
// Varre src/**/*.js (fora de src/store) atras de literais "cadpecas..." e das lojas do IndexedDB; gera docs/inventario-store.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLASSES = {
  dado: ["cadpecas4", "cadpecas3", "cadpecas4-corrompido", "cadpecas-rom", "cadpecas-roms", "cadpecas-rom-info", "cadpecas-tabs", "cadpecas-rel", "cadpecas-nf"],
  tela: ["cadpecas-zoom", "cadpecas-vista", "cadpecas-colw", "cadpecas-split", "cadpecas-filtro", "cadpecas-abertos", "cadpecas-autor", "cadpecas-numbar-aberta", "cadpecas-mostrar-vazias"],
  controle: ["cadpecas-bk-ult", "cadpecas-bk-em", "cadpecas-persist-aviso", "cadpecas-origem-ok", "cadpecas-cad-estrito", "cadpecas-imgbb", "cadpecas-imgbb-auto", "cadpecas-imgbb-consent-v1", "cadpecas-recuperou-backup", "cadpecas-uso-em"],
};
// nomes que aparecem como literal mas sao bloqueios (navigator.locks), prefixo de diario ou nome do banco, nao chaves de armazenamento
export const NOMES_DE_LOCK = new Set(["cadpecas-uso", "cadpecas-exclusoes", "cadpecas-restauracao", "cadpecas-big", "cadpecas-bk"]);
const MAPA = new Map(Object.entries(CLASSES).flatMap(([c, ks]) => ks.map(k => [k, c])));
export const classificar = k => MAPA.get(k) ?? null;

function arquivosJs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? arquivosJs(p) : e.name.endsWith(".js") ? [p] : [];
  });
}
const rel = (src, f) => path.relative(src, f).split(path.sep).join("/");
const fatiaDe = r => (r.match(/^fatias\/([^/]+)\//) || [null, r.startsWith("core/") ? "core" : "base"])[1];

// Map chave -> [{arquivo, fatia, linha}]
export function chavesNoCodigo(src = path.join(raiz, "src")) {
  const out = new Map();
  for (const f of arquivosJs(src)) {
    const r = rel(src, f);
    if (r.startsWith("store/")) continue;
    fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((l, i) => {
      for (const m of l.matchAll(/["'`](cadpecas[a-z0-9-]*)["'`]/g)) {
        if (!out.has(m[1])) out.set(m[1], []);
        out.get(m[1]).push({ arquivo: r, fatia: fatiaDe(r), linha: i + 1 });
      }
    });
  }
  return out;
}

function lojasIdb(src = path.join(raiz, "src")) {
  const out = new Map();
  for (const f of arquivosJs(src)) {
    const r = rel(src, f);
    if (r.startsWith("store/")) continue;
    fs.readFileSync(f, "utf8").split(/\r?\n/).forEach(l => {
      for (const m of l.matchAll(/\bidb(?:Get|Put|Del|Op)\(\s*["'`](fotos|roms|tabs|pontos)["'`]/g)) {
        const k = m[1];
        if (!out.has(k)) out.set(k, new Set());
        out.get(k).add(r);
      }
    });
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const chaves = chavesNoCodigo();
  const L = ["# Inventario do store (gerado por tools/inventario_store.mjs)", "",
    "Chaves literais `cadpecas*` fora de `src/store/`. Classe: `dado` (negocio), `tela` (preferencia de tela), `controle` (backup/servicos). Gerado: nao edite a mao.", "",
    "| chave | classe | ocorrencias | fatias | arquivos |", "|---|---|---|---|---|"];
  for (const [k, v] of [...chaves].sort((a, b) => a[0].localeCompare(b[0]))) {
    const classe = NOMES_DE_LOCK.has(k) ? "(nome de lock/banco, nao e chave)" : classificar(k) ?? "SEM CLASSE";
    L.push(`| \`${k}\` | ${classe} | ${v.length} | ${[...new Set(v.map(x => x.fatia))].join(", ")} | ${[...new Set(v.map(x => x.arquivo))].join(", ")} |`);
  }
  L.push("", "## Lojas do IndexedDB `cadpecas-big` v3 (todas `dado`)", "", "| loja | arquivos |", "|---|---|");
  for (const [k, v] of [...lojasIdb()].sort()) L.push(`| \`${k}\` | ${[...v].sort().join(", ")} |`);
  L.push("", "## Chaves dinamicas (variavel, nao literal)", "",
    "`ROMKEY`/`NFKEY` (constantes de `core`, classe dado), `NBK`/`KV` (planilha 24, tela), `key` em tabelas 19d (`cadpecas-autor`, tela), `k`/`u` em armazenamento 20, 21c, 33c (percorrem as chaves de dado e de controle acima).", "",
    "## Duvidas de classe", "", "- `cadpecas-autor`: tela por preferencia do dono do plano, mas e gravada pela fatia tabelas e lida na abertura; tratada como `tela`.",
    "- `cadpecas-rel`: rascunho do relatorio do romaneio; tratada como `dado` (entra no backup).");
  fs.writeFileSync(path.join(raiz, "docs", "inventario-store.md"), L.join("\n") + "\n");
  console.log("docs/inventario-store.md gerado:", chaves.size, "chaves");
}
