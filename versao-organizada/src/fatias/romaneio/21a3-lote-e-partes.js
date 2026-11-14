const romLoteKids=r=>ROM.rows.filter(x=>x.loteDe===r.lid);
/* peso "real": o que você pesa sem o insumo que a galvânica pesa junto. O valor do lote não muda; o valor por grama sobe porque o peso caiu */
function romLoteResumo(r){const kids=romLoteKids(r);let w=0,v=0;kids.forEach(x=>{const p=num(x.peso);if(p>0)w+=p;v+=r2c(num(x.custo)||0)});
  if(r.semPeso){const tt=r.total!=null?r.total:0,ok=kids.length&&Math.round(v*100)===Math.round(tt*100);return {cls:kids.length?(ok?"ok":"warn"):"warn",dif:0,taxa:0,txt:kids.length?`${kids.length} item(ns) numerados 1/${kids.length}${w>0?` · ${g3(w)} g informados · R$ ${brl(w>0?v/w:0)}/g em média`:" · sem pesos ainda: o valor está dividido igualmente"} · valor dos itens R$ ${brl(v)} de R$ ${brl(tt)}${ok?"":" — só um alerta"}`:"Nenhum item ainda: adicione os itens do lote."}}
  const real=romLoteReal(r),ref=real!=null?real:(r.loteG||0),dif=Math.round((ref-w)*1000)/1000,tot=r.total!=null?r.total:(r.loteG||0)*(r.precoG||0),taxa=romLoteTaxa(r,w),rs=x=>String(Math.round(x*10000)/10000).replace(".",","),
    nome=real!=null?`peso real ${g3(real)} g`:`peso do lote ${g3(r.loteG)} g`;let cls,txt;
  if(!kids.length){cls="warn";txt="Nenhum item ainda: pese as peças e adicione cada uma abaixo."}
  else if(dif===0&&Math.round(v*100)!==Math.round(tot*100)){cls="warn";txt=`o peso fecha (${g3(w)} g), mas há diferença de R$ ${brl(Math.abs(r2c(v)-r2c(tot)))}: os itens somam R$ ${brl(v)} e o lote custou R$ ${brl(tot)}. Confira e ajuste os custos dos itens.`}
  else if(real==null){cls="ok";txt=`${g3(w)} g informados até agora (a lista diz ${g3(r.loteG)} g; a diferença é normal quando o insumo pesa junto)`}   /* sem peso real: o valor por grama é fluido, recalculado a cada item */
  else if(dif===0){cls="ok";txt=`✓ a soma bate: ${g3(w)} g de ${g3(ref)} g (${nome})`}
  else if(dif>0){cls="warn";txt=`faltam ${g3(dif)} g para fechar o ${nome} (${g3(w)} g de ${g3(ref)} g) — só um alerta`}
  else{cls="warn";txt=`os pesos informados somam ${g3(w)} g, ${g3(-dif)} g a mais que o ${nome} — só um alerta`}
  const difTaxa=Math.abs(taxa-(r.precoG||0))>0.00005;
  return {cls,dif,taxa,txt:`${txt} · valor por grama ${r.ratear!==false&&taxa>0?`${real==null?"até agora":"real"} R$ ${rs(taxa)}/g${difTaxa?` (a lista dizia R$ ${rs(r.precoG||0)}/g${real==null?"; muda a cada item que você pesa":""})`:""}`:`da lista R$ ${rs(r.precoG||0)}/g`} · ${kids.length} item(ns) · valor dos itens R$ ${brl(v)} de R$ ${brl(tot)}`}}
