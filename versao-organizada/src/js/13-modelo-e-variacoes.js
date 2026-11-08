/* ===== modelo configurável: regras de cada coluna do arquivo (tipo, obrigatória, padrão, tamanho, lista) ===== */
const TIPOS_COL=[["","Como vem"],["texto","Texto"],["numero","Número"],["inteiro","Inteiro"],["dinheiro","Dinheiro (2 casas)"]];
const listaCol=c=>String(c&&c.lista||"").split(";").map(s=>s.trim()).filter(Boolean);
const maxCol=c=>{const n=Math.trunc(num(c&&c.max)||0);return n>0?n:0};
const abaNome=mo=>String(mo&&mo.aba||"").replace(/[\[\]:*?\/\\]/g," ").trim().slice(0,31)||"Worksheet";
/* valor final de uma célula do arquivo: aplica o valor padrão (se vazia) e o tipo da coluna */
function valorCol(c,x){
  let o=x||null;
  const vaz=!o||(o.v==null&&!o.f)||(typeof o.v==="string"&&o.v.trim()==="");
  if(vaz){if(vazio(c.padrao))return null;o={v:String(c.padrao)}}
  const t=c.tipo||"";
  if(t==="texto")return {v:o.v==null?(o.txt||(o.f?"="+o.f:"")):String(o.v)};
  if(o.v==null&&o.f){const fz0=(t==="numero"||t==="inteiro"||t==="dinheiro")?num(c.fator):null;   /* fórmula também recebe o fator da coluna */
    return fz0!=null&&fz0>0&&fz0!==1?{...o,f:"("+o.f+")*"+String(fz0)}:o}
  if(t==="numero"||t==="inteiro"||t==="dinheiro"){
    const n=typeof o.v==="number"?o.v:num(o.v);
    if(n==null)return {v:o.v,erro:1};
    const fz=num(c.fator);   /* fator: multiplica o número (ex.: peso em gramas × 0,001 = quilos); sem fórmula, o valor já sai convertido */
    const lim=x=>parseFloat(x.toPrecision(12));   /* tira o ruído de ponto flutuante (0,1×3 = 0,30000000000000004) */
    if(fz!=null&&fz>0&&fz!==1){const r=Math.round(lim(n*fz*1e6))/1e6;return {v:t==="dinheiro"?Math.round(lim(r*100))/100:lim(r)}}
    if(t==="dinheiro")return {v:Math.round(lim(n*100))/100,f:o.f,z:"0.00"};
    return {v:n,f:o.f}}
  return o}
/* ===== variações no arquivo: produto pai + variações (modelo com "Agrupar em produto pai + variações") =====
   Cada peça com 2 ou mais linhas (banhos e/ou tamanhos) vira 1 linha de produto + 1 linha por variação, com
   descrição "Tamanho:14;Cor:Ouro" e o código do pai. Colunas automáticas: @desc, @pv e @pai. */
const attrVar=s=>String(s==null?"":s).replace(/[:;|]/g," ").trim();
function saidaLinhas(g,mo){
  const rows=g.linhas;if(!mo||mo.agrupar!=="sim")return rows.map(row=>({row,t:"normal"}));
  const por=new Map();rows.forEach(r=>{if(!por.has(r.lancId))por.set(r.lancId,[]);por.get(r.lancId).push(r)});
  const out=[],vistos=new Set(),codsE=new Set(rows.map(r=>String(r.v.E||"")));   /* códigos já existentes: o código do pai nunca repete um deles */
  rows.forEach(r=>{if(vistos.has(r.lancId))return;vistos.add(r.lancId);const grp=por.get(r.lancId);
    if(grp.length<2){out.push({row:grp[0],t:"normal"});return}
    const f=grp[0],l=S.lanc.find(x=>x.id===f.lancId),part0=String(f.part||""),E0=String(f.v.E||""),
      base=(b=>{while(codsE.has(b))b+="P";codsE.add(b);return b})(part0&&E0.endsWith(part0)?E0.slice(0,E0.length-part0.length):E0+"P"),
      c0=celulas(f,2)[LET.indexOf("V")],pv=c0&&typeof c0.v==="number"?String(c0.v):"",
      desc=l?comSufixoCat(val(l,"F"),val(l,"I")):"";
    out.push({row:{...f,banho:null,mk:null,ovs:[],bid:null,gi:null,key:"pai",part:"",verniz:null,v:{...f.v,E:base,F:desc||f.v.F,L:"",K:"",O:"",W:"",P:"",R:"",S:"",T:"",U:"",V:pv}},t:"pai"});
    const i0=out.length;const chave=ch=>String(ch.v.K||"")+"|"+semAc(ch.v.L||""),cont={};grp.forEach(ch=>{const k=chave(ch);cont[k]=(cont[k]||0)+1});
    const nomeBanho=ch=>{const bb=l?bhDe(l).banhos.find(x=>x.id===ch.bid):null;return bb?String(bb.nome||""):""};
    grp.forEach(ch=>{const a=[];if(!vazio(ch.v.K))a.push("Tamanho:"+attrVar(ch.v.K));if(!vazio(ch.v.L)){let cor=String(ch.v.L);if(cont[chave(ch)]>1){const nb=nomeBanho(ch);if(nb)cor=semAc(nb).includes(semAc(cor))?nb:cor+" "+nb}a.push("Cor:"+attrVar(cor))}if(!a.length)a.push("Variação:"+attrVar(ch.part||ch.v.E));
      out.push({row:ch,t:"filho",pai:base,attrs:a.join(";")})});{const fl=out.slice(i0),cn={};fl.forEach(e=>{cn[e.attrs]=(cn[e.attrs]||0)+1});fl.forEach(e=>{if(cn[e.attrs]>1)e.attrs+=";Variação:"+attrVar(e.row.part||e.row.v.E)})}});
  return out}
