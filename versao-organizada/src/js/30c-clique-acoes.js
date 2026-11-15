function ativarConjunto(){const f=S.form;f.tipo="pronta";f.conj=true;if(!Array.isArray(f.comp)||!f.comp.length)f.comp=[novaComp(),novaComp()];if(!f.banhista)f.banhista=(cfg().banhistas[0]||{}).id||"";conjSync(f);salvar(false);renderListas();renderTopo();renderForm();refocar('#conj [data-cp="desc"]')}
const CFG_UNDO=["forn-del","bh-del","bn-del","mod-del","mc-del","rom-del","rom-map-del","gr-del","gi-del","cc-reset","cat-del-ok","sub-del","cor-del","obs-del","go-del","cv-del","cv-todas","cv-num"];
/* Registro de ações de clique (data-act). Ao migrar um case para uma fatia: break vira return; return que pulava o código pós-switch vira return false. */
const ACOES=Object.create(null);
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-act],[data-tipo]");if(!t)return;histSep=true;setTimeout(()=>{histSep=false},0);
  if(t.dataset.tipo==="conjunto"){const f=S.form;f.tipo="pronta";f.conj=true;if(!Array.isArray(f.comp)||!f.comp.length)f.comp=[novaComp(),novaComp()];
    if(!f.banhista)f.banhista=(cfg().banhistas[0]||{}).id||"";if(!editId&&f.v.I!=="Conjuntos"&&catBy("Conjuntos")&&!(catBy(f.v.I)||{}).semBanho){f.v.I="Conjuntos";delete f.v.J;sincGrade(f)}else if(!editId&&(catBy(f.v.I)||{}).semBanho&&(catBy(f.v.I).subs||[]).includes("Conjuntos")){f.v.J="Conjuntos";sincGrade(f)}
    conjSync(f);salvar(false);renderTopo();renderForm();refocar('#conj [data-cp="desc"]');return}
  if(t.dataset.tipo){if(S.form.conj){conjLimpar(S.form);delete S.form.conj}S.form.tipo=t.dataset.tipo;if(t.dataset.tipo==="bruta"&&!Object.values(S.form.on||{}).some(Boolean))marcadosPadrao(S.form);if(t.dataset.tipo==="bruta"&&!editId)banhistaDoFornecedor(S.form);salvar(false);renderTopo();renderForm();focarPrimeiro();return}
  const a=t.dataset.act,C=cfg(),tr=t.closest("tr[data-l],.pc[data-l]");
  const ci=t.closest("[data-cat]")?+t.closest("[data-cat]").dataset.cat:-1,bi=t.closest("[data-bh]")?+t.closest("[data-bh]").dataset.bh:-1;
  const snapCfg=CFG_UNDO.includes(a)?clone(S.config):null;
  const ctx={t,e,a,C,tr,ci,bi};
  if(ACOES[a]){if(ACOES[a](ctx)===false)return}else switch(a){

    case "b-copy":copiar(new Set(sel));break;
    case "b-xlsx":baixar(false,new Set(sel));break;
    case "s-xlsx":{const ids=idsDaSel();if(ids.length)baixar(false,new Set(ids));break}
    case "excl-volta":S.form.excl=[];salvar(false);renderForm();toast("As linhas excluídas voltam quando você clicar em Salvar.");break;
    case "cancel":if(editId)cancelar();else{limparForm();salvar(false);renderTopo();renderForm();focarPrimeiro()}break;   /* sem peça em edição, Cancelar esvazia o formulário */
    case "limpar":limparForm();salvar(false);renderTopo();renderForm();focarPrimeiro();break;
    case "repetir":{const l=S.lanc[S.lanc.length-1];if(l)usarModelo(l.id);else toast("Ainda não há peça para repetir.");break}
    case "form-extras":{const f=t.closest("#form"),abriu=f.classList.toggle("fextra-open");t.setAttribute("aria-expanded",String(abriu));t.textContent=abriu?"Menos opções de lançamento":"Mais opções de lançamento";break}
    case "faixa-salvar":{const f=S.form,gr=gradeBy(f.grade);if(gr){gr.faixa=gr.itens.filter(x=>(f.gsel||[]).includes(x.id)).map(x=>x.nome).join(", ");salvar(true,false);renderCfg();toast(gr.faixa?`Tamanhos padrão: ${gr.faixa}`:"Padrão removido: nenhum tamanho vem marcado.")}break}
    case "zoom":{const k=t.dataset.z,d=+t.dataset.d;ZM[k]=d===0?1:Math.min(1.6,Math.max(0.7,Math.round((ZM[k]+d*0.1)*10)/10));zoomAplicar(true);break}
    case "add-limpar":adicionar(true);break;
    case "tg-min":abertos.min=!abertos.min;guardarAbertos();renderForm();break;
    case "tg-det":abertos.det=!abertos.det;guardarAbertos();renderForm();break;
    case "rom-q":{if(t.dataset.q==="bh"||t.dataset.q==="bn"){qIrGalvanica(t.dataset.q);break}const f=S.form,i=t.dataset.i!=null?+t.dataset.i:null,r=i!=null&&ROM?ROM.rows[i]:null;romQ0={I:f.v.I,J:f.v.J};romQRow=i;if(r&&["sub","gi","cv"].includes(t.dataset.q)){if(r.cat)f.v.I=r.cat;if(t.dataset.q!=="sub"){if(r.sub)f.v.J=r.sub;else delete f.v.J}}quick=t.dataset.q;quickB=null;renderForm();const el=document.querySelector("#formWrap .nf");if(el)el.scrollIntoView({block:"center"});refocar("#q1");break}
    case "q":if(t.dataset.q==="bh"||t.dataset.q==="bn"){qIrGalvanica(t.dataset.q);break}quickPre="";quick=quick===t.dataset.q&&(t.dataset.qb||null)===quickB?null:t.dataset.q;quickB=quick?(t.dataset.qb||null):null;renderForm();break;
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
    case "exemplo":abrirExemploVisual();break;

    case "trabalho-toggle":trabalhoAberto=!trabalhoAberto;renderForm();break;
    case "preset-salvar":{const el=document.querySelector("[data-preset-nome]"),nome=el&&el.value.trim();if(!nome){toast("Digite um nome para a combinação.");break}C.presetsLancamento=Array.isArray(C.presetsLancamento)?C.presetsLancamento:[];if(C.presetsLancamento.some(p=>semAc(p.nome)===semAc(nome))){toast("Já existe uma combinação com esse nome.");break}if(C.presetsLancamento.length>=30){toast("Limite de 30 combinações.");break}C.presetsLancamento.push(presetAtual(nome));salvar(true,false);renderForm();toast("Combinação salva.");break}
    case "preset-usar":case "preset-excluir":{const el=document.querySelector("[data-preset-select]"),ps=C.presetsLancamento||[],i=el&&el.value!==""?Number(el.value):-1;if(!ps[i]){toast("Escolha uma combinação.");break}if(a==="preset-usar")presetAplicar(ps[i]);else{if(!confirm(`Excluir a combinação “${ps[i].nome}”?`))break;ps.splice(i,1);salvar(true,false);renderForm();toast("Combinação excluída.")}break}
    case "banco-toggle":bancoAberto=!bancoAberto;renderForm();break;
    case "banco-adicionar":{const f=S.form,c=catBy(f.v.I),el=document.querySelector('[data-banco-nova]');if(!c||!el)break;const palavras=el.value.split(";").map(x=>x.trim().replace(/\s+/g," ")).filter(x=>x&&x.length<=60);if(!palavras.length){toast("Digite uma palavra ou expressão.");break}const chave=f.v.J||"",lista=bancoLista(c.nome,chave).slice();palavras.forEach(w=>{if(!lista.some(x=>semAc(x)===semAc(w)))lista.push(w)});c.bancoPalavras=c.bancoPalavras||{};c.bancoPalavras[chave]=lista.slice(0,100);salvar(true,false);renderForm();bancoEditarAbrir();toast("Palavras salvas para "+(chave||c.nome)+".");break}
    case "banco-remover":{const f=S.form,c=catBy(f.v.I);if(!c)break;const chave=f.v.J||"";c.bancoPalavras=c.bancoPalavras||{};c.bancoPalavras[chave]=bancoLista(c.nome,chave).filter(x=>semAc(x)!==semAc(t.dataset.w));salvar(true,false);renderForm();bancoEditarAbrir();break}
    case "banco-restaurar":{const f=S.form,c=catBy(f.v.I);if(!c)break;const chave=f.v.J||"";if(c.bancoPalavras)delete c.bancoPalavras[chave];salvar(true,false);renderForm();bancoEditarAbrir();toast("Sugestões iniciais restauradas.");break}
    case "desc-palavra":{const f=S.form,w=t.dataset.w,cur=String(f.v.F||"");if(!bancoComplementos(f).some(x=>semAc(x)===semAc(w))){renderForm();toast("Essa palavra já está na descrição ou nos campos da peça.");break}f.v.F=cur.replace(/\s+$/,"")+(cur.trim()?" ":"")+w+" ";f._descAuto="";salvar(false);renderForm();setTimeout(()=>{const d=document.getElementById("f-F");if(d){d.focus();d.setSelectionRange(d.value.length,d.value.length)}},0);break}
    case "historico":historicoAbrir();break
    case "hist-voltar":{const n=+t.dataset.n;document.querySelectorAll(".rep").forEach(x=>x.remove());let feitas=0;while(feitas<n&&HIST.length){if(desfazer()!==true)break;feitas++}if(feitas===n)toast(`Voltou ${feitas} alteração(ões).`);else toast(`Voltou ${feitas} de ${n} alteração(ões). A operação parou para preservar os dados; confira conflitos ou alterações posteriores no romaneio.`);break}
    case "origem-ok":{try{localStorage.setItem("cadpecas-origem-ok","1")}catch(e){}document.querySelectorAll(".origem-aviso").forEach(x=>x.remove());break}
    case "simular-fator":simuladorFator();break
    case "sim-usar":{const f=S.form;f.mk=f.mk||{};f.mk[t.dataset.bid]=String(t.dataset.fator).replace(".",",");document.querySelectorAll(".rep").forEach(x=>x.remove());salvar(false);renderForm();toast(`Fator ${t.dataset.fator.replace(".",",")} aplicado.`);break}
    case "prim-ir":{primeirosIr(t.dataset.p);primeirosAtualizar();break}
    case "prim-fechar":{abertos.primeiros=false;guardarAbertos();primeirosAtualizar();break}
    case "novidades":novidadesAbrir();break
    case "cor-on":{const f=S.form;f.corOn=true;renderForm();break}
    case "cor-off":{const f=S.form;f.corOn=false;f.csel=[];renderTopo();renderForm();break}
    case "cs-padrao":{const f=S.form,c=catBy(f.v.I);if(!c)break;c.coresCfg=c.coresCfg||{};c.coresCfg.padrao=(f.csel||[]).slice();salvar(true,false);renderCfg();toast((f.csel||[]).length?"Cores padrão salvas: ao escolher "+f.v.I+" elas já vêm marcadas.":"Padrão removido: nenhuma cor vem marcada.");break}
    case "cs-todas":{const f=S.form,l=coresDaCat(f.v.I,f.v.J);f.csel=f.csel&&f.csel.length===l.length?[]:l.map(x=>x.id);renderTopo();renderForm();salvar(false);break}
    case "gi-todos":{const f=S.form,gr=gradeBy(f.grade);if(gr){f.gsel=f.gsel&&f.gsel.length===gr.itens.length?[]:gr.itens.map(x=>x.id);renderTopo();renderForm();salvar(false)}break}
    case "gr-novo-pmg":{const c=catBy(S.form.v.I);if(!c)break;if(!c.grade)c.grade={id:uid(),nome:"Tamanhos",rotulo:" tamanho ",col:"K",subs:[],itens:[]};const gr=effGrade(c);if(gr.itens.length&&(gr.subs||[]).length&&!(gr.subs||[]).includes(S.form.v.J)){toast(`Os tamanhos desta categoria valem só para: ${gr.subs.join(", ")}. Para usar P M G aqui, tire essa restrição em Cadastros › Categorias.`);break}addTamanhos(gr,"P M G");sincGrade(S.form);S.form.gsel=gr.itens.map(x=>x.id);S.form.semGrade=false;salvar(true,false);renderForm();renderCfg();toast("Tamanhos P, M e G criados: a letra de cada um entra na referência.");break}
    case "gi-pmg":{const gr=gradeBy(S.form.grade);if(gr){const novos=addTamanhos(gr,"P M G");S.form.gsel=gr.itens.map(x=>x.id).filter(id=>novos.includes(id)||(S.form.gsel||[]).includes(id));S.form.semGrade=false;salvar(true,false);renderForm();toast("Tamanhos P, M e G prontos: a letra de cada um entra na referência.")}break}
    case "comp-add":{const f=S.form;f.comp=f.comp||[];if(f.comp.length>=60){toast("Máximo de 60 peças por conjunto.");break}const vaz=f.comp.findIndex(x=>!x.desc&&!x.peso&&!x.custo);let n;if(vaz>=0){n=vaz;if(t.dataset.nome)f.comp[vaz].desc=t.dataset.nome}else{n=f.comp.length;f.comp.push(novaComp(t.dataset.nome||""))}conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${n}"] [data-cp="${t.dataset.nome?"peso":"desc"}"]`);break}
    case "comp-dup":{const f=S.form,i=+t.dataset.ci,c=f.comp&&f.comp[i];if(!c)break;if(f.comp.length>=60){toast("Máximo de 60 peças por conjunto.");break}f.comp.splice(i+1,0,{...clone(c),id:uid()});conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${i+1}"] [data-cp="peso"]`);break}
    case "comp-up":case "comp-down":{const f=S.form,i=+t.dataset.ci,j=a==="comp-up"?i-1:i+1;if(!f.comp||j<0||j>=f.comp.length)break;[f.comp[i],f.comp[j]]=[f.comp[j],f.comp[i]];conjSync(f);salvar(false);renderTopo();renderForm();refocar(`#conj [data-ci="${j}"] [data-act="${a}"]`);break}
    case "comp-del":{const f=S.form;f.comp.splice(+t.dataset.ci,1);conjSync(f);salvar(false);renderTopo();renderForm();break}
    case "diag-dados":diagnosticoDados();break;
    case "backup-total":backupTotal();break;
    case "renumerar":{if(!S.lanc.length){toast("Nenhuma peça para renumerar.");break}if(!confirm("Renumerar as referências na ordem da tabela? As referências automáticas (as que você não digitou) serão refeitas do começo da sequência, e as peças já enviadas ao fornecedor podem mudar de número. Dá para desfazer."))break;renumerarRefs();salvar(false);renderTopo();toast("Referências renumeradas na ordem da tabela.",{t:"Desfazer",fn:desfazer});break}
    case "abrir-arq":{const i=document.getElementById(t.dataset.alvo);if(i)i.click();break}
  }
  if(snapCfg&&JSON.stringify(S.config)!==JSON.stringify(snapCfg))toast("Cadastro alterado.",{t:"Desfazer",fn:()=>{S.config=snapCfg;salvar(true);render()}});
});
