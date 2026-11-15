document.addEventListener("toggle",e=>{const d=e.target;if(d.dataset&&d.dataset.open){estadoBase.abertos[d.dataset.open]=d.open;guardarAbertos()}},true);
