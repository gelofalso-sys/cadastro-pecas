// src/store/dados.js: chaves de dado de negocio do localStorage, lista fechada (Etapa 3, 3.5).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classificar } from "../../tools/inventario_store.mjs";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
function carregar(armazem, lanca = false) {
  const ls = lanca
    ? { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("cota"); }, removeItem() { throw new Error("x"); } }
    : { getItem: k => (k in armazem ? armazem[k] : null), setItem: (k, v) => { armazem[k] = String(v); }, removeItem: k => { delete armazem[k]; } };
  const ctx = { localStorage: ls, sessionStorage: ls, Error };
  vm.createContext(ctx);
  for (const f of ["local.js", "dados.js"]) vm.runInContext(fs.readFileSync(path.join(raiz, "src", "store", f), "utf8"), ctx, { filename: f });
  return ctx;
}

test("ida e volta usa a chave real", () => {
  const a = {}; const c = carregar(a);
  vm.runInContext('dadoGravar("cadpecas4","{}")', c);
  assert.equal(a.cadpecas4, "{}");
  assert.equal(vm.runInContext('dadoLer("cadpecas4")', c), "{}");
  assert.equal(vm.runInContext('dadoLer("cadpecas-rel")', c), null);
  vm.runInContext('dadoRemover("cadpecas4")', c);
  assert.deepEqual(a, {});
});

test("chave de tela ou inventada lanca e nao grava", () => {
  const a = {}; const c = carregar(a);
  for (const k of ["cadpecas-zoom", "inventada", "cadpecas-bk-ult"]) {
    assert.throws(() => vm.runInContext(`dadoGravar(${JSON.stringify(k)},"x")`, c), /chave de dado desconhecida/);
    assert.throws(() => vm.runInContext(`dadoLer(${JSON.stringify(k)})`, c), /chave de dado desconhecida/);
    assert.throws(() => vm.runInContext(`dadoRemover(${JSON.stringify(k)})`, c), /chave de dado desconhecida/);
  }
  assert.deepEqual(a, {});
});

test("armazenamento que lanca propaga o erro do navegador", () => {
  const c = carregar({}, true);
  assert.throws(() => vm.runInContext('dadoGravar("cadpecas4","x")', c), /cota/);
  assert.throws(() => vm.runInContext('dadoLer("cadpecas4")', c), /bloqueado/);
});

test("DADOS e igual as chaves de classe dado do inventario", () => {
  const c = carregar({});
  const dados = [...vm.runInContext("DADOS", c)].sort();
  const inv = ["cadpecas4", "cadpecas3", "cadpecas4-corrompido", "cadpecas-rom", "cadpecas-roms", "cadpecas-rom-info", "cadpecas-tabs", "cadpecas-rel", "cadpecas-nf"].sort();
  assert.deepEqual(dados, inv);
  for (const k of dados) assert.equal(classificar(k), "dado", k);
});
