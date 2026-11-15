/* ===== "O que mudou": últimas novidades, para conferir o que veio na versão publicada ===== */
function novidadesAbrir(){
  repModal(`<div class="rep-h"><div><b class="rep-t">O que mudou</b><div class="hint">Versão ${esc(((document.querySelector(".build-version")||{}).textContent||"").replace(/·.*$/,"").replace("Versão","").trim())}</div></div><div class="rep-ac"><button type="button" class="btn pri sm" data-act="rel-fechar">Fechar</button></div></div><div class="rep-b">${NOVIDADES.map(n=>`<h4 style="margin:10px 0 2px">${esc(n.d.split("-").reverse().join("/"))} · ${esc(n.t)}</h4><ul style="margin:0 0 6px 18px">${n.i.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`).join("")}</div>`)}

