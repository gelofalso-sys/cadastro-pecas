/* ===== exportar ===== */
function faixaRefs(g){const c=contFinal(g);return Object.keys(c).filter(p=>c[p]>ultimo(p)).map(p=>{const i=ultimo(p)+1,A=p+fnum(p,i),B=p+fnum(p,c[p]);return i===c[p]?A:`${A}–${B}`}).join(", ")}
function faixaFiltro(g){const bs=[...new Set(g.linhas.map(r=>refBase(r.v.E)).filter(Boolean))].sort();return bs.length<=4?bs.join(", "):bs[0]+"–"+bs[bs.length-1]}
function celulaXlsx(x,cols){if(x.f){const tf=cols?traduzF(x.f,cols):x.f;if(tf){const c={t:"n",f:tf};if(typeof x.v==="number")c.v=x.v;else if(typeof x.calc==="number")c.v=x.calc;return c}return typeof x.v==="number"?{t:"n",v:x.v}:typeof x.calc==="number"?{t:"n",v:x.calc}:{t:"s",v:"="+x.f}}return typeof x.v==="number"?{t:"n",v:x.v}:{t:"s",v:String(x.v)}}
const DLNAV={save:async({filename,data})=>{const b=data instanceof Blob?data:new Blob([data]),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}};
async function obterDL(){let dl=null;try{dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null}catch(e){}return dl||DLNAV}
/* pendências antes de exportar: obrigatório vazio, peso faltando (banho sem custo) e banho sem multiplicador */
function pendenciasExport(g){
  const cc=cfg().colcfg,pend=[];
  g.linhas.forEach((r,i)=>{const falta=[];
    LET.forEach(L=>{if(cc[L]&&cc[L].obrig&&(L==="W"?!qtdPos(r.v.W,r.v,r.desconto):(vazio(r.v[L]))))falta.push(NOME[L])});
    {const cs=celulas(r,i+2);Object.keys(r.v).forEach(L=>{if(!VALIDA_NUM.has(L)||L==="W")return;const x=cs[LET.indexOf(L)];if(!x||x.v!=null||!x.f||!x.txt)return;
      if(typeof x.calc!=="number")falta.push(NOME[L]+": a fórmula não dá resultado (divisão por zero ou célula vazia)");else if(x.calc<0)falta.push(NOME[L]+": a fórmula dá número negativo")})}
    if(!vazio(r.v.W)&&!qtdPos(r.v.W,r.v,r.desconto)&&!falta.includes(NOME.W))falta.push("Quantidade precisa ser um número inteiro de 1 em diante (a fórmula não dá isso)");
    if(r.banho&&pesoLinha(r)==null&&r.banho.modo!=="fixo"&&!falta.includes(NOME.N))falta.push("Peso (sem ele o custo do banho fica vazio)");
    if(r.banho&&r.banho.mult==null&&vazio(r.v[r.banho.coluna]))falta.push("multiplicador do banho (custo do banho fica vazio)");
    if(falta.length)pend.push({i,r,falta})});
  /* o mesmo campo faltando em (quase) todas as peças vira UMA linha de aviso, não dezenas (ex.: sem Preço de Varejo definido) */
  const cont={};pend.forEach(p=>p.falta.forEach(f=>cont[f]=(cont[f]||0)+1));const tot=g.linhas.length,todos=Object.keys(cont).filter(f=>tot>=4&&cont[f]>=Math.ceil(tot*0.8));
  const out=todos.map(f=>`Em ${cont[f]} de ${tot} peças falta: ${f}. Se isso é esperado (ex.: ainda sem preço de venda), pode seguir.`);
  pend.forEach(p=>{const fl=p.falta.filter(f=>!todos.includes(f));if(fl.length)out.push(`Linha ${p.i+2} (${p.r.v.E||"sem ref."}): ${fl.join(", ")}`)});
  {const dups=[...new Set(g.linhas.filter(r=>r.dup).map(r=>r.v.E))];if(dups.length)out.unshift(`Referência repetida em ${dups.length} peça(s): ${dups.slice(0,6).join(", ")}${dups.length>6?"…":""}. O arquivo sai assim; confira se o outro sistema aceita referências iguais.`)}
  return out}
