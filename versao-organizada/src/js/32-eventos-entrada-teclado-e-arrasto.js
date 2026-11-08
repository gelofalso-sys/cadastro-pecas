document.addEventListener("input",e=>{const t=e.target;
  if(t.id==="catBusca"){const q=semAc(t.value);document.querySelectorAll("#cfg .cards>.card[data-cat]").forEach(c=>{const n=c.querySelector('[data-cf="nome"]');c.hidden=!!q&&!semAc(n?n.value:"").includes(q)});return}if(t.tagName==="SELECT"||t.type==="checkbox"||t.type==="radio"||t.type==="file")return;onField(t,false)});
document.addEventListener("change",e=>{const t=e.target;
  if(t.closest&&t.closest("#form")&&((t.dataset.bo&&t.dataset.k==="V")||t.id==="f-V")){fatorDoPreco(t.dataset.bo||"p")}
  if(t.id==="fileImp"&&t.files[0]){const fl=t.files[0];t.value="";return importar(fl)}
  if(t.id==="fileNovo"&&t.files[0]){const fl=t.files[0];t.value="";return lerNovo(fl)}
  if(t.id==="fileModJ"&&t.files[0]){const fl=t.files[0];t.value="";return modeloDeJson(fl)}
  if(t.id==="fileBk"&&t.files[0]){const fl=t.files[0];t.value="";return restaurar(fl)}
  if(t.id==="fileBkT"&&t.files[0]){const fl=t.files[0];t.value="";return restaurarTotal(fl)}
  if(t.id==="impFile"){const fl=[...t.files];t.value="";impAdd(fl);return}
  if(t.id==="romPdf"&&t.files[0]){const fl=t.files[0];t.value="";return romPdf(fl)}
  if(t.id==="romXls"&&t.files[0]){const fl=t.files[0];t.value="";return romPlanilha(fl)}
  if(t.tagName==="SELECT"||t.type==="checkbox"||t.type==="radio"||t.dataset.lcf!==undefined||t.dataset.mk!==undefined||t.dataset.cf||t.dataset.sp||t.dataset.subren!==undefined||t.dataset.cvf!==undefined||t.dataset.cvg!==undefined||t.dataset.ff==="desconto"||t.dataset.bhf!==undefined||t.dataset.gif==="letra"||t.dataset.bmc!==undefined||t.dataset.bmv!==undefined||t.dataset.bnf==="nome"||t.dataset.bnf==="letra"||t.dataset.ff==="nome"||t.id==="ultInp"||t.dataset.col==="H"||t.dataset.col==="I"||(t.dataset.ccf==="opcoes")||t.hasAttribute("data-faixa")||t.dataset.rp==="faixa"||t.dataset.rp==="qall"||t.dataset.gf==="faixa"||t.dataset.gf==="rotulo"||t.dataset.gf==="subs"||t.dataset.gf==="nome")onField(t,true)});
document.addEventListener("paste",e=>{const cb=e.clipboardData||window.clipboardData;let tcb="";try{tcb=cb?cb.getData("text"):""}catch(x){}
  if(tcb.length>MAX_TEXTO_COLADO){e.preventDefault();toast(`Texto grande demais para colar (${tcb.length} caracteres; o limite é ${MAX_TEXTO_COLADO}). Cole em partes menores.`);return}
  const pt=e.target;
  /* colar várias linhas num campo de uma linha só: as quebras viram ";" (senão o navegador junta tudo num texto só) */
  if(pt.dataset&&pt.dataset.enter!==undefined&&pt.setRangeText){const tx=(e.clipboardData||window.clipboardData).getData("text");if(/[\r\n]/.test(tx)){e.preventDefault();const j=tx.replace(/\s*[\r\n]+\s*/g,"; ").replace(/^[;\s]+|[;\s]+$/g,"");pt.setRangeText(j,pt.selectionStart,pt.selectionEnd,"end");return}}
  if(e.target.id!=="celIn"&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){
    /* só cola na tabela quando o foco está nela (ou solto na página); em botão, menu ou painel o Ctrl+V não pode criar/alterar peças */
    if(!(e.target===document.body||e.target===document.documentElement||(e.target.closest&&e.target.closest("#sheet"))))return;
    const tx=(e.clipboardData||window.clipboardData).getData("text");if(tx&&tx.trim()){e.preventDefault();const b=selBox();colarCel(tx,b?{ri:b.r1,L:LET[b.c1]}:{ri:G.linhas.length,L:"A"})}return}if(e.target.id!=="celIn"||!celEd)return;const tx=(e.clipboardData||window.clipboardData).getData("text");if(tx&&(tx.includes("\t")||tx.replace(/\n+$/,"").includes("\n"))){e.preventDefault();colarCel(tx)}});
