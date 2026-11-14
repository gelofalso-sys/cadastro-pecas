/* ===== núcleo: dominio — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { FORMULA, JUERI_CATS, LET, NOME, celulas, clone, kDesc, letraN, milDe, multItem, proxLetra, r2c, semAc } from "./colunas.js";
import { banhistaBy$, bhDe$, bonP$, catBy$, cfg$, comSufixoCat$, descBanho$, fnum$, fornBy$, insumosContaHTML$, insumosItensResumo$, itensGrade$, padraoDe$, prefDe$, temGrade$, todasGrades$, ultimo$, val$ } from "./configuracao.js";
import { numRaw, pesoLinha, qtdPos } from "./formulas.js";
import { banhoSemCalc, brl, descAuto, descVar, esc, fmt, num, opts, refParte, rotG, vazio, vzOn, vzPad } from "./utilidades.js";
// @fim-imports
export const MISTO=new Set(["H","I","J","L","M","AD","AE"]);
export const PMG={pequeno:"P",pequena:"P",medio:"M","médio":"M",media:"M","média":"M",grande:"G"};
export function dividirTamanhos(texto){const simples=t=>PMG[t.toLowerCase()]||/^(\d+([.,]\d+)?|(?!cm$|mm$)[A-Za-z]{1,3})$/i.test(t);
  return String(texto).replace(/(\d),(?=\d)/g,"$1\u0001").split(/[;,\/\n]+/).map(x=>x.replace(/\u0001/g,",").trim()).filter(Boolean).flatMap(x=>{const w=x.split(/\s+/);return w.length>1&&w.every(simples)?w:[x]})}
export function addTamanhos(gr,texto){const ids=[];
  dividirTamanhos(texto).forEach(tk=>{
    const sem=tk.toLowerCase(),letraPMG=PMG[sem]||(/^[A-Za-z]{1,3}$/.test(tk)?tk.toUpperCase():""),nome=PMG[sem]||tk;
    let it=gr.itens.find(x=>String(x.nome).toLowerCase()===nome.toLowerCase());
    if(!it){const letra=letraPMG&&!gr.itens.some(x=>String(x.letra).toUpperCase()===letraPMG)?letraPMG:proxLetra(gr.itens.map(x=>x.letra));it={id:uid(),letra,nome};gr.itens.push(it)}
    ids.push(it.id)});return ids}
export const NUMORIG={};
export function conjQtd(c){if(c.qtd==null)return 1;const n=num(c.qtd);return Number.isInteger(n)&&n>=1&&n<=9999?n:null}
export const novaComp=desc=>({id:uid(),desc:desc||"",qtd:"1",peso:"",custo:"",banho:""});
export const r4c=x=>Math.round(x*10000)/10000,txtN=x=>String(r4c(x)).replace(".",",");
export const CJ_NOMES=["Brincos","Colar","Pulseira","Anel","Pingente","Tornozeleira","Gargantilha"],CJ_COL=["R","S","T","U"];
export function conjLimpar(f){f.v=f.v||{};["N","P",...CJ_COL].forEach(L=>delete f.v[L]);if(f.fConj&&f.v.F===f.fConj)delete f.v.F;delete f.fConj;
  Object.keys(f.ov||{}).forEach(k=>{const o=f.ov[k];if(o&&typeof o==="object"){if(k!=="p"&&k.indexOf("~")<0)CJ_COL.forEach(L=>delete o[L]);if(!Object.keys(o).length)delete f.ov[k]}})}
export const conjSnap=f=>JSON.stringify([CJ_COL.map(L=>(f.v||{})[L]),Object.keys(f.ov||{}).sort().map(k=>[k,f.ov[k]&&typeof f.ov[k]==="object"?CJ_COL.map(L=>f.ov[k][L]):null])]);
export const conjLinTxt=(R,i,c)=>{if(c&&!num(c.peso)&&!num(c.custo))return "";return R.temBanho?R.vars.map(x=>`<span>${esc(x.b.nome)} R$ ${brl((x.lin[i]||{}).total||0)}</span>`).join(" "):`R$ ${brl((R.lin[i]||{}).total||0)}`};
export function detalheBanhoLinha(row,valor){
  if(!row||!row.banho)return "";
  const b=row.banho,cat=row.v&&row.v.I||"",peso=pesoLinha(row),q=Math.max(0,num(row.v&&row.v.W)||0),manual=!vazio(row.v&&row.v[b.coluna]);
  if(valor==null)return peso==null&&b.modo!=="fixo"?"Informe o peso para calcular o banho.":"Informe o valor do banho para esta categoria.";
  const base=manual?`valor de banho informado: R$ ${brl(valor)} por peça`:b.modo==="fixo"?`valor fixo R$ ${fmt(b.mult)} por peça = R$ ${brl(valor)}`:`${fmt(peso)} g × R$ ${fmt(b.mult)}/g = R$ ${brl(valor)} por peça`;
  return `${cat?`Categoria ${cat} · `:""}${base}${q>1?` · ${q} peças × R$ ${brl(valor)} = R$ ${brl(valor*q)}`:""}`;
}
export const EXPL={
banho:`<div class="expl"><b>Para que serve esta aba</b><p>Aqui você diz <b>qual galvânica</b> banha as peças e <b>quanto cada banho custa</b>. Cada banho que você marca ao lançar uma peça vira uma linha na planilha (ex.: a mesma argola em Ouro e em Prata gera 2 linhas).</p><ul><li><b>Letra do banho:</b> uma letra que entra no código da peça. Ex.: AN001<b>A</b> = anel 001, banho A. Vai na coluna E.</li><li><b>Custo do banho (colunas R, S ou T):</b> o valor que a galvânica cobra. Pode ser por peso (peso da peça × valor por grama) ou um valor fixo por peça. O verniz tem coluna própria (U).</li><li><b>Milésimos:</b> a espessura do banho. Quanto maior, mais caro. Você pode ter um valor diferente por categoria; a linha “Padrão” vale para as categorias que você não ajustou.</li><li><b>Insumos:</b> o que se gasta além do metal (embalagem, fecho, etc.). Soma no custo (coluna Q).</li><li><b>Preço de Varejo (coluna V):</b> é a soma dos custos multiplicada pelo <b>fator</b> do banho (a sua margem). Ex.: custo total R$ 10 × fator 3 = R$ 30.</li></ul></div>`,
cor:`<div class="expl"><b>Para que serve esta aba</b><p>É a sua lista de <b>cores</b> e de <b>tamanhos/variações</b> (aro de anel, P M G, medidas…). O que você cria aqui aparece nos botões <b>＋ Cor da pedra</b> e <b>＋ Tamanho</b> na hora de lançar uma peça.</p><ul><li><b>Sigla:</b> letras curtas que entram no código da peça. Ex.: AN001A<b>17</b><b>AZ</b> = anel 001, banho A, tamanho 17, cor azul.</li><li><b>Palavra na descrição:</b> o que aparece no fim da descrição da peça. Ex.: a cor “Azul” pode escrever “azul turquesa”. Deixe vazio para usar o nome da cor; digite um traço (-) para não escrever nada.</li><li><b>Coluna do valor (nas variações):</b> a coluna da planilha que recebe o nome da opção. Cada opção marcada gera uma linha.</li><li><b>Pedra/detalhe:</b> marque nas cores que são cor de pedra. As cores de banho (Ouro, Prata…) ficam de fora porque o banho já tem sua própria escolha.</li></ul></div>`,
cat:`<div class="expl"><b>Para que serve esta aba</b><p>Aqui você organiza os <b>tipos de peça</b> (Brincos, Colares, Anéis…) e define como o <b>código</b> de cada peça é numerado.</p><ul><li><b>Categoria e subcategoria:</b> o tipo da peça. Ex.: categoria <i>Brincos</i>, subcategoria <i>Argola</i>. Vão para as colunas I e J.</li><li><b>Prefixo:</b> as letras do código. Ex.: BR para Brincos.</li><li><b>Última peça:</b> o último número que você já usou. O sistema continua dali: prefixo BR + última peça 1669 → a próxima peça é <b>BR1670</b>. Se duas categorias usam o mesmo prefixo, elas dividem a mesma contagem e os números nunca se repetem.</li><li><b>Texto da categoria na Descrição:</b> uma frase que o sistema escreve <b>sozinho no fim da descrição</b> de toda peça dessa categoria. Ex.: na categoria Prata 925, texto “Prata 925”: você digita “Argola lisa” e a planilha sai com “Argola lisa Prata 925”. Se a descrição já tiver esse texto, ele não repete. Vazio = não acrescenta nada.</li><li><b>NCM, CFOP e FCP:</b> códigos fiscais que o ERP pede (colunas Y, AA e AB). <b>Insumos:</b> custo do material extra, como embalagem (coluna Q). Se ficar vazio, vale o padrão da coluna.</li><li><b>Variação (tamanhos, letras…):</b> fica dentro da categoria. Ao escolher a categoria ao lançar, as opções aparecem sozinhas, só para ela.</li></ul></div>`,
forn:`<div class="expl"><b>Para que serve esta aba</b><p>Lista dos seus <b>fornecedores</b>. Ao escolher o fornecedor ao lançar uma peça, o sistema já preenche o resto.</p><ul><li><b>Nome</b> vai para a coluna H e o <b>código do fornecedor</b> para a G.</li><li><b>Desconto %:</b> abatimento que esse fornecedor dá. É aplicado ao custo de compra (coluna P). Ex.: custo R$ 100 com 10% = R$ 90.</li><li><b>Bruta ou pronta:</b> “bruta” é a peça que chega sem banho e vai para a galvânica (você escolhe os banhos). “Pronta” já chega banhada e não passa pela galvânica.</li><li><b>Aprendeu:</b> guarda os banhos e fatores que você usou da última vez com esse fornecedor, para reaproveitar.</li></ul></div>`,
col:`<div class="expl"><b>Para que serve esta aba</b><p>A planilha que você exporta tem várias colunas. Aqui você escolhe <b>como cada coluna se comporta enquanto você lança a peça</b>. Isto muda só o preenchimento, não a planilha final (isso é na aba Modelo da planilha).</p><ul><li><b>No lançamento:</b> mostra o campo no formulário. Desmarcado, o campo some do formulário.</li><li><b>Lembrar:</b> repete o valor digitado na próxima peça (útil para o que não muda, como o fornecedor).</li><li><b>Obrigatória:</b> o sistema não deixa lançar se estiver vazio.</li><li><b>Valor padrão:</b> entra sozinho quando você não preenche.</li><li><b>Opções:</b> lista de sugestões para escolher em vez de digitar.</li><li><b>Observações prontas:</b> frases que você usa sempre e aparecem para escolher na coluna M (Observação).</li></ul></div>`,
mod:`<div class="expl"><b>Para que serve esta aba</b><p>Define o <b>formato do arquivo</b> que vai para o sistema onde você vai importar as peças (Jueri, Bling…). Cada sistema pede os nomes e a ordem das colunas de um jeito.</p><ul><li><b>Cabeçalhos, ordem e colunas:</b> valem para o arquivo baixado (.xlsx ou .csv) e para o “Copiar para o Excel”.</li><li><b>Mapeamento:</b> liga cada coluna do sistema à coluna correspondente do ERP. Coluna desligada não sai no arquivo.</li><li><b>Trocar de modelo</b> em “Exportar para”, no topo, muda a saída sem mexer nas suas peças.</li></ul></div>`,
rom:`<div class="expl"><b>Para que serve esta aba</b><p>Ensina o sistema a <b>ler a lista de compra (romaneio) de cada fornecedor</b>. Cada fornecedor monta a lista de um jeito; aqui você diz onde cada informação está.</p><ul><li><b>Modelo de leitura:</b> diz onde estão código, descrição, quantidade e preço no texto ou PDF que você cola.</li><li><b>Palavras → categoria:</b> se a descrição tem a palavra “brinco”, a peça entra na categoria Brincos (e na subcategoria que você definir). Vão para as colunas I e J.</li><li>O que o modelo lê vira <b>cartões</b> no romaneio, e cada cartão vira uma ou mais linhas da planilha.</li></ul></div>`,
roml:`<div class="expl"><b>Para que serve esta aba</b><p>O <b>histórico</b> dos romaneios que você já importou.</p><ul><li><b>Observação (documento):</b> mostra o nome do arquivo importado.</li><li><b>Abrir:</b> reabre o romaneio para lançar o que faltou ou corrigir peças já lançadas. O código da peça fica o mesmo; só muda se você trocar a categoria.</li><li><b>Excluir:</b> apaga só o romaneio guardado. As peças que você já lançou na tabela continuam lá.</li></ul></div>`,
foto:`<div class="expl"><b>Para que serve esta aba</b><p>Envia as fotos das peças para um serviço de imagens na internet e guarda o <b>link</b>.</p><ul><li>O <b>link</b> vai para a coluna B (Foto) da planilha, porque os ERPs pedem o endereço da imagem, e não o arquivo.</li><li>A foto original do romaneio fica guardada à parte (coluna “Foto do romaneio”).</li><li>A <b>chave</b> do serviço fica só neste navegador e não entra no backup.</li></ul></div>`,
opc:`<div class="expl"><b>Para que serve esta aba</b><p>Traz <b>dados antigos</b> para o sistema e cuida da <b>segurança</b> do que você já fez.</p><ul><li><b>Importar planilha:</b> lê uma planilha que você já tinha, acerta a última peça de cada prefixo (a numeração continua dali) e traz fornecedores, categorias e cores.</li><li><b>Ordem das linhas:</b> define como a planilha é montada (A depois B, ou na ordem em que você lançou).</li><li><b>Backup e pontos de restauração:</b> guardam tudo (peças, cadastros, romaneios e fotos) para você voltar no tempo se algo der errado. Faça backup com frequência: os dados ficam só neste navegador.</li></ul></div>`};
export const partir=txt=>{const vistos=new Set(),r=[];String(txt==null?"":txt).split(/[;,\n\r]+/).forEach(x=>{x=x.replace(/\s+/g," ").trim().slice(0,60);const k=semAc(x);if(x&&!vistos.has(k)){vistos.add(k);r.push(x)}});return r};
export const kSub=x=>semAc(x).replace(/(e?s)$/,"");
export const addUnicos=(lista,itens)=>{let n=0;itens.forEach(x=>{if(!lista.some(y=>kSub(y)===kSub(x))){lista.push(x);n++}});return n};
export function acharCat(C,nome){const k=semAc(nome);const c=C.categorias.find(x=>semAc(x.nome)===k);if(c)return c;const j=JUERI_CATS.find(x=>(x.alias||[]).some(a=>semAc(a)===k));return j?(C.categorias.find(x=>x.nome===j.nome)||null):null}
export function prefixoNovo(C,nome){const L=semAc(nome).toUpperCase().replace(/[^A-Z]/g,"");if(L.length<2)return null;const cand=[L.slice(0,2),L.slice(0,3),L.slice(0,4)];for(let j=2;j<L.length;j++)cand.push(L[0]+L[j]);const livre=cand.find(c=>!prefixoEmUso(C,c,null));return livre?{p:livre,rep:false}:{p:L.slice(0,2),rep:true}}
export function nomeCatErro(C,v,exceto){if(!v)return "Digite o nome da categoria.";if(v.length>40)return "O nome da categoria é longo demais (máximo 40 letras).";if(semAc(v).replace(/[^a-z]/g,"").length<2)return "O nome da categoria precisa ter pelo menos 2 letras (o prefixo da referência sai delas). Ex.: Anéis.";if(C.categorias.some(x=>x!==exceto&&semAc(x.nome)===semAc(v)))return `Já existe a categoria “${v}” (acento e maiúscula não diferenciam).`;return ""}
export function nomeCatLivre(C,base){let n=base,k=2;while(C.categorias.some(x=>semAc(x.nome)===semAc(n)))n=base+" "+(k++);return n}
export const MODELOS_CAT=[
 {id:"aneis",nome:"Anéis (com tamanhos)",linha:"Anéis",grade:true},
 {id:"colares",nome:"Colares",linha:"Colares: Corrente; Gargantilha; Choker; Longo; Pingente"},
 {id:"brincos",nome:"Brincos",linha:"Brincos: Argola; Ear cuff; Pequeno; Médio; Grande"},
 {id:"pulseiras",nome:"Pulseiras",linha:"Pulseiras: Bracelete; Corrente; Riviera; Elos"},
 {id:"conjuntos",nome:"Conjuntos",linha:"Conjuntos: Colar e brinco; Brinco e anel; Completo"}];
export function planoLista(C,txt){const tmp={categorias:[...C.categorias]},novas=[],extra=[],erros=[];
  const todas=String(txt||"").split(/\r?\n/);if(todas.length>300)erros.push(`A lista tem ${todas.length} linhas: só as 300 primeiras serão lidas.`);
  todas.slice(0,300).forEach(ln=>{ln=ln.trim();if(!ln)return;const i=ln.indexOf(":"),nome=(i<0?ln:ln.slice(0,i)).replace(/\s+/g," ").trim(),subs=i<0?[]:partir(ln.slice(i+1));
    const nv=novas.find(n=>semAc(n.nome)===semAc(nome));if(nv){addUnicos(nv.subs,subs);return}
    const ex=acharCat(C,nome);
    if(ex){let e=extra.find(x=>x.c===ex);if(!e)extra.push(e={c:ex,add:[]});subs.forEach(sb=>{if(!ex.subs.some(y=>kSub(y)===kSub(sb))&&!e.add.some(y=>kSub(y)===kSub(sb)))e.add.push(sb)});return}
    const er=nomeCatErro(tmp,nome,null);if(er){erros.push(`“${nome.slice(0,40)}”: ${er}`);return}
    const pf=prefixoNovo(tmp,nome);novas.push({nome,prefixo:pf.p,rep:pf.rep,subs:subs.slice()});tmp.categorias.push({nome,prefixo:pf.p,subs:[]})});
  return{novas,extra:extra.filter(e=>e.add.length),erros}}
export const contaPlano=pl=>[pl.novas.length,pl.novas.reduce((a,n)=>a+n.subs.length,0)+pl.extra.reduce((a,e)=>a+e.add.length,0)];
export function aplicaPlano(C,pl){pl.novas.forEach(n=>{C.categorias.push({nome:n.nome,prefixo:n.prefixo,subs:n.subs.slice()});if(!(n.prefixo in C.seqs))C.seqs[n.prefixo]="0"});pl.extra.forEach(e=>addUnicos(e.c.subs,e.add))}
export const BANHOS_PRONTOS={ouro:{nome:"Ouro",cor:"Ouro",coluna:"R",sufixo:" banho ouro"},rodio:{nome:"Ródio",cor:"Ródio",coluna:"S",sufixo:" banho ródio"},prata:{nome:"Prata",cor:"Prata",coluna:"T",sufixo:" banho prata"},negro:{nome:"Ródio negro",cor:"Ródio negro",coluna:"S",sufixo:" banho ródio negro"},outro:{nome:"Novo banho",cor:"",coluna:"S",sufixo:""}};
export function letraBanhoLivre(b){const us=b.banhos.map(x=>String(x.letra||"").trim().toUpperCase());for(let k=0;k<26;k++){const L=String.fromCharCode(65+k);if(!us.includes(L))return L}return ""}
export function nomeBanhoLivre(b,base){const raiz=String(base||"Banho").replace(/\s+\d+$/,"").trim()||"Banho";let n=raiz,k=2;while(b.banhos.some(x=>semAc(x.nome)===semAc(n)))n=raiz+" "+(k++);return n}
export function corOpts(C,x){const falta=x.cor&&!C.cores.includes(x.cor);
  return (falta?`<option value="${esc(x.cor)}" selected>⚠ ${esc(x.cor)} (não está em Cores)</option>`:"")+`<option value="" ${!x.cor?"selected":""}>— sem cor —</option>`+opts(C.cores,x.cor)+`<option value="__nova">+ Nova cor…</option>`}
export const PAL=["#27466f","#3f8f8b","#c28b2c","#8a5fb0","#c5584f","#6a9e4f","#5b86c9","#a0a7b4","#b5651d","#2f7d5b"];
export const NOVIDADES=[
  {d:"2026-11-12",t:"Lote em qualquer cadastro, apelidos e fiscal em massa",i:["Criar em lote (N peças numeradas 1/N) no formulário e “⊞ em lote” em qualquer item do romaneio; dá para desativar","Apelidos de categoria e subcategoria: digitar “argolinhas” já escolhe Brincos › Argolas e o prefixo","Fiscal (NCM, CFOP, FCP) e insumos de todas as categorias numa tabela só","Anel no lugar de “Anél”; instalação nova começa sem galvânica, fornecedores nem observações","Palavras da categoria/subcategoria acima da descrição, com preenchimento automático e banco de palavras"]},
  {d:"2026-11-11",t:"Lotes por grama, banho sem cálculo e abertura resiliente",i:["Valor do lote por grama rateado pelo peso informado, recalculado a cada item","Banho com letra, cor, cálculo e coluna opcionais; categoria “Sem banho” e “Compra por grama”","Tela de recuperação mostra a etapa que falhou e permite abrir mesmo assim; Diagnóstico dos dados"]},
  {d:"2026-11-10",t:"Romaneio sem bloqueios",i:["Alertas no lugar de bloqueios ao criar peças do romaneio","Peça nova fora da lista, foto por item e insumos próprios do romaneio rateados","Baixar .xlsx só das peças selecionadas"]}];
export function custoLinhaDe(g,r){const gi=g.linhas.indexOf(r),cs=celulas(r,gi+2),nv=k=>{const c=cs[LET.indexOf(k)];return c&&typeof c.v==="number"?c.v:c&&typeof c.calc==="number"?c.calc:0};return r2c(["P","Q","R","S","T","U"].reduce((t,k)=>t+nv(k),0))}
export function histDescrever(antesL,depoisL,e){
  try{const A=JSON.parse(antesL),B=JSON.parse(depoisL),ma=new Map(A.map(l=>[l.id,JSON.stringify(l)])),mb=new Map(B.map(l=>[l.id,JSON.stringify(l)]));
    let add=0,del=0,mud=0;mb.forEach((v,id)=>{if(!ma.has(id))add++;else if(ma.get(id)!==v)mud++});ma.forEach((v,id)=>{if(!mb.has(id))del++});
    const p=[];if(add)p.push(`criou ${add} peça(s)`);if(mud)p.push(`alterou ${mud} peça(s)`);if(del)p.push(`excluiu ${del} peça(s)`);
    if(!p.length)return e.soCfg?"mudou cadastros (categorias, banhos, fornecedores…)":"alteração";
    return (e.R?"romaneio: ":"")+p.join(", ")}catch(x){return "alteração"}}
export const refBase=r=>{const m=/^([A-Za-z]+\d+)/.exec(String(r||""));return m?m[1].toUpperCase():String(r||"").toUpperCase()};
export function migrarJueri$(S){
  const C=cfg$(S);if(C.v9)return false;const lo=x=>String(x||"").trim().toLowerCase();
  const usa=(cat,sub)=>S.lanc.some(l=>l.v.I===cat&&l.v.J===sub)||(S.form.v.I===cat&&S.form.v.J===sub);
  JUERI_CATS.forEach(j=>{
    let c=C.categorias.find(x=>lo(x.nome)===lo(j.nome))||C.categorias.find(x=>(j.alias||[]).some(a=>lo(a)===lo(x.nome)));
    if(!c){c={nome:j.nome,prefixo:j.prefixo,subs:[]};if(j.sufixo)c.sufixo=j.sufixo;C.categorias.push(c)}
    if(c.nome!==j.nome){const old=c.nome;c.nome=j.nome;S.lanc.forEach(l=>{if(l.v.I===old)l.v.I=j.nome});if(S.form.v.I===old)S.form.v.I=j.nome}
    if(!c.prefixo)c.prefixo=j.prefixo;const pu=String(c.prefixo).toUpperCase();if(!(pu in C.seqs))C.seqs[pu]="0";
    Object.entries(j.trocas||{}).forEach(([a,b])=>{const i=c.subs.indexOf(a);if(i>=0){c.subs[i]=b;S.lanc.forEach(l=>{if(l.v.I===c.nome&&l.v.J===a)l.v.J=b});if(S.form.v.I===c.nome&&S.form.v.J===a)S.form.v.J=b}});
    (j.remover||[]).forEach(r=>{const i=c.subs.indexOf(r);if(i>=0&&!usa(c.nome,r))c.subs.splice(i,1)});
    j.subs.forEach(x=>{if(!c.subs.some(y=>lo(y)===lo(x)))c.subs.push(x)});c.subs=[...new Set(c.subs)];
    if(j.subPref){c.subPref=c.subPref||{};Object.entries(j.subPref).forEach(([k,v])=>{if(!c.subPref[k])c.subPref[k]=v;if(!(v in C.seqs))C.seqs[v]="0"})}
    if(j.subSoRef){c.subSoRef=c.subSoRef||{};c.subs.forEach(x=>{if(!(x in c.subSoRef))c.subSoRef[x]=true})}
  });
  (C.grades||[]).forEach(g=>{
    if(/an[eé]is/i.test(g.auto||"")&&!/an[eé]l/i.test(g.auto))g.auto=String(g.auto).replace(/an[eé]is/i,"Anel; Anéis");
    /* Textos copiados no cadastro antigo: se todos têm o mesmo começo (ex.: " aro 12", " aro 14"), era uma cópia do rótulo — passam a seguir o rótulo atual, e o termo antigo ainda é reconhecido na Descrição. */
    const pre=g.itens.map(x=>x.texto!=null&&x.nome&&String(x.texto).endsWith(x.nome)?String(x.texto).slice(0,String(x.texto).length-x.nome.length):null);
    if(g.itens.length>1&&pre.every(v=>v!==null&&v===pre[0])){const o=String(pre[0]).trim();if(o&&o.toLowerCase()!==String(g.rotulo||"").trim().toLowerCase()){g.sin=g.sin||[];if(!g.sin.some(z=>z.toLowerCase()===o.toLowerCase()))g.sin.push(o)}g.itens.forEach(x=>{delete x.texto})}
    g.itens.forEach(x=>{if(x.texto===rotG(g)+(x.nome||x.letra))delete x.texto;if(x.col&&x.col===(g.col||""))delete x.col;if(x.valor!=null&&x.valor===x.nome)delete x.valor})});
  C.v9=true;return true;
}
export function migrarGrades0$(S){
  const C=cfg$(S);if(C.v10)return false;
  const resto=[];
  (C.grades||[]).forEach(g=>{
    const tk=String(g.auto||"").split(/[;,]/).map(semAc).filter(Boolean),alvo=[];
    if(tk.length)C.categorias.forEach(c=>{
      const nomes=[semAc(c.nome)],j=JUERI_CATS.find(x=>x.nome===c.nome);if(j&&j.alias)j.alias.forEach(a=>nomes.push(semAc(a)));
      const subs=(c.subs||[]).filter(s=>tk.includes(semAc(s)));
      if(nomes.some(n=>tk.includes(n)))alvo.push({c,subs:[]});else if(subs.length)alvo.push({c,subs})});
    const livres=alvo.filter(a=>!a.c.grade);
    if(!livres.length){resto.push(g);return}
    livres.forEach((a,i)=>{const x=JSON.parse(JSON.stringify(g));delete x.auto;if(i>0)x.id=uid();x.subs=a.subs;a.c.grade=x})});
  C.grades=resto;
  C.banhistas.forEach(b=>b.banhos.forEach(x=>{if(x.vz==null)x.vz=b.vernizOn!==false}));
  const obs=new Set(C.observacoes);C.cores=C.cores.filter(c=>!obs.has(c));
  const arruma=v=>{if(v&&v.L&&obs.has(v.L)){if(vazio(v.M))v.M=v.L;delete v.L}};
  S.lanc.forEach(l=>arruma(l.v));arruma(S.form.v);
  C.v10=true;return true;
}
export function pendente$(S,r){const cc=cfg$(S).colcfg;if(r.dup)return "ref. repetida";if(r.banho&&pesoLinha(r)==null&&r.banho.modo!=="fixo")return "sem peso";
  if(r.banho&&r.banho.mult==null&&vazio(r.v[r.banho.coluna]))return "banho sem multiplicador";
  for(const L of LET){if(cc[L]&&cc[L].obrig&&(L==="W"?!qtdPos(r.v.W,r.v,r.desconto):vazio(r.v[L])))return "sem "+NOME[L].toLowerCase()}return ""}
