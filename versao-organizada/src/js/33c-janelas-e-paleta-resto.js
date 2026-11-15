/* lembrete de backup: os dados ficam só neste navegador; passada uma semana sem backup completo (e com peças lançadas), avisa uma vez por abertura */
function lembreteBackup(){try{const k="cadpecas-bk-em",u="cadpecas-uso-em";if(!lerPref(u))gravarPref(u,String(Date.now()));
  const ult=+lerPref(k)||+lerPref(u)||Date.now();
  if(S.lanc.length>=5&&Date.now()-ult>7*864e5)setTimeout(()=>toast("Faz mais de uma semana que você não baixa um backup completo. Seus dados ficam só neste navegador.",{t:"Fazer backup",fn:backupTotal}),2500)}catch(e){}}
/* Aguarda eventual recuperação de backup antes de expor os dados para edição. */
{const tela=document.createElement("div");tela.setAttribute("role","alert");tela.style.cssText="position:fixed;inset:0;z-index:100001;background:#fff;display:grid;place-content:center;padding:24px;font:16px system-ui;text-align:center";tela.textContent="Verificando a recuperação dos dados…";document.documentElement.appendChild(tela);document.body.inert=true;
  let etapa="verificar a recuperação";
  const abrir=(semVarredura=false)=>{document.body.inert=false;tela.remove();try{if(lerSessao("cadpecas-recuperou-backup")){removerSessao("cadpecas-recuperou-backup");toast("Uma restauração interrompida foi revertida para os dados anteriores.")}}catch(e){}lembreteBackup();if(semVarredura){estadoTabelas.semVarredura=true;const aviso=document.createElement("div");aviso.setAttribute("role","status");aviso.style.cssText="padding:10px;background:#fff3cd;color:#664d03;font:14px system-ui";aviso.textContent="Aberto sem verificar o armazenamento de arquivos. Romaneios, tabelas e fotos podem estar incompletos; a limpeza automática de fotos foi desativada. Recarregue quando o armazenamento voltar a funcionar.";document.body.prepend(aviso);return}return varrerTudo()};
  const falhou=(e,podeForcar)=>{try{console.error("Falha ao abrir os dados (etapa: "+etapa+")",e)}catch(x){}
    tela.textContent="Não foi possível verificar ou recuperar uma restauração interrompida. Seus dados não foram abertos para edição. Libere espaço, feche outras abas e recarregue. Se o problema continuar, guarde uma cópia do backup e procure suporte.";
    const det=document.createElement("p");det.style.cssText="font:12px system-ui;color:#555;max-width:640px;margin:10px auto";det.textContent="Detalhe técnico — etapa: "+etapa+" · "+String((e&&e.message)||e||"o armazenamento do navegador (IndexedDB) não respondeu").slice(0,200);tela.appendChild(det);
    const b=document.createElement("button");b.textContent="Tentar novamente";b.onclick=()=>location.reload();tela.appendChild(b);
    if(podeForcar){const f=document.createElement("button");f.textContent="Abrir mesmo assim";f.style.marginLeft="10px";f.title="Abre os dados que estão no navegador sem checar a recuperação de restauração. Se uma restauração de backup foi interrompida, os dados podem estar incompletos: depois de abrir, baixe um backup.";
      f.onclick=()=>{etapa="abrir sem a checagem";tela.textContent="Abrindo os dados…";Promise.resolve().then(()=>bkUsoIniciar()).catch(()=>{}).then(()=>carregar()).then(()=>exAbrirIndices()).then(ok=>abrir(!ok)).catch(()=>abrir(true))};tela.appendChild(f)}};
  bkRecuperarPendente().then(ok=>{if(!ok)throw new Error("o armazenamento do navegador não respondeu ou há uma restauração pendente");etapa="reservar o uso";return bkUsoIniciar()}).then(()=>{etapa="carregar os dados";return carregar()}).then(()=>{etapa="recuperar exclusões e índices";return exAbrirIndices()}).then(ok=>{if(!ok)throw new Error("não foi possível recuperar exclusões ou conferir os índices salvos");etapa="varrer as peças";return abrir()}).catch(e=>falhou(e,etapa==="verificar a recuperação"||etapa==="reservar o uso"))}
