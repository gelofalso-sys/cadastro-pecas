/* Acoes de clique (data-act) da fatia lancamento: formulario (cancelar, limpar, repetir, adicionar e limpar, detalhes, so o essencial),
   painel rapido (q, q-salvar, q-fechar, rom-q), varias pecas (multi-*), lancamento continuo e combinacoes (trabalho-toggle, preset-*),
   banco de palavras (banco-*, desc-palavra), cores e tamanhos do formulario (cor-*, cs-*, gi-*, gr-novo-pmg, faixa-salvar), conjunto (comp-*),
   simulador de fator (simular-fator, sim-usar) e exemplo. Registradas em ACOES (src/core/acoes.js).
   Convencao: o que era `break` no switch virou `return`; nenhum case pulava o codigo pos-switch.
   O clique em [data-tipo] (Bruta/Pronta/Conjunto) nao e data-act: o listener de 30c chama tipoClique. */
function tipoClique(tipo){
  if(tipo==="conjunto"){const f=S.form;f.tipo="pronta";f.conj=true;if(!Array.isArray(f.comp)||!f.comp.length)f.comp=[novaComp(),novaComp()];
    if(!f.banhista)f.banhista=(cfg().banhistas[0]||{}).id||"";if(!editId&&f.v.I!=="Conjuntos"&&catBy("Conjuntos")&&!(catBy(f.v.I)||{}).semBanho){f.v.I="Conjuntos";delete f.v.J;sincGrade(f)}else if(!editId&&(catBy(f.v.I)||{}).semBanho&&(catBy(f.v.I).subs||[]).includes("Conjuntos")){f.v.J="Conjuntos";sincGrade(f)}
    conjSync(f);salvar(false);renderTopo();renderForm();refocar('#conj [data-cp="desc"]');return}
  if(S.form.conj){conjLimpar(S.form);delete S.form.conj}S.form.tipo=tipo;if(tipo==="bruta"&&!Object.values(S.form.on||{}).some(Boolean))marcadosPadrao(S.form);if(tipo==="bruta"&&!editId)banhistaDoFornecedor(S.form);salvar(false);renderTopo();renderForm();focarPrimeiro();}
