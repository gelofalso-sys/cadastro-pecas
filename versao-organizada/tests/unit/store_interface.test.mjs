// Interface do store (Etapa 3, 3.4): os 13 metodos do plano existem e armazenamento liga os ganchos de backup.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ler = f => fs.readFileSync(path.join(raiz, f), "utf8");

test("storeLocal define os 13 metodos da interface", () => {
  const src = ler("src/store/store-local.js");
  for (const m of ["getConfig", "saveConfig", "listPecas", "putPeca", "deletePeca", "listRomaneios", "getRomaneio", "putRomaneio", "putFoto", "getFoto", "listTabelas", "exportBackup", "importBackup"])
    assert.match(src, new RegExp(`async ${m}[(]`), m);
});

test("armazenamento liga exportBackup e importBackup as funcoes de backup de sempre", () => {
  const src = ler("src/fatias/armazenamento/20-armazenamento-idb.js");
  assert.ok(src.includes("storeLocal.ligar({exportBackup:()=>bkMontar(),importBackup:async o=>(await aplicarBackupTotal(validarBackup(o),true))===true})"));
});

test("store-local.js carrega depois de local.js e idb.js e antes das fatias", () => {
  const ordem = ler("src/_ordem.txt").split(/\r?\n/);
  const i = f => ordem.indexOf(f);
  assert.ok(i("store/local.js") < i("store/idb.js") && i("store/idb.js") < i("store/store-local.js"));
  assert.ok(i("store/store-local.js") < i("fatias/armazenamento/20-armazenamento-idb.js"));
});
