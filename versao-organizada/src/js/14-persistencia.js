/* ===== persistência ===== */
let db=null,dirty={c:false,l:false},sT=null,chain=Promise.resolve();
const setStatus=(t,bad)=>{const s=document.getElementById("saveStatus");s.textContent=t;s.classList.toggle("bad",!!bad)};
/* histórico de desfazer/refazer (até 30 passos): cada gravação compara o estado com o anterior e guarda o "antes" */
let HIST=[],REDO=[],snapL=null,snapC=null,snapF=null,snapE=false,restaurando=false,conflito=false,corrompido=false,rawCorrompido="",ftSalvas=new Set(),avisoMem=0;
function histIni(){snapL=JSON.stringify(S.lanc);snapC=JSON.stringify(S.config);snapF=JSON.stringify(S.form);snapE=!!editId;undoBtns()}
function undoBtns(){const u=document.getElementById("btnUndo"),r=document.getElementById("btnRedo");if(u){u.disabled=!HIST.length;u.title=HIST.length?`Desfazer a última alteração (Ctrl+Z) — ${HIST.length} passo(s) guardado(s)`:"Nada para desfazer"}if(r){r.disabled=!REDO.length;r.title=REDO.length?`Refazer (Ctrl+Y) — ${REDO.length} passo(s)`:"Nada para refazer"}}
function histTam(){return HIST.reduce((t,e)=>t+e.L.length+e.C.length,0)}
let histSep=false;
function histNota(){
  if(restaurando||snapL===null)return;
  const L=JSON.stringify(S.lanc),C=JSON.stringify(S.config),F=JSON.stringify(S.form);
  if(L!==snapL||C!==snapC){
    const soCfg=L===snapL,agora=Date.now(),topo=HIST[HIST.length-1];
    const mesmo=topo&&agora-topo.t<80,digitando=!histSep&&soCfg&&topo&&topo.soCfg&&agora-topo.t<1500;
    if(mesmo||digitando){   /* mesma ação (várias gravações seguidas) ou digitação num campo de cadastro: um passo só */
      if(mesmo){topo.soCfg=topo.soCfg&&soCfg;if(F!==snapF&&!topo.F)topo.F=snapF}
      topo.t=agora}
    else{
      HIST.push({L:snapL,C:snapC,F:F!==snapF?snapF:null,E:snapE,soCfg,t:agora});
      while(HIST.length>60||(HIST.length>1&&histTam()>40e6))HIST.shift()}
    REDO.length=0;snapL=L;snapC=C}
  snapF=F;snapE=!!editId;undoBtns();
}
function salvar(c,l){if(c)dirty.c=true;if(l!==false)dirty.l=true;try{histNota()}catch(e){}clearTimeout(sT);setStatus("Salvando…");sT=setTimeout(()=>{sT=null;chain=chain.then(flush)},600)}
/* grava já (ao fechar a aba, trocar de aba ou sair): não deixa a última edição dentro dos 600 ms se perder */
function flushJa(){if(romST){clearTimeout(romST);romST=null;try{romSalvar()}catch(e){}}   /* romaneio: o salvamento de 800 ms também não pode ficar para trás */
  if(sT){clearTimeout(sT);sT=null}if(dirty.c||dirty.l){try{flush()}catch(e){}}}
window.addEventListener("pagehide",flushJa);
window.addEventListener("beforeunload",flushJa);
/* só avisa quando há uma célula aberta com texto digitado que ainda não foi confirmado (Enter/Tab) */
window.addEventListener("beforeunload",e=>{try{const i=document.getElementById("celIn");if(celEd&&i&&i.value!==celEd.orig){e.preventDefault();e.returnValue="";return ""}}catch(x){}});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flushJa()});
/* miniaturas (ft) ficam no IndexedDB ("m:"+id); no JSON do localStorage vão sem elas, para não estourar a memória do navegador */
const ftRSalvas=new Set();
function jsonLocal(tudo){const lanc=tudo?S.lanc:S.lanc.map(l=>{let o=l;if(o.ft&&ftSalvas.has(l.id))o={...o,ft:undefined,ftIdb:1};if(o.ftR&&ftRSalvas.has(l.id))o={...o,ftR:undefined,ftRIdb:1};return o});const rasc=editId&&rascunho?(JSON.stringify(rascunho).length>2e5?{...rascunho,ft:undefined}:rascunho):null;   /* o que estava no formulário antes de começar a editar uma peça */
  return JSON.stringify({config:S.config,lanc,form:S.form,edit:editId||null,rasc})}