/* valor "cru" de uma coluna do modelo para uma linha de saída (colunas @ são automáticas) */
function celCol(c,cs,e){const k=c.k||"";
  if(k[0]==="@"){if(k==="@desc")return e.t==="filho"?{v:e.attrs}:cs[LET.indexOf("F")]||null;
    const v=k==="@pv"?(e.t==="filho"?"Variação":"Produto"):k==="@pai"?(e.t==="filho"?e.pai:""):"";return v===""?null:{v}}
  return k?cs[LET.indexOf(k)]||null:null}
/* confere cada linha com as regras do modelo; devolve a lista de problemas */
function validarModelo(g,cols){const out=[],sl=saidaLinhas(g,modeloAtual()),vz={};
  sl.forEach((e,i)=>{const row=e.row,cs=celulas(row,i+2);
    cols.forEach(c=>{const r=valorCol(c,celCol(c,cs,e)),v=r?r.v:null,vaz=!r||(v==null&&!r.f)||String(v==null?"x":v).trim()==="",h=String(c.h||(c.k?NOME[c.k]:"(coluna)"));
      const add=m=>out.push({l:i+2,ref:row.v.E||"",col:h,msg:m});
      if(vaz){if(c.obrig){(vz[h]=vz[h]||[]).push(add)}return}
      if(v==null)return;
      const s=String(v);
      if(r.erro)add("não é um número: “"+s.slice(0,30)+"”");
      else if(c.tipo==="inteiro"&&!Number.isInteger(v))add("precisa ser um número inteiro");
      if(maxCol(c)&&s.length>maxCol(c))add("passa de "+maxCol(c)+" caracteres");
      const L=listaCol(c);if(L.length&&!L.some(z=>semAc(z)===semAc(s)))add("fora da lista permitida ("+L.slice(0,4).join(", ")+(L.length>4?"…":"")+")")})});
  /* coluna obrigatória vazia em quase todas as linhas: um aviso só */
  const n=sl.length;Object.keys(vz).forEach(h=>{const a=vz[h];if(n>=4&&a.length>=Math.ceil(n*0.8))out.unshift({l:"todas",ref:"—",col:h,msg:`obrigatória e vazia em ${a.length} de ${n} linhas`});else a.forEach(f=>f("obrigatória e vazia"))});
  return out}
const normH=h=>semAc(h).replace(/[^a-z0-9]+/g," ").trim();
const SIN={A:["id"],B:["foto","imagem","url da foto","link da foto","url imagens externas","url da imagem","link da imagem","imagens"],C:["codigo de barras","cod barras","codigo barras","barcode"],D:["codigo pai","pai"],E:["referencia","ref","sku","codigo","cod"],F:["descricao","nome","produto","nome do produto","titulo","descricao do produto"],G:["codigo do fornecedor","cod fornecedor","codigo fornecedor","ref fornecedor","cod no fornecedor"],H:["fornecedor"],I:["categoria","categoria do produto"],J:["subcategoria","sub categoria"],K:["tamanho","medida","numero"],L:["cor"],M:["observacao","observacoes","obs"],N:["peso","gramas","peso g","peso kg","peso (kg)","peso bruto","peso bruto kg","peso liquido kg","peso liquido","peso liquido g"],O:["milesimos de banho","milesimos","milesimos banho"],P:["custo de compra","custo compra","custo","preco de custo","valor de custo"],Q:["custo de insumos","insumos"],R:["custo do banho de ouro","banho de ouro"],S:["custo do banho de rodio","banho de rodio"],T:["custo do banho de prata","banho de prata"],U:["custo do banho de verniz","verniz","custo verniz"],V:["preco de varejo","preco","preco de venda","valor","varejo","preco venda","valor de venda"],W:["quantidade","qtd","estoque","qtde","estoque inicial","estoque atual","estoque, atual"],X:["localizacao","local"],Y:["numero ncm","ncm"],Z:["numero ean","ean","gtin","gtin ean"],AA:["cfop"],AB:["fcp"],AC:["imposto","icms"],AD:["exibir no catalogo","catalogo"],AE:["status","situacao"]};
/* descobre a coluna interna de um título de planilha qualquer (nomes do modelo atual, nomes do Jueri e sinônimos) */
function chaveDoCabecalho(h){const n=normH(h);if(!n)return null;
  const mc=modeloAtual().cols.find(c=>c.k&&normH(c.h)===n);if(mc)return mc.k;
  const i=HEAD.findIndex(x=>normH(x)===n);if(i>=0)return LET[i];
  for(const k of Object.keys(SIN))if(SIN[k].includes(n))return k;return null}
