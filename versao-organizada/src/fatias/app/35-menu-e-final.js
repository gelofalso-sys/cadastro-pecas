document.getElementById("vis").addEventListener("click",e=>{if(e.target.closest("#vpal")){palAbrir();return}const b=e.target.closest("button[data-vis]");if(!b)return;visPara(b.dataset.vis);if(b.dataset.vis==="lancar"&&!celular())refocar("#f-F")});
document.addEventListener("keydown",e=>{
  const t=e.target,campo=/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable;
  if(e.altKey&&!e.ctrlKey&&!e.metaKey&&/^Digit[1-3]$/.test(e.code)){e.preventDefault();visPara(["tudo","planilha","cad"][+e.code.slice(-1)-1]);return}
  if(e.key==="/"&&!campo&&!e.ctrlKey&&!e.metaKey&&!e.altKey){const fb=document.getElementById("fBusca");if(fb&&!fb.closest("[hidden]")){e.preventDefault();if(visAtual()==="lancar"||visAtual()==="cad")visPara(celular()?"planilha":"tudo");fb.focus();fb.select()}}
});
visPara(abertos.vis&&["tudo","planilha","lancar","cad"].includes(abertos.vis)?(abertos.vis==="lancar"&&celular()?"planilha":abertos.vis):(celular()?"planilha":"tudo"));
/* ===== v19: menu lateral ===== */
function sideMarcar(){const sd=document.getElementById("side");if(!sd||sd.hidden)return;const v=document.body.dataset.vis||"tudo";
  const marca=(b,on)=>{if(on)b.setAttribute("aria-current","true");else b.removeAttribute("aria-current")};
  sd.querySelectorAll("[data-vis]").forEach(b=>marca(b,b.dataset.vis===v));
  sd.querySelectorAll("[data-go^=\"sec:\"]").forEach(b=>marca(b,(v==="cad"||v==="tudo")&&b.dataset.go==="sec:"+abertos.tab))}
function sideAplicar(modo){/* "open" = expandido · "mini" = faixa estreita só com ícones */
  if(modo!=="mini")modo="open";
  const sd=document.getElementById("side");if(celular()){sd.hidden=true;document.body.classList.remove("side-on","side-mini");return}
  sd.hidden=false;document.body.classList.add("side-on");document.body.classList.toggle("side-mini",modo==="mini");
  abertos.side=modo;guardarAbertos();sideMarcar()}
function hdrLayout(){const hin=document.querySelector("header .hin");if(!hin)return;
  const st=document.getElementById("saveStatus"),ud=document.querySelector(".udo"),sp=document.getElementById("autorIn")?.closest(".sp"),top=document.getElementById("sideTop"),ex=document.getElementById("sideExp");if(!st||!ud||!sp||!top||!ex)return;
  if(!celular()){if(st.parentNode!==top)top.append(st,ud);if(sp.parentNode!==ex)ex.append(sp)}
  else{const mobile=document.getElementById("mobileSettings");if(mobile){if(st.parentNode!==mobile)mobile.append(st,ud);if(sp.parentNode!==mobile)mobile.append(sp)}}}
window.addEventListener("resize",()=>{hdrLayout();numFormMover();sideAplicar(abertos.side);if(!celular()){const menu=document.getElementById("mobileMenu");if(menu)menu.open=false}});
hdrLayout()

