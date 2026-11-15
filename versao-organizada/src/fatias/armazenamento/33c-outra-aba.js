/* duas abas abertas: se a outra gravou, esta avisa (e para de gravar) em vez de sobrescrever */
window.addEventListener("storage",e=>{
  if(e.key!=="cadpecas4"||e.newValue==null||!ehAreaLocal(e.storageArea))return;
  conflito=true;clearTimeout(sT);sT=null;
  if(document.getElementById("outraAba"))return;
  const b=document.createElement("div");b.id="outraAba";b.setAttribute("role","alert");
  b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:99999;background:#fff3cd;color:#664d03;border-bottom:2px solid #c9a227;padding:10px 14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font:14px system-ui,sans-serif";
  b.innerHTML=`<b>Outra aba alterou os dados.</b><span>Esta aba parou de salvar para não sobrescrever o trabalho da outra.</span><button type="button" id="oaRec" class="btn pri sm">Recarregar</button><button type="button" id="oaMan" class="btn sm" title="Descarta o que a outra aba gravou e salva o que está nesta aba">Manter esta aba</button>`;
  document.body.appendChild(b);
  document.getElementById("oaRec").onclick=()=>{dirty={c:false,l:false};location.reload()};
  document.getElementById("oaMan").onclick=()=>{conflito=false;b.remove();salvar(true)};
});

/* o rascunho do romaneio tem chave própria: se outra aba o regravou, esta para de gravar o romaneio em vez de sobrescrever */
window.addEventListener("storage",e=>{
  if(e.key!==ROMKEY||!ehAreaLocal(e.storageArea)||!ROM||!ROM.rows.length||romConflito)return;
  romConflito=true;clearTimeout(romST);romST=null;
  if(document.getElementById("outraAbaRom"))return;
  const b=document.createElement("div");b.id="outraAbaRom";b.setAttribute("role","alert");
  b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:99999;background:#fff3cd;color:#664d03;border-bottom:2px solid #c9a227;padding:10px 14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font:14px system-ui,sans-serif";
  b.innerHTML=`<b>Outra aba alterou este romaneio.</b><span>Esta aba parou de salvar o romaneio para não sobrescrever o trabalho da outra.</span><button type="button" id="orRec" class="btn pri sm">Recarregar</button><button type="button" id="orMan" class="btn sm" title="Descarta o que a outra aba gravou e salva o romaneio desta aba">Manter esta aba</button>`;
  document.body.appendChild(b);
  document.getElementById("orRec").onclick=()=>{location.reload()};
  document.getElementById("orMan").onclick=()=>{romConflito=false;b.remove();romSalvar()};
});