async function guardarMinis(){let ok=true;for(const l of S.lanc){if(l.ft&&!ftSalvas.has(l.id)){const v0=l.ft,r=await idbPut("fotos","m:"+l.id,v0);if(r!==null&&l.ft===v0)ftSalvas.add(l.id);else ok=false}
    if(l.ftR&&!ftRSalvas.has(l.id)){const v0=l.ftR,r=await idbPut("fotos","r:"+l.id,v0);if(r!==null&&l.ftR===v0)ftRSalvas.add(l.id);else ok=false}}return ok}
async function flush(){
  const d={...dirty};dirty={c:false,l:false};
  if(corrompido){dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;setStatus("Os dados salvos estavam danificados — NADA está sendo salvo até você escolher uma opção no aviso.",true);return}
  if(conflito){dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;setStatus("Outra aba alterou os dados — esta aba NÃO está salvando. Recarregue.",true);return}
  let remoto=true;
  try{
    if(db){if(d.c)await db.doc("dados/config").set({v:4,config:S.config});if(conflito)throw new Error("conflito");if(d.l)await db.doc("dados/lancamentos").set({v:4,lanc:S.lanc,form:S.form})}
  }catch(e){remoto=false;console.error("cadastro-pecas: falha ao gravar na conta",e);dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;setStatus("Não consegui salvar agora — tento de novo na próxima alteração",true)}
  if(!remoto)return;
  if(conflito){dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;setStatus("Outra aba alterou os dados — esta aba NÃO está salvando. Recarregue.",true);return}
  let local=true;
  try{localStorage.setItem("cadpecas4",jsonLocal(false))}catch(e){
    local=false;
    try{if(await guardarMinis()&&!conflito){localStorage.setItem("cadpecas4",jsonLocal(false));local=true}}catch(e2){local=false;console.error("cadastro-pecas: falha ao gravar neste navegador",e2)}}
  if(!local){dirty.c=dirty.c||d.c;dirty.l=dirty.l||d.l;
    const m="NÃO salvo — memória do navegador cheia. Baixe o backup (Romaneios > Backup completo).";
    setStatus(db?"Salvo na sua conta, mas NÃO neste navegador (memória cheia)":m,true);
    if(!db&&Date.now()-avisoMem>20000){avisoMem=Date.now();toast(m)}
    return}
  setStatus(db?"Salvo na sua conta":"Salvo neste navegador");
  if(candFoto.size)varrerFotos();
  if(S.lanc.some(l=>(l.ft&&!ftSalvas.has(l.id))||(l.ftR&&!ftRSalvas.has(l.id)))){guardarMinis().then(ok=>{if(!conflito&&S.lanc.some(l=>(ftSalvas.has(l.id)&&l.ft)||(ftRSalvas.has(l.id)&&l.ftR))){try{localStorage.setItem("cadpecas4",jsonLocal(false))}catch(e){}}})}
}
const PONTOS_MAX=15,PONTO_INTERVALO=30*60*1000;
async function pontoSalvar(motivo,snap){try{const t=Date.now(),v={t,motivo:motivo||"automático",n:snap?snap.n:S.lanc.length,json:snap?snap.json:jsonLocal(false)};const r=await idbPut("pontos","p:"+t,v);if(r===null)return false;const ks=((await idbOp("pontos","readonly",st=>st.getAllKeys()))||[]).filter(k=>String(k).startsWith("p:")).sort();for(const k of ks.slice(0,Math.max(0,ks.length-PONTOS_MAX)))await idbDel("pontos",k);await pontosIds();return true}catch(e){return false}}
async function pontoAuto(motivo,forcar){const snap={n:S.lanc.length,json:jsonLocal(false)};   /* estado de ANTES da operação, capturado já */
  try{const ks=((await idbOp("pontos","readonly",st=>st.getAllKeys()))||[]).filter(k=>String(k).startsWith("p:")).sort(),ult=ks.length?+String(ks[ks.length-1]).slice(2):0;if(!forcar&&Date.now()-ult<PONTO_INTERVALO)return;if(!snap.n&&!forcar)return;await pontoSalvar(motivo,snap)}catch(e){}}
