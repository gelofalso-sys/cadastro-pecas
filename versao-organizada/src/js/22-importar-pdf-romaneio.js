/* ===== importar o PDF do romaneio: texto + fotos em alta resolução ===== */
const PDFJS="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
let pdfLib=null;
async function carregarPdfJs(){if(pdfLib)return pdfLib;
  if(!window.pdfjsLib)await new Promise((ok,no)=>{const sc=document.createElement("script");sc.src=PDFJS+"pdf.min.js";sc.onload=ok;sc.onerror=()=>no(new Error("Não consegui carregar o leitor de PDF (sem internet?)"));document.head.appendChild(sc)});
  const L=window.pdfjsLib;
  try{const b=await (await fetch(PDFJS+"pdf.worker.min.js")).blob();L.GlobalWorkerOptions.workerSrc=URL.createObjectURL(b)}catch(e){L.GlobalWorkerOptions.workerSrc=PDFJS+"pdf.worker.min.js"}
  pdfLib=L;return L}
const mulM=(m,n)=>[m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];
/* miniatura leve (~160 px) que fica guardada na peça só para a coluna Foto da tabela */
function miniFoto(c,max){max=max||240;try{const k=Math.min(1,max/Math.max(c.width,c.height)),m=document.createElement("canvas");m.width=Math.max(1,Math.round(c.width*k));m.height=Math.max(1,Math.round(c.height*k));const x=m.getContext("2d");x.imageSmoothingQuality="high";x.drawImage(c,0,0,m.width,m.height);return m.toDataURL("image/jpeg",0.88)}catch(e){return null}}
const objPdf=(page,nome)=>new Promise(res=>{let ok=false;const to=setTimeout(()=>{if(!ok)res(null)},6000);try{page.objs.get(nome,o=>{ok=true;clearTimeout(to);res(o)})}catch(e){clearTimeout(to);res(null)}});
/* imagem original do PDF (sem redesenhar a página): mantém a resolução máxima */
function imgCanvas(o){try{const c=document.createElement("canvas");c.width=o.width;c.height=o.height;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
  if(o.bitmap){x.drawImage(o.bitmap,0,0);return c}
  const d=o.data;if(!d)return null;const n=o.width*o.height,t=document.createElement("canvas");t.width=o.width;t.height=o.height;const rgba=new Uint8ClampedArray(n*4);
  if(o.kind===3)rgba.set(d.subarray(0,n*4));
  else if(o.kind===2){for(let i=0,k=0;i<n;i++,k+=3){rgba[i*4]=d[k];rgba[i*4+1]=d[k+1];rgba[i*4+2]=d[k+2];rgba[i*4+3]=255}}
  else{const rb=(o.width+7)>>3;for(let yy=0;yy<o.height;yy++)for(let xx=0;xx<o.width;xx++){const v=((d[yy*rb+(xx>>3)]>>(7-(xx&7)))&1)?255:0,k=(yy*o.width+xx)*4;rgba[k]=rgba[k+1]=rgba[k+2]=v;rgba[k+3]=255}}
  t.getContext("2d").putImageData(new ImageData(rgba,o.width,o.height),0,0);x.drawImage(t,0,0);return c}catch(e){return null}}