/* conferência antes de exportar: pendências da tabela + regras do modelo escolhido */
let expPend=null;
function conferirExport(g,cols){const ger=pendenciasExport(g),mod=validarModelo(g,cols);return {ger,mod,n:ger.length+mod.length}}
function abrirConferencia(g,cols,acao){const p=conferirExport(g,cols);if(!p.n)return false;expPend=acao||null;mostrarConferencia(p,!!acao);return true}
function mostrarConferencia(p,podeSeguir){const LIM=300,mo=modeloAtual();
  repModal(`<div class="rep-h"><div><b class="rep-t">Conferência antes de exportar</b><div class="hint">Modelo <b>${esc(mo.nome)}</b> · ${p.n} ponto(s) para olhar${p.n>LIM*2?" (mostrando os primeiros)":""}</div></div><div class="rep-ac">${podeSeguir?`<button type="button" class="btn pri sm" data-act="exp-assim">Exportar mesmo assim</button>`:""}<button type="button" class="btn sm" data-act="rel-fechar">${podeSeguir?"Voltar e corrigir":"Fechar"}</button></div></div>
  ${p.ger.length?`<div class="rep-rf"><b>Pendências da tabela (${p.ger.length})</b></div><div class="rep-tb"><table><tbody>${p.ger.slice(0,LIM).map(s=>`<tr><td>${esc(s)}</td></tr>`).join("")}</tbody></table></div>`:""}
  ${p.mod.length?`<div class="rep-rf"><b>Regras do modelo (${p.mod.length})</b></div><div class="rep-tb"><table><thead><tr><th class="n">Linha</th><th>Referência</th><th>Coluna</th><th>Problema</th></tr></thead><tbody>${p.mod.slice(0,LIM).map(x=>`<tr><td class="n">${x.l}</td><td class="mono">${esc(x.ref)}</td><td>${esc(x.col)}</td><td class="al-t">${esc(x.msg)}</td></tr>`).join("")}</tbody></table></div>`:""}`)}
/* arquivo CSV do modelo: separador, decimal e codificação escolhidos no modelo */
function txtSaida(r,c,dec){if(!r)return "";const v=r.v;if(v==null)return r.f?"="+r.f:"";if(typeof v==="number")return (c.tipo==="dinheiro"?v.toFixed(2):String(v)).replace(".",dec);return String(v)}
const protegeTxt=s=>{s=String(s==null?"":s);return /^[=+@\t\r]/.test(s)||(s[0]==="-"&&!/^-\d+([.,]\d+)?$/.test(s))?"'"+s:s};
function montarCsv(g,cols,mo,slx){
  const sep=mo.sep==="tab"?String.fromCharCode(9):mo.sep===","?",":";",dec=mo.dec==="."?".":",",Q=String.fromCharCode(34),NL=String.fromCharCode(13,10);
  const q=s=>{s=String(s);return (s.includes(sep)||s.includes(Q)||/[\r\n]/.test(s))?Q+s.split(Q).join(Q+Q)+Q:s};
  const lin=[cols.map(c=>q(protegeTxt(c.h))).join(sep)];
  const sl=slx||saidaLinhas(g,mo);
  sl.forEach((e,i)=>{const cs=celulas(e.row,i+2);lin.push(cols.map(c=>{let r=valorCol(c,celCol(c,cs,e));
    if(r&&r.v==null&&r.f){const gv=(L,d)=>{const x=cs[LET.indexOf(L)];return x&&typeof x.v==="number"?x.v:x&&x.f&&d<5?avalF(x.f,K=>gv(K,d+1)):null},n0=typeof r.calc==="number"?r.calc:avalF(r.f,L=>gv(L,0)),n=n0;if(n!=null)r={...r,v:c.tipo==="dinheiro"?Math.round(n*100)/100:parseFloat(n.toPrecision(12))}}   /* CSV não tem fórmula: sai o valor calculado */
    let s=txtSaida(r,c,dec);if(!r||typeof r.v!=="number")s=protegeTxt(s);return q(s)}).join(sep))});
  return (mo.enc==="utf8"?"":String.fromCharCode(65279))+lin.join(NL)+NL}
