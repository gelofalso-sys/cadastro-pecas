/* ===== núcleo: exportacao — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { HEAD, LET, NOME, SIN, attrVar, celCol, celulas, listaCol, maxCol, normH, semAc, traduzF } from "./colunas.js";
import { bhDe$, catBy$, cfg$, comSufixoCat$, fnum$, modeloAtual$, prefDe$, ultimo$, val$ } from "./configuracao.js";
import { conjErro$, refBase } from "./dominio.js";
import { VALIDA_NUM, avalF, pesoLinha, qtdPos } from "./formulas.js";
import { contFinal, esc, num, vazio } from "./utilidades.js";
// @fim-imports
export function faixaFiltro(g){const bs=[...new Set(g.linhas.map(r=>refBase(r.v.E)).filter(Boolean))].sort();return bs.length<=4?bs.join(", "):bs[0]+"–"+bs[bs.length-1]}
export function celulaXlsx(x,cols){if(x.f){const tf=cols?traduzF(x.f,cols):x.f;if(tf){const c={t:"n",f:tf};if(typeof x.v==="number")c.v=x.v;else if(typeof x.calc==="number")c.v=x.calc;return c}return typeof x.v==="number"?{t:"n",v:x.v}:typeof x.calc==="number"?{t:"n",v:x.calc}:{t:"s",v:"="+x.f}}return typeof x.v==="number"?{t:"n",v:x.v}:{t:"s",v:String(x.v).replace(/[\r\n]+/g," ")}}
export function pendGrupos(ger){const grupos=new Map(),soltas=[];
  ger.forEach(s=>{const m=s.match(/^Linha \d+ \(([^)]+)\): (.+)$/);if(!m){soltas.push(s);return}m[2].split(/, (?=[A-ZÀ-Ú])/).forEach(t=>{const k=t.trim();if(!grupos.has(k))grupos.set(k,[]);grupos.get(k).push(m[1])})});
  return [...grupos.entries()].sort((a,b)=>b[1].length-a[1].length).map(([k,refs])=>`<tr><td><b>${esc(k)}</b> — ${refs.length} peça(s): ${refs.slice(0,6).map(r=>`<button type="button" class="btn sm" data-act="exp-ir" data-ref="${esc(r)}">${esc(r)}</button>`).join(" ")}${refs.length>6?` e mais ${refs.length-6}`:""}</td></tr>`).join("")+soltas.map(s=>`<tr><td>${esc(s)}</td></tr>`).join("")}
export function txtSaida(r,c,dec){if(!r)return "";const v=r.v;if(v==null)return r.f?"="+r.f:"";if(typeof v==="number")return (c.tipo==="dinheiro"?(c.k==="P"?(Math.abs(v*100-Math.round(v*100))<1e-7?v.toFixed(2):v.toFixed(4).replace(/0+$/,"")):v.toFixed(2)):String(v)).replace(".",dec);return String(v).replace(/[\r\n]+/g," ")}
export const protegeTxt=s=>{s=String(s==null?"":s);return /^[=+@\t\r]/.test(s)||(s[0]==="-"&&!/^-\d+([.,]\d+)?$/.test(s))?"'"+s:s};
export function avisoZeros(sl,cols,onde){const ks=["C","Y","Z"].filter(k=>cols.some(c=>c.k===k));if(!ks.length)return "";let n=0;const ex=[];
  sl.forEach(e=>{const v=e.row&&e.row.v;if(!v)return;ks.forEach(k=>{const x=v[k];if(typeof x==="string"&&/^0\d/.test(x.trim())){n++;if(ex.length<2&&!ex.includes(x.trim()))ex.push(x.trim())}})});
  return n?`Atenção: ${n} valor(es) de EAN/NCM/código de barras começam com zero (ex.: ${ex.join(", ")}). Ao abrir ${onde} no Excel esse zero pode sumir; para manter, use o modelo .xlsx (sai como texto) ou importe a coluna como Texto.`:""}
export function dividirLotes(sl,lote){if(!(lote>0)||sl.length<=lote)return [sl];
  const grupos=[];sl.forEach(e=>{if(e.t==="filho"&&grupos.length)grupos[grupos.length-1].push(e);else grupos.push([e])});
  const out=[];let cur=[];grupos.forEach(gp=>{if(cur.length&&cur.length+gp.length>lote){out.push(cur);cur=[]}cur.push(...gp)});if(cur.length)out.push(cur);return out}
export const TIPO_PAD={V:"dinheiro",P:"dinheiro",Q:"dinheiro",R:"dinheiro",S:"dinheiro",T:"dinheiro",U:"dinheiro",W:"inteiro",N:"numero"};
export const csvLinha=(l,sep)=>{const o=[];let c="",q=false;for(let i=0;i<l.length;i++){const ch=l[i];
  if(q){if(ch==='"'){if(l[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}else if(ch==='"')q=true;else if(ch===sep){o.push(c);c=""}else c+=ch}o.push(c);return o};
export function exemplo(){
  const obs="Link 211 - Xangai Brutos Banho Scarlat 2026 setembro";
  const b=(F,J,N,P,V,qa,qb)=>({id:uid(),tipo:"bruta",desconto:"0",banhista:"scarlat",vinc:false,v:{F,J,N,P,V,H:"xangai",I:"Brincos",M:obs},on:{ouro:true,prata:true},ov:{ouro:{W:qa},prata:{W:qb}}});
  const p=(F,G2,vinc)=>({id:uid(),tipo:"pronta",desconto:"15",banhista:"",vinc,v:{F,G:G2,H:"Evidência",I:"Brincos",J:"Piergings",M:"Compra em setembro de 2026",L:"Ródio",P:"15,90",V:"49,90",W:"1"},on:{},ov:{}});
  const c=(cat,sub,F,H,tipo,x)=>tipo==="bruta"
    ?{id:uid(),tipo:"bruta",desconto:H==="Rosah"?"10":"0",banhista:"scarlat",vinc:false,v:{F,J:sub,N:x.N,P:x.P,V:x.V,H,I:cat,M:obs},on:{ouro:true,prata:true},ov:{ouro:{W:x.qa},prata:{W:x.qb}}}
    :{id:uid(),tipo:"pronta",desconto:H==="Evidência"?"15":"0",banhista:"",vinc:false,v:{F,G:x.G,H,I:cat,J:sub,M:"Compra em setembro de 2026",L:x.L,P:x.P,V:x.V,W:x.W},on:{},ov:{}};
  return [b("Earhook bolinhas e zircônias","Médios","1,7","3,60","49,90","3","2"),b("Brinco cravejado","Médios","2,5","6,00","69,90","3","2"),b("Brinco borboleta lisa","Pequenos","1,7","3,36","45,00","1","1"),
    p("Piercing fake cristal ródio","P-221",false),p("Piercing fake turmalina ródio","P-222",true),p("Piercing fake citrino ródio","P-224",true),
    /* um item de demonstração de cada uma das outras categorias (brutas vão para o banho; prontas entram direto) */
    c("Acessórios","","Chaveiro coração com strass","Rosah","bruta",{N:"4,2",P:"5,10",V:"29,90",qa:"2",qb:"2"}),
    c("Anel","","Anel solitário zircônia","xangai","bruta",{N:"2,1",P:"3,40",V:"39,90",qa:"2",qb:"1"}),
    c("Colares","Correntes","Corrente veneziana 45cm","xangai","bruta",{N:"6,8",P:"9,20",V:"79,90",qa:"2",qb:"2"}),
    c("Conjuntos","","Conjunto colar e brinco gota","Evidência","pronta",{L:"Ouro",P:"32,00",V:"119,90",W:"1",G:"CJ-301"}),
    c("Infantil","Brincos","Brinco infantil estrela","Spina Joias","pronta",{L:"Ouro",P:"7,50",V:"34,90",W:"2",G:"IN-110"}),
    c("Masculinos","Correntes","Corrente cartier masculina","Rosah","bruta",{N:"12,5",P:"15,00",V:"129,90",qa:"1",qb:"1"}),
    c("Personalizado","","Pingente com nome (sob encomenda)","Spina Joias","pronta",{L:"Prata",P:"18,00",V:"69,90",W:"1",G:"PE-001"}),
    c("Pingentes","","Pingente ponto de luz","xangai","bruta",{N:"1,3",P:"2,60",V:"24,90",qa:"3",qb:"2"}),
    c("Prata 925","Brincos","Brinco argola prata 925 lisa","Spina Joias","pronta",{L:"Prata 925",P:"28,00",V:"99,90",W:"1",G:"PR-501"}),
    c("Pulseiras","","Pulseira elos com pingentes","Rosah","bruta",{N:"7,4",P:"8,80",V:"59,90",qa:"2",qb:"2"}),
    c("Relógios","","Relógio feminino dourado","Evidência","pronta",{L:"Ouro",P:"54,00",V:"189,90",W:"1",G:"RL-901"}),
    c("Tornozeleiras","","Tornozeleira corrente e estrelas","Rosah","bruta",{N:"3,9",P:"4,70",V:"34,90",qa:"2",qb:"2"})];
}
export function valorCol$(S,c,x){
  let o=x||null;
  const vaz=!o||(o.v==null&&!o.f)||(typeof o.v==="string"&&o.v.trim()==="");
  if(vaz){if(vazio(c.padrao))return null;o={v:String(c.padrao)}}
  if(c.k==="I"&&o&&typeof o.v==="string"){const cx=catBy$(S,o.v);if(cx&&cx.nomeExport)o={...o,v:cx.nomeExport}}   /* nome da categoria como a planilha/Jueri conhece */
  const t=c.tipo||"";
  if(t==="texto")return {v:o.v==null?(o.txt||(o.f?"="+o.f:"")):String(o.v)};
  if(o.v==null&&o.f){const fz0=(t==="numero"||t==="inteiro"||t==="dinheiro")?num(c.fator):null;   /* fórmula também recebe o fator da coluna */
    const fat=fz0!=null&&fz0>0&&fz0!==1;let f=fat?"("+o.f+")*"+String(fz0):o.f,calc=o.calc!=null?(fat?o.calc*fz0:o.calc):undefined;
    if(t==="dinheiro"){const d=c.k==="P"?4:2,m=10**d;return {...o,f:"ROUND("+f+","+d+")",calc:calc!=null?Math.round(calc*m)/m:undefined,z:c.k==="P"?"0.00##":"0.00"}};
    return fat?{...o,f,calc}:o}
  if(t==="numero"||t==="inteiro"||t==="dinheiro"){
    const n=typeof o.v==="number"?o.v:num(o.v);
    if(n==null)return {v:o.v,erro:1};
    const fz=num(c.fator);   /* fator: multiplica o número (ex.: peso em gramas × 0,001 = quilos); sem fórmula, o valor já sai convertido */
    const lim=x=>parseFloat(x.toPrecision(12));   /* tira o ruído de ponto flutuante (0,1×3 = 0,30000000000000004) */
    if(fz!=null&&fz>0&&fz!==1){const r=Math.round(lim(n*fz*1e6))/1e6;return {v:t==="dinheiro"?Math.round(lim(r*(c.k==="P"?10000:100)))/(c.k==="P"?10000:100):lim(r)}}
    if(t==="dinheiro"){const d=c.k==="P"?4:2,m=10**d;return {v:Math.round(lim(n*m))/m,f:o.f?"ROUND("+o.f+","+d+")":o.f,z:c.k==="P"?"0.00##":"0.00"}};   /* a fórmula também arredonda: o Excel recalcula o mesmo centavo do CSV */
    return {v:n,f:o.f}}
  return o}
