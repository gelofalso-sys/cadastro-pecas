/* Casca: mostra os avisos que o armazenamento emite (src/store/eventos.js). Mesmos textos e mesmos momentos de antes:
   o armazenamento so diz o que aconteceu, quem decide como aparece (barra de status e toast) e a casca. */
["salvo","erro","conflito","cota"].forEach(nome=>armOuvir(nome,info=>{setStatus(info.texto,info.erro);if(info.toast)toast(info.toast)}));
