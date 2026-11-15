/* ===== persistência ===== */
let db=null,dirty={c:false,l:false};
const setStatus=(t,bad)=>{const s=document.getElementById("saveStatus");s.textContent=t;s.classList.toggle("bad",!!bad)};
/* histórico de desfazer/refazer (até 30 passos): cada gravação compara o estado com o anterior e guarda o "antes" */
const HIST=[],REDO=[];let conflito=false;
/* estado que so a fatia usa (antes globais soltos): fotografia do formulario no historico, dados danificados, avisos de memoria e bloqueio de uso entre abas */
const estadoArmazenamento={snapF:null,snapE:false,rawCorrompido:"",avisoMem:0,avisoIdbT:0,bkUsoLiberar:null,bkUsoPedido:null,
  sT:null,chain:Promise.resolve(),snapL:null,snapC:null,restaurando:false,corrompido:false,ftSalvas:new Set(),histSep:false,
  romGravP:null,romST:null,romTem:false,romInfo:"",romArm:null,tabArm:null,AUTOR:"",ARQ:{}};
function histIni(){estadoArmazenamento.snapL=JSON.stringify(S.lanc);estadoArmazenamento.snapC=JSON.stringify(S.config);estadoArmazenamento.snapF=JSON.stringify(S.form);estadoArmazenamento.snapE=!!editId;undoBtns()}
function undoBtns(){const u=document.getElementById("btnUndo"),r=document.getElementById("btnRedo");if(u){u.disabled=!HIST.length;u.title=HIST.length?`Desfazer a última alteração (Ctrl+Z) — ${HIST.length} passo(s) guardado(s)`:"Nada para desfazer"}if(r){r.disabled=!REDO.length;r.title=REDO.length?`Refazer (Ctrl+Y) — ${REDO.length} passo(s)`:"Nada para refazer"}}
function histTam(){return HIST.reduce((t,e)=>t+e.L.length+e.C.length+(e.R?JSON.stringify(e.R).length:0),0)}
function histNota(){
  if(estadoArmazenamento.restaurando||estadoArmazenamento.snapL===null)return;
  const L=JSON.stringify(S.lanc),C=JSON.stringify(S.config),F=JSON.stringify(S.form);
  if(L!==estadoArmazenamento.snapL||C!==estadoArmazenamento.snapC){
    const soCfg=L===estadoArmazenamento.snapL,agora=Date.now(),topo=HIST[HIST.length-1];
    const mesmo=topo&&!topo.R&&agora-topo.t<80,digitando=!estadoArmazenamento.histSep&&soCfg&&topo&&topo.soCfg&&agora-topo.t<1500;
    if(mesmo||digitando){   /* mesma ação (várias gravações seguidas) ou digitação num campo de cadastro: um passo só */
      if(mesmo){topo.soCfg=topo.soCfg&&soCfg;if(F!==estadoArmazenamento.snapF&&!topo.F)topo.F=estadoArmazenamento.snapF}
      topo.t=agora}
    else{
      HIST.push({L:estadoArmazenamento.snapL,C:estadoArmazenamento.snapC,F:F!==estadoArmazenamento.snapF?estadoArmazenamento.snapF:null,E:estadoArmazenamento.snapE,soCfg,t:agora});
      while(HIST.length>60||(HIST.length>1&&histTam()>40e6))HIST.shift()}
    REDO.length=0;estadoArmazenamento.snapL=L;estadoArmazenamento.snapC=C}
  estadoArmazenamento.snapF=F;estadoArmazenamento.snapE=!!editId;undoBtns();
}
function salvar(c,l){try{fixarRefs()}catch(e){}if(c){dirty.c=true;try{impactoAgendar()}catch(e){}}if(l!==false)dirty.l=true;try{histNota()}catch(e){}clearTimeout(estadoArmazenamento.sT);setStatus("Salvando…");estadoArmazenamento.sT=setTimeout(()=>{estadoArmazenamento.sT=null;estadoArmazenamento.chain=estadoArmazenamento.chain.then(flush)},600)}
/* para quem grava ja (cadastros, 36): cancela a gravacao agendada e encadeia um flush; devolve a promessa encadeada */
function salvarCancelarAgendado(){clearTimeout(estadoArmazenamento.sT);estadoArmazenamento.sT=null}
function salvarEncadear(){estadoArmazenamento.chain=estadoArmazenamento.chain.then(flush);return estadoArmazenamento.chain}
/* grava já (ao fechar a aba, trocar de aba ou sair): não deixa a última edição dentro dos 600 ms se perder */
function flushJa(){if(estadoArmazenamento.romST){clearTimeout(estadoArmazenamento.romST);estadoArmazenamento.romST=null;try{romSalvar()}catch(e){}}   /* romaneio: o salvamento de 800 ms também não pode ficar para trás */
  if(estadoArmazenamento.sT){clearTimeout(estadoArmazenamento.sT);estadoArmazenamento.sT=null}if(dirty.c||dirty.l){try{flush()}catch(e){}}}
