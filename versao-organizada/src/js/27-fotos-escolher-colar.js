/* ===== fotos: escolher, arrastar ou colar (Ctrl+V) ===== */
let FT_GRANDE=null,ftAlvo=null;
const blobUrl=b=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(new Error("foto ilegível"));r.readAsDataURL(b)});
async function lerFotoArquivo(file){
  if(!file||!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type))throw new Error(`“${file&&file.name||"arquivo"}” não é uma foto JPG, PNG ou WebP`);
  checaTam(file,MAX_FOTO_BYTES,"A foto");
  const src=await blobUrl(file),g=await fotoReduzida(src,1200),m=await fotoReduzida(src,240);
  if(!g||!m)throw new Error(`não consegui ler “${file.name}”`);
  const grande=await blobUrl(g),mini=await blobUrl(m);if(!ftOk(mini))throw new Error(`formato de “${file.name}” não suportado`);
  return {mini,grande}}
async function fotoNaPeca(lid,F){const l=S.lanc.find(x=>x.id===lid);if(!l)return false;
  const gr=await idbPut("fotos",lid,F.grande);if(gr===null)throw new Error("Não consegui guardar a foto original (memória do navegador cheia ou bloqueada). A foto desta peça não foi trocada.");
  l.ft=F.mini;if(/^https:\/\/i\.ibb\.co\//.test(String(l.v.B||"")))delete l.v.B;ftSalvas.delete(lid);candFoto.delete(lid);if(editId===lid)S.form.ft=F.mini;return true}
const refBase=r=>{const m=/^([A-Za-z]+\d+)/.exec(String(r||""));return m?m[1].toUpperCase():String(r||"").toUpperCase()};
/* várias fotos de uma vez: o nome do arquivo igual à referência (BR1670.jpg) liga sozinho; as que sobram vão em sequência para as peças sem foto, a partir da peça escolhida */
async function fotosEmLote(files,lidIni){
  const arqs=[...files].filter(f=>f&&(/^image\//.test(f.type)||/\.(jpe?g|png|webp|gif)$/i.test(f.name)));
  if(!arqs.length){toast("Nenhuma foto nesses arquivos. Use JPG, PNG ou WebP.");return}
  const g=gerar(),ordem=[];g.linhas.forEach(r=>{if(!ordem.includes(r.lancId)&&(!filtroOn()||casa(r)))ordem.push(r.lancId)});
  const porNome=new Map();ordem.forEach(id=>{(g.refs[id]||[]).forEach(r=>{[String(r).toUpperCase(),refBase(r)].forEach(k=>{if(k&&!porNome.has(k))porNome.set(k,id)})})});
  const usados=new Set(),semNome=[];let nNome=0,nSeq=0;const erros=[];
  for(const f of arqs){
    const exato=f.name.replace(/\.[^.]+$/,"").toUpperCase(),base=exato.replace(/[\s_-]*\(?\d+\)?$/,"");
    const alvo=porNome.get(exato)||porNome.get(base)||null;
    if(alvo&&!usados.has(alvo)){try{await fotoNaPeca(alvo,await lerFotoArquivo(f));usados.add(alvo);nNome++}catch(e){erros.push(e.message)}}else if(alvo)erros.push(`“${f.name}”: já há uma foto para essa peça neste envio (ignorada)`);else semNome.push(f)}
  let pos=Math.max(0,ordem.indexOf(lidIni));
  for(const f of semNome){
    while(pos<ordem.length&&(usados.has(ordem[pos])||(arqs.length>1&&((S.lanc.find(l=>l.id===ordem[pos])||{}).ft))))pos++;
    if(pos>=ordem.length){erros.push(`“${f.name}”: não há mais peça sem foto`);continue}
    try{await fotoNaPeca(ordem[pos],await lerFotoArquivo(f));usados.add(ordem[pos]);nSeq++;pos++}catch(e){erros.push(e.message)}}
  salvar(false);renderTopo();if(editId)renderForm();
  autoEnviar([...usados]);const tot=nNome+nSeq;toast(`${tot} foto(s) anexada(s)${nNome?` · ${nNome} pelo nome do arquivo`:""}${nSeq?` · ${nSeq} em sequência`:""}${erros.length?` · ${erros.length} com problema: ${erros[0]}`:""}.`);
}
async function fotoDoFormulario(file){try{const F=await lerFotoArquivo(file);if(editId){const sj0=formSujo();await fotoNaPeca(editId,F);if(!sj0)editSnap=JSON.stringify(S.form);salvar(false);renderTopo();autoEnviar([editId])}else{S.form.ft=F.mini;FT_GRANDE=F.grande;salvar(false)}renderForm();toast("Foto anexada.")}catch(e){toast(e.message)}}
function fotoRemover(lid){
  if(!lid){delete S.form.ft;FT_GRANDE=null;salvar(false);renderForm();return}
  const l=S.lanc.find(x=>x.id===lid);if(!l)return;delete l.ft;if(/^https:\/\/i\.ibb\.co\//.test(String(l.v.B||"")))delete l.v.B;ftSalvas.delete(lid);idbDel("fotos",lid);idbDel("fotos","m:"+lid);if(editId===lid){const sj0=formSujo();delete S.form.ft;if(!sj0)editSnap=JSON.stringify(S.form)}salvar(false);renderTopo();renderForm();toast("Foto removida.")}
(function(){const inp=document.createElement("input");inp.type="file";inp.id="ftIn";inp.accept="image/*";inp.multiple=true;inp.hidden=true;document.body.appendChild(inp);
  inp.addEventListener("change",async()=>{const fl=[...inp.files];inp.value="";if(!fl.length)return;const al=ftAlvo;ftAlvo=null;toast(fl.length>1?`Lendo ${fl.length} fotos…`:"Lendo a foto…");
    if(al==="__form"){if(fl.length===1)return fotoDoFormulario(fl[0]);return fotosEmLote(fl,editId)}
    if(fl.length===1){try{await fotoNaPeca(al,await lerFotoArquivo(fl[0]));salvar(false);renderTopo();if(editId)renderForm();toast("Foto anexada.");autoEnviar([al])}catch(e){toast(e.message)}return}
    fotosEmLote(fl,al)});
  const temArq=e=>e.dataTransfer&&[...(e.dataTransfer.types||[])].includes("Files");
  let hl=null;const limpaHl=()=>{if(hl){hl.classList.remove("ftdrop");hl=null}};
  document.addEventListener("dragover",e=>{if(!temArq(e))return;const tr=e.target.closest&&e.target.closest("#sheet tr[data-l]"),fm=e.target.closest&&e.target.closest("#form");if(!tr&&!fm)return;e.preventDefault();const alvo=tr||fm;if(hl!==alvo){limpaHl();hl=alvo;hl.classList.add("ftdrop")}});
  document.addEventListener("dragleave",e=>{if(!e.relatedTarget)limpaHl()});
  document.addEventListener("drop",e=>{if(!temArq(e))return;const tr=e.target.closest&&e.target.closest("#sheet tr[data-l]"),fm=e.target.closest&&e.target.closest("#form");limpaHl();if(!tr&&!fm)return;e.preventDefault();e.stopPropagation();
    const fl=[...e.dataTransfer.files];if(!fl.length)return;
    if(tr)fotosEmLote(fl,tr.dataset.l);else if(fl.length===1)fotoDoFormulario(fl[0]);else fotosEmLote(fl,editId)});
  document.addEventListener("paste",e=>{const fl=[...((e.clipboardData&&e.clipboardData.files)||[])].filter(x=>/^image\//.test(x.type));if(!fl.length)return;
    if(e.target&&e.target.id==="celIn")return;e.preventDefault();
    const row=selR&&G&&G.linhas[selR.fr],lid=editId||(row&&row.lancId);
    if(lid){(async()=>{try{await fotoNaPeca(lid,await lerFotoArquivo(fl[0]));salvar(false);renderTopo();if(editId)renderForm();toast("Foto colada na peça.");autoEnviar([lid])}catch(x){toast(x.message)}})()}
    else fotoDoFormulario(fl[0])},true)})();
/* fornecedor e subcategoria digitados à mão passam a existir no cadastro (o fornecedor leva o código, o desconto e o tipo que estão no formulário) */
function registrarLivres(l){const C=cfg(),h=String(val(l,"H")||"").replace(/\s+/g," ").trim(),j=String(val(l,"J")||"").replace(/\s+/g," ").trim(),c=catBy(val(l,"I"));
  if(h&&!C.fornecedores.some(x=>x.nome.toLowerCase()===h.toLowerCase()))C.fornecedores.push({nome:h,codigo:String(val(l,"G")||""),desconto:String(l.desconto||"0"),tipo:l.tipo==="pronta"?"pronta":"bruta"});
  if(j&&c&&Array.isArray(c.subs)&&!c.subs.some(x=>String(x).toLowerCase()===j.toLowerCase()))c.subs.push(j)}
function adicionar(limpar,quiet){
  if(!quiet&&Date.now()<addTrava)return;   /* duplo clique / Enter repetido: só a primeira conta */
  const f=S.form;erro="";
  if(vazio(f.v.F)){erro="Falta a Descrição.";atualizarGera();focarPrimeiro(true);return}
  if(!quiet){const meu=editId||"__p",rd=previsao().linhas.filter(r=>r.lancId===meu&&r.dup);if(rd.length){erro="Referência repetida ("+[...new Set(rd.map(r=>r.v.E))].slice(0,3).join(", ")+"): duas linhas ficaram iguais. Dê uma letra (ou outro nome) para cada cor/tamanho em Cadastros › Categorias.";atualizarGera();return}}
  {let ck=null,onde=null;
    for(const L of VALIDA_NUM){const r=checaCel(L,f.v[L]);if(r.erro){ck=r.erro;onde=L;break}}
    if(!ck)for(const [ok0,o] of Object.entries(f.ov||{})){if(!o||typeof o!=="object")continue;if(f.tipo==="pronta"&&!bonP(f).length&&ok0!=="p"&&!ok0.startsWith("p~"))continue;for(const L of VALIDA_NUM){const r=checaCel(L,o[L]);if(r.erro){ck=r.erro;onde=L;break}}if(ck)break}
    if(!ck&&!vazio(f.desconto)){const d=num(f.desconto);if(d==null||d<0||d>100)ck="Desconto precisa ser um número de 0 a 100 (%)."}
    if(ck){erro=ck;atualizarGera();const el=onde&&document.getElementById("f-"+onde);if(el)el.focus();return}}
  if(f.conj){const cs=Array.isArray(f.comp)?f.comp:[];
    if(!cs.some(c=>!vazio(c.desc)||(num(c.peso)||0)>0||(num(c.custo)||0)>0)){erro="Coloque pelo menos uma peça no conjunto (nome, peso ou custo).";atualizarGera();return}
    const mau=cs.findIndex(c=>["peso","custo"].some(k=>!vazio(c[k])&&(num(c[k])==null||num(c[k])<0||num(c[k])>1e7)));
    if(mau>=0){erro=`Peça ${mau+1} do conjunto: peso e custo precisam ser números de 0 em diante.`;atualizarGera();const el=document.querySelector(`[data-ci="${mau}"] input.cj-n`);if(el)el.focus();return}
  if(f.conj){const ie=(f.comp||[]).findIndex((c,i)=>{const e=conjErro(f,i);return e&&e!=="nome repetido"});if(ie>=0){erro=`Peça ${ie+1} do conjunto: ${conjErro(f,ie)}.`;atualizarGera();const el=document.querySelector(`#conj [data-ci="${ie}"] [data-cp="${vazio(f.comp[ie].desc)?"desc":vazio(f.comp[ie].peso)?"peso":"custo"}"]`);if(el)el.focus();return}}
    {const R=conjCalc(f);if(R.tot.N<=0&&R.tot.P<=0){erro="Coloque o peso ou o custo de compra nas peças do conjunto.";atualizarGera();return}}}
  if(!catBy(val(f,"I"))){erro="Escolha a categoria da peça.";atualizarGera();const ec=document.getElementById("f-I");if(ec)ec.focus();return}
  if(f.tipo==="bruta"&&!banhistaBy(f.banhista).banhos.some(b=>f.on[b.id])){erro="Marque pelo menos um banho.";atualizarGera();return}
  {const gr=gradeBy(f.grade);if(gr&&!f.semGrade&&!(f.gsel||[]).some(id=>gr.itens.some(x=>x.id===id))){erro=`Escolha pelo menos uma opção de ${gr.nome}.`;atualizarGera();return}}
  if(!vazio(f.v.E))f.v.E=String(f.v.E).replace(/\s+/g,"").toUpperCase();Object.values(f.ov||{}).forEach(o=>{if(o&&typeof o==="object"&&!vazio(o.E))o.E=String(o.E).replace(/\s+/g,"").toUpperCase()});
  {const d2=o=>{if(!o||typeof o!=="object")return;DUAS.forEach(L=>{const t=o[L];if(vazio(t)||String(t).trim()[0]==="=")return;const n=num(t);if(n!=null)o[L]=r2c(n).toFixed(2).replace(".",",")})};d2(f.v);Object.values(f.ov||{}).forEach(d2)}
  const novo={...clone(f),id:editId||uid()};{const ant=editId&&S.lanc.find(l=>l.id===editId);if(ant&&ant.rf&&prefDe(val(novo,"I")||"",val(novo,"J"))!==prefDe(val(ant,"I")||"",val(ant,"J"))){delete novo.v.E;delete novo.rf}novo.por=(ant&&ant.por)||AUTOR;if(!novo.por)delete novo.por;novo.em=(ant&&ant.em)||Date.now()}lembrarForn(novo);registrarLivres(novo);
  if(!gradeBy(novo.grade)){novo.grade="";novo.gsel=[]}
  if(!novo.conj){delete novo.comp;delete novo.fConj}
  if(novo.tipo==="pronta"){const bp=bonP(novo);
    if(!bp.length){novo.onP={};if(!novo.conj)novo.banhista="";const ov={};Object.keys(novo.ov||{}).forEach(k=>{if(k==="p"||k.startsWith("p~"))ov[k]=novo.ov[k]});novo.ov=ov;novo.mk=novo.mk&&novo.mk.p?{p:novo.mk.p}:{}}
    if(temGrade(novo)||bp.length)delete novo.v.W;["O","R","S","T","U"].forEach(L=>{if(vazio(novo.v[L]))delete novo.v[L]})}
  else if(novo.mk)delete novo.mk.p;
  /* o Preço de Varejo do formulário só vale para peça pronta simples; numa peça bruta (ou com banhos) ele ficou escondido, vindo da peça anterior, e não pode ir para a planilha */
  if(!editId&&!quiet&&(novo.tipo=="bruta"||bonP(novo).length))delete novo.v.V;
  if(!quiet)addTrava=Date.now()+500;
  if(quiet)delete novo.ft;
  if(editId){const i=S.lanc.findIndex(l=>l.id===editId);if(S.lanc[i]&&S.lanc[i].ft!==novo.ft)ftSalvas.delete(novo.id);S.lanc[i]=novo;editId=null;S.form=rascunho||S.form;rascunho=null;renderTopo();toast("Alteração salva.")}
  else{S.lanc.push(novo);undo={tipo:"add",id:novo.id,form:clone(f)};if(novo.ft&&FT_GRANDE){idbPut("fotos",novo.id,FT_GRANDE).then(r=>{if(r===null)toast("Atenção: não consegui guardar a foto original desta peça (memória do navegador). A miniatura ficou, mas o envio do link pode falhar.");else autoEnviar([novo.id])})}FT_GRANDE=null;delete f.ft;delete f.v.E;if(limpar)limparForm();if(!quiet){renderTopo();toast(`Adicionado ${(G.refs[novo.id]||[]).join(" + ")}${G.semQ&&G.semQ[novo.id]?` — ${G.semQ[novo.id]} combinação(ões) sem quantidade ficaram de fora`:""}`,{t:"Desfazer",fn:desfazer})}}
  salvar(false);if(quiet)return true;renderForm();
  mostrarNoFim(novo.id);
  focarPrimeiro();return true;
}
/* a peça nova aparece sempre no fim da tabela: rola até a última linha dela e dá um destaque */
function mostrarNoFim(id){if(JAN&&G){let li=-1;G.linhas.forEach((r,i)=>{if(r.lancId===id)li=i});if(li>=0)janGarantir(li)}
  const trs=[...document.querySelectorAll(`#sheet tr[data-l="${CSS.escape(String(id))}"]`)];if(!trs.length)return;const last=trs[trs.length-1],sh=document.getElementById("sheet");
  const a=last.getBoundingClientRect(),b=sh.getBoundingClientRect(),folga=28+30;
  if(a.bottom>b.bottom-folga)sh.scrollTop+=a.bottom-(b.bottom-folga);else if(a.top<b.top+34)sh.scrollTop-=(b.top+34)-a.top;
  trs.forEach(t=>{t.classList.add("flash");setTimeout(()=>t.classList.remove("flash"),1600)})}
/* desfazer/refazer em vários níveis (até 30): restaura peças e cadastros guardados em histNota() */
function desfazer(refazer){try{desfazer0(refazer)}finally{undoBtns()}}
function desfazer0(refazer){
  const pilha=refazer===true?REDO:HIST,outra=refazer===true?HIST:REDO;
  if(!pilha.length){toast(refazer===true?"Nada para refazer.":"Nada para desfazer.");return}
  const e=pilha.pop();
  outra.push({L:snapL,C:snapC,F:e.F?JSON.stringify(S.form):null,E:!!editId,soCfg:e.soCfg,t:Date.now()});
  restaurando=true;const eidAntes=editId||null;
  const idsAntes=S.lanc.map(l=>l.id);
  try{
    S.lanc=JSON.parse(e.L).map(lerLanc);
    {const agora=new Set(S.lanc.map(l=>l.id));idsAntes.forEach(i=>{if(!agora.has(i))candFoto.add(i)})}S.config=JSON.parse(e.C);
    if(e.F&&!editId&&!e.E){S.form=lerForm(JSON.parse(e.F))}
    if(editId&&!S.lanc.some(l=>l.id===editId)){editId=null;if(rascunho)S.form=rascunho;rascunho=null}
    [...sel].forEach(i=>{if(!S.lanc.some(l=>l.id===i))sel.delete(i)});selR=null;
    histIni();
  }finally{restaurando=false}
  salvar(true);render();
  if(eidAntes&&editId===eidAntes&&S.lanc.some(l=>l.id===eidAntes)){const rs=rascunho;editId=null;if(rs){S.form=rs;rascunho=null}editar(eidAntes)}
  toast(refazer===true?"Refeito.":"Desfeito.",refazer===true?null:(REDO.length?{t:"Refazer",fn:()=>desfazer(true)}:null));
}
/* valores digitados direto na tabela (ov) voltam para os campos do formulário, para poder editá-los ali */
function dobrarOv(f,id){const ov=f.ov||{};
  if(f.tipo==="pronta"&&!bonP(f).length&&!temGrade(f)){const o=ov.p;if(o&&typeof o==="object"){Object.keys(o).forEach(L=>{if(f.conj&&(L==="N"||L==="P"))return;f.v[L]=o[L]});delete ov.p}return}
  const rows=(G?G.linhas:[]).filter(r=>r.lancId===id),ks=Object.keys(ov).filter(k=>ov[k]&&typeof ov[k]==="object");if(!ks.length||!rows.length)return;
  const per=new Set(["W","E","F","V","L","O","R","S","T","U"]),Ls=new Set();ks.forEach(k=>Object.keys(ov[k]).forEach(L=>{if(!per.has(L))Ls.add(L)}));if(f.conj){Ls.delete("N");Ls.delete("P")}
  const gr=temGrade(f);let avisa=false;
  Ls.forEach(L=>{const com=rows.filter(r=>r.ovs&&r.ovs.includes(L));if(!com.length||!com.every(r=>r.v[L]===com[0].v[L]))return;
    if(com.length<rows.length)return;   /* valor só de algumas linhas continua só nelas */
    f.v[L]=com[0].v[L];ks.forEach(k=>{delete ov[k][L]})});
  if(avisa)setTimeout(()=>toast("Valor digitado à mão numa linha agora vale para todas as linhas desta peça (aparece nos campos abaixo)."),50);
  ks.forEach(k=>{if(!Object.keys(ov[k]).length)delete ov[k]})}
let editSnap=null;
const formSujo=()=>!!editId&&JSON.stringify(S.form)!==editSnap;
function editar(id){
  if(editId&&editId!==id&&formSujo()&&!confirm("Há alterações não salvas na peça aberta. Descartar e abrir esta outra?"))return;
  const l=S.lanc.find(x=>x.id===id);if(!l)return;
  if(!editId)rascunho=clone(S.form);editId=id;S.form=clone(l);delete S.form.id;erro="";
  dobrarOv(S.form,id);if(S.form.conj)conjSync(S.form);editSnap=JSON.stringify(S.form);
  if(["A","B","C","D","K","X","Z","AD","AE","Y","AA","AB","AC"].some(L=>!vazio(S.form.v[L])))abertos.det=true;
  if(Object.values(S.form.ov||{}).some(o=>o&&Object.keys(o).some(L=>!["W","V"].includes(L))))abertos.det=true;
  salvar(false);renderTopo();renderForm();focarPrimeiro();editSnap=JSON.stringify(S.form);
}
function cancelar(){editId=null;if(rascunho)S.form=rascunho;rascunho=null;erro="";salvar(false);renderTopo();renderForm()}
/* a cópia leva a foto original (qualidade cheia) do banco, não só a miniatura */
function fotoCopia(de,para){try{idbGet("fotos",de).then(v=>{if(v)idbPut("fotos",para,v)}).catch(()=>{})}catch(e){}}
function duplicar(ids){
  const novos=ids.map(id=>{const c=clone(S.lanc.find(x=>x.id===id));c.id=uid();fotoCopia(id,c.id);delete c.v.E;c.vinc=false;delete c.excl;if(c.ov)Object.values(c.ov).forEach(o=>delete o.E);return c});
  S.lanc.push(...novos);undo={tipo:"dup",ids:novos.map(n=>n.id)};salvar(false);renderTopo();
  toast(`Duplicado no fim da lista: ${novos.map(n=>(G.refs[n.id]||[]).join("/")).join(", ")}`,{t:"Desfazer",fn:desfazer});
}
function duplicarLinha(ri){
  const row=G.linhas[ri];if(!row)return;const l=S.lanc.find(x=>x.id===row.lancId);if(!l)return;
  const c=clone(l);c.id=uid();fotoCopia(l.id,c.id);delete c.v.E;c.vinc=false;delete c.excl;
  if(c.tipo==="bruta"||(row.bid&&row.bid!=="p")){const bid=row.bid||row.key;if(c.tipo==="bruta")c.on={[bid]:true};else c.onP={[bid]:true};const o=(c.ov||{})[bid],o2=row.gi?(c.ov||{})[row.key]:null;c.ov={};if(o)c.ov[bid]=o;if(o2)c.ov[row.key]=o2}
  if(row.gi){   /* a linha pode ser tamanho, cor ou tamanho+cor (id "a17+c_L:azul"): a cópia fica só com aquela combinação */
    const ps=String(row.gi).split("+"),tam=ps.find(x=>!x.startsWith("c_")),cor=ps.find(x=>x.startsWith("c_"));
    c.gsel=tam?[tam]:[];if(cor)c.csel=[cor.slice(2)]}
  if(c.ov)Object.values(c.ov).forEach(o=>delete o.E);
  S.lanc.push(c);undo={tipo:"dup",ids:[c.id]};salvar(false);renderTopo();
  toast(`Linha duplicada: ${(G.refs[c.id]||[]).join(", ")}`,{t:"Desfazer",fn:desfazer});
}
/* exclui só as linhas pedidas; se a peça ficar sem nenhuma linha, ela some inteira. Desfazer volta tudo. */
function excluirLinhas(ris){
  if(ris.length>=3){if(!confirm(`Excluir ${ris.length} linhas de uma vez? (Ctrl+Z desfaz; um ponto de restauração é guardado antes)`))return;pontoAviso(pontoAuto("antes de excluir "+ris.length+" linhas",true))}
  const por={};ris.forEach(ri=>{const r=G.linhas[ri];if(r)(por[r.lancId]=por[r.lancId]||[]).push(r.key)});
  const ids=Object.keys(por);if(!ids.length)return;
  const antes=ids.map(id=>({id,excl:((S.lanc.find(x=>x.id===id)||{}).excl)||null})),del=[];let n=0;
  ids.forEach(id=>{const l=S.lanc.find(x=>x.id===id);if(!l)return;const total=G.linhas.filter(r=>r.lancId===id).length;n+=por[id].length;
    if(por[id].length>=total){del.push({idx:S.lanc.indexOf(l),item:l});return}
    l.excl=[...new Set([...(l.excl||[]),...por[id]])];if(editId===id)S.form.excl=l.excl});
  del.forEach(d=>{S.lanc=S.lanc.filter(x=>x!==d.item);sel.delete(d.item.id);if(d.item.id===editId){editId=null;if(rascunho)S.form=rascunho;rascunho=null;renderForm()}});
  del.forEach(d=>candFoto.add(d.item.id));undo={tipo:"linhas",antes,del};selR=null;salvar(false);renderTopo();toast(`${n} linha(s) excluída(s).`,{t:"Desfazer",fn:desfazer});
}
function excluir(ids){
  if(ids.length>=3){if(!confirm(`Excluir ${ids.length} peças de uma vez? (Ctrl+Z desfaz; um ponto de restauração é guardado antes)`))return;pontoAviso(pontoAuto("antes de excluir "+ids.length+" peças",true))}
  const itens=ids.map(id=>{const idx=S.lanc.findIndex(l=>l.id===id);return {idx,item:S.lanc[idx]}}).filter(x=>x.idx>=0);
  S.lanc=S.lanc.filter(l=>!ids.includes(l.id));ids.forEach(id=>sel.delete(id));if(ids.includes(editId)){editId=null;if(rascunho)S.form=rascunho;rascunho=null;renderForm()}
  ids.forEach(i=>candFoto.add(i));undo={tipo:"del",itens};salvar(false);renderTopo();toast(`${itens.length} peça(s) excluída(s).`,{t:"Desfazer",fn:desfazer});
}

