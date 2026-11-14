
/* ---------- foto por item do romaneio ---------- */
function romFotoEscolher(i){estadoFotos.alvo="rom:"+i;const inp=document.getElementById("ftIn");if(inp)inp.click()}
async function romFotoGravar(i,F){
  const r=ROM&&ROM.rows[i];if(!r)return;
  r.foto=F.grande;r.fotoMini=F.mini;
  if(r.feito&&Array.isArray(r.lancIds)){for(const id of r.lancIds)await fotoNaPeca(id,F);salvar(false);renderTopo()}}
/* o 1º arquivo vai para o item escolhido (troca a foto que já houver); os demais, em sequência, para os próximos itens sem foto */
async function romFotosEscolhidas(i,files){
  const arqs=[...files].filter(f=>f&&(/^image\//.test(f.type)||/\.(jpe?g|png|webp|gif)$/i.test(f.name)));
  if(!arqs.length){toast("Nenhuma foto nesses arquivos. Use JPG, PNG ou WebP.");return}
  let pos=i,ok=0;const erros=[];
  for(const f of arqs){
    while(pos<ROM.rows.length&&(ROM.rows[pos].lote||(ok>0&&ROM.rows[pos].foto)))pos++;
    if(pos>=ROM.rows.length){erros.push(`“${f.name}”: não há mais item sem foto`);continue}
    try{await romFotoGravar(pos,await lerFotoArquivo(f));ok++;pos++}catch(e){erros.push(e.message)}}
  romSalvarSoon();renderRom();
  toast(`${ok} foto(s) anexada(s) aos itens do romaneio${erros.length?` · ${erros.length} com problema: ${erros[0]}`:""}.`)}
function romFotoRemover(i){
  const r=ROM&&ROM.rows[i];if(!r)return;delete r.foto;delete r.fotoMini;
  if(r.feito&&Array.isArray(r.lancIds))r.lancIds.forEach(id=>{const l=S.lanc.find(x=>x.id===id);if(l){delete l.ft;idbDel("fotos",id);idbDel("fotos","m:"+id);ftSalvas.delete(id)}});
  salvar(false);renderTopo();romSalvarSoon();renderRom();toast("Foto do item removida.")}
