/* ===== núcleo: notafiscal — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { MAX_XML_BYTES, checaTam, semAc } from "./colunas.js";
import { brl, num } from "./utilidades.js";
// @fim-imports
export const nfU=s=>semAc(s).toUpperCase(),nfR2=n=>Math.round((Number(n)||0)*100)/100,NFKEY="cadpecas-nf";
export const nfCnpj=d=>{d=String(d||"").replace(/\D/g,"");return d.length===14?d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,"$1.$2.$3/$4-$5"):d};
export const nfTitulo=s=>String(s||"").toLowerCase().replace(/(^|\s)(\S)/g,(m,a,b)=>a+b.toUpperCase()).slice(0,40).trim();
export const nfData=s=>{const m=String(s||"").match(/(\d{4})-(\d{2})-(\d{2})/);return m?m[3]+"/"+m[2]+"/"+m[1]:String(s||"")};
export const nfM=n=>n==null?"—":"R$ "+brl(n);
export function nfNormaliza(n){n.itens=n.itens.map(i=>({cod:String(i.cod||"").replace(/\s+/g,"").replace(/\*+$/,""),desc:String(i.desc||"").replace(/\s+/g," ").trim(),ncm:String(i.ncm||""),cfop:String(i.cfop||""),un:String(i.un||"").trim().toUpperCase(),qtd:Math.round((Number(i.qtd)||0)*10000)/10000,vUn:Math.round((Number(i.vUn)||0)*10000)/10000,vProd:nfR2(i.vProd),vDesc:nfR2(i.vDesc)}));
  n.itens.forEach(i=>{if(!i.vProd&&i.vUn&&i.qtd)i.vProd=nfR2(i.vUn*i.qtd);if(!i.vUn&&i.vProd&&i.qtd)i.vUn=nfR2(i.vProd/i.qtd)});
  n.totais={prod:nfR2(n.totais.prod),desc:nfR2(n.totais.desc),nota:nfR2(n.totais.nota),extra:nfR2(n.totais.extra)};n.emit.cnpj=String(n.emit.cnpj||"").replace(/\D/g,"");n.emit.nome=String(n.emit.nome||"").replace(/\s+/g," ").trim();return n}
export function nfLerXml(txt){let doc;
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
export async function nfTextoXml(f){checaTam(f,MAX_XML_BYTES,"O XML");const b=new Uint8Array(await f.arrayBuffer());let enc="utf-8";const head=new TextDecoder("latin1").decode(b.subarray(0,200)),m=head.match(/encoding=["']([\w-]+)["']/i);if(m)enc=m[1];let t;try{t=new TextDecoder(enc).decode(b)}catch(e){t=new TextDecoder("utf-8").decode(b)}return t}
export const nfPareceDanfe=its=>{const T=nfU(its.map(i=>i.s).join(" "));return its.length>=15&&/DANFE|DOCUMENTO AUXILIAR DA NOTA/.test(T)&&/DESCRICAO/.test(T)};
export function nfCols(band){const c={},L={},sobra=[],cx=i=>i.x+i.w/2;
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
export function nfColDe(cols,it){if(it.x<cols.descEnd)return cols.codEnd!=null&&it.x<cols.codEnd?"cod":"desc";
  const v=it.x+it.w/2;let best=null,bd=1e9;cols.c.forEach(([k,c])=>{const d=Math.abs(v-c);if(d<bd){bd=d;best=k}});return best==="cod"||best==="desc"?null:best}
export function nfPdfParse(its){
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
export const NFCAT=[[/\b(BRINC|ARGOLA|TRIO|DUO|PIERC)/,"Brincos"],[/\b(COLAR|COLARES|CORRENTE|CHOKER|GARGANTILHA)/,"Colares"],[/\b(ANEL|ANEIS|ALIANCA)/,"Anel"],[/\b(PULSEIRA|BRACELETE)/,"Pulseiras"],[/\bPINGENTE/,"Pingentes"],[/\bCONJUNTO/,"Conjuntos"],[/\bRELOGIO/,"Relogios"],[/\bTORNOZELEIRA/,"Tornozeleiras"]];
export const NFSUB=[[/\b(TRIO|DUO)/,"Trios/duos"],[/ARGOLA/,"Argolas"],[/PIERC/,"Piercings"],[/CHOKER/,"Chokers"],[/CORRENTE/,"Correntes"],[/GARGANTILHA/,"Gargantilhas"]];
export const nfForma=c=>String(c).replace(/\*+$/,"").replace(/[A-Za-z]+/g,"A").replace(/\d+/g,"9");
export const nfQtdInt=q=>q>0?Math.max(1,Math.round(q)):0;
