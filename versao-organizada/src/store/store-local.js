/* ===== src/store/store-local.js: interface assincrona do store, adaptador local (Etapa 3, passo 3.4) =====
   Script simples, carregado depois de store/eventos.js (src/_ordem.txt). Persiste nas mesmas chaves e lojas de sempre:
   blob "cadpecas4" ({config,lanc,form,edit,rasc}), indices "cadpecas-roms" e "cadpecas-tabs", lojas IndexedDB "fotos"
   ("m:"+id miniatura, "r:"+id foto do romaneio) e "roms". So persiste: o indice de um romaneio e derivado por quem chama.
   Erro do navegador (cota, bloqueio) vira rejeicao; IndexedDB que devolve null vira rejeicao. Ainda nao usado pelo app
   (a migracao dos chamadores e o passo 3.5); a mesma bateria tests/contrato_store.js vale para um adaptador remoto futuro.
   Fora desta interface: exclusao com diario (exPreparar/exRestaurar), que segue em armazenamento ate o 3.5. */
const storeLocal=(()=>{
  const CH_BLOB="cadpecas4",CH_ROMS="cadpecas-roms",CH_TABS="cadpecas-tabs";
  /* lerPref que lanca (armazenamento bloqueado) propaga; texto danificado le como vazio, mas nunca e sobrescrito (blobParaGravar) */
  const lerBlobBruto=()=>{const raw=lerPref(CH_BLOB);if(raw===null)return {estado:"vazio",o:null};
    try{const o=JSON.parse(raw);return o&&typeof o==="object"&&!Array.isArray(o)&&(o.lanc===undefined||Array.isArray(o.lanc))?{estado:"ok",o}:{estado:"danificado",o:null}}catch(e){return {estado:"danificado",o:null}}};
  const lerBlob=()=>lerBlobBruto().o;
  const blobParaGravar=()=>{const r=lerBlobBruto();if(r.estado==="danificado")throw new Error("dados danificados: nada foi gravado");return r.o};
  const lerIdx=ch=>{const raw=lerPref(ch);if(raw===null)return [];try{const a=JSON.parse(raw);return Array.isArray(a)?a:[]}catch(e){return []}};
  const gravarBlob=o=>gravarPref(CH_BLOB,JSON.stringify(o));
  const pecasDe=o=>o&&Array.isArray(o.lanc)?o.lanc:[];
  /* mescla por id (nao perde entrada que outra aba gravou) e ordena por "em" decrescente, como gravarIdx */
  const mesclarIdx=(ch,entrada)=>{const a=lerIdx(ch),i=a.findIndex(x=>x&&x.id===entrada.id);if(i<0)a.push(entrada);else a[i]=entrada;a.sort((x,y)=>(y.em||0)-(x.em||0));gravarPref(ch,JSON.stringify(a))};
  const idbOk=async(loja,chave,valor)=>{if(await idbPut(loja,chave,valor)===null)throw new Error("falha ao gravar no IndexedDB: "+loja)};
  const chaveFoto=(id,tipo)=>(tipo==="r"?"r:":"m:")+id;
  /* idbGet: undefined = nao existe; null = o banco falhou (nao e o mesmo que "nao existe") */
  const idbLer=async(loja,chave)=>{const v=await idbGet(loja,chave);if(v===null)throw new Error("falha ao ler do IndexedDB: "+loja);return v===undefined?null:v};
  let ganchos_={};
  return {
    async getConfig(){const o=lerBlob();return o&&o.config!==undefined?o.config:null},
    async saveConfig(config){const o=blobParaGravar()||{};o.config=config;gravarBlob(o)},
    async listPecas(){return pecasDe(lerBlob())},
    async putPeca(peca){const o=blobParaGravar()||{},a=pecasDe(o).slice(),i=a.findIndex(x=>x&&x.id===peca.id);if(i<0)a.push(peca);else a[i]=peca;o.lanc=a;gravarBlob(o)},
    async deletePeca(id){const o=blobParaGravar();if(!o)return false;const a=pecasDe(o),b=a.filter(x=>!(x&&x.id===id));if(b.length===a.length)return false;o.lanc=b;gravarBlob(o);return true},
    async listRomaneios(){return lerIdx(CH_ROMS)},
    async getRomaneio(id){return idbLer("roms",id)},
    async putRomaneio(rec,indice){if(!indice||indice.id!==rec.id)throw new Error("indice nao bate com o registro do romaneio");await idbOk("roms",rec.id,rec);mesclarIdx(CH_ROMS,indice)},
    async putFoto(id,tipo,dado){if(tipo!=="m"&&tipo!=="r")throw new Error("tipo de foto invalido: "+tipo);await idbOk("fotos",chaveFoto(id,tipo),dado)},
    async getFoto(id,tipo){return idbLer("fotos",chaveFoto(id,tipo))},
    async listTabelas(){return lerIdx(CH_TABS)},
    /* backup: montar e restaurar dependem de estado e regras de armazenamento; o store nao conhece fatia, entao quem conhece liga os ganchos */
    ligar(ganchos){ganchos_=ganchos||{}},
    async exportBackup(){if(!ganchos_.exportBackup)throw new Error("backup nao ligado");return ganchos_.exportBackup()},
    async importBackup(o){if(!ganchos_.importBackup)throw new Error("backup nao ligado");return ganchos_.importBackup(o)}
  }
})();
