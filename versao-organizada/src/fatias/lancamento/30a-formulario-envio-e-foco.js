document.addEventListener("submit",e=>{e.preventDefault();adicionar()});
/* digitação rápida: ao entrar num campo numérico do lançamento, o conteúdo fica selecionado e o que for digitado substitui */
document.addEventListener("focusin",e=>{const t=e.target;if(t.tagName==="INPUT"&&t.classList.contains("n")&&t.closest("#form")&&!t.disabled)try{t.select()}catch(x){}});
