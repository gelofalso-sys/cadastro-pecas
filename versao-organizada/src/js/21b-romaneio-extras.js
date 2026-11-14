/* ===== romaneio: peça nova fora da lista, foto por item e insumos do romaneio rateados entre as peças ===== */

/* ---------- peça nova (que não veio no PDF e não sai de dividir um item) ---------- */
function romNovaPeca(){
  romGaranteRom();if(!ROM)return;
  const f=S.form,x={cod:"",desc:"",preco:null,precod:null,total:null,qtd:1,peso:"",q:{},skip:false,aviso:"",cat:f.v.I||"",sub:"",custo:"",extra:true,mk:{},bo:{},on:{},vz:{},ex:{}};
  romNovaCat(x);ROM.rows.push(x);romSalvarSoon();renderRom();
  const i=ROM.rows.length-1,rc=document.querySelector(`#romWrap .rc[data-i="${i}"]`);
  if(rc){rolarPane(rc);const d=rc.querySelector('[data-rp="desc"]');if(d)d.focus()}
  toast("Peça nova no romaneio: preencha descrição, categoria, peso, custo e a quantidade.")}

/* ---------- foto por item do romaneio ---------- */
const romTemArq=e=>e.dataTransfer&&[...(e.dataTransfer.types||[])].includes("Files");
function romFotoEscolher(i){ftAlvo="rom:"+i;const inp=document.getElementById("ftIn");if(inp)inp.click()}
async function romFotoGravar(i,F){
  const r=ROM&&ROM.rows[i];if(!r)return;
  r.foto=F.grande;r.fotoMini=F.mini;
  if(r.feito&&Array.isArray(r.lancIds)){for(const id of r.lancIds)await fotoNaPeca(id,F);salvar(false);renderTopo()}}
