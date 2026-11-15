/* ===== eventos ===== */
const refocar=s=>{const el=document.querySelector(s);if(el)el.focus()};
const guardarAbertos=()=>{try{gravarPref("cadpecas-abertos",JSON.stringify(abertos))}catch(x){}};
/* Um banho pode ser usado em componentes guardados fora da tabela aberta. */
let bnReserva=null,bnReservando=false,bnEmExclusao=false;
/* A reserva fica até salvar ou descartar os cadastros: conferir apenas no clique
   deixaria outra aba criar um conjunto antes da confirmação. */
async function bnReservarUso(){
  if(bnEmExclusao)return false;
  if(bnReserva)return true;
  if(bnReservando||!navigator.locks||conflito||corrompido)return false;
  bnReservando=true;
  try{
    await bkUsoParar();
    let anunciar;const pronto=new Promise(r=>{anunciar=r});
    const pedido=navigator.locks.request("cadpecas-uso",{mode:"exclusive",ifAvailable:true},lock=>{
      if(!lock){anunciar(false);return}
      return new Promise(liberar=>{bnReserva={liberar};anunciar(true)})
    });
    pedido.catch(()=>anunciar(false));
    const ok=await pronto;
    if(ok)bnReserva.pedido=pedido;else{await pedido.catch(()=>{});await bkUsoIniciar()}
    return ok
  }finally{bnReservando=false}
}
async function bnLiberarUso(){if(!bnReserva)return;const r=bnReserva;bnReserva=null;r.liberar();await r.pedido;await bkUsoIniciar()}
async function bnExcluirSeguro(bh0,bn0){
  const jaReservado=!!bnReserva;
  if(!await bnReservarUso()){alert("Não foi possível reservar o uso exclusivo. Feche as outras abas do aplicativo e tente novamente; neste navegador a exclusão exige suporte a bloqueios.");return}
  bnEmExclusao=true;
  let excluiu=false;
  try{
    if(conflito||corrompido){toast("Resolva o conflito ou os dados danificados antes de excluir o banho.");return}
    const antes=cfg().banhistas.find(b=>b.id===bh0.id)?.banhos.some(b=>b.id===bn0.id);
    await bnExcluirConferido(bh0,bn0);
    excluiu=!!antes&&!cfg().banhistas.find(b=>b.id===bh0.id)?.banhos.some(b=>b.id===bn0.id);
    if(excluiu&&!CADAUTO){cadConferir();if(!CAD.pend)throw new Error("A exclusão não ficou pendente")}
    if(excluiu&&CADAUTO){clearTimeout(sT);sT=null;chain=chain.then(flush);if(!await chain)toast("A exclusão não foi gravada. Confira o aviso de armazenamento.")}
  }finally{bnEmExclusao=false;if(!jaReservado&&(!excluiu||CADAUTO))await bnLiberarUso()}
}
async function bnExcluirConferido(bh0,bn0){
  const assinatura=()=>JSON.stringify([S.lanc,S.form,ROM,TABS,ROMS,cfg().banhistas]);
  const antes=assinatura(),b=bh0.id,id=bn0.id,usas=[];
  const comp=(cs,banhista)=>banhista===b&&Array.isArray(cs)&&cs.some(c=>c&&c.banho===id);
  const lanc=(l,origem)=>{if(l&&comp(l.comp,l.banhista))usas.push(origem)};
  S.lanc.forEach(l=>lanc(l,"tabela atual"));if(S.form&&comp(S.form.comp,S.form.banhista))usas.push("formulário");
  if(typeof rascunho!=="undefined"&&rascunho&&comp(rascunho.comp,rascunho.banhista))usas.push("formulário em edição");
  const rom=(r,origem,padrao)=>{if(r&&comp(r.conjComp,r.bh||padrao))usas.push(origem)};
  if(ROM)(ROM.rows||[]).forEach(r=>rom(r,"romaneio aberto",S.form.banhista));
  const [tabs,roms]=await Promise.all([idbOp("tabs","readonly",st=>st.getAll()),idbOp("roms","readonly",st=>st.getAll())]);
  if(!Array.isArray(tabs)||!Array.isArray(roms)){alert("Não consegui conferir tabelas e romaneios salvos. O banho não foi excluído; verifique o armazenamento e tente novamente.");return}
  if(antes!==assinatura()){toast("Os dados mudaram durante a conferência. Tente excluir o banho novamente.");return}
  tabs.forEach(t=>(t.lanc||[]).forEach(l=>lanc(l,"tabela salva")));
  roms.forEach(t=>(t.rows||[]).forEach(r=>rom(r,"romaneio salvo",t.form&&t.form.banhista)));
  if(usas.length){alert(`O banho “${bn0.nome}” é usado em componentes (${[...new Set(usas)].join(", ")}). Edite os conjuntos e escolha outro banho antes de excluir.`);return}
  const n=S.lanc.filter(l=>l.banhista===b&&((l.on&&l.on[id])||(l.onP&&l.onP[id]))).length;
  if(n&&!confirm(`${n} peça(s) já lançadas usam o banho “${bn0.nome}”. Remover mesmo assim? (Ctrl+Z desfaz)`))return;
  const bh=cfg().banhistas.find(x=>x.id===b),i=bh&&bh.banhos.findIndex(x=>x.id===id);if(!bh||i<0)return;
  if(!CADAUTO&&!CAD.snap)cadTirarFoto();
  const anterior=clone(S.config);bh.banhos.splice(i,1);salvar(true);if(!CADAUTO)cadConferir();render();toast("Banho excluído.",{t:"Desfazer",fn:()=>{S.config=anterior;salvar(true);if(!CADAUTO)cadConferir();render()}});
}
