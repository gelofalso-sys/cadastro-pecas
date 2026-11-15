// Todo acesso direto a localStorage, sessionStorage e IndexedDB, e as funcoes finas que os embrulham, fica em src/store/ (Tarefa 17; Etapa 3, 3.6).
// Varre os .js de src/ (fora de src/store/) e falha se algum citar esses nomes, mesmo em comentario.
// Sem lista de excecoes: comentario que cite o nome deve ser reescrito (ex.: "armazenamento local").
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const dirSrc = path.join(raiz, "src");
const PROIBIDO = /\b(localStorage|sessionStorage|indexedDB|lerPref|gravarPref|removerPref|idbGet|idbPut|idbDel|idbOp|idbAbrir)\b/;   /* inclui as funcoes finas de src/store: chamadores usam prefLer, dadoLer, bancoLer e afins */

function arquivosJs(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...arquivosJs(p));
    else if (e.name.endsWith(".js")) out.push(p);
  }
  return out;
}

export function acessosForaDoStore(src = dirSrc) {
  const store = path.join(src, "store") + path.sep;
  const achados = [];
  for (const f of arquivosJs(src)) {
    if (f.startsWith(store)) continue;
    fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((l, i) => {
      if (PROIBIDO.test(l)) achados.push(`${path.relative(src, f).split(path.sep).join("/")}:${i + 1}`);
    });
  }
  return achados;
}

test("src/store existe e concentra o armazenamento", () => {
  assert.ok(fs.existsSync(path.join(dirSrc, "store")), "falta a pasta src/store/");
  const store = arquivosJs(path.join(dirSrc, "store")).map(f => fs.readFileSync(f, "utf8")).join("\n");
  for (const n of ["localStorage", "sessionStorage", "indexedDB"]) assert.match(store, new RegExp("\\b" + n + "\\b"), `src/store/ deveria usar ${n}`);
});

test("nenhum .js fora de src/store cita localStorage, sessionStorage ou indexedDB", () => {
  const achados = acessosForaDoStore();
  const arquivos = [...new Set(achados.map(a => a.replace(/:\d+$/, "")))];
  assert.deepEqual(achados, [], `acesso direto ao armazenamento fora de src/store/ (${arquivos.length} arquivo(s)):\n  ${achados.join("\n  ")}`);
});
