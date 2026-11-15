/* a variação do elemento (cartão da categoria ou variação sem categoria) */
function aplicaFaixa(txt){const f=S.form,gr=gradeBy(f.grade);if(!gr)return;f.gsel=selFaixa(gr,txt);estadoBase.erro="";salvar(false);renderTopo();renderForm()}