function romLoteHTML(r,i){const R=romLoteResumo(r),tot=r.total!=null?r.total:(r.loteG||0)*(r.precoG||0);
  return `<div class="rc lote" data-i="${i}"><div class="lote-h"><b>${r.semPeso?"Lote":"Lote por peso"} · ${esc(r.cod||"")} ${esc(r.desc)}</b>${r.semPeso?`<span>valor do lote <b>R$ ${brl(tot)}</b></span>`:`<span>${g3(r.loteG)} g × R$ ${String(Math.round((r.precoG||0)*10000)/10000).replace(".",",")}/g = <b>R$ ${brl(tot)}</b></span>`}<button type="button" class="x" data-act="rom-lote-off" data-i="${i}" title="Desativa o lote: volta a ser um cartão comum (os itens do lote são removidos)">desativar lote</button></div>
    <p class="hint">${r.semPeso?"Cada item abaixo é uma peça separada, numerada 1/N, 2/N… Pese cada uma: o valor do lote é repartido pelo peso informado (sem pesos, divide igual). ":"O fornecedor vendeu este lote por peso, sem separar as peças. "} Pese cada peça e adicione-a aqui: o custo de cada uma é o peso × o valor da grama, e depois entra o fator. Confira se a soma dos pesos fecha com o lote.</p>
    ${r.semPeso?"":`<div class="row"><label class="fq" title="Peso que você mede, sem o insumo que a galvânica pesa junto. O valor do lote não muda: o valor por grama sobe porque o peso caiu."><span>Peso real do lote (g) — opcional</span><input class="n" data-rp="lotpr" value="${esc(r.pesoReal||"")}" placeholder="${g3(r.loteG).replace(",000","")} (lista)" inputmode="decimal" style="width:120px" aria-label="Peso real do lote em gramas, sem insumo"></label><span class="hint">Pode deixar vazio: o valor por grama é recalculado a cada item que você pesa (valor do lote ÷ soma dos pesos), até o último item fechar o lote em R$ ${brl(tot)}. Só preencha se já souber o peso final e quiser fixar o valor da grama.</span></div>`}
    <label class="vchk"><input type="checkbox" data-rp="lotrat" ${r.ratear!==false?"checked":""}> Ratear o valor do lote (R$ ${brl(tot)}) pelo peso que eu informar em cada item</label>
    <div class="row"><label class="fq"><span>Quantos itens?</span><input class="n" data-lotn value="1" inputmode="numeric" style="width:64px"></label><button type="button" class="btn pri sm" data-act="lote-add" data-i="${i}">＋ Adicionar itens</button><button type="button" class="btn sm" data-act="lote-resto" data-i="${i}" title="Cria um item com o peso que falta para fechar o lote">＋ Item com o que falta</button></div>
    <div class="lote-sum ${R.cls}" data-lsum="${esc(r.lid)}" role="status">${esc(R.txt)}</div></div>`}
function romLoteAtualiza(lot){const el=document.querySelector(`#romWrap [data-lsum="${CSS.escape(lot.lid)}"]`);if(!el)return;const R=romLoteResumo(lot);el.className="lote-sum "+R.cls;el.textContent=R.txt}
/* o valor do lote é o que o fornecedor cobrou: ele é repartido pelo peso que você informou em cada item (centavos exatos), mesmo que a soma dos pesos difira do peso da lista */
function romLoteRecalc(lot){
  if(!lot)return;const kids=romLoteKids(lot),tot=lot.total!=null?lot.total:(lot.loteG||0)*(lot.precoG||0),ws=kids.map(k=>{const p=num(k.peso);return p>0?p:0}),W=ws.reduce((a,b)=>a+b,0),real=romLoteReal(lot);
  if(lot.ratear!==false&&tot>0&&(real!=null?real:W)>0&&W>0){
    if(real==null||Math.abs(W-real)<0.0005){   /* lote fechado: os centavos fecham exatamente no valor do lote */
      const cents=Math.round(tot*100),raw=ws.map(w=>cents*w/W),base=raw.map(Math.floor);let rest=cents-base.reduce((a,b)=>a+b,0);
      raw.map((x,i)=>[x-Math.floor(x),i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(rest>0&&ws[i]>0){base[i]++;rest--}});
      kids.forEach((k,i)=>{k.custo=ws[i]>0?virg(base[i]/100):""})}
    else{const taxa=tot/real;kids.forEach((k,i)=>{k.custo=ws[i]>0?virg(r2c(ws[i]*taxa)):""})}}   /* lote ainda aberto: cada item custa peso × valor por grama real */
  else if(lot.semPeso&&W===0&&tot>0&&kids.length){const cents=Math.round(tot*100),b0=Math.floor(cents/kids.length);let rest=cents-b0*kids.length;kids.forEach(k=>{k.custo=virg((b0+(rest-->0?1:0))/100)})}   /* lote sem peso: divide igual até pesar */
  else kids.forEach((k,i)=>{k.custo=ws[i]>0&&lot.precoG!=null?virg(ws[i]*lot.precoG):""});
  kids.forEach(k=>{const rc=document.querySelector(`#romWrap .rc[data-i="${ROM.rows.indexOf(k)}"]`),ci=rc&&rc.querySelector('[data-rp="custo"]');if(ci&&document.activeElement!==ci)ci.value=k.custo});
  romLoteAtualiza(lot)}