export function saidaLinhas$(S,g,mo){
  const rows=g.linhas;if(!mo||mo.agrupar!=="sim")return rows.map(row=>({row,t:"normal"}));
  const por=new Map();rows.forEach(r=>{if(!por.has(r.lancId))por.set(r.lancId,[]);por.get(r.lancId).push(r)});
  const out=[],vistos=new Set(),codsE=new Set(rows.map(r=>String(r.v.E||"")));   /* códigos já existentes: o código do pai nunca repete um deles */
  rows.forEach(r=>{if(vistos.has(r.lancId))return;vistos.add(r.lancId);const grp=por.get(r.lancId);
    if(grp.length<2){out.push({row:grp[0],t:"normal"});return}
    const f=grp[0],l=S.lanc.find(x=>x.id===f.lancId),part0=String(f.part||""),E0=String(f.v.E||""),
      base=(b=>{while(codsE.has(b))b+="P";codsE.add(b);return b})(part0&&E0.endsWith(part0)?E0.slice(0,E0.length-part0.length):E0+"P"),
      c0=celulas(f,2)[LET.indexOf("V")],pv=c0&&typeof c0.v==="number"?String(c0.v):c0&&typeof c0.calc==="number"?String(c0.calc):"",
      desc=l?comSufixoCat$(S,val$(S,l,"F"),val$(S,l,"I"),l.semSufixoCat):"";
    out.push({row:{...f,banho:null,mk:null,ovs:[],bid:null,gi:null,key:"pai",part:"",verniz:null,v:{...f.v,E:base,F:desc||f.v.F,L:"",K:"",O:"",W:"",P:"",R:"",S:"",T:"",U:"",V:pv}},t:"pai"});
    const i0=out.length;const chave=ch=>String(ch.v.K||"")+"|"+semAc(ch.v.L||""),cont={};grp.forEach(ch=>{const k=chave(ch);cont[k]=(cont[k]||0)+1});
    const nomeBanho=ch=>{const bb=l?bhDe$(S,l).banhos.find(x=>x.id===ch.bid):null;return bb?String(bb.nome||""):""};
    grp.forEach(ch=>{const a=[];if(!vazio(ch.v.K))a.push("Tamanho:"+attrVar(ch.v.K));if(!vazio(ch.v.L)){let cor=String(ch.v.L);if(cont[chave(ch)]>1){const nb=nomeBanho(ch);if(nb)cor=semAc(nb).includes(semAc(cor))?nb:cor+" "+nb}a.push("Cor:"+attrVar(cor))}if(!a.length)a.push("Variação:"+attrVar(ch.part||ch.v.E));
      out.push({row:ch,t:"filho",pai:base,attrs:a.join(";")})});{const fl=out.slice(i0),cn={};fl.forEach(e=>{cn[e.attrs]=(cn[e.attrs]||0)+1});fl.forEach(e=>{if(cn[e.attrs]>1)e.attrs+=";Variação:"+attrVar(e.row.part||e.row.v.E)})}});
  return out}
