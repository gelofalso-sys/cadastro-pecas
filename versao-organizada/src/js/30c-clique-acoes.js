const CFG_UNDO=["forn-del","bh-del","bn-del","mod-del","mc-del","rom-del","rom-map-del","gr-del","gi-del","cc-reset","cat-del-ok","sub-del","cor-del","obs-del","go-del","cv-del","cv-todas","cv-num"];
/* Registro de ações de clique (data-act). Ao migrar um case para uma fatia: break vira return; return que pulava o código pós-switch vira return false. */
const ACOES=Object.create(null);
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-act],[data-tipo]");if(!t)return;histSep=true;setTimeout(()=>{histSep=false},0);
  if(t.dataset.tipo){tipoClique(t.dataset.tipo);return}
  const a=t.dataset.act,C=cfg(),tr=t.closest("tr[data-l],.pc[data-l]");
  const ci=t.closest("[data-cat]")?+t.closest("[data-cat]").dataset.cat:-1,bi=t.closest("[data-bh]")?+t.closest("[data-bh]").dataset.bh:-1;
  const snapCfg=CFG_UNDO.includes(a)?clone(S.config):null;
  const ctx={t,e,a,C,tr,ci,bi};
  if(ACOES[a]){if(ACOES[a](ctx)===false)return}else switch(a){

    case "b-copy":copiar(new Set(sel));break;
    case "b-xlsx":baixar(false,new Set(sel));break;
    case "s-xlsx":{const ids=idsDaSel();if(ids.length)baixar(false,new Set(ids));break}
    case "zoom":{const k=t.dataset.z,d=+t.dataset.d;ZM[k]=d===0?1:Math.min(1.6,Math.max(0.7,Math.round((ZM[k]+d*0.1)*10)/10));zoomAplicar(true);break}
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

    case "historico":historicoAbrir();break
    case "hist-voltar":{const n=+t.dataset.n;document.querySelectorAll(".rep").forEach(x=>x.remove());let feitas=0;while(feitas<n&&HIST.length){if(desfazer()!==true)break;feitas++}if(feitas===n)toast(`Voltou ${feitas} alteração(ões).`);else toast(`Voltou ${feitas} de ${n} alteração(ões). A operação parou para preservar os dados; confira conflitos ou alterações posteriores no romaneio.`);break}
    case "origem-ok":{try{localStorage.setItem("cadpecas-origem-ok","1")}catch(e){}document.querySelectorAll(".origem-aviso").forEach(x=>x.remove());break}
    case "prim-ir":{primeirosIr(t.dataset.p);primeirosAtualizar();break}
    case "prim-fechar":{abertos.primeiros=false;guardarAbertos();primeirosAtualizar();break}
    case "novidades":novidadesAbrir();break
    case "diag-dados":diagnosticoDados();break;
    case "backup-total":backupTotal();break;
    case "renumerar":{if(!S.lanc.length){toast("Nenhuma peça para renumerar.");break}if(!confirm("Renumerar as referências na ordem da tabela? As referências automáticas (as que você não digitou) serão refeitas do começo da sequência, e as peças já enviadas ao fornecedor podem mudar de número. Dá para desfazer."))break;renumerarRefs();salvar(false);renderTopo();toast("Referências renumeradas na ordem da tabela.",{t:"Desfazer",fn:desfazer});break}
    case "abrir-arq":{const i=document.getElementById(t.dataset.alvo);if(i)i.click();break}
  }
  if(snapCfg&&JSON.stringify(S.config)!==JSON.stringify(snapCfg))toast("Cadastro alterado.",{t:"Desfazer",fn:()=>{S.config=snapCfg;salvar(true);render()}});
});
