/* fornecedor e subcategoria digitados à mão passam a existir no cadastro (o fornecedor leva o código, o desconto e o tipo que estão no formulário) */
function adicionar(limpar,quiet){
  if(!quiet&&Date.now()<addTrava)return;   /* duplo clique / Enter repetido: só a primeira conta */
  const f=S.form;erro="";
  if(vazio(f.v.F)){erro="Falta a Descrição.";atualizarGera();focarPrimeiro(true);return} if(!quiet){const sus=["N","P","V"].filter(L=>/^\d{1,3}(\.\d{3})+$/.test(String(f.v[L]==null?"":f.v[L]).trim()));if(sus.length){const L=sus[0],t=String(f.v[L]).trim(),lido=String(num(t)).replace(".",",");if(!confirm(NOME[L]+" \""+t+"\" será lido como "+lido+" (o ponto é decimal). Se o valor é "+t.replace(/\./g,"")+", cancele e digite sem o ponto.\n\nLançar assim mesmo?"))return}}
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
  if(f.conj){const ie=(f.comp||[]).findIndex((c,i)=>{const e=conjErro(f,i);return e&&e!=="nome repetido"});if(ie>=0){erro=`Peça ${ie+1} do conjunto: ${conjErro(f,ie)}.`;atualizarGera();const el=document.querySelector(`#conj [data-ci="${ie}"] [data-cp="${vazio(f.comp[ie].desc)?"desc":conjQtd(f.comp[ie])==null?"qtd":vazio(f.comp[ie].peso)?"peso":"custo"}"]`);if(el)el.focus();return}}
    {const R=conjCalc(f);if(R.tot.N<=0&&R.tot.P<=0){erro="Coloque o peso ou o custo de compra nas peças do conjunto.";atualizarGera();return}}}
  if(!catBy(val(f,"I"))){erro="Escolha a categoria da peça.";atualizarGera();const ec=document.getElementById("f-I");if(ec)ec.focus();return}
  if(f.tipo==="bruta"&&!banhistaBy(f.banhista).banhos.some(b=>f.on[b.id])){erro="Marque pelo menos um banho.";atualizarGera();return}
  {const gr=gradeBy(f.grade);if(gr&&!f.semGrade&&!(f.gsel||[]).some(id=>gr.itens.some(x=>x.id===id))){erro=`Escolha pelo menos uma opção de ${gr.nome}.`;atualizarGera();return}}
  if(!vazio(f.v.E))f.v.E=String(f.v.E).replace(/\s+/g,"").toUpperCase();Object.values(f.ov||{}).forEach(o=>{if(o&&typeof o==="object"&&!vazio(o.E))o.E=String(o.E).replace(/\s+/g,"").toUpperCase()});
  if(!quiet&&!f.compra4){const custos=[f.v.P,...Object.values(f.ov||{}).map(o=>o&&o.P)].filter(x=>!vazio(x));if(custos.some(x=>{const n=num(x);return n!=null&&Math.abs(n*100-Math.round(n*100))>1e-7})&&!confirm("O custo tem mais de duas casas decimais e será arredondado para centavos. Continuar?"))return}
  {const d2=o=>{if(!o||typeof o!=="object")return;DUAS.forEach(L=>{const t=o[L];if(vazio(t)||String(t).trim()[0]==="=")return;const n=num(t);if(n!=null)o[L]=(L==="P"&&f.compra4?String(Math.round(n*10000)/10000):r2c(n).toFixed(2)).replace(".",",")});const p=o.N;if(!vazio(p)&&String(p).trim()[0]!=="="){const n=num(p);if(n!=null)o.N=String(Math.round(n*1000)/1000).replace(".",",")}};d2(f.v);Object.values(f.ov||{}).forEach(d2)}
  if(!quiet){const refs=[f.v.E,...Object.values(f.ov||{}).map(o=>o&&o.E)].filter(x=>!vazio(x));for(const ref of refs){const m=String(ref).trim().toUpperCase().match(/^([A-Z]+)(\d+)/);if(!m)continue;const atual=Math.max(inicioDe(m[1]),(G&&G.cont&&G.cont[m[1]])||0);if(+m[2]>atual+50&&!confirm("A referência "+ref+" salta mais de 50 números em relação à numeração atual. Isso pode alterar as próximas referências automáticas. Continuar?"))return}}
  if(!quiet&&!editId){const chave=x=>String(x||"").trim().replace(/\s+/g," ").toLocaleLowerCase("pt-BR");const igual=S.lanc.find(l=>chave(val(l,"F"))===chave(f.v.F)&&chave(val(l,"H"))===chave(f.v.H));if(igual&&!confirm("Já existe uma peça com a mesma descrição e fornecedor. Lançar mesmo assim?"))return}
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
  else{S.lanc.push(novo);
    /* criar em lote: N peças separadas, cada uma numerada i/N (1 = desligado) */
    {const N=!quiet?Math.max(1,Math.min(200,Math.trunc(num(f.loteN)||1))):1;if(N>1){const lid=uid();novo.lote={id:lid,i:1,n:N};for(let k=2;k<=N;k++){const c=clone(novo);c.id=uid();c.lote={id:lid,i:k,n:N};if(c.v)delete c.v.E;S.lanc.push(c)}f.loteN=""}else if(!quiet)delete novo.lote}
    undo={tipo:"add",id:novo.id,form:clone(f)};
    if(!quiet){f.gsel=[];Object.values(f.ov||{}).forEach(o=>{if(o&&typeof o==="object")delete o.W})}   /* tamanhos e quantidades não passam para a próxima peça */if(novo.ft&&estadoFotos.grande){idbPut("fotos",novo.id,estadoFotos.grande).then(r=>{if(r===null)toast("Atenção: não consegui guardar a foto original desta peça (memória do navegador). A miniatura ficou, mas o envio do link pode falhar.");else autoEnviar([novo.id])})}estadoFotos.grande=null;delete f.ft;delete f.v.E;if(!quiet&&continuoCfg().ativo)continuoProxima(f);else if(limpar)limparForm();else if(!quiet){/* Evita reutilizar medidas e compra em nova peça, salvo preferência explícita em Colunas. */
      ["N","P","W"].forEach(L=>{if(!(cfg().colcfg[L]||{}).manter){delete f.v[L];Object.values(f.ov||{}).forEach(o=>{if(o&&typeof o==="object")delete o[L]})}});
      if(!(cfg().colcfg.P||{}).manter)delete f._pAuto;
      if(f.conj&&!(cfg().colcfg.N||{}).manter&&!(cfg().colcfg.P||{}).manter){f.comp=[novaComp(),novaComp()];conjSync(f)}
    }if(!quiet){renderTopo();toast(`Adicionado ${(G.refs[novo.id]||[]).join(" + ")}${G.semQ&&G.semQ[novo.id]?` — ${G.semQ[novo.id]} combinação(ões) sem quantidade ficaram de fora`:""}`,{t:"Desfazer",fn:desfazer})}}
  salvar(false);if(quiet)return true;renderForm();try{primeirosAtualizar()}catch(x){}
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
function desfazer(refazer){try{return desfazer0(refazer)}finally{undoBtns()}}
function desfazer0(refazer){
  const pilha=refazer===true?REDO:HIST,outra=refazer===true?HIST:REDO;
  if(!pilha.length){toast(refazer===true?"Nada para refazer.":"Nada para desfazer.");return}
  const e=pilha.pop();
  if(e.R&&(romConflito||conflito)){pilha.push(e);toast("Resolva o conflito de dados antes de desfazer o romaneio.");return}
  if(e.R&&!romHistPode(e.R.depois)){pilha.push(e);return}
  const troca={L:snapL,C:snapC,F:e.F?JSON.stringify(S.form):null,E:!!editId,soCfg:e.soCfg,t:Date.now()};
  if(e.R){troca.R=e.R.depois;troca.R.depois={id:e.R.id,estado:e.R.estado,rec:e.R.rec}}
  outra.push(troca);
  restaurando=true;const eidAntes=editId||null;
  const idsAntes=S.lanc.map(l=>l.id);
  try{
    S.lanc=JSON.parse(e.L).map(lerLanc);
    {const agora=new Set(S.lanc.map(l=>l.id));idsAntes.forEach(i=>{if(!agora.has(i))candFoto.add(i)})}S.config=JSON.parse(e.C);
    if(e.F&&!editId&&!e.E){S.form=lerForm(JSON.parse(e.F))}
    if(editId&&!S.lanc.some(l=>l.id===editId)){editId=null;if(rascunho)S.form=rascunho;rascunho=null}
    [...sel].forEach(i=>{if(!S.lanc.some(l=>l.id===i))sel.delete(i)});selR=null;
    if(e.R)romHistAplicar(e.R);
    histIni();
  }finally{restaurando=false}
  salvar(true);render();
  if(eidAntes&&editId===eidAntes&&S.lanc.some(l=>l.id===eidAntes)){const rs=rascunho;editId=null;if(rs){S.form=rs;rascunho=null}editar(eidAntes)}
  toast(refazer===true?"Refeito.":"Desfeito.",refazer===true?null:(REDO.length?{t:"Refazer",fn:()=>desfazer(true)}:null));return true;
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
/* abre (ou retoma) o romaneio: usado pelo botão e pelo aviso de edição em curso */
function romAbrirNovo(){if(!romRetomar()){ROM={tid:abertos.romT&&cfg().romaneios.some(x=>x.id===abertos.romT)?abertos.romT:cfg().romaneios[0].id,texto:"",rows:[],obs:"",conf:"",msg:""};
      {const T0=romT();if(T0&&T0.forn&&fornBy(T0.forn))romSetForn(T0.forn)}}
      renderRom();const w=document.getElementById("romWrap");if(w){rolarPane(w);const ta=w.querySelector("textarea");if(ta)ta.focus({preventScroll:true})}}
/* há uma peça em edição e o usuário pediu outra coisa (abrir romaneio, importar, salvar tabela…): o aviso traz o botão que cancela a edição na hora e segue com o pedido, sem trocar de página */
function avisoEdicao(seguir){toast("Há uma peça em edição. Termine ou cancele a edição para continuar (cancelar descarta o que foi mudado nessa peça e ainda não foi gravado).",{t:"Cancelar edição e continuar",fn:()=>{cancelar();if(seguir)setTimeout(()=>{try{seguir()}catch(e){try{console.error(e)}catch(x){}}},0)}})}
function cancelar(){editId=null;if(rascunho)S.form=rascunho;rascunho=null;erro="";salvar(false);renderTopo();renderForm()}