/* Menu móvel reúne os mesmos destinos do menu lateral. */
{const menu=document.getElementById("mobileMenu");if(menu){const summary=menu.querySelector("summary"),close=menu.querySelector(".mobile-menu-close");menu.addEventListener("toggle",()=>{if(menu.open){menu.querySelectorAll("[data-mobile^=\"vis:\"]").forEach(b=>{if(b.dataset.mobile==="vis:"+visAtual())b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")})}});close.addEventListener("click",()=>{menu.open=false;summary.focus()});menu.addEventListener("click",e=>{const b=e.target.closest("[data-mobile]");if(!b)return;const [tipo,id]=b.dataset.mobile.split(":");menu.open=false;if(tipo==="vis"){visPara(id)}else if(tipo==="sec"){formAbrir(false);irPara(id)}else if(id==="rom-abrir"){if(editId)avisoEdicao(romAbrirNovo);else romAbrirNovo()}else{if(id==="imp-pick")visPara("lancar");const alvo=document.querySelector('#impBar [data-act="'+id+'"]')||document.querySelector('[data-act="'+id+'"]');if(alvo)alvo.click()}});document.addEventListener("click",e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.open){menu.open=false;menu.querySelector("summary").focus()}})}}

/* menu do celular = o mesmo menu lateral do desktop (grupos, nomes, ícones e ordem), gerado a partir dele; o celular só acrescenta as telas que no desktop são fixas (Lançar peça, Cadastros) e a lista de romaneios salvos */
function menuCelularDoLateral(){const panel=document.querySelector("#mobileMenu .mobile-menu-panel"),side=document.getElementById("side");if(!panel||!side)return;
  panel.querySelectorAll(":scope > b,:scope > button[data-mobile]").forEach(x=>x.remove());
  const IC=d=>'<i class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+d+'"/></svg></i>';
  const extras={"Principal":[["Lançar peça","vis:lancar",IC("M12 5v14M5 12h14")],["Cadastros","vis:cad",IC("M4 7h16M4 12h16M4 17h10")]],"Romaneios":[["Romaneios salvos","act:rom-lista",IC("M21 8v13H3V8M1 3h22v5H1zM10 12h4")]]};
  const ico=b=>{const i=b.querySelector("i.ic");return i?i.outerHTML:""},rot=b=>{const t=b.querySelector("span.sl");return t?t.textContent.trim():b.title||""};
  const mapa=b=>b.dataset.vis?"vis:"+(b.dataset.vis==="tudo"?"planilha":b.dataset.vis):b.dataset.go?b.dataset.go:b.dataset.act?"act:"+b.dataset.act:"";
  const botao=(r,m,ic)=>{const x=document.createElement("button");x.type="button";x.dataset.mobile=m;x.innerHTML=(ic||"")+"<span>"+esc(r)+"</span>";return x};
  let grupo="";const solta=()=>{(extras[grupo]||[]).forEach(([r,m,i])=>panel.appendChild(botao(r,m,i)));};
  side.querySelectorAll("nav.sn > *").forEach(el=>{
    if(el.classList.contains("sg")){solta();grupo=el.textContent.trim();const h=document.createElement("b");h.textContent=grupo;panel.appendChild(h);return}
    if(el.tagName!=="BUTTON")return;const m=mapa(el);if(!m)return;
    panel.appendChild(botao(m==="vis:planilha"?"Tabela":rot(el),m,ico(el)))});
  solta()}
menuCelularDoLateral();
document.getElementById("sideT").addEventListener("click",()=>sideAplicar(abertos.side==="mini"?"open":"mini"));
document.getElementById("side").addEventListener("click",e=>{
  const v=e.target.closest("button[data-vis]");if(v){visPara(v.dataset.vis);if(v.dataset.vis==="lancar")refocar("#f-F");return}
  const g=e.target.closest("[data-go]");if(!g)return;const [k,id]=g.dataset.go.split(":");
  if(k==="sec"){if(celular())formAbrir(false);irPara(id);return}
  /* ações: aciona o botão que já existe no app (o menu não tem cópia deles) */
  if(id==="rom-abrir"){if(editId)avisoEdicao(romAbrirNovo);else romAbrirNovo();return}   /* o botão "Colar romaneio" some da barra enquanto uma peça está em edição: abre direto */
  const alvo=document.querySelector('[data-act="'+id+'"]');if(alvo)alvo.click()});
document.addEventListener("click",()=>setTimeout(sideMarcar,0));
document.addEventListener("keydown",e=>{if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.code==="KeyB"){e.preventDefault();document.getElementById("vside").click()}});
if(!celular())sideAplicar(abertos.side);
/* celular: a barra de baixo some o "Lançar peça" quando o formulário já está na tela */
try{const io=new IntersectionObserver(es=>{document.body.classList.toggle("formvis",!celular()&&es.some(x=>x.isIntersecting))},{threshold:0.1});io.observe(document.getElementById("formWrap"))}catch(e){}
