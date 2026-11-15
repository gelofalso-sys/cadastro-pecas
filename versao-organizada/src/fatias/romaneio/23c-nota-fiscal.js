/* nf-inicio */
let NF=null;
function nfIdx(){try{return JSON.parse(lerPref(NFKEY)||"{}")||{}}catch(e){return {}}}
function nfIdxSet(ch,o){try{const i=nfIdx();i[ch]=o;gravarPref(NFKEY,JSON.stringify(i))}catch(e){}}
/* resultado igual para PDF e XML: números arredondados, código sem asterisco final */
/* PDF (DANFE): lê só o texto, com a posição de cada pedacinho, para separar código, descrição e valores por coluna */
async function nfPdfItens(f){checaTam(f,MAX_PDF_BYTES,"O PDF");const L=await carregarPdfJs();let doc;
  try{doc=await L.getDocument({data:new Uint8Array(await f.arrayBuffer()),isEvalSupported:false}).promise}catch(e){throw new Error(e&&e.name==="PasswordException"?"Esse PDF tem senha. Use o arquivo XML da nota.":"Não consegui abrir esse PDF. O arquivo pode estar com defeito.")}
  checaPaginas(doc);const its=[];for(let pg=1;pg<=doc.numPages;pg++){const tc=await (await doc.getPage(pg)).getTextContent();tc.items.forEach(it=>{const s=String(it.str||"").trim();if(s)its.push({pg,x:it.transform[4],y:it.transform[5],w:it.width||0,s})})}
  return its}
/* categoria pelas palavras da descrição, usando as categorias que já estão cadastradas */
function nfIniciar(nota){const forma={};nota.itens.forEach(i=>{if(i.cod){const s=nfForma(i.cod);forma[s]=(forma[s]||0)+1}});
  const ord=Object.entries(forma).sort((a,b)=>b[1]-a[1]),tot=ord.reduce((t,x)=>t+x[1],0),pad=ord.length&&ord[0][1]>=Math.max(2,tot*0.6)?ord[0][0]:"";
  const rows=nota.itens.map((it,i)=>{const ct=nfCatDe(it.desc),gen=[];
    if(/\b(DIVERS|VARIAD|VARIOS|VARIAS|MIST[OA]|KIT|SORTID|LOTE)/.test(nfU(it.desc)))gen.push("descrição genérica (vários modelos juntos)");
    if(!it.cod)gen.push("sem código do fornecedor");else if(pad&&nfForma(it.cod)!==pad)gen.push("código fora do padrão das outras peças");
    return {i,inc:true,cod:it.cod,desc:it.desc,cat:ct.cat,sub:ct.sub,qtd:it.qtd,vUn:it.vUn,vProd:it.vProd,vDesc:it.vDesc,ncm:it.ncm,cfop:it.cfop,un:it.un,gen,gmode:gen.length?"lote":"",gN:2,custoMan:""}});
  const ach=nfAcharForn(nota.emit);
  NF={nota,rows,liq:true,dup:null,dupOk:false,forn:ach.f?ach.f.nome:"__novo",fornPor:ach.por||"",novoNome:nfTitulo(nota.emit.nome)}}
const nfCusto=r=>{if(r.custoMan!=="")return num(r.custoMan);const q=Number(r.qtd)||0;if(NF.liq&&q>0)return ((r.vProd||r.vUn*q)-r.vDesc)/q;return r.vUn};
/* quantidade positiva nunca some: 0,4 kg vira 1 unidade com o custo do total da nota */
async function nfBuscaDup(ch){if(!ch)return null;const ix=nfIdx()[ch];if(ix)return {em:ix.em,n:ix.n,numero:ix.numero};
  if(S.lanc.some(l=>l.nfChave===ch))return {em:Date.now(),n:S.lanc.filter(l=>l.nfChave===ch).length};
  if(ROM&&ROM.rows.some(r=>r.nfChave===ch))return {rascunho:true};
  try{for(const k of ((await idbOp("tabs","readonly",st=>st.getAllKeys()))||[])){const r=await idbGet("tabs",k);if(r&&(r.lanc||[]).some(l=>l.nfChave===ch))return {em:r.em,tabela:r.nome}}
    for(const k of ((await idbOp("roms","readonly",st=>st.getAllKeys()))||[])){const r=await idbGet("roms",k);if(r&&(r.rows||[]).some(x=>x.nfChave===ch))return {rascunho:true}}}catch(e){}
  return null}