/* com filtro ativo, baixar e copiar levam as PEÇAS que o filtro mostra, sempre com todas as variações (pai e filhos não se separam) */
function gerarExport(){const g0=gerar(),fil=filtroOn();
  /* com filtro: sai EXATAMENTE o que o filtro mostra. Só no modelo que agrupa em produto pai + variações a peça vai inteira (senão o pai ficaria sem filhos) */
  const peca=!!(fil&&modeloAtual().agrupar==="sim");
  return {g0,fil,peca,g:fil?(()=>{if(peca){const ids=new Set(g0.linhas.filter(casa).map(r=>r.lancId));return {...g0,linhas:g0.linhas.filter(r=>ids.has(r.lancId))}}return {...g0,linhas:g0.linhas.filter(casa)}})():g0}}
async function baixar(forcar,ids){
  const GE=gerarExport(),g=ids?{...GE.g0,linhas:GE.g0.linhas.filter(r=>ids.has(r.lancId))}:GE.g,idsExp=S.lanc.map(l=>l.id),sigExp=sigLanc(),cfgExp=sigCfg();if(!g.linhas.length){toast(ids?"Nenhuma peça selecionada para baixar.":GE.fil?"Nenhuma linha no filtro atual. Limpe o filtro para baixar tudo.":"A lista está vazia.");return}
  const cols=colunasExport(),mo=modeloAtual();let csv=mo.formato==="csv";
  if(!cols.length){toast("O modelo não tem nenhuma coluna marcada para sair no arquivo.");return}
  if(!forcar&&abrirConferencia(g,cols,{tipo:"xlsx",ids:ids||null}))return;
  if(!csv&&typeof XLSX==="undefined"){csv=true;toast("A biblioteca de planilha (pasta lib) não carregou: baixei em CSV, que o Excel também abre. Para .xlsx, abra o arquivo que fica ao lado da pasta lib.")}
  const sl=saidaLinhas(g,mo),partes=dividirLotes(sl,Math.trunc(num(mo.lote)||0)),faixa=ids?faixaFiltro(g)+" (selecionadas)":(GE.fil?faixaFiltro(g):(faixaRefs(g)||"lista"))+(GE.fil?" (filtro)":""),dl=await obterDL(),ext=csv?"csv":"xlsx";
  const nomeBase=`Cadastro de peças ${faixa.replace(/[^\w\- ,]/g,"-")}`;let feitas=0;
  for(let p=0;p<partes.length;p++){
    const blob=csv?new Blob([montarCsv(g,cols,mo,partes[p])],{type:"text/csv;charset=utf-8"}):montarXlsx(cols,mo,partes[p]);
    try{await dl.save({filename:partes.length>1?`${nomeBase} (parte ${p+1} de ${partes.length}).${ext}`:`${nomeBase}.${ext}`,data:blob});feitas++}
    catch(e){toast(e&&e.code==="declined"?"Download cancelado.":e&&e.code==="rate_limited"?`Já há um download esperando confirmação (baixados ${feitas} de ${partes.length} arquivos).`:"Não consegui salvar o arquivo. Use Copiar para o Excel.");break}}
  if(feitas===partes.length){if(ids)toast(`Baixei só as ${ids.size} peça(s) selecionada(s): ${g.linhas.length} linha(s).`);if(!GE.fil&&!ids)lastExport={cont:contFinal(g),faixa,ids:idsExp,sig:sigExp,cfg:cfgExp};renderTopo();if(GE.fil)toast(GE.peca?`Baixei as peças que o filtro mostra: ${g.linhas.length} linha(s) (de ${GE.g0.linhas.length}), com todas as variações de cada peça (modelo com produto pai).`:`Baixei só as ${g.linhas.length} linha(s) do filtro (de ${GE.g0.linhas.length}).`);
    const lt=Math.trunc(num(mo.lote)||0),gr=lt>0?partes.filter(p=>p.length>lt).length:0;   /* produto com mais variações que o limite: fica inteiro num arquivo só */
    if(partes.length>1||gr)toast(`${partes.length} arquivo(s) baixado(s)${partes.length>1?` (até ${lt} linhas cada)`:""}.${gr?` Atenção: ${gr} arquivo(s) passaram do limite de ${lt} linhas, porque um produto com suas variações não pode ser separado. Se o outro sistema recusar, reduza as variações desse produto.`:""}`)}
}
/* divide a saída em arquivos de no máximo "lote" linhas, sem separar um produto pai das suas variações */
function dividirLotes(sl,lote){if(!(lote>0)||sl.length<=lote)return [sl];
  const grupos=[];sl.forEach(e=>{if(e.t==="filho"&&grupos.length)grupos[grupos.length-1].push(e);else grupos.push([e])});
  const out=[];let cur=[];grupos.forEach(gp=>{if(cur.length&&cur.length+gp.length>lote){out.push(cur);cur=[]}cur.push(...gp)});if(cur.length)out.push(cur);return out}
