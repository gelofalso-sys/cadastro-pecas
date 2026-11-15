/* Contrato do store (Etapa 3, 3.4). Script simples: define contrato(store, amb) e devolve a lista de falhas (vazia = passa).
   `store` e o adaptador (storeLocal hoje; o remoto no futuro). `amb` prepara o ambiente de cada adaptador:
   amb.limpar() zera os dados; amb.plantar(nome, valor) grava texto cru em "blob" | "romsIdx" | "tabsIdx". */
async function contrato(store, amb) {
  const falhas = [];
  const ok = (cond, msg) => { if (!cond) falhas.push(msg); };
  const igual = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}: veio ${JSON.stringify(a)}, esperado ${JSON.stringify(b)}`);
  const lanca = async (fn, re, msg) => { try { await fn(); falhas.push(msg + ": nao lancou"); } catch (e) { ok(re.test(String(e && e.message || e)), `${msg}: erro inesperado ${e}`); } };

  await amb.limpar();
  igual(await store.getConfig(), null, "getConfig vazio");
  await store.saveConfig({ a: 1 });
  igual(await store.getConfig(), { a: 1 }, "getConfig depois de saveConfig");

  await store.putPeca({ id: "x1", F: "A" }); await store.putPeca({ id: "x2" });
  igual((await store.listPecas()).map(p => p.id), ["x1", "x2"], "listPecas apos dois putPeca");
  await store.putPeca({ id: "x1", F: "B" });
  const ps = await store.listPecas();
  ok(ps.length === 2 && ps[0].F === "B", "putPeca do mesmo id troca sem duplicar");
  igual(await store.getConfig(), { a: 1 }, "putPeca nao mexe na config");

  await amb.plantar("blob", JSON.stringify({ config: { c: 1 }, lanc: [{ id: "y1" }], form: { v: 1 }, edit: "y1", rasc: { r: 1 } }));
  await store.putPeca({ id: "y2" });
  const blob = JSON.parse(await amb.ler("blob"));
  ok(blob.form && blob.form.v === 1 && blob.edit === "y1" && blob.rasc && blob.rasc.r === 1, "putPeca preserva form, edit e rasc");
  igual(blob.lanc.map(p => p.id), ["y1", "y2"], "putPeca preserva as outras pecas");
  await store.saveConfig({ c: 2 });
  const blob2 = JSON.parse(await amb.ler("blob"));
  ok(blob2.lanc.length === 2 && blob2.form.v === 1, "saveConfig preserva pecas e form");

  ok((await store.deletePeca("y2")) === true, "deletePeca existente devolve true");
  ok((await store.deletePeca("zz")) === false, "deletePeca inexistente devolve false");
  igual((await store.listPecas()).map(p => p.id), ["y1"], "listPecas apos deletePeca");

  await amb.plantar("blob", "{");
  igual(await store.listPecas(), [], "blob corrompido -> listPecas vazio");
  igual(await store.getConfig(), null, "blob corrompido -> getConfig null");

  await store.putFoto("x1", "m", "data:a");
  ok((await store.getFoto("x1", "m")) === "data:a", "getFoto miniatura");
  ok((await store.getFoto("x1", "r")) === null, "getFoto de outro tipo e null");
  await store.putFoto("x1", "r", "data:b");
  ok((await store.getFoto("x1", "r")) === "data:b", "getFoto do romaneio");

  await amb.plantar("romsIdx", JSON.stringify([{ id: "r9", em: 5 }]));
  await store.putRomaneio({ id: "r1", rows: [] }, { id: "r1", em: 1 });
  await store.putRomaneio({ id: "r2", rows: [] }, { id: "r2", em: 9 });
  igual((await store.listRomaneios()).map(r => r.id), ["r2", "r9", "r1"], "indice mescla entradas de outra aba, ordem por em decrescente");
  await store.putRomaneio({ id: "r1", rows: [1] }, { id: "r1", em: 20 });
  igual((await store.listRomaneios()).map(r => r.id), ["r1", "r2", "r9"], "putRomaneio do mesmo id atualiza a entrada");
  ok((await store.getRomaneio("r1")).rows.length === 1, "getRomaneio devolve o registro");
  ok((await store.getRomaneio("nada")) === null, "getRomaneio inexistente e null");

  await amb.plantar("tabsIdx", JSON.stringify([{ id: "t1", nome: "T", em: 1 }]));
  igual((await store.listTabelas()).map(t => t.id), ["t1"], "listTabelas");
  await amb.plantar("romsIdx", "isto nao e json");
  igual(await store.listRomaneios(), [], "indice corrompido -> lista vazia");
  /* backup: o adaptador so delega a ganchos ligados por quem conhece o backup */
  await lanca(() => store.exportBackup(), /backup nao ligado/, "exportBackup sem gancho");
  await lanca(() => store.importBackup({}), /backup nao ligado/, "importBackup sem gancho");
  const chamadas = [];
  store.ligar({ exportBackup: async () => { chamadas.push("exp"); return { o: { app: "x" }, falhas: [], hoje: "h" }; }, importBackup: async o => { chamadas.push("imp:" + o.k); return true; } });
  igual(await store.exportBackup(), { o: { app: "x" }, falhas: [], hoje: "h" }, "exportBackup devolve o que o gancho devolve");
  ok((await store.importBackup({ k: 7 })) === true, "importBackup devolve o que o gancho devolve");
  igual(chamadas, ["exp", "imp:7"], "ganchos chamados uma vez cada");
  store.ligar({});
  await lanca(() => store.exportBackup(), /backup nao ligado/, "ligar({}) desliga os ganchos");
  await amb.limpar();
  return falhas;
}