function nfOv(html){let el=document.getElementById("nfRev");if(!el){el=document.createElement("div");el.id="nfRev";el.className="rev nfm";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label","Importar nota fiscal");el.innerHTML='<div class="rev-c"></div>';document.body.appendChild(el)}
  const c=el.querySelector(".rev-c");if(html!=null)c.innerHTML=html;return el}
function nfFechar(){const el=document.getElementById("nfRev");if(el)el.remove();NF=null}
function nfErro(msg){nfOv(`<div class="rev-h"><b>Importar nota fiscal</b></div><div class="nf-body"><div class="nf-al bad" role="alert">${esc(msg)}</div></div><div class="rev-f"><label class="btn" style="cursor:pointer">Escolher outro arquivo<input type="file" id="nfFile" accept=".pdf,.xml,application/pdf,text/xml,application/xml" class="vh"></label><button type="button" class="btn pri" data-nfa="fechar">Fechar</button></div>`)}
async function nfAbrir(f,its){
  if(editId){avisoEdicao(()=>nfAbrir(f,its));return}
  const eXml=/xml/i.test(f.type)||/\.xml$/i.test(f.name),ePdf=/pdf/i.test(f.type)||/\.pdf$/i.test(f.name);
  if(!eXml&&!ePdf){nfErro("Esse arquivo não é uma nota fiscal. Escolha o PDF (DANFE) ou o XML da nota.");return}
  nfOv(`<div class="rev-h"><b>Importar nota fiscal</b></div><div class="nf-body"><p class="hint">Lendo a nota fiscal…</p></div>`);
  try{const nota=eXml?nfLerXml(await nfTextoXml(f)):nfPdfParse(its||await nfPdfItens(f));
    nfIniciar(nota);NF.arq=f;NF.dup=await nfBuscaDup(nota.chave);if(!nota.chave)NF.semChave=true;nfRender()}
  catch(e){nfErro(e&&e.message==="NAODANFE"?"Esse PDF não parece ser uma nota fiscal (DANFE). Se for um romaneio, use “Colar romaneio”. Se for uma nota, tente o arquivo XML dela.":(e&&e.message)||"Não consegui ler esse arquivo.")}}
async function nfRotear(f){if(!(await impPrepara(f)))return;return nfRotear0(f)}
async function nfRotear0(f){if(/xml/i.test(f.type+f.name))return nfAbrir(f);
  try{const its=await nfPdfItens(f);if(nfPareceDanfe(its))return nfAbrir(f,its)}catch(e){if(e&&e.lim){nfErro(e.message+". Divida o arquivo ou use o XML da nota.");return}}
  romPdf(f)}
function nfLinhas(){const out=[],N=NF.nota;
  NF.rows.forEach(r=>{if(!r.inc||r.gmode==="ignorar")return;const q=Number(r.qtd)||0,ci0=nfCusto(r),qr0=nfQtdInt(q),ci=(qr0>0&&qr0!==q&&ci0!=null)?r4(ci0*q/qr0):ci0,base={cod:r.cod,preco:r.vUn,precod:null,peso:"",q:{},skip:false,aviso:"",cat:r.cat,sub:r.sub,custo:String(r4(ci)).replace(".",","),nfChave:N.chave,nfNum:N.numero,nfForn:N.emit.nome,nfNcm:r.ncm,nfCfop:r.cfop,nfSemDesc:NF.liq};
    if(!r.cat){base.catq=true;base.aviso="· categoria não reconhecida: confira"}
    if(r.gmode==="dividir"){const n=Math.max(2,Math.min(Math.round(Number(r.gN)||2),Math.max(2,nfQtdInt(q))));let resto=nfQtdInt(q)%n;const b=Math.floor(nfQtdInt(q)/n);
      for(let k=0;k<n;k++){const qq=b+(resto-->0?1:0);if(qq>0)out.push({...base,desc:`${r.desc} (${k+1}/${n})`,qtd:qq,total:nfR2(ci*qq),aviso:base.aviso||"· lote dividido: confira cada peça"})}}
    else{const qq=nfQtdInt(q);if(qq>0)out.push({...base,desc:r.desc,qtd:qq,total:nfR2(ci*qq),aviso:base.aviso||(r.gmode==="lote"?"· lote misto lançado como 1 peça":(qq!==q?"· quantidade quebrada: ajustada e custo calculado com até quatro casas; confira o total antes de criar":""))})}});
  return out}
function nfCalc(){const N=NF.nota,t=N.totais,sP=nfR2(N.itens.reduce((a,i)=>a+i.vProd,0)),sD=nfR2(N.itens.reduce((a,i)=>a+i.vDesc,0)),lin=nfLinhas(),un=lin.reduce((a,l)=>a+l.qtd,0),custo=nfR2(lin.reduce((a,l)=>a+(num(l.custo)||0)*l.qtd,0));
  const esperado=nfR2(t.prod-t.desc+t.extra);return {sP,sD,lin,un,custo,esperado,okProd:t.prod>0&&Math.abs(sP-t.prod)<0.05,okDesc:Math.abs(sD-t.desc)<0.05,okNota:t.nota>0&&Math.abs(esperado-t.nota)<0.05}}
/* itens marcados para entrar, mas que ficam de fora por não terem quantidade positiva */
const nfDescartados=()=>NF.rows.filter(r=>r.inc&&r.gmode!=="ignorar"&&!(nfQtdInt(Number(r.qtd)||0)>0));
function nfResumo(){const el=document.getElementById("nfSum");if(!el||!NF)return;const t=NF.nota.totais,c=nfCalc(),dsc=nfDescartados(),sdesc=NF.rows.filter(r=>r.inc&&r.gmode!=="ignorar"&&!String(r.desc||"").trim()).length,ok=(b,m)=>`<span class="${b?"nf-ok":"nf-no"}">${b?"✓":"⚠"} ${m}</span>`;
  el.innerHTML=`<div class="nf-conf">${ok(c.okProd,t.prod>0?`Soma dos itens ${nfM(c.sP)} ${c.okProd?"= total dos produtos da nota":"≠ total dos produtos da nota ("+nfM(t.prod)+")"}`:`Não achei o total dos produtos na nota (soma dos itens: ${nfM(c.sP)})`)}
    ${ok(c.okDesc,`Desconto dos itens ${nfM(c.sD)} ${c.okDesc?"= desconto da nota":"≠ desconto da nota ("+nfM(t.desc)+")"}`)}
    ${ok(c.okNota,t.nota>0?`Total da nota ${nfM(t.nota)} ${c.okNota?"= produtos − desconto"+(t.extra?" + frete/outros":""):"≠ produtos − desconto ("+nfM(c.esperado)+"): pode haver frete, seguro ou impostos na nota"}`:"Não achei o total da nota")}</div>
    ${dsc.length?`<div class="nf-conf"><span class="nf-no">⚠ ${dsc.length} item(ns) da nota NÃO entram (quantidade zero, negativa ou vazia): ${esc(dsc.slice(0,5).map(r=>(r.cod||"sem código")+" "+String(r.desc||"").slice(0,25)).join("; "))}${dsc.length>5?"…":""}</span></div>`:""}${sdesc?`<div class="nf-conf"><span class="nf-no">⚠ ${sdesc} item(ns) sem descrição na nota: preencha antes de importar.</span></div>`:""}
    <div class="nf-vai"><b>${c.lin.length}</b> peça${c.lin.length===1?"":"s"} · <b>${c.un}</b> unidade${c.un===1?"":"s"} · custo total <b>${nfM(c.custo)}</b>${NF.liq?` (nota com desconto: ${nfM(nfR2(t.prod-t.desc))})`:""}</div>`;
  const b=document.getElementById("nfGo");if(b){b.textContent=c.lin.length?`Importar ${c.lin.length} peça${c.lin.length===1?"":"s"} para o romaneio`:"Nada para importar";b.disabled=!c.lin.length||!!(NF.dup&&!NF.dupOk);const ni=NF.rows.filter(r=>r.inc&&r.gmode!=="ignorar"&&(x=>x==null||x<0)(nfCusto(r))).length;let av=document.getElementById("nfAvCusto");if(ni){if(!av&&b&&b.parentElement){av=document.createElement("div");av.id="nfAvCusto";av.setAttribute("role","alert");av.style.cssText="color:#7a1c12;background:#fdecea;border:1px solid #c0392b;border-radius:8px;padding:6px 10px;margin-right:auto;font-size:13px";b.parentElement.insertBefore(av,b.parentElement.firstChild)}if(av)av.textContent=ni+" item(ns) marcado(s) com custo ausente ou inválido: pode estar defeito da nota. Corrija o custo ou, ao importar, escolha seguir com os dados como foram lidos."}else if(av)av.remove()}}
function nfRowHTML(r){const C=cfg(),cc=catBy(r.cat),ci=nfCusto(r),dec=r.vUn&&r.vDesc?Math.round(r.vDesc/(r.vProd||1)*100):0,av=[];
  if(!String(r.desc||"").trim())av.push("sem descrição: preencha antes de importar");
  if(!r.cat)av.push("categoria não reconhecida: escolha uma");
  if(Number(r.qtd)%1)av.push("quantidade quebrada: vai ser arredondada para "+nfQtdInt(Number(r.qtd))+"; o custo será ajustado com até quatro casas e o total precisa ser conferido");
  if(!(Number(r.qtd)>0))av.push("sem quantidade: este item NÃO será importado");
  const gen=r.gen.length?`<div class="nf-gen"><span class="nf-av">⚠ Atenção neste item: ${esc(r.gen.join("; "))}</span><label>O que fazer <select data-nf="gmode"><option value="lote"${r.gmode==="lote"?" selected":""}>Lançar como 1 peça (lote)</option><option value="dividir"${r.gmode==="dividir"?" selected":""}>Dividir em várias peças</option><option value="ignorar"${r.gmode==="ignorar"?" selected":""}>Ignorar este item</option></select></label>${r.gmode==="dividir"?`<label>Quantas peças <input class="n" data-nf="gN" value="${esc(r.gN)}" inputmode="numeric" style="width:60px"></label>`:""}</div>`:"";
  return `<div class="nf-r${r.inc&&r.gmode!=="ignorar"?"":" off"}" data-i="${r.i}">
    <label class="nf-inc" title="Marque para importar este item"><input type="checkbox" data-nf="inc"${r.inc?" checked":""} aria-label="Importar este item"></label>
    <label class="nf-f nf-cod"><small>Código do fornecedor</small><input data-nf="cod" value="${esc(r.cod)}" placeholder="sem código"></label>
    <label class="nf-f nf-des"><small>Descrição</small><input data-nf="desc" value="${esc(r.desc)}"></label>
    <label class="nf-f nf-cat"><small>Categoria</small><select data-nf="cat"><option value="">— escolha —</option>${C.categorias.map(c=>`<option${c.nome===r.cat?" selected":""}>${esc(c.nome)}</option>`).join("")}</select></label>
    <label class="nf-f nf-sub"><small>Subcategoria</small><select data-nf="sub"${cc&&cc.subs.length?"":" disabled"}><option value="">—</option>${cc?cc.subs.map(s=>`<option${s===r.sub?" selected":""}>${esc(s)}</option>`).join(""):""}</select></label>
    <label class="nf-f nf-qtd"><small>Qtd</small><input class="n" data-nf="qtd" value="${esc(String(r.qtd).replace(".",","))}" inputmode="decimal"></label>
    <label class="nf-f nf-cus"><small>Custo de cada (R$)</small><input class="n" data-nf="custo" value="${esc(virg(ci))}" inputmode="decimal"></label>
    <div class="nf-orig">Na nota: ${nfM(r.vUn)} cada${r.vDesc?` − desconto de ${nfM(r.vDesc)}${dec?` (${dec}%)`:""} no item`:" · sem desconto"} · NCM ${esc(r.ncm||"—")} · CFOP ${esc(r.cfop||"—")}</div>
    ${av.length?`<div class="nf-av">⚠ ${esc(av.join(" · "))}</div>`:""}${gen}</div>`}
function nfTopHTML(){const C=cfg();return `
<label class="nf-f"><small>Fornecedor ${NF.fornPor?`(achei pelo ${NF.fornPor})`:"(não achei no seu cadastro)"}</small><select data-nf="forn">${C.fornecedores.map(f=>`<option${f.nome===NF.forn?" selected":""}>${esc(f.nome)}</option>`).join("")}<option value="__novo"${NF.forn==="__novo"?" selected":""}>＋ Criar novo fornecedor…</option></select></label>
${NF.forn==="__novo"?`<label class="nf-f"><small>Nome do novo fornecedor</small><input data-nf="novoNome" value="${esc(NF.novoNome)}" maxlength="40"></label>`:""}
<label class="ck nf-liq" title="Ligado: o custo de cada peça já considera o desconto da nota. Desligado: usa o valor unitário da nota e aplica o desconto do fornecedor cadastrado."><input type="checkbox" data-nf="liq"${NF.liq?" checked":""}> Custo = valor da nota ÷ quantidade (já com o desconto)</label>`}
/* atualizações pontuais: não refazem a tela inteira, então o foco e a rolagem da lista ficam onde estão */
function nfFoco(sel){const e=document.querySelector("#nfRev "+sel);if(e)e.focus({preventScroll:true})}
function nfLinhaRefaz(i,foco){const old=document.querySelector(`#nfRev .nf-r[data-i="${i}"]`);if(!old||!NF)return;const tmp=document.createElement("div");tmp.innerHTML=nfRowHTML(NF.rows[i]);old.replaceWith(tmp.firstElementChild);if(foco)nfFoco(`.nf-r[data-i="${i}"] [data-nf="${foco}"]`)}
function nfCustosRefaz(){document.querySelectorAll("#nfRev .nf-r").forEach(row=>{const r=NF.rows[+row.dataset.i],c=row.querySelector('[data-nf="custo"]');if(r&&c&&r.custoMan===""&&document.activeElement!==c)c.value=virg(nfCusto(r))})}
function nfRender(){const el=nfOv();if(!NF){nfFechar();return}const N=NF.nota,C=cfg(),lst=el.querySelector(".nf-list"),st=lst?lst.scrollTop:0,d=NF.dup;
  const dupTxt=d?(d.rascunho?"Esta nota já está em um romaneio que você abriu ou guardou.":`Esta nota já foi importada${d.em?" em "+new Date(d.em).toLocaleDateString("pt-BR"):""}${d.n?` (${d.n} linha${d.n===1?"":"s"} na tabela)`:""}${d.tabela?` — está na tabela salva “${d.tabela}”`:""}.`):"";
  nfOv(`<div class="rev-h"><b>Importar nota fiscal</b><span class="hint">NF-e nº ${esc(N.numero)}${N.serie?" série "+esc(N.serie):""} · ${esc(N.emit.nome||"emitente não identificado")}${N.emit.cnpj?" · CNPJ "+esc(nfCnpj(N.emit.cnpj)):""}${N.emissao?" · emitida em "+esc(N.emissao):""}</span><button type="button" class="btn ghost sm" data-nfa="fechar" style="margin-left:auto">Fechar ×</button></div>
  <div class="nf-body">
    ${d?`<div class="nf-al bad" role="alert">⚠ ${esc(dupTxt)} Importar de novo cria as peças em duplicidade. <label class="ck vz"><input type="checkbox" data-nf="dupok"${NF.dupOk?" checked":""}> Importar de novo mesmo assim</label></div>`:""}
    ${NF.semChave?`<div class="nf-al">⚠ Não achei a chave de acesso da nota, então não dá para avisar se ela já foi importada antes.</div>`:""}
    <div class="nf-top">${nfTopHTML()}</div>
    <div id="nfSum" class="nf-sum" aria-live="polite"></div>
    <div class="nf-bar"><b>${N.itens.length} ite${N.itens.length===1?"m":"ns"} na nota</b><button type="button" class="btn sm" data-nfa="todos">Marcar todos</button><button type="button" class="btn sm" data-nfa="nenhum">Desmarcar todos</button><span class="hint">Depois de importar, você informa o peso (e os banhos, se tiver) na tela do romaneio. Sem foto e sem peso as peças ficam como pendências.</span></div>
    <div class="nf-list">${NF.rows.map(nfRowHTML).join("")}</div>
  </div>
  <div class="rev-f"><button type="button" class="btn" data-nfa="fechar">Cancelar</button><button type="button" class="btn pri big" id="nfGo" data-nfa="importar">Importar</button></div>`);
  const l2=document.querySelector("#nfRev .nf-list");if(l2)l2.scrollTop=st;nfResumo()}
function nfConfirmar(){if(!NF)return;const N=NF.nota;
  if(editId){avisoEdicao(()=>nfConfirmar());return}
  if(NF.dup&&!NF.dupOk){toast("Esta nota já foi importada. Marque “Importar de novo mesmo assim” se quiser repetir.");return}
  {const ni=NF.rows.filter(r=>r.inc&&r.gmode!=="ignorar"&&(x=>x==null||x<0)(nfCusto(r))).length;if(ni&&!confirm(ni+" item(ns) da nota estão com custo ausente ou inválido (a nota pode estar com defeito).\n\nOK = importar com os dados como foram lidos (esses itens ficam com custo R$ 0,00 para você corrigir depois)\nCancelar = voltar e corrigir o custo ou desmarcar o item"))return}
  const lin=nfLinhas();if(!lin.length){toast("Nenhum item marcado para importar.");return}
  {const original=nfR2(NF.rows.filter(r=>r.inc&&r.gmode!=="ignorar").reduce((t,r)=>t+(nfCusto(r)||0)*(Number(r.qtd)||0),0)),calculado=nfR2(lin.reduce((t,r)=>t+(num(r.custo)||0)*r.qtd,0));if(original!==calculado&&!confirm(`A conversão de quantidade e custo altera o total dos itens de R$ ${brl(original)} para R$ ${brl(calculado)} (diferença de R$ ${brl(Math.abs(original-calculado))}). Confira e ajuste os itens.

OK = importar com essa diferença; Cancelar = voltar e corrigir.`))return}
  if(((ROM&&ROM.rows&&ROM.rows.some(r=>!r.skip))||romTem)&&!confirm("Já existe um romaneio aberto ou guardado. Importar a nota vai trocar a lista dele. Continuar?"))return;
  const C=cfg();let nome=NF.forn;
  if(nome==="__novo"){nome=(NF.novoNome||"").trim()||("Fornecedor da nota "+N.numero);if(!fornBy(nome))C.fornecedores.push({nome,desconto:"0",tipo:"pronta",banhista:"",codigo:"",cnpj:N.emit.cnpj});else{const f0=fornBy(nome);if(!f0.cnpj&&N.emit.cnpj)f0.cnpj=N.emit.cnpj}salvar(true,false)}
  else{const fo=fornBy(nome);if(fo&&!fo.cnpj&&N.emit.cnpj){fo.cnpj=N.emit.cnpj;salvar(true,false)}}
  ROM={tid:abertos.romT&&C.romaneios.some(x=>x.id===abertos.romT)?abertos.romT:C.romaneios[0].id,texto:"",rows:[],obs:"",conf:"",msg:""};romSetForn(nome);
  lin.forEach(r=>{r.mk={};r.bo={};r.on={};r.vz={};r.ex={};{const nc=String(r.nfNcm||"").replace(/\D/g,""),cf=String(r.nfCfop||"").replace(/\D/g,"");if(nc.length===8)r.ex.Y=nc;if(cf.length===4)r.ex.AA=cf}romNovaCat(r);if(r.cod&&S.lanc.some(l=>String(l.v.G||"")===r.cod&&(l.v.H||"")===(S.form.v.H||""))){r.skip=true;r.aviso="· já lançada"}});
  const c=nfCalc();ROM.doc=(NF.arq&&NF.arq.name)||"";ROM.hash=(NF.arq&&IMPH.get(NF.arq))||"";ROM.rows=lin;ROM.obs=`NF ${N.numero}${N.emit.nome?" · "+N.emit.nome:""}`;
  {const nImp=NF.rows.filter(r=>r.inc&&r.gmode!=="ignorar").length,nTot=N.itens.length;ROM.conf=c.okProd?(nImp===nTot?`✓ ${nTot} itens conferem com a nota (${nfM(c.sP)})`:`✓ a nota confere (${nTot} itens somam ${nfM(c.sP)}); você está importando só ${nImp} de ${nTot} itens`):`⚠ a soma dos itens (${nfM(c.sP)}) não bate com o total dos produtos da nota (${nfM(N.totais.prod)})`}
  ROM.msg=`${lin.length} peça${lin.length===1?"":"s"} importada${lin.length===1?"":"s"} da nota ${N.numero}. Falta informar o peso (e os banhos).`;
  nfFechar();romSalvarSoon();renderRom();const w=document.getElementById("romWrap");if(w)rolarPane(w);toast(ROM.msg)}
/* a chave da nota fica guardada junto das peças criadas (e num índice), para avisar se a mesma nota for importada outra vez */
{const romCriarBase=romCriar;let ocupado=false;romCriar=async function(){if(ocupado){toast("Aguarde a conferência e criação em andamento.");return}ocupado=true;try{const r0=ROM&&ROM.rows.find(r=>r.nfChave&&!r.skip),m=r0&&{chave:r0.nfChave,numero:r0.nfNum,forn:r0.nfForn},antes=new Set(S.lanc.map(l=>l.id));
  await romCriarBase.apply(this,arguments);
  if(m){const nv=S.lanc.filter(l=>!antes.has(l.id));if(nv.length){nv.forEach(l=>{l.nfChave=m.chave;l.nfNum=m.numero});nfIdxSet(m.chave,{em:Date.now(),n:nv.length,numero:m.numero,forn:m.forn});salvar(false)}}}catch(e){console.error(e);toast("Não foi possível concluir a criação. Confira a tabela antes de tentar novamente.")}finally{ocupado=false}}}
document.addEventListener("change",e=>{const t=e.target;if(!t)return;
  if(t.id==="nfFile"){const f=t.files&&t.files[0];t.value="";if(f)nfAbrir(f);return}
  if(!NF||!t.closest||!t.closest("#nfRev")||!t.dataset.nf)return;const k=t.dataset.nf,row=t.closest("[data-i]"),r=row?NF.rows[+row.dataset.i]:null;
  NF.dirty=true;
  if(k==="liq"){NF.liq=t.checked;nfCustosRefaz();nfResumo()}else if(k==="dupok"){NF.dupOk=t.checked;nfResumo()}else if(k==="forn"){NF.forn=t.value;const tp=document.querySelector("#nfRev .nf-top");if(tp){tp.innerHTML=nfTopHTML();nfFoco('[data-nf="forn"]')}nfResumo()}
  else if(r&&k==="inc"){r.inc=t.checked;row.classList.toggle("off",!(r.inc&&r.gmode!=="ignorar"));nfResumo()}else if(r&&k==="cat"){r.cat=t.value;r.sub="";nfLinhaRefaz(r.i,"cat");nfResumo()}else if(r&&k==="sub"){r.sub=t.value}
  else if(r&&k==="gmode"){r.gmode=t.value;nfLinhaRefaz(r.i,"gmode");nfResumo()}});
document.addEventListener("input",e=>{const t=e.target;if(!NF||!t||!t.closest||!t.closest("#nfRev")||!t.dataset.nf)return;NF.dirty=true;const k=t.dataset.nf,row=t.closest("[data-i]"),r=row?NF.rows[+row.dataset.i]:null;
  if(k==="novoNome")NF.novoNome=t.value;else if(r){if(k==="cod")r.cod=t.value;else if(k==="desc")r.desc=t.value;else if(k==="gN")r.gN=t.value;
    else if(k==="qtd"){const v=num(t.value);r.qtd=v==null?0:v;if(r.custoMan==="")row.querySelector('[data-nf="custo"]').value=virg(nfCusto(r))}
    else if(k==="custo")r.custoMan=vazio(t.value)?"":t.value}
  nfResumo()});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-nfa]");if(!b)return;const a=b.dataset.nfa;
  if(a==="fechar")nfFechar();else if(a==="importar")nfConfirmar();else if((a==="todos"||a==="nenhum")&&NF){NF.dirty=true;NF.rows.forEach(r=>{r.inc=a==="todos"});document.querySelectorAll("#nfRev .nf-r").forEach(row=>{const r=NF.rows[+row.dataset.i],c=row.querySelector('[data-nf="inc"]');if(c)c.checked=r.inc;row.classList.toggle("off",!(r.inc&&r.gmode!=="ignorar"))});nfResumo()}});
window.__nf={parsePdf:nfPdfParse,lerXml:nfLerXml,pdfItens:nfPdfItens,cat:nfCatDe};
