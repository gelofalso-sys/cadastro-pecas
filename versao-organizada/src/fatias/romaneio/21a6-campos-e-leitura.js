let romBusy=false;
function romCampo(t,fin){if(!ROM)return;if(t.dataset.rp==="planmap"){if(ROM.plan){ROM.plan.map[t.dataset.k]=t.value===""?null:+t.value;renderRom()}return}const k=t.dataset.rp;if(!k)return;const f=S.form;romSalvarSoon();
  if(k==="texto"){ROM.texto=t.value;return}
  if(k==="obs"){ROM.obs=t.value;romAtualSoon();return}
  if(k==="rins"){romInsCampo(t,fin);return}
  if(k==="lotpr"){const rc=t.closest(".rc"),lot=rc&&ROM.rows[+rc.dataset.i];if(lot&&lot.lote){const n=num(t.value);if(!vazio(t.value)&&(n==null||n<=0||n>1e6)){if(fin){toast("O peso real precisa ser um número maior que 0 (ex.: 77).");t.value=lot.pesoReal||""}return}lot.pesoReal=t.value;romLoteRecalc(lot);romAtualSoon()}return}
  if(k==="lotrat"){const rc=t.closest(".rc"),lot=rc&&ROM.rows[+rc.dataset.i];if(lot&&lot.lote){lot.ratear=t.checked;romLoteRecalc(lot);romAtualSoon()}return}
  if(k==="qtdx"){const rc=t.closest(".rc"),r=rc&&ROM.rows[+rc.dataset.i];if(r&&r.extra){const n=Math.trunc(num(t.value)||0);r.qtd=Math.max(0,Math.min(1e6,n));romAtualSoon()}return}
  if(k==="tid"){ROM.tid=t.value;abertos.romT=t.value;guardarAbertos();ROM.msg="Modelo trocado: clique em Ler lista para reler com ele.";const T=romT();if(T&&T.forn&&fornBy(T.forn))romSetForn(T.forn);renderRom();return}
  if(k==="forn"){const t0=S.form.tipo;romSetForn(t.value);if(S.form.tipo!==t0)ROM.rows.forEach(r=>{if(r.feito)return;r.q={};romNovaCat(r)});renderRom();return}
  if(k==="bh"){trocarBanhista(f,t.value);salvar(false);renderForm();ROM.rows.forEach(r=>{if(r.feito)return;r.on={};r.bo={};r.vz={};r.mk={}});renderRom();return}
  if(k==="bn"){(f.tipo==="bruta"?f.on:(f.onP=f.onP||{}))[t.dataset.b]=t.checked;salvar(false);renderForm();renderRom();return}
  if(k==="ult"){const pf=t.dataset.p;cfg().seqs[pf]=limpaUlt(t.value);salvar(true,false);renderTopo();document.querySelectorAll(`#romWrap [data-nx="${pf}"] b`).forEach(b=>b.textContent=proxDe(pf));const lb=t.closest("label");if(lb)lb.classList.toggle("bad",!(ultimo(pf)>0));romAtualSoon();return}
  if(k==="rb"){ROM.bulk=ROM.bulk||{mk:{}};const kk=t.dataset.k;
    if(kk==="selmode"){romSelecionar(t.value);t.value="";return}
    if(kk==="mk"){ROM.bulk.mk=ROM.bulk.mk||{};ROM.bulk.mk[t.dataset.b]=t.value;return}
    ROM.bulk[kk]=t.value;if(kk==="cat"){ROM.bulk.sub="";const ss=document.querySelector("#romWrap [data-rp=rb][data-k=sub]"),cc=catBy(t.value);if(ss)ss.innerHTML=opts(cc?cc.subs:[],"","(manter)")}return}
  if(k==="mkg"){f.mk=f.mk||{};const bm=t.dataset.b;if(vazio(t.value))delete f.mk[bm];else f.mk[bm]=t.value;salvar(false);document.querySelectorAll(`#romWrap [data-rp=mk][data-b="${bm}"]`).forEach(e=>{const rr=ROM.rows[+e.closest(".rc").dataset.i];if(rr&&!(rr.mk&&rr.mk[bm]!==undefined))e.value=t.value});romAtualSoon();return}
  const rc=t.closest(".rc");if(!rc)return;const i=+rc.dataset.i,r=ROM.rows[i];if(!r)return;const estadoAntes={skip:r.skip,refaz:r.refaz,aviso:r.aviso};
  if(k!=="sel"&&k!=="use"){if(r.feito&&r.arq){if(fin)toast("Esta peça está na tabela salva “"+r.arq+"”. Restaure a tabela para corrigir.");return}
    if(romArma(r)){rc.classList.remove("sk");const u=rc.querySelector('[data-rp="use"]');if(u)u.checked=true;const bd=rc.querySelector(".rfeito");if(bd)bd.outerHTML=romBadge(r);if(fin)toast("Peça já lançada: ao criar ela é substituída, na mesma posição e com a mesma referência.")}}
  if(k==="qall"){const v=t.value;if(!vazio(v)){const n=num(v);if(n==null||n<0||!Number.isInteger(n)){if(fin)toast("Quantidade precisa ser um número inteiro, 0 ou mais.");return}}if(!fin||romBusy)return;romBusy=true;try{romKeys(r,[{id:t.dataset.b}]).forEach(kk=>{r.q[kk]=vazio(v)?"":String(num(v))});renderRom()}finally{romBusy=false}return}
  if(k==="gusar"){if(!fin)return;const c=catBy(r.cat),v=t.value;if(c&&v&&!c.grade){romArma(r);if(v.startsWith("o:")){const og=(cfg().grades||[]).find(x=>x.id===v.slice(2));if(og)c.grade={id:uid(),nome:og.nome,subs:[],usaId:og.id,itens:[]}}else{const src=catBy(v.slice(2));if(src&&src.grade){const o=src.grade.usa?(catBy(src.grade.usa)||src):src;c.grade={id:uid(),nome:o.grade.nome,subs:[],usa:o.nome,itens:[]}}}salvar(true,false);renderRom()}return}
  if(k==="faixa"){if(!fin||romBusy)return;romBusy=true;try{const g0=gradeDaCat(r.cat,r.sub);if(g0){r.gsel=selFaixa(g0,t.value);r.semG=false}renderRom()}finally{romBusy=false}return}
  if(k==="dscI"){const n=num(t.value);if(!vazio(t.value)&&(n==null||n<0||n>100)){if(fin)toast("Desconto precisa estar entre 0 e 100%.");return}r.dsc=t.value;romAtualSoon();return}
  if(k==="tipoI"||k==="bhI"){const temAj=x=>Object.keys(x.q||{}).some(z=>z!=="p"&&!vazio(x.q[z]))||(x.q&&x.q.p!==undefined&&String(x.q.p).trim()!==String(x.qtd).trim())||["bo","mk","vz"].some(z=>Object.keys(x[z]||{}).length>0);
    if(r.feito){const novo=clone(r);if(k==="tipoI")novo.tipo=t.value||undefined;else novo.bh=t.value||undefined;const validos=new Set(romKeys(novo,romColsR(novo))),incomp=Object.keys(r.q||{}).filter(z=>!vazio(r.q[z])&&(num(r.q[z])||0)>0&&!validos.has(z));
      if(incomp.length){Object.assign(r,estadoAntes);renderRom();toast("Não alterei o tipo ou a galvânica: a mudança deixaria quantidades sem correspondência. A peça e suas variações foram preservadas.");return}
      if(k==="tipoI")r.tipo=novo.tipo;else r.bh=novo.bh;renderRom();return}
    if(temAj(r)&&!confirm("Trocar isto apaga as quantidades distribuídas e os ajustes desta peça (fatores, preços, banhos). Continuar?")){renderRom();return}}
  if(k==="fornI"){r.forn=t.value||undefined;renderRom();return}
  if(k==="tipoI"||k==="bhI"){if(k==="tipoI")r.tipo=t.value||undefined;else r.bh=t.value||undefined;romReset(r);renderRom();return}
  if(k==="sel"){r.sel=t.checked;romSelN();return}
  if(k==="use"){if(r.feito&&r.arq){t.checked=false;toast("Esta peça está na tabela salva “"+r.arq+"”. Restaure a tabela para corrigir.");return}r.skip=!t.checked;if(r.feito){r.refaz=!r.skip;r.aviso=r.skip?"· já lançada":"";renderRom();return}rc.classList.toggle("sk",r.skip);romAtualSoon();return}
  if(k==="desc"){r.desc=t.value;romAtualSoon();return}
  if(k==="cod"){r.cod=t.value;romAtualSoon();return}
  if(!vazio(t.value)){   /* sem texto, sem negativo; quantidade inteira >= 0; multiplicador >= 0 */
    let m="";const col={custo:"P",peso:"N",vp:"V"}[k];
    if(col)m=checaCel(col,t.value).erro||"";
    else if(k==="q"){const n=num(t.value);if(n==null||n<0||!Number.isInteger(n))m="Quantidade precisa ser um número inteiro, 0 ou mais."}
    else if(k==="mk"){const n=num(t.value);if(n==null||n<0)m="Multiplicador precisa ser um número maior ou igual a 0."}
    else if(k==="bo"&&["C","U","V","O","_m"].includes(t.dataset.k)){const n=num(t.value);if(n==null||n<0)m="Digite um número maior ou igual a 0."}
    if(m){t.classList.add("bad");t.style.outline="2px solid #c0392b";campoMsg(t,m);if(fin)toast(m+" (não gravado)");return}
    t.classList.remove("bad");t.style.outline="";campoMsg(t,"")}
  if(k==="custo"){r.custo=t.value;r.custoAuto=false}else if(k==="peso"){r.peso=t.value;if(r.loteDe)romLotePeso(r,rc);else if(romCompraGrama(r)){const ci=rc.querySelector('[data-rp="custo"]');if(ci)ci.value=r.custo}}else if(k==="cor")r.cor=t.value;else if(k==="vp")r.vp=t.value;else if(k==="obs1")r.obs=t.value;
  else if(k==="cat"){if(!romTrocarCategoria(r,t.value,"")){Object.assign(r,estadoAntes);renderRom();return}r.catq=false;r.aviso=String(r.aviso||"").replace("· categoria não reconhecida: confira","").trim();romConjAuto(r);renderRom();return}
  else if(k==="sub"){if(!romTrocarCategoria(r,r.cat,t.value))Object.assign(r,estadoAntes);else romConjAuto(r);renderRom();return}
  else if(k==="vinc"){r.vinc=t.checked}
  else if(k==="semg"){r.semG=t.checked;if(t.checked)r.gsel=[];renderRom();return}
  else if(k==="cs"){const id=t.dataset.id;r.csel=(r.csel||[]).filter(x=>x!==id);if(t.checked)r.csel.push(id);r.csel=coresDaCat(r.cat,r.sub).map(x=>x.id).filter(x=>r.csel.includes(x));renderRom();return}
  else if(k==="gi"){const id=t.dataset.id;r.gsel=(r.gsel||[]).filter(x=>x!==id);if(t.checked)r.gsel.push(id);const g=gradeDaCat(r.cat,r.sub);if(g)r.gsel=g.itens.map(x=>x.id).filter(x=>r.gsel.includes(x));renderRom();return}
  else if(k==="bon"){r.on=r.on||{};r.on[t.dataset.b]=t.checked;renderRom();return}
  else if(k==="vz"){r.vz=r.vz||{};r.vz[t.dataset.b]=t.checked}
  else if(k==="mk"){r.mk=r.mk||{};if(vazio(t.value)||String(t.value)===String((f.mk||{})[t.dataset.b]??""))delete r.mk[t.dataset.b];else r.mk[t.dataset.b]=t.value;
    /* mudou o fator: o Preço de Varejo digitado à mão volta a ser calculado */
    {const b=t.dataset.b;if(b==="p")r.vp="";else if(r.bo&&r.bo[b])delete r.bo[b].V;const vi=t.closest(".bf")&&t.closest(".bf").querySelector('[data-auto^="V:"]');if(vi){vi.value="";vi.classList.add("isauto")}}}
  else if(k==="bo"){r.bo=r.bo||{};const b=t.dataset.b,kk=t.dataset.k,o=r.bo[b]=r.bo[b]||{},bb=banhistaBy(f.banhista).banhos.find(x=>x.id===b)||{},def=kk==="L"?bb.cor:kk==="O"?milDe(bb,r.cat||f.v.I):null;
    if(vazio(t.value)||(def!=null&&String(t.value)===String(def)))delete o[kk];else o[kk]=t.value;t.classList.toggle("isauto",!o[kk]&&"CUVF".includes(kk))}
  else if(k==="ex"){r.ex=r.ex||{};const L=t.dataset.k,d=padraoDe(r.cat||f.v.I,L);if(vazio(t.value)||String(t.value)===String(d??""))delete r.ex[L];else r.ex[L]=t.value}
  else if(k==="exk"){r._k=t.value;return}
  else if(k==="exv"){r._v=t.value;return}
  else if(k==="q"){r.q[t.dataset.b]=t.value}
  if(fin&&!vazio(t.value)&&(k==="vp"||(k==="bo"&&t.dataset.k==="V"))){const rc2=t.closest(".rc");if(rc2)romFatorDoPreco(r,k==="vp"?"p":t.dataset.b,rc2)}
  romAtualSoon()}
