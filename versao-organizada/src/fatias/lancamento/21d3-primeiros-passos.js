
/* ===== primeiros passos (instalação nova) ===== */
function primeirosHtml(){
  const C=cfg();if(abertos.primeiros===false||S.lanc.length>=3)return "";
  const passos=[["banho","Cadastre a galvânica e os banhos",C.banhistas.length>0,"Nome, banhos (ouro, prata…) e valor por grama"],["cat","Confira as categorias",true,"Prefixos, apelidos e fiscal de cada uma"],["forn","Cadastre os fornecedores",C.fornecedores.length>0,"Desconto e tipo (bruta/pronta) de cada um"],["lancar","Lance a primeira peça ou importe um romaneio",S.lanc.length>0,"Pelo formulário abaixo ou em Importar romaneio"]];
  if(passos[0][2]&&passos[2][2]&&S.lanc.length)return "";
  return `<div class="primeiros" role="region" aria-label="Primeiros passos"><b>Primeiros passos</b><span>Já tem uma planilha? Importe a última em Cadastros › Importar e backup para continuar a numeração.</span>${passos.map((p,i)=>`<button type="button" class="prim-p ${p[2]?"ok":""}" data-act="prim-ir" data-p="${p[0]}" title="${esc(p[3])}"><span>${i+1}</span> ${esc(p[1])}</button>`).join("")}<button type="button" class="btn ghost sm" data-act="prim-fechar" title="Não mostrar mais">Dispensar</button></div>`}
/* atualiza o cartão de primeiros passos só na abertura e depois de ações explícitas (não a cada clique: o cartão aparecendo e sumindo deslocaria a tela) */
function primeirosAtualizar(){const pw=document.getElementById("primeirosWrap");if(pw)pw.innerHTML=primeirosHtml()}
setTimeout(primeirosAtualizar,1200);
function primeirosIr(p){
  const C=cfg();
  if(p==="banho"&&!C.banhistas.length){C.banhistas.push({id:uid(),nome:"Galvânica 1",verniz:"0.42",vernizOn:true,banhos:clone(BANHISTA0.banhos)});if(!S.form.banhista)S.form.banhista=C.banhistas[0].id;if(typeof marcadosPadrao==="function"&&!Object.values(S.form.on||{}).some(Boolean))marcadosPadrao(S.form);salvar(true,false);render()}
  if(celular())formAbrir(false);
  if(p==="lancar"){const f=document.getElementById("f-F");if(f){f.scrollIntoView({block:"center",behavior:"smooth"});f.focus({preventScroll:true})}return}
  irPara(p==="banho"?"banho":p==="cat"?"cat":"forn")}

