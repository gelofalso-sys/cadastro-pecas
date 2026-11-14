/* ===== modelo configurável: regras de cada coluna do arquivo (tipo, obrigatória, padrão, tamanho, lista) ===== */
   /* o Excel recusa apóstrofo nas pontas e o nome History */
/* valor final de uma célula do arquivo: aplica o valor padrão (se vazia) e o tipo da coluna */
function valorCol(c,x){
  let o=x||null;
  const vaz=!o||(o.v==null&&!o.f)||(typeof o.v==="string"&&o.v.trim()==="");
  if(vaz){if(vazio(c.padrao))return null;o={v:String(c.padrao)}}
  if(c.k==="I"&&o&&typeof o.v==="string"){const cx=catBy(o.v);if(cx&&cx.nomeExport)o={...o,v:cx.nomeExport}}   /* nome da categoria como a planilha/Jueri conhece */
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
/* ===== variações no arquivo: produto pai + variações (modelo com "Agrupar em produto pai + variações") =====
   Cada peça com 2 ou mais linhas (banhos e/ou tamanhos) vira 1 linha de produto + 1 linha por variação, com
   descrição "Tamanho:14;Cor:Ouro" e o código do pai. Colunas automáticas: @desc, @pv e @pai. */
function saidaLinhas(g,mo){
  const rows=g.linhas;if(!mo||mo.agrupar!=="sim")return rows.map(row=>({row,t:"normal"}));
  const por=new Map();rows.forEach(r=>{if(!por.has(r.lancId))por.set(r.lancId,[]);por.get(r.lancId).push(r)});
  const out=[],vistos=new Set(),codsE=new Set(rows.map(r=>String(r.v.E||"")));   /* códigos já existentes: o código do pai nunca repete um deles */
  rows.forEach(r=>{if(vistos.has(r.lancId))return;vistos.add(r.lancId);const grp=por.get(r.lancId);
    if(grp.length<2){out.push({row:grp[0],t:"normal"});return}
    const f=grp[0],l=S.lanc.find(x=>x.id===f.lancId),part0=String(f.part||""),E0=String(f.v.E||""),
      base=(b=>{while(codsE.has(b))b+="P";codsE.add(b);return b})(part0&&E0.endsWith(part0)?E0.slice(0,E0.length-part0.length):E0+"P"),
      c0=celulas(f,2)[LET.indexOf("V")],pv=c0&&typeof c0.v==="number"?String(c0.v):c0&&typeof c0.calc==="number"?String(c0.calc):"",
      desc=l?comSufixoCat(val(l,"F"),val(l,"I"),l.semSufixoCat):"";
    out.push({row:{...f,banho:null,mk:null,ovs:[],bid:null,gi:null,key:"pai",part:"",verniz:null,v:{...f.v,E:base,F:desc||f.v.F,L:"",K:"",O:"",W:"",P:"",R:"",S:"",T:"",U:"",V:pv}},t:"pai"});
    const i0=out.length;const chave=ch=>String(ch.v.K||"")+"|"+semAc(ch.v.L||""),cont={};grp.forEach(ch=>{const k=chave(ch);cont[k]=(cont[k]||0)+1});
    const nomeBanho=ch=>{const bb=l?bhDe(l).banhos.find(x=>x.id===ch.bid):null;return bb?String(bb.nome||""):""};
    grp.forEach(ch=>{const a=[];if(!vazio(ch.v.K))a.push("Tamanho:"+attrVar(ch.v.K));if(!vazio(ch.v.L)){let cor=String(ch.v.L);if(cont[chave(ch)]>1){const nb=nomeBanho(ch);if(nb)cor=semAc(nb).includes(semAc(cor))?nb:cor+" "+nb}a.push("Cor:"+attrVar(cor))}if(!a.length)a.push("Variação:"+attrVar(ch.part||ch.v.E));
      out.push({row:ch,t:"filho",pai:base,attrs:a.join(";")})});{const fl=out.slice(i0),cn={};fl.forEach(e=>{cn[e.attrs]=(cn[e.attrs]||0)+1});fl.forEach(e=>{if(cn[e.attrs]>1)e.attrs+=";Variação:"+attrVar(e.row.part||e.row.v.E)})}});
  return out}
/* valor "cru" de uma coluna do modelo para uma linha de saída (colunas @ são automáticas) */
/* confere cada linha com as regras do modelo; devolve a lista de problemas */
function validarModelo(g,cols){const out=[],sl=saidaLinhas(g,modeloAtual()),vz={},cod={};
  sl.forEach((e,i)=>{const row=e.row,cs=celulas(row,i+2);
    cols.forEach(c=>{const r=valorCol(c,celCol(c,cs,e)),v=r?r.v:null,vaz=!r||(v==null&&!r.f)||String(v==null?"x":v).trim()==="",h=String(c.h||(c.k?NOME[c.k]:"(coluna)"));
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
  {const mo0=modeloAtual();if(/bling/i.test(String(mo0.nome||""))||cols.some(c=>c.k==="@pai")){const rep=Object.entries(cod).filter(([k,a])=>k&&a.length>1);rep.slice(0,200).forEach(([k,a])=>out.unshift({l:a[1],ref:(sl[a[1]-2]&&sl[a[1]-2].row.v.E)||k,col:"Código",msg:`repetido nas linhas ${a.slice(0,5).join(", ")}${a.length>5?"…":""}: no Bling o Código precisa ser único. Corrija a referência ou exporte mesmo assim se tiver certeza.`}))}}
  return out}
/* descobre a coluna interna de um título de planilha qualquer (nomes do modelo atual, nomes do Jueri e sinônimos) */
function chaveDoCabecalho(h){const n=normH(h);if(!n)return null;
  const mc=modeloAtual().cols.find(c=>c.k&&normH(c.h)===n);if(mc)return mc.k;
  const i=HEAD.findIndex(x=>normH(x)===n);if(i>=0)return LET[i];
  for(const k of Object.keys(SIN))if(SIN[k].includes(n))return k;return null}
/* fórmulas guardam as letras internas (N, P…U); no arquivo viram as letras do modelo. Sem a coluna no modelo, vai só o valor. */
/* centavos no arredondamento comercial (1,005 → 1,01), sem o erro do ponto flutuante */
/* o percentual de desconto entra no coeficiente com precisão total (1,234% = 0,01234) */
/* uma fórmula digitada vale para a própria linha: as referências saem apontando para a linha real (no app e no Excel dão o mesmo número) */
function avisos(g){
  const out=[],cc=cfg().colcfg,ps=new Set(S.lanc.map(l=>prefDe(val(l,"I"),val(l,"J"))));
  ps.forEach(p=>{if(!(ultimo(p)>0)&&!((g.manual||{})[p]>0))out.push({bad:1,t:`Falta a última peça de ${p} no sistema.`})});
  Object.entries(g.manualReal||{}).forEach(([p,n])=>{if(n>ultimo(p))out.push({t:`${p}${fnum(p,n)} foi digitada à mão (a última do sistema é ${p}${fnum(p,ultimo(p))}): as próximas automáticas continuam em ${p}${fnum(p,n+1)}`})});
  const d=new Set(g.linhas.filter(r=>r.dup).map(r=>r.v.E));if(d.size)out.push({bad:1,t:`Referência repetida: ${[...d].join(", ")}`});
  LET.forEach(L=>{if(!cc[L].obrig)return;const k=g.linhas.filter(r=>L==="W"?!qtdPos(r.v.W,r.v,r.desconto):vazio(r.v[L])).length;if(k)out.push({t:`${k} sem ${NOME[L]}`})});
  const sp=g.linhas.filter(r=>r.banho&&pesoLinha(r)==null&&r.banho.modo!=="fixo").length;if(sp)out.push({t:`${sp} bruta(s) sem Peso`});
  {const sm=new Set();g.linhas.forEach(r=>{if(r.banho&&r.banho.mult==null&&vazio(r.v[r.banho.coluna]))sm.add(r.v.L||r.col||r.banho.coluna)});
   sm.forEach(n=>out.push({t:`Banho “${n}” sem multiplicador: o custo do banho sai vazio — preencha em Banhos e galvânicas`}))}
  return out;
}