/* digitou o Preço de Varejo no cartão: o Fator × passa a ser o que dá esse preço (preço ÷ soma dos custos), como no formulário */
function romFatorDoPreco(r,id,rc){const p=romPreview()[ROM.rows.indexOf(r)];if(!p)return;const x=id==="p"?p.rows[0]:p.rows.find(y=>y.bid===id);
  if(!x||!(x.custo>0)){toast("Para o fator ser calculado, informe antes o peso e os custos.");return}
  const alvo=num(id==="p"?r.vp:((r.bo||{})[id]||{}).V);if(alvo==null||alvo<0)return;
  const fator=String(Math.round(alvo/x.custo*10000)/10000).replace(".",",");r.mk=r.mk||{};r.mk[id]=fator;
  const inp=rc.querySelector(`[data-rp="mk"][data-b="${CSS.escape(String(id))}"]`);if(inp)inp.value=fator}
function romLer(){if(ROM&&String(ROM.texto||"").length>MAX_TEXTO_COLADO){ROM.msg=`O texto da lista tem ${String(ROM.texto).length} caracteres e o limite é ${MAX_TEXTO_COLADO}. Cole ou envie a lista por partes.`;renderRom();return}if(ROM&&ROM.pdf&&ROM.texto!==ROM.pdf.texto)ROM.pdf=null;let f=S.form,T=romT(),R=lerRomaneioAuto(ROM.texto,T);
  {const pts=r=>r.erro?-1e9:romScore(r)+(/✓ valor/.test(r.conf||"")?1000:0);let bp=pts(R);for(const T2 of cfg().romaneios){if(T2.id===T.id)continue;const R2=lerRomaneioAuto(ROM.texto,T2),p2=pts(R2);if(p2>bp){bp=p2;ROM.tid=T2.id;T=T2;R=R2}}}
  if(R.erro){const tinha=ROM.rows&&ROM.rows.length;ROM.rows=[];ROM.pdf=null;ROM.conf="";ROM.msg=R.erro+(tinha?" Os cartões da leitura anterior foram removidos.":"");romSalvarSoon();renderRom();return}
  romAplicaR(R)}
