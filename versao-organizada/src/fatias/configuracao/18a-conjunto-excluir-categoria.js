/* ===== conjunto: soma de peças individuais (brincos + colar…). Cada peça tem peso, compra e banho (o do conjunto, ou só dela).
   Marcando banhos no conjunto (Ouro, Prata, Ródio…) sai UMA linha de conjunto por banho, igual às peças individuais; sem marcar, sai uma linha só. ===== */
/* Cada componente informa valores por unidade; registros antigos sem qtd valem uma unidade. */
/* Componentes antigos sem categoria continuam usando a categoria do conjunto. */
async function conjExcluirCategoria(nome){
  const cfgAntes=cfg(),usa=c=>c&&c.cat&&conjCat(c)===nome,tem=cs=>Array.isArray(cs)&&cs.some(usa),emLanc=l=>l&&tem(l.comp),emRom=r=>r&&tem(r.conjComp);
  if((S.lanc||[]).some(emLanc)||tem((S.form||{}).comp)||(ROM&&ROM.rows||[]).some(emRom)){toast(`Não excluí “${nome}”: há componentes de conjunto usando esta categoria. Altere-os antes.`);return}
  let tabs,roms;try{[tabs,roms]=await Promise.all([bancoTodos("tabs"),bancoTodos("roms")])}catch(e){tabs=null}
  if(!Array.isArray(tabs)||!Array.isArray(roms)){toast("Não excluí a categoria: não consegui verificar os conjuntos salvos. Tente novamente.");return}
  if(tabs.some(t=>(t.lanc||[]).some(emLanc))||roms.some(r=>(r.rows||[]).some(emRom))){toast(`Não excluí “${nome}”: conjuntos em tabelas ou romaneios salvos usam esta categoria.`);return}
  const i=cfgAntes.categorias.findIndex(c=>c.nome===nome);if(cfg()!==cfgAntes||i<0||estadoConfig.delCat!==nome){toast("Os cadastros mudaram durante a verificação. Tente novamente.");return}
  if((S.lanc||[]).some(l=>val(l,"I")===nome||emLanc(l))||tem((S.form||{}).comp)||(ROM&&ROM.rows||[]).some(emRom)){toast("Não excluí a categoria: ela passou a estar em uso.");return}
  if(!CADAUTO&&!CAD.snap)cadTirarFoto();
  cfgAntes.categorias.splice(i,1);estadoConfig.delCat=null;if(S.form.v.I===nome){S.form.v.I=cfgAntes.categorias.length?cfgAntes.categorias[0].nome:"";delete S.form.v.J;sincGrade(S.form)}salvar(true);if(!CADAUTO)cadConferir();render();toast(`Categoria “${nome}” excluída.`)
}
