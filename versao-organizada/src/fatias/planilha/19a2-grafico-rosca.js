/* gráfico de rosca (SVG, sem bibliotecas) ao lado do formulário */
function renderGraf(D){
  const el=document.getElementById("graf");if(!el)return;const modo=estadoBase.abertos.graf||"custo";
  const M={custo:["Custo por componente",D.custo,"R$ "],pecas:["Peças por categoria",Object.entries(D.pecas),""],varejo:["Varejo por categoria",Object.entries(D.varejo),"R$ "],cor:["Peças por cor",Object.entries(D.cor),""],forn:["Custo por fornecedor",Object.entries(D.forn),"R$ "],banho:["Peças por banho",Object.entries(D.banho),""],lucro:["Lucro por categoria",Object.entries(D.lucro),"R$ "]};
  const m=M[modo]||M.custo,arr=m[1].filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),tot=arr.reduce((s,x)=>s+x[1],0),pre=m[2],f2=n=>(Math.round(n*100)/100).toFixed(2);
  let svg="";
  if(tot>0){const R=62,r=38,cx=70,cy=70;let a0=-Math.PI/2;
    arr.forEach((x,i)=>{const fr=x[1]/tot,a1=a0+fr*2*Math.PI,col=PAL[i%PAL.length],tt=`<title>${esc(x[0])}: ${pre}${pre?brl(x[1]):fmt(x[1])} (${Math.round(fr*1000)/10}%)</title>`;
      if(arr.length===1)svg+=`<circle cx="${cx}" cy="${cy}" r="${(R+r)/2}" fill="none" stroke="${col}" stroke-width="${R-r}">${tt}</circle>`;
      else{const P=(rad,a)=>[f2(cx+rad*Math.cos(a)),f2(cy+rad*Math.sin(a))],lg=fr>.5?1:0,[x0,y0]=P(R,a0),[x1,y1]=P(R,a1),[x2,y2]=P(r,a1),[x3,y3]=P(r,a0);
        svg+=`<path d="M${x0} ${y0}A${R} ${R} 0 ${lg} 1 ${x1} ${y1}L${x2} ${y2}A${r} ${r} 0 ${lg} 0 ${x3} ${y3}Z" fill="${col}" stroke="var(--surface)" stroke-width="1.5">${tt}</path>`}
      a0=a1});
    svg=`<svg viewBox="0 0 140 140" role="img" aria-label="${esc(m[0])}">${svg}<text x="70" y="66" text-anchor="middle" class="gc-l">total</text><text x="70" y="82" text-anchor="middle" class="gc-v">${pre?brl(tot):fmt(tot)}</text></svg>`}
  el.innerHTML=`<div class="gh"><b>${m[0]}</b></div><div class="gm" role="group" aria-label="Tipo de gráfico">${[["custo","Custo"],["pecas","Peças"],["varejo","Varejo"],["lucro","Lucro"],["forn","Fornec."],["banho","Banho"],["cor","Cores"]].map(([k,n])=>`<button type="button" class="${k===modo?"on":""}" data-act="graf" data-v="${k}">${n}</button>`).join("")}</div>
    ${tot>0?`<div class="gp">${svg}</div><ul class="gl">${arr.slice(0,8).map((x,i)=>`<li><i style="background:${PAL[i%PAL.length]}"></i><span>${esc(x[0])}</span><b>${pre}${pre?brl(x[1]):fmt(x[1])}</b><small>${Math.round(x[1]/tot*1000)/10}%</small><u style="width:${Math.max(2,Math.round(x[1]/arr[0][1]*100))}%;background:${PAL[i%PAL.length]}"></u></li>`).join("")}</ul>`:`<p class="hint" style="padding:14px 4px">Lance peças para ver o gráfico. ${modo==="varejo"||modo==="lucro"?"Varejo e lucro aparecem quando há Preço de Varejo ou Multiplicador.":""}</p>`}`;
}
