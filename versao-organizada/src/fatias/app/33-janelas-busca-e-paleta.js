/* ===== janelas (modais): papel de diálogo, foco preso, foco devolvido e Esc só na janela de cima ===== */
{const SEL=".lbox,.rev,.rep",pilha=[];
  const eM=n=>n&&n.nodeType===1&&n.matches&&n.matches(SEL);
  const topo=()=>{const a=document.querySelectorAll(SEL);return a.length?a[a.length-1]:null};
  const nomeDe=el=>{const h=el.querySelector(".rep-t,.rev-h b,.lbt");return h&&h.textContent.trim()?h.textContent.trim():"Janela"};
  const focaveis=el=>[...el.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]):not([hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>x.getClientRects().length&&getComputedStyle(x).visibility!=="hidden");
  const sujo=m=>{if(m.classList.contains("lbox"))return false;if(m.id==="nfRev")return !!(NF&&NF.dirty);if(m.classList.contains("rev"))return false;
    return [...m.querySelectorAll("input,textarea,select")].some(x=>{if(x.type==="file"||x.type==="button"||x.type==="search")return false;
      if(x.tagName==="SELECT")return [...x.options].some(o=>o.selected!==o.defaultSelected);
      if(x.type==="checkbox"||x.type==="radio")return x.checked!==x.defaultChecked;return x.value!==x.defaultValue})};
  const fechar=m=>{if(m.id==="nfRev"){nfFechar();return}const rep=m.classList.contains("rep");m.remove();if(rep){tabArm=null;romArm=null;renderForm()}};
  window.__modais={topo,sujo,fechar};
  new MutationObserver(ms=>{let herdado=null,novos=[],saiu=false;
    ms.forEach(m=>{m.removedNodes.forEach(n=>{if(!eM(n))return;const i=pilha.findIndex(p=>p.el===n);if(i>=0){herdado=pilha[i].opener||herdado;pilha.splice(i,1);saiu=true}});m.addedNodes.forEach(n=>{if(eM(n)&&n.isConnected)novos.push(n)})});
    novos.forEach(el=>{el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");if(!el.getAttribute("aria-label"))el.setAttribute("aria-label",nomeDe(el));if(!el.hasAttribute("tabindex"))el.setAttribute("tabindex","-1");
      const ae=document.activeElement,op=herdado||(ae&&ae!==document.body&&!el.contains(ae)?ae:null);pilha.push({el,opener:op});
      if(!el.contains(document.activeElement)){const f=focaveis(el).find(x=>!x.matches("[data-act*=fechar],[data-nfa=fechar]"))||el;try{f.focus({preventScroll:true})}catch(e){}}});
    if(saiu&&!novos.length){const t=topo();if(t){const p=pilha.find(x=>x.el===t);if(p&&!t.contains(document.activeElement))try{t.focus({preventScroll:true})}catch(e){}}
      else if(herdado&&herdado.isConnected&&(document.activeElement===document.body||!document.activeElement))try{herdado.focus({preventScroll:true})}catch(e){}}
  }).observe(document.body,{childList:true});
  document.querySelectorAll(SEL).forEach(el=>{el.setAttribute("role","dialog");el.setAttribute("aria-modal","true")});
  document.addEventListener("keydown",e=>{const m=topo();if(!m)return;
    if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();if(sujo(m)&&!confirm("Há alterações que ainda não foram salvas nesta janela. Fechar mesmo assim?"))return;fechar(m);return}
    if(e.key==="Tab"){const it=focaveis(m);if(!it.length){e.preventDefault();m.focus();return}const a=document.activeElement,i=it.indexOf(a);
      if(!m.contains(a)||a===m){e.preventDefault();(e.shiftKey?it[it.length-1]:it[0]).focus();return}
      if(e.shiftKey&&i===0){e.preventDefault();it[it.length-1].focus()}else if(!e.shiftKey&&i===it.length-1){e.preventDefault();it[0].focus()}}},true)}
{const ai=document.getElementById("autorIn");if(ai){ai.value=AUTOR;ai.addEventListener("change",()=>setAutor(ai.value))}}