window.addEventListener("pagehide",flushJa);
window.addEventListener("beforeunload",flushJa);
/* só avisa quando há uma célula aberta com texto digitado que ainda não foi confirmado (Enter/Tab) */
window.addEventListener("beforeunload",e=>{try{const i=document.getElementById("celIn");if((celEd&&i&&i.value!==celEd.orig)||dirty.c||dirty.l||conflito||estadoArmazenamento.corrompido){e.preventDefault();e.returnValue="";return ""}   /* dirty só fica ligado quando a gravação falhou (memória cheia, outra aba, dados danificados) */}catch(x){}});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flushJa()});
/* miniaturas (ft) ficam no IndexedDB ("m:"+id); no JSON do armazenamento local (dadoLer/dadoGravar) vão sem elas, para não estourar a memória do navegador */
function jsonLocal(tudo){const lanc=tudo?S.lanc:S.lanc.map(l=>{let o=l;if(o.ft&&estadoArmazenamento.ftSalvas.has(l.id))o={...o,ft:undefined,ftIdb:1};if(o.ftR&&ftRSalvas.has(l.id))o={...o,ftR:undefined,ftRIdb:1};return o});const rasc=editId&&rascunho?(JSON.stringify(rascunho).length>2e5?{...rascunho,ft:undefined}:rascunho):null;   /* o que estava no formulário antes de começar a editar uma peça */
  return JSON.stringify({config:S.config,lanc,form:S.form,edit:editId||null,rasc})}
async function guardarMinis(){let ok=true;for(const l of S.lanc){if(l.ft&&!estadoArmazenamento.ftSalvas.has(l.id)){const v0=l.ft,r=await bancoGravar("fotos","m:"+l.id,v0);if(r!==null&&l.ft===v0)estadoArmazenamento.ftSalvas.add(l.id);else ok=false}
    if(l.ftR&&!ftRSalvas.has(l.id)){const v0=l.ftR,r=await bancoGravar("fotos","r:"+l.id,v0);if(r!==null&&l.ftR===v0)ftRSalvas.add(l.id);else ok=false}}return ok}
