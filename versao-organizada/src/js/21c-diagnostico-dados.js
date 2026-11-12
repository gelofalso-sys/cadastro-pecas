/* ===== diagnóstico dos dados guardados no navegador (peças, romaneios salvos, fotos) ===== */
async function diagnosticoDados(){
  const L=[],t0=Date.now();
  const tam=k=>{try{const v=localStorage.getItem(k);return v==null?null:v.length}catch(e){return -1}};
  repModal(`<div class="rep-h"><div><b class="rep-t">Diagnóstico dos dados</b><div class="hint">Verificando o que está guardado neste navegador…</div></div><div class="rep-ac"><button type="button" class="btn pri sm" data-act="rel-fechar">Fechar</button></div></div><div class="rep-b"><pre id="diagTxt" style="white-space:pre-wrap;font:12px/1.5 ui-monospace,Consolas,monospace">Lendo…</pre></div>`);
  const out=()=>{const el=document.getElementById("diagTxt");if(el)el.textContent=L.join("\n")};
  const ln=s=>{L.push(s);out()};
  ln("Página: "+location.protocol+"//"+(location.pathname||"").split("/").slice(-1)[0]);
  try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();ln(`Espaço do navegador: usado ${Math.round((e.usage||0)/1048576)} MB de ${Math.round((e.quota||0)/1048576)} MB`)}}catch(e){ln("Espaço: não consegui consultar")}
  ["cadpecas4","cadpecas-rom","cadpecas-roms","cadpecas-rom-info","cadpecas-rel","cadpecas-tabs"].forEach(k=>{const n=tam(k);ln(`localStorage ${k}: ${n==null?"vazio":n<0?"erro ao ler":Math.round(n/1024)+" KB"}`)});
  ln(`Peças na tabela: ${S.lanc.length} · com foto na tela: ${S.lanc.filter(l=>l.ft).length} · fotos marcadas no armazenamento grande: ${S.lanc.filter(l=>l.ftIdb).length}`);
  ln(`Romaneios salvos no índice: ${ROMS.length} · tabelas salvas: ${TABS.length}`);
  for(const st of ["roms","fotos","tabs","pontos"]){
    const t=Date.now();let ks=null;try{ks=await idbOp(st,"readonly",s=>s.getAllKeys())}catch(e){}
    ln(`IndexedDB ${st}: ${ks===null?"NÃO RESPONDEU (erro ao abrir o armazenamento)":ks.length+" registro(s)"} (${Date.now()-t} ms)`)}
  /* cada romaneio do índice: o registro existe e abre? */
  let ok=0,falta=[],ruim=[];
  for(const r of ROMS){
    try{const rec=await idbGet("roms",r.id);if(rec===undefined||rec===null){falta.push((r.doc||r.forn||r.id)+" ("+impData(r)+")");continue}
      if(!Array.isArray(rec.rows)){ruim.push((r.doc||r.id)+": sem lista de peças");continue}
      rec.rows.forEach(x=>{if(x&&typeof x!=="object")throw new Error("peça inválida")});ok++}
    catch(e){ruim.push((r.doc||r.id)+": "+((e&&e.message)||e))}}
  ln(`Romaneios que abrem: ${ok} de ${ROMS.length}`);
  if(falta.length)ln("  Sem registro no armazenamento grande (IndexedDB): "+falta.slice(0,8).join("; ")+(falta.length>8?"…":""));
  if(ruim.length)ln("  Com problema: "+ruim.slice(0,8).join("; "));
  const semMini=S.lanc.filter(l=>l.ftIdb&&!l.ft).length;
  if(semMini)ln(`Fotos que dependem do IndexedDB e ainda não apareceram: ${semMini}`);
  ln("");ln(ok===ROMS.length&&!semMini?"Resultado: tudo certo com os dados guardados.":"Resultado: há dados que o navegador não devolveu. Faça um backup completo agora (Importar e backup) e envie este texto para quem dá suporte.");
  ln(`(verificado em ${Date.now()-t0} ms)`)}

/* descrição preenchida sozinha ("Brinco Argola "): ao entrar no campo o cursor fica no fim, para continuar digitando sem apagar as palavras */
document.addEventListener("focusin",e=>{const t=e.target;if(!t||t.id!=="f-F"||!S.form||!S.form._descAuto||t.value!==S.form._descAuto)return;const fim=()=>{try{t.setSelectionRange(t.value.length,t.value.length)}catch(x){}};fim();setTimeout(fim,0)});
