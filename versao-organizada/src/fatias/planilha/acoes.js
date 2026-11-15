/* Acoes de clique (data-act) da fatia planilha: filtros, vistas, gaveta do formulario no celular, acoes em lote sobre as pecas marcadas,
   acoes sobre a celula/linha selecionada e editar/duplicar/excluir a linha. Registradas em ACOES (src/js/30-eventos-mouse-e-clique.js; carrega antes deste arquivo).
   Convencao: o que era `break` no switch virou `return`. b-copy, b-xlsx e s-xlsx ficaram no switch (chamam baixar/copiar da exportacao; mover criaria ciclo). */
registrarAcoes(ACOES,"planilha",{
  "editar":({tr})=>{editar(tr.dataset.l);if(celular())formAbrir(true);return;},
  "form-fechar":()=>{formAbrir(false);return;},
  "form-alt":()=>{abertos.malt=(Number(abertos.malt==null?2:abertos.malt)+1)%3;guardarAbertos();gavetaAlt();return},
  "fil-busca":()=>{estadoPlanilha.fil.q="";guardarFil();{const b=document.getElementById("fBusca");if(b)b.value=""}renderTopo();return;},
  "fil-limpar":()=>{estadoPlanilha.fil={q:"",cat:"",forn:"",ban:"",sit:""};guardarFil();{const b=document.getElementById("fBusca");if(b)b.value=""}renderTopo();return;},
  "vista":({t})=>{try{gravarPref("cadpecas-vista",t.dataset.v)}catch(x){}renderTopo();return;},
  "ir-form":()=>{if(celular()){formAbrir(true);return}const fm=document.getElementById("form");if(fm)fm.scrollIntoView({block:"start",behavior:"smooth"});setTimeout(focarPrimeiro,350);return},
  "ir-lista":()=>{document.getElementById("paneTop").scrollIntoView({block:"start",behavior:"smooth"});return;},
  "dup":({tr})=>{duplicarLinha(+tr.dataset.ri);return;},
  "del":({tr})=>{excluirLinhas([+tr.dataset.ri]);return;},
  "b-dup":()=>{duplicar([...sel].filter(id=>S.lanc.some(l=>l.id===id)));return;},
  "b-del":()=>{excluir([...sel]);return;},
  "b-none":()=>{sel.clear();renderTopo();return;},
  "b-set":()=>{const L=document.getElementById("bCol").value,v=document.getElementById("bVal").value;const antes=[];
      {const ch=checaCel(L,v);if(ch.erro){toast(ch.erro+" (não aplicado)");return}if(vazio(v)&&(L==="F"||L==="I")){toast(NOME[L]+" não pode ficar vazio (não aplicado).");return}}
      S.lanc.forEach(l=>{if(!sel.has(l.id))return;antes.push({id:l.id,v:clone(l.v),ov:clone(l.ov||{})});
        if(L==="W"&&temGrade(l)){l.ov=l.ov||{};const ks=l.tipo==="bruta"?banhistaBy(l.banhista).banhos.filter(b=>l.on[b.id]).map(b=>b.id):(bonP(l).length?bonP(l).map(b=>b.id):["p"]);ks.forEach(k=>itensGrade(l).forEach(it=>{(l.ov[k+"~"+it.id]=l.ov[k+"~"+it.id]||{}).W=v}))}
        else if(l.tipo==="bruta"&&POR_BANHO.has(L)){l.ov=l.ov||{};banhistaBy(l.banhista).banhos.forEach(b=>{if(l.on[b.id])(l.ov[b.id]=l.ov[b.id]||{})[L]=v})}
        else if(l.tipo==="pronta"&&bonP(l).length&&POR_BANHO.has(L)){l.ov=l.ov||{};bonP(l).forEach(b=>{(l.ov[b.id]=l.ov[b.id]||{})[L]=v})}
        else{l.v[L]=v;if(l.ov)Object.values(l.ov).forEach(o=>delete o[L])}});
      undo={tipo:"bulk",antes};salvar(false);renderTopo();toast(`${NOME[L]} = “${v}” em ${antes.length} peça(s).`,{t:"Desfazer",fn:desfazer});return},
  "s-edit":()=>{const r=G.linhas[estadoPlanilha.selR.fr];if(r)editar(r.lancId);return},
  "s-nova":()=>{const r=G.linhas[estadoPlanilha.selR.fr];if(r)usarModelo(r.lancId);return},
  "s-dup":()=>{duplicarLinha(estadoPlanilha.selR.fr);return;},
  "s-copy":()=>{copiarSel();return;},
  "s-clear":()=>{limparSel();return;},
  "s-fill":()=>{preencherAbaixo();return;},
  "s-del":()=>{const b=selBox(),rs=[];if(b)for(let r=b.r1;r<=b.r2;r++)if(G.linhas[r]&&vis(r))rs.push(r);excluirLinhas(rs);return}
});