document.addEventListener("keydown",e=>{
  const t=e.target;
  if(t.dataset&&(t.dataset.subren!==undefined||t.dataset.dup!==undefined||t.dataset.ncor!==undefined||t.dataset.colar!==undefined||t.id==="novaCat")){const k=e.key;
    if(t.dataset.subren!==undefined){if(k==="Enter"){e.preventDefault();const ce2=t.closest("[data-cat]");{const ci2=ce2?+ce2.dataset.cat:-1,j2=+t.dataset.subren;subRenomear(ci2,j2,t.value);focoChip(ci2,j2)}return}if(k==="Escape"){e.preventDefault();const ce3=t.closest("[data-cat]"),j3=+t.dataset.subren;catUI.ren=null;t.value=t.defaultValue;renBusy=true;try{renderCfg()}finally{renBusy=false}if(ce3)focoChip(+ce3.dataset.cat,j3);return}return}
    if(t.dataset.dup!==undefined){if(k==="Enter"&&t.type!=="checkbox"){e.preventDefault();dupOk();return}if(k==="Escape"){e.preventDefault();{const di=catUI.dup?catUI.dup.i:0;catUI.dup=null;renderCfg();refocar(`[data-cat="${di}"] [data-act="cat-dup"]`)}return}return}
    if(t.dataset.ncor!==undefined){if(k==="Enter"){e.preventDefault();corNovaOk();return}if(k==="Escape"){e.preventDefault();const cn0=catUI.corNova;catUI.corNova=null;renderCfg();if(cn0)refocar(`[data-bh="${cn0.bi}"] [data-bn="${cn0.j}"] [data-bnf="cor"]`);return}return}
    if(t.dataset.colar!==undefined){if(k==="Escape"){e.preventDefault();catUI.colar=false;renderCfg();refocar('[data-act="colar-abrir"]');return}return}
    if(t.id==="novaCat"&&k==="Enter"){e.preventDefault();const b=document.querySelector('[data-act="cat-add"]');if(b)b.click();return}}
  if(t.dataset&&t.dataset.act==="ctab"&&(e.key==="ArrowRight"||e.key==="ArrowLeft"||e.key==="Home"||e.key==="End")){const bs=[...document.querySelectorAll('#cfg [data-act="ctab"]')],i=bs.indexOf(t);if(i>=0){e.preventDefault();const j=e.key==="Home"?0:e.key==="End"?bs.length-1:(i+(e.key==="ArrowRight"?1:-1)+bs.length)%bs.length,id=bs[j].dataset.id;abertos.tab=id;guardarAbertos();renderCfg();refocar(`#cfg [data-act="ctab"][data-id="${id}"]`);return}}
  if(t.hasAttribute&&t.hasAttribute("data-faixa")&&e.key==="Enter"){e.preventDefault();t.dispatchEvent(new Event("change",{bubbles:true}));return}
  if((e.ctrlKey||e.metaKey)&&e.key==="Enter"&&t.closest&&t.closest("#form")){e.preventDefault();adicionar(true);return}
  if(t.id==="celIn"){
    if(e.key==="Enter"){e.preventDefault();fecharCel(true,e.shiftKey?"up":"down")}
    else if(e.key==="Tab"){e.preventDefault();fecharCel(true,e.shiftKey?"left":"right")}
    else if(e.key==="Escape"){e.preventDefault();fecharCel(false);document.getElementById("sheet").focus({preventScroll:true})}
    return;
  }
  if(t.classList&&t.classList.contains("pc")&&(e.key==="Enter"||e.key===" ")){e.preventDefault();t.click();return}
  if(t.dataset&&t.dataset.rp==="faixa"&&e.key==="Enter"){e.preventDefault();t.dispatchEvent(new Event("change",{bubbles:true}));return}
  if(t.dataset&&t.dataset.rp&&e.key==="Enter"&&t.tagName==="INPUT"&&t.closest(".rc")){e.preventDefault();let nx=t.closest(".rc").nextElementSibling;while(nx&&nx.classList.contains("sk"))nx=nx.nextElementSibling;
    const n2=nx&&nx.querySelector(`[data-rp="${t.dataset.rp}"]${t.dataset.b?`[data-b="${t.dataset.b}"]`:""}`);if(n2){n2.focus();try{n2.select()}catch(x){}}return}
  if(t.id==="sheet"&&selR&&!celEd){
    const k=e.key,mod=e.ctrlKey||e.metaKey,mr=Math.max(maxRi(),0);
    const mover=(dr,dc)=>{const r=dr?passo(selR.fr,dr,mr):selR.fr,c=Math.min(Math.max(selR.fc+dc,0),LET.length-1);if(e.shiftKey&&k!=="Tab")selecionar(selR.ar,selR.ac,r,c);else selecionar(r,c);rolarAte()};
    if(k==="ArrowDown"){e.preventDefault();mover(1,0);return}
    if(k==="ArrowUp"){e.preventDefault();mover(-1,0);return}
    if(k==="ArrowRight"||(k==="Tab"&&!e.shiftKey)){e.preventDefault();mover(0,1);return}
    if(k==="ArrowLeft"||(k==="Tab"&&e.shiftKey)){e.preventDefault();mover(0,-1);return}
    if(k==="Enter"||k==="F2"){e.preventDefault();abrirCel(selR.fr,LET[selR.fc]);return}
    if(k==="Delete"||k==="Backspace"){e.preventDefault();limparSel();return}
    if(mod&&k.toLowerCase()==="c"){e.preventDefault();copiarSel();return}
    if(mod&&k.toLowerCase()==="d"){e.preventDefault();preencherAbaixo();return}
    if(mod&&k.toLowerCase()==="a"){e.preventDefault();selecionar(0,0,Math.max(Math.min(mr,(G?G.linhas.length:1)-1),0),LET.length-1);return}
    if(k==="Escape"){selR=null;pintarSel();renderSelBar();return}
    if(!mod&&!e.altKey&&k.length===1){e.preventDefault();abrirCel(selR.fr,LET[selR.fc]);const i=document.getElementById("celIn");if(i)i.value=k;return}
  }
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&!/INPUT|TEXTAREA|SELECT/.test(t.tagName)&&!t.isContentEditable){
    const kz=e.key.toLowerCase();
    if(kz==="z"&&!e.shiftKey){e.preventDefault();desfazer();return}
    if(kz==="y"||(kz==="z"&&e.shiftKey)){e.preventDefault();desfazer(true);return}}
  if(e.key==="Escape"&&celular()&&!editId&&document.body.classList.contains("fopen")&&!/INPUT|TEXTAREA|SELECT/.test(t.tagName)){e.preventDefault();formAbrir(false);return}
  if(e.key==="Escape"&&editId){e.preventDefault();cancelar();return}
  if(t.closest&&t.closest(".nf")&&e.key==="Enter"&&t.tagName!=="TEXTAREA"){e.preventDefault();salvarRapido();return}
  if(e.key==="Escape"&&quick){e.preventDefault();quick=null;renderForm();return}
  if(t.id==="ultInp"&&e.key==="Enter"){e.preventDefault();t.dispatchEvent(new Event("change",{bubbles:true}));focarPrimeiro();return}
  if(t.dataset&&t.dataset.enter&&e.key==="Enter"){e.preventDefault();const v=t.value.trim();if(!v)return;const C=cfg(),k=t.dataset.enter;
    const ci=t.closest("[data-cat]")?t.closest("[data-cat]").dataset.cat:null;
    if(k==="cv"){const L=partir(v),c=C.categorias[+ci];c.cores=c.cores||[];const novos=L.filter(n=>!c.cores.some(y=>semAc(y.nome)===semAc(n)));if(!novos.length){toast("Essas cores já estão na lista.");t.value="";return}
      novos.forEach(n=>c.cores.push({id:uid(),nome:n,texto:"",letra:proxCorLetra(c,n)}));abertos["cv:"+c.nome]=true;guardarAbertos();salvar(true,false);render();refocar(`[data-cat="${ci}"] [data-enter="cv"]`);return}
    if(k==="sub"||k==="cor"||k==="obs"){const L=partir(v);if(!L.length){t.value="";return}
      const alvo=k==="sub"?C.categorias[+ci].subs:k==="cor"?C.cores:C.observacoes,novos=L.filter(x=>!alvo.some(y=>semAc(y)===semAc(x)));
      if(!novos.length){toast(L.length>1?"Esses itens já existem.":"Esse item já existe.");t.value="";return}
      if(k==="obs")alvo.unshift(...novos);else alvo.push(...novos);
      if(L.length>1)toast(`${novos.length} adicionado(s)${novos.length<L.length?`, ${L.length-novos.length} já existia(m)`:""}.`);
      salvar(true,false);render();refocar(ci!=null?`[data-cat="${ci}"] [data-enter]`:`[data-enter="${k}"]`);return}
    if(k==="gi"){const g=gradeDoEl(t),gk=t.closest("[data-gr]").dataset.gr;v.split(/[;\n]/).map(x=>x.trim()).filter(Boolean).forEach(nm=>{if(g.itens.some(x=>x.nome===nm))return;g.itens.push({id:uid(),letra:proxLetra(g.itens.map(x=>x.letra)),nome:nm})});sincGrade(S.form);salvar(true,false);render();refocar(`[data-gr="${gk}"] [data-enter]`);return}
    /* (sub, cor e obs são tratados acima) */
    salvar(true,false);render();refocar(ci!=null?`[data-cat="${ci}"] [data-enter]`:`[data-enter="${k}"]`);return}
  if(t.closest&&t.closest("#form")&&e.key==="Enter"&&(t.tagName==="SELECT"||t.type==="checkbox")){e.preventDefault();adicionar()}
});

