// src/store/prefs.js: preferencias de tela e de controle por nome logico, mesmas chaves de sempre (Etapa 3, 3.2).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classificar } from "../../tools/inventario_store.mjs";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
function carregar(armazem) {
  const ls = { getItem: k => (k in armazem ? armazem[k] : null), setItem: (k, v) => { armazem[k] = String(v); }, removeItem: k => { delete armazem[k]; } };
  const ctx = { localStorage: ls, sessionStorage: ls, Error };
  vm.createContext(ctx);
  for (const f of ["local.js", "prefs.js"]) vm.runInContext(fs.readFileSync(path.join(raiz, "src", "store", f), "utf8"), ctx, { filename: f });
  return vm.runInContext("({PREFS,prefLer,prefGravar,prefRemover})", ctx);
}

test("ida e volta usa a chave de sempre", () => {
  const a = {}; const p = carregar(a);
  p.prefGravar("zoom", "1.2");
  assert.equal(a["cadpecas-zoom"], "1.2");
  assert.equal(p.prefLer("zoom"), "1.2");
  p.prefRemover("zoom");
  assert.equal(p.prefLer("zoom"), null);
});

test("nome desconhecido lanca e nao grava", () => {
  const a = {}; const p = carregar(a);
  assert.throws(() => p.prefGravar("nao-existe", "x"), /preferencia desconhecida: nao-existe/);
  assert.throws(() => p.prefLer("cadpecas4"), /preferencia desconhecida/);
  assert.deepEqual(a, {});
});

test("armazenamento que lanca propaga o erro", () => {
  const ctx = { localStorage: { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("cota"); }, removeItem() { throw new Error("x"); } }, Error };
  vm.createContext(ctx);
  for (const f of ["local.js", "prefs.js"]) vm.runInContext(fs.readFileSync(path.join(raiz, "src", "store", f), "utf8"), ctx);
  assert.throws(() => vm.runInContext('prefGravar("zoom","1")', ctx), /cota/);
  assert.throws(() => vm.runInContext('prefLer("zoom")', ctx), /bloqueado/);
});

test("PREFS so tem chaves de tela ou controle, nunca dado", () => {
  const { PREFS } = carregar({});
  assert.ok(Object.keys(PREFS).length >= 17);
  for (const [nome, chave] of Object.entries(PREFS)) assert.match(classificar(chave) ?? "", /^(tela|controle)$/, `${nome} -> ${chave}`);
});
