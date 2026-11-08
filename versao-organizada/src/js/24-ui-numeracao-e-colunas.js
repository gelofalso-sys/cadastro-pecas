/* ===== ui: numeração recolhível (lembra a escolha), siglas e acessibilidade da planilha ===== */
{const NBK="cadpecas-numbar-aberta",tog=document.getElementById("nbTog"),nb=document.getElementById("numbar"),sh=document.getElementById("sheet");
  const lerAb=()=>{try{return localStorage.getItem(NBK)==="1"}catch(e){return false}};
  const legenda=()=>{const h=nb.querySelector(".nb-h");if(!h)return;const t="Última peça lançada de cada categoria. Siglas: "+[...nb.querySelectorAll("label.nb")].map(l=>l.dataset.p+" = "+(l.title||"")).join("  ·  ");if(h.textContent!==t)h.textContent=t};
  const aplica=()=>{const ab=lerAb(),bad=nb.querySelectorAll(".nb.bad").length;nb.classList.toggle("aberta",ab);tog.setAttribute("aria-expanded",String(ab));tog.classList.toggle("warn",!!bad);
    const t="Numeração do sistema "+(ab?"▾":"▸")+(bad?" · ⚠ "+bad+" sem número":"");if(tog.textContent!==t)tog.textContent=t};
  if(tog&&nb){tog.addEventListener("click",()=>{try{localStorage.setItem(NBK,lerAb()?"0":"1")}catch(e){}aplica()});
    let tm=0;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{legenda();aplica()},60)}).observe(nb,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});legenda();aplica()}
  if(sh){let tm=0;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{const t=sh.querySelector("table.t");if(t&&t.getAttribute("role")!=="grid"){t.setAttribute("role","grid");t.setAttribute("aria-label","Planilha das peças")}},80)}).observe(sh,{childList:true})}}
/* ===== ui: esconde as colunas A–D totalmente vazias na visão da tabela (só visual; o arquivo baixado continua com as 31) ===== */
{const sh=document.getElementById("sheet"),bx=document.getElementById("nfVaz"),tx=document.getElementById("nfVazT"),bt=document.getElementById("nfVazB"),KV="cadpecas-mostrar-vazias",st=document.createElement("style");st.id="nfVazias";document.head.appendChild(st);
  let mostrar=false,tm=0,busy=false;try{mostrar=localStorage.getItem(KV)==="1"}catch(e){}
  const run=()=>{if(busy||!sh)return;busy=true;try{
    const t=sh.querySelector("table.t");let vz=[];
    if(t&&t.querySelectorAll("tbody tr:not(.blank):not(.catsep)").length)vz=["A","B","C","D"].filter(L=>![...t.querySelectorAll(`tbody td[data-c="${L}"]`)].some(c=>c.textContent.trim()||c.querySelector("img")));
    const ocultar=mostrar?[]:vz,css=ocultar.map(L=>`#sheet th[data-hc="${L}"],#sheet td[data-c="${L}"],#sheet col[data-cw="${L}"]{display:none}`).join("\n");if(st.textContent!==css)st.textContent=css;
    if(t){const cur=t.style.width;if(cur!==t.dataset.nfa)t.dataset.nfw0=String(parseFloat(cur)||"");
      if(t.dataset.nfw0){const soma=ocultar.reduce((s,L)=>{const c=t.querySelector(`col[data-cw="${L}"]`);return s+(c?parseFloat(c.style.width)||0:0)},0),n=(+t.dataset.nfw0-soma)+"px";if(t.style.width!==n)t.style.width=n;t.dataset.nfa=n}}
    bx.hidden=!vz.length;
    if(vz.length){tx.textContent=mostrar?"Mostrando as colunas vazias.":`${vz.length} coluna${vz.length>1?"s":""} vazia${vz.length>1?"s":""} escondida${vz.length>1?"s":""} (${vz.map(L=>NOME[L]).join(", ")}). A planilha baixada continua com todas as colunas.`;bt.textContent=mostrar?"Esconder colunas vazias":"Mostrar colunas vazias"}
  }finally{busy=false}};
  if(sh&&bx){new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(run,120)}).observe(sh,{childList:true,subtree:true});
    bt.addEventListener("click",()=>{mostrar=!mostrar;try{localStorage.setItem(KV,mostrar?"1":"0")}catch(e){}run()});run()}}
/* nf-fim */
