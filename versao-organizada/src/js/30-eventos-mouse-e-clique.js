/* ===== eventos ===== */
const refocar=s=>{const el=document.querySelector(s);if(el)el.focus()};
const guardarAbertos=()=>{try{localStorage.setItem("cadpecas-abertos",JSON.stringify(abertos))}catch(x){}};
document.addEventListener("submit",e=>{e.preventDefault();adicionar()});
/* digitação rápida: ao entrar num campo numérico do lançamento, o conteúdo fica selecionado e o que for digitado substitui */
document.addEventListener("focusin",e=>{const t=e.target;if(t.tagName==="INPUT"&&t.classList.contains("n")&&t.closest("#form")&&!t.disabled)try{t.select()}catch(x){}});
document.addEventListener("toggle",e=>{const d=e.target;if(d.dataset&&d.dataset.open){abertos[d.dataset.open]=d.open;guardarAbertos()}},true);
let mdTd=null,mdJa=false;
document.addEventListener("mousedown",e=>{
  if(e.target.classList&&e.target.classList.contains("rz")){e.preventDefault();e.stopPropagation();
    const L=e.target.dataset.rz,col=document.querySelector(`#sheet col[data-cw="${L}"]`),tb=document.querySelector("#sheet table"),x0=e.clientX,w0=cw(L),t0=tb.offsetWidth;
    e.target.classList.add("on");document.body.classList.add("resizing");
    const mv=ev=>{const w=Math.max(36,Math.round(w0+(ev.clientX-x0)/(ZM.t||1)));colW[L]=w;col.style.width=w+"px";tb.style.width=(t0+w-w0)+"px"};
    const up=()=>{document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);document.body.classList.remove("resizing");try{localStorage.setItem("cadpecas-colw",JSON.stringify(colW))}catch(x){}renderTopo()};
    document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up);return}
  if(e.target.closest("td.ed"))return;
  const sh=document.getElementById("sheet");
  const th=e.target.closest("#sheet th[data-hc]");
  if(th){e.preventDefault();if(celEd)fecharCel(true);const c=LET.indexOf(th.dataset.hc),mr=Math.max(Math.min(maxRi(),(G?G.linhas.length:1)-1),0);if(e.shiftKey&&selR)selecionar(0,selR.ac,mr,c);else selecionar(0,c,mr,c);sh.focus({preventScroll:true});return}
  const kc=e.target.closest("#sheet td.k");
  if(kc&&!e.target.closest("input,button")){const r=+kc.closest("tr").dataset.ri;if(isNaN(r))return;e.preventDefault();if(celEd)fecharCel(true);if(e.shiftKey&&selR)selecionar(selR.ar,0,r,LET.length-1);else selecionar(r,0,r,LET.length-1);sh.focus({preventScroll:true});return}
  const td=e.target.closest("#sheet td[data-c]");
  if(td){e.preventDefault();if(celEd)fecharCel(true);const r=+td.closest("tr").dataset.ri,c=LET.indexOf(td.dataset.c);mdTd=td;mdJa=!!selR&&selR.ar===r&&selR.fr===r&&selR.ac===c&&selR.fc===c;if(e.shiftKey&&selR)selecionar(selR.ar,selR.ac,r,c);else selecionar(r,c);arrastando=true;sh.focus({preventScroll:true});return}
  if(celEd)fecharCel(true);
});
document.addEventListener("mousemove",e=>{if(!arrastando||!selR)return;const td=e.target.closest&&e.target.closest("#sheet td[data-c]");if(!td)return;const r=+td.closest("tr").dataset.ri,c=LET.indexOf(td.dataset.c);if(r!==selR.fr||c!==selR.fc){selR.fr=r;selR.fc=c;pintarSel();renderSelBar()}});
document.addEventListener("mouseup",e=>{const was=arrastando;arrastando=false;
  /* um clique simples numa célula já abre para digitar (sem duplo clique); arrastar ou Shift só seleciona */
  if(!was||e.shiftKey||e.button||celEd||!selR||selR.ar!==selR.fr||selR.ac!==selR.fc)return;
  if(toque()&&!mdJa){mdTd=null;return}   /* no celular o primeiro toque só MARCA a célula; tocar de novo na marcada abre para digitar (senão o teclado abre e a tabela pula) */
  const td=mdTd&&mdTd.isConnected?mdTd:(e.target.closest&&e.target.closest("#sheet td[data-c]"));mdTd=null;if(!td||td.classList.contains("ed"))return;
  const r=+td.closest("tr").dataset.ri,c=LET.indexOf(td.dataset.c);if(r===selR.fr&&c===selR.fc){
    /* clique numa célula: abre a peça no formulário (se o formulário não tem alterações por salvar) e já deixa a célula pronta para digitar */
    const row=G&&G.linhas[r];if(row&&row.lancId&&row.lancId!==editId&&!formSujo()&&!celular()){const lid=row.lancId;editar(lid);if(G.linhas[r]&&G.linhas[r].lancId===lid)selR={ar:r,ac:c,fr:r,fc:c}}
    abrirCel(r,td.dataset.c,true)}});