/* o 1º arquivo vai para o item escolhido (troca a foto que já houver); os demais, em sequência, para os próximos itens sem foto */
async function romFotosEscolhidas(i,files){
  const arqs=[...files].filter(f=>f&&(/^image\//.test(f.type)||/\.(jpe?g|png|webp|gif)$/i.test(f.name)));
  if(!arqs.length){toast("Nenhuma foto nesses arquivos. Use JPG, PNG ou WebP.");return}
  let pos=i,ok=0;const erros=[];
  for(const f of arqs){
    while(pos<ROM.rows.length&&(ROM.rows[pos].lote||(ok>0&&ROM.rows[pos].foto)))pos++;
    if(pos>=ROM.rows.length){erros.push(`“${f.name}”: não há mais item sem foto`);continue}
    try{await romFotoGravar(pos,await lerFotoArquivo(f));ok++;pos++}catch(e){erros.push(e.message)}}
  romSalvarSoon();renderRom();
  toast(`${ok} foto(s) anexada(s) aos itens do romaneio${erros.length?` · ${erros.length} com problema: ${erros[0]}`:""}.`)}
function romFotoRemover(i){
  const r=ROM&&ROM.rows[i];if(!r)return;delete r.foto;delete r.fotoMini;
  if(r.feito&&Array.isArray(r.lancIds))r.lancIds.forEach(id=>{const l=S.lanc.find(x=>x.id===id);if(l){delete l.ft;idbDel("fotos",id);idbDel("fotos","m:"+id);ftSalvas.delete(id)}});
  salvar(false);renderTopo();romSalvarSoon();renderRom();toast("Foto do item removida.")}

/* ---------- insumos próprios do romaneio ---------- */
const romInsItens=()=>ROM&&ROM.ins&&Array.isArray(ROM.ins.itens)?ROM.ins.itens:[];
/* Mantém dados antigos intactos, mas impede lançar frete/separação como insumo. */
const romInsFora=x=>/^(?:(?:valor|custo|taxa|despesa|servico|preco)\s+(?:(?:de|da|do|com)\s+)?)?(?:fretes?|separacao|separacoes)(?:\b|$)/.test(String(x&&x.nome||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase());
const romInsProibidos=()=>romInsItens().filter(romInsFora);
const romInsBase=()=>ROM&&ROM.ins&&["un","custo","peso"].includes(ROM.ins.base)?ROM.ins.base:"un";
const romInsTotal=()=>r2c(romInsItens().filter(x=>!romInsFora(x)).reduce((t,x)=>t+(num(x.valor)||0),0));
/* peças que dividem o total: as que serão criadas (ou já foram) e têm quantidade */
function romInsCtx(){
  const o={un:0,custo:0,peso:0};
  ROM.rows.forEach(r=>{if(r.lote||(r.skip&&!r.feito))return;const u=romSomaDe(r,romColsR(r));if(!(u>0))return;o.un+=u;o.custo+=u*(num(r.custo)||0);o.peso+=u*(num(r.peso)||0)});
  return o}
/* valor de insumo do romaneio que cabe a UMA unidade desta peça */
function romInsRateio(r,ctx){
  if(!ROM||!r||r.lote)return 0;const T=romInsTotal();if(!(T>0))return 0;
  const c=ctx||romInsCtx(),b=romInsBase();
  if(b==="un")return c.un>0?r2c(T/c.un):0;
  if(b==="custo")return c.custo>0&&num(r.custo)!=null?r2c(T*(num(r.custo)||0)/c.custo):0;
  return c.peso>0&&num(r.peso)!=null?r2c(T*(num(r.peso)||0)/c.peso):0}
/* Sem base não há rateio: não confundir ausência de dados com arredondamento. */
function romInsSemBase(){if(!(romInsTotal()>0))return false;const c=romInsCtx(),b=romInsBase();return b==="custo"?!(c.custo>0):b==="peso"?!(c.peso>0):!(c.un>0)}
/* Somar um rateio a uma fórmula exigiria preservá-la na linha e na edição.
   Enquanto isso não for possível, não substitua silenciosamente por zero. */
function romInsBasesInvalidas(){
  if(!ROM||!S.form)return [];
  const ctx=romInsCtx(),f=S.form;
  return ROM.rows.filter(r=>{
    if(r.skip||r.lote||!(romSomaDe(r,romColsR(r))>0)||!(romInsRateio(r,ctx)>0))return false;
    const q=r.ex&&!vazio(r.ex.Q)?r.ex.Q:!vazio(f.v.Q)?f.v.Q:padraoDe(r.cat||f.v.I,"Q");
    return !vazio(q)&&num(q)==null
  })
}
/* Não aplique um rateio que altera o valor total por arredondamento unitário. */
function romInsDiferenca(){
  const total=romInsTotal(),ctx=romInsCtx();if(!(total>0)||!(ctx.un>0))return 0;
  const aplicado=ROM.rows.reduce((a,r)=>{if(r.lote||(r.skip&&!r.feito))return a;const q=romSomaDe(r,romColsR(r));return a+(q>0?q*romInsRateio(r,ctx):0)},0);
  return r2c(total-r2c(aplicado))}
/* Antes de criar parte do romaneio, as peças já lançadas devem conservar a mesma parcela calculada.
   Se o rateio mudou, peça confirmação pela edição de todas elas, sem sobrescrever edições silenciosamente. */
function romInsDesatualizados(arquivadas){
  if(!ROM)return [];const ctx=romInsCtx(),pend=[];
  ROM.rows.forEach(r=>{if(r.lote||!r.feito||!r.skip||r.refaz)return;
    const ids=r.lancIds||[],esperado=romInsRateio(r,ctx),pecas=ids.flatMap(id=>{const atual=S.lanc.find(l=>l.id===id);return atual?[atual]:(arquivadas&&arquivadas.get(id))||[null]});
    if(!ids.length||pecas.some(l=>!l)){pend.push(r);return}
    if(pecas.some(l=>Math.round((num(l.insRom&&l.insRom.ins)||0)*100)!==Math.round(esperado*100)))pend.push(r);
  });return pend}
/* Lê os lançamentos de tabelas salvas antes da revisão e novamente antes de criar.
   Leitura ausente ou falha é desconhecida, nunca tratada como custo zero. */
async function romInsConferirArquivos(){
  const rom=ROM,ids=new Set((rom&&rom.rows||[]).filter(r=>!r.lote&&r.feito&&r.skip&&!r.refaz).flatMap(r=>(r.lancIds||[]).filter(id=>!S.lanc.some(l=>l.id===id))));
  const achadas=new Map();if(ids.size){const tabs=TABS.filter(t=>(t.ids||[]).some(id=>ids.has(id)));
    const recs=await Promise.all(tabs.map(t=>idbGet("tabs",t.id).catch(()=>null)));
    recs.forEach((rec,i)=>{const add=(id,l)=>{if(!achadas.has(id))achadas.set(id,[]);achadas.get(id).push(l)};
      if(!rec||!Array.isArray(rec.lanc)){(tabs[i].ids||[]).filter(id=>ids.has(id)).forEach(id=>add(id,null));return}
      (tabs[i].ids||[]).filter(id=>ids.has(id)).forEach(id=>{const l=rec.lanc.find(x=>x&&x.id===id);add(id,l||null)})})}
  return ROM===rom?romInsDesatualizados(achadas):null}
const romInsAssinatura=()=>JSON.stringify([ROM,S.lanc,S.form,cfg(),TABS]);
function romInsResumoTxt(){
  const it=romInsItens(),T=romInsTotal(),c=romInsCtx(),b=romInsBase();
  if(romInsProibidos().length)return "Frete e separação ficam fora do custo das peças. Retire esses itens dos insumos antes de criar; os dados antigos não foram apagados.";
  if(!it.length)return "Nenhum insumo próprio neste romaneio. Os insumos de cada categoria (Cadastros) continuam valendo normalmente.";
  if(!(T>0))return "Informe o valor de cada insumo.";
  if(!(c.un>0))return `Total R$ ${brl(T)}. Ainda não há peças com quantidade para receber o rateio.`;
  const base=b==="un"?`${fmt(c.un)} unidades → R$ ${brl(r2c(T/c.un))} por unidade`:b==="custo"?`proporcional à compra (R$ ${brl(r2c(c.custo))} no total): cada R$ 1,00 de compra recebe R$ ${brl(r2c(T/c.custo))}`:`proporcional ao peso (${fmt(Math.round(c.peso*1000)/1000)} g no total): cada grama recebe R$ ${brl(Math.round(T/c.peso*10000)/10000)}`;
  return `Total R$ ${brl(T)} dividido entre ${fmt(c.un)} unidade(s) — ${base}. Entra no custo de Insumos de cada peça, somado ao padrão da categoria; os centavos são arredondados por peça.`}
function romInsHTML(){
  const it=romInsItens(),b=romInsBase();
  return `<details class="gdet rom-ins" data-open="rins" ${abertos.rins||it.length||romInsSugestoes().length?"open":""}><summary><b>Insumos deste romaneio</b><span>${it.length?`${it.length} item(ns) · R$ ${brl(romInsTotal())} rateados nas peças`:(romInsSugestoes().length?"⚠ o romaneio traz frete/separação fora do custo":"embalagem e etiquetas divididas entre as peças criadas")}</span></summary><div class="gb">
    <p class="hint">Use para gastos que valem para este romaneio inteiro. O total é dividido entre as peças que serão criadas e entra no custo de Insumos de cada uma (somado ao padrão da categoria). Dá para conferir a conta na célula de Insumos da tabela.</p>
    ${it.length?`<div class="tw"><table class="cfg"><thead><tr><th>Insumo</th><th class="n">Valor total (R$)</th><th></th></tr></thead><tbody>${it.map((x,i)=>`<tr><td><input data-rp="rins" data-k="nome" data-i="${i}" value="${esc(x.nome||"")}" maxlength="80" placeholder="ex.: caixas, etiquetas" aria-label="Nome do insumo ${i+1}"></td><td style="width:150px"><input class="n" data-rp="rins" data-k="valor" data-i="${i}" value="${esc(x.valor||"")}" inputmode="decimal" aria-label="Valor total do insumo ${i+1}"></td><td style="width:36px"><button type="button" class="x" data-act="rins-del" data-i="${i}" aria-label="Excluir o insumo ${i+1}">×</button></td></tr>`).join("")}</tbody></table></div>`:""}
    ${romInsSugestoes().map(x=>`<div class="rins-sug" role="note">O romaneio traz <b>${esc(x.nome)}: R$ ${esc(x.valor)}</b> — esse valor fica fora do custo das peças.</div>`).join("")}
    <div class="row"><button type="button" class="btn sm" data-act="rins-add">＋ Insumo do romaneio</button>${it.length?`<label class="fq"><span>Como dividir</span><select data-rp="rins" data-k="base" aria-label="Como dividir os insumos do romaneio"><option value="un" ${b==="un"?"selected":""}>Igual por unidade</option><option value="custo" ${b==="custo"?"selected":""}>Proporcional à compra</option><option value="peso" ${b==="peso"?"selected":""}>Proporcional ao peso</option></select></label>`:""}</div>
    <div class="rins-res" id="rinsRes" role="status">${esc(romInsResumoTxt())}</div></div></details>`}
/* Frete e separação do documento são informativos, sem rateio. */
function romInsSugestoes(){
  if(!ROM||!ROM.texto)return [];const tx=String(ROM.texto),out=[],ja=romInsItens().map(x=>String(x.nome||"").toLowerCase());
  [["Custo de separação",/custo\s+separa[cç][aã]o\s*:?\s*R\$\s*([\d.]+,\d{2})/i],["Frete",/\bfrete\s*:?\s*R\$\s*([\d.]+,\d{2})/i]].forEach(([nome,re])=>{
    const m=re.exec(tx);if(!m)return;const v=num(m[1]);if(!(v>0)||ja.includes(nome.toLowerCase()))return;out.push({nome,valor:m[1]})});
  return out}
function romInsCampo(t,fin){
  ROM.ins=ROM.ins||{itens:[],base:"un"};const k=t.dataset.k,i=+t.dataset.i;
  if(k==="base"){if(["un","custo","peso"].includes(t.value))ROM.ins.base=t.value;romAtualSoon();return}
  const x=ROM.ins.itens[i];if(!x)return;
  if(k==="nome")x.nome=t.value.slice(0,80);
  if(k==="valor"){
    if(fin){const n=num(t.value);if(!vazio(t.value)&&(n==null||n<0||n>1e6)){toast("O valor do insumo precisa ser um número de 0 a 1.000.000.");t.value=x.valor||"";return}}
    x.valor=t.value}
  romAtualSoon()}
/* chip em cada cartão e resumo: chamado por romAtual */
function romExtrasAtual(){
  if(!ROM)return;romPassosAtual();const res=document.getElementById("rinsRes");if(res)res.textContent=romInsResumoTxt();
  const ctx=romInsCtx();
  ROM.rows.forEach((r,i)=>{if(r.lote)return;const rc=document.querySelector(`#romWrap .rc[data-i="${i}"]`),ch=rc&&rc.querySelector("[data-rins-c]");if(!ch)return;const v=romInsRateio(r,ctx);ch.hidden=!(v>0);if(v>0)ch.textContent=`+ insumos do romaneio R$ ${brl(v)}/un`})}

/* ---------- lote para qualquer item do romaneio (pesar peça por peça) e desativar ---------- */
function romLotear(i,quiet){
  const r=ROM&&ROM.rows[i];if(!r)return;
  if(r.lote||r.loteDe){if(!quiet)toast("Este item já é um lote.");return}
  if(r.feito||(r.lancIds||[]).length){toast("Este item já foi lançado: revogue o lançamento antes de transformá-lo em lote.");return}
  if(Array.isArray(r.conjComp)){toast("Desfaça o conjunto antes de transformar o item em lote.");return}
  const qtd=Math.max(1,Math.min(60,Math.trunc(num(r.qtd)||1))),cu=num(r.custo)||0,pesoUn=num(r.peso)||0;
  r.lote=true;r.lid=uid();r.semPeso=true;r.und="";r.total=r2c(cu*qtd);r.loteG=null;r.precoG=null;r.ratear=true;r.qtdAntes=r.qtd;r.skip=true;r.aviso="lote: pese as peças";
  r.custoUn=r.custo;r.pesoUn=r.peso;r.peso="";r.q={};
  romLoteAdd(r,qtd,pesoUn>0?pesoUn:null);
  if(!quiet)toast(`${qtd} item(ns) criados no lote, numerados 1/${qtd}. Pese cada um: o valor do lote (R$ ${brl(r.total)}) se reparte pelo peso.`)}
function romLoteOff(i){
  const lot=ROM&&ROM.rows[i];if(!lot||!lot.lote)return;
  const kids=romLoteKids(lot);
  if(kids.some(k=>k.feito||(k.lancIds||[]).length)){toast("Há itens deste lote já lançados: revogue os lançamentos antes de desativar o lote.");return}
  if(kids.length&&!confirm(`Desativar o lote? Os ${kids.length} item(ns) criados nele serão removidos e volta um cartão comum.`))return;
  ROM.rows=ROM.rows.filter(x=>x.loteDe!==lot.lid);
  const n=lot.semPeso?(lot.qtdAntes||kids.length||1):1,tot=lot.total!=null?lot.total:(lot.loteG||0)*(lot.precoG||0);
  lot.qtd=n;lot.custo=lot.custoUn!=null&&lot.semPeso?lot.custoUn:virg(r2c(tot/n));lot.peso=lot.semPeso?(lot.pesoUn||""):(lot.loteG?g3(lot.loteG):"");
  ["lote","lid","semPeso","und","loteG","precoG","ratear","pesoReal","qtdAntes","custoUn","pesoUn"].forEach(k=>delete lot[k]);
  lot.skip=false;lot.aviso="";lot.q={};
  romSalvarSoon();renderRom();toast("Lote desativado: o item voltou a ser um cartão comum.")}

/* ＋ Galvânica / ＋ Banho dentro do lançamento ou do romaneio levam à página completa de Galvânicas e banhos (letra, cor, cálculo, coluna, milésimos…), em vez de um mini-cadastro limitado */
let qGalvanicaSelecionar=false;
function qIrGalvanica(q){
  const C=cfg();
  if(celular())formAbrir(false);irPara("banho");
  if(q==="bh"){qGalvanicaSelecionar=true;const botao=document.querySelector('#cfg [data-act="bh-add"]');if(botao){botao.click();setTimeout(()=>cadConferir(),0)}else qGalvanicaSelecionar=false}
  setTimeout(()=>{const bi=q==="bh"?C.banhistas.length-1:Math.max(0,C.banhistas.findIndex(b=>b.id===S.form.banhista)),el=document.querySelector(`[data-bh="${bi}"]`);
    if(el){el.scrollIntoView({block:"start",behavior:"smooth"});const f=el.querySelector(q==="bh"?'[data-bhf="nome"]':'[data-act="bn-pronto"]');if(f)f.focus({preventScroll:true})}},150);
  toast(q==="bh"?"Galvânica nova criada na página de Galvânicas e banhos: dê um nome, ajuste os banhos e use no lançamento.":"Escolha o banho (+ Ouro, + Ródio, + Prata, + Outro…) acima da tabela de milésimos; ele já aparece no lançamento.")}

/* ---------- fiscal (NCM, CFOP, FCP) e insumos de todas as categorias numa tabela só ---------- */
const FISC_COLS=[["ncm","NCM","8 números (ex.: 71131100)",96],["cfop","CFOP","4 números (ex.: 5102)",64],["fcp","FCP %","0 a 100",64],["insumos","Insumos R$","0 em diante (ex.: 0,50)",84]],FISC_PAD={ncm:"Y",cfop:"AA",fcp:"AB",insumos:"Q"};
function fiscalErro(k,v){v=String(v||"").trim();if(v==="")return "";const n=num(v);
  if(k==="ncm")return /^\d{8}$/.test(v)?"":"O NCM tem 8 números (ex.: 71131100).";
  if(k==="cfop")return /^\d{4}$/.test(v)?"":"O CFOP tem 4 números (ex.: 5102).";
  if(k==="fcp")return n!=null&&n>=0&&n<=100?"":"O FCP é um percentual de 0 a 100.";
  return n!=null&&n>=0&&n<=1e6?"":"Insumos precisa ser um número de 0 em diante (ex.: 0,50)."}
function fiscalTodasHTML(C){
  const pad=k=>esc((C.colcfg[FISC_PAD[k]]||{}).padrao||"");
  return `<details class="gdet" data-open="fiscall" ${abertos.fiscall?"open":""}><summary><b>Fiscal e insumos de todas as categorias</b><span>edite tudo numa tabela só, ou aplique um valor a todas de uma vez</span></summary><div class="gb">
    <p class="hint">Vazio = usa o padrão da coluna (Cadastros › Padrões das colunas). A linha de cima aplica o valor digitado a todas as categorias.</p>
    <div class="tw"><table class="cfg"><thead><tr><th>Categoria</th>${FISC_COLS.map(c=>`<th class="n" title="${c[2]}">${c[1]}</th>`).join("")}</tr></thead><tbody>
      <tr class="fall"><td><b>Todas as categorias</b></td>${FISC_COLS.map(c=>`<td><input class="n" data-fall="${c[0]}" placeholder="${pad(c[0])||"valor"}" style="width:${c[3]}px" inputmode="${c[0]==="ncm"||c[0]==="cfop"?"numeric":"decimal"}" aria-label="${c[1]} para todas as categorias"></td>`).join("")}</tr>
      <tr><td colspan="${FISC_COLS.length+1}" style="text-align:right"><button type="button" class="btn sm pri" data-act="fisc-aplicar" title="Grava os campos preenchidos acima em todas as categorias (os vazios não mudam nada)">Aplicar a todas as categorias</button></td></tr>
      ${C.categorias.map((c,i)=>`<tr><td>${esc(c.nome)}</td>${FISC_COLS.map(f=>`<td><input class="n" data-fc="${i}" data-fk="${f[0]}" value="${esc(c[f[0]]||"")}" placeholder="${pad(f[0])}" style="width:${f[3]}px" inputmode="${f[0]==="ncm"||f[0]==="cfop"?"numeric":"decimal"}" aria-label="${f[1]} de ${esc(c.nome)}"></td>`).join("")}</tr>`).join("")}
    </tbody></table></div></div></details>`}
function fiscalCampo(t,fin){
  if(t.dataset.fall!==undefined)return;   /* a linha "todas" só vale ao clicar em Aplicar */
  const C=cfg(),c=C.categorias[+t.dataset.fc],k=t.dataset.fk;if(!c)return;
  if(!fin)return;const v=t.value.trim(),m=fiscalErro(k,v);
  if(m){t.value=c[k]||"";toast(m+" Voltei ao valor anterior.");return}
  if(v==="")delete c[k];else c[k]=v;t.value=v;salvar(true,false);renderTopo();renderForm()}
function fiscalAplicarTodas(){
  const C=cfg(),vals={};let n=0;
  for(const [k] of FISC_COLS){const el=document.querySelector(`[data-fall="${k}"]`),v=el?el.value.trim():"";if(v==="")continue;const m=fiscalErro(k,v);if(m){toast(m);if(el)el.focus();return}vals[k]=v}
  Object.entries(vals).forEach(([k,v])=>{C.categorias.forEach(c=>{c[k]=v;n++})});
  if(!n){toast("Preencha pelo menos um campo na linha “Todas as categorias”.");return}
  abertos.fiscall=true;guardarAbertos();salvar(true,false);render();toast(`${Object.keys(vals).length} campo(s) aplicado(s) a ${C.categorias.length} categorias.`)}

/* ---------- seleção para ações em massa ---------- */
function romSelRows(){const s=ROM.rows.filter(r=>r.sel&&!r.lote);return s.length?s:ROM.rows.filter(r=>!r.lote)}

/* ---------- passos do romaneio: 1 Importar · 2 Pesos · 3 Revisar · 4 Criar ---------- */
function romPassosEstado(){
  const rs=ROM.rows.filter(r=>!r.lote),at=ROM.rows.filter(r=>!r.skip&&!r.lote);
  const sp=at.filter(r=>num(r.peso)==null).length,dv=at.filter(r=>romSomaDe(r,romColsR(r))!==r.qtd).length,dp=0,
    tam=at.filter(r=>{const g=gradeDaCat(r.cat,r.sub);return g&&!r.semG&&!(r.gsel||[]).length&&!Array.isArray(r.conjComp)}).length,
    lotes=ROM.rows.filter(r=>r.lote&&romLoteResumo(r).cls!=="ok").length,pend=sp+dv+tam+lotes;
  return {n:rs.length,pend,sp,dv,tam,lotes,conf:ROM.conf||"",pronto:rs.length>0&&pend===0}}
function romPassosHTML(){
  if(!ROM||!ROM.rows.length)return "";
  const e=romPassosEstado(),ok=/✓/.test(e.conf)&&!/⚠/.test(e.conf);
  const p=(n,txt,estado,tit)=>`<li class="${estado}"><button type="button" data-act="rom-passo" data-p="${n}" title="${esc(tit)}"><b>${estado==="ok"?"✓":n}</b> ${txt}</button></li>`;
  return `<ol class="rom-passos" id="romPassos" aria-label="Passos do romaneio">${p(1,`Importar <small>${e.n} peça(s)</small>`,"ok","Voltar ao topo para importar de novo")}${p(2,`Pesos e divisão <small>${e.pend?e.pend+" pendente(s)":"tudo certo"}</small>`,e.pend?"pend":"ok","Ir para a próxima pendência")}${p(3,`Conferir <small>${ok?"lista confere":e.conf?"há diferença":"ainda não conferida"}</small>`,ok?"ok":"pend","Ver a conferência com a lista do fornecedor")}${p(4,"Criar peças",e.pronto?"":"off","Ir para o botão Criar")}</ol>`}
function romPassosAtual(){const el=document.getElementById("romPassos");if(!el||!ROM)return;const t=document.createElement("div");t.innerHTML=romPassosHTML();const n=t.firstElementChild;if(n)el.replaceWith(n)}
function romPassoIr(p){
  if(p===1){const b=document.getElementById("impBar");if(b)b.scrollIntoView({block:"start",behavior:"smooth"});return}
  if(p===2){const lote=ROM.rows.findIndex(r=>r.lote&&romLoteResumo(r).cls!=="ok");if(lote>=0){const el=document.querySelector(`#romWrap .rc[data-i="${lote}"]`);if(el){el.scrollIntoView({block:"center",behavior:"smooth"});const b=el.querySelector('[data-act="lote-add"]');if(b)b.focus({preventScroll:true});return}}const bt=document.querySelector('#romWrap [data-act="rom-pend"]');if(bt)bt.click();return}
  if(p===3){const c=document.getElementById("romChk");if(c)c.scrollIntoView({block:"center",behavior:"smooth"});return}
  const b=document.getElementById("romCriar");if(b){b.scrollIntoView({block:"center",behavior:"smooth"});b.focus({preventScroll:true})}}
