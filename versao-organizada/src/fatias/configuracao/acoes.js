/* Ações de clique (data-act) da fatia configuracao: catálogo, categorias, subcategorias, banhos, fornecedores, cores, variações, modelos de exportação.
   Registradas em ACOES (src/js/30-eventos-mouse-e-clique.js; carrega antes deste arquivo). Convenção: o que era `break` no switch virou `return`; `return` que pulava o
   código pós-switch (desfazer de CFG_UNDO) virou `return false`. snapCfg/CFG_UNDO continuam no listener de 30, calculados antes do despacho. */
const acaoMcUp=({t,a})=>{const cs=modeloAtual().cols,i=+t.closest("[data-mc]").dataset.mc,j=a==="mc-up"?i-1:i+1;if(j>=0&&j<cs.length){[cs[i],cs[j]]=[cs[j],cs[i]];salvar(true,false);renderCfg()}return};
const acaoCatAz=({a,C,ci})=>{catUI.dup=null;
      if(a==="cat-az")C.categorias.sort((x,y)=>semAc(x.nome).localeCompare(semAc(y.nome),"pt"));
      else{const j=a==="cat-up"?ci-1:ci+1;if(j<0||j>=C.categorias.length)return;[C.categorias[ci],C.categorias[j]]=[C.categorias[j],C.categorias[ci]];salvar(true,false);render();refocar(`[data-cat="${j}"] [data-act="${a}"]`);return}
      salvar(true,false);render();toast("Categorias em ordem de A a Z.",{t:"Desfazer",fn:desfazer});return};
const acaoSubAz=({t,a,C,ci})=>{const c=C.categorias[ci],sb=c.subs;
      if(a==="sub-az"){sb.sort((x,y)=>semAc(x).localeCompare(semAc(y),"pt"));salvar(true,false);render();toast(`Subcategorias de ${c.nome} em ordem de A a Z.`,{t:"Desfazer",fn:desfazer});return}
      const j0=+t.dataset.j,j=a==="sub-up"?j0-1:j0+1;if(j<0||j>=sb.length)return;[sb[j0],sb[j]]=[sb[j],sb[j0]];salvar(true,false);render();refocar(`[data-cat="${ci}"] [data-act="${a}"][data-j="${j}"]`)||0;return};