async function flush(){   /* devolve true só quando a gravação foi confirmada */
  const d={...dirty};dirty={c:false,l:false};
  if(estadoArmazenamento.corrompido){dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;armEmitir("conflito",{texto:"Os dados salvos estavam danificados — NADA está sendo salvo até você escolher uma opção no aviso.",erro:true});return false}
  if(conflito){dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;armEmitir("conflito",{texto:"Outra aba alterou os dados — esta aba NÃO está salvando. Recarregue.",erro:true});return false}
  let remoto=true;
  try{
    if(db){if(d.c)await db.doc("dados/config").set({v:4,config:S.config});if(conflito)throw new Error("conflito");if(d.l)await db.doc("dados/lancamentos").set({v:4,lanc:S.lanc,form:S.form})}
  }catch(e){remoto=false;console.error("cadastro-pecas: falha ao gravar na conta",e);dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;armEmitir("erro",{texto:"Não consegui salvar agora — tento de novo na próxima alteração",erro:true})}
  if(!remoto)return false;
  if(conflito){dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;armEmitir("conflito",{texto:"Outra aba alterou os dados — esta aba NÃO está salvando. Recarregue.",erro:true});return false}
  let local=true;
  try{dadoGravar("cadpecas4",jsonLocal(false))}catch(e){
    local=false;
    try{if(await guardarMinis()&&!conflito){dadoGravar("cadpecas4",jsonLocal(false));local=true}}catch(e2){local=false;console.error("cadastro-pecas: falha ao gravar neste navegador",e2)}}
  if(!local){dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;
    const m="NÃO salvo — memória do navegador cheia. Baixe o backup (Romaneios > Backup completo).";
    let avisar=false;if(!db&&Date.now()-estadoArmazenamento.avisoMem>20000){estadoArmazenamento.avisoMem=Date.now();avisar=true}
    armEmitir("cota",{texto:db?"Salvo na sua conta, mas NÃO neste navegador (memória cheia)":m,erro:true,toast:avisar?m:undefined});
    return false}
  armEmitir("salvo",{texto:db?"Salvo na sua conta":"Salvo neste navegador",erro:false});
  if(candFoto.size)varrerFotos();
  if(S.lanc.some(l=>(l.ft&&!estadoArmazenamento.ftSalvas.has(l.id))||(l.ftR&&!ftRSalvas.has(l.id)))){guardarMinis().then(ok=>{if(!conflito&&S.lanc.some(l=>(estadoArmazenamento.ftSalvas.has(l.id)&&l.ft)||(ftRSalvas.has(l.id)&&l.ftR))){try{dadoGravar("cadpecas4",jsonLocal(false))}catch(e){}}})}
  return true
}
async function pontoSalvar(motivo,snap){try{const t=Date.now(),v={t,motivo:motivo||"automático",n:snap?snap.n:S.lanc.length,json:snap?snap.json:jsonLocal(false)};const r=await bancoGravar("pontos","p:"+t,v);if(r===null)return false;const ks=((await bancoChaves("pontos"))||[]).filter(k=>String(k).startsWith("p:")).sort();for(const k of ks.slice(0,Math.max(0,ks.length-PONTOS_MAX)))await bancoApagar("pontos",k);await pontosIds();return true}catch(e){return false}}
async function pontoAuto(motivo,forcar){const snap={n:S.lanc.length,json:jsonLocal(false)};   /* estado de ANTES da operação, capturado já */
  try{const ks=((await bancoChaves("pontos"))||[]).filter(k=>String(k).startsWith("p:")).sort(),ult=ks.length?+String(ks[ks.length-1]).slice(2):0;if(!forcar&&Date.now()-ult<PONTO_INTERVALO)return true;if(!snap.n&&!forcar)return true;return await pontoSalvar(motivo,snap)}catch(e){return false}}
const pontoAviso=p=>p.then(ok=>{if(ok===false)toast("Atenção: NÃO consegui guardar o ponto de restauração (memória do navegador cheia?). Se precisar, use Desfazer agora.",{t:"Desfazer",fn:desfazer})})
setInterval(()=>{if(S.lanc.length)pontoAuto("automático (a cada 30 min de uso)")},5*60*1000);
async function bkPasta(){const h=await bancoLer("pontos","pasta");return h&&typeof h==="object"&&h.kind==="directory"?h:null}
async function bkEscrever(h){const {o,falhas,hoje}=await bkMontar();
  /* Uma cópia incompleta ou que o próprio aplicativo não consegue restaurar não substitui as últimas cópias boas. */
  if(falhas.length)return "incompleto";
  const json=JSON.stringify(o);if(new Blob([json],{type:"application/json"}).size>MAX_BACKUP_BYTES)return "grande-demais";
  const nome=`cadastro-pecas-auto-${hoje}.json`,fh=await h.getFileHandle(nome,{create:true}),w=await fh.createWritable();await w.write(json);await w.close();
  try{const ns=[];for await(const [n] of h.entries())if(/^cadastro-pecas-auto-\d{4}-\d{2}-\d{2}\.json$/.test(n))ns.push(n);ns.sort();for(const n of ns.slice(0,Math.max(0,ns.length-BK_DIAS)))await h.removeEntry(n)}catch(e){}
  try{prefGravar("backupUltimo",String(Date.now()))}catch(e){}return nome}
