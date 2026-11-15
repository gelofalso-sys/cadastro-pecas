function duplicar(ids){
  const novos=ids.map(id=>{const c=clone(S.lanc.find(x=>x.id===id));c.id=uid();fotoCopia(id,c.id);delete c.v.E;c.vinc=false;delete c.excl;if(c.ov)Object.values(c.ov).forEach(o=>delete o.E);return c});
  S.lanc.push(...novos);estadoBase.undo={tipo:"dup",ids:novos.map(n=>n.id)};salvar(false);renderTopo();
  toast(`Duplicado no fim da lista: ${novos.map(n=>(estadoBase.G.refs[n.id]||[]).join("/")).join(", ")}`,{t:"Desfazer",fn:desfazer});
}
function duplicarLinha(ri){
  const row=estadoBase.G.linhas[ri];if(!row)return;const l=S.lanc.find(x=>x.id===row.lancId);if(!l)return;
  const c=clone(l);c.id=uid();fotoCopia(l.id,c.id);delete c.v.E;c.vinc=false;delete c.excl;
  if(c.tipo==="bruta"||(row.bid&&row.bid!=="p")){const bid=row.bid||row.key;if(c.tipo==="bruta")c.on={[bid]:true};else c.onP={[bid]:true};const o=(c.ov||{})[bid],o2=row.gi?(c.ov||{})[row.key]:null;c.ov={};if(o)c.ov[bid]=o;if(o2)c.ov[row.key]=o2}
  if(row.gi){   /* a linha pode ser tamanho, cor ou tamanho+cor (id "a17+c_L:azul"): a cópia fica só com aquela combinação */
    const ps=String(row.gi).split("+"),tam=ps.find(x=>!x.startsWith("c_")),cor=ps.find(x=>x.startsWith("c_"));
    c.gsel=tam?[tam]:[];if(cor)c.csel=[cor.slice(2)]}
  if(c.ov)Object.values(c.ov).forEach(o=>delete o.E);
  S.lanc.push(c);estadoBase.undo={tipo:"dup",ids:[c.id]};salvar(false);renderTopo();
  toast(`Linha duplicada: ${(estadoBase.G.refs[c.id]||[]).join(", ")}`,{t:"Desfazer",fn:desfazer});
}
/* exclui só as linhas pedidas; se a peça ficar sem nenhuma linha, ela some inteira. Desfazer volta tudo. */
function excluirLinhas(ris){
  if(ris.length>=3){if(!confirm(`Excluir ${ris.length} linhas de uma vez? (Ctrl+Z desfaz; um ponto de restauração é guardado antes)`))return;pontoAviso(pontoAuto("antes de excluir "+ris.length+" linhas",true))}
  const por={};ris.forEach(ri=>{const r=estadoBase.G.linhas[ri];if(r)(por[r.lancId]=por[r.lancId]||[]).push(r.key)});
  const ids=Object.keys(por);if(!ids.length)return;
  const antes=ids.map(id=>({id,excl:((S.lanc.find(x=>x.id===id)||{}).excl)||null})),del=[];let n=0;
  ids.forEach(id=>{const l=S.lanc.find(x=>x.id===id);if(!l)return;const total=estadoBase.G.linhas.filter(r=>r.lancId===id).length;n+=por[id].length;
    if(por[id].length>=total){del.push({idx:S.lanc.indexOf(l),item:l});return}
    l.excl=[...new Set([...(l.excl||[]),...por[id]])];if(estadoBase.editId===id)S.form.excl=l.excl});
  del.forEach(d=>{S.lanc=S.lanc.filter(x=>x!==d.item);sel.delete(d.item.id);if(d.item.id===estadoBase.editId){estadoBase.editId=null;if(estadoBase.rascunho)S.form=estadoBase.rascunho;estadoBase.rascunho=null;renderForm()}});
  del.forEach(d=>candFoto.add(d.item.id));estadoBase.undo={tipo:"linhas",antes,del};estadoPlanilha.selR=null;salvar(false);renderTopo();toast(`${n} linha(s) excluída(s).`,{t:"Desfazer",fn:desfazer});
}
function excluir(ids){
  if(ids.length>=3){if(!confirm(`Excluir ${ids.length} peças de uma vez? (Ctrl+Z desfaz; um ponto de restauração é guardado antes)`))return;pontoAviso(pontoAuto("antes de excluir "+ids.length+" peças",true))}
  const itens=ids.map(id=>{const idx=S.lanc.findIndex(l=>l.id===id);return {idx,item:S.lanc[idx]}}).filter(x=>x.idx>=0);
  S.lanc=S.lanc.filter(l=>!ids.includes(l.id));ids.forEach(id=>sel.delete(id));if(ids.includes(estadoBase.editId)){estadoBase.editId=null;if(estadoBase.rascunho)S.form=estadoBase.rascunho;estadoBase.rascunho=null;renderForm()}
  ids.forEach(i=>candFoto.add(i));estadoBase.undo={tipo:"del",itens};salvar(false);renderTopo();toast(`${itens.length} peça(s) excluída(s).`,{t:"Desfazer",fn:desfazer});
}

