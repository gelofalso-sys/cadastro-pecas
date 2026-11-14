/* ===== núcleo: configuracao — funções que recebem o estado S como primeiro argumento (nome$) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { NOME, semAc } from "./colunas.js";
import { BANCO_PALAVRAS, apelidosDe, brl, catPad, catSing, corKey, efetivo, esc, fmt, num, palavraDeNome, selFaixa, vazio, vzPad } from "./utilidades.js";
// @fim-imports
export const cfg$=(S)=>S.config;
export const catBy$=(S,n)=>cfg$(S).categorias.find(c=>c.nome===n);
export const fornBy$=(S,n)=>cfg$(S).fornecedores.find(f=>f.nome===n);
export const banhistaBy$=(S,id)=>cfg$(S).banhistas.find(b=>b.id===id)||cfg$(S).banhistas[0]||{id:"",nome:"",banhos:[],verniz:"",vernizOn:false};
export const bhDe$=(S,x)=>banhistaBy$(S,x&&x.banhista);
export const prefDe$=(S,cat,sub)=>{const c=catBy$(S,cat)||{},sp=sub&&c.subPref&&c.subPref[sub];return String(sp||c.prefixo||"BR").toUpperCase()};
export function comSufixoCat$(S,d,cat,semSufixo){const sx=(catBy$(S,cat)||{}).sufixo;d=String(d||"").trim();if(semSufixo||!sx||!d)return d;return d.toLowerCase().includes(sx.trim().toLowerCase())?d:d+(/^[\s,.;:)]/.test(sx)?"":" ")+sx}
export const ultimo$=(S,p)=>Math.trunc(num(cfg$(S).seqs[p])||0);
export function libGradeSel$(S,attr){const C=cfg$(S),o=[];C.categorias.forEach(c=>{if(c.grade&&!c.grade.usa&&!c.grade.usaId)o.push(["c:"+c.nome,(c.grade.nome||"Variação")+" ("+c.nome+")"])});(C.grades||[]).forEach(g=>o.push(["o:"+g.id,g.nome]));
  return o.length?`<select ${attr} class="gi tod" aria-label="Usar uma variação cadastrada" style="width:auto" title="Tamanhos, P M G ou outra variação cadastrada na aba Cores, tamanhos e variações">`+`<option value="">＋ Usar variação cadastrada…</option>${o.map(([v,n])=>`<option value="${esc(v)}">${esc(n)}</option>`).join("")}</select>`:""}
export const fatorBanho$=(S,id)=>{for(const h of cfg$(S).banhistas)for(const b of h.banhos)if(b.id===id)return b.fator||"";return ""};
export function effGrade$(S,c){const g=c&&c.grade;if(g&&g.usaId){const o=(cfg$(S).grades||[]).find(x=>x.id===g.usaId);if(o)return {...o,id:g.id,subs:g.subs||[],usaId:g.usaId}}if(g&&g.usa){const o=catBy$(S,g.usa);if(o&&o.grade&&!o.grade.usa)return {...o.grade,id:g.id,subs:g.subs||[],usa:g.usa}}return g}
export const todasGrades$=(S)=>{const o=[];cfg$(S).categorias.forEach(c=>{if(c.grade)o.push(effGrade$(S,c))});(cfg$(S).grades||[]).forEach(g=>o.push(g));return o};
export const gradeBy$=(S,id)=>id?(todasGrades$(S).find(g=>g.id===id)||null):null;
export function gradeDaCat$(S,cat,sub){const c=catBy$(S,cat),g=c&&effGrade$(S,c);if(!g||!g.itens||!g.itens.length)return null;const ss=g.subs||[];return !ss.length||ss.includes(sub)?g:null}
export function resolverCatSub$(S,txt,catAtual){const k=catSing(txt);if(!k)return null;const C=cfg$(S);
  for(const c of C.categorias){if([c.nome].concat(apelidosDe(c.apelidos)).some(n=>catSing(n)===k))return {cat:c.nome,sub:""}}
  const ach=[];C.categorias.forEach(c=>(c.subs||[]).forEach(s=>{if([s].concat(apelidosDe((c.subAlias||{})[s])).some(n=>catSing(n)===k))ach.push({cat:c.nome,sub:s})}));
  return !ach.length?null:(ach.find(a=>a.cat===catAtual)||ach[0])}
export function catDaDescricao$(S,desc){const ws=String(desc||"").split(/\s+/).filter(w=>w.length>2);let achado=null;
  for(let i=0;i<ws.length&&!achado;i++){const r=resolverCatSub$(S,ws[i],"");if(r&&r.sub)achado=r}
  for(let i=0;i<ws.length&&!achado;i++){const r=resolverCatSub$(S,ws[i],"");if(r)achado=r}
  return achado}
export function palavrasDesc$(S,cat,sub){const c=catBy$(S,cat);if(!c)return {cat:"",sub:""};
  const pc=c.palavra!=null?String(c.palavra).trim():palavraDeNome(c.nome),ps=sub?((c.subPalavra||{})[sub]!=null?String((c.subPalavra||{})[sub]).trim():palavraDeNome(sub)):"";
  return {cat:pc==="-"?"":pc,sub:ps==="-"?"":ps}}
export function bancoLista$(S,cat,sub){const c=catBy$(S,cat);if(!c)return [];const chave=sub||"",pad=(BANCO_PALAVRAS[c.nome]||{})[chave]||[],b=c.bancoPalavras||{};return Array.isArray(b[chave])?b[chave].filter(w=>typeof w==="string"&&w.length<=60).slice(0,100):pad}
export function bancoGeralLista$(S){const c=cfg$(S);if(Array.isArray(c.bancoGeral))return c.bancoGeral;return [...new Set(Object.values(BANCO_PALAVRAS).flatMap(v=>Object.values(v).flat()))]}
export function bancoSugestoes$(S,cat,sub){const c=cfg$(S),catCfg=catBy$(S,cat)||{},legado=[catCfg.palavra,sub&&(catCfg.subPalavra||{})[sub],catCfg.sufixo].filter(x=>x&&x!=="-").map(x=>String(x).trim()),a=[...(sub?bancoLista$(S,cat,sub):[]),...bancoLista$(S,cat,""),...legado,...(c.bancoGeralAtivo===false?[]:bancoGeralLista$(S))],vistos=new Set(),lista=a.filter(w=>{const k=semAc(w);if(!k||vistos.has(k))return false;vistos.add(k);return true});
  return lista}
export function bancoComplementos$(S,f){const normal=s=>semAc(s).replace(/[^\p{L}\p{N}]+/gu," ").trim(),descricao=" "+normal(f.v.F)+" ";
  /* já dito pela cor ou pelos banhos escolhidos (nome, cor e texto do banho): não é complemento da descrição */
  const jaDito=[f.v.L],bh=(cfg$(S).banhistas||[]).find(b=>b.id===f.banhista);
  if(bh)(bh.banhos||[]).filter(b=>(f.on||{})[b.id]).forEach(b=>jaDito.push(b.nome,b.cor,b.sufixo));
  const ocultos=new Set(jaDito.map(normal).filter(Boolean));
  return bancoSugestoes$(S,f.v.I,f.v.J).filter(w=>{const k=normal(w);return k&&!ocultos.has(k)&&!descricao.includes(" "+k+" ")})}