function romLotePeso(r,rc){const lot=ROM.rows.find(x=>x.lote&&x.lid===r.loteDe);if(lot)romLoteRecalc(lot);else{const w=num(r.peso);r.custo=w>0&&r.precoG!=null?virg(w*r.precoG):"";const ci=rc&&rc.querySelector('[data-rp="custo"]');if(ci)ci.value=r.custo}}
function romLoteAdd(r,n,peso){let pos=ROM.rows.indexOf(r);ROM.rows.forEach((x,j)=>{if(x.loteDe===r.lid)pos=j});const f=S.form,novos=[],k0=romLoteKids(r).length;
  for(let q=0;q<n;q++){const x={cod:(r.cod||"")+"-"+(k0+q+1),desc:r.desc||"",preco:r.precoG,precod:null,total:null,qtd:1,peso:peso!=null?g3(peso):"",q:{},skip:false,aviso:r.catq?"· categoria não reconhecida: confira":"",catq:!!r.catq,cat:r.cat||f.v.I||"",sub:r.sub||"",loteDe:r.lid,precoG:r.precoG,custo:peso!=null?virg(peso*r.precoG):""};
    x.mk={};x.bo={};x.on={};x.vz={};x.ex={};romNovaCat(x);novos.push(x)}
  ROM.rows.splice(pos+1,0,...novos);romLoteRecalc(r);romSalvarSoon();renderRom()}
/* ===== partir um item em partes (ex.: um trio em 3 pares): o custo do item é repartido (centavos exatos) e cada parte vira um cartão com cópia dos banhos/quantidades ===== */
const romPartes=r=>ROM.rows.filter(x=>x.parteG&&x.parteG===r.parteG);
function romPartir(r,n){n=Math.trunc(n);if(!(n>=2&&n<=12)){toast("Escolha de 2 a 12 partes.");return}
  if(Array.isArray(r.conjComp)){toast("Para dividir este item, desfaça o conjunto e configure os componentes de cada parte separadamente.");return}
  if(r.lote||r.parteG||r.arq){toast(r.arq?"Restaure a tabela salva antes de dividir esta peça.":"Este item já é uma parte ou um lote: use “juntar” antes de partir de novo.");return}
  if(num(r.peso)>0&&Math.round(num(r.peso)*1000)<n){toast("O peso é pequeno demais para dividir em partes de 0,001 g.");return}
  const c=num(r.custo),cents=c!=null&&c>=0?Math.round(c*100):null,base=cents!=null?Math.floor(cents/n):null,extra=cents!=null?cents-base*n:0,gid=uid(),pos=ROM.rows.indexOf(r),novos=[];
  r.parteG=gid;r.parteN=n;r.parteK=1;r.parteCusto0=r.custo;r.parteCod0=r.cod;r.parteDesc0=r.desc;r.partePeso0=r.peso;r.parteRefaz0=!!r.refaz;r.parteSkip0=!!r.skip;if(r.feito){r.refaz=true;r.skip=false}
  for(let k=2;k<=n;k++){const x=clone(r);x.lancIds=undefined;x.feito=false;x.refaz=false;x.sel=false;x.open=false;x.bo={};x.vp="";x.parteK=k;novos.push(x)}
  const mg=num(r.partePeso0)>0?Math.round(num(r.partePeso0)*1000):null;
  [r,...novos].forEach((x,i)=>{const k=i+1;x.parteK=k;x.cod=(r.parteCod0||"")+"-"+k;x.desc=(r.parteDesc0||"")+" ("+k+"/"+n+")";if(mg!=null)x.peso=g3((Math.floor(mg/n)+(i<mg%n?1:0))/1000);if(cents!=null)x.custo=virg((base+(k<=extra?1:0))/100)});
  ROM.rows.splice(pos+1,0,...novos);romSalvarSoon();renderRom();toast(`Item dividido em ${n} partes: o custo foi repartido (${n} × quantidade da lista).`)}
