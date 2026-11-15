/* ===== eventos ===== */
const refocar=s=>{const el=document.querySelector(s);if(el)el.focus()};
const guardarAbertos=()=>{try{prefGravar("abertos",JSON.stringify(abertos))}catch(x){}};
