/* ===== src/store/store-local.js: interface assincrona do store, adaptador local (Etapa 3, passo 3.4) =====
   Script simples, carregado depois de store/eventos.js (src/_ordem.txt). Persiste nas mesmas chaves e lojas de sempre:
   blob "cadpecas4" ({config,lanc,form,edit,rasc}), indices "cadpecas-roms" e "cadpecas-tabs", lojas IndexedDB "fotos"
   ("m:"+id miniatura, "r:"+id foto do romaneio) e "roms". So persiste: o indice de um romaneio e derivado por quem chama.
   Erro do navegador (cota, bloqueio) vira rejeicao; IndexedDB que devolve null vira rejeicao. Ainda nao usado pelo app
   (a migracao dos chamadores e o passo 3.5); a mesma bateria tests/contrato_store.js vale para um adaptador remoto futuro.
   Fora desta interface: exclusao com diario (exPreparar/exRestaurar), que segue em armazenamento ate o 3.5. */
const storeLocal=(()=>{
  const CH_BLOB="cadpecas4",CH_ROMS="cadpecas-roms",CH_TABS="cadpecas-tabs";
  const lerBlob=()=>{try{const o=JSON.parse(lerPref(CH_BLOB));return o&&typeof o==="object"&&!Array.isArray(o)?o:null}catch(e){return null}};
  const lerIdx=ch=>{try{const a=JSON.parse(lerPref(ch));return Array.isArray(a)?a:[]}catch(e){return []}};
  const gravarBlob=o=>gravarPref(CH_BLOB,JSON.stringify(o));
  const pecasDe=o=>o&&Array.isArray(o.lanc)?o.lanc:[];
  /* mescla por id (nao perde entrada que outra aba gravou) e ordena por "em" decrescente, como gravarIdx */
  const mesclarIdx=(ch,entrada)=>{const a=lerIdx(ch),i=a.findIndex(x=>x&&x.id===entrada.id);if(i<0)a.push(entrada);else a[i]=entrada;a.sort((x,y)=>(y.em||0)-(x.em||0));gravarPref(ch,JSON.stringify(a))};
  const idbOk=async(loja,chave,valor)=>{if(await idbPut(loja,chave,valor)===null)throw new Error("falha ao gravar no IndexedDB: "+loja)};
  const chaveFoto=(id,tipo)=>(tipo==="r"?"r:":"m:")+id;
  const ou=v=>v===undefined?null:v;
  return {
    async getConfig(){const o=lerBlob();return o&&o.config!==undefined?o.config:null},
    async saveConfig(config){const o=lerBlob()||{};o.config=config;gravarBlob(o)},
    async listPecas(){return pecasDe(lerBlob())},
    async putPeca(peca){const o=lerBlob()||{},a=pecasDe(o).slice(),i=a.findIndex(x=>x&&x.id===peca.id);if(i<0)a.push(peca);else a[i]=peca;o.lanc=a;gravarBlob(o)},
    async deletePeca(id){const o=lerBlob();if(!o)return false;const a=pecasDe(o),b=a.filter(x=>!(x&&x.id===id));if(b.length===a.length)return false;o.lanc=b;gravarBlob(o);return true},
    async listRomaneios(){return lerIdx(CH_ROMS)},
    async getRomaneio(id){return ou(await idbGet("roms",id))},
    async putRomaneio(rec,indice){await idbOk("roms",rec.id,rec);mesclarIdx(CH_ROMS,indice)},
    async putFoto(id,tipo,dado){await idbOk("fotos",chaveFoto(id,tipo),dado)},
    async getFoto(id,tipo){return ou(await idbGet("fotos",chaveFoto(id,tipo)))},
    async listTabelas(){return lerIdx(CH_TABS)}
  }
})();
