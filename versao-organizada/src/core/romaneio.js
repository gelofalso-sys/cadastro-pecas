/* ===== núcleo: romaneio — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { MAX_PLANILHA_LINHAS, MAX_TEXTO_COLADO, clone, csvq, ftOk, milDe, r2c } from "./colunas.js";
import { banhistaBy$, catBy$, cfg$, coresDaCat$, coresPadrao$, gradeDaCat$, prefDe$, val$ } from "./configuracao.js";
import { novaComp } from "./dominio.js";
import { brl, ehObj, esc, num, selFaixa, semAc, vazio } from "./utilidades.js";
// @fim-imports
export const MON="(\\d[\\d.]*,\\d{2})";
export const numQtd=s=>{s=String(s);return /^\d{1,3}(\.\d{3})+$/.test(s)?num(s.replace(/\./g,"")):num(s)};
export const TOK={desc:"(.{1,250}?)",cod:"([^\\s\\]\\[]+)",preco:MON,precod:MON,total:MON,qtd:"(\\d{1,3}(?:\\.\\d{3})+|\\d+)",x:"(?:.*?)",item:"(?:\\d{1,4})",u:"(?:\\s+([A-Za-z]{1,4})\\.?\\s+)?",qv:"(\\d[\\d.]*(?:,\\d+)?)",pu:"(\\d[\\d.]*,\\d{2,4})"};
export function padraoRegex(pad){const ordem=[];let src="";
  String(pad||"").split(/(\{\w+\})/).forEach(p=>{const m=p.match(/^\{(\w+)\}$/);
    if(m&&TOK[m[1]]){if(m[1]==="u"&&src.endsWith("\\s*"))src=src.slice(0,-3);if(m[1]!=="x"&&m[1]!=="item")ordem.push(m[1]);src+=TOK[m[1]]}
    else src+=p.split(/\s+/).map(z=>z.replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&")).join("\\s*")});
  return {re:new RegExp(src,"g"),ordem}}
export const rxPerigo=x=>/\((?:[^()\\]|\\.)*[+*}](?:[^()\\]|\\.)*\)\s*(?:[+*]|\{\d)/.test(String(x))||/\((?:\?:)?[^()]*\|[^()]*\)\s*[+*{]/.test(String(x));
export const rxs=(x,f)=>{try{if(rxPerigo(x))return null;return new RegExp(x,f||"i")}catch(e){return null}};
export const ROM_MAX=MAX_TEXTO_COLADO;
export function lerRomaneio(texto,T){
  const R={rows:[],obs:"",conf:"",erro:""};
  let flat=String(texto||"").replace(/ /g," ").replace(/\s+/g," ").trim();
  if(!flat){R.erro="Cole o texto da lista.";return R}
  if(flat.length>ROM_MAX){R.erro=`O texto da lista é grande demais (${Math.round(flat.length/1000)} mil caracteres; o limite é ${ROM_MAX/1000} mil). Cole ou envie a lista por partes (no PDF, só as páginas da lista) — ou confira se não copiou a página inteira.`;return R}
  const full=flat;
  if(T.obsRe){const r=rxs(T.obsRe),m=r&&full.match(r);if(m)R.obs=String(m[1]||m[0]).trim()}
  if(T.lixo){const r=rxs(T.lixo,"gi");if(r)flat=flat.replace(r," ")}
  if(T.ini){const i=flat.toLowerCase().indexOf(String(T.ini).toLowerCase());if(i>=0)flat=flat.slice(i+T.ini.length)}
  if(T.fim){const i=flat.toLowerCase().indexOf(String(T.fim).toLowerCase());if(i>=0)flat=flat.slice(0,i)}
  flat=" "+flat;   /* o 1º item pode vir só com o código, sem descrição: precisa de um espaço antes para o padrão casar sem engolir o item seguinte */
  let P;try{P=padraoRegex(T.padrao)}catch(e){R.erro="O padrão da linha é inválido.";return R}
  if(!P.ordem.includes("desc")||!(P.ordem.includes("qtd")||P.ordem.includes("qv"))){R.erro="O padrão precisa ter pelo menos {desc} e {qtd}.";return R}
  let fimLido=0,corte=false;
  const colhe=P=>{let m,g=0;
  while((m=P.re.exec(flat))&&g++<3000){if(!m[0].length){P.re.lastIndex++;continue}fimLido=P.re.lastIndex;
    const o={};P.ordem.forEach((k,i)=>o[k]=m[i+1]);
    const desc=String(o.desc||"").replace(/Varia[^:]{1,4}:/i," ").replace(/ {2,}/g," ").replace(/^[\s,;:\-]+|[\s,;:\-]+$/g,"");
    const un=String(o.u||"").toUpperCase().replace(/[.]/g,""),porPeso=/^(GR|G|KG)$/.test(un),pr=o.preco||o.pu,qn=o.qtd||o.qv;
    let loteG=null,precoG=null;if(porPeso){const fk=un==="KG"?1000:1;loteG=(numQtd(qn)||0)*fk;precoG=(num(pr)||0)/fk}
    R.rows.push({cod:o.cod||"",desc,preco:pr?num(pr):null,precod:o.precod?num(o.precod):null,total:o.total?num(o.total):null,qtd:porPeso?1:Math.trunc(numQtd(qn)||0),peso:"",q:{},skip:false,aviso:desc.length>70?"descrição longa: confira":"",
      ...(porPeso?{lote:true,und:un,loteG,precoG,lid:uid(),skip:true,aviso:"lote por peso: pese as peças e adicione os itens"}:{})})}
    if(m&&g>3000)corte=true};   /* saiu do laço com mais uma linha reconhecida: a lista passou do limite */
  colhe(P);if(!R.rows.length&&String(T.padrao).includes("R$ {precod}")){try{colhe(padraoRegex(String(T.padrao).replace("R$ {precod}","").replace(/ {2,}/g," ")))}catch(e){}}
  {const r0=R.rows[0];if(r0){const m=r0.desc.match(/^\s*(?:total(?:\s+geral)?|qtd\.?\s*total|quantidade\s+total|romaneio|pedido|resumo)\b[^\d]{0,20}\d[0-9.,]*\s*(?:pe[cç]as?|itens?|unidades?|un\.?|produtos?|volumes?)?\s*/i);
      if(m&&m[0].length<r0.desc.length){R.cab=m[0].trim();r0.desc=r0.desc.slice(m[0].length).replace(/^[\s,;:-]+/,"")}}}
  if(!R.rows.length){R.erro="Não reconheci nenhuma peça. Confira se copiou a tabela inteira (com código e valores). Se o fornecedor usa outro formato, veja Cadastros › Romaneios › Avançado.";return R}
  const sq=R.rows.reduce((t,r)=>t+r.qtd,0),sv=R.rows.reduce((t,r)=>t+(r.lote?(r.total||0):(r.preco!=null?r.preco*r.qtd:(r.total||0))),0),pt=[];
  if(T.qtdRe){const r=rxs(T.qtdRe),m2=r&&full.match(r);if(m2){const n=+String(m2[1]).replace(/\D/g,"");pt.push(n===sq?`✓ ${sq} peças conferem`:`⚠ a lista diz ${n} peças e li ${sq}`)}}
  if(T.valorRe){const r=rxs(T.valorRe),m2=r&&full.match(r);if(m2){const v=num(m2[1]);pt.push(v!=null&&Math.round(v*100)===Math.round(sv*100)?`✓ valor R$ ${brl(sv)} confere`:`⚠ a lista diz R$ ${brl(v||0)} e li R$ ${brl(sv)}`)}}
  if(corte)pt.push("⚠ A LISTA FOI CORTADA: li só as primeiras 3.000 peças e ainda havia mais linhas. Divida o texto em partes e cole de novo.");
  if(R.cab)pt.push(`⚠ ignorei o cabeçalho “${R.cab}” antes da 1ª peça`);
  {const sd=R.rows.filter(r=>!r.desc&&!r.lote);if(sd.length){sd.forEach(r=>{r.aviso=(r.aviso?r.aviso+" ":"")+"· só tem o código, sem descrição: preencha ou confira"});pt.push(`⚠ ${sd.length} item(ns) só com o código, sem descrição: ${sd.slice(0,5).map(r=>r.cod||"sem código").join(", ")}${sd.length>5?"…":""}`)}}
  {const cont={};R.rows.forEach(r=>{if(r.cod)cont[r.cod]=(cont[r.cod]||0)+1});const rep=Object.keys(cont).filter(k=>cont[k]>1);
    if(rep.length){R.rows.forEach(r=>{if(r.cod&&cont[r.cod]>1)r.aviso=(r.aviso?r.aviso+" ":"")+"· código repetido na lista: confira"});pt.push(`⚠ código repetido na lista: ${rep.slice(0,5).join(", ")}${rep.length>5?"…":""}`)}}
  if(fimLido&&/R\$\s*\d[0-9.]*,\d{2}/.test(flat.slice(fimLido).replace(/(?:valor\s+(?:total\s+da\s+compra|produtos|j[aá]\s+pago)|custo\s+separa[cç][aã]o|sub-?total|total(?:\s+(?:produtos|geral|itens))?|desconto[^:]{0,40}|frete|taxa[^:]{0,40})\s*:?\s*R\$\s*\d[0-9.]*,\d{2}/gi,"")))pt.push("⚠ sobrou texto com valores depois da última peça lida (alguma linha sem código ou em outro formato?)");
  R.conf=pt.join(" · ");return R}