const acaoCorAdd=({t})=>{const inp=t.closest(".add")&&t.closest(".add").querySelector("input");if(inp){if(!inp.value.trim())inp.focus();else inp.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}))}return};
registrarAcoes(ACOES,"configuracao",{
  "insitem-add":({C})=>{C.insumosItens=Array.isArray(C.insumosItens)?C.insumosItens:[];if(C.insumosItens.length>=100){toast("Limite de 100 itens de insumo.");return}C.insumosItens.push({nome:"Novo insumo",cat:"",qtd:"1",valor:"0"});salvar(true,false);renderCfg();renderTopo();renderForm();return},
  "insitem-del":({t,C})=>{const i=+t.dataset.i;if(!Array.isArray(C.insumosItens)||!C.insumosItens[i])return;if(!confirm(`Excluir o insumo “${C.insumosItens[i].nome}”? O custo de insumos será recalculado quando os itens estiverem ativos.`))return;C.insumosItens.splice(i,1);salvar(true,false);renderCfg();renderTopo();renderForm();return},
  "forn-esq":({t,C})=>{const fo=C.fornecedores[+t.closest("[data-forn]").dataset.forn];delete fo.mem;salvar(true,false);renderCfg();toast(`${fo.nome}: lembrança apagada.`);return},
  "graf":({t})=>{abertos.graf=t.dataset.v;guardarAbertos();renderTopo();return;},
  "mc-add":()=>{modeloAtual().cols.push({k:"",h:"Nova coluna",on:true});salvar(true,false);renderCfg();renderTopo();return},
  "mc-del":({t})=>{modeloAtual().cols.splice(+t.closest("[data-mc]").dataset.mc,1);salvar(true,false);renderCfg();renderTopo();return},
  "mc-up":acaoMcUp,
  "mc-down":acaoMcUp,
  "mod-sel":({t,C})=>{if(!C.modelos.some(x=>x.id===t.dataset.id))return;C.modelo=t.dataset.id;salvar(true,false);renderTopo();renderCfg();return},
  "mod-dup":({C})=>{const mo=JSON.parse(JSON.stringify(modeloAtual()));mo.id=uid();mo.nome+=" (cópia)";C.modelos.push(mo);C.modelo=mo.id;salvar(true,false);render();return},
  "mod-del":({C})=>{if(C.modelos.length>1){C.modelos=C.modelos.filter(x=>x.id!==C.modelo);C.modelo=C.modelos[0].id;salvar(true,false);render()}return},
  "mod-av":()=>{abertos.modAv=!abertos.modAv;guardarAbertos();renderCfg();return;},
  "mod-brancas":()=>{abertos.modTodas=!abertos.modTodas;guardarAbertos();renderCfg();return;},
  "mod-bling":({C})=>{const mo=modeloBling();mo.id=uid();C.modelos.push(mo);C.modelo=mo.id;salvar(true,false);render();toast("Modelo Bling criado. Fornecedor e Categoria saem em branco: o Bling só aceita nomes que já existem nele (depois de cadastrá-los, ligue-os em “Recebe o dado de”). Use o botão Validar do Bling antes de Importar.");return},
  "mod-jueri":({C})=>{const mo=modeloJueri();mo.id=uid();C.modelos.push(mo);C.modelo=mo.id;salvar(true,false);render();return},
  "ordem":({t,C})=>{C.ordem=t.dataset.v;salvar(true,false);renderTopo();return;},
  "ctab":({t})=>{if(celular())formAbrir(false);catUI.dup=null;catUI.corNova=null;estadoConfig.resetArm=null;abertos.tab=t.dataset.id;guardarAbertos();renderCfg();if(celular())setTimeout(()=>{const ct=document.querySelector("#cfg .ctabs");if(ct&&ct.nextElementSibling)ct.nextElementSibling.scrollIntoView({block:"start"})},50);return;},
  "cat-add":({C})=>{const inp=document.getElementById("novaCat"),v=inp.value.replace(/\s+/g," ").trim();
      const er=nomeCatErro(C,v,null);if(er){toast(er);inp.focus();return}
      const pf=prefixoNovo(C,v),p=pf.p;
      C.categorias.push({nome:v,prefixo:p,subs:[]});if(!(p in C.seqs))C.seqs[p]="0";salvar(true,false);render();
      toast(`Categoria “${v}” criada com o prefixo ${p}.${pf.rep?` O prefixo ${p} já é de outra categoria: as duas vão dividir a mesma numeração. Troque o prefixo se não quiser.`:""} Agora é só digitar as subcategorias.`,{t:"Desfazer",fn:desfazer});
      refocar(`[data-cat="${C.categorias.length-1}"] [data-enter="sub"]`);return},
  "colar-abrir":()=>{catUI.colar=true;if(abertos.tab!=="cat"){abertos.tab="cat";guardarAbertos()}renderCfg();refocar("#colarTx");return},
  "colar-fechar":()=>{catUI.colar=false;renderCfg();return;},
  "banner-fechar":()=>{abertos.catBanner=true;guardarAbertos();renderCfg();return;},
  "colar-ok":({C})=>{const pl=planoLista(C,catUI.txt),[nc,ns]=contaPlano(pl);if(!nc&&!ns){toast("Nada novo para criar.");return}
      aplicaPlano(C,pl);catUI.colar=false;catUI.txt="";salvar(true,false);render();
      const rep=pl.novas.filter(n=>n.rep).map(n=>n.nome);
      refocar('[data-act="colar-abrir"]');toast(`Criei ${nc} categoria(s) e ${ns} subcategoria(s).${rep.length?` Atenção: ${rep.join(", ")} repete o prefixo de outra categoria (dividem a numeração).`:""}`,{t:"Desfazer",fn:desfazer});return},
  "modelo-add":({t,C})=>{const ms=t.dataset.m==="todos"?MODELOS_CAT:MODELOS_CAT.filter(m=>m.id===t.dataset.m);let nc=0,ns=0,ng=0;
      ms.forEach(m=>{const pl=planoLista(C,m.linha),[a,b2]=contaPlano(pl);aplicaPlano(C,pl);nc+=a;ns+=b2;
        if(m.grade){const cat=acharCat(C,"Anéis");if(cat&&!cat.grade){cat.grade=mkGrade([],uid());ng++}}});
      if(!nc&&!ns&&!ng){toast("Já estava tudo cadastrado — nada foi mudado.");return}
      salvar(true,false);render();toast(`Modelo aplicado: ${nc} categoria(s) e ${ns} subcategoria(s) novas${ng?", com os tamanhos dos anéis":""}.`,{t:"Desfazer",fn:desfazer});return},
  "cat-az":acaoCatAz,
  "cat-up":acaoCatAz,
  "cat-down":acaoCatAz,
  "sub-az":acaoSubAz,
  "sub-up":acaoSubAz,
  "sub-down":acaoSubAz,
  "sub-ren":({t,ci})=>{catUI.ren={i:ci,j:+t.dataset.j};renderCfg();const el=document.querySelector(`[data-cat="${ci}"] [data-subren]`);if(el){el.focus();el.select()}return},
  "bn-pronto":({t,C,bi})=>{const b=C.banhistas[bi],tp=BANHOS_PRONTOS[t.dataset.tp];if(!b||!tp)return;const L=letraBanhoLivre(b);if(!L){toast("Já existem banhos de A a Z neste galvânica — não cabe mais um.");return}
      const nome=nomeBanhoLivre(b,tp.nome);let cor=tp.cor;if(cor){const ach=C.cores.find(c=>semAc(c)===semAc(cor));if(ach)cor=ach;else C.cores.push(cor)}else cor="";
      b.banhos.push({id:uid(),nome,letra:L,cor,mil:"",modo:"peso",mult:"",coluna:tp.coluna,sufixo:tp.sufixo,marcado:false,vz:true});salvar(true,false);render();
      toast(`Banho “${nome}” (letra ${L}) criado em ${b.nome}. Preencha milésimos e valor na tabela por categoria, logo abaixo.`,{t:"Desfazer",fn:desfazer});refocar(`[data-bh="${bi}"] [data-bmv="${b.banhos.length-1}"][data-mcat="__padrao"]`);return},
  "bn-dup":({t,C,bi})=>{const b=C.banhistas[bi],j=+t.closest("[data-bn]").dataset.bn,o=b.banhos[j];const L=letraBanhoLivre(b);if(!L){toast("Já existem banhos de A a Z neste galvânica — não cabe mais um.");return}
      const n=clone(o);n.id=uid();n.letra=L;n.marcado=false;n.nome=nomeBanhoLivre(b,o.nome);b.banhos.splice(j+1,0,n);salvar(true,false);render();
      toast(`Banho duplicado como “${n.nome}” (letra ${L}).`,{t:"Desfazer",fn:desfazer});refocar(`[data-bh="${bi}"] [data-bn="${j+1}"] [data-bnf="nome"]`);return},
  "cor-nova-ok":()=>{corNovaOk();return;},
  "cor-nova-no":()=>{const cn0=catUI.corNova;catUI.corNova=null;renderCfg();if(cn0)refocar(`[data-bh="${cn0.bi}"] [data-bn="${cn0.j}"] [data-bnf="cor"]`);return},
  "cat-dup":({ci})=>{dupAbrir(ci);return;},
  "cat-dup-ok":()=>{dupOk();return;},
  "cat-dup-no":()=>{const di=catUI.dup?catUI.dup.i:0;catUI.dup=null;renderCfg();refocar(`[data-cat="${di}"] [data-act="cat-dup"]`);return},
  "cat-del":({C,ci})=>{catUI.dup=null;estadoConfig.delCat=C.categorias[ci].nome;renderCfg();return;},
  "cat-del-no":()=>{estadoConfig.delCat=null;renderCfg();return;},
  "cat-del-ok":({C,ci})=>{const nome=C.categorias[ci].nome;if((C.insumosItens||[]).some(x=>x.cat===nome)){estadoConfig.delCat=null;toast(`Não excluí “${nome}”: há itens de insumo vinculados. Altere-os antes.`);renderCfg();return}const nUso=S.lanc.filter(l=>val(l,"I")===nome).length;if(nUso){estadoConfig.delCat=null;toast(`Não excluí “${nome}”: ${nUso} peça(s) lançadas usam esta categoria (a referência delas mudaria). Mude a categoria dessas peças antes.`);render();return false}conjExcluirCategoria(nome);return},
  "lib-grade-add":({C})=>{C.grades=C.grades||[];C.grades.push({id:uid(),nome:"Nova variação",rotulo:" ",col:"",modoRef:"letra",subs:[],itens:[]});abertos["go:"+(C.grades.length-1)]=true;guardarAbertos();salvar(true,false);render();return},
  "lib-grade-pmg":({C})=>{C.grades=C.grades||[];const g={id:uid(),nome:"P M G",rotulo:" tamanho ",col:"K",modoRef:"letra",subs:[],itens:[]};addTamanhos(g,"P M G");C.grades.push(g);abertos["go:"+(C.grades.length-1)]=true;guardarAbertos();salvar(true,false);render();return},
  "go-del":({t,C})=>{C.grades.splice(+t.dataset.k,1);salvar(true,false);renderCfg();return;},
  "sub-del":({t,C,ci})=>{const c=C.categorias[ci],old=c.subs[+t.dataset.j];c.subs.splice(+t.dataset.j,1);[c.bancoPalavras,c.subPalavra,c.subAlias,c.subPref,c.subSoRef].forEach(o=>{if(o)delete o[old]});salvar(true,false);render();return;},
  "forn-add":({C})=>{const nomeLivre=b0=>{let n=b0,k=2;while(C.fornecedores.some(x=>semAc(x.nome)===semAc(n)))n=b0+" "+(k++);return n};C.fornecedores.push({nome:nomeLivre("Novo fornecedor"),desconto:"0",tipo:"bruta",codigo:""});salvar(true,false);render();return},
  "forn-dup":({t,C})=>{const i=+t.closest("[data-forn]").dataset.forn,f=clone(C.fornecedores[i]);{const b0=f.nome+" (cópia)";let n=b0,k=2;while(C.fornecedores.some(x=>semAc(x.nome)===semAc(n)))n=b0+" "+(k++);f.nome=n}C.fornecedores.splice(i+1,0,f);salvar(true,false);render();return},
  "forn-del":({t,C})=>{const i=+t.closest("[data-forn]").dataset.forn,fo=C.fornecedores[i],n=S.lanc.filter(l=>l.v&&l.v.H===fo.nome).length,abertos=ROM?ROM.rows.filter(r=>r.forn===fo.nome).length:0;if(!confirm(`Remover o fornecedor “${fo.nome}” dos cadastros? ${n} peça(s) na tabela atual e ${abertos} item(ns) do romaneio aberto usam esse nome. Referências em tabelas e romaneios salvos não são alteradas; ele deixará de aparecer nas opções. As alterações de cadastro podem ser descartadas antes de salvar.`))return;C.fornecedores.splice(i,1);salvar(true,false);render();return},
  "bh-add":({C})=>{const b={id:uid(),nome:"Nova galvânica",verniz:"",vernizOn:true,banhos:[]};C.banhistas.push(b);if(qGalvanicaSelecionar){trocarBanhista(S.form,b.id);qGalvanicaSelecionar=false}salvar(true,false);render();return;},
  "bh-dup":({C,bi})=>{const b=clone(C.banhistas[bi]);b.id=uid();b.nome+=" (cópia)";C.banhistas.splice(bi+1,0,b);salvar(true,false);render();return},
  "bh-del":({C,bi})=>{const id=C.banhistas[bi].id;{const n=S.lanc.filter(l=>l.banhista===id).length;if(n&&!confirm(`${n} peça(s) já lançadas usam esta galvânica. Remover mesmo assim? (Ctrl+Z desfaz)`))return}C.banhistas.splice(bi,1);C.fornecedores.forEach(f=>{if(f.banhista===id)f.banhista=""});salvar(true);render();return},
  "bn-add":({C,bi})=>{const b=C.banhistas[bi],usadas=b.banhos.map(x=>x.letra);let L="A";while(usadas.some(u=>String(u).toUpperCase()===L)&&L<"Z")L=String.fromCharCode(L.charCodeAt(0)+1);if(usadas.some(u=>String(u).toUpperCase()===L)){toast("Já existem banhos de A a Z neste galvânica — não cabe mais um.");return}b.banhos.push({id:uid(),nome:"Ródio",letra:L,cor:"Ródio",mil:"",modo:"peso",mult:"",coluna:"S",sufixo:" banho ródio",marcado:false,vz:true});salvar(true,false);render();return},
  "bn-del":({t,C,bi})=>{const bh0=C.banhistas[bi],bn0=bh0&&bh0.banhos[+t.closest("[data-bn]").dataset.bn];if(bn0)bnExcluirSeguro(bh0,bn0).catch(e=>{console.error("Falha ao excluir banho",e);alert("Não consegui conferir ou salvar a exclusão do banho. Confira os cadastros antes de continuar.")});return},
  "cc-reset":({C})=>{C.colcfg=colcfgPadrao();salvar(true,false);render();return;},
  "cor-add":acaoCorAdd,
  "obs-add":acaoCorAdd,
  "cor-del":({t,C})=>{C.cores.splice(+t.dataset.j,1);salvar(true,false);render();return;},
  "obs-del":({t,C})=>{C.observacoes.splice(+t.dataset.j,1);salvar(true,false);render();return;},
  "cv-del":({t,C,ci})=>{const c=C.categorias[ci],j=+t.closest("[data-cvi]").dataset.cvi;c.cores.splice(j,1);abertos["cv:"+c.nome]=true;guardarAbertos();salvar(true,false);render();return},
  "cv-num":({C,ci})=>{const c=C.categorias[ci];(c.cores||[]).forEach(x=>{if(vazio(x.letra))x.letra=proxCorLetra(c,x.nome)});abertos["cv:"+c.nome]=true;guardarAbertos();salvar(true,false);render();return},
  "cv-todas":({C,ci})=>{const c=C.categorias[ci];c.cores=c.cores||[];C.cores.forEach(n=>{if(!c.cores.some(y=>semAc(y.nome)===semAc(n)))c.cores.push({id:uid(),nome:n,texto:"",letra:proxCorLetra(c,n)})});abertos["cv:"+c.nome]=true;guardarAbertos();salvar(true,false);render();return},
  "gr-add":({C,ci})=>{const c=C.categorias[ci];c.grade={id:uid(),nome:"Tamanhos",rotulo:" tamanho ",col:"K",subs:[],itens:[]};abertos["g:"+c.nome]=true;guardarAbertos();salvar(true,false);render();return},
  "gr-own":({C,ci})=>{const c=C.categorias[ci],e=effGrade(c),sb=c.grade.subs,id=c.grade.id;c.grade={...clone(e),id,subs:sb};delete c.grade.usa;salvar(true,false);render();return},
  "gr-del":({C,ci})=>{const c=C.categorias[ci];c.grade=null;delete c.grade;sincGrade(S.form);salvar(true);render();return},
  "gi-del":({t})=>{const g=gradeDoEl(t);g.itens.splice(+t.closest("[data-gii]").dataset.gii,1);sincGrade(S.form);salvar(true);render();return},
  "reset":({t})=>{if(estadoConfig.resetArm!==t.dataset.r){estadoConfig.resetArm=t.dataset.r;renderCfg()}else resetar(estadoConfig.resetArm);return;},
  "reset-no":()=>{estadoConfig.resetArm=null;renderCfg();return;}
});
