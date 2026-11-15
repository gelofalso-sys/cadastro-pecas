// flush (src/fatias/armazenamento/14-persistencia.js) de ponta a ponta no Node: textos, ordem e regra de 20 s dos avisos que ele emite.
// Recorta o trecho jsonLocal..flush do fonte e roda em vm com stubs (o app real so tem o Playwright como prova ate aqui).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const persist = fs.readFileSync(path.join(raiz, "src/fatias/armazenamento/14-persistencia.js"), "utf8");
const trecho = persist.slice(persist.indexOf("function jsonLocal"), persist.indexOf("async function pontoSalvar"));
const eventos = fs.readFileSync(path.join(raiz, "src/store/eventos.js"), "utf8");

function montar({ gravarFalha = false, db = null, conflito = false, corrompido = false } = {}) {
  const visto = [], gravou = [];
  const ctx = {
    Error, JSON, Date, Promise, Set, console: { error() {} },
    S: { config: { c: 1 }, lanc: [], form: {} },
    estadoBase: { editId: null, rascunho: null },
    estadoArmazenamento: { dirty: { c: true, l: true }, db, conflito, corrompido, avisoMem: 0, ftSalvas: new Set() },
    ftRSalvas: new Set(), candFoto: new Set(), varrerFotos() {},
    bancoGravar: async () => 1,
    dadoGravar: (k, v) => { if (gravarFalha) throw new Error("cota"); gravou.push(k); },
  };
  vm.createContext(ctx);
  vm.runInContext(eventos + "\n" + trecho, ctx);
  ctx.registrar = (n, texto, erro, toast) => visto.push([n, texto, erro, toast]);   // do lado do teste: evita comparar arrays de outro contexto
  vm.runInContext('["salvo","erro","conflito","cota"].forEach(n=>armOuvir(n,i=>registrar(n,i.texto,i.erro,i.toast)))', ctx);
  return { ctx, visto, gravou };
}
const flush = ctx => vm.runInContext("flush()", ctx);
const dirty = ctx => JSON.parse(JSON.stringify(ctx.estadoArmazenamento.dirty));

test("gravacao normal: grava cadpecas4, emite salvo e devolve true", async () => {
  const { ctx, visto, gravou } = montar();
  assert.equal(await flush(ctx), true);
  assert.deepEqual(gravou, ["cadpecas4"]);
  assert.deepEqual(visto, [["salvo", "Salvo neste navegador", false, undefined]]);
  assert.deepEqual(dirty(ctx), { c: false, l: false });
});

test("memoria cheia: emite cota com o texto de sempre, toast so na primeira vez em 20 s, e mantem dirty", async () => {
  const m = "NÃO salvo — memória do navegador cheia. Baixe o backup (Romaneios > Backup completo).";
  const { ctx, visto } = montar({ gravarFalha: true });
  assert.equal(await flush(ctx), false);
  assert.equal(await flush(ctx), false);
  assert.deepEqual(visto, [["cota", m, true, m], ["cota", m, true, undefined]]);
  assert.deepEqual(dirty(ctx), { c: true, l: true });
});

test("memoria cheia com conta (db): texto da conta e nenhum toast", async () => {
  const db = { doc: () => ({ set: async () => {} }) };
  const { ctx, visto } = montar({ gravarFalha: true, db });
  assert.equal(await flush(ctx), false);
  assert.deepEqual(visto, [["cota", "Salvo na sua conta, mas NÃO neste navegador (memória cheia)", true, undefined]]);
});

test("conflito entre abas: nao grava, emite conflito e preserva dirty", async () => {
  const { ctx, visto, gravou } = montar({ conflito: true });
  assert.equal(await flush(ctx), false);
  assert.deepEqual(gravou, []);
  assert.deepEqual(visto, [["conflito", "Outra aba alterou os dados — esta aba NÃO está salvando. Recarregue.", true, undefined]]);
  assert.deepEqual(dirty(ctx), { c: true, l: true });
});

test("dados danificados: nao grava e avisa a escolha pendente", async () => {
  const { ctx, visto, gravou } = montar({ corrompido: true });
  assert.equal(await flush(ctx), false);
  assert.deepEqual(gravou, []);
  assert.equal(visto[0][0], "conflito");
  assert.match(visto[0][1], /^Os dados salvos estavam danificados — NADA está sendo salvo/);
});

test("falha na conta: emite erro e devolve false sem gravar no navegador", async () => {
  const db = { doc: () => ({ set: async () => { throw new Error("rede"); } }) };
  const { ctx, visto, gravou } = montar({ db });
  assert.equal(await flush(ctx), false);
  assert.deepEqual(gravou, []);
  assert.deepEqual(visto, [["erro", "Não consegui salvar agora — tento de novo na próxima alteração", true, undefined]]);
});
