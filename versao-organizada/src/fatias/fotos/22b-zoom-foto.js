/* foto ampliada com zoom (botões, roda do mouse, duplo clique) e arrastar para mover */
function melhorarFoto(im,cb){const n=im.naturalWidth,h=im.naturalHeight,sc=Math.max(1,Math.min(3,Math.round(1800/Math.max(n,h,1))));if(sc<2||n*sc*h*sc>9e6){cb(null);return}
  try{const c=document.createElement("canvas");c.width=n*sc;c.height=h*sc;const x=c.getContext("2d");x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.drawImage(im,0,0,c.width,c.height);
    const d=x.getImageData(0,0,c.width,c.height),s0=d.data,w=c.width,H=c.height,o=new Uint8ClampedArray(s0),a=0.3;
    for(let y=1;y<H-1;y++)for(let xx=1;xx<w-1;xx++){const i=(y*w+xx)*4;for(let k=0;k<3;k++)o[i+k]=s0[i+k]*(1+4*a)-a*(s0[i+k-4]+s0[i+k+4]+s0[i-w*4+k]+s0[i+w*4+k])}
    d.data.set(o);x.putImageData(d,0,0);cb(c.toDataURL("image/png"))}catch(e){cb(null)}}
function abrirZoom(src){const lb=document.createElement("div");lb.className="lbox";
  lb.innerHTML=`<div class="lbt"><button type="button" data-z="-" aria-label="Menos zoom">−</button><span class="lbz">100%</span><button type="button" data-z="+" aria-label="Mais zoom">+</button><button type="button" data-z="0">Ajustar</button><button type="button" data-z="x">Fechar ✕</button></div><div class="lbs"><img src="${fs(src)||esc(src)}" alt="Foto ampliada" draggable="false"></div>`;
  document.body.appendChild(lb);const im=lb.querySelector("img"),sc=lb.querySelector(".lbs"),zl=lb.querySelector(".lbz");let k=1;
  const aplica=(nk,cx,cy)=>{const ow=im.offsetWidth||1,fit=Math.min((innerWidth||screen.width||800)*0.92/im.naturalWidth,(innerHeight||screen.height||600)*0.84/im.naturalHeight);k=Math.min(10,Math.max(0.4,nk));
    const rx=(sc.scrollLeft+(cx??sc.clientWidth/2))/ow,ry=(sc.scrollTop+(cy??sc.clientHeight/2))/(im.offsetHeight||1);
    im.style.width=Math.round(im.naturalWidth*fit*k)+"px";sc.scrollLeft=rx*im.offsetWidth-(cx??sc.clientWidth/2);sc.scrollTop=ry*im.offsetHeight-(cy??sc.clientHeight/2);zl.textContent=Math.round(k*fit*100)+"%"};
  let melh=false;im.onload=()=>{if(!melh){melh=true;aplica(1);melhorarFoto(im,u=>{if(u){const k0=k;im.src=u;im.onload=()=>aplica(k0)}})}else aplica(1)};if(im.complete&&!melh){melh=true;aplica(1);melhorarFoto(im,u=>{if(u){const k0=k;im.src=u;im.onload=()=>aplica(k0)}})}
  lb.addEventListener("click",e=>{const z=e.target.dataset&&e.target.dataset.z;if(z==="x"||e.target===lb||(e.target===sc&&!sc.dataset.m))lb.remove();else if(z==="+")aplica(k*1.5);else if(z==="-")aplica(k/1.5);else if(z==="0")aplica(1)});
  sc.addEventListener("wheel",e=>{e.preventDefault();const r=sc.getBoundingClientRect();aplica(e.deltaY<0?k*1.25:k/1.25,e.clientX-r.left,e.clientY-r.top)},{passive:false});
  im.addEventListener("dblclick",e=>{const r=sc.getBoundingClientRect();aplica(k>1.5?1:3,e.clientX-r.left,e.clientY-r.top)});
  let dr=null;sc.addEventListener("mousedown",e=>{dr={x:e.clientX,y:e.clientY,l:sc.scrollLeft,t:sc.scrollTop};delete sc.dataset.m;sc.classList.add("grab")});
  /* os ouvintes ficam no próprio painel (que cobre a tela): somem junto com ele ao fechar, sem vazar em window */
  lb.addEventListener("mousemove",e=>{if(dr){if(Math.abs(e.clientX-dr.x)+Math.abs(e.clientY-dr.y)>4)sc.dataset.m="1";sc.scrollLeft=dr.l-(e.clientX-dr.x);sc.scrollTop=dr.t-(e.clientY-dr.y)}});lb.addEventListener("mouseup",()=>{dr=null;sc.classList.remove("grab")})}
