/* ===== importar o PDF do romaneio: texto + fotos em alta resolução ===== */
/* leitor de PDF (pdf.js) carregado sob demanda: estadoRomaneio.pdfLib */ async function carregarPdfJs(){if(estadoRomaneio.pdfLib)return estadoRomaneio.pdfLib;const L=window.pdfjsLib;if(!L)throw new Error("O leitor de PDF não está neste arquivo. Use o arquivo completo.");const el=document.getElementById("pdfjsWorkerSrc");if(!el)throw new Error("O leitor de PDF está incompleto neste arquivo.");const wurl=URL.createObjectURL(new Blob([el.textContent],{type:"text/javascript"}));L.GlobalWorkerOptions.workerSrc=wurl;
  /* aberto direto do disco (file://), o pdf.js não aceita o worker por URL e cai num modo que a CSP bloqueia: criar o Worker aqui evita isso */
  try{L.GlobalWorkerOptions.workerPort=new Worker(wurl)}catch(e){}
  estadoRomaneio.pdfLib=L;return L}
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
    if(estadoRomaneio.ROM){estadoRomaneio.ROM.msg=`Lendo o PDF… página ${pg} de ${doc.numPages}`;const m=document.querySelector("#romWrap .rom-b .hint");if(m)m.textContent=estadoRomaneio.ROM.msg}
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
function romFotos(rows){const P=estadoRomaneio.ROM.pdf;if(!P)return;const pares=[],usados=new Set(),feitos=new Set();
  rows.forEach((r,i)=>{if(!r.cod)return;const rc=new RegExp("(^|[^A-Za-z0-9])"+String(r.cod).replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&")+"($|[^A-Za-z0-9])"),candidatos=P.itens.filter(x=>rc.test(x.s));
    /* Um código também pode aparecer no endereço, telefone ou cabeçalho. Só vincule
       fotos a uma ocorrência que esteja numa linha de produto com valor monetário. */
    candidatos.forEach(it=>{const linha=P.itens.filter(x=>x.pg===it.pg&&Math.abs(x.y-it.y)<=5).map(x=>x.s).join(" ");if(!/(?:R\s*\$\s*)?\d[\d.]*,\d{2,3}(?:\D|$)/.test(linha))return;
      P.fotos.forEach((f,j)=>{if(f.pg!==it.pg)return;const d=Math.abs(f.cy-it.y);if(d<=Math.max(f.h*0.8,24))pares.push([d,i,j])})})});
  pares.sort((a,b)=>a[0]-b[0]);pares.forEach(([d,i,j])=>{if(feitos.has(i)||usados.has(j))return;feitos.add(i);usados.add(j);rows[i].foto=P.fotos[j].url;rows[i].fotoMini=P.fotos[j].mini})}
async function romPdf(file){
  if(!estadoRomaneio.ROM){estadoRomaneio.ROM={tid:estadoBase.abertos.romT&&cfg().romaneios.some(x=>x.id===estadoBase.abertos.romT)?estadoBase.abertos.romT:cfg().romaneios[0].id,texto:"",rows:[],obs:"",conf:"",msg:""};const T0=romT();if(T0&&T0.forn&&fornBy(T0.forn))romSetForn(T0.forn)}
  estadoRomaneio.ROM.doc=file.name;estadoRomaneio.ROM.hash=IMPH.get(file)||"";estadoRomaneio.ROM.msg="Lendo o PDF…";renderRom();rolarPane(document.getElementById("romWrap"));
  try{const P=await lerPdf(file);estadoRomaneio.ROM.pdf=P;estadoRomaneio.ROM.texto=P.texto;romLer();
    if(estadoRomaneio.ROM.rows.length){const n=estadoRomaneio.ROM.rows.filter(r=>r.foto).length;estadoRomaneio.ROM.msg=`${estadoRomaneio.ROM.rows.length} peças lidas do PDF · ${n} foto${n===1?"":"s"} encontrada${n===1?"":"s"}`;const h=document.querySelector("#romWrap .rom-b .hint");if(h)h.textContent=estadoRomaneio.ROM.msg;impStatusFim(true)}else impStatusFim(false,"não encontrei peças nesse PDF (confira o modelo de leitura ou cole o texto)")}
  catch(e){let m=String(e&&e.message?e.message:"erro").replace(/[.\s]+$/,"");const senha=!!(e&&(e.name==="PasswordException"||/password/i.test(m)));if(senha)m="o PDF tem senha. Abra-o com a senha, salve uma cópia sem senha e envie de novo";else if(/invalid pdf|missing pdf|unexpected server|xref|not a pdf/i.test(m)||(e&&/Invalid|Missing/i.test(e.name||"")))m="o arquivo não é um PDF válido ou está corrompido";
    estadoRomaneio.ROM.rows=[];estadoRomaneio.ROM.pdf=null;estadoRomaneio.ROM.conf="";estadoRomaneio.ROM.msg="Não consegui ler esse PDF: "+m+". Copie o texto e cole na caixa.";romSalvarSoon();renderRom();impStatusFim(false,m)}}
