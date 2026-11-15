function usarModelo(id){
  const l=S.lanc.find(x=>x.id===id);if(!l)return;if(estadoBase.editId)cancelar();
  const c=clone(l);delete c.id;delete c.v.E;c.vinc=false;delete c.excl;delete c.ft;delete c.ftR;if(c.ov)Object.values(c.ov).forEach(o=>{delete o.E;delete o.W});
  S.form={...FORM0(),...c};salvar(false);renderTopo();renderForm();document.getElementById("paneBot").scrollTo({top:0});
  const d=document.getElementById("f-F");if(d){d.focus();d.select()}toast("Dados copiados para o lançamento. Ajuste e aperte Adicionar para criar a nova referência.");
}
