/* descrição preenchida sozinha ("Brinco Argola "): ao entrar no campo o cursor fica no fim, para continuar digitando sem apagar as palavras */
/* o clique do mouse também respeita: com só as palavras automáticas no campo, o cursor vai para o fim */
document.addEventListener("click",e=>{const t=e.target;if(!t||t.id!=="f-F"||!S.form||!S.form._descAuto||t.value!==S.form._descAuto)return;setTimeout(()=>{try{t.setSelectionRange(t.value.length,t.value.length)}catch(x){}},0)});
document.addEventListener("focusin",e=>{const t=e.target;if(!t||t.id!=="f-F"||!S.form||!S.form._descAuto||t.value!==S.form._descAuto)return;const fim=()=>{try{t.setSelectionRange(t.value.length,t.value.length)}catch(x){}};fim();setTimeout(fim,0)});