/* duas abas abertas: se a outra gravou, esta avisa (e para de gravar) em vez de sobrescrever */
window.addEventListener("storage",e=>{
  if(e.key!=="cadpecas4"||e.newValue==null||!ehAreaLocal(e.storageArea))return;
  conflito=true;clearTimeout(sT);sT=null;
  if(document.getElementById("outraAba"))return;
  const b=document.createElement("div");b.id="outraAba";b.setAttribute("role","alert");
  b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:99999;background:#fff3cd;color:#664d03;border-bottom:2px solid #c9a227;padding:10px 14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font:14px system-ui,sans-serif";
  b.innerHTML=`<b>Outra aba alterou os dados.</b><span>Esta aba parou de salvar para não sobrescrever o trabalho da outra.</span><button type="button" id="oaRec" class="btn pri sm">Recarregar</button><button type="button" id="oaMan" class="btn sm" title="Descarta o que a outra aba gravou e salva o que está nesta aba">Manter esta aba</button>`;
  document.body.appendChild(b);
  document.getElementById("oaRec").onclick=()=>{dirty={c:false,l:false};location.reload()};
  document.getElementById("oaMan").onclick=()=>{conflito=false;b.remove();salvar(true)};
});

/* o rascunho do romaneio tem chave própria: se outra aba o regravou, esta para de gravar o romaneio em vez de sobrescrever */
window.addEventListener("storage",e=>{
  if(e.key!==ROMKEY||!ehAreaLocal(e.storageArea)||!ROM||!ROM.rows.length||romConflito)return;
  romConflito=true;clearTimeout(romST);romST=null;
  if(document.getElementById("outraAbaRom"))return;
  const b=document.createElement("div");b.id="outraAbaRom";b.setAttribute("role","alert");
  b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:99999;background:#fff3cd;color:#664d03;border-bottom:2px solid #c9a227;padding:10px 14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font:14px system-ui,sans-serif";
  b.innerHTML=`<b>Outra aba alterou este romaneio.</b><span>Esta aba parou de salvar o romaneio para não sobrescrever o trabalho da outra.</span><button type="button" id="orRec" class="btn pri sm">Recarregar</button><button type="button" id="orMan" class="btn sm" title="Descarta o que a outra aba gravou e salva o romaneio desta aba">Manter esta aba</button>`;
  document.body.appendChild(b);
  document.getElementById("orRec").onclick=()=>{location.reload()};
  document.getElementById("orMan").onclick=()=>{romConflito=false;b.remove();romSalvar()};
});

