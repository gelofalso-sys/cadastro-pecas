/* ===== eventos ===== */
const refocar=s=>{const el=document.querySelector(s);if(el)el.focus()};
const guardarAbertos=()=>{try{gravarPref("cadpecas-abertos",JSON.stringify(abertos))}catch(x){}};