export function novaLivre$(S,v){const l={id:uid(),tipo:"pronta",desconto:"0",banhista:"",vinc:false,v:{...v},on:{},ov:{}};if(vazio(l.v.I))l.v.I=S.form.v.I||"";return l}
export function detalheCelulaSelecionada$(S,row,L,ri){
  if(!row||!["P","Q","R","S","T","U","V"].includes(L))return "";
  const x=celulas(row,ri+2)[LET.indexOf(L)],valor=x&&typeof x.v==="number"?x.v:x&&typeof x.calc==="number"?x.calc:null;
  const l=S.lanc.find(p=>p.id===row.lancId),q=numRaw(row.v.W,row.v,0,row.desconto);
  if(L==="P"){
    if(valor==null)return "";return `Compra: R$ ${brl(valor)} por unidade${q>0?` × ${fmt(q)} un. = R$ ${brl(r2c(valor*q))} na linha`:""}${l&&l.lote?` · item ${l.lote.i}/${l.lote.n} de um lote`:""}.`}
  if(L==="V"){
    const cs=celulas(row,ri+2),nv=k=>{const c=cs[LET.indexOf(k)];return c&&typeof c.v==="number"?c.v:c&&typeof c.calc==="number"?c.calc:0},custo=r2c(["P","Q","R","S","T","U"].reduce((t,k)=>t+nv(k),0));
    if(valor!=null)return `Preço de varejo digitado: R$ ${brl(valor)}${custo>0?` · custo R$ ${brl(custo)} (compra + insumos + banho + verniz) → fator ${fmt(Math.round(valor/custo*100)/100)} · lucro R$ ${brl(r2c(valor-custo))} (${fmt(Math.round((valor-custo)/valor*1000)/10)}%)`:""}.`;
    return `Preço de varejo vazio (só entra se digitado). Custo R$ ${brl(custo)} (compra + insumos + banho + verniz)${row.mk?` × fator ${fmt(row.mk)} = sugestão R$ ${brl(r2c(custo*row.mk))}`:""}.`}
  if(L==="Q"){
    if(!l)return "";
    if(l.insRom&&!(row.ovs||[]).includes("Q")&&!vazio(l.v.Q))return `Insumos: padrão R$ ${brl(l.insRom.base)} + parte dos insumos do romaneio${l.insRom.rom?" ("+l.insRom.rom+")":""} R$ ${brl(l.insRom.ins)} = R$ ${brl(valor==null?0:valor)} por unidade${q>0&&valor!=null?` × ${fmt(q)} un. = R$ ${brl(valor*q)} na linha`:""}.`;
    if((row.ovs||[]).includes("Q")||!vazio(l.v.Q))return `Insumos: valor informado na peça ${valor==null?"—":"R$ "+brl(valor)} por unidade${q>0&&valor!=null?` × ${fmt(q)} un. = R$ ${brl(valor*q)} na linha`:""}.`;
    const C=cfg$(S),cat=l.v.I||"",it=insumosItensResumo$(S,cat),modo=C.insumosModo||"off",parts=it.itens.map(i=>`${i.nome} (${i.cat?"categoria":"geral"}): ${fmt(num(i.qtd)||0)} × R$ ${brl(num(i.valor)||0)}`);
    const base=catBy$(S,cat),anterior=num(base&&!vazio(base.insumos)?base.insumos:C.colcfg.Q.padrao)||0;
    const detalhe=modo==="off"?`valor atual R$ ${brl(anterior)} (itens não aplicados)`:modo==="somar"?`valor atual R$ ${brl(anterior)} + itens ${parts.length?parts.join(" + "):"nenhum"}`:`itens ${parts.length?parts.join(" + "):"nenhum"}`;
    return `Insumos: ${detalhe} = R$ ${brl(valor||0)} por unidade${q>0?` × ${fmt(q)} un. = R$ ${brl((valor||0)*q)} na linha`:""}.`;
  }
  if(l&&l.conj)return `Conjunto · ${NOME[L]}: ${valor==null?"sem valor":"R$ "+brl(valor)+" por conjunto"}. Abra Editar para conferir os componentes.`;
  if(row.ovs&&row.ovs.includes(L))return `${NOME[L]} informado na peça: ${valor==null?"sem valor":"R$ "+brl(valor)+" por unidade"}.`;
  if(!row.banho)return "";
  const peso=pesoLinha(row),taxa=L==="U"?row.verniz:(L===row.banho.coluna?row.banho.mult:null);
  if(taxa==null)return `${NOME[L]}: sem valor configurado para esta linha.`;
  if(L!=="U"&&row.banho.modo==="fixo")return `${NOME[L]}: R$ ${brl(taxa)} por unidade (valor fixo)${q>0?` × ${fmt(q)} un. = R$ ${brl(r2c(taxa)*q)} na linha`:""}.`;
  if(peso==null)return `${NOME[L]}: informe o peso para calcular.`;
  const unidade=r2c(peso*taxa);return `${NOME[L]}: ${fmt(peso)} g × R$ ${fmt(taxa)}/g = R$ ${brl(unidade)} por unidade${q>0?` × ${fmt(q)} un. = R$ ${brl(unidade*q)} na linha`:""}.`;
}
export function letrasDeTamanho$(S){return todasGrades$(S).flatMap(g=>g.itens.filter(x=>String(x.letra||"").toUpperCase()===String(x.nome||"").toUpperCase()).map(x=>String(x.letra).toUpperCase()))}
export function conjErro$(S,f,i){const c=(f.comp||[])[i];if(!c)return "";if(vazio(c.desc)&&vazio(c.peso)&&vazio(c.custo))return "";const m=[];
  if(conjQtd(c)==null)m.push("quantidade deve ser um inteiro de 1 a 9999");
  if(c.cat&&!conjCat$(S,c))m.push("categoria não existe mais; escolha outra");
  if(vazio(c.desc))m.push("falta o nome da peça");
  if(vazio(c.peso))m.push("falta o peso");else if(num(c.peso)==null||num(c.peso)<=0)m.push("peso inválido");
  if(vazio(c.custo))m.push("falta o custo de compra");else if(num(c.custo)==null||num(c.custo)<0)m.push("custo inválido");
  if(!vazio(c.desc)&&f.comp.some((o,q)=>q<i&&semAc(o.desc)===semAc(c.desc)))m.push("nome repetido");
  return m.join(" · ")}
