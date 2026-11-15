/* abas que rolam para o lado: a seta "›" some quando chega ao fim */
{const at=el=>{if(el.scrollWidth<=el.clientWidth+2||el.scrollLeft+el.clientWidth>=el.scrollWidth-4)el.classList.add("fim");else el.classList.remove("fim")};
  document.addEventListener("scroll",e=>{const el=e.target;if(el&&el.matches&&el.matches("nav.ir,.ctabs"))at(el)},true);
  let raf=0;new MutationObserver(()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;document.querySelectorAll("nav.ir,.ctabs").forEach(at)})}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener("resize",()=>document.querySelectorAll("nav.ir,.ctabs").forEach(at));document.querySelectorAll("nav.ir,.ctabs").forEach(at)}
