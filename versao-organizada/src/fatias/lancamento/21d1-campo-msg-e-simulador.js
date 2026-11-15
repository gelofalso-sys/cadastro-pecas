/* mensagem de erro no próprio campo (ao lado), além do aviso passageiro */
function campoMsg(t,msg){
  if(!t||!t.parentElement)return;let s=t.parentElement.querySelector(":scope > .campo-msg");
  if(!msg){t.removeAttribute("aria-invalid");t.classList.remove("bad");if(s)s.remove();return}
  t.setAttribute("aria-invalid","true");t.classList.add("bad");
  if(!s){s=document.createElement("small");s.className="campo-msg";s.setAttribute("role","alert");t.insertAdjacentElement("afterend",s)}
  s.textContent=msg}

/* ===== simulador de fator × margem ===== */
function simuladorFator(){
  const g=previsao(),meu=estadoBase.editId||"__p",rows=g.linhas.filter(r=>r.lancId===meu).slice(0,4);
  const custos=rows.map(r=>({r,custo:custoLinhaDe(g,r)})).filter(x=>x.custo>0);
  if(!custos.length){toast("Preencha o peso e o custo de compra da peça para simular o fator.");return}
  const fatores=[1.5,2,2.5,3,3.5,4,4.5,5],tab=x=>{const atual=num(x.r.mk);return `<div class="sim-t"><b>${esc(x.r.v.E||"linha")}</b> · custo R$ ${brl(x.custo)}${atual?` · fator atual ${fmt(atual)}`:""}<table class="cfg"><thead><tr><th>Fator ×</th><th class="n">Varejo</th><th class="n">Lucro R$</th><th class="n">Margem</th><th></th></tr></thead><tbody>${fatores.map(f=>{const v=r2c(x.custo*f),l=r2c(v-x.custo);return `<tr${atual===f?' class="sim-at"':""}><td>${fmt(f)}</td><td class="n">R$ ${brl(v)}</td><td class="n">R$ ${brl(l)}</td><td class="n">${fmt(Math.round(l/v*1000)/10)}%</td><td><button type="button" class="btn sm" data-act="sim-usar" data-bid="${esc(x.r.bid||"p")}" data-fator="${f}">Usar</button></td></tr>`}).join("")}</tbody></table></div>`};
  repModal(`<div class="rep-h"><div><b class="rep-t">Simular fator</b><div class="hint">Varejo = custo × fator. Escolha “Usar” para aplicar o fator na peça que está sendo lançada.</div></div><div class="rep-ac"><button type="button" class="btn pri sm" data-act="rel-fechar">Fechar</button></div></div><div class="rep-b">${custos.map(tab).join("")}</div>`)}
