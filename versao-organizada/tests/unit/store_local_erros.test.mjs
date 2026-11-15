// storeLocal: erros nao viram "vazio" nem sobrescrevem dados danificados (achados da revisao do 3.4).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
function carregar({ ls = {}, lerFalha = false, idbGet = async () => undefined } = {}) {
  const gravou = [];
  const ctx = {
    Error, JSON, Array, Promise, Date,
    lerPref: k => { if (lerFalha) throw new Error("bloqueado"); return k in ls ? ls[k] : null; },
    gravarPref: (k, v) => { gravou.push(k); ls[k] = v; },
    idbGet, idbPut: async () => true,
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(raiz, "src", "store", "store-local.js"), "utf8") + ";globalThis.s=storeLocal", ctx);
  return { s: ctx.s, gravou, ls };
}

test("blob danificado nao e sobrescrito por putPeca, saveConfig nem deletePeca", async () => {
  for (const ruim of ["{", "[1]", '{"lanc":5}']) {
    const { s, gravou, ls } = carregar({ ls: { cadpecas4: ruim } });
    await assert.rejects(() => s.putPeca({ id: "a" }), /danificados/, ruim);
    await assert.rejects(() => s.saveConfig({ c: 1 }), /danificados/, ruim);
    await assert.rejects(() => s.deletePeca("a"), /danificados/, ruim);
    assert.deepEqual(gravou, [], "nao pode gravar: " + ruim);
    assert.equal(ls.cadpecas4, ruim);
  }
});

test("leitura que lanca (armazenamento bloqueado) vira rejeicao, nao vazio", async () => {
  const { s } = carregar({ lerFalha: true });
  await assert.rejects(() => s.listPecas(), /bloqueado/);
  await assert.rejects(() => s.getConfig(), /bloqueado/);
  await assert.rejects(() => s.listRomaneios(), /bloqueado/);
});

test("IndexedDB que falha ao ler (null) rejeita; ausente (undefined) e null", async () => {
  const falha = carregar({ idbGet: async () => null }).s;
  await assert.rejects(() => falha.getRomaneio("r1"), /falha ao ler do IndexedDB: roms/);
  await assert.rejects(() => falha.getFoto("x", "m"), /falha ao ler do IndexedDB: fotos/);
  const ausente = carregar({ idbGet: async () => undefined }).s;
  assert.equal(await ausente.getRomaneio("r1"), null);
  assert.equal(await ausente.getFoto("x", "r"), null);
});

test("blob ausente continua valido: primeiro putPeca cria o blob", async () => {
  const { s, ls } = carregar();
  await s.putPeca({ id: "a" });
  assert.deepEqual(JSON.parse(ls.cadpecas4).lanc, [{ id: "a" }]);
});
