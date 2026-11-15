// tools/migrar_globais.mjs: troca referencias a globais por estadoX.nome usando escopo, nunca texto (Etapa 4, 4.1).
import test from "node:test";
import assert from "node:assert/strict";
import { migrar } from "../../tools/migrar_globais.mjs";

const M = { sT: "estadoA", chain: "estadoA" };

test("troca leitura e escrita; a declaracao fica intacta", () => {
  const r = migrar("let sT=null;function a(){sT=1;return sT}", M);
  assert.equal(r.codigo, "let sT=null;function a(){estadoA.sT=1;return estadoA.sT}");
  assert.equal(r.trocas, 2);
});

test("variavel local e parametro homonimos nao mudam", () => {
  const r = migrar("let sT=null;function b(sT){return sT}const f=sT=>sT;function c(){let sT=2;return sT}", M);
  assert.equal(r.codigo, "let sT=null;function b(sT){return sT}const f=sT=>sT;function c(){let sT=2;return sT}");
  assert.equal(r.trocas, 0);
});

test("atribuicao composta, incremento e typeof", () => {
  const r = migrar("let sT=0;function a(){sT++;sT+=2;return typeof sT}", M);
  assert.equal(r.codigo, "let sT=0;function a(){estadoA.sT++;estadoA.sT+=2;return typeof estadoA.sT}");
});

test("propriedade abreviada e desestruturacao", () => {
  const r = migrar("let sT=0,x;function a(){const o={sT};[sT,x]=[1,2];return o}", M);
  assert.equal(r.codigo, "let sT=0,x;function a(){const o={sT:estadoA.sT};[estadoA.sT,x]=[1,2];return o}");
});

test("chave de propriedade e acesso por ponto com o mesmo nome nao mudam", () => {
  const r = migrar("let sT=0;function a(o){return {sT:1}.sT+o.sT+o['sT']}", M);
  assert.equal(r.trocas, 0);
});

test("nome fora do mapa nao muda e o mapa pode ter varios nomes", () => {
  const r = migrar("let sT=0,chain=1,outro=2;function a(){return sT+chain+outro}", M);
  assert.equal(r.codigo, "let sT=0,chain=1,outro=2;function a(){return estadoA.sT+estadoA.chain+outro}");
  assert.equal(r.trocas, 2);
});

test("referencia dentro de classe, laco e catch", () => {
  const r = migrar("let sT=0;function a(){for(sT=0;sT<3;sT++){}try{}catch(e){sT=e}}", M);
  assert.equal(r.codigo, "let sT=0;function a(){for(estadoA.sT=0;estadoA.sT<3;estadoA.sT++){}try{}catch(e){estadoA.sT=e}}");
});
