/* ===== histórico legível das últimas alterações (com "voltar antes desta") ===== */
function historicoAbrir(){
  const n=HIST.length;if(!n){toast("Ainda não há alterações para listar.");return}
  const atual=JSON.stringify(S.lanc),ini=Math.max(0,n-15),linhas=[];
  for(let k=n-1;k>=ini;k--){const e=HIST[k],depois=k===n-1?atual:HIST[k+1].L;linhas.push({k,desc:histDescrever(e.L,depois,e),t:e.t||0,volta:n-k})}
  const ago=t=>{const s=Math.max(0,Math.round((Date.now()-t)/1000));return s<60?"agora há pouco":s<3600?`há ${Math.round(s/60)} min`:s<86400?`há ${Math.round(s/3600)} h`:new Date(t).toLocaleDateString("pt-BR")};
  repModal(`<div class="rep-h"><div><b class="rep-t">Histórico de alterações</b><div class="hint">As ${linhas.length} mais recentes. “Voltar antes desta” desfaz esta alteração e todas as mais novas.</div></div><div class="rep-ac"><button type="button" class="btn pri sm" data-act="rel-fechar">Fechar</button></div></div><div class="rep-b"><div class="rep-tb"><table><tbody>${linhas.map(l=>`<tr><td>${esc(ago(l.t))}</td><td>${esc(l.desc)}</td><td><button type="button" class="btn sm" data-act="hist-voltar" data-n="${l.volta}">Voltar antes desta</button></td></tr>`).join("")}</tbody></table></div></div>`)}