setInterval(()=>{if(S.lanc.length)pontoAuto("automático (a cada 30 min de uso)")},5*60*1000);
const BK_DIAS=7,BK_INTERVALO=30*60*1000;
async function bkPasta(){const h=await idbGet("pontos","pasta");return h&&typeof h==="object"&&h.kind==="directory"?h:null}
async function bkPerm(h,pedir){try{let p=await h.queryPermission({mode:"readwrite"});if(p==="prompt"&&pedir)p=await h.requestPermission({mode:"readwrite"});return p==="granted"}catch(e){return false}}
async function bkEscrever(h){const {o,falhas,hoje}=await bkMontar(),nome=`cadastro-pecas-auto-${hoje}${falhas.length?"-INCOMPLETO":""}.json`,fh=await h.getFileHandle(nome,{create:true}),w=await fh.createWritable();await w.write(JSON.stringify(o));await w.close();
  try{const ns=[];for await(const [n] of h.entries())if(/^cadastro-pecas-auto-\d{4}-\d{2}-\d{2}/.test(n))ns.push(n);ns.sort();for(const n of ns.slice(0,Math.max(0,ns.length-BK_DIAS)))await h.removeEntry(n)}catch(e){}
  try{localStorage.setItem("cadpecas-bk-ult",String(Date.now()))}catch(e){}return nome}
async function bkAuto(pedir,forcar){const h=await bkPasta();if(!h)return null;
  if(!forcar){let u=0;try{u=+localStorage.getItem("cadpecas-bk-ult")||0}catch(e){}if(Date.now()-u<BK_INTERVALO)return "recente"}
  if(!(await bkPerm(h,pedir)))return "perm";try{return await bkEscrever(h)}catch(e){console.error("cadastro-pecas: backup em pasta falhou",e);return "erro"}}
setInterval(()=>{if(S.lanc.length)bkAuto(false)},10*60*1000);
async function bkStatus(){const el=document.getElementById("bkStatus");if(!el)return;
  if(typeof showDirectoryPicker!=="function"&&!(await bkPasta())){el.innerHTML=`<span class="warn">Este navegador não deixa escolher pasta. Use o Chrome ou o Edge, ou a cópia manual abaixo.</span>`;return}
  const h=await bkPasta();if(!h){el.textContent="Desligado. Escolha uma pasta para ligar.";return}
  const ok=await bkPerm(h,false);let u=0;try{u=+localStorage.getItem("cadpecas-bk-ult")||0}catch(e){}
  el.innerHTML=`Pasta: <b>${esc(h.name)}</b> · ${ok?"permissão ok":`<span class="warn">o navegador pede permissão de novo</span> <button type="button" class="btn sm" data-act="bk-perm">Permitir</button>`} · último backup: ${u?esc(new Date(u).toLocaleString("pt-BR")):"ainda não"}`}
async function pontosCarregar(){bkStatus();const el=document.getElementById("pontosLista");if(!el)return;const ks=((await idbOp("pontos","readonly",st=>st.getAllKeys()))||[]).filter(k=>String(k).startsWith("p:")).sort().reverse(),out=[];for(const k of ks){const v=await idbGet("pontos",k);if(v&&typeof v==="object")out.push({k,t:v.t,motivo:v.motivo,n:v.n})}
  const el2=document.getElementById("pontosLista");if(!el2)return;el2.innerHTML=out.length?out.map(p=>`<div class="pt"><span><b>${esc(new Date(p.t).toLocaleString("pt-BR"))}</b> · ${p.n} peça(s) <small>${esc(p.motivo)}</small></span><button type="button" class="btn sm" data-act="ponto-voltar" data-k="${esc(p.k)}">Voltar para este ponto</button></div>`).join(""):`<span class="hint">Ainda não há pontos. Um é criado ao abrir o app e a cada 30 minutos de uso, e antes de excluir várias linhas.</span>`}