async function lerPdf(file){
  checaTam(file,MAX_PDF_BYTES,"O PDF");const L=await carregarPdfJs(),doc=checaPaginas(await L.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise);
  let texto="";const itens=[],fotos=[];
  for(let pg=1;pg<=doc.numPages;pg++){
    if(ROM){ROM.msg=`Lendo o PDF… página ${pg} de ${doc.numPages}`;const m=document.querySelector("#romWrap .rom-b .hint");if(m)m.textContent=ROM.msg}
    const page=await doc.getPage(pg),tc=await page.getTextContent();
    tc.items.forEach(it=>{texto+=it.str+(it.hasEOL?"\n":" ");itens.push({pg,y:it.transform[5],x:it.transform[4],s:it.str})});texto+="\n";
    const ops=await page.getOperatorList(),OPS=L.OPS;let ctm=[1,0,0,1,0,0];const st=[],imgs=[];
    ops.fnArray.forEach((fn,i)=>{const a=ops.argsArray[i];
      if(fn===OPS.save)st.push(ctm.slice());else if(fn===OPS.restore)ctm=st.pop()||ctm;else if(fn===OPS.transform)ctm=mulM(ctm,a);
      else if(fn===OPS.paintImageXObject||fn===OPS.paintInlineImageXObject||fn===OPS.paintImageXObjectRepeat)imgs.push({m:ctm.slice(),ref:a&&a[0]})});
    const gr=imgs.map(g=>{const xs=[g.m[4],g.m[4]+g.m[0],g.m[4]+g.m[2],g.m[4]+g.m[0]+g.m[2]],ys=[g.m[5],g.m[5]+g.m[1],g.m[5]+g.m[3],g.m[5]+g.m[1]+g.m[3]];
      return {...g,x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)}}).filter(g=>g.x1-g.x0>=24&&g.y1-g.y0>=24);
    for(const g of gr){const o=typeof g.ref==="string"?await objPdf(page,g.ref):g.ref;if(!o||!o.width)continue;
      const c=imgCanvas(o);if(!c)continue;fotos.push({pg,cy:(g.y0+g.y1)/2,h:g.y1-g.y0,url:c.toDataURL("image/jpeg",0.95),mini:miniFoto(c)})}}
  return {texto,itens,fotos}}
function romFotos(rows){const P=ROM.pdf;if(!P)return;const pares=[],usados=new Set(),feitos=new Set();
  rows.forEach((r,i)=>{if(!r.cod)return;const rc=new RegExp("(^|[^A-Za-z0-9])"+String(r.cod).replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&")+"($|[^A-Za-z0-9])"),candidatos=P.itens.filter(x=>rc.test(x.s));
    /* Um código também pode aparecer no endereço, telefone ou cabeçalho. Só vincule
       fotos a uma ocorrência que esteja numa linha de produto com valor monetário. */
    candidatos.forEach(it=>{const linha=P.itens.filter(x=>x.pg===it.pg&&Math.abs(x.y-it.y)<=5).map(x=>x.s).join(" ");if(!/(?:R\s*\$\s*)?\d[\d.]*,\d{2,3}(?:\D|$)/.test(linha))return;
      P.fotos.forEach((f,j)=>{if(f.pg!==it.pg)return;const d=Math.abs(f.cy-it.y);if(d<=Math.max(f.h*0.8,24))pares.push([d,i,j])})})});
  pares.sort((a,b)=>a[0]-b[0]);pares.forEach(([d,i,j])=>{if(feitos.has(i)||usados.has(j))return;feitos.add(i);usados.add(j);rows[i].foto=P.fotos[j].url;rows[i].fotoMini=P.fotos[j].mini})}
async function romPdf(file){
  if(!ROM){ROM={tid:abertos.romT&&cfg().romaneios.some(x=>x.id===abertos.romT)?abertos.romT:cfg().romaneios[0].id,texto:"",rows:[],obs:"",conf:"",msg:""};const T0=romT();if(T0&&T0.forn&&fornBy(T0.forn))romSetForn(T0.forn)}
  ROM.doc=file.name;ROM.hash=IMPH.get(file)||"";ROM.msg="Lendo o PDF…";renderRom();rolarPane(document.getElementById("romWrap"));
  try{const P=await lerPdf(file);ROM.pdf=P;ROM.texto=P.texto;romLer();
    if(ROM.rows.length){const n=ROM.rows.filter(r=>r.foto).length;ROM.msg=`${ROM.rows.length} peças lidas do PDF · ${n} foto${n===1?"":"s"} encontrada${n===1?"":"s"}`;const h=document.querySelector("#romWrap .rom-b .hint");if(h)h.textContent=ROM.msg;impStatusFim(true)}else impStatusFim(false,"não encontrei peças nesse PDF (confira o modelo de leitura ou cole o texto)")}
  catch(e){let m=String(e&&e.message?e.message:"erro").replace(/[.\s]+$/,"");if(/invalid pdf|missing pdf|unexpected server|xref|not a pdf/i.test(m)||(e&&/Invalid|Missing/i.test(e.name||"")))m="o arquivo não é um PDF válido ou está corrompido";
    ROM.rows=[];ROM.pdf=null;ROM.conf="";ROM.msg="Não consegui ler esse PDF: "+m+". Copie o texto e cole na caixa.";romSalvarSoon();renderRom();impStatusFim(false,m)}}
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