export function conjResumoHTML$(S,f){const cs=f.comp||[],ok=cs.filter(c=>!vazio(c.desc)||!vazio(c.peso)||!vazio(c.custo)),n=ok.reduce((a,c)=>a+(conjQtd(c)||0),0),peso=ok.reduce((a,c)=>a+(num(c.peso)||0)*(conjQtd(c)||0),0),compra=ok.reduce((a,c)=>a+(num(c.custo)||0)*(conjQtd(c)||0),0),nErr=cs.filter((c,i)=>{const e=conjErro$(S,f,i);return e&&e!=="nome repetido"}).length,nomes=ok.map(c=>String(c.desc||"").trim()).filter(Boolean);
  return `<span class="cj-p">Conjunto</span> <b>${esc(nomes.length?nomes.join(" + "):"(sem peças ainda)")}</b> <span class="cj-m">${n} peça${n===1?"":"s"} · ${fmt(peso)} g · compra R$ ${brl(compra)}</span>${nErr?` <span class="cj-e2">⚠ ${nErr} peça${nErr>1?"s":""} com dado faltando</span>`:""}`}
export function conjCat$(S,c){let nome=c.cat||"",n=0;const alias=cfg$(S).catAlias||{};while(nome&&!catBy$(S,nome)&&alias[nome]&&n++<10)nome=alias[nome];return nome&&catBy$(S,nome)?nome:""}
export function conjCatOpts$(S,c){const cs=cfg$(S).categorias||[],v=conjCat$(S,c)||c.cat||"",invalida=v&&!catBy$(S,v);return `<option value="" ${!v?"selected":""}>Categoria do conjunto</option>${invalida?`<option value="${esc(v)}" selected>${esc(v)} (não existe mais)</option>`:""}${cs.map(x=>`<option value="${esc(x.nome)}" ${v===x.nome?"selected":""}>${esc(x.nome)}</option>`).join("")}`}
export function conjCalc$(S,f){
  const bh=bhDe$(S,f),bp=bonP$(S,f),temBanho=bp.length>0,vars=temBanho?bp:[null];
  const res=vars.map(vb=>{const tot={N:0,P:0,R:0,S:0,T:0,U:0},lin=[];let semMult=false;
    (f.comp||[]).forEach(c=>{const qtd=conjQtd(c)||0,peso=(num(c.peso)||0)*qtd,custo=(num(c.custo)||0)*qtd,
      b=c.banho==="-"?null:(c.banho?(bh.banhos||[]).find(x=>x.id===c.banho)||null:vb);let banho=0,vern=0;
      if(b&&!banhoSemCalc(b)){const cat=conjCat$(S,c),m=c.cat&&!cat?null:num(multItem(f,b,cat||(f.v&&f.v.I)));if(m==null)semMult=true;else banho=b.modo==="fixo"?m*qtd:peso*m;
        const vzv=c.vz==null?vzPad(bh,b):!!c.vz,vv=num(bh.verniz);if(vzv&&vv!=null)vern=peso*vv;tot[b.coluna]=(tot[b.coluna]||0)+banho}
      tot.N+=peso;tot.P+=custo;tot.U+=vern;lin.push({peso,custo,banho,vern,total:custo+banho+vern})});
    return {b:vb,tot,lin,semMult}});
  return {vars:res,temBanho,tot:res[0].tot,lin:res[0].lin};
}
export function conjContasHTML$(S,f,R){
  R=R||conjCalc$(S,f);const bh=bhDe$(S,f),comp=f.comp||[];
  if(!comp.some(c=>!vazio(c.peso)||!vazio(c.custo)))return "";
  const secoes=R.vars.map(v=>{const itens=comp.map((c,i)=>{const qtd=conjQtd(c),peso=num(c.peso),compra=num(c.custo),lin=v.lin[i]||{},nome=String(c.desc||"").trim()||`Componente ${i+1}`;
    if(qtd==null||peso==null||compra==null)return `<li>${esc(nome)}: preencha quantidade, peso e compra para conferir.</li>`;
    const cat=conjCat$(S,c)||(c.cat?"":f.v&&f.v.I)||"",b=c.banho==="-"?null:(c.banho?(bh.banhos||[]).find(x=>x.id===c.banho)||null:v.b),ov=b&&f.ov&&(f.ov[b.id]||{}),individual=ov&&!vazio(ov._m),m=b&&(!c.cat||conjCat$(S,c))?num(multItem(f,b,cat)):null;
    const origem=individual?"valor informado para o conjunto":b&&b.multCat&&!vazio(b.multCat[cat])?"valor da categoria":"valor padrão da galvânica";
    let banho="sem banho";if(b){banho=m==null?`${b.nome}: valor de banho indisponível`:b.modo==="fixo"?`${b.nome}: ${qtd} × R$ ${fmt(m)} (fixo, ${origem}) = R$ ${brl(lin.banho||0)}`:`${b.nome}: ${qtd} × ${fmt(peso)} g × R$ ${fmt(m)}/g (${origem}) = R$ ${brl(lin.banho||0)}`}
    const varn=b&&lin.vern?` · verniz ${qtd} × ${fmt(peso)} g × R$ ${fmt(num(bh.verniz))}/g = R$ ${brl(lin.vern)}`:"";
    return `<li><b>${esc(nome)}</b> · categoria ${esc(cat||"não encontrada")} · compra ${qtd} × R$ ${fmt(compra)} = R$ ${brl(lin.custo||0)} · ${esc(banho)}${esc(varn)}</li>`}).join("");return `<div><b>${esc(v.b?v.b.nome:"Conjunto")}</b><ul>${itens}</ul></div>`}).join("");
  return `<div class="contas-componentes"><b>Como o banho é calculado por conjunto</b>${secoes}<small>Os valores são arredondados em centavos na linha final. Na planilha, o banho do conjunto sai como valor calculado.</small></div>`;
}
export function conjTotHTML$(S,f){
  const R=conjCalc$(S,f),q=num(vazio(f.v.Q)?padraoDe$(S,f.v.I,"Q"):f.v.Q)||0,mk=f.mk||{},ov=f.ov||{};
  if(!(f.comp||[]).some(c=>!vazio(c.peso)||!vazio(c.custo)))return `<p class="hint">Preencha o peso e o custo das peças para ver a somatória por banho.</p>`;
  const linhas=R.vars.map(x=>{const id=x.b?x.b.id:"p",t=x.tot,dsc=num(f.desconto)||0,P=dsc>0?r2c(r4c(t.P)-r4c(t.P)*kDesc(dsc)):r4c(t.P),qq=r4c(q),custo=0+P+qq+r4c(t.R)+r4c(t.S)+r4c(t.T)+r4c(t.U),m=num(mk[id]),man=x.b?(ov[id]||{}).V:f.v.V,
    vr=!vazio(man)&&num(man)!=null?num(man):(m?r2c(custo*m):null);
    return `<tr><th>${x.b?`<span class="dot d-${x.b.coluna}"></span>${esc(x.b.letra)} · ${esc(x.b.nome)}`:"Conjunto"}</th><td>${fmt(t.N)} g</td><td>${brl(P)}</td><td>${brl(r4c(t.R)+r4c(t.S)+r4c(t.T))}</td><td>${brl(r4c(t.U))}</td><td>${q?brl(qq):"–"}</td><td><b>${brl(custo)}</b></td><td>${m?fmt(m):"–"}</td><td><b>${vr!=null?"R$ "+brl(vr):"digite o Fator × abaixo"}</b></td></tr>`}).join("");
  const aviso=R.vars.some(x=>x.semMult)?`<p class="hint cj-w">⚠ Um banho usado aqui está sem o R$ por grama (Cadastros › Galvânicas): o custo dela entra como zero.</p>`:"";
  return `<table class="cj-s"><thead><tr><th>Somatória</th><th>Peso</th><th>Compra</th><th>Banho</th><th>Verniz</th><th>Insumos</th><th>Custo</th><th>Fator ×</th><th>Varejo</th></tr></thead><tbody>${linhas}</tbody></table><p class="hint">Insumos por conjunto: ${insumosContaHTML$(S,f.v.I,f.v.Q,false)}. Aplicados uma vez por conjunto, não por componente.</p>${aviso}${conjContasHTML$(S,f,R)}`}