/* trava de segurança: no computador a página em si nunca rola (só a planilha e o painel de baixo) */
document.addEventListener("scroll",()=>{if(!celular()){const se=document.scrollingElement;if(se&&se.scrollTop)se.scrollTop=0;if(document.body.scrollTop)document.body.scrollTop=0}},true);
try{romTem=!!localStorage.getItem(ROMKEY);romInfo=localStorage.getItem("cadpecas-rom-info")||"";relTem=!!localStorage.getItem("cadpecas-rel");ROMS=JSON.parse(localStorage.getItem("cadpecas-roms")||"[]");TABS=JSON.parse(localStorage.getItem("cadpecas-tabs")||"[]");AUTOR=localStorage.getItem("cadpecas-autor")||"";arqRef()}catch(e){ROMS=[];TABS=[]}
document.addEventListener("dragover",e=>{if(e.dataTransfer&&[...(e.dataTransfer.types||[])].includes("Files"))e.preventDefault()});
document.addEventListener("drop",e=>{const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f&&document.querySelector(".rep [data-novo]")&&/[.](csv|xlsx?)$/i.test(f.name)){e.preventDefault();lerNovo(f);return}if(f&&/pdf|xml/i.test(f.type+f.name)){e.preventDefault();if(editId){toast("Termine ou cancele a edição antes.");return}nfRotear(f)}});
document.addEventListener("keydown",e=>{if(ROM&&ROM.rows.length&&(e.ctrlKey||e.metaKey)&&e.key==="Enter"&&e.target.closest&&e.target.closest("#romWrap")){e.preventDefault();romRevisar();return}},true);
/* abas que rolam para o lado: a seta "›" some quando chega ao fim */
{const at=el=>{if(el.scrollWidth<=el.clientWidth+2||el.scrollLeft+el.clientWidth>=el.scrollWidth-4)el.classList.add("fim");else el.classList.remove("fim")};
  document.addEventListener("scroll",e=>{const el=e.target;if(el&&el.matches&&el.matches("nav.ir,.ctabs"))at(el)},true);
  let raf=0;new MutationObserver(()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;document.querySelectorAll("nav.ir,.ctabs").forEach(at)})}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener("resize",()=>document.querySelectorAll("nav.ir,.ctabs").forEach(at));document.querySelectorAll("nav.ir,.ctabs").forEach(at)}