async function bkAuto(pedir,forcar){const h=await bkPasta();if(!h)return null;
  if(!forcar){let u=0;try{u=+prefLer("backupUltimo")||0}catch(e){}if(Date.now()-u<BK_INTERVALO)return "recente"}
  if(!(await bkPerm(h,pedir)))return "perm";try{const r=await bkEscrever(h);if(r==="incompleto")toast("Backup automático NÃO concluído: não foi possível conferir todos os dados. As cópias anteriores foram mantidas.");if(r==="grande-demais")toast("Backup automático NÃO concluído: o arquivo ultrapassa o limite de restauração. Use o backup manual e confira a opção leve.");return r}catch(e){console.error("cadastro-pecas: backup em pasta falhou",e);return "erro"}}
setInterval(()=>{if(S.lanc.length)bkAuto(false)},10*60*1000);
async function bkStatus(){const el=document.getElementById("bkStatus");if(!el)return;
  if(typeof showDirectoryPicker!=="function"&&!(await bkPasta())){el.innerHTML=`<span class="warn">Este navegador não deixa escolher pasta. Use o Chrome ou o Edge, ou a cópia manual abaixo.</span>`;return}
  const h=await bkPasta();if(!h){el.textContent="Desligado. Escolha uma pasta para ligar.";return}
  const ok=await bkPerm(h,false);let u=0;try{u=+prefLer("backupUltimo")||0}catch(e){}
  el.innerHTML=`Pasta: <b>${esc(h.name)}</b> · ${ok?"permissão ok":`<span class="warn">o navegador pede permissão de novo</span> <button type="button" class="btn sm" data-act="bk-perm">Permitir</button>`} · último backup: ${u?esc(new Date(u).toLocaleString("pt-BR")):"ainda não"}`}
async function pontosCarregar(){bkStatus();const el=document.getElementById("pontosLista");if(!el)return;const ks=((await bancoChaves("pontos"))||[]).filter(k=>String(k).startsWith("p:")).sort().reverse(),out=[];for(const k of ks){const v=await bancoLer("pontos",k);if(v&&typeof v==="object")out.push({k,t:v.t,motivo:v.motivo,n:v.n})}
  const el2=document.getElementById("pontosLista");if(!el2)return;el2.innerHTML=out.length?out.map(p=>`<div class="pt"><span><b>${esc(new Date(p.t).toLocaleString("pt-BR"))}</b> · ${p.n} peça(s) <small>${esc(p.motivo)}</small></span><button type="button" class="btn sm" data-act="ponto-voltar" data-k="${esc(p.k)}">Voltar para este ponto</button></div>`).join(""):`<span class="hint">Ainda não há pontos. Um é criado ao abrir o app e a cada 30 minutos de uso, e antes de excluir várias linhas.</span>`}
