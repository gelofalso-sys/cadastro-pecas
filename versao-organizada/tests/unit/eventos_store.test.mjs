// src/store/eventos.js: emissor sincrono do armazenamento (Etapa 3, 3.3).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
function carregar() {
  const ctx = { Error, console: { error() {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(raiz, "src", "store", "eventos.js"), "utf8"), ctx, { filename: "eventos.js" });
  return ctx;
}

test("emissao e sincrona: o ouvinte ja rodou quando armEmitir retorna", () => {
  const c = carregar(); const vistos = [];
  c.vistos = vistos; vm.runInContext('armOuvir("salvo",i=>vistos.push(i.texto))', c);
  vm.runInContext('armEmitir("salvo",{texto:"a",erro:false}); vistos.push("depois")', c);
  assert.deepEqual([...vistos], ["a", "depois"]);
});

test("ouvintes rodam na ordem do registro", () => {
  const c = carregar(); const v = []; c.v = v;
  vm.runInContext('armOuvir("erro",()=>v.push(1));armOuvir("erro",()=>v.push(2));armEmitir("erro",{texto:"x",erro:true})', c);
  assert.deepEqual([...v], [1, 2]);
});

test("sem ouvinte nao lanca", () => {
  const c = carregar();
  assert.doesNotThrow(() => vm.runInContext('armEmitir("cota",{texto:"x",erro:true})', c));
});

test("ouvinte que lanca nao impede o seguinte nem o emissor", () => {
  const c = carregar(); const v = []; c.v = v;
  vm.runInContext('armOuvir("conflito",()=>{throw new Error("x")});armOuvir("conflito",()=>v.push("ok"));armEmitir("conflito",{texto:"t",erro:true})', c);
  assert.deepEqual([...v], ["ok"]);
});

test("nome invalido lanca", () => {
  const c = carregar();
  assert.throws(() => vm.runInContext('armEmitir("nada",{})', c), /evento de armazenamento desconhecido: nada/);
  assert.throws(() => vm.runInContext('armOuvir("nada",()=>{})', c), /desconhecido/);
});
