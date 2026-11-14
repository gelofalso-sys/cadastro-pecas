/* ===== fotos: escolher, arrastar ou colar (Ctrl+V) ===== */
const blobUrl=b=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(new Error("foto ilegível"));r.readAsDataURL(b)});
async function lerFotoArquivo(file){
  if(!file||!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type))throw new Error(`“${file&&file.name||"arquivo"}” não é uma foto JPG, PNG ou WebP`);
  checaTam(file,MAX_FOTO_BYTES,"A foto");
  const src=await blobUrl(file),g=await fotoReduzida(src,1200),m=await fotoReduzida(src,240);
  if(!g||!m)throw new Error(`não consegui ler “${file.name}”`);
  const grande=await blobUrl(g),mini=await blobUrl(m);if(!ftOk(mini))throw new Error(`formato de “${file.name}” não suportado`);
  return {mini,grande}}
async function fotoNaPeca(lid,F){const l=S.lanc.find(x=>x.id===lid);if(!l)return false;
  const gr=await idbPut("fotos",lid,F.grande);if(gr===null)throw new Error("Não consegui guardar a foto original (memória do navegador cheia ou bloqueada). A foto desta peça não foi trocada.");
  l.ft=F.mini;if(/^https:\/\/i\.ibb\.co\//.test(String(l.v.B||"")))delete l.v.B;ftSalvas.delete(lid);candFoto.delete(lid);if(editId===lid)S.form.ft=F.mini;return true}
/* várias fotos de uma vez: o nome do arquivo igual à referência (BR1670.jpg) liga sozinho; as que sobram vão em sequência para as peças sem foto, a partir da peça escolhida */
async function fotosEmLote(files,lidIni){
  const arqs=[...files].filter(f=>f&&(/^image\//.test(f.type)||/\.(jpe?g|png|webp|gif)$/i.test(f.name)));
  if(!arqs.length){toast("Nenhuma foto nesses arquivos. Use JPG, PNG ou WebP.");return}
  const g=gerar(),ordem=[];g.linhas.forEach(r=>{if(!ordem.includes(r.lancId)&&(!filtroOn()||casa(r)))ordem.push(r.lancId)});
  const porNome=new Map();ordem.forEach(id=>{(g.refs[id]||[]).forEach(r=>{[String(r).toUpperCase(),refBase(r)].forEach(k=>{if(k&&!porNome.has(k))porNome.set(k,id)})})});
  const usados=new Set(),semNome=[];let nNome=0,nSeq=0;const erros=[];
  for(const f of arqs){
    const exato=f.name.replace(/\.[^.]+$/,"").toUpperCase(),base=exato.replace(/[\s_-]*\(?\d+\)?$/,"");
    const alvo=porNome.get(exato)||porNome.get(base)||null;
    if(alvo&&!usados.has(alvo)){try{await fotoNaPeca(alvo,await lerFotoArquivo(f));usados.add(alvo);nNome++}catch(e){erros.push(e.message)}}else if(alvo)erros.push(`“${f.name}”: já há uma foto para essa peça neste envio (ignorada)`);else semNome.push(f)}
  let pos=Math.max(0,ordem.indexOf(lidIni));
  for(const f of semNome){
    while(pos<ordem.length&&(usados.has(ordem[pos])||(arqs.length>1&&((S.lanc.find(l=>l.id===ordem[pos])||{}).ft))))pos++;
    if(pos>=ordem.length){erros.push(`“${f.name}”: não há mais peça sem foto`);continue}
    try{await fotoNaPeca(ordem[pos],await lerFotoArquivo(f));usados.add(ordem[pos]);nSeq++;pos++}catch(e){erros.push(e.message)}}
  salvar(false);renderTopo();if(editId)renderForm();
  autoEnviar([...usados]);const tot=nNome+nSeq;toast(`${tot} foto(s) anexada(s)${nNome?` · ${nNome} pelo nome do arquivo`:""}${nSeq?` · ${nSeq} em sequência`:""}${erros.length?` · ${erros.length} com problema: ${erros[0]}`:""}.`);
}
async function fotoDoFormulario(file){try{const F=await lerFotoArquivo(file);if(editId){const sj0=formSujo();await fotoNaPeca(editId,F);if(!sj0)editSnap=JSON.stringify(S.form);salvar(false);renderTopo();autoEnviar([editId])}else{S.form.ft=F.mini;estadoFotos.grande=F.grande;salvar(false)}renderForm();toast("Foto anexada.")}catch(e){toast(e.message)}}
function fotoRemover(lid){
  if(!lid){delete S.form.ft;estadoFotos.grande=null;salvar(false);renderForm();return}
  const l=S.lanc.find(x=>x.id===lid);if(!l)return;delete l.ft;if(/^https:\/\/i\.ibb\.co\//.test(String(l.v.B||"")))delete l.v.B;ftSalvas.delete(lid);idbDel("fotos",lid);idbDel("fotos","m:"+lid);if(editId===lid){const sj0=formSujo();delete S.form.ft;if(!sj0)editSnap=JSON.stringify(S.form)}salvar(false);renderTopo();renderForm();toast("Foto removida.")}
(function(){const inp=document.createElement("input");inp.type="file";inp.id="ftIn";inp.accept="image/*";inp.multiple=true;inp.hidden=true;document.body.appendChild(inp);
  inp.addEventListener("change",async()=>{const fl=[...inp.files];inp.value="";if(!fl.length)return;const al=estadoFotos.alvo;estadoFotos.alvo=null;toast(fl.length>1?`Lendo ${fl.length} fotos…`:"Lendo a foto…");
    if(typeof al==="string"&&al.startsWith("rom:")){if(ROM)romFotosEscolhidas(+al.slice(4),fl);return}
    if(al==="__form"){if(fl.length===1)return fotoDoFormulario(fl[0]);return fotosEmLote(fl,editId)}
    if(fl.length===1){try{await fotoNaPeca(al,await lerFotoArquivo(fl[0]));salvar(false);renderTopo();if(editId)renderForm();toast("Foto anexada.");autoEnviar([al])}catch(e){toast(e.message)}return}
    fotosEmLote(fl,al)});
  const temArq=e=>e.dataTransfer&&[...(e.dataTransfer.types||[])].includes("Files");
  let hl=null;const limpaHl=()=>{if(hl){hl.classList.remove("ftdrop");hl=null}};
  document.addEventListener("dragover",e=>{if(!temArq(e))return;const tr=e.target.closest&&e.target.closest("#sheet tr[data-l]"),fm=e.target.closest&&e.target.closest("#form"),rcd=e.target.closest&&e.target.closest("#romWrap .rc[data-i]:not(.lote)");if(!tr&&!fm&&!rcd)return;e.preventDefault();const alvo=tr||rcd||fm;if(hl!==alvo){limpaHl();hl=alvo;hl.classList.add("ftdrop")}});
  document.addEventListener("dragleave",e=>{if(!e.relatedTarget)limpaHl()});
  document.addEventListener("drop",e=>{if(!temArq(e))return;const tr=e.target.closest&&e.target.closest("#sheet tr[data-l]"),fm=e.target.closest&&e.target.closest("#form"),rcd=e.target.closest&&e.target.closest("#romWrap .rc[data-i]:not(.lote)");limpaHl();if(!tr&&!fm&&!rcd)return;e.preventDefault();e.stopPropagation();
    const fl=[...e.dataTransfer.files];if(!fl.length)return;
    if(rcd&&ROM){romFotosEscolhidas(+rcd.dataset.i,fl);return}
    if(tr)fotosEmLote(fl,tr.dataset.l);else if(fl.length===1)fotoDoFormulario(fl[0]);else fotosEmLote(fl,editId)});
  document.addEventListener("paste",e=>{const fl=[...((e.clipboardData&&e.clipboardData.files)||[])].filter(x=>/^image\//.test(x.type));if(!fl.length)return;
    if(e.target&&e.target.id==="celIn")return;e.preventDefault();
    const rcp=e.target&&e.target.closest&&e.target.closest("#romWrap .rc[data-i]:not(.lote)");if(rcp&&ROM){romFotosEscolhidas(+rcp.dataset.i,fl.slice(0,1));return}
    const row=selR&&G&&G.linhas[selR.fr],lid=editId||(row&&row.lancId);
    if(lid){(async()=>{try{await fotoNaPeca(lid,await lerFotoArquivo(fl[0]));salvar(false);renderTopo();if(editId)renderForm();toast("Foto colada na peça.");autoEnviar([lid])}catch(x){toast(x.message)}})()}
    else fotoDoFormulario(fl[0])},true)})();
