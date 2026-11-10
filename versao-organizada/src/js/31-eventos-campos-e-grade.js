document.addEventListener("focusout",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.subren!==undefined&&catUI.ren)catUI.ren=null});
document.addEventListener("dblclick",e=>{if(e.target.classList&&e.target.classList.contains("rz")){delete colW[e.target.dataset.rz];try{localStorage.setItem("cadpecas-colw",JSON.stringify(colW))}catch(x){}renderTopo()}});
document.addEventListener("mouseover",e=>{const tr=e.target.closest("tr[data-l]");document.querySelectorAll("tr.hl").forEach(x=>{if(!tr||x.dataset.l!==tr.dataset.l)x.classList.remove("hl")});if(tr)document.querySelectorAll(`tr[data-l="${CSS.escape(String(tr.dataset.l))}"]`).forEach(x=>x.classList.add("hl"))});
/* a variação do elemento (cartão da categoria ou variação sem categoria) */
function gradeDoEl(el){const e=el.closest("[data-gr]");if(!e)return null;const k=e.dataset.gr;return k.charAt(0)==="o"?(cfg().grades||[])[+k.slice(1)]:cfg().categorias[+k].grade}
function aplicaFaixa(txt){const f=S.form,gr=gradeBy(f.grade);if(!gr)return;f.gsel=selFaixa(gr,txt);erro="";salvar(false);renderTopo();renderForm()}
/* campos do banho/banhista: devolve a mensagem de erro ("" = válido). Letra única e não vazia; milésimos, multiplicador e verniz >= 0 */
function validaBanho(bh,b,campo,valor){
  const v=String(valor==null?"":valor).trim();
  if(b&&campo==="fator"&&v){const n=num(v);if(n==null||n<=0||n>1e5)return "O Fator × precisa ser um número maior que 0 (ex.: 2,5)."}
  if(!b&&campo==="nome"){if(!v)return "O nome da galvânica não pode ficar vazio.";if(cfg().banhistas.some(x=>x!==bh&&semAc(x.nome)===semAc(v)))return `Já existe a galvânica “${v}” — use outro nome.`}
  if(b&&campo==="nome"){
    if(!v)return "O nome do banho não pode ficar vazio.";
    if(bh.banhos.some(x=>x!==b&&semAc(x.nome)===semAc(v)))return `Já existe um banho chamado “${v}” neste galvânica — use outro nome (ex.: ${v} 2).`}
  if(b&&campo==="letra"){
    if(!v)return "A letra do banho não pode ficar vazia.";
    if(!/^[A-Za-z]{1,2}$/.test(v))return "A letra do banho deve ter só letras (A–Z), no máximo 2.";
    if(bh.banhos.some(x=>x!==b&&String(x.letra||"").trim().toLowerCase()===v.toLowerCase()))return `Já existe um banho com a letra “${v}” neste galvânica — escolha outra.`}
  if((b&&(campo==="mil"||campo==="mult"))||(!b&&campo==="verniz")){
    if(v==="")return "";
    const n=num(v);if(n==null||n<0)return `${campo==="mil"?"Milésimos":campo==="mult"?"Multiplicador":"Verniz"} precisa ser um número maior ou igual a 0 (sem texto nem negativo).`}
  return ""}