async function pontoRestaurar(k){const v=await bancoLer("pontos",k);if(!v||typeof v!=="object"||!v.json){toast("Esse ponto não pode ser lido.");return}
  const q=new Date(v.t).toLocaleString("pt-BR");if(!confirm(`Voltar para ${q} (${v.n} peça(s))?\n\nO que está agora fica guardado como outro ponto, e dá para voltar a ele.\n\nAs fotos não voltam no tempo: ficam as que estão guardadas agora.`))return;
  if(!(await pontoSalvar("antes de voltar no tempo"))&&!confirm("NÃO consegui guardar o que está agora como ponto (memória do navegador cheia ou bloqueada).\n\nSe continuar, o estado atual será perdido. Voltar mesmo assim?"))return;
  try{const o=JSON.parse(v.json);S.config=lerConfig(o.config);S.lanc=(o.lanc||[]).map(lerLanc);S.form=o.form&&o.form.v?lerForm(o.form):FORM0();editId=null;rascunho=null;sel.clear();estadoPlanilha.selR=null;estadoArmazenamento.ftSalvas.clear();ftRSalvas.clear();try{migrarJueri();migrarGrades()}catch(e){}sincGrade(S.form);salvar(true);render();histIni();carregarMinis();toast("Voltei no tempo: "+q)}catch(e){toast("Não consegui voltar para esse ponto.")}}
