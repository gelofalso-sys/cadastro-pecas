// Lista as escritas em estadoX.campo feitas por fatia que nao e a dona do objeto (Etapa 4.3). O checador de fronteiras so ve
// identificadores soltos, entao escrita em campo de objeto de estado passava despercebida.
// Uso: node tools/escritas_entre_fatias.mjs [--escrever]   (--escrever grava docs/escritas-entre-fatias.md)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DONAS = { estadoArmazenamento: "armazenamento", estadoRomaneio: "romaneio", estadoConfig: "configuracao", estadoPlanilha: "planilha",
  estadoLancamento: "lancamento", estadoTabelas: "tabelas", estadoFotos: "fotos", estadoExportacao: "exportacao" };   // estadoBase: sem dona (base compartilhada)
const NOMES = Object.keys(DONAS).join("|");
const ESCRITA = new RegExp(String.raw`\b(${NOMES})\.([A-Za-z_]\w*)((?:\.[A-Za-z_]\w*)*)\s*(?:=(?![=>])|\+\+|--|\+=|-=|\*=)`, "g");
const PRE = new RegExp(String.raw`(?:\+\+|--)\s*\b(${NOMES})\.([A-Za-z_]\w*)`, "g");

function arquivosJs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? arquivosJs(p) : e.name.endsWith(".js") ? [p] : [];
  });
}

export function escritasEntreFatias(src = path.join(raiz, "src")) {
  const out = [];
  for (const f of arquivosJs(src)) {
    const rel = path.relative(src, f).split(path.sep).join("/");
    if (rel.startsWith("store/") || rel.startsWith("core/")) continue;
    const fatia = (rel.match(/^fatias\/([^/]+)\//) || [null, "base"])[1];
    fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((l, i) => {
      for (const re of [ESCRITA, PRE]) { re.lastIndex = 0; let m;
        while ((m = re.exec(l))) if (DONAS[m[1]] !== fatia) out.push({ arquivo: rel, linha: i + 1, fatia, objeto: m[1], campo: m[2], dona: DONAS[m[1]] }); }
    });
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = escritasEntreFatias();
  const L = ["# Escritas entre fatias (gerado por tools/escritas_entre_fatias.mjs)", "",
    "Escritas em `estadoX.campo` feitas por fatia que nao e a dona do objeto. Nao e corrigido em massa: cada corte e uma funcao da dona (Etapa 4.3). `app` e a casca; `base` e `src/js`.", "",
    `Total: ${r.length} escrita(s).`, "", "| objeto.campo | dona | escrita por | arquivo:linha |", "|---|---|---|---|"];
  for (const e of r.sort((a, b) => (a.objeto + a.campo).localeCompare(b.objeto + b.campo) || a.arquivo.localeCompare(b.arquivo)))
    L.push(`| \`${e.objeto}.${e.campo}\` | ${e.dona} | ${e.fatia} | ${e.arquivo}:${e.linha} |`);
  if (process.argv.includes("--escrever")) { fs.writeFileSync(path.join(raiz, "docs", "escritas-entre-fatias.md"), L.join("\n") + "\n"); console.log("docs/escritas-entre-fatias.md gerado:", r.length); }
  else console.log(L.join("\n"));
}