function romJuntar(r){const ps=romPartes(r);if(ps.some(x=>x.feito&&!(x.parteK===1&&x.refaz))){toast("Uma das partes já foi lançada. Revogue as partes novas antes de juntar.");return}
  const p1=ps.find(x=>x.parteK===1)||ps[0];p1.custo=p1.parteCusto0;p1.peso=p1.partePeso0;p1.cod=p1.parteCod0;p1.desc=p1.parteDesc0;if(p1.feito){p1.refaz=!!p1.parteRefaz0;p1.skip=!!p1.parteSkip0;p1.aviso=p1.skip?"· já lançada":""}["parteG","parteN","parteK","parteCusto0","parteCod0","parteDesc0","partePeso0","parteRefaz0","parteSkip0"].forEach(k=>{delete p1[k]});
  ROM.rows=ROM.rows.filter(x=>!(ps.includes(x)&&x!==p1));romSalvarSoon();renderRom()}
function romParteTag(r){if(!r.parteG)return "";const ps=romPartes(r),s=ps.reduce((t,x)=>t+(num(x.custo)||0),0),o=num(r.parteCusto0);
  return `<span class="rch" title="Item partido: o custo do item foi repartido entre as partes (edite o custo de cada uma se quiser)">Parte ${r.parteK}/${r.parteN} · partes somam R$ ${brl(s)}${o!=null?" de R$ "+brl(o):""} <button type="button" class="x" data-act="rom-juntar" title="Desfazer a divisão e voltar a um só item">juntar</button></span>`}
function romLoteDecora(){if(!ROM)return;const cs=document.querySelectorAll("#romWrap .rc[data-i]");cs.forEach(c=>{const r=ROM.rows[+c.dataset.i];if(!r||!r.loteDe||c.querySelector(".lote-tag"))return;const lot=ROM.rows.find(x=>x.lote&&x.lid===r.loteDe);
  c.insertAdjacentHTML("afterbegin",`<div class="lote-tag"><span class="lote-num" title="Posição deste item no lote">${lot?romLoteKids(lot).indexOf(r)+1:"?"}/${lot?romLoteKids(lot).length:"?"}</span><span>Item do lote ${esc(lot?lot.cod:"")} · ${lot&&lot.ratear!==false?"valor do lote rateado pelo peso":"custo = peso × R$ "+String(Math.round((r.precoG||0)*10000)/10000).replace(".",",")+"/g"}</span><button type="button" class="x" data-act="lote-del" data-i="${c.dataset.i}" aria-label="Remover este item do lote">×</button></div>`)})}
/* Conserva quantidades compatíveis ao trocar categoria de uma parte; exige confirmação para descartar distribuições incompatíveis. */
function romTrocarCategoria(r,cat,sub){if(r.cat===cat&&(r.sub||"")===(sub||""))return true;
  const oldq=clone(r.q||{}),novo={...clone(r),cat,sub:sub||""};
  if(romTemVar(r.cat,r.sub)||romTemVar(novo.cat,novo.sub)){romNovaCat(novo);
    const valid=new Set(romKeys(novo,romColsR(novo))),incomp=Object.keys(oldq).filter(k=>!valid.has(k)&&!vazio(oldq[k])&&(num(oldq[k])||0)>0);
    if(incomp.length&&!confirm("A nova categoria tem variações diferentes. As quantidades incompatíveis serão removidas; confira a distribuição após trocar. Continuar?"))return false;
    Object.entries(oldq).forEach(([k,v])=>{if(valid.has(k))novo.q[k]=v});
    r.gsel=novo.gsel;r.csel=novo.csel;r.semG=novo.semG;r.q=novo.q;r.open=novo.open}
  {const cn=catBy(cat);if(cn&&cn.semBanho){if(!r.sb){r.sb=true;r.tipoAntes=r.tipo;r.q={}}r.tipo="pronta"}else if(r.sb){r.sb=false;if(r.tipoAntes)r.tipo=r.tipoAntes;else delete r.tipo;r.q={}}}
  r.cat=novo.cat;r.sub=novo.sub;romCompraGrama(r);return true}
