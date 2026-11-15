/* ===== de onde vêm os dados: cada endereço/arquivo guarda os seus, separados ===== */
function origemAviso(){
  try{if(prefLer("origemOk"))return;
    const web=/^https?:$/.test(location.protocol),txt=web?"Site publicado: os dados daqui ficam só neste navegador e são separados do arquivo local. Para levar peças e cadastros de um para o outro, use Backup completo e Restaurar.":"Arquivo local: os dados ficam só neste navegador e são separados do site publicado. Para levar peças e cadastros entre eles, use Backup completo e Restaurar.";
    const mk=()=>{const d=document.createElement("div");d.className="origem-aviso";d.setAttribute("role","note");d.innerHTML=`<span><b>Nota:</b> ${esc(txt)}</span><button type="button" class="btn sm" data-act="origem-ok">Entendi</button>`;return d};
    /* no menu lateral e no menu do celular: nunca no meio da tela de trabalho, para não deslocar a tabela */
    const side=document.getElementById("side"),pn=document.querySelector("#mobileMenu .mobile-menu-panel");
    if(side&&!side.querySelector(".origem-aviso"))side.appendChild(mk());
    if(pn&&!pn.querySelector(".origem-aviso"))pn.insertBefore(mk(),pn.firstChild)}catch(e){}}
origemAviso();   /* já na abertura: aparecer depois deslocaria a tela */