function montarXlsx(cols,mo,sl){const ws=XLSX.utils.aoa_to_sheet([cols.map(c=>c.h)]);
  sl.forEach((e,i)=>{const cs=celulas(e.row,i+2);cols.forEach((c,j)=>{const r=valorCol(c,celCol(c,cs,e));if(!r)return;const cel=celulaXlsx(r,cols);if(r.z&&cel.t==="n")cel.z=r.z;else if(cel.t==="n"&&c.k==="N"&&!c.fator&&!c.tipo)cel.z="0.000";else if(cel.t==="n"&&DUAS.has(c.k)&&!c.fator&&!c.tipo)cel.z="0.00";ws[letraN(j)+(i+2)]=cel})});
  ws["!ref"]="A1:"+letraN(Math.max(cols.length,1)-1)+(sl.length+1);ws["!cols"]=cols.map(c=>({wch:COLW[LET.indexOf(c.k)]||14}));
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,abaNome(mo));
  return new Blob([XLSX.write(wb,{bookType:"xlsx",type:"array"})])}
/* Excel e Google Sheets leem a fórmula colada no idioma da conta: em português é ARRED(…;…) com vírgula decimal, em inglês ROUND(…,…) com ponto.
   Idiomas com vírgula decimal que não sejam o português (nomes de função diferentes) recebem só o valor calculado, que funciona em qualquer planilha. */
