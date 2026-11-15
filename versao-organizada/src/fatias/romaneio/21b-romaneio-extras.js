
/* ---------- insumos próprios do romaneio ---------- */
const romInsItens=()=>estadoRomaneio.ROM&&estadoRomaneio.ROM.ins&&Array.isArray(estadoRomaneio.ROM.ins.itens)?estadoRomaneio.ROM.ins.itens:[];
/* Mantém dados antigos intactos, mas impede lançar frete/separação como insumo. */
const romInsProibidos=()=>romInsItens().filter(romInsFora);
const romInsBase=()=>estadoRomaneio.ROM&&estadoRomaneio.ROM.ins&&["un","custo","peso"].includes(estadoRomaneio.ROM.ins.base)?estadoRomaneio.ROM.ins.base:"un";
const romInsTotal=()=>r2c(romInsItens().filter(x=>!romInsFora(x)).reduce((t,x)=>t+(num(x.valor)||0),0));
/* peças que dividem o total: as que serão criadas (ou já foram) e têm quantidade */
function romInsCtx(){
  const o={un:0,custo:0,peso:0};
  estadoRomaneio.ROM.rows.forEach(r=>{if(r.lote||(r.skip&&!r.feito))return;const u=romSomaDe(r,romColsR(r));if(!(u>0))return;o.un+=u;o.custo+=u*(num(r.custo)||0);o.peso+=u*(num(r.peso)||0)});
  return o}
/* valor de insumo do romaneio que cabe a UMA unidade desta peça */
function romInsRateio(r,ctx){
  if(!estadoRomaneio.ROM||!r||r.lote)return 0;const T=romInsTotal();if(!(T>0))return 0;
  const c=ctx||romInsCtx(),b=romInsBase();
  if(b==="un")return c.un>0?r2c(T/c.un):0;
  if(b==="custo")return c.custo>0&&num(r.custo)!=null?r2c(T*(num(r.custo)||0)/c.custo):0;
  return c.peso>0&&num(r.peso)!=null?r2c(T*(num(r.peso)||0)/c.peso):0}
/* Sem base não há rateio: não confundir ausência de dados com arredondamento. */
function romInsSemBase(){if(!(romInsTotal()>0))return false;const c=romInsCtx(),b=romInsBase();return b==="custo"?!(c.custo>0):b==="peso"?!(c.peso>0):!(c.un>0)}
/* Somar um rateio a uma fórmula exigiria preservá-la na linha e na edição.
   Enquanto isso não for possível, não substitua silenciosamente por zero. */
function romInsBasesInvalidas(){
  if(!estadoRomaneio.ROM||!S.form)return [];
  const ctx=romInsCtx(),f=S.form;
  return estadoRomaneio.ROM.rows.filter(r=>{
    if(r.skip||r.lote||!(romSomaDe(r,romColsR(r))>0)||!(romInsRateio(r,ctx)>0))return false;
    const q=r.ex&&!vazio(r.ex.Q)?r.ex.Q:!vazio(f.v.Q)?f.v.Q:padraoDe(r.cat||f.v.I,"Q");
    return !vazio(q)&&num(q)==null
  })
}
/* Não aplique um rateio que altera o valor total por arredondamento unitário. */
function romInsDiferenca(){
  const total=romInsTotal(),ctx=romInsCtx();if(!(total>0)||!(ctx.un>0))return 0;
  const aplicado=estadoRomaneio.ROM.rows.reduce((a,r)=>{if(r.lote||(r.skip&&!r.feito))return a;const q=romSomaDe(r,romColsR(r));return a+(q>0?q*romInsRateio(r,ctx):0)},0);
  return r2c(total-r2c(aplicado))}
/* Antes de criar parte do romaneio, as peças já lançadas devem conservar a mesma parcela calculada.
   Se o rateio mudou, peça confirmação pela edição de todas elas, sem sobrescrever edições silenciosamente. */
function romInsDesatualizados(arquivadas){
  if(!estadoRomaneio.ROM)return [];const ctx=romInsCtx(),pend=[];
  estadoRomaneio.ROM.rows.forEach(r=>{if(r.lote||!r.feito||!r.skip||r.refaz)return;
    const ids=r.lancIds||[],esperado=romInsRateio(r,ctx),pecas=ids.flatMap(id=>{const atual=S.lanc.find(l=>l.id===id);return atual?[atual]:(arquivadas&&arquivadas.get(id))||[null]});
    if(!ids.length||pecas.some(l=>!l)){pend.push(r);return}
    if(pecas.some(l=>Math.round((num(l.insRom&&l.insRom.ins)||0)*100)!==Math.round(esperado*100)))pend.push(r);
  });return pend}