const acao_preset_usar_preset_excluir=({a,C})=>{{const el=document.querySelector("[data-preset-select]"),ps=C.presetsLancamento||[],i=el&&el.value!==""?Number(el.value):-1;if(!ps[i]){toast("Escolha uma combinação.");return}if(a==="preset-usar")presetAplicar(ps[i]);else{if(!confirm(`Excluir a combinação “${ps[i].nome}”?`))return;ps.splice(i,1);salvar(true,false);renderForm();toast("Combinação excluída.")}return}};
const acao_comp_up_comp_down=({t,a})=>{{const f=S.form,i=+t.dataset.ci,j=a==="comp-up"?i-1:i+1;if(!f.comp||j<0||j>=f.comp.length)return;[f.comp[i],f.comp[j]]=[f.comp[j],f.comp[i]];conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${j}"] [data-act="${a}"]`);return}};
registrarAcoes(ACOES,"lancamento",{
  "excl-volta":()=>{S.form.excl=[];salvar(false);renderForm();toast("As linhas excluídas voltam quando você clicar em Salvar.");return;},
  "cancel":()=>{if(editId)cancelar();else{limparForm();salvar(false);renderTopo();renderForm();focarPrimeiro()}return;},   /* sem peça em edição, Cancelar esvazia o formulário */
  "limpar":()=>{limparForm();salvar(false);renderTopo();renderForm();focarPrimeiro();return;},
  "repetir":()=>{{const l=S.lanc[S.lanc.length-1];if(l)usarModelo(l.id);else toast("Ainda não há peça para repetir.");return}},
  "form-extras":({t})=>{{const f=t.closest("#form"),abriu=f.classList.toggle("fextra-open");t.setAttribute("aria-expanded",String(abriu));t.textContent=abriu?"Menos opções de lançamento":"Mais opções de lançamento";return}},
  "faixa-salvar":()=>{{const f=S.form,gr=gradeBy(f.grade);if(gr){gr.faixa=gr.itens.filter(x=>(f.gsel||[]).includes(x.id)).map(x=>x.nome).join(", ");salvar(true,false);renderCfg();toast(gr.faixa?`Tamanhos padrão: ${gr.faixa}`:"Padrão removido: nenhum tamanho vem marcado.")}return}},
  "add-limpar":()=>{adicionar(true);return;},
  "tg-min":()=>{abertos.min=!abertos.min;guardarAbertos();renderForm();return;},
  "tg-det":()=>{abertos.det=!abertos.det;guardarAbertos();renderForm();return;},
  "rom-q":({t})=>{{if(t.dataset.q==="bh"||t.dataset.q==="bn"){qIrGalvanica(t.dataset.q);return}const f=S.form,i=t.dataset.i!=null?+t.dataset.i:null,r=i!=null&&ROM?ROM.rows[i]:null;estadoLancamento.romQ0={I:f.v.I,J:f.v.J};estadoLancamento.romQRow=i;if(r&&["sub","gi","cv"].includes(t.dataset.q)){if(r.cat)f.v.I=r.cat;if(t.dataset.q!=="sub"){if(r.sub)f.v.J=r.sub;else delete f.v.J}}estadoLancamento.quick=t.dataset.q;estadoLancamento.quickB=null;renderForm();const el=document.querySelector("#formWrap .nf");if(el)el.scrollIntoView({block:"center"});refocar("#q1");return}},
  "q":({t})=>{if(t.dataset.q==="bh"||t.dataset.q==="bn"){qIrGalvanica(t.dataset.q);return}estadoLancamento.quickPre="";estadoLancamento.quick=estadoLancamento.quick===t.dataset.q&&(t.dataset.qb||null)===estadoLancamento.quickB?null:t.dataset.q;estadoLancamento.quickB=estadoLancamento.quick?(t.dataset.qb||null):null;renderForm();return;},
  "q-salvar":()=>{salvarRapido();return;},
  "multi-mais":()=>{{estadoLancamento.multi.push({F:"",N:"",P:""});renderForm();const ins=document.querySelectorAll('#multiPanel [data-mf="F"]');if(ins.length)ins[ins.length-1].focus();return}},
  "multi-del":({t})=>{{estadoLancamento.multi.splice(+t.dataset.i,1);renderForm();return}},
  "multi-limpar":()=>{{estadoLancamento.multi=[];renderForm();return}},
  "multi-ok":()=>{{const f=S.form,F0=f.v.F,N0=f.v.N,P0=f.v.P,antes=S.lanc.length,resto=[];let add=0;
      estadoLancamento.multi.forEach(m=>{if(!String(m.F||"").trim()&&!String(m.N||"").trim()&&!String(m.P||"").trim())return;f.v.F=m.F;if(m.N)f.v.N=m.N;else if(N0==null)delete f.v.N;else f.v.N=N0;if(m.P)f.v.P=m.P;else if(P0==null)delete f.v.P;else f.v.P=P0;if(adicionar(false,true))add++;else resto.push(m)});
      f.v.F=F0;if(N0==null)delete f.v.N;else f.v.N=N0;if(P0==null)delete f.v.P;else f.v.P=P0;erro="";estadoLancamento.multi=resto;
      const ids=S.lanc.slice(antes).map(l=>l.id);if(ids.length)undo={tipo:"dup",ids};salvar(false);renderTopo();renderForm();if(ids.length)mostrarNoFim(ids[ids.length-1]);
      toast(add?`${add} peça(s) adicionada(s) no fim da tabela.${resto.length?` ${resto.length} linha(s) ficaram aqui: confira os campos obrigatórios.`:""}`:"Nenhuma peça entrou: confira os campos obrigatórios do formulário.",add?{t:"Desfazer",fn:desfazer}:null);return}},
  "q-fechar":()=>{romQFim();estadoLancamento.quick=null;renderForm();return;},
  "exemplo":()=>{abrirExemploVisual();return;},
  "trabalho-toggle":()=>{estadoLancamento.trabalhoAberto=!estadoLancamento.trabalhoAberto;renderForm();return;},
  "preset-salvar":({C})=>{{const el=document.querySelector("[data-preset-nome]"),nome=el&&el.value.trim();if(!nome){toast("Digite um nome para a combinação.");return}C.presetsLancamento=Array.isArray(C.presetsLancamento)?C.presetsLancamento:[];if(C.presetsLancamento.some(p=>semAc(p.nome)===semAc(nome))){toast("Já existe uma combinação com esse nome.");return}if(C.presetsLancamento.length>=30){toast("Limite de 30 combinações.");return}C.presetsLancamento.push(presetAtual(nome));salvar(true,false);renderForm();toast("Combinação salva.");return}},
  "preset-usar":acao_preset_usar_preset_excluir,
  "preset-excluir":acao_preset_usar_preset_excluir,
  "banco-toggle":()=>{estadoBase.bancoAberto=!estadoBase.bancoAberto;renderForm();return;},
  "banco-adicionar":()=>{{const f=S.form,c=catBy(f.v.I),el=document.querySelector('[data-banco-nova]');if(!c||!el)return;const palavras=el.value.split(";").map(x=>x.trim().replace(/\s+/g," ")).filter(x=>x&&x.length<=60);if(!palavras.length){toast("Digite uma palavra ou expressão.");return}const chave=f.v.J||"",lista=bancoLista(c.nome,chave).slice();palavras.forEach(w=>{if(!lista.some(x=>semAc(x)===semAc(w)))lista.push(w)});c.bancoPalavras=c.bancoPalavras||{};c.bancoPalavras[chave]=lista.slice(0,100);salvar(true,false);renderForm();bancoEditarAbrir();toast("Palavras salvas para "+(chave||c.nome)+".");return}},
  "banco-remover":({t})=>{{const f=S.form,c=catBy(f.v.I);if(!c)return;const chave=f.v.J||"";c.bancoPalavras=c.bancoPalavras||{};c.bancoPalavras[chave]=bancoLista(c.nome,chave).filter(x=>semAc(x)!==semAc(t.dataset.w));salvar(true,false);renderForm();bancoEditarAbrir();return}},
  "banco-restaurar":()=>{{const f=S.form,c=catBy(f.v.I);if(!c)return;const chave=f.v.J||"";if(c.bancoPalavras)delete c.bancoPalavras[chave];salvar(true,false);renderForm();bancoEditarAbrir();toast("Sugestões iniciais restauradas.");return}},
  "desc-palavra":({t})=>{{const f=S.form,w=t.dataset.w,cur=String(f.v.F||"");if(!bancoComplementos(f).some(x=>semAc(x)===semAc(w))){renderForm();toast("Essa palavra já está na descrição ou nos campos da peça.");return}f.v.F=cur.replace(/\s+$/,"")+(cur.trim()?" ":"")+w+" ";f._descAuto="";salvar(false);renderForm();setTimeout(()=>{const d=document.getElementById("f-F");if(d){d.focus();d.setSelectionRange(d.value.length,d.value.length)}},0);return}},
  "simular-fator":()=>{simuladorFator();return},
  "sim-usar":({t})=>{{const f=S.form;f.mk=f.mk||{};f.mk[t.dataset.bid]=String(t.dataset.fator).replace(".",",");document.querySelectorAll(".rep").forEach(x=>x.remove());salvar(false);renderForm();toast(`Fator ${t.dataset.fator.replace(".",",")} aplicado.`);return}},
  "cor-on":()=>{{const f=S.form;f.corOn=true;renderForm();return}},
  "cor-off":()=>{{const f=S.form;f.corOn=false;f.csel=[];renderTopo();renderForm();return}},
  "cs-padrao":()=>{{const f=S.form,c=catBy(f.v.I);if(!c)return;c.coresCfg=c.coresCfg||{};c.coresCfg.padrao=(f.csel||[]).slice();salvar(true,false);renderCfg();toast((f.csel||[]).length?"Cores padrão salvas: ao escolher "+f.v.I+" elas já vêm marcadas.":"Padrão removido: nenhuma cor vem marcada.");return}},
  "cs-todas":()=>{{const f=S.form,l=coresDaCat(f.v.I,f.v.J);f.csel=f.csel&&f.csel.length===l.length?[]:l.map(x=>x.id);renderTopo();renderForm();salvar(false);return}},
  "gi-todos":()=>{{const f=S.form,gr=gradeBy(f.grade);if(gr){f.gsel=f.gsel&&f.gsel.length===gr.itens.length?[]:gr.itens.map(x=>x.id);renderTopo();renderForm();salvar(false)}return}},
  "gr-novo-pmg":()=>{{const c=catBy(S.form.v.I);if(!c)return;if(!c.grade)c.grade={id:uid(),nome:"Tamanhos",rotulo:" tamanho ",col:"K",subs:[],itens:[]};const gr=effGrade(c);if(gr.itens.length&&(gr.subs||[]).length&&!(gr.subs||[]).includes(S.form.v.J)){toast(`Os tamanhos desta categoria valem só para: ${gr.subs.join(", ")}. Para usar P M G aqui, tire essa restrição em Cadastros › Categorias.`);return}addTamanhos(gr,"P M G");sincGrade(S.form);S.form.gsel=gr.itens.map(x=>x.id);S.form.semGrade=false;salvar(true,false);renderForm();renderCfg();toast("Tamanhos P, M e G criados: a letra de cada um entra na referência.");return}},
  "gi-pmg":()=>{{const gr=gradeBy(S.form.grade);if(gr){const novos=addTamanhos(gr,"P M G");S.form.gsel=gr.itens.map(x=>x.id).filter(id=>novos.includes(id)||(S.form.gsel||[]).includes(id));S.form.semGrade=false;salvar(true,false);renderForm();toast("Tamanhos P, M e G prontos: a letra de cada um entra na referência.")}return}},
  "comp-add":({t})=>{{const f=S.form;f.comp=f.comp||[];if(f.comp.length>=60){toast("Máximo de 60 peças por conjunto.");return}const vaz=f.comp.findIndex(x=>!x.desc&&!x.peso&&!x.custo);let n;if(vaz>=0){n=vaz;if(t.dataset.nome)f.comp[vaz].desc=t.dataset.nome}else{n=f.comp.length;f.comp.push(novaComp(t.dataset.nome||""))}conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${n}"] [data-cp="${t.dataset.nome?"peso":"desc"}"]`);return}},
  "comp-dup":({t})=>{{const f=S.form,i=+t.dataset.ci,c=f.comp&&f.comp[i];if(!c)return;if(f.comp.length>=60){toast("Máximo de 60 peças por conjunto.");return}f.comp.splice(i+1,0,{...clone(c),id:uid()});conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${i+1}"] [data-cp="peso"]`);return}},
  "comp-up":acao_comp_up_comp_down,
  "comp-down":acao_comp_up_comp_down,
  "comp-del":({t})=>{{const f=S.form;f.comp.splice(+t.dataset.ci,1);conjSync(f);salvar(false);renderTopo();renderForm();return}}
});