/* "Última peça": só dígitos, até 9; avisa quando tira sinal/letras ou corta */
function limpaUlt(raw){raw=String(raw==null?"":raw);const so=raw.replace(/[^0-9]/g,""),ign=raw.replace(/\s/g,"").length;
  if(so.length>9)toast("A última peça aceita no máximo 9 dígitos — o excedente foi cortado.");
  else if(raw.replace(/\s/g,"").length>so.length&&ign)toast("A última peça só aceita dígitos (0–9): sinal e letras foram removidos.");
  return so.slice(0,9)}
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
function onField(t,isChange){
  if(t.dataset&&t.dataset.mf!==undefined){const tr=t.closest("[data-mi]"),m=tr&&MULTI[+tr.dataset.mi];if(m)m[t.dataset.mf]=t.value;return}
  if(t.dataset&&t.dataset.lcf!==undefined){if(!isChange)return;const C=cfg(),tr=t.closest("[data-lc]"),j=+tr.dataset.lc,n=C.cores[j],k=corKey(n),M=C.coresMeta=C.coresMeta||{},fl=t.dataset.lcf;
    if(fl==="nome"){const nv=t.value.trim();if(!nv||nv===n){t.value=n;return}if(C.cores.some((y,q)=>q!==j&&corKey(y)===corKey(nv))){toast("Já existe uma cor com esse nome.");t.value=n;return}
      const nk=corKey(nv);if(M[k]){M[nk]=M[k];if(nk!==k)delete M[k]}C.cores[j]=nv;
      C.banhistas.forEach(b=>b.banhos.forEach(x=>{if(x.cor===n)x.cor=nv}));C.categorias.forEach(c=>(c.cores||[]).forEach(x=>{if(corKey(x.nome)===k)x.nome=nv}));
      const troca=l=>{if(l&&Array.isArray(l.csel))l.csel=l.csel.map(id=>id==="L:"+k?"L:"+nk:id)};S.lanc.forEach(troca);troca(S.form);if(ROM&&ROM.rows)ROM.rows.forEach(troca)}
    else if(fl==="sig"){const v=t.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,2);if(v){const sg=libSiglas();if(C.cores.some((y,q)=>q!==j&&sg[corKey(y)]===v)){toast("Essa sigla já é de outra cor.");t.value=(M[k]&&M[k].sig)||"";return}}M[k]=M[k]||{};if(v)M[k].sig=v;else delete M[k].sig}
    else if(fl==="txt"){M[k]=M[k]||{};if(t.value.trim())M[k].txt=t.value.trim();else delete M[k].txt}
    else if(fl==="ped"){M[k]=M[k]||{};M[k].ped=t.checked}
    salvar(true,false);render();return}
  if(t.dataset&&t.dataset.gusar!==undefined){const c=catBy(S.form.v.I),v=t.value;if(c&&v&&!c.grade){if(v.startsWith("o:")){const og=(cfg().grades||[]).find(x=>x.id===v.slice(2));if(og)c.grade={id:uid(),nome:og.nome,subs:[],usaId:og.id,itens:[]}}else{const src=catBy(v.slice(2));if(src&&src.grade){const o=src.grade.usa?(catBy(src.grade.usa)||src):src;c.grade={id:uid(),nome:o.grade.nome,subs:[],usa:o.nome,itens:[]}}}sincGrade(S.form);salvar(true);render()}return}
  if(t.dataset){
    if(t.dataset.rex!==undefined){romUI.txt=t.value;romExAtualiza();return}
    if(t.dataset.rexn!==undefined){romUI.nome=t.value;return}
    if(t.dataset.colar!==undefined){catUI.txt=t.value;atualizaPrevia();return}
    if(t.dataset.ncor!==undefined)return;
    if(t.dataset.subren!==undefined){if(isChange&&!renBusy){const ce2=t.closest("[data-cat]");if(ce2){const ci2=+ce2.dataset.cat,j2=+t.dataset.subren,c2=cfg().categorias[ci2],velho=c2&&c2.subs[j2],novo=t.value;let feito=false;const go=()=>{if(feito)return;feito=true;document.removeEventListener("click",go,true);setTimeout(()=>{const c3=cfg().categorias[ci2],jj=c3?c3.subs.indexOf(velho):-1;if(jj>=0)subRenomear(ci2,jj,novo)},0)};document.addEventListener("click",go,true);setTimeout(go,700)}}return}
    if(t.dataset.dup!==undefined&&catUI.dup){dupCampo(t);return}
  }
  if(t.dataset&&t.dataset.cjpick!==undefined){const f=S.form,l=S.lanc.find(x=>x.id===t.value);t.value="";if(!l||!f.conj)return;f.comp=f.comp||[];if(f.comp.length>=60){toast("Máximo de 60 peças por conjunto.");return}
    const c=novaComp(String(l.v.F||"").replace(/\s+/g," ").trim().slice(0,60));c.peso=String(l.v.N||"");c.custo=String(l.v.P||"");{const vaz=f.comp.findIndex(x=>!x.desc&&!x.peso&&!x.custo);if(vaz>=0)f.comp[vaz]=c;else f.comp.push(c)}conjSync(f);salvar(false);renderTopo();renderForm();return}
  if(t.dataset&&t.dataset.cp){const f=S.form,i=+(t.closest("[data-ci]")||{dataset:{}}).dataset.ci,c=f.comp&&f.comp[i];if(!c)return;
    if(t.dataset.cp==="vz")c.vz=t.checked;else c[t.dataset.cp]=t.value;
    if(t.dataset.cp==="banho"){delete c.vz;conjSync(f);salvar(false);renderTopo();renderForm();return}
    conjSync(f,true);salvar(false);renderTopo();return}
  const C=cfg(),f=S.form;
  if(t.dataset&&t.dataset.fauto!==undefined){try{localStorage.setItem("cadpecas-imgbb-auto",t.checked?"1":"0")}catch(e){}return}
  if(t.dataset&&t.dataset.fkey!==undefined){try{localStorage.setItem("cadpecas-imgbb",String(t.value).trim().slice(0,80))}catch(e){}return}
  if(t.hasAttribute&&t.hasAttribute("data-faixa")){if(isChange&&!faixaBusy){faixaBusy=true;try{aplicaFaixa(t.value)}finally{faixaBusy=false}}return}
  if(t.dataset&&t.dataset.nv!==undefined){if(!NOVO)return;
    if(t.dataset.nv==="nome"){NOVO.nome=String(t.value).slice(0,60);return}
    if(t.dataset.nv==="k"&&isChange){const c=NOVO.cols[+t.dataset.i];if(c){c.k=t.value;c.auto=false;if(c.k&&TIPO_PAD[c.k]&&!c.tipo)c.tipo=TIPO_PAD[c.k];const tr=t.closest("tr");if(tr){tr.className=c.k?"":"nv-nao";const h=tr.querySelector(".hint");if(h)h.textContent=c.k?"escolhida por você":"em branco"}}}
    return}
  if(t.id==="modSel"){const v=t.value;
    if(v==="@bling"||v==="@jueri"){const mo=v==="@bling"?modeloBling():modeloJueri();mo.id=uid();C.modelos.push(mo);C.modelo=mo.id;salvar(true,false);render();toast(v==="@bling"?"Bling adicionado. Fornecedor e Categoria saem em branco: o Bling só aceita nomes que já existem nele.":"Jueri adicionado.")}
    else if(v==="@novo"){renderTopo();abrirNovoSistema()}
    else{C.modelo=v;salvar(true,false);renderTopo();renderCfg()}
    return}
  if(t.dataset.mod){const mo=modeloAtual(),k=t.dataset.mod;if(k==="sel"){C.modelo=t.value;salvar(true,false);render()}
    else if(["nome","formato","sep","dec","enc","aba","agrupar","lote"].includes(k)){mo[k]=k==="lote"?String(Math.max(0,Math.min(100000,Math.trunc(num(t.value)||0))||"")):String(t.value).slice(0,60);salvar(true,false);renderTopo();if(isChange&&k!=="nome")renderCfg()}return}
  if(t.dataset.mcf){const mo=modeloAtual(),c=mo.cols[+t.closest("[data-mc]").dataset.mc],k=t.dataset.mcf;c[k]=t.type==="checkbox"?t.checked:t.value;
    if(k==="k"&&t.value&&(!c.h||c.h==="Nova coluna"))c.h=NOME[t.value];salvar(true,false);renderTopo();if(isChange)renderCfg();return}
  if(t.hasAttribute&&t.hasAttribute("data-qall")){const k=t.dataset.qall,gr=gradeBy(f.grade);f.ov=f.ov||{};
    itensGrade(f).forEach(it=>{const key=k+"~"+it.id;f.ov[key]=f.ov[key]||{};if(vazio(t.value))delete f.ov[key].W;else f.ov[key].W=t.value;const i=document.getElementById(`f-${key}-W`);if(i)i.value=t.value});
    atualizarGera();salvar(false);return}
  if(t.id==="celIn")return;
  if(t.dataset&&t.dataset.ult){const pf=t.dataset.ult,d=limpaUlt(t.value);C.seqs[pf]=d;if(t.value!==d)t.value=d;salvar(true,false);renderTopo();atualizarGera();if(ROM)romAtualSoon();if(isChange)renderCfg();return}
  if(t.closest&&t.closest("#romWrap")){romCampo(t,isChange);return}
  {const re=t.closest&&t.closest("[data-rom]");
    if(re&&t.dataset.rm){const T=C.romaneios[+re.dataset.rom];if(T){T.mapa=[...re.querySelectorAll(".rmr")].map(r=>{const w=r.querySelector("[data-rm=w]").value.trim(),c=r.querySelector("[data-rm=c]").value,sb=r.querySelector("[data-rm=s]").value;return w?w+"="+c+(c&&sb?">"+sb:""):""}).filter(Boolean).join("; ");salvar(true,false);if(isChange&&t.dataset.rm==="c")renderCfg()}return}
    if(re&&t.dataset.rf){const T=C.romaneios[+re.dataset.rom];if(T){T[t.dataset.rf]=t.type==="checkbox"?t.checked:t.value;salvar(true,false)}return}}
  if(t.id==="fBusca"){FIL.q=t.value;guardarFil();renderTopo();return}
  if(t.dataset&&t.dataset.fil){if(!isChange)return;FIL[t.dataset.fil]=t.value;guardarFil();renderTopo();return}
  if(t.id==="selAll"){G.linhas.forEach((r,ri)=>{if(vis(ri)){if(t.checked)sel.add(r.lancId);else sel.delete(r.lancId)}});renderTopo();return}
  if(t.hasAttribute&&t.hasAttribute("data-sel")){const id=t.closest("tr").dataset.l;if(t.checked)sel.add(id);else sel.delete(id);renderTopo();return}
  if(t.dataset.col){
    const L=t.dataset.col;f.v[L]=t.value;erro="";
    if(L==="H"&&isChange){const fo=fornBy(t.value);if(fo){f.desconto=fo.desconto;if(fo.codigo)f.v.G=fo.codigo;else delete f.v.G;if(!editId&&!f.conj&&fo.tipo&&fo.tipo!==f.tipo){f.tipo=fo.tipo;if(f.tipo==="bruta"&&!Object.values(f.on||{}).some(Boolean))marcadosPadrao(f)}if(!editId){banhistaDoFornecedor(f);const d=aplicarMemForn(f,fo);if(d)toast(`Lembrado de ${fo.nome}: ${d}`)}}renderForm();refocar("#f-H");renderTopo();salvar(false);return}
    if(L==="I"&&isChange&&!vazio(t.value)&&!catBy(t.value)){   /* categoria digitada que não existe: volta à anterior e abre o cadastro rápido já com o nome (precisa do prefixo) */
      const nome=t.value.replace(/\s+/g," ").trim(),ant=t.dataset.prev!=null?t.dataset.prev:"";if(ant&&catBy(ant))f.v.I=ant;else delete f.v.I;
      quickPre=nome;quick="cat";quickB=null;renderForm();renderListas();toast("Essa categoria não existe ainda: informe o prefixo para cadastrá-la.");setTimeout(()=>{const e2=document.getElementById("q2");if(e2)e2.focus()},60);return}
    if(L==="I"&&isChange){f.csel=editId?(f.csel||[]).filter(id=>coresDaCat(t.value).some(x=>x.id===id)):[];setTimeout(()=>{if(!f.csel.length&&!editId){f.csel=coresPadrao(f.v.I,f.v.J);renderForm();renderTopo()}},0);const c=catBy(t.value);if(c&&!c.subs.includes(f.v.J))delete f.v.J;sincGrade(f);if(!editId&&!f.conj&&/^conjuntos?$/.test(semAc(t.value))){ativarConjunto();return}renderListas();renderForm();refocar("#f-I");renderTopo();salvar(false);return}
    if(L==="J"&&isChange){sincGrade(f);renderForm();refocar("#f-J");renderTopo();salvar(false);return}
    if(L==="V"&&isChange)fatorDoPreco("p");
    atualizarGera();salvar(false);return;
  }
  if(t.dataset.mk){f.mk=f.mk||{};
    if(!vazio(t.value)){const n=num(t.value);if(n==null||n<=0||n>1e5){if(isChange){t.value=f.mk[t.dataset.mk]??"";toast("O Fator × precisa ser um número maior que 0 (ex.: 2,5).")}return}}
    if(vazio(t.value))delete f.mk[t.dataset.mk];else f.mk[t.dataset.mk]=t.value;
    /* o fator é só sugestão: o Preço de Varejo digitado à mão fica como está */
    if(f.conj)conjSync(f,true);
    atualizarGera();salvar(false);return}
  if(t.dataset.bo){const b=t.dataset.bo,L=t.dataset.k;f.ov=f.ov||{};f.ov[b]=f.ov[b]||{};if(vazio(t.value))delete f.ov[b][L];else f.ov[b][L]=t.value;if(L==="V"&&isChange)fatorDoPreco(b);if(f.conj&&L==="V")conjSync(f,true);atualizarGera();salvar(false);return}
  if(t.dataset.f){const k=t.dataset.f;
    if(k==="desconto"&&!vazio(t.value)){const d=num(t.value);if(d==null||d<0||d>100){if(isChange){t.value=f.desconto??"0";toast("Desconto precisa ficar entre 0 e 100 (%).")}return}}
    const idAntes=f[k];f[k]=t.type==="checkbox"?t.checked:t.value;
    if(k==="banhista"){const bhAntes=banhistaBy(idAntes);trocarBanhista(f,t.value);if(f.conj&&Array.isArray(f.comp)){const nb=banhistaBy(f.banhista);f.comp.forEach(c=>{const o=(bhAntes.banhos||[]).find(x=>x.id===c.banho);if(c.banho&&c.banho!=="-")c.banho=((o&&(nb.banhos||[]).find(x=>x.letra===o.letra))||{}).id||"";delete c.vz});conjSync(f)}renderForm();refocar('[data-f="banhista"]')}
    else if(k==="semGrade"){if(f.semGrade)f.vinc=false;renderTopo();renderForm();refocar('[data-f="semGrade"]')}
    else atualizarGera();salvar(false);return}
  if(t.dataset.vz){f.vz=f.vz||{};f.vz[t.dataset.vz]=t.checked;atualizarGera();renderTopo();renderFormSoon();salvar(false);return}
  if(t.dataset.cs){f.csel=f.csel||[];const id=t.dataset.cs;f.csel=f.csel.filter(x=>x!==id);if(t.checked)f.csel.push(id);const cc=catBy(f.v.I);f.csel=coresDaCat(f.v.I,f.v.J).map(x=>x.id).filter(x=>f.csel.includes(x));erro="";renderTopo();renderForm();refocar(`[data-cs="${id}"]`);salvar(false);return}
  if(t.dataset.gi){f.gsel=f.gsel||[];const id=t.dataset.gi;f.gsel=f.gsel.filter(x=>x!==id);if(t.checked)f.gsel.push(id);const gr=gradeBy(f.grade);if(gr)f.gsel=gr.itens.map(x=>x.id).filter(x=>f.gsel.includes(x));erro="";renderTopo();renderForm();refocar(`[data-gi="${id}"]`);salvar(false);return}
  if(t.dataset.on){onDe(f)[t.dataset.on]=t.checked;if(f.conj)conjSync(f);{const cd=t.closest(".bcard");if(cd)cd.classList.toggle("off",!t.checked)}const qi=document.getElementById(`f-${t.dataset.on}-W`);if(qi)qi.disabled=!t.checked;renderFormSoon();atualizarGera();salvar(false);if(t.checked)refocar(`#f-${t.dataset.on}-W`);return}
  if(t.id==="ultInp"){const p=prefDe(f.v.I,f.v.J);C.seqs[p]=limpaUlt(t.value);if(t.value!==C.seqs[p])t.value=C.seqs[p];salvar(true,false);renderTopo();atualizarGera();document.getElementById("proxRef").textContent=fnum(p,proxDe(p));{const pb=document.getElementById("proxBig");if(pb)pb.innerHTML=`Próxima referência <b>${esc(p)}${fnum(p,proxDe(p))}</b>`}if(isChange)renderCfg();return}
  if(t.name==="ordem"){C.ordem=t.value;salvar(true,false);renderTopo();return}
  const ce=t.closest("[data-cat]");
  if(t.dataset.cf&&ce){const c=C.categorias[+ce.dataset.cat],k=t.dataset.cf;
    if(k==="nome"){const old=c.nome,nv=t.value.trim();
      const dup=C.categorias.some(x=>x!==c&&String(x.nome).trim().toLowerCase()===nv.toLowerCase());
      if(!nv||dup){if(isChange){t.value=old;toast(!nv?"O nome da categoria não pode ficar vazio — voltei ao nome anterior.":`Já existe a categoria “${nv}” — voltei ao nome anterior.`)}return}
      (C.romaneios||[]).forEach(T=>{if(T&&T.mapa)T.mapa=String(T.mapa).split(";").map(it=>{const q=it.indexOf("=");if(q<0)return it;const rest=it.slice(q+1).trim(),pp=rest.split(">");return pp[0].trim()===old?it.slice(0,q+1)+nv+(pp.length>1?">"+pp.slice(1).join(">"):""):it}).join(";")});
      C.catAlias=C.catAlias||{};Object.keys(C.catAlias).forEach(k=>{if(C.catAlias[k]===old)C.catAlias[k]=nv});C.catAlias[old]=nv;   /* romaneios salvos guardam o nome antigo: ao reabrir, seguem o novo */
      c.nome=nv;C.categorias.forEach(x=>{if(x.grade&&x.grade.usa===old)x.grade.usa=nv});if(typeof rascunho!=="undefined"&&rascunho&&rascunho.v&&rascunho.v.I===old)rascunho.v.I=nv;if(typeof ROM!=="undefined"&&ROM)ROM.rows.forEach(r=>{if(r.cat===old)r.cat=nv});C.banhistas.forEach(b=>b.banhos.forEach(x=>{["milCat","multCat"].forEach(ch=>{if(x[ch]&&Object.prototype.hasOwnProperty.call(x[ch],old)){x[ch][nv]=x[ch][old];delete x[ch][old]}})}));S.lanc.forEach(l=>{if(l.v.I===old)l.v.I=nv});if(f.v.I===old)f.v.I=nv;salvar(true)}
    else if(k==="prefixo"){t.value=t.value.toUpperCase().replace(/[^A-Z]/g,"").slice(0,4);if(!isChange)return;trocarPrefixo(c,t.value)}
    else if(k==="sufixo"){c.sufixo=t.value;salvar(true,false)}
    else if(k==="ncm"||k==="cfop"||k==="fcp"||k==="insumos"){
      if(isChange){const v=t.value.trim(),n=num(v),regra={ncm:[/^\d{8}$/.test(v),"O NCM tem 8 números (ex.: 71131100)."],cfop:[/^\d{4}$/.test(v),"O CFOP tem 4 números (ex.: 5102)."],fcp:[n!=null&&n>=0&&n<=100,"O FCP é um percentual de 0 a 100."],insumos:[n!=null&&n>=0&&n<=1e6,"Insumos precisa ser um número de 0 em diante (ex.: 0,50)."]}[k];
        if(v!==""&&!regra[0]){t.value=c[k]||"";toast(regra[1]+" Voltei ao valor anterior.");return}c[k]=v;t.value=v}
      salvar(true,false);if(isChange)renderForm()}
    else{const d=t.value.replace(/\D/g,"").slice(0,9);if(t.value!==d){t.value=d;if(isChange)toast("A última peça aceita só números inteiros, até 9 dígitos.")}C.seqs[(c.prefixo||"").toUpperCase()]=d;salvar(true,false)}
    renderTopo();if(isChange){if(k==="nome"||k==="prefixo")renderCfg();renderForm();renderListas()}return}
  if(t.dataset.cvg&&ce){const c=C.categorias[+ce.dataset.cat];c.coresCfg=c.coresCfg||{};const k=t.dataset.cvg;
    if(k==="subs")c.coresCfg.subs=t.value.split(/[;,]/).map(z=>z.trim()).filter(Boolean);
    else if(k==="padrao"){const nm=partir(t.value);c.coresCfg.padrao=coresDaCat(c.nome).filter(x=>nm.some(n=>semAc(n)===semAc(x.nome))).map(x=>x.id)}
    else c.coresCfg[k]=t.value;
    salvar(true,false);renderTopo();if(isChange)renderForm();return}
  if(t.dataset.cvf&&ce){const c=C.categorias[+ce.dataset.cat],j=+t.closest("[data-cvi]").dataset.cvi,x=(c.cores||[])[j],k=t.dataset.cvf;if(!x)return;
    if(k==="nome"){const nv=t.value.replace(/\s+/g," ").trim();if(!nv||c.cores.some((y,q)=>q!==j&&semAc(y.nome)===semAc(nv))){if(isChange){t.value=x.nome;toast("O nome da cor está vazio ou repetido nesta categoria.")}return}x.nome=nv}
    else if(k==="letra"){const v=t.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,2);t.value=v;if(v&&c.cores.some((y,q)=>q!==j&&String(y.letra||"").toUpperCase()===v)){if(isChange){t.value=x.letra||"";toast("Essa letra já é de outra cor desta categoria.")}return}x.letra=v}
    else x.texto=t.value;
    salvar(true,false);renderTopo();if(isChange)renderForm();return}
  if(t.dataset.sr&&ce){const c=C.categorias[+ce.dataset.cat];c.subSoRef=c.subSoRef||{};if(t.checked)c.subSoRef[t.dataset.sr]=true;else delete c.subSoRef[t.dataset.sr];salvar(true,false);renderTopo();return}
  if(t.dataset.sp&&ce){t.value=t.value.toUpperCase().replace(/[^A-Z]/g,"").slice(0,4);if(!isChange)return;const c=C.categorias[+ce.dataset.cat],v=t.value.toUpperCase().replace(/[^A-Z]/g,"");c.subPref=c.subPref||{};if(v){c.subPref[t.dataset.sp]=v;if(!(v in C.seqs))C.seqs[v]="0"}else delete c.subPref[t.dataset.sp];salvar(true,false);renderTopo();if(isChange){renderForm()}return}
  const ge=t.closest("[data-gr]");
  if("gcp" in t.dataset){const ci=+t.closest("[data-cat]").dataset.cat,src=C.categorias.find(x=>x.nome===t.value);
    if(String(t.value).startsWith("o:")){const og=(C.grades||[]).find(x=>x.id===t.value.slice(2));if(og){C.categorias[ci].grade={id:uid(),nome:og.nome,subs:[],usaId:og.id,itens:[]};sincGrade(f);salvar(true);render()}return}
    if(src&&src.grade){const o=src.grade.usa?(catBy(src.grade.usa)||src):src,g={id:uid(),nome:o.grade.nome,subs:[],usa:o.nome,itens:[]};C.categorias[ci].grade=g;abertos["g:"+C.categorias[ci].nome]=true;guardarAbertos();sincGrade(f);salvar(true);render()}return}
  if("gmove" in t.dataset){const k=+t.dataset.gmove,dest=C.categorias.find(x=>x.nome===t.value);
    if(dest&&!dest.grade&&C.grades[k]){dest.grade=C.grades.splice(k,1)[0];delete dest.grade.auto;dest.grade.subs=dest.grade.subs||[];sincGrade(f);salvar(true);render()}return}
  if(ge&&(t.dataset.gf||t.dataset.gif)){const g=gradeDoEl(t);if(!g)return;
    if(t.dataset.gf){if(t.dataset.gf==="rotulo"&&isChange){const o=String(t.defaultValue||"").trim(),n=String(t.value||"").trim();t.defaultValue=t.value;if(o&&o.toLowerCase()!==n.toLowerCase()){g.sin=g.sin||[];if(!g.sin.some(z=>z.toLowerCase()===o.toLowerCase()))g.sin.push(o)}}
      if(t.dataset.gf==="subs")g.subs=t.value.split(/[;,]/).map(z=>z.trim()).filter(Boolean);else g[t.dataset.gf]=t.value}
    else{const x=g.itens[+t.closest("[data-gii]").dataset.gii],k=t.dataset.gif;if(k==="letra"){const v=t.value.toUpperCase().replace(/[^A-Z]/g,"");if(v&&g.itens.some(y=>y!==x&&String(y.letra).toUpperCase()===v)){if(isChange){t.value=x.letra||"";toast("Essa letra já é de outra opção desta variação.")}return}x[k]=v}else if(vazio(t.value)&&k!=="nome")delete x[k];else x[k]=t.value}
    /* os textos-modelo das opções acompanham o rótulo, a coluna e o nome na hora, sem recarregar a tabela (para não perder o foco) */
    ge.querySelectorAll("[data-gii]").forEach(tr=>{const x=g.itens[+tr.dataset.gii],ef=efetivo(g,x),a=tr.querySelector('[data-gif="texto"]'),b=tr.querySelector('[data-gif="valor"]');if(a){a.placeholder=ef.texto;a.title="Vazio = segue a variação: "+ef.texto}if(b)b.placeholder=ef.valor});
    salvar(true,false);renderTopo();if(isChange)renderForm();else atualizarGera();return}
  const fe=t.closest("[data-forn]");
  if(t.dataset.ff&&fe){const fo=C.fornecedores[+fe.dataset.forn],k=t.dataset.ff;
    if(k==="desconto"&&!vazio(t.value)){const d=num(t.value);if(d==null||d<0||d>100){if(isChange){t.value=fo.desconto??"0";toast("Desconto precisa ficar entre 0 e 100 (%).")}return}}
    if(k==="nome"){const old=fo.nome,nv=t.value.trim();
      const dupF=C.fornecedores.some(x=>x!==fo&&semAc(x.nome)===semAc(nv));
      if(!nv||dupF){if(isChange){t.value=old;toast(!nv?"O nome do fornecedor não pode ficar vazio — voltei ao nome anterior.":`Já existe o fornecedor “${nv}” — voltei ao nome anterior.`)}return}
      if(isChange)t.value=nv;S.lanc.forEach(l=>{if(l.v.H===old)l.v.H=nv});(C.romaneios||[]).forEach(T=>{if(T&&T.forn===old)T.forn=nv});if(f.v.H===old)f.v.H=nv;fo.nome=nv;salvar(true)}else{fo[k]=t.value;salvar(true,false)}
    if(isChange){renderListas();renderTopo();renderForm()}return}
  const be=t.closest("[data-bh]");
  if(be&&(t.dataset.bmc!==undefined||t.dataset.bmv!==undefined)){const eMil=t.dataset.bmc!==undefined,bh=C.banhistas[+be.dataset.bh],b=bh&&bh.banhos[+(eMil?t.dataset.bmc:t.dataset.bmv)],cn=t.dataset.mcat,chave=eMil?"milCat":"multCat";if(!b)return;const v=String(t.value).trim();
    if(v!==""){const n=num(v);if(n==null||n<0){if(isChange){t.value=cn==="__padrao"?(eMil?b.mil:b.mult)??"":(b[chave]||{})[cn]??"";toast((eMil?"Milésimos":"O valor em R$")+" precisa ser um número maior ou igual a 0.")}return}}
    if(cn==="__padrao"){b[eMil?"mil":"mult"]=v;salvar(true,false);renderTopo();if(isChange)renderForm();return}
    b[chave]=b[chave]||{};if(v==="")delete b[chave][cn];else b[chave][cn]=v;salvar(true,false);renderTopo();if(isChange)renderForm();return}
  if(be&&t.dataset.bnf==="cor"&&t.value==="__nova"){catUI.corNova={bi:+be.dataset.bh,j:+t.closest("[data-bn]").dataset.bn};renderCfg();refocar("[data-ncor]");return}
  if(be&&(t.dataset.bhf||t.dataset.bnf)){const bh=C.banhistas[+be.dataset.bh];
    if(t.dataset.bhf){const m=validaBanho(bh,null,t.dataset.bhf,t.value);if(m){if(isChange){t.value=bh[t.dataset.bhf]??"";toast(m)}return}bh[t.dataset.bhf]=t.type==="checkbox"?t.checked:(t.dataset.bhf==="nome"?t.value.trim():t.value)}
    else{const b=bh.banhos[+t.closest("[data-bn]").dataset.bn],m=validaBanho(bh,b,t.dataset.bnf,t.value);if(m){if(isChange){t.value=b[t.dataset.bnf]??"";toast(m)}return}b[t.dataset.bnf]=t.type==="checkbox"?t.checked:(t.dataset.bnf==="nome"?t.value.trim():t.value)}
    if(isChange&&(t.dataset.bhf==='nome'||t.dataset.bnf==='nome'))t.value=t.value.trim();
    salvar(true,false);renderTopo();if(isChange)renderForm();else atualizarGera();return}
  const cce=t.closest("[data-cc]");
  if(cce&&t.dataset.ccf){const c=C.colcfg[cce.dataset.cc],k=t.dataset.ccf;if(k==="padrao"&&NUM.has(cce.dataset.cc)&&String(t.value).trim()!==""&&!String(t.value).trim().startsWith("=")){const n=num(t.value);if(n==null||n<0){if(isChange){t.value=c.padrao||"";toast("Este padrão precisa ser um número de 0 em diante.")}return}}c[k]=t.type==="checkbox"?t.checked:t.value;salvar(true,false);
    if(k==="opcoes")renderListas();renderTopo();if(isChange||t.type==="checkbox")renderForm();else atualizarGera();return}
}

/* campos mistos (categoria, subcategoria, fornecedor): ao focar, a lista mostra TODAS as opções (o navegador filtra pelo texto atual); se sair sem escolher nada, o valor volta */
document.addEventListener("focusin",e=>{const t=e.target;if(t&&t.classList&&t.classList.contains("misto")&&t.dataset.col&&t.getAttribute("list")&&!t.disabled&&!t.readOnly){t.dataset.prev=t.value;t.dataset.ph0=t.placeholder;if(t.value){t.placeholder=t.value;t.value=""}}});
document.addEventListener("focusout",e=>{const t=e.target;if(t&&t.classList&&t.classList.contains("misto")&&t.dataset.prev!==undefined){if(t.value===""&&t.dataset.prev){t.value=t.dataset.prev}t.placeholder=t.dataset.ph0||t.placeholder;delete t.dataset.prev}});