/* Lê os lançamentos de tabelas salvas antes da revisão e novamente antes de criar.
   Leitura ausente ou falha é desconhecida, nunca tratada como custo zero. */
async function romInsConferirArquivos(){
  const rom=estadoRomaneio.ROM,ids=new Set((rom&&rom.rows||[]).filter(r=>!r.lote&&r.feito&&r.skip&&!r.refaz).flatMap(r=>(r.lancIds||[]).filter(id=>!S.lanc.some(l=>l.id===id))));
  const achadas=new Map();if(ids.size){const tabs=estadoArmazenamento.TABS.filter(t=>(t.ids||[]).some(id=>ids.has(id)));
    const recs=await Promise.all(tabs.map(t=>bancoLer("tabs",t.id).catch(()=>null)));
    recs.forEach((rec,i)=>{const add=(id,l)=>{if(!achadas.has(id))achadas.set(id,[]);achadas.get(id).push(l)};
      if(!rec||!Array.isArray(rec.lanc)){(tabs[i].ids||[]).filter(id=>ids.has(id)).forEach(id=>add(id,null));return}
      (tabs[i].ids||[]).filter(id=>ids.has(id)).forEach(id=>{const l=rec.lanc.find(x=>x&&x.id===id);add(id,l||null)})})}
  return estadoRomaneio.ROM===rom?romInsDesatualizados(achadas):null}
const romInsAssinatura=()=>JSON.stringify([estadoRomaneio.ROM,S.lanc,S.form,cfg(),estadoArmazenamento.TABS]);
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
  return `<details class="gdet rom-ins" data-open="rins" ${estadoBase.abertos.rins||it.length||romInsSugestoes().length?"open":""}><summary><b>Insumos deste romaneio</b><span>${it.length?`${it.length} item(ns) · R$ ${brl(romInsTotal())} rateados nas peças`:(romInsSugestoes().length?"⚠ o romaneio traz frete/separação fora do custo":"embalagem e etiquetas divididas entre as peças criadas")}</span></summary><div class="gb">
    <p class="hint">Use para gastos que valem para este romaneio inteiro. O total é dividido entre as peças que serão criadas e entra no custo de Insumos de cada uma (somado ao padrão da categoria). Dá para conferir a conta na célula de Insumos da tabela.</p>
    ${it.length?`<div class="tw"><table class="cfg"><thead><tr><th>Insumo</th><th class="n">Valor total (R$)</th><th></th></tr></thead><tbody>${it.map((x,i)=>`<tr><td><input data-rp="rins" data-k="nome" data-i="${i}" value="${esc(x.nome||"")}" maxlength="80" placeholder="ex.: caixas, etiquetas" aria-label="Nome do insumo ${i+1}"></td><td style="width:150px"><input class="n" data-rp="rins" data-k="valor" data-i="${i}" value="${esc(x.valor||"")}" inputmode="decimal" aria-label="Valor total do insumo ${i+1}"></td><td style="width:36px"><button type="button" class="x" data-act="rins-del" data-i="${i}" aria-label="Excluir o insumo ${i+1}">×</button></td></tr>`).join("")}</tbody></table></div>`:""}
    ${romInsSugestoes().map(x=>`<div class="rins-sug" role="note">O romaneio traz <b>${esc(x.nome)}: R$ ${esc(x.valor)}</b> — esse valor fica fora do custo das peças.</div>`).join("")}
    <div class="row"><button type="button" class="btn sm" data-act="rins-add">＋ Insumo do romaneio</button>${it.length?`<label class="fq"><span>Como dividir</span><select data-rp="rins" data-k="base" aria-label="Como dividir os insumos do romaneio"><option value="un" ${b==="un"?"selected":""}>Igual por unidade</option><option value="custo" ${b==="custo"?"selected":""}>Proporcional à compra</option><option value="peso" ${b==="peso"?"selected":""}>Proporcional ao peso</option></select></label>`:""}</div>
    <div class="rins-res" id="rinsRes" role="status">${esc(romInsResumoTxt())}</div></div></details>`}
/* Frete e separação do documento são informativos, sem rateio. */
function romInsSugestoes(){
  if(!estadoRomaneio.ROM||!estadoRomaneio.ROM.texto)return [];const tx=String(estadoRomaneio.ROM.texto),out=[],ja=romInsItens().map(x=>String(x.nome||"").toLowerCase());
  [["Custo de separação",/custo\s+separa[cç][aã]o\s*:?\s*R\$\s*([\d.]+,\d{2})/i],["Frete",/\bfrete\s*:?\s*R\$\s*([\d.]+,\d{2})/i]].forEach(([nome,re])=>{
    const m=re.exec(tx);if(!m)return;const v=num(m[1]);if(!(v>0)||ja.includes(nome.toLowerCase()))return;out.push({nome,valor:m[1]})});
  return out}