async function pontoRestaurar(k){const v=await idbGet("pontos",k);if(!v||typeof v!=="object"||!v.json){toast("Esse ponto não pode ser lido.");return}
  const q=new Date(v.t).toLocaleString("pt-BR");if(!confirm(`Voltar para ${q} (${v.n} peça(s))?\n\nO que está agora fica guardado como outro ponto, e dá para voltar a ele.\n\nAs fotos não voltam no tempo: ficam as que estão guardadas agora.`))return;
  if(!(await pontoSalvar("antes de voltar no tempo"))&&!confirm("NÃO consegui guardar o que está agora como ponto (memória do navegador cheia ou bloqueada).\n\nSe continuar, o estado atual será perdido. Voltar mesmo assim?"))return;
  try{const o=JSON.parse(v.json);S.config=lerConfig(o.config);S.lanc=(o.lanc||[]).map(lerLanc);S.form=o.form&&o.form.v?lerForm(o.form):FORM0();editId=null;rascunho=null;sel.clear();selR=null;ftSalvas.clear();ftRSalvas.clear();try{migrarJueri();migrarGrades()}catch(e){}sincGrade(S.form);salvar(true);render();histIni();carregarMinis();toast("Voltei no tempo: "+q)}catch(e){toast("Não consegui voltar para esse ponto.")}}