/* fórmulas guardam as letras internas (N, P…U); no arquivo viram as letras do modelo. Sem a coluna no modelo, vai só o valor. */
function traduzF(f,cols){const mapa={};cols.forEach((c,i)=>{if(c.k&&!(c.k in mapa))mapa[c.k]=letraN(i)});let falta=false;
  const out=String(f).replace(/([A-Z]{1,2})([0-9]+)/g,(m,a,n)=>{if(!(a in mapa)){falta=true;return m}return mapa[a]+n});return falta?null:out}
function celulas(row,r,sugestao){
  const c=celulasBase(row,r);
  if(sugestao&&row.mk&&vazio(row.v.V)){   /* só o formulário pede a sugestão; tabela e arquivo saem sem preço se ele não foi digitado */const iv=LET.indexOf("V");let soma=0;["P","Q","R","S","T","U"].forEach(L=>{const x=c[LET.indexOf(L)];if(x&&typeof x.v==="number")soma+=x.v});
    c[iv]={v:Math.round(soma*row.mk*100)/100,f:`ROUND((P${r}+Q${r}+R${r}+S${r}+T${r}+U${r})*${row.mk},2)`}}
  return c;
}
function celulasBase(row,r){
  return LET.map(L=>{
    const v=row.v[L];
    if(row.banho&&FORMULA.has(L)){if(!vazio(v))return lerValor(v,L);return calcBanho(row,L,r)}
    if(vazio(v))return null;
    if(L==="P"){const c=num(v);if(c==null)return lerValor(v,L);if(row.desconto>0){const k=r4(row.desconto/100);return {v:Math.round((c-c*k)*100)/100,f:`ROUND(${c}-(${c}*${k}),2)`}}return {v:c}}
    return lerValor(v,L);
  });
}
function avisos(g){
  const out=[],cc=cfg().colcfg,ps=new Set(S.lanc.map(l=>prefDe(val(l,"I"),val(l,"J"))));
  ps.forEach(p=>{if(!(ultimo(p)>0)&&!((g.manual||{})[p]>0))out.push({bad:1,t:`Falta a última peça de ${p} no sistema.`})});
  Object.entries(g.manual||{}).forEach(([p,n])=>{if(n>ultimo(p))out.push({t:`${p}${fnum(p,n)} foi digitada à mão (a última do sistema é ${p}${fnum(p,ultimo(p))}): as próximas automáticas continuam em ${p}${fnum(p,n+1)}`})});
  const d=new Set(g.linhas.filter(r=>r.dup).map(r=>r.v.E));if(d.size)out.push({bad:1,t:`Referência repetida: ${[...d].join(", ")}`});
  LET.forEach(L=>{if(!cc[L].obrig)return;const k=g.linhas.filter(r=>L==="W"?!(num(r.v.W)>0):vazio(r.v[L])).length;if(k)out.push({t:`${k} sem ${NOME[L]}`})});
  const sp=g.linhas.filter(r=>r.banho&&num(r.v.N)==null&&r.banho.modo!=="fixo").length;if(sp)out.push({t:`${sp} bruta(s) sem Peso`});
  {const sm=new Set();g.linhas.forEach(r=>{if(r.banho&&r.banho.mult==null&&vazio(r.v[r.banho.coluna]))sm.add(r.v.L||r.col||r.banho.coluna)});
   sm.forEach(n=>out.push({t:`Banho “${n}” sem multiplicador: o custo do banho sai vazio — preencha em Banhos e galvânicas`}))}
  return out;
}

