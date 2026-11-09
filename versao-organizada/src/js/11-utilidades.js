/* ===== utilidades ===== */
const DENY_ID=/["'<>`=\s&\\]/g;
const idLimpo=x=>String(x==null?"":x).replace(DENY_ID,"");
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function num(s){if(s==null)return null;if(typeof s==="number")return isFinite(s)?s:null;let t=String(s).replace(/R\$|\s|%/g,"");if(!t)return null;
  /* aceita 1.234,56 (pt-BR) e 1,234.56 (en): o último separador é o decimal; os outros são milhar (grupos de 3). Só "," ou só 1 "." = decimal */
  {const c=t.lastIndexOf(","),p=t.lastIndexOf(".");
  if(c>=0&&p>=0){const dec=c>p?",":".",mil=dec===","?".":",",pt=t.split(dec);if(pt.length>2||pt[0].split(mil).slice(1).some(x=>x.length!==3))return null;t=pt[0].split(mil).join("")+"."+pt[1]}
  else if(c>=0){if(t.split(",").length>2){if(!/^-?\d{1,3}(,\d{3})+$/.test(t))return null;t=t.replace(/,/g,"")}else t=t.replace(",",".")}
  else if(p>=0&&t.split(".").length>2){if(!/^-?\d{1,3}(\.\d{3})+$/.test(t))return null;t=t.replace(/\./g,"")}}
  if(!/^-?\d*\.?\d+$/.test(t))return null;const n=parseFloat(t);return isFinite(n)?n:null}
const r4=n=>Math.round(n*10000)/10000;
const brl=n=>(n||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmt=n=>n==null?"":String(r4(n)).replace(".",",");
const vazio=v=>v==null||String(v).trim()==="";
const cfg=()=>S.config;
const catBy=n=>cfg().categorias.find(c=>c.nome===n);
const fornBy=n=>cfg().fornecedores.find(f=>f.nome===n);
const banhistaBy=id=>cfg().banhistas.find(b=>b.id===id)||cfg().banhistas[0];
/* bhDe: a galvânica de uma peça (hoje sempre a cadastrada: custo do banho e do verniz acompanham o cadastro) */
const bhDe=x=>banhistaBy(x&&x.banhista);
/* O Preço de Varejo só existe na peça lançada se o usuário o DIGITOU dentro da peça. O fator gera apenas uma SUGESTÃO (mostrada no formulário); o valor definitivo é do usuário. */
const prefDe=(cat,sub)=>{const c=catBy(cat)||{},sp=sub&&c.subPref&&c.subPref[sub];return String(sp||c.prefixo||"BR").toUpperCase()};
function comSufixoCat(d,cat){const sx=(catBy(cat)||{}).sufixo;d=String(d||"").trim();if(!sx||!d)return d;return d.toLowerCase().includes(sx.trim().toLowerCase())?d:d+(/^[\s,.;:)]/.test(sx)?"":" ")+sx}   /* sem espaço no começo do texto, o sistema põe um (senão “lisa”+“folheado” saía “lisafolheado”) */
const ultimo=p=>Math.trunc(num(cfg().seqs[p])||0);
/* uma categoria pode usar os tamanhos de outra (grade.usa = nome da categoria de origem): edita-se uma vez só */
function libGradeSel(attr){const C=cfg(),o=[];C.categorias.forEach(c=>{if(c.grade&&!c.grade.usa&&!c.grade.usaId)o.push(["c:"+c.nome,(c.grade.nome||"Variação")+" ("+c.nome+")"])});(C.grades||[]).forEach(g=>o.push(["o:"+g.id,g.nome]));
  return o.length?`<select ${attr} class="gi tod" aria-label="Usar uma variação cadastrada" style="width:auto" title="Tamanhos, P M G ou outra variação cadastrada na aba Cores, tamanhos e variações">`+`<option value="">＋ Usar variação cadastrada…</option>${o.map(([v,n])=>`<option value="${esc(v)}">${esc(n)}</option>`).join("")}</select>`:""}
const fatorBanho=id=>{for(const h of cfg().banhistas)for(const b of h.banhos)if(b.id===id)return b.fator||"";return ""};
function effGrade(c){const g=c&&c.grade;if(g&&g.usaId){const o=(cfg().grades||[]).find(x=>x.id===g.usaId);if(o)return {...o,id:g.id,subs:g.subs||[],usaId:g.usaId}}if(g&&g.usa){const o=catBy(g.usa);if(o&&o.grade&&!o.grade.usa)return {...o.grade,id:g.id,subs:g.subs||[],usa:g.usa}}return g}
const todasGrades=()=>{const o=[];cfg().categorias.forEach(c=>{if(c.grade)o.push(effGrade(c))});(cfg().grades||[]).forEach(g=>o.push(g));return o};
const gradeBy=id=>id?(todasGrades().find(g=>g.id===id)||null):null;
/* a variação de cada peça vem só da categoria (e subcategoria) escolhida */
function gradeDaCat(cat,sub){const c=catBy(cat),g=c&&effGrade(c);if(!g||!g.itens||!g.itens.length)return null;const ss=g.subs||[];return !ss.length||ss.includes(sub)?g:null}
/* ids das opções para uma faixa digitada: 12-16 (de 12 a 16), 12, 18 (esses), todos */
function selFaixa(gr,txt){const sel=new Set();
  String(txt||"").replace(/(\d)\s*(?:-|–|—|a|até|ate|ao)\s*(?=\d)/gi,"$1-").split(/[;, ]+/).filter(Boolean).forEach(tk=>{const m=tk.match(/^([0-9]+)-([0-9]+)$/);
    if(m){const lo=Math.min(+m[1],+m[2]),hi=Math.max(+m[1],+m[2]);gr.itens.forEach(it=>{const n=parseFloat(it.nome);if(n>=lo&&n<=hi)sel.add(it.id)})}
    else if(tk.toLowerCase()==="todos")gr.itens.forEach(it=>sel.add(it.id));
    else gr.itens.forEach(it=>{if(String(it.nome)===tk)sel.add(it.id)})});
  return gr.itens.map(i=>i.id).filter(id=>sel.has(id))}
function sincGrade(f){const g=gradeDaCat(f.v.I,f.v.J),id=g?g.id:"";if(id!==(f.grade||"")){f.grade=id;f.gsel=g&&g.faixa?selFaixa(g,g.faixa):[];f.semGrade=false}}
/* verniz por variação de banho: o que foi marcado nesta peça vale; sem marca, vale o padrão do banho */
/* banhos marcados: peça bruta usa "on"; peça pronta usa "onP" (só cor, letra e milésimos — sem custo de banho) */
/* sufixo da referência: letra do banho + letra (AA, BA…) ou nome (A12) da opção, conforme a variação */
const refParte=(b,it)=>(b?b.letra:"")+(!it?"":(it.ref!=null?it.ref:(it.g&&it.g.modoRef==="nome"?String(it.nome||it.letra):it.letra)));
const onDe=l=>l.tipo==="bruta"?(l.on=l.on||{}):(l.onP=l.onP||{});
const bonP=l=>l.tipo==="pronta"?bhDe(l).banhos.filter(b=>(l.onP||{})[b.id]):[];
const vzPad=(bh,b)=>b.vz!=null?!!b.vz:bh.vernizOn!==false;
const vzOn=(l,bh,b)=>l.vz&&b.id in l.vz?!!l.vz[b.id]:vzPad(bh,b);
/* Texto, coluna e valor de cada opção seguem a variação (rótulo, coluna e nome) até serem digitados à mão: trocar "aro" por "tamanho" ou o nome de uma opção atualiza tudo. */
const rotG=g=>g.rotulo==null?" ":g.rotulo;
const efetivo=(g,x)=>({...x,g,texto:!vazio(x.texto)?x.texto:rotG(g)+(x.nome||x.letra),col:!vazio(x.col)?x.col:(g.col||""),valor:!vazio(x.valor)?x.valor:(g.col||!vazio(x.col)?(x.nome||""):"")});
/* sigla sugerida a partir do nome (Azul → AZ, Rosa → RO); se já existe na categoria tenta outras letras; por fim cai no número */
const proxCorLetra=(c,nome)=>{const us=new Set(((c&&c.cores)||[]).map(x=>String(x.letra||"").toUpperCase()));const w=semAc(String(nome||"")).toUpperCase().replace(/[^A-Z0-9]/g,"");if(w.length>=2){const cand=[w.slice(0,2)];for(let k=2;k<w.length;k++)cand.push(w[0]+w[k]);for(const q of cand)if(!us.has(q))return q}for(let i=1;i<100;i++)if(!us.has(String(i)))return String(i);return ""};
/* biblioteca de cores (aba Cores, tamanhos e variações): vale para qualquer categoria; a peça escolhe */
const corKey=n=>semAc(String(n||"")).trim();
function libSiglas(){const C=cfg(),M=C.coresMeta||{},us=new Set(),out={};(C.cores||[]).forEach(n=>{const m=M[corKey(n)];if(m&&m.sig)us.add(String(m.sig).toUpperCase())});
  (C.cores||[]).forEach(n=>{const k=corKey(n),m=M[k];if(m&&m.sig){out[k]=String(m.sig).toUpperCase();return}
    const w=k.toUpperCase().replace(/[^A-Z0-9]/g,""),cand=[];if(w.length>=2){cand.push(w.slice(0,2));for(let q=2;q<w.length;q++)cand.push(w[0]+w[q])}
    let sg="";for(const q of cand)if(!us.has(q)){sg=q;break}
    if(!sg)for(let i=1;i<100;i++)if(!us.has(String(i))){sg=String(i);break}
    us.add(sg);out[k]=sg});return out}
const libPedra=n=>{const C=cfg(),m=(C.coresMeta||{})[corKey(n)];if(m&&m.ped!=null)return !!m.ped;return !(C.banhistas||[]).some(b=>(b.banhos||[]).some(x=>corKey(x.cor)===corKey(n)))};
const libCores=()=>{const C=cfg(),sg=libSiglas(),M=C.coresMeta||{};return (C.cores||[]).filter(libPedra).map(n=>{const k=corKey(n);return {id:"L:"+k,nome:n,texto:(M[k]&&M[k].txt)||"",letra:sg[k]||"",lib:true}})};
const coresDaCat=(cat,sub)=>{const c=catBy(cat);if(!c)return [];const own=Array.isArray(c.cores)?c.cores:[],ss=(c.coresCfg&&c.coresCfg.subs)||[],base=own.length&&(!ss.length||ss.includes(sub))?own:[],nomes=new Set(base.map(x=>corKey(x.nome)));return base.concat(libCores().filter(x=>!nomes.has(corKey(x.nome))))};
const coresPadrao=(cat,sub)=>{const c=catBy(cat),p=(c&&c.coresCfg&&c.coresCfg.padrao)||[];return coresDaCat(cat,sub).map(x=>x.id).filter(id=>p.includes(id))};
const coresItem=(cat,x)=>{const c=catBy(cat),cf=(c&&c.coresCfg)||{};return {id:"c_"+x.id,letra:String(x.letra||""),nome:x.nome,ref:cf.modoRef==="nome"?String(x.nome):String(x.letra||""),texto:x.texto==="-"?"":(!vazio(x.texto)?(/^\s/.test(x.texto)?x.texto:" "+x.texto):" "+x.nome),col:cf.col||"",valor:cf.col?x.nome:"",cfCol:cf.col||""}};
const coresSel=l=>{const lst=coresDaCat(l.v&&l.v.I,l.v&&l.v.J),s=l.csel||[];return lst.filter(x=>s.includes(x.id)).map(x=>coresItem(l.v.I,x))};
const coresSel_antigo=l=>{const c=catBy(l.v&&l.v.I),lst=(c&&c.cores)||[],s=l.csel||[];return lst.filter(x=>s.includes(x.id)).map(x=>({id:"c_"+x.id,letra:String(x.letra||""),nome:x.nome,ref:String(x.letra||""),texto:x.texto==="-"?"":(!vazio(x.texto)?(/^\s/.test(x.texto)?x.texto:" "+x.texto):" "+x.nome),col:"",valor:""}))};
const itensGrade=l=>{const g=gradeBy(l.grade),sz=(!g||l.semGrade)?[]:g.itens.filter(x=>(l.gsel||[]).includes(x.id)).map(x=>efetivo(g,x)),cs=coresSel(l);
  if(!cs.length)return sz;if(!sz.length)return cs;
  return sz.flatMap(a=>cs.map(c=>({...a,extra:c.cfCol?{[c.cfCol]:c.nome}:undefined,id:a.id+"+"+c.id,letra:a.letra+c.letra,nome:(a.nome||a.letra)+" "+c.nome,ref:(a.g&&a.g.modoRef==="nome"?String(a.nome||a.letra):a.letra)+c.letra,texto:a.texto+c.texto,seq:[a,c]})))};
const temGrade=l=>itensGrade(l).length>0;
/* Se a descrição já traz o tamanho ("aro 14" ou o rótulo antigo), ele é trocado pelo da linha em vez de somado ("aro 14 aro 12"). */
function descVar(d,it){if(it&&it.seq)return it.seq.reduce((a,x)=>descVar(a,x),d);if(!it||!it.texto)return d;d=String(d||"");const g=it.g;
  if(g){const B=String.fromCharCode(92),ro=s=>String(s).split("").map(c=>"[]{}()|.*+?^$-/".indexOf(c)>=0?B+c:c).join(""),pal=[g.rotulo,...(g.sin||[])].map(x=>String(x||"").trim()).filter(Boolean),nomes=g.itens.map(x=>x.nome).filter(Boolean).map(ro).join("|");
    pal.forEach(w=>{d=d.replace(new RegExp("(^| )"+ro(w)+" *(?:[0-9]+(?:[.,][0-9]+)?"+(nomes?"|"+nomes:"")+")(?= |$)","gi"),"$1")});
    d=d.replace(/ {2,}/g," ").trim()}
  return d.toLowerCase().includes(it.texto.trim().toLowerCase())?d:d+it.texto}
function prefixosTodos(){const C=cfg(),m=new Map(),sec=new Map(),add=(mp,p,n)=>{p=String(p||"").toUpperCase();if(!p)return;if(!mp.has(p))mp.set(p,[]);if(n&&!mp.get(p).includes(n))mp.get(p).push(n)};
  C.categorias.forEach(c=>add(m,c.prefixo,c.nome));
  C.categorias.forEach(c=>Object.entries(c.subPref||{}).forEach(([sub,pp])=>{pp=String(pp).toUpperCase();if(m.has(pp))m.get(pp).push(c.nome+" › "+sub);else add(sec,pp,c.nome+" › "+sub)}));
  return {m,sec}}
/* barra fixa "Numeração do sistema": só os prefixos que existem nas categorias; os próprios de subcategorias ficam num grupo à parte */
function renderNum(){const el=document.getElementById("numbar");if(!el)return;const C=cfg(),{m,sec}=prefixosTodos(),ps=[...m.keys()],ss=[...sec.keys()],sig=ps.join(",")+"|"+ss.join(",");
  const lanc=new Set(S.lanc.map(l=>prefDe(val(l,"I"),val(l,"J")))),atual=new Set([prefDe(S.form.v.I,S.form.v.J)]);
  if(ROM)ROM.rows.forEach(r=>{if(!r.skip)atual.add(prefDe(r.cat,r.sub))});
  const lab=(p,mp)=>`<label class="nb" data-p="${esc(p)}" title="${esc(mp.get(p).join(" · "))}"><span>${esc(p)}</span><input class="n" data-ult="${esc(p)}" inputmode="numeric" aria-label="Última peça ${esc(p)}"><small></small></label>`;
  if(el.dataset.sig!==sig){el.dataset.sig=sig;const aberto=el.querySelector("details.nb-x")&&el.querySelector("details.nb-x").open;
    el.innerHTML=`<b class="nb-t">Numeração do sistema</b><span class="hint nb-h">última peça de cada categoria — vale para o lançamento manual e para o romaneio · com zeros à esquerda (ex.: 0050) as referências mantêm a largura (CL0051)</span><div class="nb-l">${ps.map(p=>lab(p,m)).join("")}</div>${ss.length?`<details class="nb-x" ${aberto?"open":""}><summary>Prefixos só de subcategorias (${ss.length}): ${ss.map(esc).join(", ")}</summary><div class="nb-l">${ss.map(p=>lab(p,sec)).join("")}</div></details>`:""}`}
  [...ps,...ss].forEach(p=>{const lb=el.querySelector(`label[data-p="${CSS.escape(p)}"]`);if(!lb)return;const inp=lb.querySelector("input"),v=String(C.seqs[p]??"");
    if(document.activeElement!==inp&&inp.value!==v)inp.value=v;
    const uso=atual.has(p)||lanc.has(p);lb.classList.toggle("on",atual.has(p));lb.classList.toggle("bad",uso&&!(ultimo(p)>0));
    lb.querySelector("small").textContent="→ "+p+fnum(p,proxDe(p))})}
/* se a última peça foi digitada com zeros à esquerda (ex.: 0050), as referências novas mantêm a largura (CL0051) */
function fnum(p,n){const t=String(cfg().seqs[p]??""),w=/^0[0-9]+$/.test(t)?t.length:0;n=String(n);return w>n.length?n.padStart(w,"0"):n}
function proxDe(p){return Math.max(inicioDe(p),(G&&G.cont&&G.cont[p])||0)+1}
function inicioDe(p,g){return Math.max(ultimo(p),((g||G||{}).manual||{})[p]||0)}
function contFinal(g){const o={...g.cont};Object.entries(g.manual||{}).forEach(([p,n])=>{if(n>(o[p]||0))o[p]=n});return o}
/* NCM, CFOP, FCP e Custo de Insumos podem ter valor próprio em cada categoria; sem ele vale o padrão da coluna */
const catPad={Y:"ncm",AA:"cfop",AB:"fcp",Q:"insumos"};
const padraoDe=(cat,L)=>{const k=catPad[L];if(k){const c=catBy(cat);if(c&&!vazio(c[k]))return c[k]}return cfg().colcfg[L].padrao};
const val=(l,L)=>vazio(l.v[L])?padraoDe(l.v.I,L):l.v[L];
const opcoesDe=L=>String(cfg().colcfg[L].opcoes||"").split(";").map(s=>s.trim()).filter(Boolean);
function listaDe(L,catNome){const C=cfg();let base=[];
  if(L==="H")base=C.fornecedores.map(f=>f.nome);else if(L==="I")base=C.categorias.map(c=>c.nome);
  else if(L==="J"){const c=catBy(catNome);base=c?c.subs:[]}else if(L==="L")base=C.cores;else if(L==="M")base=C.observacoes;
  else if(L==="AD")base=["Não","Sim"];else if(L==="AE")base=["Ativo","Inativo"];
  return [...new Set([...base,...opcoesDe(L)])]}
function opts(list,sel,blank){return (blank!=null?`<option value="">${esc(blank)}</option>`:"")+list.map(v=>{const [vv,tt]=Array.isArray(v)?v:[v,v];return `<option value="${esc(vv)}"${vv===sel?" selected":""}>${esc(tt)}</option>`}).join("")+(sel&&!list.some(v=>(Array.isArray(v)?v[0]:v)===sel)?`<option selected>${esc(sel)}</option>`:"")}
function toast(msg,acao){const t=document.getElementById("toast");t.innerHTML=`<span>${esc(msg)}</span>`+(acao?`<button type="button" id="tBtn">${esc(acao.t)}</button>`:"");t.hidden=false;if(acao)document.getElementById("tBtn").onclick=()=>{t.hidden=true;acao.fn()};clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,acao?6500:2600)}
function descBanho(l,b,i){const d=comSufixoCat(val(l,"F"),val(l,"I"));if(i===0||!b.sufixo)return d;return d.toLowerCase().includes(b.sufixo.trim().toLowerCase())?d:d+b.sufixo}

