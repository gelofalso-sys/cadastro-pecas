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

