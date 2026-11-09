/* ===== fotos com link (imgbb): o sistema de destino pede um endereço público da foto ===== */
const fotoKey=()=>{try{return (localStorage.getItem("cadpecas-imgbb")||"").trim()}catch(e){return ""}};
/* envio automático: com a chave do imgbb guardada, a foto anexada já sobe e o link entra na coluna Foto (pode ser desligado em Cadastros › Fotos) */
const fotoAuto=()=>{try{return localStorage.getItem("cadpecas-imgbb-auto")!=="0"}catch(e){return true}};
const autoEnviar=ids=>{if(fotoKey()&&fotoAuto()&&ids&&ids.length)enviarFotos(ids)};
/* testa a chave: envia uma imagem de 1 pixel que o imgbb apaga sozinho em 60 segundos */
async function testarChaveImgbb(){const key=fotoKey();if(!key){toast("Cole a chave do imgbb primeiro.");return}
  toast("Testando a chave…");
  try{const c=document.createElement("canvas");c.width=c.height=1;const b=await new Promise(r=>c.toBlob(r,"image/png")),fd=new FormData();fd.append("key",key);fd.append("expiration","60");fd.append("image",b,"teste.png");
    const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),20000);let r,j;try{r=await fetch("https://api.imgbb.com/1/upload",{method:"POST",body:fd,signal:ac.signal});j=await r.json().catch(()=>null)}finally{clearTimeout(tm)}
    if(r.ok&&j&&j.success)toast("Chave OK: o envio de fotos para o imgbb está funcionando.");
    else toast(j&&j.error&&j.error.code===100?"O imgbb não reconheceu essa chave. Copie de novo em api.imgbb.com.":"O imgbb recusou o teste: "+((j&&j.error&&j.error.message)||r.status))}
  catch(e){toast(e&&e.name==="AbortError"?"O imgbb não respondeu em 20 segundos. Tente de novo.":"Não consegui falar com o imgbb (internet ou bloqueio do navegador).")}}
async function fotoReduzida(src,max){
  const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error("foto ilegível"));i.src=src});
  const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight,1)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));
  const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.imageSmoothingQuality="high";x.drawImage(im,0,0,c.width,c.height);
  return new Promise(ok=>c.toBlob(ok,"image/jpeg",0.85))}
