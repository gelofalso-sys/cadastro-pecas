function prefixoEmUso(C,n,exceto){return C.categorias.some(x=>x!==exceto&&(String(x.prefixo||"").toUpperCase()===n||Object.values(x.subPref||{}).some(v=>String(v).toUpperCase()===n)))}
function trocarPrefixo(c,txt){const C=cfg(),antigo=String(c.prefixo||"").toUpperCase(),novo=String(txt||"").toUpperCase().replace(/[^A-Z]/g,"").slice(0,4);
  if(!novo){toast("O prefixo precisa ter de 1 a 4 letras.");renderCfg();return}
  if(novo===antigo)return;const snap=clone(C);
  c.prefixo=novo;S.lanc.forEach(l=>{if(l.rf&&catBy(val(l,"I"))===c){delete l.v.E;delete l.rf}});let msg;
  if(ultimo(novo)>0){const com=C.categorias.filter(x=>x!==c&&(String(x.prefixo||"").toUpperCase()===novo)).map(x=>x.nome);msg=`${c.nome} agora usa ${novo} — continua da última peça ${novo}${ultimo(novo)}${com.length?` (numeração compartilhada com ${com.join(", ")})`:""}.`}
  else{C.seqs[novo]=String(C.seqs[antigo]??ultimo(antigo));msg=`${c.nome}: prefixo ${antigo} → ${novo}. A última peça (${ultimo(antigo)}) foi levada para ${novo}.`}
  if(antigo&&!prefixoEmUso(C,antigo,null)&&antigo!==novo)delete C.seqs[antigo];
  const nl=S.lanc.filter(l=>val(l,"I")===c.nome).length;if(nl)msg+=` ${nl} peça(s) que já estão na lista passam a usar a nova referência.`;
  {const re=new RegExp("^"+antigo+"\\d");let nm=0;S.lanc.forEach(l=>{if(val(l,"I")!==c.nome)return;[l.v.E,...Object.values(l.ov||{}).map(o=>o&&typeof o==="object"?o.E:"")].forEach(x=>{if(antigo&&re.test(String(x||"").replace(/\s+/g,"").toUpperCase()))nm++})});if(nm)msg+=` Atenção: ${nm} referência(s) digitada(s) à mão continuam com ${antigo} (não mudam sozinhas) — confira na tabela.`}
  salvar(true,false);render();toast(msg,{t:"Desfazer",fn:desfazer})}
