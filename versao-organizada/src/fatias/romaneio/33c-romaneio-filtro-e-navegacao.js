/* ===== v19: romaneio — busca e filtro por situação (só esconde os cartões; nada é remontado) ===== */
function romFiltroAplicar(){
  const w=document.getElementById("romWrap");if(!w||!estadoRomaneio.ROM)return;
  const q=semAc(estadoRomaneio.romf.q),m=estadoRomaneio.romf.m;let n=0;
  estadoRomaneio.ROM.rows.forEach((r,i)=>{const c=w.querySelector('.rc[data-i="'+i+'"]');if(!c)return;
    const okM=m==="todas"||romSit(r)===m||(m==="pendentes"&&false),okQ=!q||semAc((r.cod||"")+" "+(r.desc||"")+" "+(r.cat||"")+" "+(r.sub||"")).includes(q);
    const mostra=okM&&okQ;c.style.display=mostra?"":"none";if(mostra)n++});
  const inf=document.getElementById("romfN");if(inf)inf.textContent=(q||m!=="todas")?n+" de "+estadoRomaneio.ROM.rows.length+" peças":"";
  w.querySelectorAll("[data-romf]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.romf===m)));
}
function romFiltroMontar(){
  const w=document.getElementById("romWrap");if(!w||!estadoRomaneio.ROM||estadoRomaneio.ROM.rows.length<2)return;
  const sum=w.querySelector(".rom-sum");if(!sum||w.querySelector(".romf"))return;
  const d=document.createElement("div");d.className="romf";
  d.innerHTML='<input type="search" id="romfQ" placeholder="Buscar peça por código ou descrição…" aria-label="Buscar peça neste romaneio" autocomplete="off"><span class="seg" role="group" aria-label="Filtrar por situação">'+
    [["todas","Todas"],["pendentes","Pendentes"],["prontas","Prontas"],["lancadas","Lançadas"],["ignoradas","Ignoradas"]].map(a=>'<button type="button" data-romf="'+a[0]+'" aria-pressed="false">'+a[1]+'</button>').join("")+'</span><button type="button" class="btn sm" id="romfC" aria-pressed="false" title="Mostra cada peça numa linha só; clique na peça para abrir os detalhes ([ e ] vão para a anterior e a próxima)">▤ Compactar</button><span class="hint" id="romfN"></span>';
  sum.after(d);d.querySelector("#romfQ").value=estadoRomaneio.romf.q;romCompacto(romCompactoOn());romFiltroAplicar();
}
{const _rr=renderRom;renderRom=function(){const r=_rr.apply(this,arguments);try{romFiltroMontar();document.body.classList.toggle("rom-ativo",!!estadoRomaneio.ROM)}catch(e){}return r}}
{const _ra=romAtual;romAtual=function(){const r=_ra.apply(this,arguments);try{romFiltroAplicar()}catch(e){}return r}}
document.getElementById("romWrap").addEventListener("input",e=>{if(e.target.id==="romfQ"){estadoRomaneio.romf.q=e.target.value;romFiltroAplicar()}});
document.getElementById("romWrap").addEventListener("click",e=>{const b=e.target.closest("[data-romf]");if(b){estadoRomaneio.romf.m=b.dataset.romf;romFiltroAplicar()}});
/* cartões compactos por padrão em romaneios com 4 ou mais peças (a escolha do usuário vale depois) */
const romCompactoOn=()=>estadoBase.abertos.romc==null?!!(estadoRomaneio.ROM&&estadoRomaneio.ROM.rows.filter(r=>!r.lote).length>=4):!!estadoBase.abertos.romc;
function romCompacto(on){const rs=document.querySelector("#romWrap .rcs");if(rs)rs.classList.toggle("compacto",on);const b=document.getElementById("romfC");if(b){b.setAttribute("aria-pressed",String(on));b.textContent=on?"▥ Expandir":"▤ Compactar"}}
function romNav(d){const cs=[...document.querySelectorAll("#romWrap .rc")].filter(c=>c.style.display!=="none");if(!cs.length)return;
  const at=cs.findIndex(c=>c.contains(document.activeElement)),i=Math.min(cs.length-1,Math.max(0,(at<0?(d>0?-1:cs.length):at)+d)),c=cs[i];
  const f=c.querySelector("[data-rp=peso],[data-rp=desc],input,select");c.scrollIntoView({block:"center",behavior:"auto"});if(f)f.focus({preventScroll:true})}
document.getElementById("romWrap").addEventListener("click",e=>{
  if(e.target.closest("#romfC")){estadoBase.abertos.romc=!romCompactoOn();guardarAbertos();romCompacto(romCompactoOn());return}
  const c=e.target.closest(".rcs.compacto .rc");if(c&&!c.classList.contains("aberto")&&!e.target.closest("input,select,button,label,summary,a")){document.querySelectorAll("#romWrap .rc.aberto").forEach(x=>x.classList.remove("aberto"));c.classList.add("aberto")}});
document.addEventListener("keydown",e=>{if((e.key==="["||e.key==="]")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&document.querySelector("#romWrap .rc")&&!/TEXTAREA|SELECT/.test(e.target.tagName)&&!(e.target.tagName==="INPUT"&&!/^(checkbox|radio|button)$/.test(e.target.type))&&!e.target.isContentEditable){   /* em campo de digitação, [ e ] são caracteres */
  const t=e.target;if(/INPUT|SELECT/.test(t.tagName)&&!t.closest("#romWrap .rc"))return;e.preventDefault();romNav(e.key==="]"?1:-1)}});
/* romaneios lançados: busca por fornecedor, documento ou observação */
{const _rl=romListaAbrir;romListaAbrir=function(){const r=_rl.apply(this,arguments);try{
  const ov=document.querySelector(".rep"),tb=ov&&ov.querySelector(".rep-tb");if(!tb)return r;
  const i=document.createElement("input");i.type="search";i.className="rep-busca";i.placeholder="Buscar por fornecedor, documento, observação ou quem montou…";i.setAttribute("aria-label","Buscar romaneio");
  tb.before(i);i.addEventListener("input",()=>{const q=semAc(i.value);tb.querySelectorAll("tbody tr").forEach(tr=>{tr.style.display=!q||semAc(tr.textContent).includes(q)?"":"none"})});
  const idx=estadoArmazenamento.ROMS.slice();tb.querySelectorAll("tbody tr").forEach((tr,k)=>{const x=idx[k];if(!x)return;
    const st=x.feitas>=x.n&&x.n?["Lançado","ok"]:x.feitas>0?["Parcial","warn"]:["A lançar","new"],td=tr.children[1];
    if(td)td.insertAdjacentHTML("beforeend",' <span class="rsel-st rst-'+st[1]+'">'+st[0]+'</span>')});
  setTimeout(()=>{if(!celular())i.focus()},0)}catch(e){}return r}}

