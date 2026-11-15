async function romCriar(){const f=S.form;if(editId){avisoEdicao(()=>romCriar());return}
  if(romConflito){toast("Outra aba alterou este romaneio. Use “Recarregar” ou “Manter esta aba” no aviso amarelo antes de criar as peças.");return}
  if(ROM.rows.some(romLoteDistribuicaoInvalida)){toast("Corrija a quantidade dos itens de lote ou desmarque-os antes de criar.");return}
  const antesConf=romInsAssinatura(),insPend=await romInsConferirArquivos();if(!insPend)return;if(antesConf!==romInsAssinatura()){toast("Os dados mudaram durante a conferência. Revise o romaneio novamente.");return}if(insPend.length){toast("O rateio mudou ou não foi possível conferir itens já lançados. Restaure a tabela salva e confira esses itens antes de criar.");return}
  if(romConflito||editId){toast("O estado mudou durante a conferência. Revise o romaneio novamente.");return}
  if(romInsProibidos().length){toast("Frete e separação ficam fora do custo das peças. Retire esses itens dos insumos antes de criar.");return}
  if(romInsSemBase()){toast("Informe valores válidos para a base do rateio de insumos antes de criar.");return}
  if(romInsBasesInvalidas().length){toast("O custo de insumos contém fórmula ou valor inválido. Informe um valor numérico antes de ratear; a fórmula não foi alterada.");return}
  if(!romConjVerificar())return;
  {const NL=String.fromCharCode(10),dif=[];ROM.rows.forEach(r=>{if(r.skip||!r.refaz||!(r.lancIds||[]).length)return;const o=S.lanc.find(l=>l.id===r.lancIds[0]);if(!o||!o.v)return;const ch=[],ne=(x,y)=>{const a=num(x),b=num(y);return a!=null&&b!=null?Math.abs(a-b)>1e-9:String(x==null?"":x).trim()!==String(y==null?"":y).trim()};
      if(ne(o.v.N,r.peso))ch.push("peso "+(o.v.N||"—")+" → "+(r.peso||"—"));if(ne(o.v.P,r.custo))ch.push("compra "+(o.v.P||"—")+" → "+(r.custo||"—"));if(ne(o.v.F,r.desc))ch.push("descrição");
      if(ch.length)dif.push((o.v.E||r.desc)+": "+ch.join(", "))});
    if(dif.length&&!confirm("Ao refazer, "+dif.length+" peça(s) já lançada(s) estão diferentes do que o romaneio guarda (você editou depois na peça ou na tabela). Criar agora vai SOBRESCREVER essas edições com os dados do romaneio:"+NL+NL+dif.slice(0,8).join(NL)+(dif.length>8?NL+"…e mais "+(dif.length-8):"")+NL+NL+"OK = sobrescrever com o romaneio"+NL+"Cancelar = manter como está (depois corrija o card ou o romaneio)"))return}
  romCriando=true;setTimeout(()=>{romCriando=false},0);   /* durante a criação o romaneio não é ressincronizado com a tabela */
  const snap=clone(f),feitas=[],ign=[];let sem=0,err=0,un=0,ultErro="";const naLista=ROM.rows.filter(r=>!r.skip).reduce((t,r)=>t+r.qtd,0);
  ROM.rows.forEach(r=>{if(r.skip){if(!(r.feito&&!r.refaz)&&!(r.lote&&romLoteKids(r).length))ign.push({desc:r.desc,cod:r.cod,motivo:r.aviso?String(r.aviso).replace("· ",""):"desmarcada"});return}
    S.form=clone(snap);const {f:f2,q}=romForm(r);if(!q.length){sem++;ign.push({desc:r.desc,cod:r.cod,motivo:"sem quantidade"});return}
    S.form=f2;let pos=-1,velhos=null;if(r.refaz&&r.lancIds&&r.lancIds.length){pos=S.lanc.findIndex(l=>l.id===r.lancIds[0]);if(pos>=0&&romPrefDe(S.lanc[pos])!==prefDe(f2.v.I||"",f2.v.J))romFixaRefs(S.lanc,pos,romPrefDe(S.lanc[pos]),r.lancIds,false);velhos=S.lanc.filter(l=>r.lancIds.includes(l.id));S.lanc=S.lanc.filter(l=>!r.lancIds.includes(l.id))}
    if(adicionar(false,true)){const nl=S.lanc[S.lanc.length-1];if(velhos&&velhos.length===1){const anterior=velhos[0];nl.id=anterior.id;if(anterior.ft&&!nl.ft)nl.ft=anterior.ft;if(anterior.ftIdb)nl.ftIdb=anterior.ftIdb}if(pos>=0&&velhos&&velhos[0]&&romPrefDe(velhos[0])===romPrefDe(nl)){if(velhos[0].v&&!vazio(velhos[0].v.E)){nl.v.E=velhos[0].v.E;if(velhos[0].rf)nl.rf=1}S.lanc.pop();S.lanc.splice(Math.min(pos,S.lanc.length),0,nl)}feitas.push({r,id:nl.id});un+=q.reduce((t,x)=>t+x[1],0)}else{if(velhos)S.lanc.splice(Math.max(0,pos),0,...velhos);err++;ultErro=erro||ultErro;ign.push({desc:r.desc,cod:r.cod,motivo:"erro ao criar"+(erro?": "+erro:"")})}});
  S.form=snap;erro="";
  if(!feitas.length){renderRom();renderForm();toast("Nenhuma peça foi criada"+(ultErro?": "+ultErro:sem?" (nenhuma tem quantidade)":"")+". O romaneio continua aberto para você corrigir.");return}
  const ids=feitas.map(x=>x.id);
  const meta={forn:snap.v.H||"",banhista:snap.tipo==="bruta"?banhistaBy(snap.banhista).nome:"",tipo:snap.tipo,obs:ROM.obs||"",modelo:(romT()||{}).nome||"",conf:ROM.conf||"",naLista,un};
  {const g2=gerar(),corr=feitas.filter(({r})=>r.refaz).length;
  feitas.forEach(({r,id})=>{const eraRefaz=!!r.refaz,ls=g2.linhas.filter(x=>x.lancId===id);r.corrigida=eraRefaz;r.refs=ls.map(x=>x.v.E).join(", ");r.qLanc=ls.reduce((t,x)=>t+(num(x.v.W)||0),0);r.lancEm=Date.now();r.tipo=romTipo(r);r.bh=romBh(r).id;r.lancIds=[id];r.feito=true;r.refaz=false;r.skip=true;r.aviso="· já lançada";if(r.foto&&!eraRefaz)idbPut("fotos",id,r.foto)});
  if(feitas.length)ROM.log=(ROM.log||[]).concat([{em:Date.now(),por:AUTOR,acao:`Lançou ${feitas.length-corr} peça(s) nova(s)${corr?` e corrigiu ${corr}`:""} · ${un} unidades`}])}
  /* O rascunho com os vínculos fica disponível até o IndexedDB confirmar a gravação. */
  const lsOk=romSalvar(),gravacao=romGravP,romId=ROM.sid;let rascGravado=null;try{rascGravado=lerPref(ROMKEY)}catch(e){}
  ROM=null;renderRom();salvar(false);renderTopo();renderForm();if(ids.length)mostrarNoFim(ids[ids.length-1]);
  Promise.resolve(gravacao).then(ok=>{if(ok&&rascGravado){try{if(lerPref(ROMKEY)===rascGravado)romLimparRascunho()}catch(e){}}else if(!ok&&!lsOk){setStatus("NÃO foi possível guardar o vínculo do romaneio — baixe um backup",true);toast("Não consegui guardar o romaneio nem o rascunho. Não feche a página; baixe um backup completo.")}});
  toast(`${feitas.length} peça(s) criada(s) · ${un} de ${naLista} unidades${un<naLista?` (${naLista-un} ficaram de fora)`:""}${sem?` · ${sem} sem quantidade`:""}${err?` · ${err} com erro`:""}.`,ids.length?{t:"Desfazer",fn:desfazer}:null);
  if(feitas.length)relGerar(feitas,ign,meta,romId)}
