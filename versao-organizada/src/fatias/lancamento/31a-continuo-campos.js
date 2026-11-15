document.addEventListener("change",e=>{const t=e.target;if(!t.dataset||!t.dataset.cont)return;const c=continuoCfg();cfg().continuo={...c,[t.dataset.cont]:!!t.checked};salvar(true,false)});