export function dupAviso$(S,C,d){const p=String(d.pre||"").toUpperCase();if(!p)return "Escolha um prefixo de 1 a 4 letras.";
  const com=C.categorias.filter(x=>String(x.prefixo||"").toUpperCase()===p||Object.values(x.subPref||{}).some(v=>String(v).toUpperCase()===p)).map(x=>x.nome);
  return com.length?`O prefixo ${p} já é de ${com.join(", ")}: a cópia vai dividir a mesma numeração (continua de ${p}${ultimo$(S,p)}). Troque o prefixo se não quiser.`:""}
export function aplicarMemForn$(S,f,fo){const m=fo&&fo.mem;if(!m)return "";const C=cfg$(S),dito=[];
  if(f.tipo==="bruta"&&m.banhista&&C.banhistas.some(b=>b.id===m.banhista)&&(!fo.banhista||fo.banhista===m.banhista)){const bh=banhistaBy$(S,m.banhista);
    if(f.banhista!==m.banhista)trocarBanhista$(S,f,m.banhista);dito.push(bh.nome);
    if(m.on){f.on={};bh.banhos.forEach(b=>f.on[b.id]=!!m.on[b.id])}
    f.mk=f.mk||{};bh.banhos.forEach(b=>{if(m.mk&&!vazio(m.mk[b.id])){f.mk[b.id]=m.mk[b.id];if(f.on[b.id])dito.push(b.letra+" ×"+m.mk[b.id])}})}
  if(f.tipo==="pronta"&&!vazio(m.mkp)){f.mk=f.mk||{};f.mk.p=m.mkp;dito.push("×"+m.mkp)}
  return dito.join(" · ")}