export const virg=n=>n==null?"":(Math.abs(n*100-Math.round(n*100))<1e-6?(Math.round(n*100)/100).toFixed(2):String(Math.round(n*10000)/10000)).replace(".",",");
export function padroesAuto(){const cods=["[#{cod}]","[{cod}]","#{cod}","({cod})",""],pre=["R$ {preco} R$ {precod} {qtd} R$ {total}","R$ {preco} {qtd} R$ {total}","{qtd} R$ {preco} R$ {total}","R$ {preco} R$ {total} {qtd}","{preco} {qtd} {total}"],o=[];
  cods.forEach(c=>pre.forEach(q=>o.push("{desc} "+(c?c+" ":"")+q)));return o}
export const romSuja=r=>/\[#?[^\]\s]+\]\s*$|\s#\d+\s*$|R\$\s*\d[0-9.]*,\d{2}/.test(String(r.desc||""));
export const romScore=R=>R.rows.length-2*R.rows.filter(romSuja).length;
export function romAvisoTotal(r){const q=r.lote?r.loteG:r.qtd,u=r.lote?r.precoG:(r.precod!=null?r.precod:r.preco),t=r.total;if(!(q>0)||u==null||t==null||!isFinite(u)||!isFinite(t))return false;const esp=q*u;if(Math.abs(esp-t)<=Math.max(0.05,0.001*Math.abs(t)))return false;const f=x=>x.toFixed(2).replace(".",",");r.aviso=(r.aviso?r.aviso+" ":"")+"· "+(r.lote?"peso × valor por grama":"quantidade × valor unitário")+" dá R$ "+f(esp)+" mas o total lido é R$ "+f(t)+": confira";return true}
export function romConfTotais(R){if(!R||!R.rows)return;const k=R.rows.filter(r=>romAvisoTotal(r)).length;if(k)R.conf=(R.conf?R.conf+" · ":"")+"⚠ "+k+" linha(s) com valor calculado diferente do total"}
export function romTsv(texto){const L=String(texto||"").split(/\r?\n/).map(l=>l.replace(/\s+$/,"")).filter(l=>l.trim());if(!L.length||L.length>MAX_PLANILHA_LINHAS)return null;
 const M=L.map(l=>l.split("\t").map(c=>c.trim()));if(M.filter(r=>r.length>=3).length<Math.ceil(M.length*0.6))return null;
 const W=Math.max(...M.map(r=>r.length)),nv=c=>{const x=String(c==null?"":c).replace(/R\$|\s/g,"");return x===""?null:num(x)};
 let H=null,D=M;if(M[0].some(c=>/c[oó]d|descri|qtd|quant|valor|pre[cç]o|total|unit|produto|ref/i.test(c))&&!M[0].some(c=>nv(c)!=null)){H=M[0];D=M.slice(1)}
 if(!D.length)return null;let map={cod:null,desc:null,qtd:null,preco:null,total:null},nota="";
 if(H)H.forEach((c,j)=>{if(/total/i.test(c))map.total=j;else if(/qtd|quant/i.test(c))map.qtd=j;else if(/unit|pre[cç]o|valor/i.test(c))map.preco=j;else if(/descri|produto|nome|item/i.test(c))map.desc=j;else if(/c[oó]d|ref|sku/i.test(c))map.cod=j});
 if(map.desc==null||map.qtd==null){map={cod:null,desc:null,qtd:null,preco:null,total:null};
  const pn=j=>D.filter(r=>nv(r[j])!=null).length/D.length,al=j=>D.reduce((a,r)=>a+String(r[j]||"").length,0)/D.length,tx=[];for(let j=0;j<W;j++)if(pn(j)<0.5)tx.push(j);if(!tx.length)return null;
  const d=tx.reduce((a,b)=>al(b)>al(a)?b:a);map.desc=d;const nm=[];for(let j=0;j<W;j++)if(j!==d&&pn(j)>=0.6)nm.push(j);
  const antes=nm.filter(j=>j<d),dep=nm.filter(j=>j>d),ct=tx.find(j=>j!==d&&al(j)<=20);map.cod=ct!=null?ct:(antes.length?antes[0]:null);
  const ult=dep.slice(-3);
  if(ult.length===3){const P=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];let bs=-1,bp=P[0];P.forEach(p=>{let ok=0,tot=0,qi=0;D.forEach(r=>{const qr=String(r[ult[p[0]]]==null?"":r[ult[p[0]]]).replace(/R\$|\s/g,""),q=qr===""?null:numQtd(qr),u=nv(r[ult[p[1]]]),t=nv(r[ult[p[2]]]);if(q==null||u==null||t==null)return;tot++;if(Math.abs(q*u-t)<=Math.max(0.05,0.001*Math.abs(t)))ok++;if(Number.isInteger(q)&&q>=1)qi++});const sc=(tot?ok/tot:0)+(tot&&qi===tot?0.01:0);if(sc>bs){bs=sc;bp=p}});
   if(bs<0.5){bp=[0,1,2];nota=" · ⚠ não deu para deduzir a ordem das colunas; assumi quantidade, unitário, total"}map.qtd=ult[bp[0]];map.preco=ult[bp[1]];map.total=ult[bp[2]]}
  else if(ult.length===2){const ei=j=>D.every(r=>{const q=nv(r[j]);return q==null||Number.isInteger(q)});const a=ult[0],b=ult[1];if(ei(a)){map.qtd=a;map.preco=b}else{map.qtd=b;map.preco=a}}
  else if(ult.length===1)map.qtd=ult[0];else return null}
 const rows=[];let semDesc=0,ruins=0;
 D.forEach(r=>{const desc=String(r[map.desc]||"").replace(/\s+/g," ").trim(),cod=map.cod==null?"":String(r[map.cod]||"").trim().replace(/^#/,""),qr=String(r[map.qtd]==null?"":r[map.qtd]).replace(/R\$|\s/g,""),q=qr===""?null:numQtd(qr);
  if(!desc||(q==null&&/^(sub)?total/i.test(desc))){if(cod||q||desc)semDesc++;return}if(q==null||!isFinite(q)||q<1||q!==Math.trunc(q)){ruins++;return}
  rows.push({cod,desc:desc.slice(0,250),preco:map.preco==null?null:nv(r[map.preco]),precod:null,total:map.total==null?null:nv(r[map.total]),qtd:q,peso:"",q:{},skip:false,aviso:desc.length>70?"descrição longa: confira":""})});
 if(!rows.length)return null;const R={rows,obs:"",conf:"✓ lido por colunas (colado do Excel): "+rows.length+" peça(s)"+nota,erro:""};
 if(ruins)R.conf+=" · ⚠ "+ruins+" linha(s) com quantidade vazia, decimal ou inválida, não lida(s)";if(semDesc)R.conf+=" · ⚠ "+semDesc+" linha(s) sem descrição ignorada(s) (pode ser a linha de total)";return R}
export function lerRomaneioAuto0(texto,T){let best=lerRomaneio(texto,T);
  /* escolhe o padrão que lê mais linhas LIMPAS: um padrão sem código que deixa "[#cod]" dentro da descrição perde para o que reconhece o código */
  const tx=String(texto||"");
  if(T.auto!==false)padroesAuto().forEach(pad=>{if(pad===T.padrao)return;if(pad.includes("[#")&&!tx.includes("[#"))return;if(pad.includes("R$")&&!tx.includes("R$"))return;const R=lerRomaneio(texto,{...T,padrao:pad});if(R.erro)return;if(best.erro||romScore(R)>romScore(best)||(romScore(R)===romScore(best)&&R.rows.length>best.rows.length))best=R});
  {const ruins=best.rows.filter(r=>/R\$\s*\d[0-9.]*,\d{2}|\[#/.test(String(r.desc||"")));if(ruins.length){ruins.forEach(r=>{r.aviso=(r.aviso?r.aviso+" ":"")+"· a descrição tem valores ou código: uma linha sem código pode ter sido grudada aqui — confira"});best.conf=(best.conf?best.conf+" · ":"")+`⚠ ${ruins.length} peça(s) com descrição suspeita (linha sem código?)`}}
  const nc=String(texto).split("[#").length-1;if(best.rows.length&&nc>best.rows.length)best.conf=(best.conf?best.conf+" · ":"")+`⚠ ${nc-best.rows.length} linha(s) com código não entendida(s)`;
  return best}
export const fm=n=>n==null?"—":"R$ "+brl(n);
export const ROMDEL=new Set(),TABDEL=new Set();
export const chaveCod=(forn,cod)=>String(forn||"")+"\u0001"+String(cod||"");
export const codsDe=rec=>[...new Set((rec.lanc||[]).filter(l=>l&&l.v&&!vazio(l.v.G)).map(l=>chaveCod(l.v.H,l.v.G)))];
export const candFoto=new Set();
export const PONTO_IDS=new Set();
export const tabExcluindo=new Set();
export const dtbr=t=>new Date(t).toLocaleString("pt-BR");
export function tabCsv(rec){const q=csvq,v=n=>n==null?"":(Math.round(n*100)/100).toFixed(2).replace(".",","),o=[["Referência","Descrição","Categoria","Subcategoria","Cor","Fornecedor","Cód. fornecedor","Quantidade","Custo unit.","Varejo","Montada por"].map(q).join(";")];
  (rec.linhas||[]).forEach(l=>o.push([l.ref,l.desc,l.cat,l.sub,l.cor,l.forn,l.cod,l.q,v(l.custo),v(l.varejo),l.por].map(q).join(";")));return String.fromCharCode(65279)+o.join("\n")}
export const romFq=(rot,inner,cls)=>`<label class="fq ${cls||""}"><span>${rot}</span>${inner}</label>`;
export const g3=n=>(Math.round((+n||0)*1000)/1000).toFixed(3).replace(".",",");
export const romLoteReal=r=>{const n=num(r.pesoReal);return n>0?n:null};
export function romLoteTaxa(r,w){const tot=r.total!=null?r.total:(r.loteG||0)*(r.precoG||0),real=romLoteReal(r),base=real!=null?real:(r.ratear!==false&&w>0?w:(r.loteG||0));return base>0?tot/base:0}
export const ROM_PAPEIS=[["cod","Código"],["desc","Descrição"],["qtd","Quantidade"],["preco","Valor unitário"],["total","Valor total"]];
export const ROM_SIN={cod:/c[oó]d|ref|sku|^item$|^id$/i,desc:/descri|produto|nome|mercadoria|artigo/i,qtd:/qtd|quant|^qt$|^un/i,preco:/unit|pre[cç]o|vlr un|valor un|^valor$/i,total:/total|subtotal/i};
export function decTexto(buf){try{return new TextDecoder("utf-8",{fatal:true}).decode(buf)}catch(e){return new TextDecoder("windows-1252").decode(buf)}}
export const romTemArq=e=>e.dataTransfer&&[...(e.dataTransfer.types||[])].includes("Files");
export const romInsFora=x=>/^(?:(?:valor|custo|taxa|despesa|servico|preco)\s+(?:(?:de|da|do|com)\s+)?)?(?:fretes?|separacao|separacoes)(?:\b|$)/.test(String(x&&x.nome||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase());
export const FISC_COLS=[["ncm","NCM","8 números (ex.: 71131100)",96],["cfop","CFOP","4 números (ex.: 5102)",64],["fcp","FCP %","0 a 100",64],["insumos","Insumos R$","0 em diante (ex.: 0,50)",84]],FISC_PAD={ncm:"Y",cfop:"AA",fcp:"AB",insumos:"Q"};
export function fiscalErro(k,v){v=String(v||"").trim();if(v==="")return "";const n=num(v);
  if(k==="ncm")return /^\d{8}$/.test(v)?"":"O NCM tem 8 números (ex.: 71131100).";
  if(k==="cfop")return /^\d{4}$/.test(v)?"":"O CFOP tem 4 números (ex.: 5102).";
  if(k==="fcp")return n!=null&&n>=0&&n<=100?"":"O FCP é um percentual de 0 a 100.";
  return n!=null&&n>=0&&n<=1e6?"":"Insumos precisa ser um número de 0 em diante (ex.: 0,50)."}
export const mulM=(m,n)=>[m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];
export function relFaixas(R){const f={};R.itens.forEach(i=>i.linhas.forEach(l=>{const m=String(l.ref).match(/^([A-Z]+)([0-9]+)/);if(!m)return;const o=f[m[1]]=f[m[1]]||[+m[2],+m[2]];o[0]=Math.min(o[0],+m[2]);o[1]=Math.max(o[1],+m[2]);o[2]=Math.max(o[2]||0,m[2].length)}));
  const z=(p,i)=>String(f[p][i]).padStart(f[p][2]||0,"0");return Object.keys(f).map(p=>`${p}${z(p,0)}${f[p][1]>f[p][0]?"–"+p+z(p,1):""}`)}
export function relTexto(R){const m=R.meta,tot=R.itens.reduce((t,i)=>({un:t.un+i.un,cu:t.cu+i.custo,vr:t.vr+i.vr,l:t.l+i.linhas.length}),{un:0,cu:0,vr:0,l:0});
  const L=[`RELATÓRIO DO ROMANEIO — ${new Date(R.em).toLocaleString("pt-BR")}`,`Fornecedor: ${m.forn}${m.banhista?` · Banhista: ${m.banhista}`:""}${m.obs?` · ${m.obs}`:""}`,
    `${R.itens.length} peças · ${tot.l} linhas · ${tot.un} unidades (lista: ${m.naLista}) · Custo ${fm(tot.cu)} · Varejo ${fm(tot.vr)}`,`Referências criadas: ${relFaixas(R).join(" · ")||"—"}`,m.conf?`Conferência da lista: ${m.conf}`:"",""];
  R.itens.forEach(i=>L.push(`${i.linhas.map(l=>l.ref).join(" + ")} | ${i.desc} | ${i.cat}${i.sub?" › "+i.sub:""} | ${i.un} un. | compra ${i.compra||"—"} | cód. forn. ${i.cod||"—"}`));
  if(R.ign.length){L.push("","Não lançadas:");R.ign.forEach(g=>L.push(`${g.desc} (${g.cod||"sem código"}) — ${g.motivo}`))}return L.filter((x,i)=>x!==""||i>4).join("\n")}
export function relCsv(R){const q=csvq,v=n=>n==null?"":(Math.round(n*100)/100).toFixed(2).replace(".",","),o=[["Referência","Descrição","Categoria","Subcategoria","Cód. fornecedor","Cor","Quantidade","Custo de Compra","Custo total unit.","Preço de Varejo"].map(q).join(";")];
  R.itens.forEach(i=>i.linhas.forEach(l=>o.push([l.ref,i.desc,i.cat,i.sub,i.cod,l.cor,l.q,i.compra,v(l.cu),v(l.v)].map(q).join(";"))));return "﻿"+o.join("\r\n")}
export function relNormalizar(R){
  const N=(v,d)=>{const n=typeof v==="number"?v:(typeof v==="string"&&v.trim()!==""?Number(v):NaN);return isFinite(n)?n:d},T=v=>v==null||typeof v==="object"?"":String(v);
  if(!ehObj(R)||!ehObj(R.meta)||!Array.isArray(R.itens)||(R.ign!=null&&!Array.isArray(R.ign)))throw new Error("o relatório está em formato errado");
  const m=R.meta;
  return {...R,romId:T(R.romId),em:N(R.em,Date.now()),meta:{...m,forn:T(m.forn),banhista:T(m.banhista),obs:T(m.obs),conf:T(m.conf),tipo:T(m.tipo),modelo:T(m.modelo),naLista:N(m.naLista,0),un:N(m.un,0)},
    itens:R.itens.map((i,n)=>{if(!ehObj(i)||!Array.isArray(i.linhas))throw new Error("o item "+(n+1)+" do relatório está em formato errado");
      return {...i,desc:T(i.desc),cod:T(i.cod),cat:T(i.cat),sub:T(i.sub),peso:T(i.peso),compra:T(i.compra),foto:ftOk(i.foto)?i.foto:null,un:N(i.un,0),custo:N(i.custo,0),vr:N(i.vr,0),
        linhas:i.linhas.map(l=>{if(!ehObj(l))throw new Error("uma linha do relatório está em formato errado");return {...l,ref:T(l.ref),cor:T(l.cor),q:N(l.q,0),cu:N(l.cu,0),v:l.v==null?null:N(l.v,null)}})}}),
    ign:(R.ign||[]).map(g=>ehObj(g)?{...g,desc:T(g.desc),cod:T(g.cod),motivo:T(g.motivo)}:{desc:"",cod:"",motivo:""})}}
export function parseMapa(m){return String(m||"").split(/[;\n]/).map(z=>z.trim()).filter(Boolean).map(z=>{const [a,b]=z.split("="),[c,s]=String(b||"").split(">");return {w:(a||"").trim(),c:(c||"").trim(),s:(s||"").trim()}})}
export const mapaStr=arr=>arr.map(m=>m.w+"="+m.c+(m.s?">"+m.s:"")).join("; ");
export function mapaCat$(S,desc,T){const d=semAc(desc);
  for(const par of String(T.mapa||"").split(/[;\n]/)){const [a,b]=par.split("=").map(z=>(z||"").trim());if(a&&b&&d.startsWith(semAc(a))&&catBy$(S,b.split(">")[0].trim()))return b}
  const w=d.split(/[\s,]+/)[0];const c=cfg$(S).categorias.find(c=>w&&semAc(c.nome).startsWith(w.slice(0,4)));return c?c.nome:""}
export function romTabelaCategoria$(S,texto){const raw=String(texto||"").replace(/\u00a0/g," ").replace(/\r\n?/g,"\n"),cab=/categoria[ \t]+descri[cç][aã]o[ \t]+valor[ \t]+unit[aá]rio[ \t]+quantidade[ \t]+valor[ \t]+total/i.exec(raw);if(!cab)return null;
  const corpo=raw.slice(cab.index+cab[0].length),fim=corpo.search(/(?:^|\n)[ \t]*(?:valor[ \t]+total[ \t]+da[ \t]+compra|valor[ \t]+produtos|quantidade[ \t]+total[ \t]+de[ \t]+produtos)[ \t]*:/i),area=fim<0?corpo:corpo.slice(0,fim),rows=[];
  const re=/^[ \t]*([^\r\n]{1,250}?)[ \t]+\[#([^\]\s]+)\][ \t]+R\$[ \t]*(\d[\d.]*,\d{2})[ \t]+(\d{1,3}(?:\.\d{3})+|\d+)[ \t]+R\$[ \t]*(\d[\d.]*,\d{2})[ \t]*$/gm;let m;
  while((m=re.exec(area))&&rows.length<3000){const desc=m[1].trim().replace(/[ \t]+/g," "),q=numQtd(m[4]),categoria=cfg$(S).categorias.some(c=>semAc(c.nome)===semAc(desc));if(!q||q<1)continue;rows.push({cod:m[2],desc,preco:num(m[3]),precod:null,total:num(m[5]),qtd:q,peso:"",q:{},skip:false,aviso:categoria?"só a categoria foi informada como descrição: complete ou confira":""})}
  if(!rows.length)return null;const R={rows,obs:"",conf:"✓ tabela com categoria e valores lida: "+rows.length+" item(ns)",erro:""},codigos=(area.match(/\[#([^\]\s]+)\]/g)||[]).length;if(codigos>rows.length)R.conf+=" · ⚠ "+(codigos-rows.length)+" código(s) não lido(s): confira a lista original";
  if(rows.some(r=>r.aviso))R.conf+=" · ⚠ descrição incompleta: confira os itens marcados";return R}
export function lerRomaneioAuto$(S,texto,T){const t=romTsv(texto)||romTabelaCategoria$(S,texto),R=t||lerRomaneioAuto0(texto,T);romConfTotais(R);return R}
export const romTemVar$=(S,cat,sub)=>!!gradeDaCat$(S,cat,sub)||coresDaCat$(S,cat,sub).length>0;
export function romIds$(S,r){const g=gradeDaCat$(S,r.cat,r.sub),cs=coresDaCat$(S,r.cat,r.sub).filter(x=>(r.csel||[]).includes(x.id)).map(x=>"c_"+x.id),sz=g&&!r.semG?(r.gsel||[]):[];if(!cs.length)return sz;if(!sz.length)return cs;return sz.flatMap(a=>cs.map(c=>a+"+"+c))}
export function romNomeId$(S,cat,sub,id){const g=gradeDaCat$(S,cat,sub),lc=coresDaCat$(S,cat,sub),p=String(id).split("+"),o=[];p.forEach(x=>{if(x.startsWith("c_")){const c=lc.find(y=>"c_"+y.id===x);o.push(c?c.nome:"")}else{const it=g&&g.itens.find(y=>y.id===x);o.push(it?(it.nome||it.letra):"")}});return o.filter(Boolean).join(" ")}
export const romKeys$=(S,r,cols)=>{const g=gradeDaCat$(S,r.cat,r.sub),ids=romIds$(S,r);return ids.length?cols.flatMap(c=>ids.map(id=>c.id+"~"+id)):(g&&!r.semG?[]:cols.map(c=>c.id))};
export const romSomaDe$=(S,r,cols)=>romKeys$(S,r,cols).reduce((t,k)=>t+Math.trunc(num(r.q[k])||0),0);
export const romTipo$=(S,r)=>(r&&(r.tipo==="bruta"||r.tipo==="pronta"))?r.tipo:S.form.tipo;
export const romBh$=(S,r)=>banhistaBy$(S,(r&&r.bh)||S.form.banhista);
export const romOn$=(S,r,b)=>r&&r.on&&(b.id in r.on)?r.on[b.id]:((r&&r.bh&&r.bh!==S.form.banhista)?(romTipo$(S,r)==="bruta"&&!!b.marcado):(romTipo$(S,r)==="bruta"?S.form.on:(S.form.onP||{}))[b.id]);
export function romReset$(S,r){r.on={};r.q={};r.bo={};r.mk={};r.vz={};if(romTipo$(S,r)!=="bruta"&&!romIds$(S,r).length&&!gradeDaCat$(S,r.cat,r.sub))r.q.p=String(r.qtd)}
export function romColsR$(S,r){const f=S.form,bh=romBh$(S,r);
  if(romTipo$(S,r)!=="bruta"){const sel=r&&r.sb?[]:bh.banhos.filter(b=>romOn$(S,r,b));if(!sel.length)return [{id:"p",nome:"Quantidade",letra:"",cor:"",col:""}];return sel.map(b=>({id:b.id,nome:b.nome,letra:b.letra,cor:b.cor,col:"",mil:milDe(b,(r&&r.cat)||f.v.I)}))}
  return bh.banhos.filter(b=>romOn$(S,r,b)).map(b=>({id:b.id,nome:b.nome,letra:b.letra,cor:b.cor,col:b.coluna,mil:milDe(b,(r&&r.cat)||f.v.I)}))}
export const romCols$=(S)=>romColsR$(S,null);
export const romPrefDe$=(S,l)=>prefDe$(S,val$(S,l,"I")||"",val$(S,l,"J"));
export function romLinhasHTML$(S,pv,r,cols){if(!pv||!pv.rows.length)return `<span class="hint">Escolha a categoria (e os banhos) para ver as referências desta peça.</span>`;
  const aviso=pv.troca?`<span class="hint" title="A peça mudou de categoria: recebe a próxima referência da nova sequência. As outras peças da categoria antiga NÃO são renumeradas">↪ categoria nova: próxima referência da sequência; as outras peças da categoria antiga mantêm as referências (fica uma vaga)</span> `:"";
  const g=gradeDaCat$(S,r.cat,r.sub);
  return pv.rows.map(x=>{const c=cols.find(c=>c.id===x.bid),it=x.gi?{nome:romNomeId$(S,r.cat,r.sub,x.gi)}:null;
    return `<span class="rch${x.dup?" dup":""}" title="${esc(x.dup?"Referência repetida":"Linha que será criada")}"><b>${esc(x.ref)}</b>${c&&c.nome?` <i>${esc(c.nome)}</i>`:""}${it?` <i>${esc(it.nome||it.letra)}</i>`:""} <em>${x.q?x.q+" un.":"sem qtd"}</em> <u>${x.sugerido&&x.v!=null?"Sugestão ":""}${fm(x.v)}</u></span>`}).join("")+aviso}
export function romConjAtivar$(S,r){if(r.conjComp)return;delete r.conjDesativado;const cols=romColsR$(S,r);r.conjOriginal={peso:r.peso,custo:r.custo,tipo:r.tipo,on:clone(r.on||{})};r.on=Object.fromEntries(cols.filter(c=>c.id!=="p").map(c=>[c.id,true]));r.tipo="pronta";r.conjComp=[novaComp(),novaComp()]}
export function romConjAuto$(S,r){if(!r||r.feito||r.planSistema||r.conjDesativado||r.conjComp)return;if([r.cat,r.sub].some(x=>/^conjuntos?$/.test(semAc(x||""))))romConjAtivar$(S,r)}
export function romLoteDistribuicaoInvalida$(S,r){return !!(r&&r.loteDe&&!r.skip&&romSomaDe$(S,r,romColsR$(S,r))!==r.qtd)}
export function romNovaCat$(S,r){const g=gradeDaCat$(S,r.cat,r.sub);r.gsel=g&&g.faixa?selFaixa(g,g.faixa):[];r.csel=coresPadrao$(S,r.cat,r.sub);r.semG=false;r.open=false;r.q={};if(!romIds$(S,r).length&&!g&&romTipo$(S,r)!=="bruta")r.q.p=String(r.qtd)}
export function romCompraGrama$(S,r){const c=catBy$(S,r.cat),g=c&&num(c.compraGrama),p=num(r.peso);if(!(g>0)||r.lote||r.loteDe||!(vazio(r.custo)||r.custoAuto))return false;
  if(p>0){r.custo=virg(r2c(p*g));r.custoAuto=true}else if(r.custoAuto){r.custo="";r.custoAuto=false}return true}
export function romDividir$(S,r,cols){const ks=romKeys$(S,r,cols),n=ks.length;if(!n)return;const base=Math.floor(r.qtd/n);let resto=r.qtd-base*n;ks.forEach(k=>{r.q[k]=String(base+(resto-->0?1:0))})}
export function romSit$(S,r){if(r.feito&&!r.refaz)return "lancadas";if(r.skip)return "ignoradas";
  if(num(r.peso)==null||romSomaDe$(S,r,romColsR$(S,r))!==r.qtd||r.catq)return "pendentes";return "prontas"}
