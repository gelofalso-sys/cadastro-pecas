/* ===== src/store/idb.js: todo acesso ao IndexedDB do app =====
   Banco "cadpecas-big", versao 3, lojas fotos, roms, tabs e pontos (pontos guarda tambem a pasta do backup, o diario de
   exclusoes EX_PREFIXO+loja+":"+id e o registro da restauracao BK_JOURNAL). Script simples (nao e modulo), carregado antes
   de qualquer usuario (src/_ordem.txt); usa so EX_PREFIXO do nucleo (src/core/backup.js, carregado antes).
   Comportamento de sempre: nenhuma funcao rejeita; erro ou transacao abortada devolve null. */
function idbAbrir(){return indexedDB.open("cadpecas-big",3)}
function idbCriarLojas(rq){const d=rq.result;["fotos","roms","tabs","pontos"].forEach(n=>{if(!d.objectStoreNames.contains(n))d.createObjectStore(n)})}
function idbOp(store,mode,fn){return new Promise(res=>{try{const rq=idbAbrir();rq.onupgradeneeded=()=>idbCriarLojas(rq);rq.onerror=()=>res(null);
  rq.onsuccess=()=>{const d=rq.result;try{const tx=d.transaction(store,mode),st=tx.objectStore(store);let out=null;const r=fn(st);if(r)r.onsuccess=()=>{out=r.result};tx.oncomplete=()=>{d.close();res(out)};tx.onerror=tx.onabort=()=>{d.close();res(null)}}catch(e){d.close();res(null)}}}catch(e){res(null)}})}
const idbPut=(s,k,v)=>idbOp(s,"readwrite",st=>st.put(v,k)),idbGet=(s,k)=>idbOp(s,"readonly",st=>st.get(k)),idbDel=(s,k)=>idbOp(s,"readwrite",st=>st.delete(k));
/* Diário de exclusões: registro e diário mudam na mesma transação. Se a aba
   fechar antes de concluir o índice, a próxima abertura recupera o registro. */
function exPreparar(loja,id){return new Promise(resolve=>{let fim=false;const done=x=>{if(!fim){fim=true;resolve(x)}};try{
  const rq=idbAbrir();rq.onerror=()=>done(null);rq.onsuccess=()=>{const db0=rq.result;try{
    const tx=db0.transaction([loja,"pontos"],"readwrite"),st=tx.objectStore(loja),pt=tx.objectStore("pontos"),key=EX_PREFIXO+loja+":"+encodeURIComponent(id);let resultado=null;
    const get=st.get(id);get.onsuccess=()=>{try{const rec=get.result;if(rec===undefined){resultado={key:null};return}resultado={key};pt.put({loja,id,rec},key);st.delete(id)}catch(e){try{tx.abort()}catch(x){db0.close();done(null)}}};
    tx.oncomplete=()=>{db0.close();done(resultado)};tx.onabort=tx.onerror=()=>{db0.close();done(null)}
  }catch(e){db0.close();done(null)}}
}catch(e){done(null)}})}
/* Não substitui um registro que outra aba tenha criado depois da exclusão. */
function exRestaurar(j){return new Promise(resolve=>{let fim=false;const done=x=>{if(!fim){fim=true;resolve(x)}};try{
  const rq=idbAbrir();rq.onerror=()=>done(null);rq.onsuccess=()=>{const db0=rq.result;try{
    const tx=db0.transaction(j.loja,"readwrite"),st=tx.objectStore(j.loja);let rec=null;const get=st.get(j.id);
    get.onsuccess=()=>{try{rec=get.result===undefined?j.rec:get.result;if(get.result===undefined)st.put(rec,j.id)}catch(e){try{tx.abort()}catch(x){db0.close();done(null)}}};
    tx.oncomplete=()=>{db0.close();done(rec)};tx.onabort=tx.onerror=()=>{db0.close();done(null)}
  }catch(e){db0.close();done(null)}}
}catch(e){done(null)}})}
/* Lê todas as lojas do backup na mesma transação, impedindo misturar versões do IndexedDB. */
function bkLerBanco(idsAtuais){return new Promise(resolve=>{let encerrado=false;const fim=v=>{if(!encerrado){encerrado=true;resolve(v)}};try{
  const rq=idbAbrir();rq.onerror=()=>fim(null);rq.onupgradeneeded=()=>idbCriarLojas(rq);
  rq.onsuccess=()=>{const d=rq.result;try{const tx=d.transaction(["roms","tabs","fotos","pontos"],"readonly"),roms={},tabs={},fotos={},result={roms,tabs,fotos,exclusoesPendentes:false};let pend=6;
    const vals={};const req=(store,method,key)=>{const r=key===undefined?store[method]():store[method](key);r.onsuccess=()=>{vals[store.name+method]=r.result;if(--pend===0)carregarFotos()}};
    const rs=tx.objectStore("roms"),ts=tx.objectStore("tabs"),fs=tx.objectStore("fotos");
    const carregarFotos=()=>{result.exclusoesPendentes=(vals.pontosgetAllKeys||[]).some(k=>typeof k==="string"&&k.startsWith(EX_PREFIXO));(vals.romsgetAllKeys||[]).forEach((k,i)=>roms[k]=vals.romsgetAll[i]);(vals.tabsgetAllKeys||[]).forEach((k,i)=>tabs[k]=vals.tabsgetAll[i]);
      const vivos=new Set(idsAtuais);Object.values(tabs).forEach(t=>{if(t){(t.ids||[]).forEach(i=>vivos.add(i));(t.lanc||[]).forEach(l=>{if(l&&l.id)vivos.add(l.id)})}});
      Object.values(roms).forEach(r=>{if(r){(r.lancIds||[]).forEach(i=>vivos.add(i));(r.rows||[]).forEach(x=>(x.lancIds||[]).forEach(i=>vivos.add(i)))}});
      (vals.fotosgetAllKeys||[]).forEach(k=>{if(vivos.has(String(k).replace(/^[mr]:/,""))){const x=fs.get(k);x.onsuccess=()=>{fotos[k]=x.result}}})};
    req(rs,"getAllKeys");req(rs,"getAll");req(ts,"getAllKeys");req(ts,"getAll");req(fs,"getAllKeys");req(tx.objectStore("pontos"),"getAllKeys");
    tx.oncomplete=()=>{d.close();fim(result)};tx.onerror=tx.onabort=()=>{d.close();fim(null)}
  }catch(e){d.close();fim(null)}}
}catch(e){fim(null)}})}