async function carregarMinis(){setTimeout(()=>pontoAuto("ao abrir o app"),5000);setTimeout(()=>bkAuto(false),8000);const ls=S.lanc.filter(l=>l.ftIdb&&!l.ft);let n=0;for(const l of ls){const u=await idbGet("fotos","m:"+l.id);if(typeof u==="string"&&/^data:image\//.test(u)){l.ft=u;ftSalvas.add(l.id);n++}}
  for(const l of S.lanc.filter(x=>x.ftRIdb&&!x.ftR)){const u=await idbGet("fotos","r:"+l.id);if(typeof u==="string"&&/^data:image\//.test(u)){l.ftR=u;ftRSalvas.add(l.id);n++}}
  if(await migrarFotos())n++;
  if(n){try{renderTopo()}catch(e){}}}
/* peças lançadas antes da coluna "Foto do romaneio": a foto guardada era a do romaneio (sem original anexado) e passa para a coluna certa; uma vez só */
async function migrarFotos(){let mexeu=0;
  for(const l of S.lanc){if(l.ftMig||!l.ft||l.ftR)continue;
    const big=await idbGet("fotos",l.id);l.ftMig=1;
    if(typeof big==="string"&&/^data:image\//.test(big))continue;
    l.ftR=l.ft;ftRSalvas.delete(l.id);
    if(vazio(l.v&&l.v.B)){delete l.ft;delete l.ftIdb;ftSalvas.delete(l.id);idbDel("fotos","m:"+l.id)}
    mexeu++}
  if(mexeu){salvar(true);toast(`${mexeu} foto(s) de peças antigas foram para a coluna “Foto do romaneio”.`,{t:"Desfazer",fn:desfazer})}
  return mexeu}
function lerConfig(c){
  const o=clone(DEFAULT_CONFIG);if(!c)return o;
  ["seqs","categorias","cores","observacoes","ordem","grades","modelos","modelo","romaneios"].forEach(k=>{if(c[k]!=null)o[k]=c[k]});if(!Array.isArray(o.grades))o.grades=[];if(!Array.isArray(o.romaneios)||!o.romaneios.length)o.romaneios=ROMS0();
  o.categorias.forEach(x=>{if(x&&!Array.isArray(x.subs))x.subs=[]});   /* cópia/backup com categoria sem lista de subcategorias não pode quebrar a tela */
  o.romaneios.forEach(t=>{if(t.id==="carlinha"&&!/Corrente=/.test(t.mapa||"")){const d=ROMS0()[0];t.mapa=d.mapa;t.valorRe=d.valorRe}});
  if(c.colcfg){LET.forEach(L=>{const x=c.colcfg[L]||{};const pad=o.colcfg[L].form;o.colcfg[L]={...o.colcfg[L],...x};if(!c.v6)o.colcfg[L].form=pad})}
  else{const fx=c.fixos||{};if(c.insumos!=null)o.colcfg.Q.padrao=c.insumos;if(fx.ncm!=null)o.colcfg.Y.padrao=fx.ncm;if(fx.cfop!=null)o.colcfg.AA.padrao=fx.cfop;if(fx.fcp!=null)o.colcfg.AB.padrao=fx.fcp;if(fx.catalogo)o.colcfg.AD.padrao=fx.catalogo;if(fx.status)o.colcfg.AE.padrao=fx.status}
  if(c.banhistas&&c.banhistas.length)o.banhistas=c.banhistas.map(b=>({...b,banhos:b.banhos.map(x=>({modo:"peso",...x}))}));
  else if(c.banhos){const b=clone(BANHISTA0);const bo=c.banhos.ouro||{},bp=c.banhos.prata||{};Object.assign(b.banhos[0],{letra:bo.letra||"A",cor:bo.cor||"Ouro",mil:bo.mil??"1",mult:bo.mult??"1.5"});Object.assign(b.banhos[1],{letra:bp.letra||"B",cor:bp.cor||"Prata",mil:bp.mil??"50",mult:bp.mult??"1.54",sufixo:bp.sufixo??" banho prata"});if(c.verniz!=null)b.verniz=c.verniz;o.banhistas=[b]}
  if(c.fornecedores)o.fornecedores=c.fornecedores.map(f=>({banhista:"",...f,tipo:f.tipo==="bruto"?"bruta":f.tipo==="pronto"?"pronta":(f.tipo||"bruta")}));
  if(!c.v7){const pc=o.categorias.find(x=>/prata\s*925/i.test(x.nome||""));const d=DEFAULT_CONFIG.categorias.find(x=>x.nome==="Prata 925");
    if(pc&&d){if(pc.sufixo==null)pc.sufixo=d.sufixo;if(!pc.subs||!pc.subs.length)pc.subs=[...d.subs];pc.subPref={...d.subPref,...(pc.subPref||{})}}}
  o.v4=true;o.v5=true;o.v6=true;o.v7=true;o.v8=true;o.v9=c.v9?true:undefined;o.v10=c.v10?true:undefined;if(!Array.isArray(o.modelos)||!o.modelos.length)o.modelos=[modeloJueri()];if(!o.modelos.some(m=>m.id===o.modelo))o.modelo=o.modelos[0].id;o.v11=c.v11?true:undefined;o.v12=c.v12?true:undefined;
  if(!c.v14){const an=o.categorias.find(x=>x.grade&&!x.grade.usa&&/an[eé]l|anéis|aneis/i.test(x.nome||""));
    if(an){const nm=g=>g.itens.map(i=>String(i.nome)).join("|");o.categorias.forEach(x=>{if(x!==an&&x.grade&&!x.grade.usa&&nm(x.grade)===nm(an.grade))x.grade.usa=an.nome})}}o.v14=true;
  if(!c.v13){DEFAULT_CONFIG.cores.forEach(x=>{if(!o.cores.some(y=>semAc(y)===semAc(x)))o.cores.push(x)})}o.v13=true;if(!o.vLib){o.coresMeta=o.coresMeta||{};const M=o.coresMeta,us=new Set();(o.categorias||[]).forEach(c=>(c.cores||[]).forEach(x=>{if(!x||!x.nome)return;if(!o.cores.some(y=>semAc(y)===semAc(x.nome)))o.cores.push(x.nome);const k=semAc(String(x.nome)).trim();M[k]=M[k]||{};M[k].ped=true;const Lt=String(x.letra||'').toUpperCase();if(Lt&&!M[k].sig&&!us.has(Lt)&&!/^[0-9]+$/.test(Lt)){M[k].sig=Lt;us.add(Lt)}if(!M[k].txt&&x.texto&&x.texto!=='-')M[k].txt=String(x.texto).trim()}));o.vLib=true}if(!o.vPeso){o.romaneios=o.romaneios||[];if(!o.romaneios.some(t=>t.id==="pedido-peso")){o.romaneios.push(ROM_PESO())}o.vPeso=true}
  {const ids=x=>{if(x&&typeof x==="object"&&x.id!=null)x.id=idLimpo(x.id)||uid()};
    (o.banhistas||[]).forEach(b=>{ids(b);(b.banhos||[]).forEach(ids)});(o.grades||[]).forEach(g=>{ids(g);(g.itens||[]).forEach(ids)});
    (o.categorias||[]).forEach(c=>{if(c.grade){ids(c.grade);(c.grade.itens||[]).forEach(ids)}});(o.romaneios||[]).forEach(ids);(o.modelos||[]).forEach(ids);
    if(o.modelo!=null)o.modelo=idLimpo(o.modelo);(o.fornecedores||[]).forEach(f=>{if(f.banhista!=null)f.banhista=idLimpo(f.banhista)})}
  {const us=new Set();o.categorias.forEach(c=>{us.add(String(c.prefixo||"").toUpperCase());Object.values(c.subPref||{}).forEach(v=>us.add(String(v).toUpperCase()))});Object.keys(o.seqs||{}).forEach(p=>{if(!us.has(p)&&!(Math.trunc(num(o.seqs[p])||0)>0))delete o.seqs[p]})}
  return o;
}
/* Uma vez por conta: traz as categorias do Jueri (renomeia Anéis→Anél, acrescenta as que faltam, ajusta subcategorias) sem apagar o que você cadastrou nem as peças já lançadas. */
function migrarJueri(){
  const C=cfg();if(C.v9)return false;const lo=x=>String(x||"").trim().toLowerCase();
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
    if(/an[eé]is/i.test(g.auto||"")&&!/an[eé]l/i.test(g.auto))g.auto=String(g.auto).replace(/an[eé]is/i,"Anél; Anéis");
    /* Textos copiados no cadastro antigo: se todos têm o mesmo começo (ex.: " aro 12", " aro 14"), era uma cópia do rótulo — passam a seguir o rótulo atual, e o termo antigo ainda é reconhecido na Descrição. */
    const pre=g.itens.map(x=>x.texto!=null&&x.nome&&String(x.texto).endsWith(x.nome)?String(x.texto).slice(0,String(x.texto).length-x.nome.length):null);
    if(g.itens.length>1&&pre.every(v=>v!==null&&v===pre[0])){const o=String(pre[0]).trim();if(o&&o.toLowerCase()!==String(g.rotulo||"").trim().toLowerCase()){g.sin=g.sin||[];if(!g.sin.some(z=>z.toLowerCase()===o.toLowerCase()))g.sin.push(o)}g.itens.forEach(x=>{delete x.texto})}
    g.itens.forEach(x=>{if(x.texto===rotG(g)+(x.nome||x.letra))delete x.texto;if(x.col&&x.col===(g.col||""))delete x.col;if(x.valor!=null&&x.valor===x.nome)delete x.valor})});
  C.v9=true;return true;
}
/* Uma vez por conta: a variação (tamanhos de anel etc.) passa para dentro da categoria, cada banho ganha a marca de verniz e some o que estava fora do lugar (observação na lista de cores). */
/* v11: a tabela passa a mostrar as peças na ordem em que foram lançadas (a opção "A depois B" continua disponível) */
function migrarGrades(){const a=migrarGrades0(),C=cfg();let m=a;
  if(!C.v11){C.ordem="int";C.v11=true;m=true}
  /* v12: a variação de anel passa a ter os tamanhos 11 a 25 (os que já existem e suas letras não mudam) */
  if(!C.v12){C.categorias.forEach(c=>{const g=c.grade;if(!g||!(/^aro/.test(g.id)||/anel|anéis|aro/i.test(g.nome||"")))return;
    for(let n=11;n<=25;n++){const nm=String(n);if(!g.itens.some(x=>String(x.nome)===nm)){let id="a"+nm;if(g.itens.some(x=>x.id===id))id=uid();g.itens.push({id,letra:proxLetra(g.itens.map(x=>x.letra)),nome:nm})}}
    g.itens.sort((x,y)=>(parseFloat(x.nome)||0)-(parseFloat(y.nome)||0))});C.v12=true;m=true}
  return m}
function migrarGrades0(){
  const C=cfg();if(C.v10)return false;
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
/* aceita lançamentos das versões anteriores */
function lerLanc(l){
  if(!l.v)l={id:l.id||uid(),tipo:l.tipo==="pronta"?"pronta":"bruta",desconto:l.desconto||"0",banhista:"scarlat",vinc:!!l.vinc,
    v:{F:l.desc,G:l.codForn,H:l.forn,I:l.cat,J:l.sub,M:l.obs,N:l.peso,P:l.custo,V:l.preco,L:l.cor,W:l.qtd},
    on:{ouro:!(l.tipo==="bruta"&&l.prata&&!(num(l.qtdA)>0)),prata:!!l.prata},q:{ouro:l.qtdA,prata:l.qtdB},dsc:{prata:l.descB||""}};
  l.id=idLimpo(l.id)||uid();delete l.pv;
  l.ov=l.ov||{};
  if(l.ft&&!ftOk(l.ft)){delete l.ft}
  if(l.ftR&&!ftOk(l.ftR)){delete l.ftR}
  if(l.q){Object.entries(l.q).forEach(([b,q])=>{if(!vazio(q)){l.ov[b]=l.ov[b]||{};if(vazio(l.ov[b].W))l.ov[b].W=q}});delete l.q}
  if(l.dsc){Object.entries(l.dsc).forEach(([b,d])=>{if(!vazio(d)){l.ov[b]=l.ov[b]||{};l.ov[b].F=d}});delete l.dsc}
  return l;
}
function lerForm(f){const o={...FORM0(),...(f||{})};if(!o.v)return FORM0();return lerLanc(o)}
/* dados salvos que não dá para ler: NÃO apaga nem sobrescreve nada até a pessoa escolher (baixar cópia, restaurar backup ou começar vazio) */
function resolverCorrompido(){corrompido=false;rawCorrompido="";const b=document.getElementById("dadosRuins");if(b)b.remove()}
function dadosCorrompidos(raw){
  corrompido=true;rawCorrompido=raw;let guardou=false,baixou=false;
  try{localStorage.setItem("cadpecas4-corrompido",raw);guardou=true}catch(e){}
  const b=document.createElement("div");b.id="dadosRuins";b.setAttribute("role","alert");
  b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:100000;background:#fdecea;color:#7a1c12;border-bottom:3px solid #c0392b;padding:12px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font:14px system-ui,sans-serif";
  b.innerHTML=`<b>Não consegui ler os dados salvos neste navegador.</b><span>Eles NÃO foram apagados e nada será salvo por cima até você escolher o que fazer. ${guardou?"Uma cópia deles foi guardada à parte no navegador.":"Não coube guardar uma cópia no navegador: baixe uma agora."}</span><button type="button" class="btn sm" id="drBaixar">Baixar cópia dos dados</button><button type="button" class="btn pri sm" id="drRest">Restaurar de um backup…</button><button type="button" class="btn sm danger" id="drVazio" title="Começa do zero. Os dados danificados deixam de ser usados.">Começar vazio</button><input type="file" id="drArq" accept=".json,application/json" hidden>`;
  document.body.appendChild(b);
  document.getElementById("drBaixar").onclick=()=>{try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([rawCorrompido],{type:"application/json"}));a.download="cadastro-pecas-dados-danificados.json";document.body.appendChild(a);a.click();baixou=true;setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}catch(e){toast("Não consegui baixar a cópia.")}};
  document.getElementById("drRest").onclick=()=>document.getElementById("drArq").click();
  document.getElementById("drArq").onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(f)restaurarTotal(f)};
  document.getElementById("drVazio").onclick=()=>{if(!guardou&&!baixou&&!confirm("Os dados danificados ainda não foram copiados em lugar nenhum. Começar vazio vai perdê-los de vez. Continuar?"))return;
    resolverCorrompido();salvar(true);toast("Começando vazio."+(guardou?" A cópia dos dados antigos ficou guardada à parte no navegador.":""))};
}
async function carregar(){
  let raw=null;
  try{raw=localStorage.getItem("cadpecas4")||localStorage.getItem("cadpecas3");if(raw){const o=JSON.parse(raw);if(!ehObj(o)||(o.lanc!=null&&!Array.isArray(o.lanc)))throw new Error("formato");
    const cf=lerConfig(o.config),la=(o.lanc||[]).map(lerLanc),fo=lerForm(o.form),rc=o.rasc&&ehObj(o.rasc)&&o.rasc.v?lerForm(o.rasc):null;
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