export function resumoMem$(S,fo){const m=fo.mem;if(!m)return "";const bh=m.banhista&&cfg$(S).banhistas.find(b=>b.id===m.banhista),out=[];
  if(bh){out.push(bh.nome);bh.banhos.forEach(b=>{if(m.on&&m.on[b.id])out.push(b.letra+(m.mk&&!vazio(m.mk[b.id])?" ×"+m.mk[b.id]:""))})}
  if(!vazio(m.mkp))out.push("pronta ×"+m.mkp);return out.join(" · ")}
export function marcadosPadrao$(S,f){f.on={};banhistaBy$(S,f.banhista).banhos.forEach(b=>f.on[b.id]=!!b.marcado)}
export function trocarBanhista$(S,f,id){f.banhista=id;marcadosPadrao$(S,f);f.onP={};f.vz={};
  Object.keys(f.ov||{}).forEach(k=>{const o=f.ov[k];if(!o||typeof o!=="object"){delete f.ov[k];return}Object.keys(o).forEach(L=>{if(L!=="W")delete o[L]});if(!Object.keys(o).length)delete f.ov[k]})}
export function banhistaDoFornecedor$(S,f){const fo=fornBy$(S,f.v.H);if(f.tipo==="bruta"&&fo&&fo.banhista&&fo.banhista!==f.banhista&&cfg$(S).banhistas.some(b=>b.id===fo.banhista))trocarBanhista$(S,f,fo.banhista)}
export function continuoCfg$(S){const c=cfg$(S).continuo;return c&&typeof c==="object"?c:{ativo:false,categoria:true,fornecedor:true,banho:true}}
export function continuoProxima$(S,f){const c=continuoCfg$(S);delete f.v.F;delete f.v.N;delete f.v.P;delete f.v.W;delete f.v.V;delete f.v.E;delete f._descAuto;f.ov={};f.ft=null;f.ftR=null;f.loteN="";f.vinc=false;
  if(!c.categoria){delete f.v.I;delete f.v.J;f.grade="";f.gsel=[];f.csel=[]}if(!c.fornecedor){delete f.v.H;delete f.v.G;f.desconto="0"}if(!c.banho){f.banhista="";f.on={};f.onP={};f.vz={}}if(f.conj){f.comp=[novaComp(),novaComp()];delete f.fConj}if(c.categoria&&!f.conj)descAuto(f)}
