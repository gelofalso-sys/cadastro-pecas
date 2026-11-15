// src/store/banco.js: lojas do IndexedDB por funcao nomeada, mesma semantica das funcoes finas (Etapa 3, 3.5).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
function carregar(retorno = "R") {
  const chamadas = [];
  const st = new Proxy({}, { get: (_, m) => (...a) => { chamadas.push(["st." + m, ...a]); return { m }; } });
  const ctx = {
    Error, Promise,
    idbOp: async (loja, modo, fn) => { chamadas.push(["idbOp", loja, modo]); fn(st); return retorno; },
    idbGet: async (l, k) => { chamadas.push(["idbGet", l, k]); return retorno; },
    idbPut: async (l, k, v) => { chamadas.push(["idbPut", l, k, v]); return retorno; },
    idbDel: async (l, k) => { chamadas.push(["idbDel", l, k]); return retorno; },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(raiz, "src", "store", "banco.js"), "utf8"), ctx, { filename: "banco.js" });
  return { ctx, chamadas };
}
const rodar = (ctx, src) => vm.runInContext(src, ctx);

test("ler, gravar e apagar repassam loja, chave e valor", async () => {
  const { ctx, chamadas } = carregar("R");
  assert.equal(await rodar(ctx, 'bancoLer("fotos","m:1")'), "R");
  assert.equal(await rodar(ctx, 'bancoGravar("roms","r1",{a:1})'), "R");
  assert.equal(await rodar(ctx, 'bancoApagar("tabs","t1")'), "R");
  assert.deepEqual(chamadas.map(c => c.slice(0, 3)), [["idbGet", "fotos", "m:1"], ["idbPut", "roms", "r1"], ["idbDel", "tabs", "t1"]]);
});

test("chaves, todos e adicionar usam o metodo e o modo certos", async () => {
  const { ctx, chamadas } = carregar();
  await rodar(ctx, 'bancoChaves("pontos")');
  await rodar(ctx, 'bancoTodos("roms")');
  await rodar(ctx, 'bancoAdicionar("pontos","bk",{j:1})');
  assert.deepEqual(JSON.parse(JSON.stringify(chamadas)), [
    ["idbOp", "pontos", "readonly"], ["st.getAllKeys"],
    ["idbOp", "roms", "readonly"], ["st.getAll"],
    ["idbOp", "pontos", "readwrite"], ["st.add", { j: 1 }, "bk"],
  ]);
});

test("null do banco (falha) e repassado como esta", async () => {
  const { ctx } = carregar(null);
  assert.equal(await rodar(ctx, 'bancoLer("fotos","k")'), null);
  assert.equal(await rodar(ctx, 'bancoChaves("fotos")'), null);
});

test("loja invalida lanca antes de tocar o banco", () => {
  const { ctx, chamadas } = carregar();
  for (const src of ['bancoLer("x","k")', 'bancoGravar("x","k",1)', 'bancoApagar("x","k")', 'bancoChaves("x")', 'bancoTodos("x")', 'bancoAdicionar("x","k",1)'])
    assert.throws(() => rodar(ctx, src), /loja desconhecida: x/, src);
  assert.deepEqual(chamadas, []);
});
