// Utilidades compartilhadas pelas ferramentas que leem o código do app (src/core, src/store, src/js e src/fatias, na ordem de src/_ordem.txt).
// Só src/core é módulo ES; src/store e o resto são scripts simples.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const dirSrc = path.join(raiz, "src"), dirCore = path.join(dirSrc, "core"), dirJs = path.join(dirSrc, "js");
// Mesmo tratamento que tools/montar.py: o núcleo é escrito como módulo ES (import/export) e o bloco do navegador o recebe sem eles.
export const tirarModulo = t => t.replace(/^import\s[^;]*?from\s+["'][^"']+["'];?[ \t]*$/gm, "").replace(/^export\s+(?=(?:async\s+function|function|const|let|var|class)\b)/gm, "");
// Manifesto unico: src/_ordem.txt, um caminho relativo a src/ por linha, na ordem de montagem.
export function lerOrdem(r = raiz) { return fs.readFileSync(path.join(r, "src", "_ordem.txt"), "utf8").split(/\r?\n/).filter(l => l.trim()); }
export function arquivosDoBloco() {
  return lerOrdem().map(n => ({ n, f: path.join(dirSrc, n), modulo: n.startsWith("core/") }));
}
export const lerBloco = a => { const t = fs.readFileSync(a.f, "utf8"); return a.modulo ? tirarModulo(t) : t };
