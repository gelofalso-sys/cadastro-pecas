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
const romInsBase=()=>ROM&&ROM.ins&&["un","custo","peso"].includes(ROM.ins.base)?ROM.ins.base:"un";
const romInsTotal=()=>r2c(romInsItens().reduce((t,x)=>t+(num(x.valor)||0),0));
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
function romInsResumoTxt(){
  const it=romInsItens(),T=romInsTotal(),c=romInsCtx(),b=romInsBase();
  if(!it.length)return "Nenhum insumo próprio neste romaneio. Os insumos de cada categoria (Cadastros) continuam valendo normalmente.";
  if(!(T>0))return "Informe o valor de cada insumo.";
  if(!(c.un>0))return `Total R$ ${brl(T)}. Ainda não há peças com quantidade para receber o rateio.`;
  const base=b==="un"?`${fmt(c.un)} unidades → R$ ${brl(r2c(T/c.un))} por unidade`:b==="custo"?`proporcional à compra (R$ ${brl(r2c(c.custo))} no total): cada R$ 1,00 de compra recebe R$ ${brl(r2c(T/c.custo))}`:`proporcional ao peso (${fmt(Math.round(c.peso*1000)/1000)} g no total): cada grama recebe R$ ${brl(Math.round(T/c.peso*10000)/10000)}`;
  return `Total R$ ${brl(T)} dividido entre ${fmt(c.un)} unidade(s) — ${base}. Entra no custo de Insumos de cada peça, somado ao padrão da categoria; os centavos são arredondados por peça.`}
function romInsHTML(){
  const it=romInsItens(),b=romInsBase();
  return `<details class="gdet rom-ins" data-open="rins" ${abertos.rins||it.length||romInsSugestoes().length?"open":""}><summary><b>Insumos deste romaneio</b><span>${it.length?`${it.length} item(ns) · R$ ${brl(romInsTotal())} rateados nas peças`:(romInsSugestoes().length?"⚠ o romaneio traz frete/separação que ainda não entra no custo":"embalagem, etiquetas, frete próprio… divididos entre as peças criadas")}</span></summary><div class="gb">
    <p class="hint">Use para gastos que valem para este romaneio inteiro. O total é dividido entre as peças que serão criadas e entra no custo de Insumos de cada uma (somado ao padrão da categoria). Dá para conferir a conta na célula de Insumos da tabela.</p>
    ${it.length?`<div class="tw"><table class="cfg"><thead><tr><th>Insumo</th><th class="n">Valor total (R$)</th><th></th></tr></thead><tbody>${it.map((x,i)=>`<tr><td><input data-rp="rins" data-k="nome" data-i="${i}" value="${esc(x.nome||"")}" maxlength="80" placeholder="ex.: caixas, etiquetas" aria-label="Nome do insumo ${i+1}"></td><td style="width:150px"><input class="n" data-rp="rins" data-k="valor" data-i="${i}" value="${esc(x.valor||"")}" inputmode="decimal" aria-label="Valor total do insumo ${i+1}"></td><td style="width:36px"><button type="button" class="x" data-act="rins-del" data-i="${i}" aria-label="Excluir o insumo ${i+1}">×</button></td></tr>`).join("")}</tbody></table></div>`:""}
    ${romInsSugestoes().map((x,i)=>`<div class="rins-sug" role="note"><span>O romaneio traz <b>${esc(x.nome)}: R$ ${esc(x.valor)}</b> — hoje isso não entra no custo das peças.</span><button type="button" class="btn sm pri" data-act="rins-sug" data-k="${esc(x.nome)}">Ratear nas peças</button></div>`).join("")}
    <div class="row"><button type="button" class="btn sm" data-act="rins-add">＋ Insumo do romaneio</button>${it.length?`<label class="fq"><span>Como dividir</span><select data-rp="rins" data-k="base" aria-label="Como dividir os insumos do romaneio"><option value="un" ${b==="un"?"selected":""}>Igual por unidade</option><option value="custo" ${b==="custo"?"selected":""}>Proporcional à compra</option><option value="peso" ${b==="peso"?"selected":""}>Proporcional ao peso</option></select></label>`:""}</div>
    <div class="rins-res" id="rinsRes" role="status">${esc(romInsResumoTxt())}</div></div></details>`}
/* frete e custo de separação que aparecem no texto do romaneio viram sugestão de insumo (um clique para aceitar) */
function romInsSugestoes(){
  if(!ROM||!ROM.texto)return [];const tx=String(ROM.texto),out=[],ja=romInsItens().map(x=>String(x.nome||"").toLowerCase());
  [["Custo de separação",/custo\s+separa[cç][aã]o\s*:?\s*R\$\s*([\d.]+,\d{2})/i],["Frete",/frete\s*:?\s*R\$\s*([\d.]+,\d{2})/i]].forEach(([nome,re])=>{
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
  if(!ROM)return;const res=document.getElementById("rinsRes");if(res)res.textContent=romInsResumoTxt();
  const ctx=romInsCtx();
  ROM.rows.forEach((r,i)=>{if(r.lote)return;const rc=document.querySelector(`#romWrap .rc[data-i="${i}"]`),ch=rc&&rc.querySelector("[data-rins-c]");if(!ch)return;const v=romInsRateio(r,ctx);ch.hidden=!(v>0);if(v>0)ch.textContent=`+ insumos do romaneio R$ ${brl(v)}/un`})}