async function enviarFoto(l){const key=fotoKey();if(!key)throw new Error("falta a chave do imgbb");
  const src=await idbGet("fotos",l.id);if(typeof src!=="string"||!/^data:image\//.test(src))throw new Error(l.ft?"a foto original não está mais guardada neste aparelho (só a miniatura); anexe a foto de novo":"a peça não tem foto");
  const blob=await fotoReduzida(src,1200);if(!blob)throw new Error("não consegui preparar a foto");
  const nome=String(((G&&G.refs[l.id])||[])[0]||l.id).replace(/[^A-Za-z0-9_-]/g,"-"),fd=new FormData();fd.append("image",blob,nome+".jpg");fd.append("name",nome);
  /* a chave vai no corpo do envio (não no endereço da requisição, que fica em históricos e registros); sem resposta em 30 s, desiste */
  fd.append("key",key);
  let r,j;
  const envia=async fin=>{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),30000);
    try{r=await fetch("https://api.imgbb.com/1/upload"+fin,{method:"POST",body:fd,signal:ac.signal});j=await r.json().catch(()=>null)}
    catch(e){throw new Error(e&&e.name==="AbortError"?"o imgbb demorou mais de 30 segundos para responder":"não consegui falar com o imgbb (internet ou bloqueio do navegador)")}
    finally{clearTimeout(tm)}};
  await envia("");
  if(!r.ok||!j||!j.success||!j.data||!j.data.url)throw new Error((j&&j.error&&j.error.message)||"o imgbb recusou a foto ("+r.status+")");
  const u=String(j.data.url);if(!/^https:\/\/[^\s"'<>]+$/.test(u))throw new Error("o imgbb devolveu um link estranho");return u}
let fotosEnv=false;
async function enviarFotos(soIds){if(fotosEnv)return;
  if(!fotoKey()){if(!Array.isArray(soIds)){toast("Cole a chave do imgbb em Cadastros › Fotos (link).");irPara("foto")}return}
  const ls=S.lanc.filter(l=>l.ft&&vazio(l.v.B)&&(!Array.isArray(soIds)||soIds.includes(l.id)));if(!ls.length){if(!Array.isArray(soIds))toast("Nenhuma foto esperando link.");return}
  fotosEnv=true;let ok=0,falhas=0,sumiu=0,trocou=0,erro=null,chaveRuim=false;
  try{for(let i=0;i<ls.length;i++){toast(`Enviando foto ${i+1} de ${ls.length}…`);
    try{const ft0=ls[i].ft,u=await enviarFoto(ls[i]);
      /* a peça pode ter sido excluída (ou já ganhado link) durante o envio: só grava se ainda existe e continua sem link */
      const viva=S.lanc.find(x=>x.id===ls[i].id);if(!viva){sumiu++;continue}if(viva.ft!==ft0){trocou++;continue}   /* sumiu ou a foto foi trocada durante o envio: o link seria da foto antiga */
      if(!vazio(viva.v.B))continue;
      viva.v.B=u;ok++;salvar(false)}
    catch(e){falhas++;erro=(e&&e.message)||"erro desconhecido";if(/chave|key|autoriz|unauthor/i.test(erro)&&!/memória/i.test(erro)){chaveRuim=true;break}}}}   /* chave errada falharia em todas: aí sim para */
  finally{fotosEnv=false}
  renderTopo();
  const resumo=`${ok} foto(s) com link${falhas?` · ${falhas} falharam (último erro: ${String(erro).replace(/[.\s]+$/,"")}${chaveRuim?" — parei porque a chave parece errada":""})`:""}${sumiu?` · ${sumiu} peça(s) excluída(s) durante o envio`:""}${trocou?` · ${trocou} peça(s) com a foto trocada durante o envio (o link seria da foto antiga; envie de novo)`:""}.`;
  toast(falhas||sumiu?resumo+" Clique em enviar de novo para tentar as que faltam.":`${ok} foto(s) com link: já estão na coluna Foto.`)}
function romCriar(){const f=S.form;if(editId){toast("Termine ou cancele a edição antes.");return}
  if(romConflito){toast("Outra aba alterou este romaneio. Use “Recarregar” ou “Manter esta aba” no aviso amarelo antes de criar as peças.");return}
  romCriando=true;setTimeout(()=>{romCriando=false},0);   /* durante a criação o romaneio não é ressincronizado com a tabela */
  const snap=clone(f),feitas=[],ign=[];let sem=0,err=0,un=0,ultErro="";const naLista=ROM.rows.filter(r=>!r.skip).reduce((t,r)=>t+r.qtd,0);
  ROM.rows.forEach(r=>{if(r.skip){if(!(r.feito&&!r.refaz))ign.push({desc:r.desc,cod:r.cod,motivo:r.aviso?String(r.aviso).replace("· ",""):"desmarcada"});return}
    S.form=clone(snap);const {f:f2,q}=romForm(r);if(!q.length){sem++;ign.push({desc:r.desc,cod:r.cod,motivo:"sem quantidade"});return}
    S.form=f2;let pos=-1,velhos=null;if(r.refaz&&r.lancIds&&r.lancIds.length){pos=S.lanc.findIndex(l=>l.id===r.lancIds[0]);if(pos>=0&&romPrefDe(S.lanc[pos])!==prefDe(f2.v.I||"",f2.v.J))romFixaRefs(S.lanc,pos,romPrefDe(S.lanc[pos]),r.lancIds,false);velhos=S.lanc.filter(l=>r.lancIds.includes(l.id));S.lanc=S.lanc.filter(l=>!r.lancIds.includes(l.id))}
    if(adicionar(false,true)){const nl=S.lanc[S.lanc.length-1];if(pos>=0&&velhos&&velhos[0]&&romPrefDe(velhos[0])===romPrefDe(nl)){S.lanc.pop();S.lanc.splice(Math.min(pos,S.lanc.length),0,nl)}feitas.push({r,id:nl.id});un+=q.reduce((t,x)=>t+x[1],0)}else{if(velhos)S.lanc.splice(Math.max(0,pos),0,...velhos);err++;ultErro=erro||ultErro;ign.push({desc:r.desc,cod:r.cod,motivo:"erro ao criar"+(erro?": "+erro:"")})}});
  S.form=snap;erro="";
  if(!feitas.length){renderRom();renderForm();toast("Nenhuma peça foi criada"+(ultErro?": "+ultErro:sem?" (nenhuma tem quantidade)":"")+". O romaneio continua aberto para você corrigir.");return}
  const ids=feitas.map(x=>x.id);
  const meta={forn:snap.v.H||"",banhista:snap.tipo==="bruta"?banhistaBy(snap.banhista).nome:"",tipo:snap.tipo,obs:ROM.obs||"",modelo:(romT()||{}).nome||"",conf:ROM.conf||"",naLista,un};
  {const g2=gerar(),corr=feitas.filter(({r})=>r.refaz).length;
  feitas.forEach(({r,id})=>{const ls=g2.linhas.filter(x=>x.lancId===id);r.corrigida=!!r.refaz;r.refs=ls.map(x=>x.v.E).join(", ");r.qLanc=ls.reduce((t,x)=>t+(num(x.v.W)||0),0);r.lancEm=Date.now();r.tipo=romTipo(r);r.bh=romBh(r).id;r.lancIds=[id];r.feito=true;r.refaz=false;r.skip=true;r.aviso="· já lançada";if(r.foto)idbPut("fotos",id,r.foto)});
  if(feitas.length)ROM.log=(ROM.log||[]).concat([{em:Date.now(),por:AUTOR,acao:`Lançou ${feitas.length-corr} peça(s) nova(s)${corr?` e corrigiu ${corr}`:""} · ${un} unidades`}])}
  romGravarBig();
  ROM=null;romLimparRascunho();renderRom();salvar(false);renderTopo();renderForm();if(ids.length)mostrarNoFim(ids[ids.length-1]);
  toast(`${feitas.length} peça(s) criada(s) · ${un} de ${naLista} unidades${un<naLista?` (${naLista-un} ficaram de fora)`:""}${sem?` · ${sem} sem quantidade`:""}${err?` · ${err} com erro`:""}.`,ids.length?{t:"Desfazer",fn:desfazer}:null);
  if(feitas.length)relGerar(feitas,ign,meta)}
/* nf-inicio */
const nfU=s=>semAc(s).toUpperCase(),nfR2=n=>Math.round((Number(n)||0)*100)/100,NFKEY="cadpecas-nf";
const nfCnpj=d=>{d=String(d||"").replace(/\D/g,"");return d.length===14?d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,"$1.$2.$3/$4-$5"):d};
const nfTitulo=s=>String(s||"").toLowerCase().replace(/(^|\s)(\S)/g,(m,a,b)=>a+b.toUpperCase()).slice(0,40).trim();
const nfData=s=>{const m=String(s||"").match(/(\d{4})-(\d{2})-(\d{2})/);return m?m[3]+"/"+m[2]+"/"+m[1]:String(s||"")};
const nfM=n=>n==null?"—":"R$ "+brl(n);
let NF=null;
function nfIdx(){try{return JSON.parse(localStorage.getItem(NFKEY)||"{}")||{}}catch(e){return {}}}
function nfIdxSet(ch,o){try{const i=nfIdx();i[ch]=o;localStorage.setItem(NFKEY,JSON.stringify(i))}catch(e){}}
/* resultado igual para PDF e XML: números arredondados, código sem asterisco final */
function nfNormaliza(n){n.itens=n.itens.map(i=>({cod:String(i.cod||"").replace(/\s+/g,"").replace(/\*+$/,""),desc:String(i.desc||"").replace(/\s+/g," ").trim(),ncm:String(i.ncm||""),cfop:String(i.cfop||""),un:String(i.un||"").trim().toUpperCase(),qtd:Math.round((Number(i.qtd)||0)*10000)/10000,vUn:Math.round((Number(i.vUn)||0)*10000)/10000,vProd:nfR2(i.vProd),vDesc:nfR2(i.vDesc)}));
  n.itens.forEach(i=>{if(!i.vProd&&i.vUn&&i.qtd)i.vProd=nfR2(i.vUn*i.qtd);if(!i.vUn&&i.vProd&&i.qtd)i.vUn=nfR2(i.vProd/i.qtd)});
  n.totais={prod:nfR2(n.totais.prod),desc:nfR2(n.totais.desc),nota:nfR2(n.totais.nota),extra:nfR2(n.totais.extra)};n.emit.cnpj=String(n.emit.cnpj||"").replace(/\D/g,"");n.emit.nome=String(n.emit.nome||"").replace(/\s+/g," ").trim();return n}
function nfLerXml(txt){let doc;
  try{doc=new DOMParser().parseFromString(String(txt||"").replace(/^﻿/,""),"application/xml")}catch(e){throw new Error("Não consegui abrir esse XML.")}
  if(!doc||doc.getElementsByTagName("parsererror").length)throw new Error("Esse arquivo XML está com defeito ou incompleto. Baixe o XML da nota de novo.");
  const T=(el,n)=>el?el.getElementsByTagNameNS("*",n):[],F=(el,n)=>{const x=T(el,n)[0];return x?String(x.textContent||"").trim():""},V=(el,n)=>{const v=parseFloat(F(el,n));return isFinite(v)?v:0};
  const inf=T(doc,"infNFe")[0];
  if(!inf){if(T(doc,"resNFe")[0])throw new Error("Esse XML é só o resumo da nota, sem os produtos. Baixe o XML completo da nota.");throw new Error("Esse XML não parece ser de uma nota fiscal (NF-e): não achei os produtos.")}
  const emit=T(inf,"emit")[0],ide=T(inf,"ide")[0],tot=T(inf,"ICMSTot")[0];
  let chave=String(inf.getAttribute("Id")||"").replace(/\D/g,"");if(chave.length!==44)chave=F(doc.documentElement,"chNFe").replace(/\D/g,"");
  const itens=Array.from(T(inf,"det")).map(d=>{const p=T(d,"prod")[0];return {cod:F(p,"cProd"),desc:F(p,"xProd"),ncm:F(p,"NCM"),cfop:F(p,"CFOP"),un:F(p,"uCom"),qtd:V(p,"qCom"),vUn:V(p,"vUnCom"),vProd:V(p,"vProd"),vDesc:V(p,"vDesc")}});
  if(!itens.length)throw new Error("Esse XML não tem nenhum produto. Confira se é o XML completo da nota.");
  return nfNormaliza({origem:"xml",chave,numero:String(parseInt(F(ide,"nNF"),10)||F(ide,"nNF")),serie:String(parseInt(F(ide,"serie"),10)||F(ide,"serie")),emissao:nfData(F(ide,"dhEmi")||F(ide,"dEmi")),emit:{nome:F(emit,"xNome"),cnpj:F(emit,"CNPJ")||F(emit,"CPF")},itens,
    totais:{prod:V(tot,"vProd"),desc:V(tot,"vDesc"),nota:V(tot,"vNF"),extra:V(tot,"vFrete")+V(tot,"vSeg")+V(tot,"vOutro")+V(tot,"vIPI")+V(tot,"vST")}})}
async function nfTextoXml(f){checaTam(f,MAX_XML_BYTES,"O XML");const b=new Uint8Array(await f.arrayBuffer());let enc="utf-8";const head=new TextDecoder("latin1").decode(b.subarray(0,200)),m=head.match(/encoding=["']([\w-]+)["']/i);if(m)enc=m[1];let t;try{t=new TextDecoder(enc).decode(b)}catch(e){t=new TextDecoder("utf-8").decode(b)}return t}
/* PDF (DANFE): lê só o texto, com a posição de cada pedacinho, para separar código, descrição e valores por coluna */
async function nfPdfItens(f){checaTam(f,MAX_PDF_BYTES,"O PDF");const L=await carregarPdfJs();let doc;
  try{doc=await L.getDocument({data:new Uint8Array(await f.arrayBuffer()),isEvalSupported:false}).promise}catch(e){throw new Error(e&&e.name==="PasswordException"?"Esse PDF tem senha. Use o arquivo XML da nota.":"Não consegui abrir esse PDF. O arquivo pode estar com defeito.")}
  checaPaginas(doc);const its=[];for(let pg=1;pg<=doc.numPages;pg++){const tc=await (await doc.getPage(pg)).getTextContent();tc.items.forEach(it=>{const s=String(it.str||"").trim();if(s)its.push({pg,x:it.transform[4],y:it.transform[5],w:it.width||0,s})})}
  return its}
const nfPareceDanfe=its=>{const T=nfU(its.map(i=>i.s).join(" "));return its.length>=15&&/DANFE|DOCUMENTO AUXILIAR DA NOTA/.test(T)&&/DESCRICAO/.test(T)};
function nfCols(band){const c={},L={},sobra=[],cx=i=>i.x+i.w/2;
  const put=(k,i)=>{(c[k]=c[k]||[]).push(cx(i));L[k]=L[k]===undefined?i.x:Math.min(L[k],i.x)};
  band.forEach(i=>{const u=nfU(i.s);
    if(/^CODIGO|^PROD\b/.test(u))put("cod",i);else if(/^DESCRICAO/.test(u))put("desc",i);else if(/^NCM/.test(u))put("ncm",i);else if(/^CFOP/.test(u))put("cfop",i);
    else if(/^UNID|^UN\.?$/.test(u))put("un",i);else if(/^QUANT|^QTD/.test(u))put("qtd",i);else if(/UNITARIO|^V[LR]?\.? UNIT/.test(u))put("unit",i);
    else if(/^(VALOR )?TOTAL$|^VL\.? TOTAL/.test(u))put("total",i);else if(/^DESC(ONTO)?\.?$/.test(u))put("dv",i);else sobra.push(i)});
  if(!c.qtd||!c.desc)return null;
  const avg=a=>a.reduce((t,v)=>t+v,0)/a.length,cent=Object.keys(c).map(k=>[k,avg(c[k])]),g=k=>c[k]?avg(c[k]):null;
  if(c.ncm&&c.cfop)sobra.forEach(i=>{const v=cx(i);if(v>g("ncm")+8&&v<g("cfop")-8&&!cent.some(z=>z[0]==="cst"))cent.push(["cst",v])});
  const maxK=Math.max(...["dv","total","unit"].map(g).filter(v=>v!=null));
  sobra.forEach(i=>{if(cx(i)>maxK+15)cent.push(["x",cx(i)])});
  const fimTxt=["ncm","cfop","un","qtd"].map(k=>L[k]).find(v=>v!==undefined);
  return {c:cent,descEnd:fimTxt-6,codEnd:L.cod!==undefined?(L.cod+L.desc)/2:null}}
function nfColDe(cols,it){if(it.x<cols.descEnd)return cols.codEnd!=null&&it.x<cols.codEnd?"cod":"desc";
  const v=it.x+it.w/2;let best=null,bd=1e9;cols.c.forEach(([k,c])=>{const d=Math.abs(v-c);if(d<bd){bd=d;best=k}});return best==="cod"||best==="desc"?null:best}
function nfPdfParse(its){
  if(!its.length)throw new Error("Esse PDF não tem texto para ler (parece uma foto ou um PDF escaneado). Use o arquivo XML da nota.");
  if(!nfPareceDanfe(its))throw new Error("NAODANFE");
  const txt=its.map(i=>i.s).join(" ");let chave="";
  for(const s of (txt.match(/(?:\d{4} ){10}\d{4}/g)||[])){const d=s.replace(/\D/g,"");if(d.length===44){chave=d;break}}
  if(!chave){const m=txt.replace(/\s+/g," ").match(/\d{44}/);if(m)chave=m[0]}
  const itens=[];let cols=null;
  for(const pg of [...new Set(its.map(i=>i.pg))].sort((a,b)=>a-b)){
    const P=its.filter(i=>i.pg===pg),hd=P.find(i=>/^DESCRICAO/.test(nfU(i.s)));let top=Infinity;
    if(hd){const band=P.filter(i=>Math.abs(i.y-hd.y)<=9),nc=nfCols(band);if(nc){cols=nc;top=Math.min(...band.map(i=>i.y))-2}}
    if(!cols)continue;
    const fim=P.filter(i=>/^(DADOS ADICIONAIS|CALCULO DO ISSQN|RESERVADO AO FISCO)/.test(nfU(i.s))&&i.y<top).map(i=>i.y),bot=fim.length?Math.max(...fim):-Infinity;
    const asg=P.filter(i=>i.y<top&&i.y>bot).map(it=>({it,k:nfColDe(cols,it)}));
    const anc=asg.filter(a=>a.k==="qtd"&&/^\d[\d.]*(,\d+)?$/.test(a.it.s)).map(a=>a.it).sort((a,b)=>b.y-a.y);if(!anc.length)continue;
    const lin=anc.map(a=>({t:{}}));
    asg.forEach(({it,k})=>{if(!k||k==="x"||k==="cst")return;let best=-1,bd=1e9;anc.forEach((a,j)=>{const d=a.y-it.y;if(d>=-2&&d<bd){bd=d;best=j}});if(best<0||bd>45)return;(lin[best].t[k]=lin[best].t[k]||[]).push(it)});
    lin.forEach(Lr=>{const g=k=>(Lr.t[k]||[]).slice().sort((a,b)=>b.y-a.y||a.x-b.x).map(i=>i.s),n=k=>{const s=g(k)[0];return s==null?null:num(s)};
      itens.push({cod:g("cod").join(""),desc:g("desc").join(" "),ncm:(g("ncm").join("").match(/\d{8}/)||[""])[0],cfop:(g("cfop").join("").match(/\d{4}/)||[""])[0],un:g("un").join(""),qtd:n("qtd"),vUn:n("unit"),vProd:n("total"),vDesc:n("dv")||0})})}
  if(!itens.length)throw new Error("Achei a nota, mas não consegui ler a tabela de produtos. Use o arquivo XML da nota.");
  const imp=its.find(i=>/^CALCULO DO IMPOSTO/.test(nfU(i.s)));
  const val=re=>{for(const i of its){if(!re.test(nfU(i.s)))continue;if(imp&&(i.pg!==imp.pg||i.y>imp.y||i.y<imp.y-45))continue;
    const cand=its.filter(n=>n.pg===i.pg&&n.y<i.y-6&&n.y>i.y-28&&n.x>=i.x-4&&/^\d[\d.]*,\d{2}$/.test(n.s)).sort((a,b)=>a.x-b.x);if(cand.length)return num(cand[0].s)}return null};
  let nota=val(/^VALOR TOTAL DA NOTA/);if(nota==null){const m=txt.match(/VALOR TOTAL:\s*R\$\s*(\d[\d.]*,\d{2})/i);nota=m?num(m[1]):0}
  const mr=txt.match(/RECEBEMOS DE (.+?) OS PRODUTOS/i),mn=txt.match(/N[ºo°]\s*\.?\s*(\d{1,3}(?:\.\d{3})+)/),ms=txt.match(/S[ÉE]RIE\s*(\d+)/i),me=txt.match(/EMISS[ÃA]O:?\s*(\d{2}\/\d{2}\/\d{4})/i),mc=txt.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
  return nfNormaliza({origem:"pdf",chave,numero:chave?String(parseInt(chave.slice(25,34),10)):String(parseInt((mn||[0,"0"])[1].replace(/\D/g,""),10)),serie:chave?String(parseInt(chave.slice(22,25),10)):(ms?String(parseInt(ms[1],10)):""),emissao:me?me[1]:"",
    emit:{nome:mr?mr[1]:"",cnpj:chave?chave.slice(6,20):(mc?mc[0]:"")},itens,
    totais:{prod:val(/^VALOR TOTAL DOS PRODUTOS/)||0,desc:val(/^DESCONTO$/)||0,nota,extra:["VALOR DO FRETE","VALOR DO SEGURO","OUTRAS DESP","VALOR DO IPI"].reduce((t,l)=>t+(val(new RegExp("^"+l))||0),0)}})}
/* categoria pelas palavras da descrição, usando as categorias que já estão cadastradas */
const NFCAT=[[/\b(BRINC|ARGOLA|TRIO|DUO|PIERC)/,"Brincos"],[/\b(COLAR|COLARES|CORRENTE|CHOKER|GARGANTILHA)/,"Colares"],[/\b(ANEL|ANEIS|ALIANCA)/,"Anel"],[/\b(PULSEIRA|BRACELETE)/,"Pulseiras"],[/\bPINGENTE/,"Pingentes"],[/\bCONJUNTO/,"Conjuntos"],[/\bRELOGIO/,"Relogios"],[/\bTORNOZELEIRA/,"Tornozeleiras"]];
const NFSUB=[[/\b(TRIO|DUO)/,"Trios/duos"],[/ARGOLA/,"Argolas"],[/PIERC/,"Piercings"],[/CHOKER/,"Chokers"],[/CORRENTE/,"Correntes"],[/GARGANTILHA/,"Gargantilhas"]];
function nfCatDe(desc){const d=nfU(desc),C=cfg();let nome="";
  for(const [re,n] of NFCAT){if(re.test(d)){const a=semAc(n);const c=C.categorias.find(c=>semAc(c.nome)===a||(c.alias||[]).some(x=>semAc(x)===a))||C.categorias.find(c=>semAc(c.nome).slice(0,4)===a.slice(0,4));if(c){nome=c.nome;break}}}
  if(!nome){const m=String(mapaCat(desc,C.romaneios[0])||"").split(">");if(m[0]&&catBy(m[0]))nome=m[0]}
  const c=catBy(nome);let sub="";if(c){for(const [re,s] of NFSUB){if(re.test(d)){const f=c.subs.find(x=>semAc(x)===semAc(s));if(f){sub=f;break}}}}
  return {cat:nome,sub}}
const nfForma=c=>String(c).replace(/\*+$/,"").replace(/[A-Za-z]+/g,"A").replace(/\d+/g,"9");
function nfAcharForn(e){const C=cfg(),cn=String(e.cnpj||"").replace(/\D/g,""),limpa=s=>nfU(s).replace(/[^A-Z0-9 ]/g," ").replace(/\s+/g," ").trim(),nn=limpa(e.nome);
  let f=cn&&C.fornecedores.find(x=>String(x.cnpj||"").replace(/\D/g,"")===cn);if(f)return {f,por:"CNPJ"};
  f=C.fornecedores.find(x=>{const xn=limpa(x.nome);return xn.length>=4&&(nn===xn||(" "+nn+" ").includes(" "+xn+" ")||nn.startsWith(xn))});return f?{f,por:"nome"}:{f:null}}
function nfIniciar(nota){const forma={};nota.itens.forEach(i=>{if(i.cod){const s=nfForma(i.cod);forma[s]=(forma[s]||0)+1}});
  const ord=Object.entries(forma).sort((a,b)=>b[1]-a[1]),tot=ord.reduce((t,x)=>t+x[1],0),pad=ord.length&&ord[0][1]>=Math.max(2,tot*0.6)?ord[0][0]:"";
  const rows=nota.itens.map((it,i)=>{const ct=nfCatDe(it.desc),gen=[];
    if(/\b(DIVERS|VARIAD|VARIOS|VARIAS|MIST[OA]|KIT|SORTID|LOTE)/.test(nfU(it.desc)))gen.push("descrição genérica (vários modelos juntos)");
    if(!it.cod)gen.push("sem código do fornecedor");else if(pad&&nfForma(it.cod)!==pad)gen.push("código fora do padrão das outras peças");
    return {i,inc:true,cod:it.cod,desc:it.desc,cat:ct.cat,sub:ct.sub,qtd:it.qtd,vUn:it.vUn,vProd:it.vProd,vDesc:it.vDesc,ncm:it.ncm,cfop:it.cfop,un:it.un,gen,gmode:gen.length?"lote":"",gN:2,custoMan:""}});
  const ach=nfAcharForn(nota.emit);
  NF={nota,rows,liq:true,dup:null,dupOk:false,forn:ach.f?ach.f.nome:"__novo",fornPor:ach.por||"",novoNome:nfTitulo(nota.emit.nome)}}
const nfCusto=r=>{if(r.custoMan!=="")return num(r.custoMan);const q=Number(r.qtd)||0;if(NF.liq&&q>0)return r4(((r.vProd||r.vUn*q)-r.vDesc)/q);return r.vUn};
/* quantidade positiva nunca some: 0,4 kg vira 1 unidade com o custo do total da nota */
const nfQtdInt=q=>q>0?Math.max(1,Math.round(q)):0;
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
  if(editId){toast("Termine ou cancele a edição antes.");return}
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
    else{const qq=nfQtdInt(q);if(qq>0)out.push({...base,desc:r.desc,qtd:qq,total:nfR2(ci*qq),aviso:base.aviso||(r.gmode==="lote"?"· lote misto lançado como 1 peça":(qq!==q?"· quantidade quebrada: arredondei e ajustei o custo de cada para manter o total da nota":""))})}});
  return out}
function nfCalc(){const N=NF.nota,t=N.totais,sP=nfR2(N.itens.reduce((a,i)=>a+i.vProd,0)),sD=nfR2(N.itens.reduce((a,i)=>a+i.vDesc,0)),lin=nfLinhas(),un=lin.reduce((a,l)=>a+l.qtd,0),custo=nfR2(lin.reduce((a,l)=>a+(num(l.custo)||0)*l.qtd,0));
  const esperado=nfR2(t.prod-t.desc+t.extra);return {sP,sD,lin,un,custo,esperado,okProd:t.prod>0&&Math.abs(sP-t.prod)<0.05,okDesc:Math.abs(sD-t.desc)<0.05,okNota:t.nota>0&&Math.abs(esperado-t.nota)<0.05}}
function nfResumo(){const el=document.getElementById("nfSum");if(!el||!NF)return;const t=NF.nota.totais,c=nfCalc(),ok=(b,m)=>`<span class="${b?"nf-ok":"nf-no"}">${b?"✓":"⚠"} ${m}</span>`;
  el.innerHTML=`<div class="nf-conf">${ok(c.okProd,t.prod>0?`Soma dos itens ${nfM(c.sP)} ${c.okProd?"= total dos produtos da nota":"≠ total dos produtos da nota ("+nfM(t.prod)+")"}`:`Não achei o total dos produtos na nota (soma dos itens: ${nfM(c.sP)})`)}
    ${ok(c.okDesc,`Desconto dos itens ${nfM(c.sD)} ${c.okDesc?"= desconto da nota":"≠ desconto da nota ("+nfM(t.desc)+")"}`)}
    ${ok(c.okNota,t.nota>0?`Total da nota ${nfM(t.nota)} ${c.okNota?"= produtos − desconto"+(t.extra?" + frete/outros":""):"≠ produtos − desconto ("+nfM(c.esperado)+"): pode haver frete, seguro ou impostos na nota"}`:"Não achei o total da nota")}</div>
    <div class="nf-vai"><b>${c.lin.length}</b> peça${c.lin.length===1?"":"s"} · <b>${c.un}</b> unidade${c.un===1?"":"s"} · custo total <b>${nfM(c.custo)}</b>${NF.liq?` (nota com desconto: ${nfM(nfR2(t.prod-t.desc))})`:""}</div>`;
  const b=document.getElementById("nfGo");if(b){b.textContent=c.lin.length?`Importar ${c.lin.length} peça${c.lin.length===1?"":"s"} para o romaneio`:"Nada para importar";b.disabled=!c.lin.length||!!(NF.dup&&!NF.dupOk)}}
function nfRowHTML(r){const C=cfg(),cc=catBy(r.cat),ci=nfCusto(r),dec=r.vUn&&r.vDesc?Math.round(r.vDesc/(r.vProd||1)*100):0,av=[];
  if(!r.cat)av.push("categoria não reconhecida: escolha uma");
  if(Number(r.qtd)%1)av.push("quantidade quebrada: vai ser arredondada para "+nfQtdInt(Number(r.qtd))+" e o custo de cada será ajustado para o total da nota não mudar");
  if(!(Number(r.qtd)>0))av.push("sem quantidade");
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
  if(editId){toast("Termine ou cancele a edição antes.");return}
  if(NF.dup&&!NF.dupOk){toast("Esta nota já foi importada. Marque “Importar de novo mesmo assim” se quiser repetir.");return}
  const lin=nfLinhas();if(!lin.length){toast("Nenhum item marcado para importar.");return}
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
{const romCriarBase=romCriar;romCriar=function(){const r0=ROM&&ROM.rows.find(r=>r.nfChave&&!r.skip),m=r0&&{chave:r0.nfChave,numero:r0.nfNum,forn:r0.nfForn},antes=new Set(S.lanc.map(l=>l.id));
  romCriarBase.apply(this,arguments);
  if(m){const nv=S.lanc.filter(l=>!antes.has(l.id));if(nv.length){nv.forEach(l=>{l.nfChave=m.chave;l.nfNum=m.numero});nfIdxSet(m.chave,{em:Date.now(),n:nv.length,numero:m.numero,forn:m.forn});salvar(false)}}}}
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