export function entradasAtalho$(S){const C=cfg$(S),out=[],vistos=new Set(C.categorias.map(c=>catSing(c.nome)));
  C.categorias.forEach(c=>{apelidosDe(c.apelidos).forEach(a=>{if(!vistos.has(catSing(a))){vistos.add(catSing(a));out.push([a,c.nome])}});
    (c.subs||[]).forEach(s=>[s].concat(apelidosDe((c.subAlias||{})[s])).forEach(a=>{if(!vistos.has(catSing(a))){vistos.add(catSing(a));out.push([a,c.nome+" › "+s])}}))});return out}
export function sincGrade$(S,f){const g=gradeDaCat$(S,f.v.I,f.v.J),id=g?g.id:"";if(id!==(f.grade||"")){f.grade=id;f.gsel=g&&g.faixa?selFaixa(g,g.faixa):[];f.semGrade=false}}
export const bonP$=(S,l)=>l.tipo==="pronta"?bhDe$(S,l).banhos.filter(b=>(l.onP||{})[b.id]):[];
export function libSiglas$(S){const C=cfg$(S),M=C.coresMeta||{},us=new Set(),out={};(C.cores||[]).forEach(n=>{const m=M[corKey(n)];if(m&&m.sig)us.add(String(m.sig).toUpperCase())});
  (C.cores||[]).forEach(n=>{const k=corKey(n),m=M[k];if(m&&m.sig){out[k]=String(m.sig).toUpperCase();return}
    const w=k.toUpperCase().replace(/[^A-Z0-9]/g,""),cand=[];if(w.length>=2){cand.push(w.slice(0,2));for(let q=2;q<w.length;q++)cand.push(w[0]+w[q])}
    let sg="";for(const q of cand)if(!us.has(q)){sg=q;break}
    if(!sg)for(let i=1;i<100;i++)if(!us.has(String(i))){sg=String(i);break}
    us.add(sg);out[k]=sg});return out}