export function presetAtual$(S,nome){const f=S.form;return {nome,tipo:f.tipo,cat:f.v.I||"",sub:f.v.J||"",forn:f.v.H||"",codigo:f.v.G||"",desconto:f.desconto||"0",banhista:f.banhista||"",on:clone(f.on||{}),onP:clone(f.onP||{})}}
export function registrarLivres$(S,l){const C=cfg$(S),h=String(val$(S,l,"H")||"").replace(/\s+/g," ").trim(),j=String(val$(S,l,"J")||"").replace(/\s+/g," ").trim(),c=catBy$(S,val$(S,l,"I"));
  if(h&&!C.fornecedores.some(x=>x.nome.toLowerCase()===h.toLowerCase()))C.fornecedores.push({nome:h,codigo:String(val$(S,l,"G")||""),desconto:String(l.desconto||"0"),tipo:l.tipo==="pronta"?"pronta":"bruta"});
  if(j&&c&&Array.isArray(c.subs)&&!c.subs.some(x=>String(x).toLowerCase()===j.toLowerCase()))c.subs.push(j)}
export function gradeDoEl$(S,el){const e=el.closest("[data-gr]");if(!e)return null;const k=e.dataset.gr;return k.charAt(0)==="o"?(cfg$(S).grades||[])[+k.slice(1)]:cfg$(S).categorias[+k].grade}
export function validaBanho$(S,bh,b,campo,valor){
  const v=String(valor==null?"":valor).trim();
  if(b&&campo==="fator"&&v){const n=num(v);if(n==null||n<=0||n>1e5)return "O Fator × precisa ser um número maior que 0 (ex.: 2,5)."}
  if(!b&&campo==="nome"){if(!v)return "O nome da galvânica não pode ficar vazio.";if(cfg$(S).banhistas.some(x=>x!==bh&&semAc(x.nome)===semAc(v)))return `Já existe a galvânica “${v}” — use outro nome.`}
  if(b&&campo==="nome"){
    if(!v)return "O nome do banho não pode ficar vazio.";
    if(bh.banhos.some(x=>x!==b&&semAc(x.nome)===semAc(v)))return `Já existe um banho chamado “${v}” neste galvânica — use outro nome (ex.: ${v} 2).`}
  if(b&&campo==="letra"){
    if(!v)return "";
    if(!/^[A-Za-z]{1,2}$/.test(v))return "A letra do banho deve ter só letras (A–Z), no máximo 2.";
    if(bh.banhos.some(x=>x!==b&&String(x.letra||"").trim().toLowerCase()===v.toLowerCase()))return `Já existe um banho com a letra “${v}” neste galvânica — escolha outra.`}
  if((b&&(campo==="mil"||campo==="mult"))||(!b&&campo==="verniz")){
    if(v==="")return "";
    const n=num(v);if(n==null||n<0)return `${campo==="mil"?"Milésimos":campo==="mult"?"Multiplicador":"Verniz"} precisa ser um número maior ou igual a 0 (sem texto nem negativo).`}
  return ""}