document.addEventListener("dblclick",e=>{const td=e.target.closest&&e.target.closest("#sheet td[data-c]");if(td&&!td.classList.contains("ed"))abrirCel(+td.closest("tr").dataset.ri,td.dataset.c)});
function ativarConjunto(){const f=S.form;f.tipo="pronta";f.conj=true;if(!Array.isArray(f.comp)||!f.comp.length)f.comp=[novaComp(),novaComp()];if(!f.banhista)f.banhista=cfg().banhistas[0].id;conjSync(f);salvar(false);renderListas();renderTopo();renderForm();refocar('#conj [data-cp="desc"]')}
const CFG_UNDO=["forn-del","bh-del","bn-del","mod-del","mc-del","rom-del","rom-map-del","gr-del","gi-del","cc-reset","cat-del-ok","sub-del","cor-del","obs-del","go-del","cv-del","cv-todas","cv-num"];
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-act],[data-tipo]");if(!t)return;histSep=true;setTimeout(()=>{histSep=false},0);
  if(t.dataset.tipo==="conjunto"){const f=S.form;f.tipo="pronta";f.conj=true;if(!Array.isArray(f.comp)||!f.comp.length)f.comp=[novaComp(),novaComp()];
    if(!f.banhista)f.banhista=cfg().banhistas[0].id;if(!editId&&f.v.I!=="Conjuntos"&&catBy("Conjuntos")){f.v.I="Conjuntos";delete f.v.J;sincGrade(f)}
    conjSync(f);salvar(false);renderTopo();renderForm();refocar('#conj [data-cp="desc"]');return}
  if(t.dataset.tipo){if(S.form.conj){conjLimpar(S.form);delete S.form.conj}S.form.tipo=t.dataset.tipo;if(t.dataset.tipo==="bruta"&&!Object.values(S.form.on||{}).some(Boolean))marcadosPadrao(S.form);if(t.dataset.tipo==="bruta"&&!editId)banhistaDoFornecedor(S.form);salvar(false);renderTopo();renderForm();focarPrimeiro();return}
  const a=t.dataset.act,C=cfg(),tr=t.closest("tr[data-l],.pc[data-l]");
  const ci=t.closest("[data-cat]")?+t.closest("[data-cat]").dataset.cat:-1,bi=t.closest("[data-bh]")?+t.closest("[data-bh]").dataset.bh:-1;
  const snapCfg=CFG_UNDO.includes(a)?clone(S.config):null;
  switch(a){
    case "editar":editar(tr.dataset.l);if(celular())formAbrir(true);break;
    case "form-fechar":formAbrir(false);break;
    case "form-alt":{abertos.malt=(Number(abertos.malt==null?1:abertos.malt)+1)%3;guardarAbertos();gavetaAlt();break}
    case "fil-busca":FIL.q="";guardarFil();{const b=document.getElementById("fBusca");if(b)b.value=""}renderTopo();break;
    case "fil-limpar":FIL={q:"",cat:"",forn:"",ban:"",sit:""};guardarFil();{const b=document.getElementById("fBusca");if(b)b.value=""}renderTopo();break;
    case "vista":try{localStorage.setItem("cadpecas-vista",t.dataset.v)}catch(x){}renderTopo();break;
    case "ir-form":{if(celular()){formAbrir(true);break}const fm=document.getElementById("form");if(fm)fm.scrollIntoView({block:"start",behavior:"smooth"});setTimeout(focarPrimeiro,350);break}
    case "ir-lista":document.getElementById("paneTop").scrollIntoView({block:"start",behavior:"smooth"});break;
    case "forn-esq":{const fo=C.fornecedores[+t.closest("[data-forn]").dataset.forn];delete fo.mem;salvar(true,false);renderCfg();toast(`${fo.nome}: lembrança apagada.`);break}
    case "dup":duplicarLinha(+tr.dataset.ri);break;
    case "del":excluirLinhas([+tr.dataset.ri]);break;

    case "b-dup":duplicar([...sel].filter(id=>S.lanc.some(l=>l.id===id)));break;
    case "b-del":excluir([...sel]);break;
    case "b-copy":copiar(new Set(sel));break;
    case "b-none":sel.clear();renderTopo();break;
    case "b-set":{const L=document.getElementById("bCol").value,v=document.getElementById("bVal").value;const antes=[];
      {const ch=checaCel(L,v);if(ch.erro){toast(ch.erro+" (não aplicado)");break}if(vazio(v)&&(L==="F"||L==="I")){toast(NOME[L]+" não pode ficar vazio (não aplicado).");break}}
      S.lanc.forEach(l=>{if(!sel.has(l.id))return;antes.push({id:l.id,v:clone(l.v),ov:clone(l.ov||{})});
        if(L==="W"&&temGrade(l)){l.ov=l.ov||{};const ks=l.tipo==="bruta"?banhistaBy(l.banhista).banhos.filter(b=>l.on[b.id]).map(b=>b.id):(bonP(l).length?bonP(l).map(b=>b.id):["p"]);ks.forEach(k=>itensGrade(l).forEach(it=>{(l.ov[k+"~"+it.id]=l.ov[k+"~"+it.id]||{}).W=v}))}
        else if(l.tipo==="bruta"&&POR_BANHO.has(L)){l.ov=l.ov||{};banhistaBy(l.banhista).banhos.forEach(b=>{if(l.on[b.id])(l.ov[b.id]=l.ov[b.id]||{})[L]=v})}
        else{l.v[L]=v;if(l.ov)Object.values(l.ov).forEach(o=>delete o[L])}});
      undo={tipo:"bulk",antes};salvar(false);renderTopo();toast(`${NOME[L]} = “${v}” em ${antes.length} peça(s).`,{t:"Desfazer",fn:desfazer});break}
    case "excl-volta":S.form.excl=[];salvar(false);renderForm();toast("As linhas excluídas voltam quando você clicar em Salvar.");break;
    case "cancel":cancelar();break;
    case "limpar":limparForm();salvar(false);renderTopo();renderForm();focarPrimeiro();break;
    case "s-edit":{const r=G.linhas[selR.fr];if(r)editar(r.lancId);break}
    case "s-nova":{const r=G.linhas[selR.fr];if(r)usarModelo(r.lancId);break}
    case "s-dup":duplicarLinha(selR.fr);break;
    case "s-copy":copiarSel();break;
    case "s-clear":limparSel();break;
    case "s-fill":preencherAbaixo();break;
    case "s-del":{const b=selBox(),rs=[];if(b)for(let r=b.r1;r<=b.r2;r++)if(G.linhas[r]&&vis(r))rs.push(r);excluirLinhas(rs);break}
    case "graf":abertos.graf=t.dataset.v;guardarAbertos();renderTopo();break;
    case "repetir":{const l=S.lanc[S.lanc.length-1];if(l)usarModelo(l.id);else toast("Ainda não há peça para repetir.");break}
    case "faixa-salvar":{const f=S.form,gr=gradeBy(f.grade);if(gr){gr.faixa=gr.itens.filter(x=>(f.gsel||[]).includes(x.id)).map(x=>x.nome).join(", ");salvar(true,false);renderCfg();toast(gr.faixa?`Tamanhos padrão: ${gr.faixa}`:"Padrão removido: nenhum tamanho vem marcado.")}break}
    case "mc-add":{modeloAtual().cols.push({k:"",h:"Nova coluna",on:true});salvar(true,false);renderCfg();renderTopo();break}
    case "mc-del":{modeloAtual().cols.splice(+t.closest("[data-mc]").dataset.mc,1);salvar(true,false);renderCfg();renderTopo();break}
    case "mc-up":case "mc-down":{const cs=modeloAtual().cols,i=+t.closest("[data-mc]").dataset.mc,j=a==="mc-up"?i-1:i+1;if(j>=0&&j<cs.length){[cs[i],cs[j]]=[cs[j],cs[i]];salvar(true,false);renderCfg()}break}
    case "mod-sel":{if(!C.modelos.some(x=>x.id===t.dataset.id))break;C.modelo=t.dataset.id;salvar(true,false);renderTopo();renderCfg();break}
    case "mod-dup":{const mo=JSON.parse(JSON.stringify(modeloAtual()));mo.id=uid();mo.nome+=" (cópia)";C.modelos.push(mo);C.modelo=mo.id;salvar(true,false);render();break}
    case "mod-del":{if(C.modelos.length>1){C.modelos=C.modelos.filter(x=>x.id!==C.modelo);C.modelo=C.modelos[0].id;salvar(true,false);render()}break}
    case "fotos-enviar":enviarFotos();break;
    case "zoom":{const k=t.dataset.z,d=+t.dataset.d;ZM[k]=d===0?1:Math.min(1.6,Math.max(0.7,Math.round((ZM[k]+d*0.1)*10)/10));zoomAplicar(true);break}
    case "mod-av":abertos.modAv=!abertos.modAv;guardarAbertos();renderCfg();break;
    case "mod-brancas":abertos.modTodas=!abertos.modTodas;guardarAbertos();renderCfg();break;
    case "mod-novo":abrirNovoSistema();break;
    case "novo-ok":{const N=NOVO;if(!N)break;const mo={id:uid(),nome:(String(N.nome||"").trim()||"Novo sistema"),formato:N.formato,sep:N.sep,dec:N.dec,enc:"utf8bom",
      cols:N.cols.map(c=>{const x={k:c.k||"",h:c.h||"",on:true};if(c.tipo)x.tipo=c.tipo;if(c.fator)x.fator=c.fator;return x})};
      C.modelos.push(mo);C.modelo=mo.id;NOVO=null;const o=document.querySelector(".rep");if(o)o.remove();salvar(true,false);render();
      toast(`“${mo.nome}” pronto: é só escolher “${mo.nome}” em Exportar para e baixar. Faça um teste pequeno no outro sistema antes de importar tudo.`);break}
    case "mod-conferir":{const g=gerar();if(!g.linhas.length){toast("A tabela está vazia: lance ou cole peças antes de conferir.");break}if(!abrirConferencia(g,colunasExport(),null))toast("Tudo certo: a tabela atende às regras do modelo.");break}
    case "mod-salvar":modeloParaJson(modeloAtual());break;
    case "exp-assim":{const o=document.querySelector(".rep");if(o)o.remove();const a=expPend;expPend=null;if(a&&a.tipo==="copiar")copiar(a.ids,true);else baixar(true);break}
    case "mod-bling":{const mo=modeloBling();mo.id=uid();C.modelos.push(mo);C.modelo=mo.id;salvar(true,false);render();toast("Modelo Bling criado. Fornecedor e Categoria saem em branco: o Bling só aceita nomes que já existem nele (depois de cadastrá-los, ligue-os em “Recebe o dado de”). Use o botão Validar do Bling antes de Importar.");break}
    case "mod-jueri":{const mo=modeloJueri();mo.id=uid();C.modelos.push(mo);C.modelo=mo.id;salvar(true,false);render();break}
    case "ordem":C.ordem=t.dataset.v;salvar(true,false);renderTopo();break;
    case "add-limpar":adicionar(true);break;
    case "tg-min":abertos.min=!abertos.min;guardarAbertos();renderForm();break;
    case "tg-det":abertos.det=!abertos.det;guardarAbertos();renderForm();break;
    case "rom-q":{const f=S.form,i=t.dataset.i!=null?+t.dataset.i:null,r=i!=null&&ROM?ROM.rows[i]:null;romQ0={I:f.v.I,J:f.v.J};romQRow=i;if(r&&["sub","gi","cv"].includes(t.dataset.q)){if(r.cat)f.v.I=r.cat;if(t.dataset.q!=="sub"){if(r.sub)f.v.J=r.sub;else delete f.v.J}}quick=t.dataset.q;quickB=null;renderForm();const el=document.querySelector("#formWrap .nf");if(el)el.scrollIntoView({block:"center"});refocar("#q1");break}
    case "q":quickPre="";quick=quick===t.dataset.q&&(t.dataset.qb||null)===quickB?null:t.dataset.q;quickB=quick?(t.dataset.qb||null):null;renderForm();break;
    case "q-salvar":salvarRapido();break;
    case "multi-mais":{MULTI.push({F:"",N:"",P:""});renderForm();const ins=document.querySelectorAll('#multiPanel [data-mf="F"]');if(ins.length)ins[ins.length-1].focus();break}
    case "multi-del":{MULTI.splice(+t.dataset.i,1);renderForm();break}
    case "multi-limpar":{MULTI=[];renderForm();break}
    case "multi-ok":{const f=S.form,F0=f.v.F,N0=f.v.N,P0=f.v.P,antes=S.lanc.length,resto=[];let add=0;
      MULTI.forEach(m=>{if(!String(m.F||"").trim()&&!String(m.N||"").trim()&&!String(m.P||"").trim())return;f.v.F=m.F;if(m.N)f.v.N=m.N;else if(N0==null)delete f.v.N;else f.v.N=N0;if(m.P)f.v.P=m.P;else if(P0==null)delete f.v.P;else f.v.P=P0;if(adicionar(false,true))add++;else resto.push(m)});
      f.v.F=F0;if(N0==null)delete f.v.N;else f.v.N=N0;if(P0==null)delete f.v.P;else f.v.P=P0;erro="";MULTI=resto;
      const ids=S.lanc.slice(antes).map(l=>l.id);if(ids.length)undo={tipo:"dup",ids};salvar(false);renderTopo();renderForm();if(ids.length)mostrarNoFim(ids[ids.length-1]);
      toast(add?`${add} peça(s) adicionada(s) no fim da tabela.${resto.length?` ${resto.length} linha(s) ficaram aqui: confira os campos obrigatórios.`:""}`:"Nenhuma peça entrou: confira os campos obrigatórios do formulário.",add?{t:"Desfazer",fn:desfazer}:null);break}
    case "q-fechar":romQFim();quick=null;renderForm();break;
    case "bk-escolher":{if(typeof showDirectoryPicker!=="function"){toast("Este navegador não deixa escolher pasta. Use o Chrome ou o Edge.");break}
      showDirectoryPicker({mode:"readwrite",id:"cadpecas-bk"}).then(async h=>{await idbPut("pontos","pasta",h);const r=await bkAuto(true,true);toast(typeof r==="string"&&r.startsWith("cadastro")?"Backup automático ligado: "+r:"Pasta escolhida, mas não consegui gravar agora ("+r+").");bkStatus()}).catch(e=>{if(e&&e.name!=="AbortError")toast("Não consegui usar essa pasta.")});break}
    case "bk-agora":{bkAuto(true,true).then(r=>{toast(typeof r==="string"&&r.startsWith("cadastro")?"Backup salvo na pasta: "+r:r===null?"Escolha uma pasta primeiro.":"Não consegui gravar ("+r+").");bkStatus()});break}
    case "bk-perm":{bkAuto(true,true).then(()=>bkStatus());break}
    case "bk-desligar":{idbDel("pontos","pasta").then(()=>{toast("Backup automático desligado.");bkStatus()});break}
    case "guia-fechar":abertos.guiaX=true;guardarAbertos();renderTopo();break;
    case "undo-b":desfazer();break;
    case "redo-b":desfazer(true);break;
    case "ponto-novo":pontoSalvar("criado por você").then(ok=>{toast(ok?"Ponto de restauração criado.":"Não consegui criar o ponto (armazenamento do navegador).");pontosCarregar()});break;
    case "ponto-voltar":pontoRestaurar(t.dataset.k);break;
    case "ir":if(celular())formAbrir(false);irPara(t.dataset.sec);break;
    case "ctab":if(celular())formAbrir(false);catUI.dup=null;catUI.corNova=null;resetArm=null;abertos.tab=t.dataset.id;guardarAbertos();renderCfg();break;
    case "exemplo":S.lanc=exemplo();salvar(false);renderTopo();break;
    case "xlsx":baixar();break;
    case "copiar":copiar();break;
    case "exp-limpar":gravarExport(true);break;case "exp-so":gravarExport(false);break;case "exp-nao":lastExport=null;renderTopo();break;
    case "cat-add":{const inp=document.getElementById("novaCat"),v=inp.value.replace(/\s+/g," ").trim();
      const er=nomeCatErro(C,v,null);if(er){toast(er);inp.focus();break}
      const pf=prefixoNovo(C,v),p=pf.p;
      C.categorias.push({nome:v,prefixo:p,subs:[]});if(!(p in C.seqs))C.seqs[p]="0";salvar(true,false);render();
      toast(`Categoria “${v}” criada com o prefixo ${p}.${pf.rep?` O prefixo ${p} já é de outra categoria: as duas vão dividir a mesma numeração. Troque o prefixo se não quiser.`:""} Agora é só digitar as subcategorias.`,{t:"Desfazer",fn:desfazer});
      refocar(`[data-cat="${C.categorias.length-1}"] [data-enter="sub"]`);break}
    case "colar-abrir":{catUI.colar=true;if(abertos.tab!=="cat"){abertos.tab="cat";guardarAbertos()}renderCfg();refocar("#colarTx");break}
    case "colar-fechar":catUI.colar=false;renderCfg();break;
    case "banner-fechar":abertos.catBanner=true;guardarAbertos();renderCfg();break;
    case "colar-ok":{const pl=planoLista(C,catUI.txt),[nc,ns]=contaPlano(pl);if(!nc&&!ns){toast("Nada novo para criar.");break}
      aplicaPlano(C,pl);catUI.colar=false;catUI.txt="";salvar(true,false);render();
      const rep=pl.novas.filter(n=>n.rep).map(n=>n.nome);
      refocar('[data-act="colar-abrir"]');toast(`Criei ${nc} categoria(s) e ${ns} subcategoria(s).${rep.length?` Atenção: ${rep.join(", ")} repete o prefixo de outra categoria (dividem a numeração).`:""}`,{t:"Desfazer",fn:desfazer});break}
    case "modelo-add":{const ms=t.dataset.m==="todos"?MODELOS_CAT:MODELOS_CAT.filter(m=>m.id===t.dataset.m);let nc=0,ns=0,ng=0;
      ms.forEach(m=>{const pl=planoLista(C,m.linha),[a,b2]=contaPlano(pl);aplicaPlano(C,pl);nc+=a;ns+=b2;
        if(m.grade){const cat=acharCat(C,"Anéis");if(cat&&!cat.grade){cat.grade=mkGrade([],uid());ng++}}});
      if(!nc&&!ns&&!ng){toast("Já estava tudo cadastrado — nada foi mudado.");break}
      salvar(true,false);render();toast(`Modelo aplicado: ${nc} categoria(s) e ${ns} subcategoria(s) novas${ng?", com os tamanhos dos anéis":""}.`,{t:"Desfazer",fn:desfazer});break}
    case "cat-az":case "cat-up":case "cat-down":{catUI.dup=null;
      if(a==="cat-az")C.categorias.sort((x,y)=>semAc(x.nome).localeCompare(semAc(y.nome),"pt"));
      else{const j=a==="cat-up"?ci-1:ci+1;if(j<0||j>=C.categorias.length)break;[C.categorias[ci],C.categorias[j]]=[C.categorias[j],C.categorias[ci]];salvar(true,false);render();refocar(`[data-cat="${j}"] [data-act="${a}"]`);break}
      salvar(true,false);render();toast("Categorias em ordem de A a Z.",{t:"Desfazer",fn:desfazer});break}
    case "sub-az":case "sub-up":case "sub-down":{const c=C.categorias[ci],sb=c.subs;
      if(a==="sub-az"){sb.sort((x,y)=>semAc(x).localeCompare(semAc(y),"pt"));salvar(true,false);render();toast(`Subcategorias de ${c.nome} em ordem de A a Z.`,{t:"Desfazer",fn:desfazer});break}
      const j0=+t.dataset.j,j=a==="sub-up"?j0-1:j0+1;if(j<0||j>=sb.length)break;[sb[j0],sb[j]]=[sb[j],sb[j0]];salvar(true,false);render();refocar(`[data-cat="${ci}"] [data-act="${a}"][data-j="${j}"]`)||0;break}
    case "sub-ren":{catUI.ren={i:ci,j:+t.dataset.j};renderCfg();const el=document.querySelector(`[data-cat="${ci}"] [data-subren]`);if(el){el.focus();el.select()}break}
    case "bn-pronto":{const b=C.banhistas[bi],tp=BANHOS_PRONTOS[t.dataset.tp];if(!b||!tp)break;const L=letraBanhoLivre(b);if(!L){toast("Já existem banhos de A a Z neste galvânica — não cabe mais um.");break}
      const nome=nomeBanhoLivre(b,tp.nome);let cor=tp.cor;if(cor){const ach=C.cores.find(c=>semAc(c)===semAc(cor));if(ach)cor=ach;else C.cores.push(cor)}else cor="";
      b.banhos.push({id:uid(),nome,letra:L,cor,mil:"",modo:"peso",mult:"",coluna:tp.coluna,sufixo:tp.sufixo,marcado:false,vz:true});salvar(true,false);render();
      toast(`Banho “${nome}” (letra ${L}) criado em ${b.nome}. Preencha milésimos e valor na tabela por categoria, logo abaixo.`,{t:"Desfazer",fn:desfazer});refocar(`[data-bh="${bi}"] [data-bmv="${b.banhos.length-1}"][data-mcat="__padrao"]`);break}
    case "bn-dup":{const b=C.banhistas[bi],j=+t.closest("[data-bn]").dataset.bn,o=b.banhos[j];const L=letraBanhoLivre(b);if(!L){toast("Já existem banhos de A a Z neste galvânica — não cabe mais um.");break}
      const n=clone(o);n.id=uid();n.letra=L;n.marcado=false;n.nome=nomeBanhoLivre(b,o.nome);b.banhos.splice(j+1,0,n);salvar(true,false);render();
      toast(`Banho duplicado como “${n.nome}” (letra ${L}).`,{t:"Desfazer",fn:desfazer});refocar(`[data-bh="${bi}"] [data-bn="${j+1}"] [data-bnf="nome"]`);break}
    case "cor-nova-ok":corNovaOk();break;
    case "cor-nova-no":{const cn0=catUI.corNova;catUI.corNova=null;renderCfg();if(cn0)refocar(`[data-bh="${cn0.bi}"] [data-bn="${cn0.j}"] [data-bnf="cor"]`);break}
    case "cat-dup":dupAbrir(ci);break;
    case "cat-dup-ok":dupOk();break;
    case "cat-dup-no":{const di=catUI.dup?catUI.dup.i:0;catUI.dup=null;renderCfg();refocar(`[data-cat="${di}"] [data-act="cat-dup"]`);break}

    case "cat-del":catUI.dup=null;delCat=C.categorias[ci].nome;renderCfg();break;
    case "cat-del-no":delCat=null;renderCfg();break;
    case "cat-del-ok":{const nome=C.categorias[ci].nome;const nUso=S.lanc.filter(l=>val(l,"I")===nome).length;if(nUso){delCat=null;toast(`Não excluí “${nome}”: ${nUso} peça(s) lançadas usam esta categoria (a referência delas mudaria). Mude a categoria dessas peças antes.`);render();return}C.categorias.splice(ci,1);delCat=null;
      if(S.form.v.I===nome){S.form.v.I=C.categorias.length?C.categorias[0].nome:"";delete S.form.v.J;sincGrade(S.form)}
      salvar(true);render();toast(`Categoria “${nome}” excluída.`);break}
    case "lote-add":{const r=ROM.rows[+t.dataset.i],inp=t.closest(".rc").querySelector("[data-lotn]");if(r)romLoteAdd(r,Math.max(1,Math.min(60,Math.trunc(num(inp&&inp.value)||1))));break}
    case "lote-resto":{const r=ROM.rows[+t.dataset.i];if(!r)break;const R=romLoteResumo(r);if(R.dif>0.05)romLoteAdd(r,1,R.dif);else toast("O peso do lote já fechou.");break}
    case "lote-del":{ROM.rows.splice(+t.dataset.i,1);if(ROM.rows.length)romSalvarSoon();else romLimparRascunho();renderRom();break}   /* lista vazia: apaga o rascunho, senão o anterior reaparece */
    case "imp-pick":{document.getElementById("impFile").click();break}
    case "imp-up":{const i=+t.dataset.i;if(i>0){[IMPQ[i-1],IMPQ[i]]=[IMPQ[i],IMPQ[i-1]];renderImp()}break}
    case "imp-down":{const i=+t.dataset.i;if(i<IMPQ.length-1){[IMPQ[i+1],IMPQ[i]]=[IMPQ[i],IMPQ[i+1]];renderImp()}break}
    case "imp-del":{IMPQ.splice(+t.dataset.i,1);renderImp();break}
    case "imp-limpar":{IMPQ=[];renderImp();break}
    case "imp-abrir":{const q=IMPQ.splice(+t.dataset.i,1)[0];renderImp();if(q)impAbrirArq(q.file);break}
    case "lib-grade-add":{C.grades=C.grades||[];C.grades.push({id:uid(),nome:"Nova variação",rotulo:" ",col:"",modoRef:"letra",subs:[],itens:[]});abertos["go:"+(C.grades.length-1)]=true;guardarAbertos();salvar(true,false);render();break}
    case "lib-grade-pmg":{C.grades=C.grades||[];const g={id:uid(),nome:"P M G",rotulo:" tamanho ",col:"K",modoRef:"letra",subs:[],itens:[]};addTamanhos(g,"P M G");C.grades.push(g);abertos["go:"+(C.grades.length-1)]=true;guardarAbertos();salvar(true,false);render();break}
    case "cor-on":{const f=S.form;f.corOn=true;renderForm();break}
    case "cor-off":{const f=S.form;f.corOn=false;f.csel=[];renderTopo();renderForm();break}
    case "rom-cor-on":{const r=ROM.rows[+t.closest(".rc").dataset.i];romArma(r);r.corOn=true;renderRom();break}
    case "go-del":C.grades.splice(+t.dataset.k,1);salvar(true,false);renderCfg();break;
    case "sub-del":C.categorias[ci].subs.splice(+t.dataset.j,1);salvar(true,false);render();break;
    case "forn-add":{const nomeLivre=b0=>{let n=b0,k=2;while(C.fornecedores.some(x=>semAc(x.nome)===semAc(n)))n=b0+" "+(k++);return n};C.fornecedores.push({nome:nomeLivre("Novo fornecedor"),desconto:"0",tipo:"bruta",codigo:""});salvar(true,false);render();break}
    case "forn-dup":{const i=+t.closest("[data-forn]").dataset.forn,f=clone(C.fornecedores[i]);{const b0=f.nome+" (cópia)";let n=b0,k=2;while(C.fornecedores.some(x=>semAc(x.nome)===semAc(n)))n=b0+" "+(k++);f.nome=n}C.fornecedores.splice(i+1,0,f);salvar(true,false);render();break}
    case "forn-del":C.fornecedores.splice(+t.closest("[data-forn]").dataset.forn,1);salvar(true,false);render();break;
    case "bh-add":C.banhistas.push({id:uid(),nome:"Nova galvânica",verniz:"0.42",vernizOn:true,banhos:clone(BANHISTA0.banhos)});salvar(true,false);render();break;
    case "bh-dup":{const b=clone(C.banhistas[bi]);b.id=uid();b.nome+=" (cópia)";C.banhistas.splice(bi+1,0,b);salvar(true,false);render();break}
    case "bh-del":{const id=C.banhistas[bi].id;{const n=S.lanc.filter(l=>l.banhista===id).length;if(n&&!confirm(`${n} peça(s) já lançadas usam esta galvânica. Remover mesmo assim? (Ctrl+Z desfaz)`))break}C.banhistas.splice(bi,1);C.fornecedores.forEach(f=>{if(f.banhista===id)f.banhista=""});salvar(true);render();break}
    case "bn-add":{const b=C.banhistas[bi],usadas=b.banhos.map(x=>x.letra);let L="A";while(usadas.some(u=>String(u).toUpperCase()===L)&&L<"Z")L=String.fromCharCode(L.charCodeAt(0)+1);if(usadas.some(u=>String(u).toUpperCase()===L)){toast("Já existem banhos de A a Z neste galvânica — não cabe mais um.");break}b.banhos.push({id:uid(),nome:"Ródio",letra:L,cor:"Ródio",mil:"",modo:"peso",mult:"",coluna:"S",sufixo:" banho ródio",marcado:false,vz:true});salvar(true,false);render();break}
    case "bn-del":{{const bh0=C.banhistas[bi],bn0=bh0.banhos[+t.closest("[data-bn]").dataset.bn],n=S.lanc.filter(l=>l.banhista===bh0.id&&((l.on&&l.on[bn0.id])||(l.onP&&l.onP[bn0.id]))).length;if(n&&!confirm(`${n} peça(s) já lançadas usam o banho “${bn0.nome}”. Remover mesmo assim? (Ctrl+Z desfaz)`))break}C.banhistas[bi].banhos.splice(+t.closest("[data-bn]").dataset.bn,1);salvar(true);render();break}
    case "cc-reset":C.colcfg=colcfgPadrao();salvar(true,false);render();break;
    case "cor-add":case "obs-add":{const inp=t.closest(".add")&&t.closest(".add").querySelector("input");if(inp){if(!inp.value.trim())inp.focus();else inp.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}))}break}
    case "cor-del":C.cores.splice(+t.dataset.j,1);salvar(true,false);render();break;
    case "obs-del":C.observacoes.splice(+t.dataset.j,1);salvar(true,false);render();break;
    case "cs-padrao":{const f=S.form,c=catBy(f.v.I);if(!c)break;c.coresCfg=c.coresCfg||{};c.coresCfg.padrao=(f.csel||[]).slice();salvar(true,false);renderCfg();toast((f.csel||[]).length?"Cores padrão salvas: ao escolher "+f.v.I+" elas já vêm marcadas.":"Padrão removido: nenhuma cor vem marcada.");break}
    case "cs-todas":{const f=S.form,l=coresDaCat(f.v.I,f.v.J);f.csel=f.csel&&f.csel.length===l.length?[]:l.map(x=>x.id);renderTopo();renderForm();salvar(false);break}
    case "cv-del":{const c=C.categorias[ci],j=+t.closest("[data-cvi]").dataset.cvi;c.cores.splice(j,1);abertos["cv:"+c.nome]=true;guardarAbertos();salvar(true,false);render();break}
    case "cv-num":{const c=C.categorias[ci];(c.cores||[]).forEach(x=>{if(vazio(x.letra))x.letra=proxCorLetra(c,x.nome)});abertos["cv:"+c.nome]=true;guardarAbertos();salvar(true,false);render();break}
    case "cv-todas":{const c=C.categorias[ci];c.cores=c.cores||[];C.cores.forEach(n=>{if(!c.cores.some(y=>semAc(y.nome)===semAc(n)))c.cores.push({id:uid(),nome:n,texto:"",letra:proxCorLetra(c,n)})});abertos["cv:"+c.nome]=true;guardarAbertos();salvar(true,false);render();break}
    case "gi-todos":{const f=S.form,gr=gradeBy(f.grade);if(gr){f.gsel=f.gsel&&f.gsel.length===gr.itens.length?[]:gr.itens.map(x=>x.id);renderTopo();renderForm();salvar(false)}break}
    case "gr-add":{const c=C.categorias[ci];c.grade={id:uid(),nome:"Tamanhos",rotulo:" tamanho ",col:"K",subs:[],itens:[]};abertos["g:"+c.nome]=true;guardarAbertos();salvar(true,false);render();break}
    case "gr-own":{const c=C.categorias[ci],e=effGrade(c),sb=c.grade.subs,id=c.grade.id;c.grade={...clone(e),id,subs:sb};delete c.grade.usa;salvar(true,false);render();break}
    case "gr-del":{const c=C.categorias[ci];c.grade=null;delete c.grade;sincGrade(S.form);salvar(true);render();break}
    case "gi-del":{const g=gradeDoEl(t);g.itens.splice(+t.closest("[data-gii]").dataset.gii,1);sincGrade(S.form);salvar(true);render();break}
    case "reset":if(resetArm!==t.dataset.r){resetArm=t.dataset.r;renderCfg()}else resetar(resetArm);break;
    case "reset-no":resetArm=null;renderCfg();break;
    case "rom-abrir":{if(editId){toast("Termine ou cancele a edição antes.");break}
      if(!romRetomar()){ROM={tid:abertos.romT&&C.romaneios.some(x=>x.id===abertos.romT)?abertos.romT:C.romaneios[0].id,texto:"",rows:[],obs:"",conf:"",msg:""};
      {const T0=romT();if(T0&&T0.forn&&fornBy(T0.forn))romSetForn(T0.forn)}}
      renderRom();const w=document.getElementById("romWrap");if(w){rolarPane(w);const ta=w.querySelector("textarea");if(ta)ta.focus({preventScroll:true})}break}
    case "rom-fechar":{const lsOk=romSalvar(),pr=romGravP;ROM=null;renderRom();renderForm();
      Promise.resolve(pr).then(idbOk=>toast(lsOk?"Romaneio guardado — use “Retomar romaneio” quando quiser continuar.":idbOk?"O rascunho rápido não gravou, mas o romaneio ficou em “Romaneios salvos” (Cadastros): abra por lá para continuar.":"ATENÇÃO: não consegui guardar o romaneio (memória do navegador cheia, bloqueada ou outra aba alterou). Baixe o backup antes de sair."));break}
    case "rom-descartar":{if(romConflito){const b=document.getElementById("outraAbaRom");if(b)b.remove();romConflito=false;ROM=null;renderRom();renderForm();toast("Fechei este romaneio sem apagar nada: outra aba alterou o rascunho e a versão dela foi mantida.");break}
      romSalvar();const d=romRascunho(),sid0=ROM&&ROM.sid,jaFeito=ROM&&ROM.rows.some(r=>r.feito);romLimparRascunho();if(sid0&&!jaFeito)romExcluirSalvo(sid0);ROM=null;renderRom();renderForm();toast("Romaneio descartado.",d?{t:"Desfazer",fn:()=>{try{localStorage.setItem(ROMKEY,JSON.stringify(d));romTem=true}catch(x){}renderForm()}}:null);break}
    case "rom-lote":romLote();break;
    case "gr-novo-pmg":{const c=catBy(S.form.v.I);if(!c)break;if(!c.grade)c.grade={id:uid(),nome:"Tamanhos",rotulo:" tamanho ",col:"K",subs:[],itens:[]};const gr=effGrade(c);if(gr.itens.length&&(gr.subs||[]).length&&!(gr.subs||[]).includes(S.form.v.J)){toast(`Os tamanhos desta categoria valem só para: ${gr.subs.join(", ")}. Para usar P M G aqui, tire essa restrição em Cadastros › Categorias.`);break}addTamanhos(gr,"P M G");sincGrade(S.form);S.form.gsel=gr.itens.map(x=>x.id);S.form.semGrade=false;salvar(true,false);renderForm();renderCfg();toast("Tamanhos P, M e G criados: a letra de cada um entra na referência.");break}
    case "gi-pmg":{const gr=gradeBy(S.form.grade);if(gr){const novos=addTamanhos(gr,"P M G");S.form.gsel=gr.itens.map(x=>x.id).filter(id=>novos.includes(id)||(S.form.gsel||[]).includes(id));S.form.semGrade=false;salvar(true,false);renderForm();toast("Tamanhos P, M e G prontos: a letra de cada um entra na referência.")}break}
    case "comp-add":{const f=S.form;f.comp=f.comp||[];if(f.comp.length>=60){toast("Máximo de 60 peças por conjunto.");break}const vaz=f.comp.findIndex(x=>!x.desc&&!x.peso&&!x.custo);let n;if(vaz>=0){n=vaz;if(t.dataset.nome)f.comp[vaz].desc=t.dataset.nome}else{n=f.comp.length;f.comp.push(novaComp(t.dataset.nome||""))}conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${n}"] [data-cp="${t.dataset.nome?"peso":"desc"}"]`);break}
    case "comp-dup":{const f=S.form,i=+t.dataset.ci,c=f.comp&&f.comp[i];if(!c)break;if(f.comp.length>=60){toast("Máximo de 60 peças por conjunto.");break}f.comp.splice(i+1,0,{...clone(c),id:uid()});conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${i+1}"] [data-cp="peso"]`);break}
    case "comp-up":case "comp-down":{const f=S.form,i=+t.dataset.ci,j=a==="comp-up"?i-1:i+1;if(!f.comp||j<0||j>=f.comp.length)break;[f.comp[i],f.comp[j]]=[f.comp[j],f.comp[i]];conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${j}"] [data-act="${a}"]`);break}
    case "comp-del":{const f=S.form;f.comp.splice(+t.dataset.ci,1);conjSync(f);salvar(false);renderTopo();renderForm();break}
    case "foto-testar":testarChaveImgbb();break;
    case "foto-add":ftAlvo=t.dataset.lid;document.getElementById("ftIn").click();break;
    case "foto-form":ftAlvo="__form";document.getElementById("ftIn").click();break;
    case "foto-rem":fotoRemover(editId||null);break;
    case "foto-rem-rom":{if(editId){const l=S.lanc.find(x=>x.id===editId);if(l)delete l.ftR}delete S.form.ftR;salvar(false);renderTopo();renderForm();toast("Foto do romaneio removida desta peça.");break}
    case "tab-foto":{const lid=t.dataset.lid,src=t.src;(lid?idbGet("fotos",lid):Promise.resolve(null)).then(u=>abrirZoom(u||src));break}
    case "rom-lista":romListaAbrir();break;
    case "rom-refazer-todas":{if(!ROM)break;let n=0;ROM.rows.forEach(r=>{if(r.feito&&!r.arq){r.refaz=true;r.skip=false;r.aviso="";n++}});ROM.msg=n?`${n} peça(s) já lançadas liberadas para edição. Mude o que quiser e clique em Criar peças: elas substituem as antigas.`:"Nenhuma peça já lançada para editar.";renderRom();break}
    case "rom-salvo-abrir":{document.querySelectorAll(".rep").forEach(x=>x.remove());romAbrirSalvo(t.dataset.id);break}
    case "rom-salvo-del":{if(romArm!==t.dataset.id){romArm=t.dataset.id;romListaRef()}else{romExcluirSalvo(romArm);romArm=null;romListaRef();renderForm()}break}
    case "backup-total":backupTotal();break;
    case "tab-lista":tabListaAbrir();break;
    case "tab-salvar-abrir":tabSalvarAbrir();break;
    case "tab-salvar-ok":tabSalvarOk();break;
    case "tab-ver":tabVer(t.dataset.id);break;
    case "tab-del":{if(tabArm!==t.dataset.id){tabArm=t.dataset.id;tabListaAbrir()}else{const tx=TABS.find(x=>x.id===tabArm);idbDel("tabs",tabArm);TABS=TABS.filter(x=>x.id!==tabArm);TABDEL.add(tabArm);gravarIdx("cadpecas-tabs",TABS,TABDEL);arqRef();if(tx)(tx.ids||[]).forEach(i=>candFoto.add(i));varrerFotos();tabArm=null;tabListaAbrir()}break}
    case "tab-restaurar":tabRestaurar(t.dataset.id);break;
    case "tab-csv":idbGet("tabs",t.dataset.id).then(rc=>{if(rc)arqSalvar("tabela-"+String(rc.nome).replace(/[^A-Za-z0-9 _-]/g,"-")+".csv",tabCsv(rc))});break;
    case "rom-ver":romVer(t.dataset.id,t.dataset.de);break;
    case "rel-abrir":relAbrir();break;
    case "rel-fechar":{tabArm=null;romArm=null;const o=document.querySelector(".rep");if(o)o.remove();renderForm();break}
    case "rel-print":window.print();break;
    case "rel-copy":{const R=relLer();if(R)navigator.clipboard.writeText(relTexto(R)).then(()=>toast("Resumo copiado.")).catch(()=>toast("O navegador não liberou a cópia."));break}
    case "rel-csv":{const R=relLer();if(R)arqSalvar("Relatorio romaneio "+new Date(R.em).toISOString().slice(0,10)+".csv",relCsv(R));break}
    case "rel-undo":{const o=document.querySelector(".rep");if(o)o.remove();desfazer();break}
    case "rom-pend":{let ri=-1,cmp=0;ROM.rows.forEach((r,i)=>{if(ri>=0||r.skip)return;if(!(num(r.peso)>0)){ri=i;cmp=1}else if(romSomaDe(r,romColsR(r))!==r.qtd){ri=i;cmp=2}else if(gradeDaCat(r.cat,r.sub)&&!r.semG&&!(r.gsel||[]).length&&!(r.csel||[]).length){ri=i;cmp=3}else if(r.catq){ri=i;cmp=4}});
      if(ri<0){toast("Nenhuma pendência: tudo preenchido.");break}const rc=document.querySelector(`#romWrap .rc[data-i="${ri}"]`);if(rc){rolarPane(rc);if(cmp===3){const r3=ROM.rows[ri];if(!r3.open){r3.open=true;rc.classList.add("op");const bd=rc.querySelector("[data-body]");if(bd&&!bd.innerHTML.trim()){bd.innerHTML=romBodyHTML(r3);romAtual()}}}const el=cmp>=3?rc.querySelector("[data-rp=cat]"):cmp===1?rc.querySelector("[data-rp=peso]"):(rc.querySelector("[data-rp=q]")||rc.querySelector("[data-act=rom-x]"));if(el)setTimeout(()=>el.focus({preventScroll:true}),250)}break}
    case "rev-fechar":{const o=document.querySelector(".rev");if(o)o.remove();break}
    case "rev-ok":{const o=document.querySelector(".rev");if(o)o.remove();romCriar();break}
    case "rev-filtro":{const o=document.querySelector(".rev");if(o)o.classList.toggle("so-al",t.checked);break}
    case "rev-ir":{const o=document.querySelector(".rev");if(o)o.remove();const rc=document.querySelector(`#romWrap .rc[data-i="${t.dataset.i}"]`),r=ROM.rows[+t.dataset.i];if(rc&&r){r.open=true;rc.classList.add("op");const bd=rc.querySelector("[data-body]");if(bd&&!bd.innerHTML.trim()){bd.innerHTML=romBodyHTML(r);romAtual()}rolarPane(rc)}break}
    case "rom-foto":{const im=t.querySelector("img");if(im)abrirZoom(im.src);break}
    case "rom-ex-add":{const rc=t.closest(".rc"),r=ROM.rows[+rc.dataset.i],k=rc.querySelector("[data-rp=exk]").value,v=rc.querySelector("[data-rp=exv]").value;if(!vazio(v)){r.ex=r.ex||{};r.ex[k]=v;r.open=true;renderRom()}break}
    case "rom-ex-del":{const r=ROM.rows[+t.closest(".rc").dataset.i];delete r.ex[t.dataset.k];r.open=true;renderRom();break}
    case "rom-ler":romLer();break;
    case "rom-criar":romRevisar();break;
    case "rom-x":{const rc=t.closest(".rc"),r=ROM.rows[+rc.dataset.i];r.open=!r.open;rc.classList.toggle("op",r.open);const bd=rc.querySelector("[data-body]");if(r.open&&bd&&!bd.innerHTML.trim()){bd.innerHTML=romBodyHTML(r);romAtual()}break}
    case "rom-div":{const r=ROM.rows[+t.closest(".rc").dataset.i];romArma(r);if(romKeys(r,romColsR(r)).length)romDividir(r,romColsR(r));else toast("Escolha os tamanhos antes.");renderRom();break}
    case "rom-div-todas":{ROM.rows.forEach(r=>{if(!r.skip&&(!gradeDaCat(r.cat,r.sub)||r.semG)&&!(r.csel||[]).length)romDividir(r,romColsR(r))});renderRom();break}
    case "rom-pmg":{const i=+t.dataset.i,r=ROM&&ROM.rows[i];if(!r)break;romArma(r);let g=gradeDaCat(r.cat,r.sub);const c=catBy(r.cat);if(!g&&c){c.grade={id:uid(),nome:"Tamanhos",rotulo:" tamanho ",col:"K",subs:[],itens:[]};g=c.grade}if(!g)break;const nv=addTamanhos(g,"P M G");r.gsel=g.itens.map(x=>x.id).filter(id=>nv.includes(id)||(r.gsel||[]).includes(id));r.semG=false;salvar(true,false);renderRom();break}
    case "rom-gpad":{const i=+t.dataset.i,r=ROM&&ROM.rows[i],g=r&&gradeDaCat(r.cat,r.sub);if(!g)break;g.faixa=g.itens.filter(x=>(r.gsel||[]).includes(x.id)).map(x=>x.nome).join(", ");salvar(true,false);toast(g.faixa?"Tamanhos padrão: "+g.faixa:"Padrão removido: nenhum tamanho vem marcado.");break}
    case "rom-cpad":{const i=+t.dataset.i,r=ROM&&ROM.rows[i],c=r&&catBy(r.cat);if(!c)break;c.coresCfg=c.coresCfg||{};c.coresCfg.padrao=(r.csel||[]).slice();salvar(true,false);toast((r.csel||[]).length?"Cores padrão salvas para "+c.nome+".":"Padrão removido: nenhuma cor vem marcada.");break}
    case "rom-ct":{const r=ROM.rows[+t.closest(".rc").dataset.i];romArma(r);const l=coresDaCat(r.cat,r.sub);r.csel=(r.csel||[]).length===l.length?[]:l.map(x=>x.id);renderRom();break}
    case "rom-gt":{const r=ROM.rows[+t.closest(".rc").dataset.i],g=gradeDaCat(r.cat,r.sub);if(g){romArma(r);r.gsel=(r.gsel||[]).length===g.itens.length?[]:g.itens.map(x=>x.id);renderRom()}break}
    case "rom-tipo":{const f=S.form;f.tipo=t.dataset.v;if(f.tipo==="bruta"){if(!Object.values(f.on||{}).some(Boolean))marcadosPadrao(f);banhistaDoFornecedor(f)}ROM.rows.forEach(r=>{if(r.feito)return;r.q={};romNovaCat(r)});salvar(false);renderForm();renderRom();break}
    case "rom-add":C.romaneios.push({...clone(ROMS0()[0]),id:uid(),nome:"Novo fornecedor",forn:""});salvar(true,false);renderCfg();break;
    case "rom-dup":{const i=+t.closest("[data-rom]").dataset.rom,x=clone(C.romaneios[i]);x.id=uid();x.nome+=" (cópia)";C.romaneios.splice(i+1,0,x);salvar(true,false);renderCfg();break}
    case "rom-del":{if(C.romaneios.length>1){C.romaneios.splice(+t.closest("[data-rom]").dataset.rom,1);salvar(true,false);renderCfg()}else toast("Mantenha pelo menos um modelo.");break}
    case "rom-map-auto":{const T=C.romaneios[+t.closest("[data-rom]").dataset.rom],a=parseMapa(T.mapa);let n=0;const add=(w,cat,sub)=>{w=String(w).trim();if(!w||a.some(m=>kSub(m.w)===kSub(w)))return;a.push({w,c:cat,s:sub||""});n++};
      C.categorias.forEach(c=>add(c.nome,c.nome,""));C.categorias.forEach(c=>(c.subs||[]).forEach(sb=>{if(C.categorias.some(x=>kSub(x.nome)===kSub(sb)))return;add(sb,c.nome,sb)}));
      T.mapa=mapaStr(a);salvar(true,false);renderCfg();toast(n?`${n} palavra(s) criadas a partir das suas categorias.`:"Todas as suas categorias já estão no mapa.",{t:"Desfazer",fn:desfazer});break}
    case "rom-plan-ok":{const P=ROM&&ROM.plan;if(!P)break;const m=P.map,nn=v=>{const x=String(v==null?"":v).replace(/[R$\s]/g,"");return x===""?null:num(x)},rows=[];
      const ruim=[],zero=[];P.rows.forEach(r=>{const desc=String(m.desc==null?"":r[m.desc]).replace(/\s+/g," ").trim();if(!desc){const cd=m.cod==null?"":String(r[m.cod]||"").trim();if(cd&&(m.qtd==null||nn(r[m.qtd])>0))ruim.push(cd.slice(0,30)+" (sem descrição)");return}const qn=m.qtd==null?1:nn(r[m.qtd]);if(qn===0){zero.push(desc.slice(0,30));return}if(qn==null||!Number.isFinite(qn)||qn<0||qn!==Math.trunc(qn)){ruim.push(desc.slice(0,30)+" ("+(m.qtd==null?"":String(r[m.qtd]).trim()||"vazio")+")");return}const qtd=qn;rows.push({desc,cod:m.cod==null?"":String(r[m.cod]||"").trim().replace(/^#/,""),qtd,preco:m.preco==null?null:nn(r[m.preco]),precod:null,total:m.total==null?null:nn(r[m.total]),aviso:""})});
      if(ruim.length){ROM.msg=`${ruim.length} linha(s) com quantidade vazia/decimal/inválida ou sem descrição, não importei nada: ${ruim.slice(0,5).join("; ")}${ruim.length>5?"…":""}. Corrija a planilha ou a coluna de quantidade.`;renderRom();break}
      if(!rows.length){ROM.msg="Nenhuma linha com descrição e quantidade. Confira as colunas.";renderRom();break}
      ROM.plan=null;romAplicaR({rows,obs:"",conf:`planilha: ${rows.length} linhas · ${rows.reduce((a,r)=>a+r.qtd,0)} peças${zero.length?` · ${zero.length} linha(s) com quantidade 0 ficaram de fora: ${zero.slice(0,5).join("; ")}${zero.length>5?"…":""}`:""}`,erro:""});break}
    case "rom-plan-no":ROM.plan=null;renderRom();break;
    case "rom-ex-abrir":romUI.ex=true;renderCfg();refocar("#romExTx");break;
    case "rom-ex-fechar":romUI.ex=false;renderCfg();break;
    case "rom-ex-ok":{const r=romExInfo();if(!r.ok)break;const tx=String(romUI.txt||"").split(/\r?\n/).map(x=>x.trim()).find(Boolean)||"Novo modelo",nome=(String(romUI.nome||"").trim()||tx).slice(0,50),T=({...clone(ROMS0()[0]),id:uid(),nome,forn:"",mapa:""}),a=parseMapa("");
      C.categorias.forEach(c=>{const add=(w,sub)=>{w=String(w).trim();if(!w||a.some(m=>kSub(m.w)===kSub(w)))return;a.push({w,c:c.nome,s:sub||""})};add(c.nome,"");(c.subs||[]).forEach(sb=>{if(C.categorias.some(x=>kSub(x.nome)===kSub(sb)))return;add(sb,sb)})});
      T.mapa=mapaStr(a);C.romaneios.push(T);romUI={ex:false,txt:"",nome:""};abertos.tab="rom";guardarAbertos();salvar(true,false);renderCfg();toast(`Modelo “${nome}” criado com ${r.R.rows.length} peça(s) de exemplo reconhecidas. Ajuste fornecedor e palavras abaixo, se quiser.`,{t:"Desfazer",fn:desfazer});break}
    case "rom-map-add":{const T=C.romaneios[+t.closest("[data-rom]").dataset.rom];T.mapa=(T.mapa?T.mapa+"; ":"")+"nova palavra=";salvar(true,false);renderCfg();break}
    case "rom-map-del":{const T=C.romaneios[+t.closest("[data-rom]").dataset.rom],a=parseMapa(T.mapa);a.splice(+t.closest(".rmr").dataset.rmj,1);T.mapa=mapaStr(a);salvar(true,false);renderCfg();break}
    case "rom-testar":{const card=t.closest("[data-rom]"),T=C.romaneios[+card.dataset.rom],R=lerRomaneioAuto(card.querySelector("[data-rtest]").value,T),o=card.querySelector(".rtres");
      o.textContent=R.erro||`${R.rows.length} peças lidas${R.conf?" · "+R.conf:""} · 1ª: ${R.rows[0].desc} (${R.rows[0].cod||"sem código"}) ${R.rows[0].qtd} un.`;break}
    case "imp-ok":aplicarImp();break;
    case "abrir-arq":{const i=document.getElementById(t.dataset.alvo);if(i)i.click();break}
    case "backup":backup();break;
  }
  if(snapCfg&&JSON.stringify(S.config)!==JSON.stringify(snapCfg))toast("Cadastro alterado.",{t:"Desfazer",fn:()=>{S.config=snapCfg;salvar(true);render()}});
});