function romAplicaR(R){const f=S.form,T=romT();
  {const vi=new Set();R.rows.forEach(r=>{if(!r.cod||r._sistema)return;const k=r.cod+"|"+r.qtd;if(vi.has(k)){r.skip=true;r.aviso=(r.aviso?r.aviso+" ":"")+"· linha repetida na lista — desmarcada"}else vi.add(k)})}
  R.rows.forEach(r=>{const mc=String(mapaCat(r.desc,T)||"").split(">");r.cat=mc[0]||f.v.I||"";const rd=!mc[0]?catDaDescricao(r.desc):null;if(rd)r.cat=rd.cat;else if(!mc[0]){r.catq=true;r.aviso=(r.aviso?r.aviso+" ":"")+"· categoria não reconhecida: confira"}r.sub=(mc[1]||(rd&&rd.sub)||"").trim();const cc=catBy(r.cat);if(r.sub&&!(cc&&cc.subs.includes(r.sub)))r.sub="";
    const c=T.custo==="preco"?(r.preco??r.precod):(r.precod??r.preco);r.custo=virg(c!=null?c:(r.total!=null&&r.qtd?r.total/r.qtd:null));
    r.mk={};r.bo={};r.on={};r.vz={};r.ex={};romNovaCat(r);
    if(r._sistema){const v=r._sistema;r.cat=String(v.I||f.v.I||"");r.sub=String(v.J||"");r.catq=!v.I;r.aviso=r.catq?"· categoria não informada: confira":"";r.peso=String(v.N??"");r.custo=String(v.P??"");r.tipo="pronta";r.on=Object.fromEntries((romBh(r).banhos||[]).map(b=>[b.id,false]));r.dsc="0";r.semG=true;r.gsel=[];r.csel=[];r.q={p:String(r.qtd)};r.vp=String(v.V??"");r.cor=String(v.L??"");r.obs=String(v.M??"");r.forn=String(v.H??"");r.ex={};["A","B","C","D","E","K","Q","R","S","T","U","X","Y","Z","AA","AB","AC","AD","AE"].forEach(k=>{if(v[k]!==undefined&&v[k]!==null&&String(v[k])!=="")r.ex[k]=String(v[k])});r.planSistema=true;delete r._sistema}
    if(!r.planSistema&&r.cod&&S.lanc.some(l=>String(l.v.G||"")===r.cod&&(l.v.H||"")===(f.v.H||""))){r.skip=true;r.aviso="· já lançada"}
    else if(!r.planSistema&&r.cod){const tb=TABS.find(t=>(t.cods||[]).includes(chaveCod(f.v.H,r.cod)));if(tb){r.skip=true;r.arq=tb.nome;r.aviso="· já lançada na tabela salva “"+tb.nome+"” — desmarcada"}}});
  if(ROM.pdf)romFotos(R.rows);
  {const vel={},n1={},n2={};(ROM.rows||[]).forEach(o=>{if(o.cod){n1[o.cod]=(n1[o.cod]||0)+1;vel[o.cod+"|"+n1[o.cod]]=o}});let mant=0;R.rows.forEach(r=>{if(r.cod)n2[r.cod]=(n2[r.cod]||0)+1;const o=r.cod&&vel[r.cod+"|"+n2[r.cod]];if(!o)return;mant++;["peso","desc","cat","sub","custo","custoAuto","q","gsel","csel","corOn","semG","mk","bo","on","vz","ex","obs","vp","cor","sel","open","catq","tipo","bh","forn","dsc","vinc","conjComp","conjOriginal","conjDesativado","feito","refaz","skip","lancIds","refs","qLanc","lancEm","corrigida","arq","aviso"].forEach(k=>{if(o[k]!==undefined)r[k]=clone(o[k])});if(o.feito)r.qtd=o.qtd});R._mant=mant}
  {const kids=(ROM.rows||[]).filter(x=>x.loteDe);if(kids.length){const old={};(ROM.rows||[]).forEach(x=>{if(x.lote&&x.cod)old[x.cod]=x});const out=[];R.rows.forEach(x=>{out.push(x);if(x.lote&&old[x.cod]){x.lid=old[x.cod].lid;kids.filter(k=>k.loteDe===x.lid).forEach(k=>out.push(k))}});R.rows=out}}
  {const ex=(ROM.rows||[]).filter(x=>x.extra);if(ex.length)R.rows=R.rows.concat(ex)}   /* peças criadas à mão no romaneio sobrevivem a uma nova leitura da lista */
  ROM.rows=R.rows;ROM.rows.forEach(romConjAuto);ROM.obs=R.obs||ROM.obs||"";ROM.conf=R.conf;ROM.msg=`${R.rows.length} peças lidas${R._mant?` · ${R._mant} com as suas edições mantidas`:""}`;romSalvarSoon();renderRom();{const pe=[...document.querySelectorAll('#romWrap [data-rp=peso]')].find(x=>!x.value);if(pe)pe.focus({preventScroll:true})}}
