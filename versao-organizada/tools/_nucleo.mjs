// Utilidades compartilhadas pelas ferramentas que leem o código do app (src/core + src/js).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const dirCore = path.join(raiz, "src", "core"), dirJs = path.join(raiz, "src", "js");
const lista = (dir, ...manifestos) => manifestos.flatMap(m => fs.existsSync(path.join(dir, m)) ? fs.readFileSync(path.join(dir, m), "utf8").split(/\r?\n/).filter(l => l.trim()) : []);
// Mesmo tratamento que tools/montar.py: o núcleo é escrito como módulo ES (import/export) e o bloco do navegador o recebe sem eles.
export const tirarModulo = t => t.replace(/^import\s[^;]*?from\s+["'][^"']+["'];?[ \t]*$/gm, "").replace(/^export\s+(?=(?:async\s+function|function|const|let|var|class)\b)/gm, "");
export function arquivosDoBloco() {
  return [...lista(dirCore, "_ordem.txt").map(n => ({ n: "core/" + n, f: path.join(dirCore, n), modulo: true })),
    ...lista(dirJs, "_ordem-a.txt", "_ordem-b.txt").map(n => ({ n, f: path.join(dirJs, n), modulo: false }))];
}
export const lerBloco = a => { const t = fs.readFileSync(a.f, "utf8"); return a.modulo ? tirarModulo(t) : t };
