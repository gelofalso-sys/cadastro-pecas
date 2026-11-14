/* ===== importar / cópia ===== */
let impPend=null;
function importar(file){
  try{checaTam(file,MAX_PLANILHA_BYTES,"A planilha")}catch(e){document.getElementById("impRes").innerHTML=`<p class="status bad">${esc(e.message)}. Nada foi lido.</p>`;return}
  const fr=new FileReader();fr.onload=()=>{try{
    const wb=XLSX.read(new Uint8Array(fr.result),{type:"array"});checaLinhasPlan(wb.Sheets[wb.SheetNames[0]]);const aoa=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:null});
    const hdr=(aoa[0]||[]).map(x=>String(x||"").trim().toLowerCase()),ix=n=>{const k={"referência":"E","fornecedor":"H","categoria":"I","subcategoria":"J","cor":"L","observação":"M"}[n];return (aoa[0]||[]).findIndex(h=>chaveDoCabecalho(h)===k)};
    const iR=ix("referência"),iF=ix("fornecedor"),iC=ix("categoria"),iS=ix("subcategoria"),iCor=ix("cor"),iO=ix("observação");if(iR<0)throw 0;
    const max={},pad={},forn=new Set(),cats={},cores=new Set(),obs=new Set();
    aoa.slice(1).forEach(r=>{const m=String(r[iR]||"").trim().toUpperCase().match(/^([A-Z]+)(\d+)[A-Z]*$/);if(m&&!(max[m[1]]>=+m[2]))max[m[1]]=+m[2];if(m&&m[2].length>1&&m[2][0]==="0")pad[m[1]]=Math.max(pad[m[1]]||0,m[2].length);
      if(iF>=0&&r[iF])forn.add(String(r[iF]).trim());if(iC>=0&&r[iC]){const c=String(r[iC]).trim();cats[c]=cats[c]||{subs:new Set(),pref:null};if(!cats[c].pref&&m)cats[c].pref=m[1];if(iS>=0&&r[iS])cats[c].subs.add(String(r[iS]).trim())}
      if(iCor>=0&&r[iCor])cores.add(String(r[iCor]).trim());if(iO>=0&&r[iO])obs.add(String(r[iO]).trim())});
    impPend={max,pad,forn,cats,cores,obs};
    document.getElementById("impRes").innerHTML=`<div class="banner"><p>Última peça encontrada: ${Object.entries(max).map(([p,n])=>`<b class="mono">${esc(p)}${esc(n)}</b>`).join(", ")||"nenhuma"} · ${forn.size} fornecedor(es) · ${Object.keys(cats).length} categoria(s) · ${cores.size} cor(es).</p><button class="btn pri sm" type="button" data-act="imp-ok">Aplicar</button></div>`;
  }catch(e){document.getElementById("impRes").innerHTML=e&&e.lim?`<p class="status bad">${esc(e.message)}. Nada foi lido.</p>`:`<p class="status bad">Não consegui ler. A primeira linha precisa ter o cabeçalho “Referência”.</p>`}};fr.readAsArrayBuffer(file);
}
function aplicarImp(){
  if(!impPend)return;const C=cfg(),lo=s=>s.toLowerCase(),{max,pad,forn,cats,cores,obs}=impPend;
  Object.entries(max).forEach(([p,n])=>{if(!(ultimo(p)>=n))C.seqs[p]=String(n).padStart((pad&&pad[p])||0,"0")});
  forn.forEach(f=>{if(!C.fornecedores.some(x=>lo(x.nome)===lo(f)))C.fornecedores.push({nome:f,desconto:"0",tipo:"bruta",codigo:""})});
  Object.entries(cats).forEach(([c,v])=>{let k=C.categorias.find(x=>lo(x.nome)===lo(c));if(!k){k={nome:c,prefixo:v.pref||"BR",subs:[]};C.categorias.push(k)}v.subs.forEach(s=>{if(!k.subs.some(x=>lo(x)===lo(s)))k.subs.push(s)})});
  cores.forEach(c=>{if(!C.cores.some(x=>lo(x)===lo(c)))C.cores.push(c)});obs.forEach(o=>{if(!C.observacoes.includes(o))C.observacoes.push(o)});
  impPend=null;salvar(true,false);render();toast("Importado.");
}
async function backup(){const dl=await obterDL();
  try{await dl.save({filename:"cadastro-pecas-cadastros.json",data:JSON.stringify({config:S.config},null,2)})}catch(e){if(e&&e.code!=="declined")toast("Não consegui salvar a cópia.")}}
/* restaurar só os cadastros: confere o arquivo ANTES de mexer em qualquer coisa; se falhar no meio, volta tudo como estava */
function restaurar(file){try{checaTam(file,MAX_BACKUP_BYTES,"O arquivo")}catch(e){toast("Cadastros NÃO restaurados — "+e.message+". Nada foi alterado.");return}const fr=new FileReader();fr.onload=()=>{
  let nova;try{const o=JSON.parse(fr.result);if(!ehObj(o)||!ehObj(o.config))throw new Error("o arquivo não tem os cadastros");checarConfig(o.config);nova=lerConfig(clone(o.config))}
  catch(e){toast("Cadastros NÃO restaurados — "+(e instanceof SyntaxError?"o arquivo está danificado ou não é uma cópia dos cadastros":e&&e.message?e.message:"arquivo inválido")+". Nada foi alterado.");return}
  if(!confirm("Restaurar a cópia substitui TODOS os cadastros (categorias, fornecedores, banhos, modelos…). A numeração nunca volta atrás: vale a maior de cada prefixo. Continuar?"))return;
  {const so=(S.config&&S.config.seqs)||{};nova.seqs=nova.seqs||{};Object.keys(so).forEach(p=>{if(num(so[p])>num(nova.seqs[p]))nova.seqs[p]=so[p]})}
  const antes=S.config,antesL=clone(S.lanc),antesF=clone(S.form);
  try{S.config=nova;migrarJueri();migrarGrades();sincGrade(S.form)}
  catch(e){S.config=antes;S.lanc=antesL;S.form=antesF;try{render()}catch(e2){}toast("Cadastros NÃO restaurados — deu erro ao aplicar. Nada foi alterado.");return}
  salvar(true,false);render();toast("Cadastros restaurados.",{t:"Desfazer",fn:()=>{S.config=antes;salvar(true);render()}})};fr.readAsText(file)}


/* Exemplo apenas visual: não grava peças ou cadastros. */
function abrirExemploVisual(){repModal(`<div class="rep-h"><div><b class="rep-t">Exemplo de lançamento</b><div class="hint">Demonstração ilustrativa: não altera sua tabela nem seus cadastros.</div></div><button class="btn sm" type="button" data-act="rel-fechar">Fechar exemplo</button></div><div class="rep-tb"><table><thead><tr><th>Referência</th><th>Descrição</th><th>Categoria</th><th>Banho</th><th>Quantidade</th></tr></thead><tbody><tr><td>BR0001A</td><td>Brinco argolinha lisa</td><td>Brincos › Argolas</td><td>Ouro</td><td>2</td></tr><tr><td>BR0001B</td><td>Brinco argolinha lisa</td><td>Brincos › Argolas</td><td>Prata</td><td>1</td></tr><tr><td>AN0001A</td><td>Anel solitário aro 16</td><td>Anel</td><td>Ouro</td><td>1</td></tr></tbody></table></div><p class="hint">Uma mesma peça pode gerar uma linha para cada banho ou variação selecionada.</p>`)}
