/* Ações de clique (data-act) da fatia romaneio: leitura/importação, cartões dos itens, lote por peso, partir/juntar, revisão final, criar,
   romaneios salvos, relatório da criação e planilha do fornecedor. Registradas em ACOES (src/core/acoes.js).
   Convenção: o que era `break` no switch virou `return` (nenhum case daqui tinha `return` que pulasse o pós-switch).
   ROM (fatias/romaneio) e ROMS, romArm, tabArm e romConflito (fatias/armazenamento) são globais: continuam sendo lidos/escritos daqui. */
registrarAcoes(ACOES,"romaneio",{
  "lote-add":({t})=>{{const r=ROM.rows[+t.dataset.i],inp=t.closest(".rc").querySelector("[data-lotn]");if(r)romLoteAdd(r,Math.max(1,Math.min(60,Math.trunc(num(inp&&inp.value)||1))));return}},
  "rom-partir":({t})=>{{const rc=t.closest(".rc"),r=ROM.rows[+rc.dataset.i];if(!r)return;const bx=rc.querySelector(".partbox");if(bx){bx.remove();return}
      t.insertAdjacentHTML("afterend",`<span class="partbox"><label class="fq"><span>Partes</span><input class="n" data-partn value="3" inputmode="numeric" style="width:48px" aria-label="Quantas partes"></label><button type="button" class="btn pri sm" data-act="rom-partir-ok">Partir</button></span>`);const pi=rc.querySelector("[data-partn]");pi.focus();pi.select();return}},
  "rom-partir-ok":({t})=>{{const rc=t.closest(".rc"),r=ROM.rows[+rc.dataset.i],pi=rc.querySelector("[data-partn]");if(r)romPartir(r,num(pi&&pi.value));return}},
  "rom-juntar":({t})=>{{const r=ROM.rows[+t.closest(".rc").dataset.i];if(r)romJuntar(r);return}},
  "lote-resto":({t})=>{{const r=ROM.rows[+t.dataset.i];if(!r)return;const R=romLoteResumo(r);if(R.dif>0)romLoteAdd(r,1,R.dif);else toast("Não há peso restante no lote.");return}},
  "lote-del":({t})=>{{const r=ROM.rows[+t.dataset.i];if(!r)return;if(r.feito||(r.lancIds||[]).length){toast("Esta peça já foi lançada. Exclua o lançamento na tabela antes de remover o item do lote.");return}{const lot=ROM.rows.find(x=>x.lote&&x.lid===r.loteDe);ROM.rows.splice(+t.dataset.i,1);if(lot)romLoteRecalc(lot)}if(ROM.rows.length)romSalvarSoon();else romLimparRascunho();renderRom();return}},
  "imp-pick":()=>{{document.getElementById("impFile").click();return}},
  "imp-up":({t})=>{{const i=+t.dataset.i;if(i>0){[estadoRomaneio.impQ[i-1],estadoRomaneio.impQ[i]]=[estadoRomaneio.impQ[i],estadoRomaneio.impQ[i-1]];renderImp()}return}},
  "imp-down":({t})=>{{const i=+t.dataset.i;if(i<estadoRomaneio.impQ.length-1){[estadoRomaneio.impQ[i+1],estadoRomaneio.impQ[i]]=[estadoRomaneio.impQ[i],estadoRomaneio.impQ[i+1]];renderImp()}return}},
  "imp-del":({t})=>{{estadoRomaneio.impQ.splice(+t.dataset.i,1);renderImp();return}},
  "imp-limpar":()=>{{estadoRomaneio.impQ=[];renderImp();return}},
  "imp-abrir":({t})=>{{const q=estadoRomaneio.impQ.splice(+t.dataset.i,1)[0];renderImp();if(q)impAbrirArq(q.file);return}},
  "rom-nova":()=>{{romNovaPeca();return}},
  "rom-xlsx":()=>{{const ids=new Set(ROM.rows.flatMap(r=>r.lancIds||[]).filter(id=>S.lanc.some(l=>l.id===id)));if(!ids.size){toast("Nenhuma peça deste romaneio está na tabela atual.");return}baixar(false,ids);return}},
  "rel-xlsx":()=>{{const rel=relLer(),ids=new Set((rel&&rel.lids||[]).filter(id=>S.lanc.some(l=>l.id===id)));if(!ids.size){toast("As peças desta criação não estão mais na tabela.");return}baixar(false,ids);return}},
  "rom-bulk-div":()=>{{const rs=romSelRows().filter(r=>!r.skip&&!r.feito&&!r.lote&&(!gradeDaCat(r.cat,r.sub)||r.semG)&&!(r.csel||[]).length);rs.forEach(r=>romDividir(r,romColsR(r)));renderRom();toast(`${rs.length} peça(s) divididas entre os banhos.`);return}},
  "rom-bulk-lote":()=>{{const idx=ROM.rows.map((r,i)=>[r,i]).filter(([r])=>romSelRows().includes(r)&&!r.lote&&!r.loteDe&&!r.feito&&!Array.isArray(r.conjComp)).map(x=>x[1]).reverse();idx.forEach(i=>romLotear(i,true));if(idx.length)toast(`${idx.length} item(ns) viraram lote.`);else toast("Nenhuma peça elegível (já é lote, já lançada ou conjunto).");return}},
  "rom-bulk-criar":({t})=>{{const v=t.dataset.v==="1",rs=romSelRows().filter(r=>!r.feito&&!r.lote);rs.forEach(r=>{r.skip=!v});renderRom();toast(`${rs.length} peça(s) ${v?"marcadas para criar":"marcadas para não criar"}.`);return}},
  "rom-passo":({t})=>{{romPassoIr(+t.dataset.p);return}},
  "rom-lotear":({t})=>{{romLotear(+t.dataset.i);return}},
  "rom-lote-off":({t})=>{{romLoteOff(+t.dataset.i);return}},
  "imp-ir":()=>{{rolarPane(document.getElementById("romWrap"));return}},
  "rins-add":()=>{{if(!ROM)return;ROM.ins=ROM.ins||{itens:[],base:"un"};if(ROM.ins.itens.length>=30){toast("Limite de 30 insumos por romaneio.");return}ROM.ins.itens.push({nome:"",valor:""});abertos.rins=true;guardarAbertos();romSalvarSoon();renderRom();return}},
  "rins-del":({t})=>{{if(!ROM||!ROM.ins)return;ROM.ins.itens.splice(+t.dataset.i,1);romSalvarSoon();renderRom();return}},
  "rom-cor-on":({t})=>{{const r=ROM.rows[+t.closest(".rc").dataset.i];romArma(r);r.corOn=true;renderRom();return}},
  "rom-abrir":()=>{{if(editId){avisoEdicao(romAbrirNovo);return}romAbrirNovo();return}},
  "rom-fechar":()=>{{const lsOk=romSalvar(),pr=romGravP;ROM=null;renderRom();renderForm();
      Promise.resolve(pr).then(idbOk=>toast(lsOk?"Romaneio guardado — use “Retomar romaneio” quando quiser continuar.":idbOk?"O rascunho rápido não gravou, mas o romaneio ficou em “Romaneios salvos” (Cadastros): abra por lá para continuar.":"ATENÇÃO: não consegui guardar o romaneio (memória do navegador cheia, bloqueada ou outra aba alterou). Baixe o backup antes de sair."));return}},
  "rom-descartar":({t})=>{{if(romConflito){const b=document.getElementById("outraAbaRom");if(b)b.remove();romConflito=false;ROM=null;renderRom();renderForm();toast("Fechei este romaneio sem apagar nada: outra aba alterou o rascunho e a versão dela foi mantida.");return}
      if(t.disabled)return;t.disabled=true;const atual=ROM;romSalvar();const d=romRascunho(),sid0=ROM&&ROM.sid,jaFeito=ROM&&ROM.rows.some(r=>r.feito),antes=ROM?JSON.stringify({...ROM,pdf:null}):null;
      (async()=>{try{if(sid0&&!jaFeito&&!(await romExcluirSalvo(sid0))){toast("Não consegui descartar o romaneio salvo. Ele continua aberto; confira o armazenamento.");return}
        if(ROM!==atual)return;if(ROM&&JSON.stringify({...ROM,pdf:null})!==antes){romSalvar();toast("O romaneio mudou durante a exclusão e foi mantido aberto.");return}
        romLimparRascunho();ROM=null;renderRom();renderForm();toast("Romaneio descartado.",d?{t:"Desfazer",fn:()=>{try{dadoGravar(ROMKEY,JSON.stringify(d));romTem=true}catch(x){}renderForm()}}:null)
      }catch(err){console.error("cadastro-pecas: não foi possível descartar o romaneio",err);toast("Não consegui descartar o romaneio. Ele continua aberto.")}finally{t.disabled=false}})();return}},
  "rom-lote":()=>{romLote();return;},
  "rom-excluir-selecionadas":()=>{romExcluirSelecionadas();return;},
  "rom-revogar-todas":()=>{if(ROM)romRevogar(ROM.rows.filter(r=>r.feito));return;},
  "rom-revogar":({t})=>{{const rc=t.closest(".rc"),r=rc&&ROM&&ROM.rows[+rc.dataset.i];if(r)romRevogar([r]);return}},
  "rom-lista":()=>{romListaAbrir();return;},
  "rom-refazer-todas":()=>{{if(!ROM)return;let n=0;ROM.rows.forEach(r=>{if(r.feito&&!r.arq){r.refaz=true;r.skip=false;r.aviso="";n++}});ROM.msg=n?`${n} peça(s) já lançadas liberadas para edição. Mude o que quiser e clique em Criar peças: elas substituem as antigas.`:"Nenhuma peça já lançada para editar.";renderRom();return}},
  "rom-salvo-abrir":({t})=>{{document.querySelectorAll(".rep").forEach(x=>x.remove());Promise.resolve(romAbrirSalvo(t.dataset.id)).catch(e=>{try{console.error("romaneio salvo",e)}catch(x){}toast("Não consegui abrir esse romaneio: "+((e&&e.message)||e)+". Abra “Diagnóstico dos dados” na lista de romaneios salvos.")});return}},
  "rom-salvo-del":({t})=>{{if(romArm!==t.dataset.id){romArm=t.dataset.id;romListaRef()}else{romExcluirSalvo(romArm);romArm=null;romListaRef();renderForm()}return}},
  "rel-abrir":()=>{relAbrir();return;},
  "rel-fechar":()=>{{tabArm=null;romArm=null;const o=document.querySelector(".rep");if(o)o.remove();renderForm();return}},
  "rel-print":()=>{window.print();return;},
  "rel-copy":()=>{{const R=relLer();if(R)navigator.clipboard.writeText(relTexto(R)).then(()=>toast("Resumo copiado.")).catch(()=>toast("O navegador não liberou a cópia."));return}},
  "rel-csv":()=>{{const R=relLer();if(R)arqSalvar("Relatorio romaneio "+new Date(R.em).toISOString().slice(0,10)+".csv",relCsv(R));return}},
  "rel-undo":()=>{{const o=document.querySelector(".rep");if(o)o.remove();desfazer();return}},
  "rom-pend":()=>{{let ri=-1,cmp=0;ROM.rows.forEach((r,i)=>{if(ri>=0||r.skip)return;if(num(r.peso)==null){ri=i;cmp=1}else if(romSomaDe(r,romColsR(r))!==r.qtd){ri=i;cmp=2}else if(gradeDaCat(r.cat,r.sub)&&!r.semG&&!(r.gsel||[]).length&&!(r.csel||[]).length){ri=i;cmp=3}else if(r.catq){ri=i;cmp=4}});
      if(ri<0){toast("Nenhuma pendência: tudo preenchido.");return}const rc=document.querySelector(`#romWrap .rc[data-i="${ri}"]`);if(rc){rolarPane(rc);if(cmp===3){const r3=ROM.rows[ri];if(!r3.open){r3.open=true;rc.classList.add("op");const bd=rc.querySelector("[data-body]");if(bd&&!bd.innerHTML.trim()){bd.innerHTML=romBodyHTML(r3);romAtual()}}}const el=cmp>=3?rc.querySelector("[data-rp=cat]"):cmp===1?rc.querySelector("[data-rp=peso]"):(rc.querySelector("[data-rp=q]")||rc.querySelector("[data-act=rom-x]"));if(el)setTimeout(()=>el.focus({preventScroll:true}),250)}return}},
  "rev-fechar":()=>{{const o=document.querySelector(".rev");if(o)o.remove();return}},
  "rev-ok":()=>{{const o=document.querySelector(".rev");if(o)o.remove();romCriar();return}},
  "rev-filtro":({t})=>{{const o=document.querySelector(".rev");if(o)o.classList.toggle("so-al",t.checked);return}},
  "rev-ir":({t})=>{{const o=document.querySelector(".rev");if(o)o.remove();const rc=document.querySelector(`#romWrap .rc[data-i="${t.dataset.i}"]`),r=ROM.rows[+t.dataset.i];if(rc&&r){r.open=true;rc.classList.add("op");const bd=rc.querySelector("[data-body]");if(bd&&!bd.innerHTML.trim()){bd.innerHTML=romBodyHTML(r);romAtual()}rolarPane(rc)}return}},
  "rom-ex-add":({t})=>{{const rc=t.closest(".rc"),r=ROM.rows[+rc.dataset.i],k=rc.querySelector("[data-rp=exk]").value,v=rc.querySelector("[data-rp=exv]").value;if(!vazio(v)){r.ex=r.ex||{};r.ex[k]=v;r.open=true;renderRom()}return}},
  "rom-ex-del":({t})=>{{const r=ROM.rows[+t.closest(".rc").dataset.i];delete r.ex[t.dataset.k];r.open=true;renderRom();return}},
  "rom-ler":()=>{romLer();return;},
  "rom-criar":()=>{romRevisar();return;},
  "rom-x":({t})=>{{const rc=t.closest(".rc"),r=ROM.rows[+rc.dataset.i];r.open=!r.open;rc.classList.toggle("op",r.open);const bd=rc.querySelector("[data-body]");if(r.open&&bd&&!bd.innerHTML.trim()){bd.innerHTML=romBodyHTML(r);romAtual()}return}},
  "rom-div":({t})=>{{const r=ROM.rows[+t.closest(".rc").dataset.i];romArma(r);if(romKeys(r,romColsR(r)).length)romDividir(r,romColsR(r));else toast("Escolha os tamanhos antes.");renderRom();return}},
  "rom-div-todas":()=>{{ROM.rows.forEach(r=>{if(!r.skip&&(!gradeDaCat(r.cat,r.sub)||r.semG)&&!(r.csel||[]).length)romDividir(r,romColsR(r))});renderRom();return}},
  "rom-pmg":({t})=>{{const i=+t.dataset.i,r=ROM&&ROM.rows[i];if(!r)return;romArma(r);let g=gradeDaCat(r.cat,r.sub);const c=catBy(r.cat);if(!g&&c){c.grade={id:uid(),nome:"Tamanhos",rotulo:" tamanho ",col:"K",subs:[],itens:[]};g=c.grade}if(!g)return;const nv=addTamanhos(g,"P M G");r.gsel=g.itens.map(x=>x.id).filter(id=>nv.includes(id)||(r.gsel||[]).includes(id));r.semG=false;salvar(true,false);renderRom();return}},
  "rom-gpad":({t})=>{{const i=+t.dataset.i,r=ROM&&ROM.rows[i],g=r&&gradeDaCat(r.cat,r.sub);if(!g)return;g.faixa=g.itens.filter(x=>(r.gsel||[]).includes(x.id)).map(x=>x.nome).join(", ");salvar(true,false);toast(g.faixa?"Tamanhos padrão: "+g.faixa:"Padrão removido: nenhum tamanho vem marcado.");return}},
  "rom-cpad":({t})=>{{const i=+t.dataset.i,r=ROM&&ROM.rows[i],c=r&&catBy(r.cat);if(!c)return;c.coresCfg=c.coresCfg||{};c.coresCfg.padrao=(r.csel||[]).slice();salvar(true,false);toast((r.csel||[]).length?"Cores padrão salvas para "+c.nome+".":"Padrão removido: nenhuma cor vem marcada.");return}},
  "rom-ct":({t})=>{{const r=ROM.rows[+t.closest(".rc").dataset.i];romArma(r);const l=coresDaCat(r.cat,r.sub);r.csel=(r.csel||[]).length===l.length?[]:l.map(x=>x.id);renderRom();return}},
  "rom-gt":({t})=>{{const r=ROM.rows[+t.closest(".rc").dataset.i],g=gradeDaCat(r.cat,r.sub);if(g){romArma(r);r.gsel=(r.gsel||[]).length===g.itens.length?[]:g.itens.map(x=>x.id);renderRom()}return}},
  "rom-tipo":({t})=>{{const f=S.form;f.tipo=t.dataset.v;if(f.tipo==="bruta"){if(!Object.values(f.on||{}).some(Boolean))marcadosPadrao(f);banhistaDoFornecedor(f)}ROM.rows.forEach(r=>{if(r.feito)return;r.q={};romNovaCat(r)});salvar(false);renderForm();renderRom();return}},
  "rom-plan-ok":()=>{{const P=ROM&&ROM.plan;if(!P)return;const m=P.map,nq=v=>{const x=String(v==null?"":v).replace(/[R$\s]/g,"");return x===""?null:numQtd(x)},nn=v=>{const x=String(v==null?"":v).replace(/[R$\s]/g,"");return x===""?null:num(x)},rows=[];
      if(P.sistema){const erros=[];P.rows.forEach((linha,i)=>{const v={};Object.entries(P.sistema).forEach(([k,j])=>{v[k]=linha[j]});const desc=String(v.F??"").trim(),qn=nq(v.W);if(!desc||qn==null||!Number.isInteger(qn)||qn<0){erros.push(i+2);return}rows.push({desc,cod:String(v.G??"").trim(),qtd:qn,preco:nn(v.P),precod:null,total:null,aviso:"",_sistema:v})});if(erros.length||!rows.length){ROM.msg=`Planilha não importada: confira descrição e quantidade inteira nas linhas ${erros.slice(0,10).join(", ")||"do arquivo"}.`;renderRom();return}ROM.plan=null;romAplicaR({rows,obs:"",conf:`planilha do sistema: ${rows.length} linhas para editar`,erro:""});return}
      const ruim=[],zero=[],semd=[];P.rows.forEach(r=>{const desc=String(m.desc==null?"":r[m.desc]).replace(/\s+/g," ").trim();if(!desc){const cd=m.cod==null?"":String(r[m.cod]||"").trim();if(cd&&(m.qtd==null||nq(r[m.qtd])>0))ruim.push(cd.slice(0,30)+" (sem descrição)");else{const qv=m.qtd==null?null:nq(r[m.qtd]),pv=m.preco==null?null:nn(r[m.preco]),tv=m.total==null?null:nn(r[m.total]);if((qv!=null&&qv!==0)||(pv!=null&&pv!==0)||(tv!=null&&tv!==0))semd.push("qtd "+(m.qtd==null?"?":String(r[m.qtd]).trim()||"vazia")+(pv?" · R$ "+pv:""))}return}const qn=m.qtd==null?1:nq(r[m.qtd]);if(qn===0){zero.push(desc.slice(0,30));return}if(qn==null||!Number.isFinite(qn)||qn<0||qn!==Math.trunc(qn)){ruim.push(desc.slice(0,30)+" ("+(m.qtd==null?"":String(r[m.qtd]).trim()||"vazio")+")");return}const qtd=qn;rows.push({desc,cod:m.cod==null?"":String(r[m.cod]||"").trim().replace(/^#/,""),qtd,preco:m.preco==null?null:nn(r[m.preco]),precod:null,total:m.total==null?null:nn(r[m.total]),aviso:""})});
      rows.forEach(r=>romAvisoTotal(r));if(ruim.length){ROM.msg=`${ruim.length} linha(s) com quantidade vazia/decimal/inválida ou sem descrição, não importei nada: ${ruim.slice(0,5).join("; ")}${ruim.length>5?"…":""}. Corrija a planilha ou a coluna de quantidade.`;renderRom();return}
      if(!rows.length){ROM.msg="Nenhuma linha com descrição e quantidade. Confira as colunas.";renderRom();return}
      ROM.plan=null;romAplicaR({rows,obs:"",conf:`planilha: ${rows.length} linhas · ${rows.reduce((a,r)=>a+r.qtd,0)} peças${zero.length?` · ${zero.length} linha(s) com quantidade 0 ficaram de fora: ${zero.slice(0,5).join("; ")}${zero.length>5?"…":""}`:""}${semd.length?` · ⚠ ${semd.length} linha(s) SEM DESCRIÇÃO e com quantidade/valor ficaram de fora (pode ser a linha de total): ${semd.slice(0,5).join("; ")}${semd.length>5?"…":""}. Confira a planilha.`:""}`,erro:""});return}},
  "rom-plan-no":()=>{ROM.plan=null;renderRom();return;}
});
