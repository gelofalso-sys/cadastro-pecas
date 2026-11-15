/* fornecedor e subcategoria digitados à mão passam a existir no cadastro (o fornecedor leva o código, o desconto e o tipo que estão no formulário) */
function adicionar(limpar,quiet){
  if(!quiet&&Date.now()<estadoLancamento.addTrava)return;   /* duplo clique / Enter repetido: só a primeira conta */
  const f=S.form;estadoBase.erro="";
  if(vazio(f.v.F)){estadoBase.erro="Falta a Descrição.";atualizarGera();focarPrimeiro(true);return} if(!quiet){const sus=["N","P","V"].filter(L=>/^\d{1,3}(\.\d{3})+$/.test(String(f.v[L]==null?"":f.v[L]).trim()));if(sus.length){const L=sus[0],t=String(f.v[L]).trim(),lido=String(num(t)).replace(".",",");if(!confirm(NOME[L]+" \""+t+"\" será lido como "+lido+" (o ponto é decimal). Se o valor é "+t.replace(/\./g,"")+", cancele e digite sem o ponto.\n\nLançar assim mesmo?"))return}}
  if(!quiet){const meu=estadoBase.editId||"__p",rd=previsao().linhas.filter(r=>r.lancId===meu&&r.dup);if(rd.length){estadoBase.erro="Referência repetida ("+[...new Set(rd.map(r=>r.v.E))].slice(0,3).join(", ")+"): duas linhas ficaram iguais. Dê uma letra (ou outro nome) para cada cor/tamanho em Cadastros › Categorias.";atualizarGera();return}}
  {let ck=null,onde=null;
    for(const L of VALIDA_NUM){const r=checaCel(L,f.v[L]);if(r.erro){ck=r.erro;onde=L;break}}
    if(!ck)for(const [ok0,o] of Object.entries(f.ov||{})){if(!o||typeof o!=="object")continue;if(f.tipo==="pronta"&&!bonP(f).length&&ok0!=="p"&&!ok0.startsWith("p~"))continue;for(const L of VALIDA_NUM){const r=checaCel(L,o[L]);if(r.erro){ck=r.erro;onde=L;break}}if(ck)break}
    if(!ck&&!vazio(f.desconto)){const d=num(f.desconto);if(d==null||d<0||d>100)ck="Desconto precisa ser um número de 0 a 100 (%)."}
    if(ck){estadoBase.erro=ck;atualizarGera();const el=onde&&document.getElementById("f-"+onde);if(el)el.focus();return}}
  if(f.conj){const cs=Array.isArray(f.comp)?f.comp:[];
    if(!cs.some(c=>!vazio(c.desc)||(num(c.peso)||0)>0||(num(c.custo)||0)>0)){estadoBase.erro="Coloque pelo menos uma peça no conjunto (nome, peso ou custo).";atualizarGera();return}
    const mau=cs.findIndex(c=>["peso","custo"].some(k=>!vazio(c[k])&&(num(c[k])==null||num(c[k])<0||num(c[k])>1e7)));
    if(mau>=0){estadoBase.erro=`Peça ${mau+1} do conjunto: peso e custo precisam ser números de 0 em diante.`;atualizarGera();const el=document.querySelector(`[data-ci="${mau}"] input.cj-n`);if(el)el.focus();return}
  if(f.conj){const ie=(f.comp||[]).findIndex((c,i)=>{const e=conjErro(f,i);return e&&e!=="nome repetido"});if(ie>=0){estadoBase.erro=`Peça ${ie+1} do conjunto: ${conjErro(f,ie)}.`;atualizarGera();const el=document.querySelector(`#conj [data-ci="${ie}"] [data-cp="${vazio(f.comp[ie].desc)?"desc":conjQtd(f.comp[ie])==null?"qtd":vazio(f.comp[ie].peso)?"peso":"custo"}"]`);if(el)el.focus();return}}
    {const R=conjCalc(f);if(R.tot.N<=0&&R.tot.P<=0){estadoBase.erro="Coloque o peso ou o custo de compra nas peças do conjunto.";atualizarGera();return}}}
  if(!catBy(val(f,"I"))){estadoBase.erro="Escolha a categoria da peça.";atualizarGera();const ec=document.getElementById("f-I");if(ec)ec.focus();return}
  if(f.tipo==="bruta"&&!banhistaBy(f.banhista).banhos.some(b=>f.on[b.id])){estadoBase.erro="Marque pelo menos um banho.";atualizarGera();return}
  {const gr=gradeBy(f.grade);if(gr&&!f.semGrade&&!(f.gsel||[]).some(id=>gr.itens.some(x=>x.id===id))){estadoBase.erro=`Escolha pelo menos uma opção de ${gr.nome}.`;atualizarGera();return}}
  if(!vazio(f.v.E))f.v.E=String(f.v.E).replace(/\s+/g,"").toUpperCase();Object.values(f.ov||{}).forEach(o=>{if(o&&typeof o==="object"&&!vazio(o.E))o.E=String(o.E).replace(/\s+/g,"").toUpperCase()});
  if(!quiet&&!f.compra4){const custos=[f.v.P,...Object.values(f.ov||{}).map(o=>o&&o.P)].filter(x=>!vazio(x));if(custos.some(x=>{const n=num(x);return n!=null&&Math.abs(n*100-Math.round(n*100))>1e-7})&&!confirm("O custo tem mais de duas casas decimais e será arredondado para centavos. Continuar?"))return}
  {const d2=o=>{if(!o||typeof o!=="object")return;DUAS.forEach(L=>{const t=o[L];if(vazio(t)||String(t).trim()[0]==="=")return;const n=num(t);if(n!=null)o[L]=(L==="P"&&f.compra4?String(Math.round(n*10000)/10000):r2c(n).toFixed(2)).replace(".",",")});const p=o.N;if(!vazio(p)&&String(p).trim()[0]!=="="){const n=num(p);if(n!=null)o.N=String(Math.round(n*1000)/1000).replace(".",",")}};d2(f.v);Object.values(f.ov||{}).forEach(d2)}
  if(!quiet){const refs=[f.v.E,...Object.values(f.ov||{}).map(o=>o&&o.E)].filter(x=>!vazio(x));for(const ref of refs){const m=String(ref).trim().toUpperCase().match(/^([A-Z]+)(\d+)/);if(!m)continue;const atual=Math.max(inicioDe(m[1]),(estadoBase.G&&estadoBase.G.cont&&estadoBase.G.cont[m[1]])||0);if(+m[2]>atual+50&&!confirm("A referência "+ref+" salta mais de 50 números em relação à numeração atual. Isso pode alterar as próximas referências automáticas. Continuar?"))return}}
  if(!quiet&&!estadoBase.editId){const chave=x=>String(x||"").trim().replace(/\s+/g," ").toLocaleLowerCase("pt-BR");const igual=S.lanc.find(l=>chave(val(l,"F"))===chave(f.v.F)&&chave(val(l,"H"))===chave(f.v.H));if(igual&&!confirm("Já existe uma peça com a mesma descrição e fornecedor. Lançar mesmo assim?"))return}
  const novo={...clone(f),id:estadoBase.editId||uid()};{const ant=estadoBase.editId&&S.lanc.find(l=>l.id===estadoBase.editId);if(ant&&ant.rf&&prefDe(val(novo,"I")||"",val(novo,"J"))!==prefDe(val(ant,"I")||"",val(ant,"J"))){delete novo.v.E;delete novo.rf}novo.por=(ant&&ant.por)||estadoArmazenamento.AUTOR;if(!novo.por)delete novo.por;novo.em=(ant&&ant.em)||Date.now()}lembrarForn(novo);registrarLivres(novo);
  if(!gradeBy(novo.grade)){novo.grade="";novo.gsel=[]}
  if(!novo.conj){delete novo.comp;delete novo.fConj}
  if(novo.tipo==="pronta"){const bp=bonP(novo);
    if(!bp.length){novo.onP={};if(!novo.conj)novo.banhista="";const ov={};Object.keys(novo.ov||{}).forEach(k=>{if(k==="p"||k.startsWith("p~"))ov[k]=novo.ov[k]});novo.ov=ov;novo.mk=novo.mk&&novo.mk.p?{p:novo.mk.p}:{}}
    if(temGrade(novo)||bp.length)delete novo.v.W;["O","R","S","T","U"].forEach(L=>{if(vazio(novo.v[L]))delete novo.v[L]})}
  else if(novo.mk)delete novo.mk.p;
  /* o Preço de Varejo do formulário só vale para peça pronta simples; numa peça bruta (ou com banhos) ele ficou escondido, vindo da peça anterior, e não pode ir para a planilha */
  if(!estadoBase.editId&&!quiet&&(novo.tipo=="bruta"||bonP(novo).length))delete novo.v.V;
  if(!quiet)estadoLancamento.addTrava=Date.now()+500;
  if(quiet)delete novo.ft;
  if(estadoBase.editId){const i=S.lanc.findIndex(l=>l.id===estadoBase.editId);if(S.lanc[i]&&S.lanc[i].ft!==novo.ft)estadoArmazenamento.ftSalvas.delete(novo.id);S.lanc[i]=novo;estadoBase.editId=null;S.form=estadoBase.rascunho||S.form;estadoBase.rascunho=null;renderTopo();toast("Alteração salva.")}
  else{S.lanc.push(novo);
    /* criar em lote: N peças separadas, cada uma numerada i/N (1 = desligado) */
    {const N=!quiet?Math.max(1,Math.min(200,Math.trunc(num(f.loteN)||1))):1;if(N>1){const lid=uid();novo.lote={id:lid,i:1,n:N};for(let k=2;k<=N;k++){const c=clone(novo);c.id=uid();c.lote={id:lid,i:k,n:N};if(c.v)delete c.v.E;S.lanc.push(c)}f.loteN=""}else if(!quiet)delete novo.lote}
    estadoBase.undo={tipo:"add",id:novo.id,form:clone(f)};
    if(!quiet){f.gsel=[];Object.values(f.ov||{}).forEach(o=>{if(o&&typeof o==="object")delete o.W})}   /* tamanhos e quantidades não passam para a próxima peça */if(novo.ft&&estadoFotos.grande){bancoGravar("fotos",novo.id,estadoFotos.grande).then(r=>{if(r===null)toast("Atenção: não consegui guardar a foto original desta peça (memória do navegador). A miniatura ficou, mas o envio do link pode falhar.");else autoEnviar([novo.id])})}estadoFotos.grande=null;delete f.ft;delete f.v.E;if(!quiet&&continuoCfg().ativo)continuoProxima(f);else if(limpar)limparForm();else if(!quiet){/* Evita reutilizar medidas e compra em nova peça, salvo preferência explícita em Colunas. */
      ["N","P","W"].forEach(L=>{if(!(cfg().colcfg[L]||{}).manter){delete f.v[L];Object.values(f.ov||{}).forEach(o=>{if(o&&typeof o==="object")delete o[L]})}});
      if(!(cfg().colcfg.P||{}).manter)delete f._pAuto;
      if(f.conj&&!(cfg().colcfg.N||{}).manter&&!(cfg().colcfg.P||{}).manter){f.comp=[novaComp(),novaComp()];conjSync(f)}
    }if(!quiet){renderTopo();toast(`Adicionado ${(estadoBase.G.refs[novo.id]||[]).join(" + ")}${estadoBase.G.semQ&&estadoBase.G.semQ[novo.id]?` — ${estadoBase.G.semQ[novo.id]} combinação(ões) sem quantidade ficaram de fora`:""}`,{t:"Desfazer",fn:desfazer})}}
  salvar(false);if(quiet)return true;renderForm();try{primeirosAtualizar()}catch(x){}
  mostrarNoFim(novo.id);
  focarPrimeiro();return true;
}
