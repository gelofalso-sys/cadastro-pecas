/* ===== colar romaneio: lê a lista do fornecedor com um modelo de leitura ===== */
const MON="(\\d[\\d.]*,\\d{2})";
const numQtd=s=>{s=String(s);return /^\d{1,3}(\.\d{3})+$/.test(s)?num(s.replace(/\./g,"")):num(s)};
const TOK={desc:"(.{1,250}?)",cod:"([^\\s\\]\\[]+)",preco:MON,precod:MON,total:MON,qtd:"(\\d+)",x:"(?:.*?)",item:"(?:\\d{1,4})",u:"(?:\\s+([A-Za-z]{1,4})\\.?\\s+)?",qv:"(\\d[\\d.]*(?:,\\d+)?)",pu:"(\\d[\\d.]*,\\d{2,4})"};
function padraoRegex(pad){const ordem=[];let src="";
  String(pad||"").split(/(\{\w+\})/).forEach(p=>{const m=p.match(/^\{(\w+)\}$/);
    if(m&&TOK[m[1]]){if(m[1]==="u"&&src.endsWith("\\s*"))src=src.slice(0,-3);if(m[1]!=="x"&&m[1]!=="item")ordem.push(m[1]);src+=TOK[m[1]]}
    else src+=p.split(/\s+/).map(z=>z.replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&")).join("\\s*")});
  return {re:new RegExp(src,"g"),ordem}}
/* padrão com quantificador dentro de grupo também quantificado, ex.: (a+)+ ou (\d*)* , pode travar a aba: não é aceito */
const rxPerigo=x=>/\((?:[^()\\]|\\.)*[+*}](?:[^()\\]|\\.)*\)\s*(?:[+*]|\{\d)/.test(String(x))||/\((?:\?:)?[^()]*\|[^()]*\)\s*[+*{]/.test(String(x));
const rxs=(x,f)=>{try{if(rxPerigo(x))return null;return new RegExp(x,f||"i")}catch(e){return null}};
function mapaCat(desc,T){const d=semAc(desc);
  for(const par of String(T.mapa||"").split(/[;\n]/)){const [a,b]=par.split("=").map(z=>(z||"").trim());if(a&&b&&d.startsWith(semAc(a))&&catBy(b.split(">")[0].trim()))return b}
  const w=d.split(/[\s,]+/)[0];const c=cfg().categorias.find(c=>w&&semAc(c.nome).startsWith(w.slice(0,4)));return c?c.nome:""}
const ROM_MAX=60000;
function lerRomaneio(texto,T){
  const R={rows:[],obs:"",conf:"",erro:""};
  let flat=String(texto||"").replace(/ /g," ").replace(/\s+/g," ").trim();
  if(!flat){R.erro="Cole o texto da lista.";return R}
  if(flat.length>ROM_MAX){R.erro=`O texto colado é grande demais (${Math.round(flat.length/1000)} mil caracteres; o limite é ${ROM_MAX/1000} mil). Cole a lista por partes — ou confira se não copiou a página inteira.`;return R}
  const full=flat;
  if(T.obsRe){const r=rxs(T.obsRe),m=r&&full.match(r);if(m)R.obs=String(m[1]||m[0]).trim()}
  if(T.lixo){const r=rxs(T.lixo,"gi");if(r)flat=flat.replace(r," ")}
  if(T.ini){const i=flat.toLowerCase().indexOf(String(T.ini).toLowerCase());if(i>=0)flat=flat.slice(i+T.ini.length)}
  if(T.fim){const i=flat.toLowerCase().indexOf(String(T.fim).toLowerCase());if(i>=0)flat=flat.slice(0,i)}
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
  if(T.valorRe){const r=rxs(T.valorRe),m2=r&&full.match(r);if(m2){const v=num(m2[1]);pt.push(v!=null&&Math.abs(v-sv)<0.05?`✓ valor R$ ${brl(sv)} confere`:`⚠ a lista diz R$ ${brl(v||0)} e li R$ ${brl(sv)}`)}}
  if(corte)pt.push("⚠ A LISTA FOI CORTADA: li só as primeiras 3.000 peças e ainda havia mais linhas. Divida o texto em partes e cole de novo.");
  if(R.cab)pt.push(`⚠ ignorei o cabeçalho “${R.cab}” antes da 1ª peça`);
  {const cont={};R.rows.forEach(r=>{if(r.cod)cont[r.cod]=(cont[r.cod]||0)+1});const rep=Object.keys(cont).filter(k=>cont[k]>1);
    if(rep.length){R.rows.forEach(r=>{if(r.cod&&cont[r.cod]>1)r.aviso=(r.aviso?r.aviso+" ":"")+"· código repetido na lista: confira"});pt.push(`⚠ código repetido na lista: ${rep.slice(0,5).join(", ")}${rep.length>5?"…":""}`)}}
  if(fimLido&&/R\$\s*\d[0-9.]*,\d{2}/.test(flat.slice(fimLido).replace(/(?:valor\s+(?:total\s+da\s+compra|produtos|j[aá]\s+pago)|custo\s+separa[cç][aã]o|sub-?total|total(?:\s+(?:produtos|geral|itens))?|desconto[^:]{0,40}|frete|taxa[^:]{0,40})\s*:?\s*R\$\s*\d[0-9.]*,\d{2}/gi,"")))pt.push("⚠ sobrou texto com valores depois da última peça lida (alguma linha sem código ou em outro formato?)");
  R.conf=pt.join(" · ");return R}
const romT=()=>{const C=cfg();return C.romaneios.find(t=>t.id===(ROM&&ROM.tid))||C.romaneios[0]};
const virg=n=>n==null?"":(Math.abs(n*100-Math.round(n*100))<1e-6?(Math.round(n*100)/100).toFixed(2):String(Math.round(n*10000)/10000)).replace(".",",");   /* preço com 3-4 casas não é arredondado */
let ROM=null;
function padroesAuto(){const cods=["[#{cod}]","[{cod}]","#{cod}","({cod})",""],pre=["R$ {preco} R$ {precod} {qtd} R$ {total}","R$ {preco} {qtd} R$ {total}","{qtd} R$ {preco} R$ {total}","R$ {preco} R$ {total} {qtd}","{preco} {qtd} {total}"],o=[];
  cods.forEach(c=>pre.forEach(q=>o.push("{desc} "+(c?c+" ":"")+q)));return o}
/* reconhece sozinho o formato da lista: testa o modelo e variações comuns e fica com o que lê mais linhas */
const romSuja=r=>/\[#?[^\]\s]+\]\s*$|\s#\d+\s*$|R\$\s*\d[0-9.]*,\d{2}/.test(String(r.desc||""));
const romScore=R=>R.rows.length-2*R.rows.filter(romSuja).length;
function lerRomaneioAuto(texto,T){let best=lerRomaneio(texto,T);
  /* escolhe o padrão que lê mais linhas LIMPAS: um padrão sem código que deixa "[#cod]" dentro da descrição perde para o que reconhece o código */
  const tx=String(texto||"");
  if(T.auto!==false)padroesAuto().forEach(pad=>{if(pad===T.padrao)return;if(pad.includes("[#")&&!tx.includes("[#"))return;if(pad.includes("R$")&&!tx.includes("R$"))return;const R=lerRomaneio(texto,{...T,padrao:pad});if(R.erro)return;if(best.erro||romScore(R)>romScore(best)||(romScore(R)===romScore(best)&&R.rows.length>best.rows.length))best=R});
  {const ruins=best.rows.filter(r=>/R\$\s*\d[0-9.]*,\d{2}|\[#/.test(String(r.desc||"")));if(ruins.length){ruins.forEach(r=>{r.aviso=(r.aviso?r.aviso+" ":"")+"· a descrição tem valores ou código: uma linha sem código pode ter sido grudada aqui — confira"});best.conf=(best.conf?best.conf+" · ":"")+`⚠ ${ruins.length} peça(s) com descrição suspeita (linha sem código?)`}}
  const nc=String(texto).split("[#").length-1;if(best.rows.length&&nc>best.rows.length)best.conf=(best.conf?best.conf+" · ":"")+`⚠ ${nc-best.rows.length} linha(s) com código não entendida(s)`;
  return best}
const romTemVar=(cat,sub)=>!!gradeDaCat(cat,sub)||coresDaCat(cat,sub).length>0;
function romIds(r){const g=gradeDaCat(r.cat,r.sub),cs=coresDaCat(r.cat,r.sub).filter(x=>(r.csel||[]).includes(x.id)).map(x=>"c_"+x.id),sz=g&&!r.semG?(r.gsel||[]):[];if(!cs.length)return sz;if(!sz.length)return cs;return sz.flatMap(a=>cs.map(c=>a+"+"+c))}
function romNomeId(cat,sub,id){const g=gradeDaCat(cat,sub),lc=coresDaCat(cat,sub),p=String(id).split("+"),o=[];p.forEach(x=>{if(x.startsWith("c_")){const c=lc.find(y=>"c_"+y.id===x);o.push(c?c.nome:"")}else{const it=g&&g.itens.find(y=>y.id===x);o.push(it?(it.nome||it.letra):"")}});return o.filter(Boolean).join(" ")}
const romKeys=(r,cols)=>{const g=gradeDaCat(r.cat,r.sub),ids=romIds(r);return ids.length?cols.flatMap(c=>ids.map(id=>c.id+"~"+id)):(g&&!r.semG?[]:cols.map(c=>c.id))};
const romSomaDe=(r,cols)=>romKeys(r,cols).reduce((t,k)=>t+Math.trunc(num(r.q[k])||0),0);
function romSetForn(nome){const f=S.form,fo=fornBy(nome);f.v.H=nome;
  if(fo){f.desconto=fo.desconto;if(fo.codigo)f.v.G=fo.codigo;else delete f.v.G;
    if(fo.tipo&&fo.tipo!==f.tipo){f.tipo=fo.tipo;if(f.tipo==="bruta"&&!Object.values(f.on||{}).some(Boolean))marcadosPadrao(f)}
    if(f.tipo==="bruta"){banhistaDoFornecedor(f);aplicarMemForn(f,fo)}}
  salvar(false);renderForm();renderTopo()}
const romTipo=r=>(r&&(r.tipo==="bruta"||r.tipo==="pronta"))?r.tipo:S.form.tipo;
const romBh=r=>banhistaBy((r&&r.bh)||S.form.banhista);
const romOn=(r,b)=>r&&r.on&&(b.id in r.on)?r.on[b.id]:((r&&r.bh&&r.bh!==S.form.banhista)?(romTipo(r)==="bruta"&&!!b.marcado):(romTipo(r)==="bruta"?S.form.on:(S.form.onP||{}))[b.id]);
function romReset(r){r.on={};r.q={};r.bo={};r.mk={};r.vz={};if(romTipo(r)!=="bruta"&&!romIds(r).length&&!gradeDaCat(r.cat,r.sub))r.q.p=String(r.qtd)}
function romColsR(r){const f=S.form,bh=romBh(r);
  if(romTipo(r)!=="bruta"){const sel=bh.banhos.filter(b=>romOn(r,b));if(!sel.length)return [{id:"p",nome:"Quantidade",letra:"",cor:"",col:""}];return sel.map(b=>({id:b.id,nome:b.nome,letra:b.letra,cor:b.cor,col:"",mil:milDe(b,(r&&r.cat)||f.v.I)}))}
  return bh.banhos.filter(b=>romOn(r,b)).map(b=>({id:b.id,nome:b.nome,letra:b.letra,cor:b.cor,col:b.coluna,mil:milDe(b,(r&&r.cat)||f.v.I)}))}
const romCols=()=>romColsR(null);
/* monta, para uma peça do romaneio, o mesmo lançamento que o formulário montaria */
function romForm(r,prev){const snap=S.form,T=romT(),bruta=romTipo(r)==="bruta",g=gradeDaCat(r.cat,r.sub),cols=romColsR(r),f=clone(snap);f.tipo=romTipo(r);f.banhista=romBh(r).id;
  if(snap.conj){delete f.conj;delete f.comp;delete f.fConj}
  f.v={...snap.v,F:r.desc,I:r.cat||snap.v.I,N:r.peso,P:r.custo,M:!vazio(r.obs)?r.obs:(ROM.obs||snap.v.M)};
  if(r.sub)f.v.J=r.sub;else delete f.v.J;delete f.v.V;delete f.v.W;if(snap.conj)["R","S","T","U"].forEach(L=>delete f.v[L]);if(r.cod)f.v.G=r.cod;
  Object.keys(r.ex||{}).forEach(L=>{if(!vazio(r.ex[L]))f.v[L]=r.ex[L]});
  /* insumos próprios do romaneio: a parte desta peça (por unidade) soma ao custo de Insumos */
  {const ins=romInsRateio(r);if(ins>0){const base=num(!vazio(f.v.Q)?f.v.Q:padraoDe(f.v.I,"Q"))||0;f.v.Q=String(r2c(base+ins));f.insRom={base:r2c(base),ins,rom:ROM.doc||""}}else delete f.insRom}
  if(!bruta){if(!vazio(r.cor))f.v.L=r.cor;if(!vazio(r.vp))f.v.V=r.vp}
  if(r.forn){f.v.H=r.forn;const fo=fornBy(r.forn);if(fo)f.desconto=fo.desconto}
  f.ft=r.fotoMini||null;f.ftR=r.fotoMini||null;f.grade=g?g.id:"";f.gsel=g?(r.gsel||[]).slice():[];f.csel=(r.csel||[]).slice();f.semGrade=!!r.semG;f.ov={};f.vinc=!bruta&&!!r.vinc&&!romIds(r).length&&(!cols.length||cols[0].id==="p");
  f.mk=clone(snap.mk||{});Object.keys(r.mk||{}).forEach(k=>{if(!vazio(r.mk[k]))f.mk[k]=r.mk[k]});
  f.vz={...(snap.vz||{}),...(r.vz||{})};
  f.desconto=((T.custo==="precod"&&r.precod!=null)||r.nfSemDesc)?"0":(r.forn&&fornBy(r.forn)?fornBy(r.forn).desconto:snap.desconto);if(!vazio(r.dsc)&&num(r.dsc)!=null&&num(r.dsc)>=0&&num(r.dsc)<=100)f.desconto=String(r.dsc);
  const q=romKeys(r,cols).map(k=>[k,Math.trunc(num(r.q[k])||0)]).filter(x=>x[1]>0);
  if(!bruta&&(!cols.length||cols[0].id==="p"))f.onP={};
  if(bruta){f.on={};{const us=new Set(q.map(([k])=>String(k).split("~")[0]));cols.forEach(c=>{f.on[c.id]=us.size?us.has(c.id):true})}   /* banho sem nenhuma quantidade não gera linha vazia */
    q.forEach(([k,n])=>{f.ov[k]={...(f.ov[k]||{}),W:String(n)}});
    cols.forEach(c=>{if(!f.on[c.id])return;const bo=(r.bo||{})[c.id]||{},o=f.ov[c.id]=f.ov[c.id]||{};
      if(!vazio(bo.L))o.L=bo.L;if(!vazio(bo.O))o.O=bo.O;if(!vazio(bo._m))o._m=bo._m;if(!vazio(bo.C))o[c.col]=bo.C;if(!vazio(bo.U))o.U=bo.U;if(!vazio(bo.V))o.V=bo.V;if(!vazio(bo.F))o.F=bo.F})}
  else if(!bruta&&cols.length&&cols[0].id!=="p"){f.onP={};cols.forEach(c=>{f.onP[c.id]=true});q.forEach(([k,n])=>{f.ov[k]={...(f.ov[k]||{}),W:String(n)}});
    cols.forEach(c=>{if(!f.onP[c.id])return;const bo=(r.bo||{})[c.id]||{},o=f.ov[c.id]=f.ov[c.id]||{};if(!vazio(bo.L))o.L=bo.L;if(!vazio(bo.O))o.O=bo.O;if(!vazio(bo.V))o.V=bo.V;if(!vazio(bo.F))o.F=bo.F})}
  else if(romIds(r).length)q.forEach(([k,n])=>{f.ov[k]={W:String(n)}});
  else if(q.length)f.v.W=String(q[0][1]);
  if(Array.isArray(r.conjComp)){f.conj=true;f.comp=clone(r.conjComp);f.tipo="pronta";delete f.fConj;conjSync(f)}
  return {f,q,cols,g}}
/* simula o que vai ser criado (referências, preços) sem gravar nada */
/* a peça refeita mantém a posição (e portanto a referência) se a categoria/prefixo é o mesmo; mudou o prefixo, vai para o fim e recebe a próxima referência da sequência nova */
const romPrefDe=l=>prefDe(val(l,"I")||"",val(l,"J"));
/* peça que sai de uma sequência (trocou de categoria): as seguintes da sequência antiga NÃO são renumeradas; ficam com a referência que já tinham (fixada como referência própria) e a vaga fica livre */
function romFixaRefs(arr,pos,p,ign,clon){const g=gerar(arr);
  for(let i=pos+1;i<arr.length;i++){const l=arr[i];if(ign.includes(l.id)||romPrefDe(l)!==p||!vazio(l.v.E))continue;
    const rw=g.linhas.find(x=>x.lancId===l.id);if(!rw)continue;const E=String(rw.v.E||""),pt=String(rw.part||""),b=pt&&E.endsWith(pt)?E.slice(0,E.length-pt.length):E;
    if(clon)arr[i]={...l,v:{...l.v,E:b}};else l.v.E=b}}
function romMonta(base,r,fk){if(r.refaz&&r.lancIds&&r.lancIds.length){const pos=base.findIndex(l=>l.id===r.lancIds[0]),vel=pos>=0?base[pos]:null,troca=!!vel&&romPrefDe(vel)!==romPrefDe(fk);
    if(troca)romFixaRefs(base,pos,romPrefDe(vel),r.lancIds,true);
    for(let j=base.length-1;j>=0;j--)if(r.lancIds.includes(base[j].id))base.splice(j,1);
    if(vel&&!troca){if(vel.v&&!vazio(vel.v.E)&&vazio(fk.v.E)){fk.v.E=vel.v.E;if(vel.rf)fk.rf=1}base.splice(Math.min(pos,base.length),0,fk);return {troca:false}}
    base.push(fk);return {troca}}
  base.push(fk);return {troca:false}}
function romPreview(){const out=[],base=S.lanc.slice();
  ROM.rows.forEach((r,i)=>{out[i]=null;if(r.skip)return;const {f}=romForm(r,true),t=romMonta(base,r,{...f,id:"__rom"+i});out[i]={rows:[],troca:t.troca}});
  if(!base.some(l=>String(l.id).startsWith("__rom")))return out;let g;try{g=gerar(base)}catch(e){return out}
  g.linhas.forEach((row,ri)=>{const id=String(row.lancId);if(!id.startsWith("__rom"))return;const o=out[+id.slice(5)];if(!o)return;
    const cs=celulas(row,ri+2,true),n=L=>{const x=cs[LET.indexOf(L)];return x&&typeof x.v==="number"?x.v:null};
    o.rows.push({ref:row.v.E,bid:row.bid,gi:row.gi,q:num(row.v.W)||0,v:n("V"),sugerido:vazio(row.v.V),cb:row.banho?n(row.banho.coluna):null,contaBanho:detalheBanhoLinha(row,row.banho?n(row.banho.coluna):null),custo:["P","Q","R","S","T","U"].reduce((t,L)=>t+(n(L)||0),0),cor:row.v.L,u:n("U"),desc:row.v.F,dup:row.dup})});
  return out}
const fm=n=>n==null?"—":"R$ "+brl(n);
function romLinhasHTML(pv,r,cols){if(!pv||!pv.rows.length)return `<span class="hint">Escolha a categoria (e os banhos) para ver as referências desta peça.</span>`;
  const aviso=pv.troca?`<span class="hint" title="A peça mudou de categoria: recebe a próxima referência da nova sequência. As outras peças da categoria antiga NÃO são renumeradas">↪ categoria nova: próxima referência da sequência; as outras peças da categoria antiga mantêm as referências (fica uma vaga)</span> `:"";
  const g=gradeDaCat(r.cat,r.sub);
  return pv.rows.map(x=>{const c=cols.find(c=>c.id===x.bid),it=x.gi?{nome:romNomeId(r.cat,r.sub,x.gi)}:null;
    return `<span class="rch${x.dup?" dup":""}" title="${esc(x.dup?"Referência repetida":"Linha que será criada")}"><b>${esc(x.ref)}</b>${c&&c.nome?` <i>${esc(c.nome)}</i>`:""}${it?` <i>${esc(it.nome||it.letra)}</i>`:""} <em>${x.q?x.q+" un.":"sem qtd"}</em> <u>${x.sugerido&&x.v!=null?"Sugestão ":""}${fm(x.v)}</u></span>`}).join("")+aviso}
function renderRom(){renderRom0();romLoteDecora();romConjDecora()}
function renderRom0(){const el=document.getElementById("romWrap");if(!el)return;if(!ROM){el.innerHTML="";renderNum();return}
  const C=cfg(),f=S.form,bruta=f.tipo==="bruta",bh=banhistaBy(f.banhista),cols=romCols();
  const fq=(rot,inner,cls)=>`<label class="fq ${cls||""}"><span>${rot}</span>${inner}</label>`;
  const exCols=LET.filter(L=>!["E","F","G","H","I","J","L","M","N","O","P","R","S","T","U","V","W"].includes(L));
  let h=`<div class="rom"><div class="rom-h"><b>${ROM.doc?"Romaneio · "+esc(ROM.doc):"Colar romaneio"}</b><label class="mod">Modelo de leitura <select data-rp="tid">${opts(C.romaneios.map(t=>[t.id,t.nome]),ROM.tid)}</select></label><button type="button" class="btn ghost sm" data-act="ir" data-sec="rom">Ajustar modelos</button><button type="button" class="btn ghost sm" data-act="rom-descartar" title="Apaga este romaneio em andamento">Descartar</button><button type="button" class="btn ghost sm" data-act="rom-fechar" style="margin-left:auto" title="Fecha o painel; o romaneio fica guardado para retomar">Guardar e fechar ×</button></div>
  <div class="rom-cfg">${fq("Fornecedor",`<select data-rp="forn">${opts(C.fornecedores.map(x=>x.nome),f.v.H||"","—")}</select>`,"w-m")}<button type="button" class="x" data-act="rom-q" data-q="forn" title="Cadastrar um fornecedor novo agora" aria-label="Novo fornecedor">＋</button>
    <div class="fq"><span>Tipo de peça</span><div class="seg" role="group" aria-label="Tipo"><button type="button" data-act="rom-tipo" data-v="bruta" aria-pressed="${bruta}" title="Peça ainda sem banho: vai para a galvânica antes de ser vendida">Bruta (vai banhar)</button><button type="button" data-act="rom-tipo" data-v="pronta" aria-pressed="${!bruta}">Pronta</button></div></div>
    ${true?`${fq("Galvânica",`<select data-rp="bh">${opts(C.banhistas.map(b=>[b.id,b.nome]),bh.id)}</select>`,"w-m")}<button type="button" class="x" data-act="rom-q" data-q="bh" title="Cadastrar uma galvânica nova agora" aria-label="Nova galvânica">＋</button><div class="fq"><span>${bruta?"Banhos (padrão de todas as peças)":"Banhos (peça pronta: uma linha por banho; nenhum = peça única)"}</span><div class="rom-bn">${bh.banhos.map(b=>`<label class="gi${(bruta?f.on:(f.onP||{}))[b.id]?" on":""}" title="Custo ${esc(b.nome)} por grama: ${esc(b.mult||"—")}"><input type="checkbox" data-rp="bn" data-b="${b.id}" ${(bruta?f.on:(f.onP||{}))[b.id]?"checked":""}><span class="dot d-${b.coluna}"></span>${esc(b.nome)} <small>${esc(b.letra)}</small></label>`).join("")}</div></div><button type="button" class="btn ghost sm" data-act="rom-q" data-q="bn" title="Cria um banho novo (ex.: Ródio negro) nesta galvânica">＋ Banho</button><button type="button" class="btn ghost sm" data-act="ir" data-sec="banho" title="Valores por grama, cores e milésimos da galvânica">Editar galvânica</button>`:""}
    ${(bruta?bh.banhos.filter(b=>f.on[b.id]).map(b=>({id:b.id,nome:"Multiplicador "+b.nome})):(()=>{const sl=bh.banhos.filter(b=>(f.onP||{})[b.id]);return sl.length?sl.map(b=>({id:b.id,nome:"Multiplicador "+b.nome})):[{id:"p",nome:"Multiplicador"}]})()).map(m=>fq(esc(m.nome)+" (varejo = custos × este valor)",`<input class="n" data-rp="mkg" data-b="${m.id}" value="${esc((f.mk||{})[m.id]??"")}" placeholder="×" inputmode="decimal">`,"w-c")).join("")}
    <span class="hint">Desconto do fornecedor <b>${esc(f.desconto||"0")}%</b></span></div>
  <div class="rom-t"><textarea data-rp="texto" rows="3" placeholder="Cole aqui o texto da lista do fornecedor, ou use Importar PDF…">${esc(ROM.texto)}</textarea><div class="rom-b"><button type="button" class="btn pri" data-act="rom-ler">Ler lista</button><label class="btn" title="Escolha ou arraste o PDF do romaneio: o sistema lê as peças e recorta as fotos">Importar PDF<input type="file" id="romPdf" accept="application/pdf,.pdf" class="vh"></label><label class="btn" title="Planilha do fornecedor (.xlsx, .xls ou .csv): você confirma qual coluna é código, descrição, quantidade e valor">Importar planilha<input type="file" id="romXls" accept=".xlsx,.xls,.csv" class="vh"></label><button type="button" class="btn" data-act="rom-nova" title="Acrescentar ao romaneio uma peça que não veio na lista (sem precisar dividir outro item)">＋ Peça nova</button><span class="hint">${esc(ROM.msg||"")}</span></div></div>`;
  h+=romPlanHTML();
  if(ROM.rows.length){
    h+=`<div class="rom-i">${fq("Observação (todas as peças)",`<input data-rp="obs" value="${esc(ROM.obs||"")}">`,"w-l")}<span class="rom-c ${/⚠/.test(ROM.conf)?"bad":""}" title="Conferência com os totais da lista">Lista: ${esc(ROM.conf||"—")}</span></div>
    <div class="rom-sum"><span class="rom-c" id="romChk"></span><button type="button" class="btn sm" data-act="rom-pend" title="Vai para a próxima peça sem peso ou com a divisão errada">Próxima pendência ▸</button>${ROM.rows.some(r=>r.feito&&!r.arq)?`<button type="button" class="btn sm" data-act="rom-refazer-todas" title="Marca todas as peças já lançadas deste romaneio para editar: ao criar, elas são substituídas (mantendo a posição)">Editar todas as já lançadas</button>`:""}${ROM.rows.some(r=>r.feito)?`<button type="button" class="btn sm danger" data-act="rom-revogar-todas" title="Retira os lançamentos da tabela atual e mantém os itens no romaneio">Revogar todos os lançamentos</button>`:""}<span id="romTot" class="hint"></span></div>
    ${!cols.length&&bruta?`<p class="hint" style="color:var(--bad)">Marque pelo menos um banho acima.</p>`:""}
    ${romBulkHTML()}
    ${romInsHTML()}
    <div class="rcs">${ROM.rows.map((r,i)=>romCardHTML(r,i)).join("")}</div>
    <div class="rom-f"><button type="button" class="btn" data-act="rom-nova" title="Acrescentar ao romaneio uma peça que não veio na lista">＋ Peça nova</button><button type="button" class="btn" data-act="rom-div-todas" title="Divide igualmente a quantidade de todas as peças (menos as de tamanhos)">÷ Dividir todas igualmente</button><span class="hint">Enter desce para o mesmo campo da próxima peça · Ctrl+Enter abre a revisão final · “Detalhes” abre cor, milésimos, custo do banho, verniz, preço e outros campos</span><button type="button" class="btn pri big" data-act="rom-criar" id="romCriar">Criar peças</button></div>`}
  el.innerHTML=h+`</div>`;if(ROM.rows.length)romAtual()}

/* Componentes do conjunto ficam no próprio item do romaneio e são lançados juntos. */
function romConjDecora(){if(!ROM)return;document.querySelectorAll("#romWrap .rc[data-i]").forEach(rc=>{const r=ROM.rows[+rc.dataset.i];if(!r||r.lote)return;const box=document.createElement("details");box.className="rom-conjunto";box.open=!!r.conjComp;box.innerHTML=`<summary>Conjunto: ${r.conjComp?"editar componentes":"configurar componentes"}</summary><div class="rom-conjunto-body">${r.conjComp?romConjCampos(r):'<p class="hint">Cadastre os componentes deste item e confira a soma de peso e compra.</p><button type="button" class="btn sm" data-rcj="ativar">Configurar conjunto</button>'}</div>`;rc.appendChild(box);if(r.conjComp){["peso","custo"].forEach(k=>{const el=rc.querySelector(`[data-rp="${k}"]`);if(el){el.readOnly=true;el.title="Calculado pela soma dos componentes do conjunto"}});const total=box.querySelector("[data-rcj-total]");if(total)total.textContent=`Soma: ${fmt(r.conjComp.reduce((t,c)=>t+(num(c.peso)||0)*(conjQtd(c)||0),0))} g · compra R$ ${brl(r.conjComp.reduce((t,c)=>t+(num(c.custo)||0)*(conjQtd(c)||0),0))}${r.conjOriginal&&num(r.conjOriginal.custo)!=null?` · compra original R$ ${brl(num(r.conjOriginal.custo))}`:""}`}})}
function romConjCampos(r){const bh=romBh(r),opts=c=>`<option value="">Banho do conjunto</option><option value="-" ${c.banho==="-"?"selected":""}>Sem banho</option>${(bh.banhos||[]).map(b=>`<option value="${esc(b.id)}" ${c.banho===b.id?"selected":""}>${esc(b.nome)}</option>`).join("")}`;return `<p class="hint">Informe a quantidade de cada componente por conjunto; peso e compra são por unidade e multiplicados pela quantidade. A categoria de cada componente determina o valor por grama do banho; se não escolher, usa a categoria do conjunto.</p>${r.conjComp.map((c,i)=>`<div class="rom-conjunto-linha" data-rcji="${i}"><label>Peça <input data-rcjf="desc" value="${esc(c.desc||"")}" aria-label="Nome do componente ${i+1}"></label><label>Categoria <select data-rcjf="cat" aria-label="Categoria do componente ${i+1}">${conjCatOpts(c)}</select></label><label>Quantidade <input data-rcjf="qtd" inputmode="numeric" value="${esc(c.qtd??"1")}" aria-label="Quantidade do componente ${i+1} por conjunto"></label><label>Peso unitário (g) <input data-rcjf="peso" inputmode="decimal" value="${esc(c.peso||"")}" aria-label="Peso do componente ${i+1}"></label><label>Compra unitária (R$) <input data-rcjf="custo" inputmode="decimal" value="${esc(c.custo||"")}" aria-label="Compra do componente ${i+1}"></label><label>Banho <select data-rcjf="banho" aria-label="Banho do componente ${i+1}">${opts(c)}</select></label><button type="button" class="btn sm" data-rcj="remover" aria-label="Remover componente ${i+1}">×</button></div>`).join("")}<p class="hint" data-rcj-total></p><div data-rcj-contas>${conjContasHTML(romForm(r,true).f)}</div><button type="button" class="btn sm" data-rcj="adicionar">＋ Componente</button> <button type="button" class="btn sm" data-rcj="desativar">Desfazer conjunto</button>`}
function romConjSomar(r,rc){const cs=r.conjComp||[],peso=cs.reduce((t,c)=>t+(num(c.peso)||0)*(conjQtd(c)||0),0),custo=cs.reduce((t,c)=>t+(num(c.custo)||0)*(conjQtd(c)||0),0);r.peso=txtN(peso);r.custo=txtN(custo);const a=rc.querySelector('[data-rp="peso"]'),b=rc.querySelector('[data-rp="custo"]');if(a)a.value=r.peso;if(b)b.value=r.custo;const t=rc.querySelector('[data-rcj-total]');if(t)t.textContent=`Soma: ${fmt(peso)} g · compra R$ ${brl(custo)}${r.conjOriginal&&num(r.conjOriginal.custo)!=null?` · compra original R$ ${brl(num(r.conjOriginal.custo))}`:""}`;const contas=rc.querySelector("[data-rcj-contas]");if(contas)contas.innerHTML=conjContasHTML(romForm(r,true).f);romAtualSoon()}
{const wrap=document.getElementById("romWrap");wrap.addEventListener("click",e=>{const b=e.target.closest("[data-rcj]");if(!b||!ROM)return;const rc=b.closest(".rc"),r=ROM.rows[+rc.dataset.i];if(!r)return;e.preventDefault();e.stopPropagation();if(r.arq){toast("Restaure a tabela salva antes de editar este item.");return}romArma(r);const a=b.dataset.rcj;if(a==="ativar"){const cols=romColsR(r);r.conjOriginal={peso:r.peso,custo:r.custo,tipo:r.tipo,on:clone(r.on||{})};r.on=Object.fromEntries(cols.filter(c=>c.id!=="p").map(c=>[c.id,true]));r.tipo="pronta";r.conjComp=[novaComp(),novaComp()]}else if(a==="desativar"){const o=r.conjOriginal||{};r.peso=o.peso;r.custo=o.custo;r.tipo=o.tipo;r.on=o.on||{};delete r.conjOriginal;delete r.conjComp}else if(a==="adicionar"&&r.conjComp.length<60)r.conjComp.push(novaComp());else if(a==="remover"&&r.conjComp.length>1)r.conjComp.splice(+b.closest("[data-rcji]").dataset.rcji,1);romSalvarSoon();renderRom();const newrc=document.querySelector(`#romWrap .rc[data-i="${rc.dataset.i}"]`);if(r.conjComp&&newrc)romConjSomar(r,newrc)},true);wrap.addEventListener("input",e=>{const t=e.target;if(!t.dataset.rcjf||!ROM)return;const rc=t.closest(".rc"),r=ROM.rows[+rc.dataset.i],i=+t.closest("[data-rcji]").dataset.rcji;if(!r||!r.conjComp||!r.conjComp[i]||r.arq)return;romArma(r);r.conjComp[i][t.dataset.rcjf]=t.value;romConjSomar(r,rc)});wrap.addEventListener("change",e=>{const t=e.target;if(t.tagName!=="SELECT"||!t.dataset.rcjf)return;t.dispatchEvent(new Event("input",{bubbles:true}))})}

function romConjVerificar(){const diverg=[];for(const r of ROM.rows){if(r.skip||!Array.isArray(r.conjComp))continue;const f={comp:r.conjComp};for(let i=0;i<f.comp.length;i++){const c=f.comp[i],v=conjErro(f,i);if(c.banho&&c.banho!=="-"&&!(romBh(r).banhos||[]).some(b=>b.id===c.banho)){toast(`Conjunto “${r.desc}”: selecione novamente o banho do componente ${i+1} para a galvânica atual.`);return false}if((v&&v!=="nome repetido")||(!String(c.desc||"").trim()&&vazio(c.peso)&&vazio(c.custo))){toast(`Conjunto “${r.desc}”, componente ${i+1}: ${v||"preencha nome, peso positivo e custo."}`);return false}}const orig=num((r.conjOriginal||{}).custo),atual=f.comp.reduce((t,c)=>t+(num(c.custo)||0)*(conjQtd(c)||0),0);if(orig!=null&&Math.abs(orig-atual)>=0.005)diverg.push(`${r.desc}: original R$ ${brl(orig)}, componentes R$ ${brl(atual)}`)}return !diverg.length||confirm("A soma da compra dos componentes difere do valor original do romaneio:\n\n"+diverg.slice(0,8).join("\n")+(diverg.length>8?"\n…e outros":"")+"\n\nCriar usando os valores dos componentes?")}
