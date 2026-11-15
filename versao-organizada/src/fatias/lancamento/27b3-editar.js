/* valores digitados direto na tabela (ov) voltam para os campos do formulário, para poder editá-los ali */
function dobrarOv(f,id){const ov=f.ov||{};
  if(f.tipo==="pronta"&&!bonP(f).length&&!temGrade(f)){const o=ov.p;if(o&&typeof o==="object"){Object.keys(o).forEach(L=>{if(f.conj&&(L==="N"||L==="P"))return;f.v[L]=o[L]});delete ov.p}return}
  const rows=(G?G.linhas:[]).filter(r=>r.lancId===id),ks=Object.keys(ov).filter(k=>ov[k]&&typeof ov[k]==="object");if(!ks.length||!rows.length)return;
  const per=new Set(["W","E","F","V","L","O","R","S","T","U"]),Ls=new Set();ks.forEach(k=>Object.keys(ov[k]).forEach(L=>{if(!per.has(L))Ls.add(L)}));if(f.conj){Ls.delete("N");Ls.delete("P")}
  const gr=temGrade(f);let avisa=false;
  Ls.forEach(L=>{const com=rows.filter(r=>r.ovs&&r.ovs.includes(L));if(!com.length||!com.every(r=>r.v[L]===com[0].v[L]))return;
    if(com.length<rows.length)return;   /* valor só de algumas linhas continua só nelas */
    f.v[L]=com[0].v[L];ks.forEach(k=>{delete ov[k][L]})});
  if(avisa)setTimeout(()=>toast("Valor digitado à mão numa linha agora vale para todas as linhas desta peça (aparece nos campos abaixo)."),50);
  ks.forEach(k=>{if(!Object.keys(ov[k]).length)delete ov[k]})}
const formSujo=()=>!!editId&&JSON.stringify(S.form)!==estadoLancamento.editSnap;
function editar(id){
  if(editId&&editId!==id&&formSujo()&&!confirm("Há alterações não salvas na peça aberta. Descartar e abrir esta outra?"))return;
  const l=S.lanc.find(x=>x.id===id);if(!l)return;
  if(!editId)rascunho=clone(S.form);editId=id;S.form=clone(l);delete S.form.id;erro="";
  dobrarOv(S.form,id);if(S.form.conj)conjSync(S.form);estadoLancamento.editSnap=JSON.stringify(S.form);
  if(["A","B","C","D","K","X","Z","AD","AE","Y","AA","AB","AC"].some(L=>!vazio(S.form.v[L])))abertos.det=true;
  if(Object.values(S.form.ov||{}).some(o=>o&&Object.keys(o).some(L=>!["W","V"].includes(L))))abertos.det=true;
  salvar(false);renderTopo();renderForm();focarPrimeiro();estadoLancamento.editSnap=JSON.stringify(S.form);
}