export const libPedra$=(S,n)=>{const C=cfg$(S),m=(C.coresMeta||{})[corKey(n)];if(m&&m.ped!=null)return !!m.ped;return !(C.banhistas||[]).some(b=>(b.banhos||[]).some(x=>corKey(x.cor)===corKey(n)))};
export function idsCoresBiblioteca$(S){const C=cfg$(S),M=C.coresMeta=C.coresMeta||{},ids={},usados=new Set();
  (C.cores||[]).forEach(n=>{const k=corKey(n),m=M[k];if(m&&m.idCor){ids[k]=m.idCor;usados.add(m.idCor)}});
  (C.cores||[]).forEach(n=>{const k=corKey(n);if(ids[k])return;let id="L:"+k;if(usados.has(id)){do{id="L:id_"+uid()}while(usados.has(id));M[k]=M[k]||{};M[k].idCor=id}ids[k]=id;usados.add(id)});return ids}
export const libCores$=(S)=>{const C=cfg$(S),sg=libSiglas$(S),M=C.coresMeta||{},ids=idsCoresBiblioteca$(S);return (C.cores||[]).filter(((...a)=>libPedra$(S,...a))).map(n=>{const k=corKey(n);return {id:ids[k],nome:n,texto:(M[k]&&M[k].txt)||"",letra:sg[k]||"",lib:true}})};
export const coresDaCat$=(S,cat,sub)=>{const c=catBy$(S,cat);if(!c)return [];const own=Array.isArray(c.cores)?c.cores:[],ss=(c.coresCfg&&c.coresCfg.subs)||[],base=own.length&&(!ss.length||ss.includes(sub))?own:[],nomes=new Set(base.map(x=>corKey(x.nome)));return base.concat(libCores$(S).filter(x=>!nomes.has(corKey(x.nome))))};
export const coresPadrao$=(S,cat,sub)=>{const c=catBy$(S,cat),p=(c&&c.coresCfg&&c.coresCfg.padrao)||[];return coresDaCat$(S,cat,sub).map(x=>x.id).filter(id=>p.includes(id))};
export const coresItem$=(S,cat,x)=>{const c=catBy$(S,cat),cf=(c&&c.coresCfg)||{},m=(cfg$(S).coresMeta||{})[corKey(x.nome)]||{},ref=m.semRef?"":cf.modoRef==="nome"?String(x.nome):String(x.letra||"");return {id:"c_"+x.id,letra:String(x.letra||""),nome:x.nome,ref,texto:m.semTexto||x.texto==="-"?"":(!vazio(x.texto)?(/^\s/.test(x.texto)?x.texto:" "+x.texto):" "+x.nome),col:cf.col||"",valor:cf.col?x.nome:"",cfCol:cf.col||""}};
export const coresSel$=(S,l)=>{const lst=coresDaCat$(S,l.v&&l.v.I,l.v&&l.v.J),s=l.csel||[];return lst.filter(x=>s.includes(x.id)).map(x=>coresItem$(S,l.v.I,x))};
export const coresSel_antigo$=(S,l)=>{const c=catBy$(S,l.v&&l.v.I),lst=(c&&c.cores)||[],s=l.csel||[];return lst.filter(x=>s.includes(x.id)).map(x=>({id:"c_"+x.id,letra:String(x.letra||""),nome:x.nome,ref:String(x.letra||""),texto:x.texto==="-"?"":(!vazio(x.texto)?(/^\s/.test(x.texto)?x.texto:" "+x.texto):" "+x.nome),col:"",valor:""}))};
export const itensGrade$=(S,l)=>{const g=gradeBy$(S,l.grade),sz=(!g||l.semGrade)?[]:g.itens.filter(x=>(l.gsel||[]).includes(x.id)).map(x=>efetivo(g,x)),cs=coresSel$(S,l);
  if(!cs.length)return sz;if(!sz.length)return cs;
  return sz.flatMap(a=>cs.map(c=>({...a,extra:c.cfCol?{[c.cfCol]:c.nome}:undefined,id:a.id+"+"+c.id,letra:a.letra+c.letra,nome:(a.nome||a.letra)+" "+c.nome,ref:(a.g&&a.g.modoRef==="nome"?String(a.nome||a.letra):a.letra)+c.ref,texto:a.texto+c.texto,seq:[a,c]})))};