export function validarModelo$(S,g,cols){const out=[],sl=saidaLinhas$(S,g,modeloAtual$(S)),vz={},cod={};
  sl.forEach((e,i)=>{const row=e.row,cs=celulas(row,i+2);
    cols.forEach(c=>{const r=valorCol$(S,c,celCol(c,cs,e)),v=r?r.v:null,vaz=!r||(v==null&&!r.f)||String(v==null?"x":v).trim()==="",h=String(c.h||(c.k?NOME[c.k]:"(coluna)"));
      const add=m=>out.push({l:i+2,ref:row.v.E||"",col:h,msg:m});
      if(vaz){if(c.obrig){(vz[h]=vz[h]||[]).push(add)}return}
      const vv=v==null&&r&&typeof r.calc==="number"?r.calc:v;   /* fórmula: vale o resultado dela */
      if(vv==null)return;
      const s=String(vv);
      if(c.k==="E")(cod[s.trim().toUpperCase()]=cod[s.trim().toUpperCase()]||[]).push(i+2);
      if(r.erro)add("não é um número: “"+s.slice(0,30)+"”");
      else if(c.tipo==="inteiro"&&!Number.isInteger(vv))add("precisa ser um número inteiro");
      if(maxCol(c)&&s.length>maxCol(c))add("passa de "+maxCol(c)+" caracteres");
      const L=listaCol(c);if(L.length&&!L.some(z=>semAc(z)===semAc(s)))add("fora da lista permitida ("+L.slice(0,4).join(", ")+(L.length>4?"…":"")+")")})});
  /* coluna obrigatória vazia em quase todas as linhas: um aviso só */
  const n=sl.length;Object.keys(vz).forEach(h=>{const a=vz[h];if(n>=4&&a.length>=Math.ceil(n*0.8))out.unshift({l:"todas",ref:"—",col:h,msg:`obrigatória e vazia em ${a.length} de ${n} linhas`});else a.forEach(f=>f("obrigatória e vazia"))});
  /* Bling: o Código é a chave do produto e precisa ser único; repetido, ele recusa ou sobrescreve a linha anterior. A conferência deixa seguir mesmo assim. */
  {const mo0=modeloAtual$(S);if(/bling/i.test(String(mo0.nome||""))||cols.some(c=>c.k==="@pai")){const rep=Object.entries(cod).filter(([k,a])=>k&&a.length>1);rep.slice(0,200).forEach(([k,a])=>out.unshift({l:a[1],ref:(sl[a[1]-2]&&sl[a[1]-2].row.v.E)||k,col:"Código",msg:`repetido nas linhas ${a.slice(0,5).join(", ")}${a.length>5?"…":""}: no Bling o Código precisa ser único. Corrija a referência ou exporte mesmo assim se tiver certeza.`}))}}
  return out}