const LOC=(()=>{let l="pt-br",dec=",";try{l=String(navigator.language||"pt-br").toLowerCase();dec=(1.1).toLocaleString(navigator.language||"pt-BR").includes(",")?",":"."}catch(e){}return {dec,pt:l.startsWith("pt")}})();
const fLocal=f=>LOC.dec==="."?f:LOC.pt?f.replace(/,/g,";").replace(/(\d)\.(\d)/g,"$1,$2").replace(/\bROUND\(/g,"ARRED("):null;
async function copiar(ids,forcar){
  const GE=gerarExport(),g0=GE.g0,idsExp=S.lanc.map(l=>l.id),sigExp=sigLanc(),cfgExp=sigCfg(),g=ids?{...g0,linhas:g0.linhas.filter(r=>ids.has(r.lancId))}:GE.g;if(!g.linhas.length){toast(!ids&&GE.fil?"Nenhuma linha no filtro atual. Limpe o filtro para copiar tudo.":"Nada para copiar.");return}
  const cols=colunasExport();if(!cols.length){toast("O modelo não tem nenhuma coluna marcada para sair no arquivo.");return}
  if(!forcar&&abrirConferencia(g,cols,{tipo:"copiar",ids:ids||null}))return;
  const TAB=String.fromCharCode(9),NL=String.fromCharCode(10);
  const mo=modeloAtual(),sl=saidaLinhas(g,mo);
  /* célula do Excel colado: TAB/quebras viram espaço; aspas obrigam a envolver a célula em aspas (dobradas) */
  const cel=s=>{s=String(s).replace(/[\t\r\n]+/g," ");return s.includes('"')?'"'+s.split('"').join('""')+'"':s};
  const txt=[cols.map(c=>cel(protegeTxt(String(c.h==null?"":c.h).replace(/[\t\r\n]+/g," ")))).join(TAB),...sl.map((e,i)=>{const cs=celulas(e.row,i+2);return cols.map(c=>{const x=valorCol(c,celCol(c,cs,e));if(!x)return "";
    if(x.f){const tf=traduzF(x.f,cols),fl=tf&&fLocal(tf);if(fl)return "="+fl}
    const xv=x.v==null&&typeof x.calc==="number"?{...x,v:x.calc}:x,s=txtSaida(xv,c,LOC.dec).replace(/[\t\r\n]+/g," ");
    return cel(typeof xv.v==="number"?s:protegeTxt(s))}).join(TAB)})].join(NL);   /* texto que começaria com = + - @ não pode virar fórmula no Excel */
  try{await navigator.clipboard.writeText(txt);toast(`Copiado (${g.linhas.length} linhas${!ids&&GE.fil?(GE.peca?` das peças do filtro, com todas as variações; de ${g0.linhas.length}`:` do filtro, de ${g0.linhas.length}`):""} + cabeçalho). Cole na célula A1 de uma planilha vazia.`);if(!ids&&!GE.fil){lastExport={cont:contFinal(g),faixa:faixaRefs(g),ids:idsExp,sig:sigExp,cfg:cfgExp};renderTopo()}}
  catch(e){document.getElementById("tools").insertAdjacentHTML("beforeend",`<div style="width:100%"><p class="hint">Selecione e copie com Ctrl+C:</p><textarea class="cp" id="cpT" readonly></textarea></div>`);const t=document.getElementById("cpT");t.value=txt;t.select()}
}
function sigCfg(){const c={...S.config};delete c.seqs;delete c.observacoes;return JSON.stringify(c)}
function sigLanc(){const o={};S.lanc.forEach(l=>{o[l.id]=JSON.stringify(l)});return o}
function gravarExport(limpar){
  if(!lastExport)return;Object.entries(lastExport.cont).forEach(([p,n])=>{if(n>ultimo(p))cfg().seqs[p]=fnum(p,n)});
  S.lanc.forEach(l=>{const o=val(l,"M");if(o&&!cfg().observacoes.includes(o))cfg().observacoes.unshift(o)});cfg().observacoes=cfg().observacoes.slice(0,30);
  if(limpar&&lastExport.cfg&&lastExport.cfg!==sigCfg()){limpar=false;setTimeout(()=>toast("A configuração mudou depois da planilha (preços, fatores, modelo…): gravei só a numeração e deixei as peças na lista. Exporte de novo antes de limpar."),50)}
  if(limpar){const fei=new Set(lastExport.ids||S.lanc.map(l=>l.id)),sg=lastExport.sig||{};let alt=0;S.lanc=S.lanc.filter(l=>{if(!fei.has(l.id))return true;if(sg[l.id]!==undefined&&sg[l.id]!==JSON.stringify(l)){alt++;return true}return false});sel.clear();if(alt)setTimeout(()=>toast(alt+" peça(s) foram editadas depois da planilha e ficaram na lista."),50)}   /* só some o que foi exportado: peça lançada depois do download fica */
  lastExport=null;salvar(true);render();toast("Última peça do sistema atualizada.");
}