export const temGrade$=(S,l)=>itensGrade$(S,l).length>0;
export function prefixosTodos$(S){const C=cfg$(S),m=new Map(),sec=new Map(),add=(mp,p,n)=>{p=String(p||"").toUpperCase();if(!p)return;if(!mp.has(p))mp.set(p,[]);if(n&&!mp.get(p).includes(n))mp.get(p).push(n)};
  C.categorias.forEach(c=>add(m,c.prefixo,c.nome));
  C.categorias.forEach(c=>Object.entries(c.subPref||{}).forEach(([sub,pp])=>{pp=String(pp).toUpperCase();if(m.has(pp))m.get(pp).push(c.nome+" › "+sub);else add(sec,pp,c.nome+" › "+sub)}));
  return {m,sec}}
export function fnum$(S,p,n){const t=String(cfg$(S).seqs[p]??""),w=/^0[0-9]+$/.test(t)?t.length:0;n=String(n);return w>n.length?n.padStart(w,"0"):n}
export function insumosItensResumo$(S,cat){const C=cfg$(S),it=Array.isArray(C.insumosItens)?C.insumosItens:[],usados=it.filter(x=>x&&(!x.cat||x.cat===cat)),soma=usados.reduce((a,x)=>a+(num(x.qtd)||0)*(num(x.valor)||0),0);return {itens:usados,total:Math.round((soma+Number.EPSILON)*100)/100}}
export const padraoDe$=(S,cat,L)=>{const C=cfg$(S),k=catPad[L],c=k?catBy$(S,cat):null;if(!C.colcfg[L])return "";const antigo=c&&!vazio(c[k])?c[k]:C.colcfg[L].padrao;
  if(L!=="Q"||!['somar','substituir'].includes(C.insumosModo))return antigo;
  const itens=insumosItensResumo$(S,cat).total,base=num(antigo)||0;return String(Math.round(((C.insumosModo==='somar'?base:0)+itens+Number.EPSILON)*100)/100)};
export function insumosContaHTML$(S,cat,manual,linhaManual){
  if(linhaManual)return 'valor informado diretamente nesta linha da tabela';
  if(!vazio(manual))return 'valor informado diretamente na peça';
  const C=cfg$(S),c=catBy$(S,cat),temCat=c&&!vazio(c.insumos),base=temCat?c.insumos:C.colcfg.Q.padrao,origem=temCat?'padrão da categoria':'padrão geral',modo=C.insumosModo||'off';
  if(modo==='off')return `${origem}: R$ ${brl(num(base)||0)} por peça; itens detalhados não aplicados`;
  const {itens,total}=insumosItensResumo$(S,cat),linhas=itens.map(x=>`${esc(x.nome)} (${x.cat?'categoria '+esc(x.cat):'geral'}): ${fmt(num(x.qtd)||0)} × R$ ${brl(num(x.valor)||0)} = R$ ${brl((num(x.qtd)||0)*(num(x.valor)||0))}`),subtotal=linhas.length?linhas.join(' + '):'nenhum item aplicável';
  return `${modo==='somar'?origem+' R$ '+brl(num(base)||0)+' + ':''}${subtotal} = R$ ${brl(num(padraoDe$(S,cat,'Q'))||0)} por peça`;
}
export const val$=(S,l,L)=>L==="J"&&Object.prototype.hasOwnProperty.call(l.v,L)?l.v[L]:(vazio(l.v[L])?padraoDe$(S,l.v.I,L):l.v[L]);
export const opcoesDe$=(S,L)=>String((cfg$(S).colcfg[L]||{}).opcoes||"").split(";").map(s=>s.trim()).filter(Boolean);
export function descBanho$(S,l,b,i){const d=comSufixoCat$(S,val$(S,l,"F"),val$(S,l,"I"),l.semSufixoCat);if(i===0||!b.sufixo)return d;const sx=String(b.sufixo);if(d.toLowerCase().includes(sx.trim().toLowerCase()))return d;
  /* Só une expressões de prata quando o material está no fim e o banho tem o mesmo qualificativo. */
  const banho=sx.trim().match(/^banho\s+(prata(?:\s+925)?)$/i),fim=d.match(/\b(prata(?:\s+925)?)\s*$/i);
  if(banho&&fim&&banho[1].toLowerCase()===fim[1].toLowerCase())return d.slice(0,fim.index)+"banho "+fim[1];
  return d+sx}
