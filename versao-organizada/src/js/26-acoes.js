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
function trocarBanhista(f,id){f.banhista=id;marcadosPadrao(f);f.onP={};f.vz={};
  Object.keys(f.ov||{}).forEach(k=>{const o=f.ov[k];if(!o||typeof o!=="object"){delete f.ov[k];return}Object.keys(o).forEach(L=>{if(L!=="W")delete o[L]});if(!Object.keys(o).length)delete f.ov[k]})}
/* a galvânica de cada fornecedor (Fornecedores → Galvânica) entra sozinho quando a peça é bruta */
function banhistaDoFornecedor(f){const fo=fornBy(f.v.H);if(f.tipo==="bruta"&&fo&&fo.banhista&&fo.banhista!==f.banhista&&cfg().banhistas.some(b=>b.id===fo.banhista))trocarBanhista(f,fo.banhista)}
function limparForm(){const cc=cfg().colcfg,f=S.form;f.vz={};LET.forEach(L=>{if(!cc[L].manter)delete f.v[L]});
  Object.keys(f.ov||{}).forEach(b=>{const o=f.ov[b];if(!o||typeof o!=="object"){delete f.ov[b];return}Object.keys(o).forEach(L=>{if(!cc[L]||!cc[L].manter)delete o[L]});if(!Object.keys(o).length)delete f.ov[b]});if(f.tipo!=="pronta")f.vinc=false;if(f.conj){f.comp=[novaComp(),novaComp()];delete f.v.F;delete f.fConj;conjSync(f)}}
/* Lançamento contínuo é opcional; apenas campos comuns explicitamente marcados são mantidos. */
const CONT_OPTS=[["categoria","Categoria e subcategoria"],["fornecedor","Fornecedor, código e desconto"],["banho","Galvânica e banhos"]];
function continuoCfg(){const c=cfg().continuo;return c&&typeof c==="object"?c:{ativo:false,categoria:true,fornecedor:true,banho:true}}
function continuoProxima(f){const c=continuoCfg();delete f.v.F;delete f.v.N;delete f.v.P;delete f.v.W;delete f.v.V;delete f.v.E;delete f._descAuto;f.ov={};f.ft=null;f.ftR=null;f.loteN="";f.vinc=false;
  if(!c.categoria){delete f.v.I;delete f.v.J;f.grade="";f.gsel=[];f.csel=[]}if(!c.fornecedor){delete f.v.H;delete f.v.G;f.desconto="0"}if(!c.banho){f.banhista="";f.on={};f.onP={};f.vz={}}if(f.conj){f.comp=[novaComp(),novaComp()];delete f.fConj}if(c.categoria&&!f.conj)descAuto(f)}
let trabalhoAberto=false;
function trabalhoHtml(){const c=continuoCfg(),ps=Array.isArray(cfg().presetsLancamento)?cfg().presetsLancamento:[];return `<div class="trabalho"><button type="button" class="btn sm" data-act="trabalho-toggle" aria-expanded="${trabalhoAberto}">Lançamento contínuo e combinações</button>${trabalhoAberto?`<div class="trabalho-painel"><label><input type="checkbox" data-cont="ativo" ${c.ativo?"checked":""}> Lançamento contínuo</label><span class="hint">Após adicionar, limpa descrição, peso, custo, preços, quantidades e fotos. Mantenha:</span><div class="trabalho-opcoes">${CONT_OPTS.map(([k,n])=>`<label><input type="checkbox" data-cont="${k}" ${c[k]!==false?"checked":""}> ${n}</label>`).join("")}</div><div class="trabalho-presets"><label>Combinação salva <select data-preset-select aria-label="Combinação salva"><option value="">Escolha…</option>${ps.map((x,i)=>`<option value="${i}">${esc(x.nome)}</option>`).join("")}</select></label><button type="button" class="btn sm" data-act="preset-usar">Usar</button><button type="button" class="btn sm" data-act="preset-excluir">Excluir</button></div><div class="trabalho-presets"><label>Salvar escolhas atuais como <input data-preset-nome maxlength="50" placeholder="Nome da combinação"></label><button type="button" class="btn sm" data-act="preset-salvar">Salvar combinação</button></div><span class="hint">Guarda categoria, fornecedor, tipo de peça, galvânica e banhos. Não guarda descrição, quantidades, valores nem fotos.</span></div>`:""}</div>`}
function presetAtual(nome){const f=S.form;return {nome,tipo:f.tipo,cat:f.v.I||"",sub:f.v.J||"",forn:f.v.H||"",codigo:f.v.G||"",desconto:f.desconto||"0",banhista:f.banhista||"",on:clone(f.on||{}),onP:clone(f.onP||{})}}
function presetAplicar(p){const f=S.form,C=cfg();if(editId){toast("Termine a edição da peça antes de usar uma combinação.");return false}if(p.cat&&!catBy(p.cat)){toast("A categoria desta combinação não existe mais; ajuste a combinação.");return false}if(p.banhista&&!C.banhistas.some(b=>b.id===p.banhista)){toast("A galvânica desta combinação não existe mais; ajuste a combinação.");return false}if(f.conj){conjLimpar(f);delete f.conj}f.tipo=p.tipo==="pronta"?"pronta":"bruta";f.v.I=p.cat||"";f.v.J=p.sub||"";f.v.H=p.forn||"";f.v.G=p.codigo||"";f.desconto=p.desconto||"0";f.banhista=p.banhista||"";f.on=clone(p.on||{});f.onP=clone(p.onP||{});f.ov={};f.vz={};sincGrade(f);aplicarSemBanho(f);salvar(false);renderListas();renderTopo();renderForm();toast("Combinação aplicada.");return true}
const focarPrimeiro=forca=>{if(celular()&&forca!==true)return;const el=document.querySelector("#f-F")||document.querySelector("#form .fbody input");if(el){el.focus();try{if(S.form._descAuto&&el.value===S.form._descAuto)el.setSelectionRange(el.value.length,el.value.length);else el.select()}catch(x){}}};
let addTrava=0;