export function chaveDoCabecalho$(S,h){const n=normH(h);if(!n)return null;
  const mc=modeloAtual$(S).cols.find(c=>c.k&&normH(c.h)===n);if(mc)return mc.k;
  const i=HEAD.findIndex(x=>normH(x)===n);if(i>=0)return LET[i];
  for(const k of Object.keys(SIN))if(SIN[k].includes(n))return k;return null}
export function avisos$(S,g){
  const out=[],cc=cfg$(S).colcfg,ps=new Set(S.lanc.map(l=>prefDe$(S,val$(S,l,"I"),val$(S,l,"J"))));
  ps.forEach(p=>{if(!(ultimo$(S,p)>0)&&!((g.manual||{})[p]>0))out.push({bad:1,t:`Falta a última peça de ${p} no sistema.`})});
  Object.entries(g.manualReal||{}).forEach(([p,n])=>{if(n>ultimo$(S,p))out.push({t:`${p}${fnum$(S,p,n)} foi digitada à mão (a última do sistema é ${p}${fnum$(S,p,ultimo$(S,p))}): as próximas automáticas continuam em ${p}${fnum$(S,p,n+1)}`})});
  const d=new Set(g.linhas.filter(r=>r.dup).map(r=>r.v.E));if(d.size)out.push({bad:1,t:`Referência repetida: ${[...d].join(", ")}`});
  LET.forEach(L=>{if(!cc[L].obrig)return;const k=g.linhas.filter(r=>L==="W"?!qtdPos(r.v.W,r.v,r.desconto):vazio(r.v[L])).length;if(k)out.push({t:`${k} sem ${NOME[L]}`})});
  const sp=g.linhas.filter(r=>r.banho&&pesoLinha(r)==null&&r.banho.modo!=="fixo").length;if(sp)out.push({t:`${sp} bruta(s) sem Peso`});
  {const sm=new Set();g.linhas.forEach(r=>{if(r.banho&&r.banho.mult==null&&vazio(r.v[r.banho.coluna]))sm.add(r.v.L||r.col||r.banho.coluna)});
   sm.forEach(n=>out.push({t:`Banho “${n}” sem multiplicador: o custo do banho sai vazio — preencha em Banhos e galvânicas`}))}
  return out;
}
export function faixaRefs$(S,g){const c=contFinal(g);return Object.keys(c).filter(p=>c[p]>ultimo$(S,p)).map(p=>{const i=ultimo$(S,p)+1,A=p+fnum$(S,p,i),B=p+fnum$(S,p,c[p]);return i===c[p]?A:`${A}–${B}`}).join(", ")}
export function pendenciasExport$(S,g,porPeca){
  const cc=cfg$(S).colcfg,pend=[],seenL=new Set();
  g.linhas.forEach((r,i)=>{const falta=[];
    LET.forEach(L=>{if(cc[L]&&cc[L].obrig&&(L==="W"?!qtdPos(r.v.W,r.v,r.desconto):(vazio(r.v[L]))))falta.push(NOME[L])});
    {const cs=celulas(r,i+2);Object.keys(r.v).forEach(L=>{if(!VALIDA_NUM.has(L)||L==="W")return;const x=cs[LET.indexOf(L)];if(!x||x.v!=null||!x.f||!x.txt)return;
      if(typeof x.calc!=="number")falta.push(NOME[L]+": a fórmula não dá resultado (divisão por zero ou célula vazia)");else if(x.calc<0)falta.push(NOME[L]+": a fórmula dá número negativo")})}
    if(!vazio(r.v.W)&&!qtdPos(r.v.W,r.v,r.desconto)&&!falta.includes(NOME.W))falta.push("Quantidade precisa ser um número inteiro de 1 em diante (a fórmula não dá isso)");
    if(r.banho&&pesoLinha(r)==null&&r.banho.modo!=="fixo"&&!falta.includes(NOME.N))falta.push("Peso (sem ele o custo do banho fica vazio)");
    if(r.banho&&r.banho.mult==null&&vazio(r.v[r.banho.coluna]))falta.push("multiplicador do banho (custo do banho fica vazio)");
    {["N","P","Q","V"].forEach(L=>{const x=num(r.v[L]);if(x!=null&&x<0)falta.push(NOME[L]+" negativo")});const pv=num(r.v.V),pc=num(r.v.P);if(pv!=null&&pc!=null&&pv>0&&pv<pc)falta.push("Preço de Varejo menor que o Custo de Compra");if(!vazio(r.v.I)&&!catBy$(S,r.v.I))falta.push("categoria \""+String(r.v.I).slice(0,30)+"\" não cadastrada (a referência sai com prefixo BR)");const lc=(S.lanc||[]).find(l=>l&&l.id===r.lancId);if(lc&&lc.conj&&!seenL.has(lc.id)){seenL.add(lc.id);(lc.comp||[]).forEach((c,k)=>{const m=conjErro$(S,lc,k);if(m)falta.push("componente "+(k+1)+": "+m)})}}if(falta.length)pend.push({i,r,falta})});
  /* o mesmo campo faltando em (quase) todas as peças vira UMA linha de aviso, não dezenas (ex.: sem Preço de Varejo definido) */
  const cont={};pend.forEach(p=>p.falta.forEach(f=>cont[f]=(cont[f]||0)+1));const tot=g.linhas.length,todos=porPeca?[]:Object.keys(cont).filter(f=>tot>=4&&cont[f]>=Math.ceil(tot*0.8));
  const out=todos.map(f=>`Em ${cont[f]} de ${tot} peças falta: ${f}. Se isso é esperado (ex.: ainda sem preço de venda), pode seguir.`);
  pend.forEach(p=>{const fl=p.falta.filter(f=>!todos.includes(f));if(fl.length)out.push(`Linha ${p.i+2} (${p.r.v.E||"sem ref."}): ${fl.join(", ")}`)});
  {const dups=[...new Set(g.linhas.filter(r=>r.dup).map(r=>r.v.E))];if(dups.length)out.unshift(`Referência repetida em ${dups.length} peça(s): ${dups.slice(0,6).join(", ")}${dups.length>6?"…":""}. O arquivo sai assim; confira se o outro sistema aceita referências iguais.`)}
  return out}
