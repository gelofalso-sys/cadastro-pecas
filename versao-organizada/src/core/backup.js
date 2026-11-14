/* ===== núcleo: backup — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { BANHISTA0, DEFAULT_CONFIG, FORM0, LET, ROMS0, ROM_PESO, clone, ftOk, modeloJueri } from "./colunas.js";
import { relNormalizar } from "./romaneio.js";
import { ehObj, idLimpo, num, semAc, vazio } from "./utilidades.js";
// @fim-imports
export const ftRSalvas=new Set();
export const PONTOS_MAX=15,PONTO_INTERVALO=30*60*1000;
export const BK_DIAS=7,BK_INTERVALO=30*60*1000;
export async function bkPerm(h,pedir){try{let p=await h.queryPermission({mode:"readwrite"});if(p==="prompt"&&pedir)p=await h.requestPermission({mode:"readwrite"});return p==="granted"}catch(e){return false}}
export function lerConfig(c){
  const o=clone(DEFAULT_CONFIG);if(!c)return o;
  ["seqs","categorias","cores","coresMeta","catAlias","observacoes","ordem","grades","modelos","modelo","romaneios","vLib","vPeso","insumosItens","insumosModo","descAuto","bancoGeral","bancoGeralAtivo","continuo","presetsLancamento"].forEach(k=>{if(c[k]!=null)o[k]=c[k]});if(!Array.isArray(o.grades))o.grades=[];if(!Array.isArray(o.romaneios)||!o.romaneios.length)o.romaneios=ROMS0();
  if(!Array.isArray(o.insumosItens))o.insumosItens=[];else o.insumosItens=o.insumosItens.filter(x=>x&&typeof x==="object"&&typeof x.nome==="string"&&(x.cat==null||typeof x.cat==="string")&&num(x.qtd)>0&&num(x.qtd)<=1000000&&num(x.valor)!=null&&num(x.valor)>=0&&num(x.valor)<=1000000).slice(0,100);
  if(!["off","somar","substituir"].includes(o.insumosModo))o.insumosModo="off";
  o.categorias.forEach(x=>{if(x&&!Array.isArray(x.subs))x.subs=[]});   /* cópia/backup com categoria sem lista de subcategorias não pode quebrar a tela */
  o.romaneios.forEach(t=>{if(t.id==="carlinha"&&!/Corrente=/.test(t.mapa||"")){const d=ROMS0()[0];t.mapa=d.mapa;t.valorRe=d.valorRe}});
  if(c.colcfg){LET.forEach(L=>{const x=c.colcfg[L]||{};const pad=o.colcfg[L].form;o.colcfg[L]={...o.colcfg[L],...x};if(!c.v6)o.colcfg[L].form=pad})}
  else{const fx=c.fixos||{};if(c.insumos!=null)o.colcfg.Q.padrao=c.insumos;if(fx.ncm!=null)o.colcfg.Y.padrao=fx.ncm;if(fx.cfop!=null)o.colcfg.AA.padrao=fx.cfop;if(fx.fcp!=null)o.colcfg.AB.padrao=fx.fcp;if(fx.catalogo)o.colcfg.AD.padrao=fx.catalogo;if(fx.status)o.colcfg.AE.padrao=fx.status}
  if(Array.isArray(c.banhistas))o.banhistas=c.banhistas.map(b=>({...b,banhos:b.banhos.map(x=>({modo:"peso",...x}))}));
  else if(c.banhos){const b=clone(BANHISTA0);const bo=c.banhos.ouro||{},bp=c.banhos.prata||{};Object.assign(b.banhos[0],{letra:bo.letra||"A",cor:bo.cor||"Ouro",mil:bo.mil??"1",mult:bo.mult??"1.5"});Object.assign(b.banhos[1],{letra:bp.letra||"B",cor:bp.cor||"Prata",mil:bp.mil??"50",mult:bp.mult??"1.54",sufixo:bp.sufixo??" banho prata"});if(c.verniz!=null)b.verniz=c.verniz;o.banhistas=[b]}
  if(c.fornecedores)o.fornecedores=c.fornecedores.map(f=>({banhista:"",...f,tipo:f.tipo==="bruto"?"bruta":f.tipo==="pronto"?"pronta":(f.tipo||"bruta")}));
  if(!c.v7){const pc=o.categorias.find(x=>/prata\s*925/i.test(x.nome||""));const d=DEFAULT_CONFIG.categorias.find(x=>x.nome==="Prata 925");
    if(pc&&d){if(pc.sufixo==null)pc.sufixo=d.sufixo;if(!pc.subs||!pc.subs.length)pc.subs=[...d.subs];pc.subPref={...d.subPref,...(pc.subPref||{})}}}
  o.v4=true;o.v5=true;o.v6=true;o.v7=true;o.v8=true;o.v9=c.v9?true:undefined;o.v10=c.v10?true:undefined;if(!Array.isArray(o.modelos)||!o.modelos.length)o.modelos=[modeloJueri()];if(!o.modelos.some(m=>m.id===o.modelo))o.modelo=o.modelos[0].id;o.v11=c.v11?true:undefined;o.v12=c.v12?true:undefined;
  if(!c.v14){const an=o.categorias.find(x=>x.grade&&!x.grade.usa&&/an[eé]l|anéis|aneis/i.test(x.nome||""));
    if(an){const nm=g=>g.itens.map(i=>String(i.nome)).join("|");o.categorias.forEach(x=>{if(x!==an&&x.grade&&!x.grade.usa&&nm(x.grade)===nm(an.grade))x.grade.usa=an.nome})}}o.v14=true;
  if(!c.v13){DEFAULT_CONFIG.cores.forEach(x=>{if(!o.cores.some(y=>semAc(y)===semAc(x)))o.cores.push(x)})}o.v13=true;if(!o.vLib){o.coresMeta=o.coresMeta||{};const M=o.coresMeta,us=new Set();(o.categorias||[]).forEach(c=>(c.cores||[]).forEach(x=>{if(!x||!x.nome)return;if(!o.cores.some(y=>semAc(y)===semAc(x.nome)))o.cores.push(x.nome);const k=semAc(String(x.nome)).trim();M[k]=M[k]||{};M[k].ped=true;const Lt=String(x.letra||'').toUpperCase();if(Lt&&!M[k].sig&&!us.has(Lt)&&!/^[0-9]+$/.test(Lt)){M[k].sig=Lt;us.add(Lt)}if(!M[k].txt&&x.texto&&x.texto!=='-')M[k].txt=String(x.texto).trim()}));o.vLib=true}if(!o.vPeso){o.romaneios=o.romaneios||[];if(!o.romaneios.some(t=>t.id==="pedido-peso")){o.romaneios.push(ROM_PESO())}o.vPeso=true}
  {const ids=x=>{if(x&&typeof x==="object"&&x.id!=null)x.id=idLimpo(x.id)||uid()};
    (o.banhistas||[]).forEach(b=>{ids(b);(b.banhos||[]).forEach(ids)});(o.grades||[]).forEach(g=>{ids(g);(g.itens||[]).forEach(ids)});
    (o.categorias||[]).forEach(c=>{if(c.grade){ids(c.grade);(c.grade.itens||[]).forEach(ids)}});(o.romaneios||[]).forEach(ids);(o.modelos||[]).forEach(ids);
    if(o.modelo!=null)o.modelo=idLimpo(o.modelo);(o.fornecedores||[]).forEach(f=>{if(f.banhista!=null)f.banhista=idLimpo(f.banhista)})}
  {const us=new Set();o.categorias.forEach(c=>{us.add(String(c.prefixo||"").toUpperCase());Object.values(c.subPref||{}).forEach(v=>us.add(String(v).toUpperCase()))});Object.keys(o.seqs||{}).forEach(p=>{if(!us.has(p)&&!(Math.trunc(num(o.seqs[p])||0)>0))delete o.seqs[p]})}
  return o;
}
export function lerLanc(l){
  if(!l.v)l={id:l.id||uid(),tipo:l.tipo==="pronta"?"pronta":"bruta",desconto:l.desconto||"0",banhista:"scarlat",vinc:!!l.vinc,
    v:{F:l.desc,G:l.codForn,H:l.forn,I:l.cat,J:l.sub,M:l.obs,N:l.peso,P:l.custo,V:l.preco,L:l.cor,W:l.qtd},
    on:{ouro:!(l.tipo==="bruta"&&l.prata&&!(num(l.qtdA)>0)),prata:!!l.prata},q:{ouro:l.qtdA,prata:l.qtdB},dsc:{prata:l.descB||""}};
  l.id=idLimpo(l.id)||uid();delete l.pv;
  l.ov=l.ov||{};
  if(l.ft&&!ftOk(l.ft)){delete l.ft}
  if(l.ftR&&!ftOk(l.ftR)){delete l.ftR}
  if(l.q){Object.entries(l.q).forEach(([b,q])=>{if(!vazio(q)){l.ov[b]=l.ov[b]||{};if(vazio(l.ov[b].W))l.ov[b].W=q}});delete l.q}
  if(l.dsc){Object.entries(l.dsc).forEach(([b,d])=>{if(!vazio(d)){l.ov[b]=l.ov[b]||{};l.ov[b].F=d}});delete l.dsc}
  return l;
}
export function lerForm(f){const o={...FORM0(),...(f||{})};if(!o.v)return FORM0();return lerLanc(o)}
export const EX_PREFIXO="exclusao-pendente-v1:";
export const romHistUltimo=new Map();
export function romHistComparar(rec){
  if(!rec)return "";const rows=(rec.rows||[]).map(r=>{const c={...r};delete c.sel;delete c.aviso;delete c.arq;if(!c.lancIds||!c.lancIds.length)delete c.lancIds;if(!c.revogados||!c.revogados.length)delete c.revogados;return c});
  return JSON.stringify({rows,texto:rec.texto||"",obs:rec.obs||"",doc:rec.doc||"",conf:rec.conf||""});
}
export function romArma(r){if(r&&r.feito&&r.skip&&!r.arq){r.skip=false;r.refaz=true;r.aviso="";return true}return false}
export const ehTxt=x=>typeof x==="string",ehLista=(a,f)=>Array.isArray(a)&&a.every(f);
export const ehNumLike=x=>typeof x==="number"?isFinite(x):(typeof x==="string"&&x.trim()!==""&&isFinite(Number(x)));
export const campoOk=x=>x==null||ehTxt(x)||typeof x==="boolean"||(typeof x==="number"&&isFinite(x));
export const PREFIXO_RUIM=/[<>"'&`\\]/;
export function checarConfig(c){
  const erro=m=>{throw new Error(m)};
  if(!ehObj(c))erro("os cadastros estão em formato errado");
  if(c.cores!=null&&!ehLista(c.cores,ehTxt))erro("a lista de cores está errada");
  if(c.observacoes!=null&&!ehLista(c.observacoes,ehTxt))erro("a lista de observações está errada");
  if(c.ordem!=null&&!ehTxt(c.ordem))erro("a ordem da tabela, nos cadastros, está errada");
  if(c.modelo!=null&&!ehTxt(c.modelo))erro("o modelo de planilha escolhido está errado");
  if(c.seqs!=null&&!(ehObj(c.seqs)&&Object.values(c.seqs).every(campoOk)))erro("a numeração (última peça de cada tipo) está errada");
  if(c.categorias!=null){if(!Array.isArray(c.categorias))erro("a lista de categorias está errada");
    c.categorias.forEach((x,i)=>{if(!ehObj(x)||!ehTxt(x.nome)||!x.nome.trim())erro("a categoria "+(i+1)+" está sem nome ou em formato errado");
      const nm="“"+x.nome.slice(0,30)+"”";
      if(x.prefixo!=null&&(!ehTxt(x.prefixo)||PREFIXO_RUIM.test(x.prefixo)))erro("a categoria "+nm+" tem um prefixo inválido");
      if(x.sufixo!=null&&!ehTxt(x.sufixo))erro("a categoria "+nm+" tem um sufixo inválido");
      if(x.subs!=null&&!ehLista(x.subs,ehTxt))erro("as subcategorias de "+nm+" estão erradas");
      if(x.subPref!=null&&!(ehObj(x.subPref)&&Object.values(x.subPref).every(v=>ehTxt(v)&&!PREFIXO_RUIM.test(v))))erro("os prefixos das subcategorias de "+nm+" estão errados");
      if(x.subSoRef!=null&&!ehObj(x.subSoRef))erro("as subcategorias de "+nm+" estão erradas");
      if(x.grade!=null&&!(ehObj(x.grade)&&Array.isArray(x.grade.itens)&&x.grade.itens.every(ehObj)))erro("a variação (tamanhos) de "+nm+" está errada")})}
  if(c.fornecedores!=null&&!ehLista(c.fornecedores,f=>ehObj(f)&&ehTxt(f.nome)))erro("a lista de fornecedores está errada");
  if(c.banhistas!=null&&!ehLista(c.banhistas,b=>ehObj(b)&&Array.isArray(b.banhos)&&b.banhos.every(ehObj)))erro("a lista de galvânicas está errada");
  if(c.grades!=null&&!ehLista(c.grades,g=>ehObj(g)&&Array.isArray(g.itens)&&g.itens.every(ehObj)))erro("a lista de variações está errada");
  if(c.modelos!=null&&!ehLista(c.modelos,m=>ehObj(m)&&Array.isArray(m.cols)&&m.cols.every(ehObj)))erro("a lista de modelos de planilha está errada");
  if(c.romaneios!=null&&!ehLista(c.romaneios,ehObj))erro("a lista de modelos de romaneio está errada");
  if(c.colcfg!=null&&!(ehObj(c.colcfg)&&Object.values(c.colcfg).every(ehObj)))erro("a configuração das colunas está errada")}
export function checarLanc(l,i,quem){const n=(quem||"peça")+" "+(i+1),erro=m=>{throw new Error(n+": "+m)};
  if(!ehObj(l))erro("está em formato errado");
  if(l.id!=null&&!ehTxt(l.id))erro("o código interno é inválido");
  if(l.v!=null&&!(ehObj(l.v)&&Object.values(l.v).every(campoOk)))erro("os campos da peça (descrição, preço…) precisam ser texto ou número");
  if(l.ov!=null&&!(ehObj(l.ov)&&Object.values(l.ov).every(o=>ehObj(o)&&Object.values(o).every(campoOk))))erro("os valores digitados na tabela estão em formato errado");
  ["on","vz","q","dsc"].forEach(k=>{if(l[k]!=null&&!ehObj(l[k]))erro("o campo “"+k+"” está em formato errado")});
  if(l.gsel!=null&&!ehLista(l.gsel,ehTxt))erro("a seleção de tamanhos está errada");
  if(l.comp!=null&&!(Array.isArray(l.comp)&&l.comp.length<=60&&l.comp.every(c=>ehObj(c)&&["desc","peso","custo","banho"].every(k=>c[k]==null||campoOk(c[k]))&&["peso","custo"].every(k=>vazio(c[k])||(num(c[k])!=null&&num(c[k])>=0))&&(c.id==null||typeof c.id==="string"))))erro("as peças do conjunto estão em formato errado");
  if(l.desconto!=null&&!campoOk(l.desconto))erro("o desconto é inválido");
  if(l.tipo!=null&&!ehTxt(l.tipo))erro("o tipo é inválido")}
export function romLimpo(k,r,exigeRows){const n="o romaneio “"+String(k).slice(0,20)+"”",erro=m=>{throw new Error(n+" "+m)};
  if(!ehObj(r))erro("está em formato errado");
  if(r.rows==null&&!exigeRows)return r;
  if(!Array.isArray(r.rows)||!r.rows.every(ehObj))erro("tem a lista de peças em formato errado");
  if(r.log!=null&&!ehLista(r.log,ehObj))erro("tem o histórico em formato errado");
  if(r.form!=null&&!ehObj(r.form))erro("tem o formulário em formato errado");
  const rows=r.rows.map((x,i)=>{["qtd","qLanc"].forEach(f=>{if(x[f]!=null&&!ehNumLike(x[f]))erro("tem, na peça "+(i+1)+", uma "+(f==="qtd"?"quantidade":"quantidade lançada")+" que não é número")});
    if(x.lancIds!=null&&!ehLista(x.lancIds,ehTxt))erro("tem, na peça "+(i+1)+", a ligação com as peças lançadas em formato errado");
    return {...x,qtd:x.qtd==null?x.qtd:Number(x.qtd),qLanc:x.qLanc==null?x.qLanc:Number(x.qLanc)}});
  return {...r,rows}}
export function tabLimpa(k,r){const n="a tabela salva “"+String(k).slice(0,20)+"”",erro=m=>{throw new Error(n+" "+m)};
  if(!ehObj(r)||!Array.isArray(r.lanc))erro("está em formato errado");
  r.lanc.forEach((l,i)=>{try{checarLanc(l,i)}catch(e){erro("tem, em "+e.message)}});
  if(r.linhas!=null&&!(Array.isArray(r.linhas)&&r.linhas.every(ehObj)))erro("tem a lista de linhas em formato errado");
  if(r.roms!=null&&!ehLista(r.roms,ehTxt))erro("tem a lista de romaneios em formato errado");
  const linhas=(r.linhas||[]).map((l,i)=>{["q","custo","varejo"].forEach(f=>{if(l[f]!=null&&!ehNumLike(l[f]))erro("tem, na linha "+(i+1)+", um valor de "+(f==="q"?"quantidade":f)+" que não é número")});
    return {...l,q:l.q==null?0:Number(l.q),custo:l.custo==null?0:Number(l.custo),varejo:l.varejo==null?null:Number(l.varejo)}});
  if(r.em!=null&&!ehNumLike(r.em))erro("tem a data em formato errado");
  return {...r,linhas,em:r.em==null?Date.now():Number(r.em)}}
export function validarBackup(o){
  const erro=m=>{throw new Error(m)};
  if(!ehObj(o))erro("o conteúdo do arquivo não é um backup");
  if(o.app!=="cadastro-pecas"||o.tipo!=="total")erro("este arquivo não é um backup completo do Cadastro de Peças");
  if(!(Number.isInteger(o.v)&&o.v>=1&&o.v<=1))erro("este backup é de uma versão que este programa não conhece ("+String(o.v).slice(0,10)+")");
  if(!ehObj(o.config))erro("o backup não tem os cadastros");
  try{checarConfig(o.config)}catch(e){erro("cadastros: "+e.message)}
  if(!Array.isArray(o.lanc))erro("o backup não tem a lista de peças");
  const ids=new Set();o.lanc.forEach((l,i)=>{checarLanc(l,i);if(l.id!=null){if(ids.has(l.id))erro("há peças repetidas no backup (código interno "+String(l.id).slice(0,20)+")");ids.add(l.id)}});
  if(o.form!=null&&!ehObj(o.form))erro("o formulário do backup está em formato errado");
  if(o.form&&o.form.v)checarLanc(o.form,0,"formulário");
  const roms=o.roms==null?{}:o.roms,tabs=o.tabs==null?{}:o.tabs,fotos=o.fotos==null?{}:o.fotos;
  if(!ehObj(roms)||!ehObj(tabs)||!ehObj(fotos))erro("os romaneios, tabelas ou fotos do backup estão em formato errado");
  if(o.rascunho!=null&&!ehObj(o.rascunho))erro("o rascunho de romaneio do backup está em formato errado");
  if(o.autor!=null&&!ehTxt(o.autor))erro("o nome de quem montou está em formato errado");
  /* objetos novos (nada é aplicado aqui) */
  let cfgNova;try{cfgNova=lerConfig(clone(o.config))}catch(e){erro("não consegui ler os cadastros do backup")}
  const r={config:cfgNova,lanc:clone(o.lanc).map(lerLanc),form:null,roms:{},tabs:{},fotos:{},descartadas:0,incompleto:Array.isArray(o.incompleto)?o.incompleto.map(x=>String(x).slice(0,40)).slice(0,50):null,leve:o.leve===true};
  if(o.form&&o.form.v)r.form=lerForm(clone(o.form));
  Object.entries(roms).forEach(([k,x])=>{const l=romLimpo(k,x,true);r.roms[k]={...l,id:ehTxt(l.id)&&l.id?l.id:k}});
  Object.entries(tabs).forEach(([k,x])=>{const l=tabLimpa(k,x);r.tabs[k]={...l,id:ehTxt(l.id)&&l.id?l.id:k}});
  Object.entries(fotos).forEach(([k,u])=>{if(ftOk(u))r.fotos[k]=u;else r.descartadas++});
  r.rascunho=o.rascunho?romLimpo("rascunho",o.rascunho,false):null;r.rel=o.rel!=null?relNormalizar(o.rel):null;r.autor=typeof o.autor==="string"?o.autor:"";
  return r}
export const BK_JOURNAL="backup-restauracao-pendente-v1";
export const ROMKEY="cadpecas-rom";