export const cadLancSig$=(S)=>JSON.stringify(S.lanc,(k,v)=>(k==="ft"||k==="ftR"||k==="foto")?undefined:v);
/* ===== Tarefa 8: cálculo do conjunto (sem DOM) e motor lançamentos -> linhas, recebendo o estado S ===== */
/* grava as somas na peça: Peso e Compra (iguais em todas as linhas), Banhos e Verniz (de cada banho marcado, em f.ov[banho]) e a Descrição; o Fator × de cada linha dá o Preço de Varejo */
/* foto dos custos de banho/verniz gravados no conjunto: se continuam iguais à última soma, ninguém digitou por cima e o cadastro de galvânicas pode atualizar */
export function conjCalcular$(S,f){
  if(!f.conj||!Array.isArray(f.comp))return null;
  const R=conjCalc$(S,f),temComp=f.comp.some(c=>!vazio(c.peso)||!vazio(c.custo));f.v=f.v||{};f.ov=f.ov||{};
  if(temComp){f.v.N=txtN(R.tot.N);f.v.P=txtN(R.tot.P);f.somaNP=1}else if(f.somaNP){delete f.v.N;delete f.v.P;delete f.somaNP}   /* só apaga Peso/Compra se foram as somas do conjunto que os criaram */
  if(R.temBanho){CJ_COL.forEach(L=>delete f.v[L]);
    const ids=R.vars.map(x=>x.b.id);
    R.vars.forEach(x=>{const o=f.ov[x.b.id]=f.ov[x.b.id]||{};CJ_COL.forEach(L=>{if(temComp&&x.tot[L]>0)o[L]=txtN(x.tot[L]);else delete o[L]})});
    Object.keys(f.ov).forEach(k=>{if(!ids.includes(k)&&k!=="p"&&k.indexOf("~")<0){const o=f.ov[k];if(o&&typeof o==="object")CJ_COL.forEach(L=>delete o[L])}})}
  else{CJ_COL.forEach(L=>{if(temComp&&R.tot[L]>0)f.v[L]=txtN(R.tot[L]);else delete f.v[L]});
    Object.keys(f.ov).forEach(k=>{if(k!=="p"&&k.indexOf("~")<0){const o=f.ov[k];if(o&&typeof o==="object")CJ_COL.forEach(L=>delete o[L])}})}
  Object.keys(f.ov).forEach(k=>{const o=f.ov[k];if(o&&typeof o==="object"&&!Object.keys(o).length)delete f.ov[k]});
  const nomes=f.comp.map(c=>String(c.desc||"").trim()).filter(Boolean),auto=nomes.length?"Conjunto "+nomes.join(" + "):"";
  if(vazio(f.v.F)||f.fConj===f.v.F){if(auto)f.v.F=auto;else delete f.v.F;f.fConj=auto}
  f.cjSnap=conjSnap(f);
  return R;
}
/* a referência de cada peça fica FIXA depois de lançada (excluir ou trocar a categoria de outra peça não renumera as demais); "Renumerar" refaz na ordem */
export function fixarRefs$(S){if(!S.lanc.some(l=>l&&l.v&&vazio(l.v.E)&&!(l.tipo==="pronta"&&l.vinc)))return false;const g=gerar$(S,S.lanc);let ch=false;
  S.lanc.forEach(l=>{if(!l||!l.v||!vazio(l.v.E)||(l.tipo==="pronta"&&l.vinc))return;const rw=g.linhas.find(x=>x.lancId===l.id);if(!rw)return;const E=String(rw.v.E||""),pt=String(rw.part||""),b=pt&&E.endsWith(pt)?E.slice(0,E.length-pt.length):E;if(b){l.v.E=b;l.rf=1;ch=true}});return ch}