export function conferirExport$(S,g,cols){const ger=pendenciasExport$(S,g,true),mod=validarModelo$(S,g,cols);return {ger,mod,n:ger.length+mod.length}}
export function montarCsv$(S,g,cols,mo,slx){
  const sep=mo.sep==="tab"?String.fromCharCode(9):mo.sep===","?",":";",dec=mo.dec==="."?".":",",Q=String.fromCharCode(34),NL=String.fromCharCode(13,10);
  const q=s=>{s=String(s);return (s.includes(sep)||s.includes(Q)||/[\r\n]/.test(s))?Q+s.split(Q).join(Q+Q)+Q:s};
  const lin=[cols.map(c=>q(protegeTxt(c.h))).join(sep)];
  const sl=slx||saidaLinhas$(S,g,mo);
  sl.forEach((e,i)=>{const cs=celulas(e.row,i+2);lin.push(cols.map(c=>{let r=valorCol$(S,c,celCol(c,cs,e));
    if(r&&r.v==null&&r.f){const gv=(L,d)=>{const x=cs[LET.indexOf(L)];return x&&typeof x.v==="number"?x.v:x&&x.f&&d<5?avalF(x.f,K=>gv(K,d+1)):null},n0=typeof r.calc==="number"?r.calc:avalF(r.f,L=>gv(L,0)),n=n0;if(n!=null)r={...r,v:c.tipo==="dinheiro"?Math.round(n*(c.k==="P"?10000:100))/(c.k==="P"?10000:100):parseFloat(n.toPrecision(12))}}   /* CSV não tem fórmula: sai o valor calculado */
    let s=txtSaida(r,c,dec);if(!r||typeof r.v!=="number")s=protegeTxt(s);return q(s)}).join(sep))});
  return (mo.enc==="utf8"?"":String.fromCharCode(65279))+lin.join(NL)+NL}
export function sigCfg$(S){const c={...S.config};delete c.seqs;delete c.observacoes;return JSON.stringify(c)}
export function sigLanc$(S){const o={};S.lanc.forEach(l=>{o[l.id]=JSON.stringify(l)});return o}