export const modeloAtual$=(S)=>{const C=cfg$(S);return (C.modelos||[]).find(x=>x.id===C.modelo)||C.modelos[0]};
export const colunasExport$=(S)=>modeloAtual$(S).cols.filter(c=>c.on!==false);
export const nomeTela$=(S,L)=>{const c=modeloAtual$(S).cols.find(x=>x.on!==false&&x.k===L);return c?c.h:NOME[L]};
/* Ajuda de custo exibida em cada banho do cadastro de galvânica: mostra as fórmulas e um exemplo com os valores atuais,
   para escolher o valor por grama e o fator sem fazer conta de cabeça. */
export function bnAjuda(C,bh,x){
  const m=num(x.mult),fa=num(x.fator),vz=num(bh.verniz)||0,usaVz=vzPad(bh,x)&&vz>0,ins=num((C.colcfg&&C.colcfg.Q&&C.colcfg.Q.padrao))||0;
  const R=n=>"R$ "+brl(n),g=n=>String(Math.round(n*1000)/1000).replace(".",",");
  let banho,formula;
  if(x.modo==="nenhum"||!x.coluna){return `<tr class="bn-ajuda"><td colspan="10" data-th=""><div class="bnx"><b>Custo</b><span>Este banho não gera custo de banho nem de verniz: só marca a peça.</span></div></td></tr>`}
  if(x.modo==="fixo"){formula=`Banho = ${m==null?"valor fixo (digite abaixo, em “Milésimos e valor por categoria”)":R(m)+" por peça"}`;banho=m||0}
  else{formula=`Banho = peso × ${m==null?"R$/g (digite abaixo, em “Milésimos e valor por categoria”)":R(m)+"/g"}`;banho=null}
  const peso=2,compra=5;
  const bn=x.modo==="fixo"?(m||0):(m||0)*peso,vn=usaVz?vz*peso:0,custo=compra+ins+bn+vn;
  const exemplo=m==null?"":`Ex.: peça de ${g(peso)} g, compra ${R(compra)}${ins?`, insumos ${R(ins)}`:""} → banho ${R(bn)}${usaVz?` + verniz ${R(vn)}`:""} = custo <b>${R(custo)}</b>${fa?` → × ${g(fa)} = varejo <b>${R(custo*fa)}</b>`:" · defina o Fator × para ver o preço de venda"}`;
  return `<tr class="bn-ajuda"><td colspan="10" data-th=""><div class="bnx"><b>Como o custo é calculado</b><span>${formula}${usaVz?` · Verniz = peso × ${R(vz)}/g`:""}</span><span>Custo = compra + insumos + banho${usaVz?" + verniz":""} · Varejo = custo × fator${fa?` (${g(fa)})`:""}</span>${exemplo?`<span class="ex">${exemplo}</span>`:""}</div></td></tr>`;
}
/* Fórmulas do custo desta linha (banho e verniz) e o preço de venda para alguns fatores, para escolher o fator ou o valor do banho. */
export function bfFormula(r,custo,mk){
  const R=n=>"R$ "+brl(n),b=r.banho,partes=[];
  if(b&&b.mult!=null){partes.push(b.modo==="fixo"?`banho = <b>${R(b.mult)}</b> fixo`:`banho = peso × <b>${R(b.mult)}/g</b>`)}
  if(b&&r.verniz!=null)partes.push(`verniz = peso × <b>${R(r.verniz)}/g</b>`);
  const sug=custo>0?[2,2.5,3,3.5,4].map(f=>`×${fmt(f)} = <b>${R(custo*f)}</b>`).join(" · "):"";
  if(!partes.length&&!sug)return "";
  return `${partes.length?`<span class="bfx-d">${partes.join(" · ")}</span>`:""}${sug?`<br><span class="bfx-d">Preço de venda: ${sug}${mk?` · atual ×${fmt(mk)}`:""}</span>`:""}`;
}