export function renumerarRefs$(S){S.lanc.forEach(l=>{if(l&&l.rf&&l.v){delete l.v.E;delete l.rf}});fixarRefs$(S)}
export function gerar$(S,list){
  list=list||S.lanc;list.forEach(l=>{if(l&&l.conj&&Array.isArray(l.comp)&&(l.cjSnap===undefined||l.cjSnap===conjSnap(l))){try{conjCalcular$(S,l)}catch(e){}}});   /* conjunto lançado acompanha o cadastro de galvânicas (a menos que alguém tenha digitado o custo na planilha) */
  const C=cfg$(S),cont={},usados={},linhas=[],refs={},semQ={};
  /* referências digitadas à mão (no lançamento, coladas ou digitadas na planilha): a numeração automática continua depois da maior */
  const manual={},manualReal={};let curI=0;const addM=(x,i,rf)=>{const m=String(x||"").replace(/\s+/g,"").toUpperCase().match(/^([A-Z]+)(\d+)/);if(!m)return;const u=(usados[m[1]]=usados[m[1]]||new Map());if(!u.has(+m[2])||u.get(+m[2])>i)u.set(+m[2],i);manual[m[1]]=Math.max(manual[m[1]]||0,+m[2]);if(!rf)manualReal[m[1]]=Math.max(manualReal[m[1]]||0,+m[2])};
  list.forEach((l,i)=>{if(!vazio(l.v.E))addM(l.v.E,i,!!l.rf);Object.values(l.ov||{}).forEach(o=>{if(o&&typeof o==="object")addM(o.E,i)})});
  /* uma referência digitada só "reserva" o número para as peças lançadas depois dela; a peça antiga não é empurrada (se coincidir, aparece como repetida) */
  const next=p=>{if(!(p in cont))cont[p]=ultimo$(S,p);do{cont[p]++}while(usados[p]&&usados[p].has(cont[p])&&usados[p].get(cont[p])<=curI);return cont[p]};
  const cats=[null];
  const aplicaOv=(row,l)=>{row.ovs=[];const ov=l.ov||{},put=(o,pai)=>{if(o&&typeof o==="object")Object.keys(o).forEach(L=>{if(L[0]==="_")return;if(FORMULA.has(L)&&vazio(o[L]))return;if(pai&&(L==="W"||L==="E"))return;row.v[L]=o[L];if(!(l.conj&&CJ_COL.includes(L))&&!row.ovs.includes(L))row.ovs.push(L)})};
    if(row.bid&&row.key!==row.bid)put(ov[row.bid],true);row.v0={...row.v};put(ov[row.key],false);return row};
  cats.forEach(cat=>{
    const its=list,grupos=[];
    its.forEach((l,i)=>{const pv=its[i-1];if(l.tipo==="pronta"&&l.vinc&&!temGrade$(S,l)&&!bonP$(S,l).length&&pv&&pv.tipo==="pronta"&&!temGrade$(S,pv)&&!bonP$(S,pv).length&&prefDe$(S,val$(S,l,"I")||"",val$(S,l,"J"))===prefDe$(S,val$(S,pv,"I")||"",val$(S,pv,"J")))grupos[grupos.length-1].push(l);else grupos.push([l])});
    const baldes={},seq=[],prontas=[];
    grupos.forEach(g=>{
      curI=list.indexOf(g[0]);const ov=String(g[0].v.E||"").replace(/\s+/g,"").toUpperCase(),p=prefDe$(S,val$(S,g[0],"I")||"",val$(S,g[0],"J"));
      const base=ov?ov.replace(/(\d)[A-Z]$/,"$1"):p+fnum$(S,p,next(p));
      /* referência digitada à mão (no lançamento ou na célula): só as peças lançadas depois dela continuam a partir daí; as anteriores mantêm o número */
      {if(!(p in cont))cont[p]=ultimo$(S,p);g.forEach(l2=>{[l2.v.E,...Object.values(l2.ov||{}).map(o=>o&&typeof o==="object"?o.E:"")].forEach(x=>{const m=String(x||"").trim().toUpperCase().match(/^([A-Z]+)([0-9]+)/);if(m&&m[1]===p&&+m[2]>cont[p])cont[p]=+m[2]})})}
      g.forEach((l,k)=>{
        const cat=val$(S,l,"I")||"";const comum={};LET.forEach(L=>comum[L]=val$(S,l,L));comum.I=cat;{const cj=catBy$(S,cat);if(cj&&cj.subSoRef&&cj.subSoRef[comum.J])comum.J=""}
        const meta={lancId:l.id,desconto:num(l.desconto)||0,lote:l.lote||null},mk=l.mk||{};
        if(l.tipo==="bruta"){
          const bh=bhDe$(S,l);refs[l.id]=[];
          const vars=itensGrade$(S,l),bon=bh.banhos.filter(b=>l.on&&l.on[b.id]),qv=k=>qtdPos(((l.ov||{})[k]||{}).W);let kk=0;
          /* com variação: se alguma combinação tem quantidade, as que ficaram sem quantidade não viram linha */
          const soComQ=vars.length&&bon.some(b=>vars.some(it=>qv(b.id+"~"+it.id)));
          bh.banhos.forEach((b,i)=>{
            if(!(l.on&&l.on[b.id]))return;
            (vars.length?vars:[null]).forEach(it=>{
              if(it&&soComQ&&!qv(b.id+"~"+it.id)){semQ[l.id]=(semQ[l.id]||0)+1;return}
              const letra=refParte(b,it);kk++;
              const v={...comum,E:base+letra,F:descVar(descBanho$(S,l,b,i),it),L:b.cor,O:milDe(b,cat),W:""};["R","S","T"].forEach(c=>v[c]="");
              if(it&&it.col&&!vazio(it.valor))v[it.col]=it.valor;if(it&&it.extra)Object.assign(v,it.extra);
              const semCalc=banhoSemCalc(b);   /* banho sem cálculo (ex.: Prata 925): só marca a linha; sem custo de banho nem verniz */
              const row=aplicaOv({...meta,mk:(num(mk[b.id])||num(b.fator)||null),key:it?b.id+"~"+it.id:b.id,bid:b.id,gi:it?it.id:null,part:letra,col:b.coluna||"",v,...(semCalc?{}:{banho:{coluna:b.coluna,modo:b.modo||"peso",mult:num(multItem(l,b,cat))},verniz:vzOn(l,bh,b)?num(bh.verniz):null})},l);
              refs[l.id].push(row.v.E);
              if(C.ordem==="ab")(baldes[i]=baldes[i]||[]).push(row);else seq.push(row);
            });
          });
        }else{
          const vars=itensGrade$(S,l),bp=bonP$(S,l);
          if(bp.length){const bh=bhDe$(S,l),qvk=k=>qtdPos(((l.ov||{})[k]||{}).W),soComQ=vars.length&&bp.some(b=>vars.some(it=>qvk(b.id+"~"+it.id)));let kk=0;refs[l.id]=[];
            bh.banhos.forEach((b,i)=>{if(!bp.includes(b))return;(vars.length?vars:[null]).forEach(it=>{if(it&&soComQ&&!qvk(b.id+"~"+it.id)){semQ[l.id]=(semQ[l.id]||0)+1;return}
              const letra=refParte(b,it);kk++;
              const v={...comum,E:base+letra,F:descVar(descBanho$(S,l,b,i),it),L:b.cor,O:milDe(b,cat),W:""};if(it&&it.col&&!vazio(it.valor))v[it.col]=it.valor;if(it&&it.extra)Object.assign(v,it.extra);
              const row=aplicaOv({...meta,mk:(num(mk[b.id])||num(b.fator)||null),key:it?b.id+"~"+it.id:b.id,bid:b.id,gi:it?it.id:null,part:letra,col:b.coluna,v},l);refs[l.id].push(row.v.E);
              if(C.ordem==="ab")(baldes[i]=baldes[i]||[]).push(row);else seq.push(row)})});return}
          if(vars.length){refs[l.id]=[];const qv=k=>qtdPos(((l.ov||{})[k]||{}).W),soComQ=vars.some(it=>qv("p~"+it.id));vars.forEach(it=>{if(soComQ&&!qv("p~"+it.id)){semQ[l.id]=(semQ[l.id]||0)+1;return}const v={...comum,E:base+refParte(null,it),F:descVar(comSufixoCat$(S,comum.F,cat,l.semSufixoCat),it),W:""};if(it.col&&!vazio(it.valor))v[it.col]=it.valor;if(it.extra)Object.assign(v,it.extra);
            const row=aplicaOv({...meta,mk:num(mk.p),key:"p~"+it.id,bid:"p",gi:it.id,part:refParte(null,it),v},l);refs[l.id].push(row.v.E);if(C.ordem==="ab")prontas.push(row);else seq.push(row)});return}
          const ref=ov&&g.length===1?ov:base+(g.length>1?letraN(k):"");
          const row=aplicaOv({...meta,mk:num(mk.p),key:"p",part:"",v:{...comum,E:ref,F:comSufixoCat$(S,comum.F,cat,l.semSufixoCat)}},l);
          refs[l.id]=[row.v.E];
          if(C.ordem==="ab")prontas.push(row);else seq.push(row);
        }
      });
    });
    Object.keys(baldes).sort((a,b)=>a-b).forEach(k=>linhas.push(...baldes[k]));
    linhas.push(...seq,...prontas);
  });
  {const ex={};list.forEach(l=>{if(l.excl&&l.excl.length)ex[l.id]=new Set(l.excl)});
    if(Object.keys(ex).length)for(let i=linhas.length-1;i>=0;i--){const r=linhas[i];if(ex[r.lancId]&&ex[r.lancId].has(r.key)){const a=refs[r.lancId];if(a){const j=a.indexOf(r.v.E);if(j>=0)a.splice(j,1)}linhas.splice(i,1)}}}
  const conta={};linhas.forEach(r=>{const k=String(r.v.E||"").toUpperCase();conta[k]=(conta[k]||0)+1});
  linhas.forEach(r=>r.dup=conta[String(r.v.E||"").toUpperCase()]>1);
  return {linhas,refs,cont,manual,manualReal,semQ};
}