/* ===== v19: romaneio — busca e filtro por situação (só esconde os cartões; nada é remontado) ===== */
let ROMF={q:"",m:"todas"};
function romFiltroAplicar(){
  const w=document.getElementById("romWrap");if(!w||!ROM)return;
  const q=semAc(ROMF.q),m=ROMF.m;let n=0;
  ROM.rows.forEach((r,i)=>{const c=w.querySelector('.rc[data-i="'+i+'"]');if(!c)return;
    const okM=m==="todas"||romSit(r)===m||(m==="pendentes"&&false),okQ=!q||semAc((r.cod||"")+" "+(r.desc||"")+" "+(r.cat||"")+" "+(r.sub||"")).includes(q);
    const mostra=okM&&okQ;c.style.display=mostra?"":"none";if(mostra)n++});
  const inf=document.getElementById("romfN");if(inf)inf.textContent=(q||m!=="todas")?n+" de "+ROM.rows.length+" peças":"";
  w.querySelectorAll("[data-romf]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.romf===m)));
}
function romFiltroMontar(){
  const w=document.getElementById("romWrap");if(!w||!ROM||ROM.rows.length<2)return;
  const sum=w.querySelector(".rom-sum");if(!sum||w.querySelector(".romf"))return;
  const d=document.createElement("div");d.className="romf";
  d.innerHTML='<input type="search" id="romfQ" placeholder="Buscar peça por código ou descrição…" aria-label="Buscar peça neste romaneio" autocomplete="off"><span class="seg" role="group" aria-label="Filtrar por situação">'+
    [["todas","Todas"],["pendentes","Pendentes"],["prontas","Prontas"],["lancadas","Lançadas"],["ignoradas","Ignoradas"]].map(a=>'<button type="button" data-romf="'+a[0]+'" aria-pressed="false">'+a[1]+'</button>').join("")+'</span><button type="button" class="btn sm" id="romfC" aria-pressed="false" title="Mostra cada peça numa linha só; clique na peça para abrir os detalhes ([ e ] vão para a anterior e a próxima)">▤ Compactar</button><span class="hint" id="romfN"></span>';
  sum.after(d);d.querySelector("#romfQ").value=ROMF.q;romCompacto(romCompactoOn());romFiltroAplicar();
}
{const _rr=renderRom;renderRom=function(){const r=_rr.apply(this,arguments);try{romFiltroMontar();document.body.classList.toggle("rom-ativo",!!ROM)}catch(e){}return r}}
{const _ra=romAtual;romAtual=function(){const r=_ra.apply(this,arguments);try{romFiltroAplicar()}catch(e){}return r}}
document.getElementById("romWrap").addEventListener("input",e=>{if(e.target.id==="romfQ"){ROMF.q=e.target.value;romFiltroAplicar()}});
document.getElementById("romWrap").addEventListener("click",e=>{const b=e.target.closest("[data-romf]");if(b){ROMF.m=b.dataset.romf;romFiltroAplicar()}});
/* cartões compactos por padrão em romaneios com 4 ou mais peças (a escolha do usuário vale depois) */
const romCompactoOn=()=>abertos.romc==null?!!(ROM&&ROM.rows.filter(r=>!r.lote).length>=4):!!abertos.romc;
function romCompacto(on){const rs=document.querySelector("#romWrap .rcs");if(rs)rs.classList.toggle("compacto",on);const b=document.getElementById("romfC");if(b){b.setAttribute("aria-pressed",String(on));b.textContent=on?"▥ Expandir":"▤ Compactar"}}
function romNav(d){const cs=[...document.querySelectorAll("#romWrap .rc")].filter(c=>c.style.display!=="none");if(!cs.length)return;
  const at=cs.findIndex(c=>c.contains(document.activeElement)),i=Math.min(cs.length-1,Math.max(0,(at<0?(d>0?-1:cs.length):at)+d)),c=cs[i];
  const f=c.querySelector("[data-rp=peso],[data-rp=desc],input,select");c.scrollIntoView({block:"center",behavior:"auto"});if(f)f.focus({preventScroll:true})}
document.getElementById("romWrap").addEventListener("click",e=>{
  if(e.target.closest("#romfC")){abertos.romc=!romCompactoOn();guardarAbertos();romCompacto(romCompactoOn());return}
  const c=e.target.closest(".rcs.compacto .rc");if(c&&!c.classList.contains("aberto")&&!e.target.closest("input,select,button,label,summary,a")){document.querySelectorAll("#romWrap .rc.aberto").forEach(x=>x.classList.remove("aberto"));c.classList.add("aberto")}});
document.addEventListener("keydown",e=>{if((e.key==="["||e.key==="]")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&document.querySelector("#romWrap .rc")&&!/TEXTAREA|SELECT/.test(e.target.tagName)&&!(e.target.tagName==="INPUT"&&!/^(checkbox|radio|button)$/.test(e.target.type))&&!e.target.isContentEditable){   /* em campo de digitação, [ e ] são caracteres */
  const t=e.target;if(/INPUT|SELECT/.test(t.tagName)&&!t.closest("#romWrap .rc"))return;e.preventDefault();romNav(e.key==="]"?1:-1)}});
/* romaneios lançados: busca por fornecedor, documento ou observação */
{const _rl=romListaAbrir;romListaAbrir=function(){const r=_rl.apply(this,arguments);try{
  const ov=document.querySelector(".rep"),tb=ov&&ov.querySelector(".rep-tb");if(!tb)return r;
  const i=document.createElement("input");i.type="search";i.className="rep-busca";i.placeholder="Buscar por fornecedor, documento, observação ou quem montou…";i.setAttribute("aria-label","Buscar romaneio");
  tb.before(i);i.addEventListener("input",()=>{const q=semAc(i.value);tb.querySelectorAll("tbody tr").forEach(tr=>{tr.style.display=!q||semAc(tr.textContent).includes(q)?"":"none"})});
  const idx=ROMS.slice();tb.querySelectorAll("tbody tr").forEach((tr,k)=>{const x=idx[k];if(!x)return;
    const st=x.feitas>=x.n&&x.n?["Lançado","ok"]:x.feitas>0?["Parcial","warn"]:["A lançar","new"],td=tr.children[1];
    if(td)td.insertAdjacentHTML("beforeend",' <span class="rsel-st rst-'+st[1]+'">'+st[0]+'</span>')});
  setTimeout(()=>{if(!celular())i.focus()},0)}catch(e){}return r}}

/* ===== v19: paleta de comandos (Ctrl+K) ===== */
const PALCMD=[
 ["Tabela e formulário","Alt+1",()=>visPara("tudo")],["Recolher o formulário (só a tabela)","Alt+2",()=>visPara("planilha")],["Cadastros","Alt+3",()=>visPara("cad")],
 ["Novo romaneio / continuar romaneio","",()=>document.querySelector('[data-act="rom-abrir"]')&&document.querySelector('[data-act="rom-abrir"]').click()],
 ["Romaneios lançados","",()=>document.querySelector('[data-act="rom-lista"]').click()],["Tabelas salvas","",()=>document.querySelector('[data-act="tab-lista"]').click()],
 ["Baixar .xlsx","",()=>document.querySelector('[data-act="xlsx"]').click()],["Copiar para o Excel","",()=>document.querySelector('[data-act="copiar"]').click()],
 ["Desfazer","Ctrl+Z",()=>desfazer()],["Refazer","Ctrl+Y",()=>desfazer(true)],
 ["Cadastros: Galvânicas e banhos","",()=>irPara("banho")],["Cadastros: Cores, tamanhos e variações","",()=>irPara("cor")],["Cadastros: Categorias","",()=>irPara("cat")],["Cadastros: Fornecedores","",()=>irPara("forn")],["Cadastros: Padrões das colunas","",()=>irPara("col")],["Cadastros: Modelo da planilha","",()=>irPara("mod")],["Cadastros: Leitura de romaneios","",()=>irPara("rom")],["Romaneios lançados","",()=>irPara("roml")],["Cadastros: Fotos (link)","",()=>irPara("foto")],["Cadastros: Importar e backup","",()=>irPara("opc")],
 ["Buscar na planilha","/",()=>{visPara(celular()?"planilha":"tudo");const f=document.getElementById("fBusca");if(f){f.focus()}}]];
function palAbrir(){
  if(document.getElementById("pal"))return;
  const o=document.createElement("div");o.id="pal";o.className="pal";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","Paleta de comandos");
  o.innerHTML='<div class="pal-c"><input id="palQ" placeholder="Digite um comando… (visão, cadastro, romaneio, baixar)" autocomplete="off" aria-label="Comando"><ul class="pal-l" id="palL" role="listbox"></ul></div>';
  document.body.appendChild(o);const q=o.querySelector("#palQ"),ul=o.querySelector("#palL");let sel=0,vis=PALCMD;
  const fecha=()=>{o.remove()},roda=i=>{const c=vis[i];if(!c)return;fecha();setTimeout(()=>{try{c[2]()}catch(e){}},0)};
  const desenha=()=>{const t=semAc(q.value);vis=PALCMD.filter(c=>!t||t.split(/\s+/).every(w=>semAc(c[0]).includes(w)));sel=Math.min(sel,Math.max(0,vis.length-1));
    ul.innerHTML=vis.length?vis.map((c,i)=>'<li role="option" data-i="'+i+'" aria-selected="'+(i===sel)+'">'+esc(c[0])+(c[1]?'<small>'+esc(c[1])+'</small>':"")+'</li>').join(""):'<li class="pal-v">Nada encontrado</li>';
    const a=ul.querySelector('[aria-selected=true]');if(a)a.scrollIntoView({block:"nearest"})};
  q.addEventListener("input",()=>{sel=0;desenha()});
  q.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){e.preventDefault();sel=Math.min(vis.length-1,sel+1);desenha()}else if(e.key==="ArrowUp"){e.preventDefault();sel=Math.max(0,sel-1);desenha()}else if(e.key==="Enter"){e.preventDefault();roda(sel)}else if(e.key==="Escape"){e.preventDefault();e.stopPropagation();fecha()}});
  ul.addEventListener("click",e=>{const l=e.target.closest("li[data-i]");if(l)roda(+l.dataset.i)});
  o.addEventListener("mousedown",e=>{if(e.target===o)fecha()});
  desenha();q.focus();
}
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()==="k"){e.preventDefault();palAbrir()}});

