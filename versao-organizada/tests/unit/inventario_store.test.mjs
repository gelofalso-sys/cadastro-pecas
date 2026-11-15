// Inventario do store (Etapa 3, passo 3.1): toda chave de armazenamento achada no codigo tem classe.
import test from "node:test";
import assert from "node:assert/strict";
import { classificar, chavesNoCodigo, NOMES_DE_LOCK } from "../../tools/inventario_store.mjs";

test("classificar: dado, tela, controle e desconhecida", () => {
  for (const k of ["cadpecas4", "cadpecas3", "cadpecas4-corrompido", "cadpecas-roms", "cadpecas-rom-info", "cadpecas-tabs", "cadpecas-rom", "cadpecas-rel", "cadpecas-nf"]) assert.equal(classificar(k), "dado", k);
  for (const k of ["cadpecas-zoom", "cadpecas-vista", "cadpecas-colw", "cadpecas-split", "cadpecas-filtro", "cadpecas-abertos", "cadpecas-autor", "cadpecas-numbar-aberta", "cadpecas-mostrar-vazias"]) assert.equal(classificar(k), "tela", k);
  for (const k of ["cadpecas-bk-ult", "cadpecas-bk-em", "cadpecas-persist-aviso", "cadpecas-origem-ok", "cadpecas-cad-estrito", "cadpecas-imgbb", "cadpecas-imgbb-auto", "cadpecas-imgbb-consent-v1", "cadpecas-recuperou-backup", "cadpecas-uso-em"]) assert.equal(classificar(k), "controle", k);
  assert.equal(classificar("chave-inexistente"), null);
});

test("toda chave literal do codigo esta classificada (ou e nome de lock)", () => {
  const achadas = chavesNoCodigo();
  assert.ok(achadas.size > 15, "deveria achar as chaves do app");
  const sem = [...achadas.keys()].filter(k => !NOMES_DE_LOCK.has(k) && classificar(k) === null);
  assert.deepEqual(sem, []);
});
