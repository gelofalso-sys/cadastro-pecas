/* ===== fotos com link (imgbb): o sistema de destino pede um endereço público da foto ===== */
const fotoKey=()=>{try{return (prefLer("imgbb")||"").trim()}catch(e){return ""}};
/* envio automático: com a chave do imgbb guardada, a foto anexada já sobe e o link entra na coluna Foto (pode ser desligado em Cadastros › Fotos) */
const fotoAuto=()=>{try{return prefLer("imgbbAuto")==="1"&&prefLer("imgbbConsent")==="1"}catch(e){return false}};
const autoEnviar=ids=>{if(fotoKey()&&fotoAuto()&&ids&&ids.length)enviarFotos(ids)};
/* testa a chave: envia uma imagem de 1 pixel que o imgbb apaga sozinho em 60 segundos */
async function testarChaveImgbb(){const key=fotoKey();if(!key){toast("Cole a chave do imgbb primeiro.");return}
  toast("Testando a chave…");
  try{const c=document.createElement("canvas");c.width=c.height=1;const b=await new Promise(r=>c.toBlob(r,"image/png")),fd=new FormData();fd.append("key",key);fd.append("expiration","60");fd.append("image",b,"teste.png");
    const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),20000);let r,j;try{r=await fetch("https://api.imgbb.com/1/upload",{method:"POST",body:fd,signal:ac.signal});j=await r.json().catch(()=>null)}finally{clearTimeout(tm)}
    if(r.ok&&j&&j.success)toast("Chave OK: o envio de fotos para o imgbb está funcionando.");
    else toast(j&&j.error&&j.error.code===100?"O imgbb não reconheceu essa chave. Copie de novo em api.imgbb.com.":"O imgbb recusou o teste: "+((j&&j.error&&j.error.message)||r.status))}
  catch(e){toast(e&&e.name==="AbortError"?"O imgbb não respondeu em 20 segundos. Tente de novo.":"Não consegui falar com o imgbb (internet ou bloqueio do navegador).")}}
async function fotoReduzida(src,max){
  const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error("foto ilegível"));i.src=src});
  const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight,1)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));
  const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.imageSmoothingQuality="high";x.drawImage(im,0,0,c.width,c.height);
  return new Promise(ok=>c.toBlob(ok,"image/jpeg",0.85))}
async function enviarFoto(l){const key=fotoKey();if(!key)throw new Error("falta a chave do imgbb");
  const src=await idbGet("fotos",l.id);if(typeof src!=="string"||!/^data:image\//.test(src))throw new Error(l.ft?"a foto original não está mais guardada neste aparelho (só a miniatura); anexe a foto de novo":"a peça não tem foto");
  const blob=await fotoReduzida(src,1200);if(!blob)throw new Error("não consegui preparar a foto");
  const nome=String(((G&&G.refs[l.id])||[])[0]||l.id).replace(/[^A-Za-z0-9_-]/g,"-"),fd=new FormData();fd.append("image",blob,nome+".jpg");fd.append("name",nome);
  /* a chave vai no corpo do envio (não no endereço da requisição, que fica em históricos e registros); sem resposta em 30 s, desiste */
  fd.append("key",key);
  let r,j;
  const envia=async fin=>{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),30000);
    try{r=await fetch("https://api.imgbb.com/1/upload"+fin,{method:"POST",body:fd,signal:ac.signal});j=await r.json().catch(()=>null)}
    catch(e){throw new Error(e&&e.name==="AbortError"?"o imgbb demorou mais de 30 segundos para responder":"não consegui falar com o imgbb (internet ou bloqueio do navegador)")}
    finally{clearTimeout(tm)}};
  await envia("");
  if(!r.ok||!j||!j.success||!j.data||!j.data.url)throw new Error((j&&j.error&&j.error.message)||"o imgbb recusou a foto ("+r.status+")");
  const u=String(j.data.url);if(!/^https:\/\/[^\s"'<>]+$/.test(u))throw new Error("o imgbb devolveu um link estranho");return u}
/* estado da fatia: grande = foto original da peça em preparação; alvo = para quem o seletor de arquivo (#ftIn) foi aberto; enviando = envio ao imgbb em curso */
const estadoFotos={grande:null,alvo:null,enviando:false};
async function enviarFotos(soIds){if(estadoFotos.enviando)return;
  if(!fotoKey()){if(!Array.isArray(soIds)){toast("Cole a chave do imgbb em Cadastros › Fotos (link).");irPara("foto")}return}
  const ls=S.lanc.filter(l=>l.ft&&vazio(l.v.B)&&(!Array.isArray(soIds)||soIds.includes(l.id)));if(!ls.length){if(!Array.isArray(soIds))toast("Nenhuma foto esperando link.");return}
  if(!Array.isArray(soIds)&&!confirm(`Enviar ${ls.length} foto(s) ao imgbb, um serviço de terceiros? As imagens saem deste aparelho e os links gerados podem ser acessados por quem os tiver.`))return;
  estadoFotos.enviando=true;let ok=0,falhas=0,sumiu=0,trocou=0,erro=null,chaveRuim=false;
  try{for(let i=0;i<ls.length;i++){toast(`Enviando foto ${i+1} de ${ls.length}…`);
    try{const ft0=ls[i].ft,u=await enviarFoto(ls[i]);
      /* a peça pode ter sido excluída (ou já ganhado link) durante o envio: só grava se ainda existe e continua sem link */
      const viva=S.lanc.find(x=>x.id===ls[i].id);if(!viva){sumiu++;continue}if(viva.ft!==ft0){trocou++;continue}   /* sumiu ou a foto foi trocada durante o envio: o link seria da foto antiga */
      if(!vazio(viva.v.B))continue;
      viva.v.B=u;ok++;salvar(false)}
    catch(e){falhas++;erro=(e&&e.message)||"erro desconhecido";if(/chave|key|autoriz|unauthor/i.test(erro)&&!/memória/i.test(erro)){chaveRuim=true;break}}}}   /* chave errada falharia em todas: aí sim para */
  finally{estadoFotos.enviando=false}
  renderTopo();
  const resumo=`${ok} foto(s) com link${falhas?` · ${falhas} falharam (último erro: ${String(erro).replace(/[.\s]+$/,"")}${chaveRuim?" — parei porque a chave parece errada":""})`:""}${sumiu?` · ${sumiu} peça(s) excluída(s) durante o envio`:""}${trocou?` · ${trocou} peça(s) com a foto trocada durante o envio (o link seria da foto antiga; envie de novo)`:""}.`;
  toast(falhas||sumiu?resumo+" Clique em enviar de novo para tentar as que faltam.":`${ok} foto(s) com link: já estão na coluna Foto.`)}