function romInsCampo(t,fin){
  estadoRomaneio.ROM.ins=estadoRomaneio.ROM.ins||{itens:[],base:"un"};const k=t.dataset.k,i=+t.dataset.i;
  if(k==="base"){if(["un","custo","peso"].includes(t.value))estadoRomaneio.ROM.ins.base=t.value;romAtualSoon();return}
  const x=estadoRomaneio.ROM.ins.itens[i];if(!x)return;
  if(k==="nome")x.nome=t.value.slice(0,80);
  if(k==="valor"){
    if(fin){const n=num(t.value);if(!vazio(t.value)&&(n==null||n<0||n>1e6)){toast("O valor do insumo precisa ser um número de 0 a 1.000.000.");t.value=x.valor||"";return}}
    x.valor=t.value}
  romAtualSoon()}
/* chip em cada cartão e resumo: chamado por romAtual */
function romExtrasAtual(){
  if(!estadoRomaneio.ROM)return;romPassosAtual();const res=document.getElementById("rinsRes");if(res)res.textContent=romInsResumoTxt();
  const ctx=romInsCtx();
  estadoRomaneio.ROM.rows.forEach((r,i)=>{if(r.lote)return;const rc=document.querySelector(`#romWrap .rc[data-i="${i}"]`),ch=rc&&rc.querySelector("[data-rins-c]");if(!ch)return;const v=romInsRateio(r,ctx);ch.hidden=!(v>0);if(v>0)ch.textContent=`+ insumos do romaneio R$ ${brl(v)}/un`})}

/* ---------- lote para qualquer item do romaneio (pesar peça por peça) e desativar ---------- */
function romLotear(i,quiet){
  const r=estadoRomaneio.ROM&&estadoRomaneio.ROM.rows[i];if(!r)return;
  if(r.lote||r.loteDe){if(!quiet)toast("Este item já é um lote.");return}
  if(r.feito||(r.lancIds||[]).length){toast("Este item já foi lançado: revogue o lançamento antes de transformá-lo em lote.");return}
  if(Array.isArray(r.conjComp)){toast("Desfaça o conjunto antes de transformar o item em lote.");return}
  const qtd=Math.max(1,Math.min(60,Math.trunc(num(r.qtd)||1))),cu=num(r.custo)||0,pesoUn=num(r.peso)||0;
  r.lote=true;r.lid=uid();r.semPeso=true;r.und="";r.total=r2c(cu*qtd);r.loteG=null;r.precoG=null;r.ratear=true;r.qtdAntes=r.qtd;r.skip=true;r.aviso="lote: pese as peças";
  r.custoUn=r.custo;r.pesoUn=r.peso;r.peso="";r.q={};
  romLoteAdd(r,qtd,pesoUn>0?pesoUn:null);
  if(!quiet)toast(`${qtd} item(ns) criados no lote, numerados 1/${qtd}. Pese cada um: o valor do lote (R$ ${brl(r.total)}) se reparte pelo peso.`)}
function romLoteOff(i){
  const lot=estadoRomaneio.ROM&&estadoRomaneio.ROM.rows[i];if(!lot||!lot.lote)return;
  const kids=romLoteKids(lot);
  if(kids.some(k=>k.feito||(k.lancIds||[]).length)){toast("Há itens deste lote já lançados: revogue os lançamentos antes de desativar o lote.");return}
  if(kids.length&&!confirm(`Desativar o lote? Os ${kids.length} item(ns) criados nele serão removidos e volta um cartão comum.`))return;
  estadoRomaneio.ROM.rows=estadoRomaneio.ROM.rows.filter(x=>x.loteDe!==lot.lid);
  const n=lot.semPeso?(lot.qtdAntes||kids.length||1):1,tot=lot.total!=null?lot.total:(lot.loteG||0)*(lot.precoG||0);
  lot.qtd=n;lot.custo=lot.custoUn!=null&&lot.semPeso?lot.custoUn:virg(r2c(tot/n));lot.peso=lot.semPeso?(lot.pesoUn||""):(lot.loteG?g3(lot.loteG):"");
  ["lote","lid","semPeso","und","loteG","precoG","ratear","pesoReal","qtdAntes","custoUn","pesoUn"].forEach(k=>delete lot[k]);
  lot.skip=false;lot.aviso="";lot.q={};
  romSalvarSoon();renderRom();toast("Lote desativado: o item voltou a ser um cartão comum.")}

