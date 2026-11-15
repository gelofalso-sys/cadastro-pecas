// Prontidao para o servidor: o nucleo (src/core) roda em Node puro e le um backup completo (tools/exemplo_nucleo_node.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const exemplo = path.join(raiz, "tools", "exemplo_nucleo_node.mjs");
const rodar = (...args) => execFileSync(process.execPath, [exemplo, ...args], { encoding: "utf8" });

test("sem argumento: avisa o uso e sai com erro", () => {
  assert.throws(() => execFileSync(process.execPath, [exemplo], { stdio: "pipe" }), e => e.status === 2 && /uso:/.test(String(e.stderr)));
});

test("backup minimo vazio: roda sem navegador e devolve contagens zeradas", () => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "nucleo-")), "b.json");
  fs.writeFileSync(f, JSON.stringify({ app: "cadastro-pecas", tipo: "total", v: 1, config: {}, lanc: [], form: {}, roms: {}, tabs: {}, fotos: {} }));
  const r = JSON.parse(rodar(f, "--json"));
  assert.equal(r.resumo.pecas, 0);
  assert.equal(r.resumo.linhasDeSaida, 0);
});

test("backup real (CP_BACKUP): gera linhas para todas as pecas", { skip: !process.env.CP_BACKUP || !fs.existsSync(process.env.CP_BACKUP) ? "sem CP_BACKUP" : false }, () => {
  const bk = JSON.parse(fs.readFileSync(process.env.CP_BACKUP, "utf8"));
  const r = JSON.parse(rodar(process.env.CP_BACKUP, "--json"));
  assert.equal(r.resumo.pecas, bk.lanc.length);
  assert.ok(r.resumo.linhasGeradas >= r.resumo.pecas, "pelo menos uma linha por peca");
  assert.ok(r.resumo.linhasDeSaida > 0);
});