async function pedirPersistencia(){try{if(!navigator.storage||!navigator.storage.persist)return;let ja=false;try{ja=await navigator.storage.persisted()}catch(e){}if(ja)return;const ok=await navigator.storage.persist();if(ok)return;let pasta=null;try{pasta=await bkPasta()}catch(e){}if(pasta)return;let av=null;try{av=prefLer("persistAviso")}catch(e){}if(av==="1")return;try{prefGravar("persistAviso","1")}catch(e){}toast("O navegador não garante guardar estes dados para sempre. Ligue o backup em pasta (Importar e backup) para não perder nada.")}catch(e){}} async function carregarMinis(){setTimeout(pedirPersistencia,3000);setTimeout(()=>pontoAuto("ao abrir o app"),5000);setTimeout(()=>bkAuto(false),8000);const ls=S.lanc.filter(l=>l.ftIdb&&!l.ft);let n=0;for(const l of ls){const u=await bancoLer("fotos","m:"+l.id);if(typeof u==="string"&&/^data:image\//.test(u)){l.ft=u;estadoArmazenamento.ftSalvas.add(l.id);n++}}
  for(const l of S.lanc.filter(x=>x.ftRIdb&&!x.ftR)){const u=await bancoLer("fotos","r:"+l.id);if(typeof u==="string"&&/^data:image\//.test(u)){l.ftR=u;ftRSalvas.add(l.id);n++}}
  if(await migrarFotos())n++;
  if(n){try{renderTopo()}catch(e){}}}
/* peças lançadas antes da coluna "Foto do romaneio": a foto guardada era a do romaneio (sem original anexado) e passa para a coluna certa; uma vez só */
async function migrarFotos(){let mexeu=0;
  for(const l of S.lanc){if(l.ftMig||!l.ft||l.ftR)continue;
    const big=await bancoLer("fotos",l.id);l.ftMig=1;
    if(typeof big==="string"&&/^data:image\//.test(big))continue;
    l.ftR=l.ft;ftRSalvas.delete(l.id);
    if(vazio(l.v&&l.v.B)){delete l.ft;delete l.ftIdb;estadoArmazenamento.ftSalvas.delete(l.id);bancoApagar("fotos","m:"+l.id)}
    mexeu++}
  if(mexeu){salvar(true);toast(`${mexeu} foto(s) de peças antigas foram para a coluna “Foto do romaneio”.`,{t:"Desfazer",fn:desfazer})}
  return mexeu}
/* Uma vez por conta: traz as categorias do Jueri (renomeia Anéis→Anél, acrescenta as que faltam, ajusta subcategorias) sem apagar o que você cadastrou nem as peças já lançadas. */
/* Uma vez por conta: a variação (tamanhos de anel etc.) passa para dentro da categoria, cada banho ganha a marca de verniz e some o que estava fora do lugar (observação na lista de cores). */
/* v11: a tabela passa a mostrar as peças na ordem em que foram lançadas (a opção "A depois B" continua disponível) */
/* "Anél" era um erro de português: a categoria passa a se chamar "Anel" (peças, rascunho e romaneios salvos acompanham). A planilha também passa a usar "Anel"; outros nomes de exportação definidos pelo usuário são preservados. */
function migrarAnel(){const C=cfg(),existente=(C.categorias||[]).find(x=>x.nome==="Anel"&&x.nomeExport==="Anél");if(existente)delete existente.nomeExport;const c=(C.categorias||[]).find(x=>x.nome==="Anél");if(!c||C.categorias.some(x=>x.nome==="Anel"))return !!existente;
  c.nome="Anel";if(c.nomeExport==="Anél")delete c.nomeExport;
  S.lanc.forEach(l=>{if(l.v&&l.v.I==="Anél")l.v.I="Anel"});if(S.form&&S.form.v&&S.form.v.I==="Anél")S.form.v.I="Anel";if(typeof rascunho!=="undefined"&&rascunho&&rascunho.v&&rascunho.v.I==="Anél")rascunho.v.I="Anel";
  C.catAlias=C.catAlias||{};C.catAlias["Anél"]="Anel";
  (C.insumosItens||[]).forEach(x=>{if(x.cat==="Anél")x.cat="Anel"});(C.categorias||[]).forEach(x=>{if(x.grade&&x.grade.usa==="Anél")x.grade.usa="Anel"});
  (C.romaneios||[]).forEach(T=>{if(T&&typeof T.mapa==="string")T.mapa=T.mapa.replace(/=\s*Anél(?=\s*[;>]|\s*$)/g,"=Anel")});
  return true}
function migrarGrades(){const a0=migrarAnel(),a=migrarGrades0()||a0,C=cfg();let m=a;
  if(!C.v11){C.ordem="int";C.v11=true;m=true}
  /* v12: a variação de anel passa a ter os tamanhos 11 a 25 (os que já existem e suas letras não mudam) */
  if(!C.v12){C.categorias.forEach(c=>{const g=c.grade;if(!g||!(/^aro/.test(g.id)||/anel|anéis|aro/i.test(g.nome||"")))return;
    for(let n=11;n<=25;n++){const nm=String(n);if(!g.itens.some(x=>String(x.nome)===nm)){let id="a"+nm;if(g.itens.some(x=>x.id===id))id=uid();g.itens.push({id,letra:proxLetra(g.itens.map(x=>x.letra)),nome:nm})}}
    g.itens.sort((x,y)=>(parseFloat(x.nome)||0)-(parseFloat(y.nome)||0))});C.v12=true;m=true}
  return m}
/* aceita lançamentos das versões anteriores */
/* dados salvos que não dá para ler: NÃO apaga nem sobrescreve nada até a pessoa escolher (baixar cópia, restaurar backup ou começar vazio) */
function resolverCorrompido(){estadoArmazenamento.corrompido=false;estadoArmazenamento.rawCorrompido="";const b=document.getElementById("dadosRuins");if(b)b.remove()}
function dadosCorrompidos(raw){
  estadoArmazenamento.corrompido=true;estadoArmazenamento.rawCorrompido=raw;let guardou=false,baixou=false;
  try{dadoGravar("cadpecas4-corrompido",raw);guardou=true}catch(e){}
  const b=document.createElement("div");b.id="dadosRuins";b.setAttribute("role","alert");
  b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:100000;background:#fdecea;color:#7a1c12;border-bottom:3px solid #c0392b;padding:12px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font:14px system-ui,sans-serif";
  b.innerHTML=`<b>Não consegui ler os dados salvos neste navegador.</b><span>Eles NÃO foram apagados e nada será salvo por cima até você escolher o que fazer. ${guardou?"Uma cópia deles foi guardada à parte no navegador.":"Não coube guardar uma cópia no navegador: baixe uma agora."}</span><button type="button" class="btn sm" id="drBaixar">Baixar cópia dos dados</button><button type="button" class="btn pri sm" id="drRest">Restaurar de um backup…</button><button type="button" class="btn sm danger" id="drVazio" title="Começa do zero. Os dados danificados deixam de ser usados.">Começar vazio</button><input type="file" id="drArq" accept=".json,application/json" class="vh">`;
  document.body.appendChild(b);
  document.getElementById("drBaixar").onclick=()=>{try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([estadoArmazenamento.rawCorrompido],{type:"application/json"}));a.download="cadastro-pecas-dados-danificados.json";document.body.appendChild(a);a.click();baixou=true;setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}catch(e){toast("Não consegui baixar a cópia.")}};
  document.getElementById("drRest").onclick=()=>document.getElementById("drArq").click();
  document.getElementById("drArq").onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(f)restaurarTotal(f)};
  document.getElementById("drVazio").onclick=()=>{if(!guardou&&!baixou&&!confirm("Os dados danificados ainda não foram copiados em lugar nenhum. Começar vazio vai perdê-los de vez. Continuar?"))return;
    resolverCorrompido();salvar(true);toast("Começando vazio."+(guardou?" A cópia dos dados antigos ficou guardada à parte no navegador.":""))};
}
async function carregar(){
  let raw=null;
  try{raw=dadoLer("cadpecas4")||dadoLer("cadpecas3");if(raw){const o=JSON.parse(raw);if(!ehObj(o)||(o.lanc!=null&&!Array.isArray(o.lanc)))throw new Error("formato");
    const cf=lerConfig(o.config),la=(o.lanc||[]).map(lerLanc).map((l,i,a)=>(l&&a.findIndex(x=>x&&x.id===l.id)<i)?{...l,id:uid()}:l),   /* id repetido no armazenamento: a repetida ganha id novo */
      fo=lerForm(o.form),rc=o.rasc&&ehObj(o.rasc)&&o.rasc.v?lerForm(o.rasc):null;
    S.config=cf;S.lanc=la;S.form=fo;
    if(o.edit&&la.some(l=>l.id===o.edit)){editId=o.edit;rascunho=rc||FORM0()}   /* recarregou no meio de uma edição: volta o que estava no formulário antes */
    else if(o.edit&&rc)S.form=rc}}
  catch(e){if(raw)dadosCorrompidos(raw)}
  {const m1=migrarJueri(),m2=migrarGrades();sincGrade(S.form);if(m1||m2)salvar(true)}
  render();histIni();carregarMinis();
  const tm=setTimeout(()=>setStatus("Ainda conectando à sua conta… pode lançar normalmente"),10000);
  try{db=window.claude&&window.claude.use?await window.claude.use("db"):null}catch(e){db=null}
  if(!db){clearTimeout(tm);setStatus("Salvando neste navegador");return}
  try{
    const [c,l]=await Promise.all([db.doc("dados/config").get(),db.doc("dados/lancamentos").get()]);clearTimeout(tm);
    if(c.exists)S.config=lerConfig(c.data().config);
    if(l.exists){const d=l.data();S.lanc=(d.lanc||[]).map(lerLanc);if(d.form&&d.form.v)S.form=lerForm(d.form)}
    if(c.exists||l.exists)resolverCorrompido();   /* dados lidos da conta: o bloqueio dos dados locais danificados não vale mais */
    const m1=migrarJueri(),m2=migrarGrades(),mig=m1||m2;sincGrade(S.form);if(mig)salvar(true);
    setStatus(mig?"Cadastros atualizados (variação dentro da categoria)":c.exists?"Cadastros carregados":"Pronto — tudo fica salvo na sua conta");render();histIni();carregarMinis();romSync();
  }catch(e){clearTimeout(tm);db=null;console.error("cadastro-pecas: falha ao ler a conta",e);setStatus("Sem acesso à conta agora; salvando neste navegador",true)}
}

