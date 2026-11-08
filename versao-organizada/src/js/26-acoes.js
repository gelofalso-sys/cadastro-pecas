/* ===== ações ===== */
function lembrarForn(l){const fo=fornBy(l.v.H);if(!fo)return;const m=fo.mem||{};
  if(l.tipo==="bruta"){m.banhista=l.banhista;m.on={...(l.on||{})};const mk={};Object.keys(l.mk||{}).forEach(k=>{if(k!=="p"&&!vazio(l.mk[k]))mk[k]=l.mk[k]});m.mk=mk}
  else{if(l.mk&&!vazio(l.mk.p))m.mkp=l.mk.p;else delete m.mkp}
  const antes=JSON.stringify(fo.mem||{});fo.mem=m;if(JSON.stringify(m)!==antes){salvar(true,false);setTimeout(renderCfg,0)}}
function aplicarMemForn(f,fo){const m=fo&&fo.mem;if(!m)return "";const C=cfg(),dito=[];
  if(f.tipo==="bruta"&&m.banhista&&C.banhistas.some(b=>b.id===m.banhista)&&(!fo.banhista||fo.banhista===m.banhista)){const bh=banhistaBy(m.banhista);
    if(f.banhista!==m.banhista)trocarBanhista(f,m.banhista);dito.push(bh.nome);
    if(m.on){f.on={};bh.banhos.forEach(b=>f.on[b.id]=!!m.on[b.id])}
    f.mk=f.mk||{};bh.banhos.forEach(b=>{if(m.mk&&!vazio(m.mk[b.id])){f.mk[b.id]=m.mk[b.id];if(f.on[b.id])dito.push(b.letra+" ×"+m.mk[b.id])}})}
  if(f.tipo==="pronta"&&!vazio(m.mkp)){f.mk=f.mk||{};f.mk.p=m.mkp;dito.push("×"+m.mkp)}
  return dito.join(" · ")}
function resumoMem(fo){const m=fo.mem;if(!m)return "";const bh=m.banhista&&cfg().banhistas.find(b=>b.id===m.banhista),out=[];
  if(bh){out.push(bh.nome);bh.banhos.forEach(b=>{if(m.on&&m.on[b.id])out.push(b.letra+(m.mk&&!vazio(m.mk[b.id])?" ×"+m.mk[b.id]:""))})}
  if(!vazio(m.mkp))out.push("pronta ×"+m.mkp);return out.join(" · ")}
function marcadosPadrao(f){f.on={};banhistaBy(f.banhista).banhos.forEach(b=>f.on[b.id]=!!b.marcado)}
/* trocar a galvânica refaz o preenchimento: banhos marcados, verniz e custos voltam ao que a galvânica define (só as quantidades ficam) */
function trocarBanhista(f,id){f.banhista=id;delete f.bhs;marcadosPadrao(f);f.onP={};f.vz={};
  Object.keys(f.ov||{}).forEach(k=>{const o=f.ov[k];if(!o||typeof o!=="object"){delete f.ov[k];return}Object.keys(o).forEach(L=>{if(L!=="W")delete o[L]});if(!Object.keys(o).length)delete f.ov[k]})}
/* a galvânica de cada fornecedor (Fornecedores → Galvânica) entra sozinho quando a peça é bruta */
function banhistaDoFornecedor(f){const fo=fornBy(f.v.H);if(f.tipo==="bruta"&&fo&&fo.banhista&&fo.banhista!==f.banhista&&cfg().banhistas.some(b=>b.id===fo.banhista))trocarBanhista(f,fo.banhista)}
function limparForm(){const cc=cfg().colcfg,f=S.form;f.vz={};LET.forEach(L=>{if(!cc[L].manter)delete f.v[L]});
  Object.keys(f.ov||{}).forEach(b=>{const o=f.ov[b];if(!o||typeof o!=="object"){delete f.ov[b];return}Object.keys(o).forEach(L=>{if(!cc[L]||!cc[L].manter)delete o[L]});if(!Object.keys(o).length)delete f.ov[b]});if(f.tipo!=="pronta")f.vinc=false;if(f.conj){f.comp=[novaComp(),novaComp()];delete f.v.F;delete f.fConj;conjSync(f)}}
const focarPrimeiro=()=>{const el=document.querySelector("#f-F")||document.querySelector("#form .fbody input");if(el){el.focus();try{el.select()}catch(x){}}};
let addTrava=0;
