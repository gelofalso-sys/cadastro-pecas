/* ===== lançamento (parte de baixo) ===== */
/* campo com o nome da coluna em cima; w = largura (n: número, c: valor, s: curto, m: médio, l: ocupa o resto) */
/* colunas com cadastro prévio: escolher da lista OU digitar livre (como Observação). Categoria nova pede o prefixo; fornecedor e subcategoria digitados entram no cadastro ao adicionar a peça */
const MISTO=new Set(["H","I","J","L","M","AD","AE"]);
function campoHTML(L,f,opt){
  opt=opt||{};const C=cfg(),cc=C.colcfg[L],bid=opt.banho;
  const v=bid?((f.ov[bid]||{})[L]??""):(f.v[L]??"");
  const attr=bid?`data-bo="${bid}" data-k="${L}"`:`data-col="${L}"`,id=bid?`f-${bid}-${L}`:`f-${L}`;
  const lista=listaDe(L,f.v.I),ph=opt.ph!=null?opt.ph:(padraoDe(f.v.I,L)||(!bid&&MISTO.has(L)?"escolha…":""));
  const calc=FORMULA.has(L)?" calc":"";
  let inp;
  inp=`<input id="${id}" ${attr} value="${esc(v)}" class="${NUM.has(L)?"n":""}${calc}${!bid&&MISTO.has(L)?" misto":""}" ${NUM.has(L)?'inputmode="decimal"':""} ${lista.length?`list="dl-${L}"`:""} placeholder="${esc(ph)}" data-ph="${bid?bid+"-":""}${L}" autocomplete="off" ${opt.dis?"disabled":""}>`;
  const w=opt.w||(NUM.has(L)?"n":"m"),mais=opt.q?`<button type="button" class="plus" data-act="q" data-q="${opt.q}"${opt.qb?` data-qb="${opt.qb}"`:""} title="Cadastrar ${esc(opt.qn||NOME[L])}">＋</button>`:"";
  return `<label class="fq w-${w}${cc.obrig?" req":""}" for="${id}" title="${esc(NOME[L])} (coluna ${L})"><span>${esc(opt.nome||NOME[L])}${opt.extra||""}</span><div class="ip">${inp}${mais}</div></label>`;
}
let quick=null,quickB=null,romQRow=null,romQ0=null,quickPre="";
function romQFim(){const f=S.form;if(romQ0){f.v.I=romQ0.I;if(romQ0.J==null)delete f.v.J;else f.v.J=romQ0.J}romQ0=null;romQRow=null}
let MULTI=[];
function painelMulti(){if(!MULTI.length)return "";
  return `<div class="nf multi" id="multiPanel"><b>Várias peças · ${MULTI.length} linha(s) para editar</b><span class="hint">Cada linha vira uma peça com o que está no formulário (categoria, fornecedor, banhos, tamanhos e quantidades). Ajuste as linhas e adicione todas de uma vez.</span>
    <div class="mtw"><table class="mtb"><thead><tr><th>#</th><th>Descrição</th><th>Peso (g)</th><th>Custo de compra</th><th></th></tr></thead><tbody>${MULTI.map((m,i)=>`<tr data-mi="${i}"><td class="hint">${i+1}</td><td><input data-mf="F" value="${esc(m.F)}" placeholder="Descrição" aria-label="Descrição da linha ${i+1}"></td><td><input class="n" data-mf="N" value="${esc(m.N||"")}" inputmode="decimal" aria-label="Peso da linha ${i+1}"></td><td><input class="n" data-mf="P" value="${esc(m.P||"")}" inputmode="decimal" aria-label="Custo de compra da linha ${i+1}"></td><td><button type="button" class="x" data-act="multi-del" data-i="${i}" aria-label="Remover a linha ${i+1}">×</button></td></tr>`).join("")}</tbody></table></div>
    <div class="row"><button type="button" class="btn sm" data-act="multi-mais">＋ Linha</button><button type="button" class="btn pri sm" data-act="multi-ok">Adicionar ${MULTI.length} peça(s)</button><button type="button" class="btn ghost sm" data-act="multi-limpar">Limpar linhas</button></div></div>`}
function painelRapido(){
  const C=cfg(),f=S.form,bh=banhistaBy(f.banhista);if(!quick)return "";
  const cx=(id,rot,w,val,ph)=>`<label class="fq w-${w}"><span>${rot}</span><input id="${id}" value="${esc(val||"")}" placeholder="${esc(ph||"")}" ${w==="n"||w==="c"?'class="n" inputmode="decimal"':""}></label>`;
  let t="",corpo="";
  if(quick==="cat"){t="Nova categoria";corpo=cx("q1","Categoria","m",quickPre)+cx("q2","Prefixo","n","","ex.: CO")+cx("q3","Última peça no sistema","c","","número")}
  if(quick==="sub"){t=`Nova subcategoria em ${esc(f.v.I||"—")}`;corpo=cx("q1","Subcategoria","m",quickPre)}
  if(quick==="forn"){t="Novo fornecedor";corpo=cx("q1","Fornecedor","m",quickPre)+cx("q2","Código do Fornecedor","s")+cx("q3","Desconto %","n","0")+`<label class="fq w-s"><span>Vende peça</span><select id="q4">${opts([["bruta","Bruta (vai banhar)"],["pronta","Pronta (já banhada)"]],f.tipo)}</select></label>`}
  if(quick==="obs"){t="Nova observação";corpo=cx("q1","Observação","l","","Ex.: Link 212 - Xangai Brutos Banho Scarlat 2026 outubro")}
  if(quick==="multi"){t="Várias peças de uma vez";corpo=`<label class="fq w-l" style="flex:1 1 460px"><span>Uma peça por linha: Descrição; Peso; Custo de compra — o resto vem do formulário (categoria, fornecedor, banhos, tamanhos, quantidades…)</span><textarea id="q1" rows="4" placeholder="Brinco gota; 2,1; 3,60&#10;Argola lisa; 1,7; 3,36" style="width:100%;font:13px var(--mono);border:1px solid var(--line);border-radius:6px;padding:6px 8px;background:var(--surface);color:var(--ink)"></textarea></label>`}
  if(quick==="cor"){const bb=quickB&&bh.banhos.find(x=>x.id===quickB);t=bb?`Nova cor · banho ${esc(bb.letra)} (${esc(bb.nome)})`:"Nova cor";corpo=cx("q1","Cor","m")}
  if(quick==="cv"){t=`Nova cor da pedra · ${esc(f.v.I||"")}`;corpo=cx("q1","Cor (várias: use ;)","m","","ex.: Dourado; Rosé; Preto")+cx("q2","Letra na referência (opcional)","n","","ex.: D")+cx("q3","Palavra na descrição","m","","vazio = nome da cor · - = nenhuma")}
  if(quick==="gi"){const gq=gradeBy(f.grade);t=`Novo tamanho${gq?" · "+esc(gq.nome):""}`;corpo=cx("q1","Tamanho (número ou letras)","m","","ex.: 26 · GG · P M G")}
  if(quick==="bn"){const us=bh.banhos.map(x=>x.letra);t=`Nova letra · ${esc(bh.nome)}`;corpo=cx("q1","Banho","s","","ex.: Ródio")+cx("q2","Letra","n",proxLetra(us.concat(letrasDeTamanho())))+`<label class="fq w-s"><span>Cor</span><select id="q3">${opts(C.cores,"")}</select></label>`+cx("q4","Milésimos","n")+cx("q5","R$ por grama","c")+`<label class="fq w-s"><span>Coluna do custo</span><select id="q6">${opts(Object.entries(BANHO_COLS).map(([k,n])=>[k,"Banho de "+n]),"S")}</select></label>`+cx("q7","Texto na Descrição","m","","ex.:  banho ródio")}
  if(quick==="bh"){t="Nova galvânica";corpo=cx("q1","Galvânica","m")+bh.banhos.map((b,i)=>cx("qb"+i,`${esc(b.nome)} R$/g`,"c",b.mult))+cx("qv","Verniz R$/g","c",bh.verniz)}
  return `<div class="nf" data-quick="${quick}"><b>${t}</b>${corpo}<button class="btn pri sm" type="button" data-act="q-salvar">${quick==="multi"?"Criar linhas no formulário":`Salvar <kbd>Enter</kbd>`}</button><button class="btn ghost sm" type="button" data-act="q-fechar">Cancelar</button>${quick==="bh"?'<span class="hint">Os demais dados (letra, cor, milésimos) vêm da galvânica atual; ajuste em Banhos e custos.</span>':""}</div>`;
}
function renderForm(){
  const C=cfg(),f=S.form,bruta=f.tipo==="bruta",cc=C.colcfg,bh=banhistaBy(f.banhista),p=prefDe(f.v.I,f.v.J);
  if(!editId)sincGrade(f);
  const c=(L,o)=>cc[L].form?campoHTML(L,f,o):"";f.mk=f.mk||{};f.vz=f.vz||{};
  const fo=fornBy(f.v.H),auto=bruta&&fo&&fo.banhista===bh.id?` <em class="auto" title="Galvânica definida no cadastro do fornecedor ${esc(fo.nome)}">auto</em>`:"";
  const ultCampo=`<label class="fq w-u" for="ultInp" title="Última peça ${esc(p)} já cadastrada no sistema — a próxima sai com o número seguinte"><span>Última peça ${esc(p)}</span><div class="ub"><input id="ultInp" class="n" inputmode="numeric" value="${esc(C.seqs[p]||"")}"><small title="${inicioDe(p)>ultimo(p)?"Há referência digitada à mão até "+esc(p)+inicioDe(p):""}">próxima ${esc(p)}<b id="proxRef">${proxDe(p)}</b></small></div></label>`;
  const mkIn=k=>`<input class="n" data-mk="${k}" value="${esc(f.mk[k]??"")}" inputmode="decimal" placeholder="${esc(fatorBanho(k)||"×")}" aria-label="Multiplicador">`;
  f.gsel=f.gsel||[];f.csel=f.csel||[];const gr=gradeBy(f.grade),szSel=gr&&!f.semGrade?gr.itens.filter(x=>f.gsel.includes(x.id)):[],gIts=itensGrade(f);
  const chips=gr?`<div class="z-row z-var"><b class="gtit">${esc(gr.nome)}</b><div class="gch${f.semGrade?" off":""}" role="group" aria-label="${esc(gr.nome)}">${gr.itens.map(it=>{const on=f.gsel.includes(it.id);return `<label class="gi${on?" on":""}" title="${esc(it.letra)} · ${esc(efetivo(gr,it).texto.trim())}"><input type="checkbox" data-gi="${it.id}" ${on?"checked":""} ${f.semGrade?"disabled":""}>${esc(it.nome||it.letra)}</label>`}).join("")}<button type="button" class="gi tod" data-act="gi-todos" ${f.semGrade?"disabled":""}>${szSel.length===gr.itens.length?"nenhum":"todos"}</button><button type="button" class="gi tod" data-act="q" data-q="gi" title="Adicionar tamanho novo (número ou letras como P M G) a esta lista" ${f.semGrade?"disabled":""}>＋ tamanho</button><button type="button" class="gi tod" data-act="gi-pmg" title="Cria os tamanhos P, M e G (pequeno, médio, grande): a letra do tamanho entra na referência" ${f.semGrade?"disabled":""}>＋ P M G</button></div><input class="faixa" data-faixa placeholder="faixa: 12-16, 20" title="Digite uma faixa e aperte Enter: 12-16 marca de 12 a 16; 12, 18, 20 marca esses; todos marca tudo" aria-label="Faixa de tamanhos" autocomplete="off"><button type="button" class="btn ghost sm" data-act="faixa-salvar" title="Guarda os tamanhos marcados como padrão desta categoria: ao escolhê-la, eles já vêm marcados">★ padrão</button><label class="sg" title="Peça única, sem tamanhos (ex.: anel ajustável)"><input type="checkbox" data-f="semGrade" ${f.semGrade?"checked":""}> sem variação</label><span class="hint">uma linha por opção · mesma numeração · letras em sequência</span></div>`:(catBy(f.v.I)&&!f.semGrade?`<div class="z-row z-var"><button type="button" class="gi tod" data-act="gr-novo-pmg" title="Cria tamanhos P, M e G para ${esc(f.v.I)}: a letra do tamanho entra na referência (ex.: BR1670P, BR1670M)">＋ Tamanhos P M G em ${esc(f.v.I)}</button>${libGradeSel("data-gusar")}</div>`:"");
  const catF=catBy(f.v.I),lcor=coresDaCat(f.v.I,f.v.J);
  const chipsCorFull=catF?`<div class="z-row z-var"><b class="gtit" title="Cor da pedra ou do detalhe (não é a cor do banho)">Cor da pedra</b>${lcor.length?`<div class="gch" role="group" aria-label="Cores">${lcor.map(x=>{const on=f.csel.includes(x.id);return `<label class="gi${on?" on":""}" title="${esc((x.letra?x.letra+" · ":"")+(x.texto==="-"?"(sem palavra)":(x.texto||x.nome).trim()))}"><input type="checkbox" data-cs="${esc(x.id)}" ${on?"checked":""}>${esc(x.nome)}</label>`}).join("")}<button type="button" class="gi tod" data-act="cs-todas">${f.csel.length===lcor.length?"nenhuma":"todas"}</button></div><button type="button" class="btn ghost sm" data-act="cs-padrao" title="Guarda as cores marcadas como padrão desta categoria: ao escolhê-la, elas já vêm marcadas">★ padrão</button>`:""}<button type="button" class="gi tod" data-act="q" data-q="cv" title="Cria uma cor nova para ${esc(f.v.I)} (a palavra entra na descrição; a letra, se você der uma, entra na referência)">＋ cor</button>${lcor.length?`<span class="hint">uma linha por cor · a palavra da cor entra na descrição${lcor.some(x=>x.letra)?" · a letra da cor entra na referência":""}</span>`:`<span class="hint">opcional: crie as cores da pedra (ex.: Azul, Lilás) e marque as que valem; cada cor vira uma linha com a sua quantidade</span>`}</div>`:"";
  const corAb=f.corOn||f.csel.length>0||lcor.some(x=>!x.lib)||coresPadrao(f.v.I,f.v.J).length>0;
  const chipsCor=!catF?"":corAb?chipsCorFull:`<div class="z-row z-var"><button type="button" class="gi tod" data-act="cor-on" title="Pergunta a cor da pedra ou do detalhe nesta peça: aparecem as cores cadastradas (e dá para criar outras)">＋ Cor da pedra</button></div>`;
  const qtdMatriz=(k,dis)=>{const lin=[],col=[],vl=new Set(),vc=new Set();gIts.forEach(it=>{const a=it.seq[0],c=it.seq[1];if(!vl.has(a.id)){vl.add(a.id);lin.push(a)}if(!vc.has(c.id)){vc.add(c.id);col.push(c)}});
    return `<label class="fq gq all" title="Mesma quantidade em todas as combinações marcadas"><span>todos</span><input class="n" data-qall="${k}" placeholder="=" inputmode="numeric" ${dis?"disabled":""} aria-label="Quantidade para todas as combinações"></label><div class="qmxw"><table class="qmx"><thead><tr><th></th>${col.map(c=>`<th>${esc(c.nome)}</th>`).join("")}</tr></thead><tbody>${lin.map(a=>`<tr><th>${esc(a.nome||a.letra)}</th>${col.map(c=>{const id=a.id+"+"+c.id,o=f.ov[k+"~"+id]||{};return `<td><input class="n" id="f-${k}~${id}-W" data-bo="${k}~${id}" data-k="W" value="${esc(o.W??"")}" inputmode="numeric" placeholder="0" ${dis?"disabled":""} aria-label="Quantidade ${esc(a.nome||a.letra)} ${esc(c.nome)}"></td>`}).join("")}</tr>`).join("")}</tbody></table></div>`};
  const qtdVar=(k,dis)=>gIts.length&&gIts.every(it=>it.seq&&it.seq.length===2)?qtdMatriz(k,dis):(gIts.length>1?`<label class="fq gq all" title="Mesma quantidade em todos os tamanhos marcados"><span>todos</span><input class="n" data-qall="${k}" placeholder="=" inputmode="numeric" ${dis?"disabled":""} aria-label="Quantidade para todos os tamanhos"></label>`:"")+gIts.map(it=>{const o=f.ov[k+"~"+it.id]||{};return `<label class="fq gq" title="Quantidade ${esc(it.nome||it.letra)}"><span>${esc(it.nome||it.letra)}</span><input class="n" id="f-${k}~${it.id}-W" data-bo="${k}~${it.id}" data-k="W" value="${esc(o.W??"")}" inputmode="numeric" placeholder="0" ${dis?"disabled":""} aria-label="Quantidade ${esc(it.nome)}"></label>`}).join("");
  const addBtn=`<button class="btn pri big" type="submit">${editId?"Salvar":"Adicionar"} <kbd>Enter</kbd></button>${editId?"":`<button class="btn big" type="button" data-act="add-limpar" title="Adiciona a peça e esvazia o formulário para começar outra do zero">Adicionar e limpar</button>`}`;
  const bhCampo=`<label class="fq w-m"><span>${bruta?"Galvânica":"Banhos de"}${auto}</span><div class="ip"><select data-f="banhista">${opts(C.banhistas.map(b=>[b.id,b.nome]),bh.id)}</select><button type="button" class="plus" data-act="q" data-q="bh" title="Cadastrar galvânica">＋</button></div></label>`;
  const onF=onDe(f),bpOn=!bruta&&bh.banhos.some(b=>onF[b.id]);
  const cards=bh.banhos.map(b=>{const on=!!onF[b.id],o=f.ov[b.id]||{},vz=vzOn(f,bh,b);return `<div class="bcard${on?"":" off"}">
      <div class="bh2"><label class="ck"><input type="checkbox" data-on="${b.id}" ${on?"checked":""}><span class="dot d-${b.coluna}"></span>${esc(b.letra)} · ${esc(b.nome)}</label>
        ${bruta?`<label class="ck vz" title="Marcado: esta variação de banho leva verniz (Custo do Banho de Verniz = Peso × R$/g da galvânica)"><input type="checkbox" id="vz-${b.id}" data-vz="${b.id}" ${vz?"checked":""} ${on?"":"disabled"}>Verniz</label><small data-cb="${b.id}"></small>`:""}</div>
      ${gIts.length?`<div class="bf gv">${qtdVar(b.id,!on)}</div>`:""}
      <div class="bf">${gIts.length?"":`<label class="fq" title="Quantidade"><span>Quantidade</span><input class="n" id="f-${b.id}-W" data-bo="${b.id}" data-k="W" value="${esc(o.W??"")}" inputmode="numeric" placeholder="0" ${on?"":"disabled"}></label>`}
        ${bruta?`<label class="fq" title="Valor do banho só desta peça (R$ por grama; ou valor fixo se o banho for assim). Vazio = o valor da categoria ${esc(f.v.I||"")} na galvânica"><span>${b.modo==="fixo"?"R$ banho":"R$/g"}</span><input class="n" data-bo="${b.id}" data-k="_m" value="${esc(o._m??"")}" placeholder="${esc(String(multDe(b,f.v.I)||"").replace(".",","))}" inputmode="decimal" ${on?"":"disabled"} aria-label="Valor do banho ${esc(b.nome)} só desta peça"></label>`:""}
        <label class="fq" title="Preço de Varejo = (Custo de Compra + Insumos + Banho + Verniz) × multiplicador"><span>Fator ×</span>${mkIn(b.id)}</label><small class="bfx" data-bf="${b.id}" aria-live="polite"></small>
        <label class="fq pv"><span>Preço de Varejo</span><input class="n calc" id="f-${b.id}-V" data-bo="${b.id}" data-k="V" data-ph="${b.id}-V" value="${esc(o.V??"")}" inputmode="decimal" ${on?"":"disabled"}></label></div></div>`}).join("");
  const vincL=gIts.length?"":`<label class="vchk" title="Mesma peça em outra cor ou pedra: mesmo número, próxima letra"><input type="checkbox" data-f="vinc" ${f.vinc?"checked":""}> Variação da anterior</label>`;
  const simples=!bruta&&!bpOn;
  const ftSlot=(()=>{const ft=S.form.ft&&ftOk(S.form.ft)?S.form.ft:"";
    return ft?`<div class="ftslot has" title="Foto da peça (clique para ampliar)"><img src="${fs(ft)}" alt="Foto da peça" data-act="tab-foto" ${editId?`data-lid="${editId}"`:""}><button type="button" class="ftt" data-act="foto-form" title="Trocar a foto: escolha um arquivo, arraste para cá ou cole com Ctrl+V">trocar</button><button type="button" class="ftx" data-act="foto-rem" title="Tirar a foto desta peça" aria-label="Tirar a foto">×</button></div>`
      :`<button type="button" class="ftslot" data-act="foto-form" title="Foto da peça: clique para escolher, arraste uma foto para cá ou cole com Ctrl+V"><span class="ftic">📷</span><small>foto</small></button>`})();
  const ftRomHtml=(()=>{const r=S.form.ftR&&ftOk(S.form.ftR)?S.form.ftR:"";if(!r||r===S.form.ft)return "";return `<div class="ftslot has ftr" title="Foto que veio do romaneio (fica guardada; a outra é a que gera o link)"><img src="${fs(r)}" alt="Foto do romaneio" data-act="tab-foto"><small>romaneio</small><button type="button" class="ftx" data-act="foto-rem-rom" title="Tirar a foto do romaneio desta peça" aria-label="Tirar a foto do romaneio">×</button></div>`})();
  const rowMain=bruta?`${ftSlot}${ftRomHtml}${c("F",{w:"l"})}${c("N",{w:"n"})}${c("P",{w:"c"})}${bhCampo}`
    :`${ftSlot}${ftRomHtml}${c("F",{w:"l"})}${c("N",{w:"n",dis:!!f.conj,nome:f.conj?"Peso (soma)":undefined})}${c("P",{w:"c",dis:!!f.conj,nome:f.conj?"Compra (soma)":undefined})}${bhCampo}${simples?`${gIts.length?`<div class="bf gv">${qtdVar("p",false)}</div>`:c("W",{w:"n"})}${c("L",{w:"s",q:"cor"})}<label class="fq w-n" title="Fator do preço: o Preço de Varejo = (Custo de Compra + Insumos + Banhos + Verniz) × este número"><span>Fator ×</span><div class="ip">${mkIn("p")}</div></label>${c("V",{w:"c"})}<small class="bfx" data-bf="p" aria-live="polite"></small>${vincL}`:""}`;
  const dica=f.conj?`<span class="hint" style="align-self:center">Conjunto: marque os banhos (Ouro, Prata…) e sai uma linha de conjunto em cada um; todas as peças levam esse banho, menos as que você fixar um banho só delas.</span>`:!bruta&&!bpOn?`<span class="hint" style="align-self:center">Peça pronta com banhos: marque um ou mais para gerar uma linha por cor (A ouro, B prata…); sem marcar, use Cor, Quantidade e Preço acima.</span>`:"";
  const rowBanhos=`<div class="z-row z-banhos">${cards}<button type="button" class="btn ghost sm addl" data-act="q" data-q="bn" title="Cria um banho novo para a galvânica ${esc(bh.nome)} (ex.: C · Ródio, D · Rosé)">＋ Banho de ${esc(bh.nome)}</button>${dica}<span class="z-end">${addBtn}</span></div>`;
const rowOrig=`<div class="z-row z-orig">${c("I",{w:"m",q:"cat",qn:"categoria"})}${c("J",{w:"m",q:"sub",qn:"subcategoria"})}<i class="vsep"></i>${c("H",{w:"m",q:"forn",qn:"fornecedor"})}${c("G",{w:"s"})}<label class="fq w-n"><span>Desc. %</span><div class="ip"><input class="n" data-f="desconto" value="${esc(f.desconto)}" inputmode="decimal"></div></label><i class="vsep"></i>${c("M",{w:"l",q:"obs",qn:"observação"})}</div>`;
  const detBanhos=bh.banhos.filter(b=>onF[b.id]).map(b=>{const vz=vzOn(f,bh,b);return `<div class="lb"><b><span class="dot d-${b.coluna}"></span>${esc(b.letra)} · ${esc(b.nome)}</b>
      ${bruta?campoHTML(b.coluna,f,{banho:b.id,ph:"",w:"c",nome:"Custo do banho"})+campoHTML("U",f,{banho:b.id,ph:"",w:"c",dis:!vz,nome:"Custo do verniz"}):""}${campoHTML("O",f,{banho:b.id,ph:milDe(b,f.v.I),w:"c",nome:"Milésimos"})}${campoHTML("L",f,{banho:b.id,ph:b.cor,w:"s",q:"cor",qb:b.id,qn:"cor do banho "+b.letra})}${campoHTML("F",f,{banho:b.id,ph:"",w:"l",nome:"Descrição da linha"})}</div>`}).join("");
const valores=["Q","Y","AA","AB","AC"].map(L=>c(L,{w:"c"})).join("");
  const cadastro=["E","A","B","C","D","K","X","Z","AD","AE"].map(L=>c(L,{w:"s"})).join("");
  const det=!!abertos.det;
  let h=`<form class="lanc${editId?" editing":""}${abertos.min&&!f.conj?" mini":""}" id="form" autocomplete="off">
  <div class="mfh"><b>${editId?"Editando peça":"Lançar peça"}</b>${editId?"":`<span class="mfp">próxima ${esc(p)}${fnum(p,proxDe(p))}</span>`}<button type="button" class="btn sm" data-act="form-alt" title="Muda a altura da gaveta: mais tabela ou mais formulário" aria-label="Mudar a altura do formulário">⇕</button><button type="button" class="btn sm pri" data-act="form-fechar" title="Esconde o formulário e volta a ver a tabela inteira">▾ Esconder</button></div>
  <div class="fbar">
    <h2>${editId?"Editando":"Lançar peça"}</h2>${editId?"":`<span class="prox" id="proxBig" title="Número que a próxima peça adicionada vai receber (já conta o que está na lista)">Próxima referência <b>${esc(p)}${fnum(p,proxDe(p))}</b></span>`}
    ${editId&&f.excl&&f.excl.length?`<div class="hint">${f.excl.length} linha(s) desta peça foram excluídas da tabela. <button type="button" class="btn sm" data-act="excl-volta">Trazer de volta</button></div>`:""}
    <div class="seg" role="group" aria-label="Tipo de peça"><button type="button" data-tipo="bruta" aria-pressed="${bruta}" title="Peça ainda sem banho: vai para a galvânica antes de ser vendida">Bruta (vai banhar)</button><button type="button" data-tipo="pronta" aria-pressed="${!bruta&&!f.conj}">Pronta</button><button type="button" data-tipo="conjunto" aria-pressed="${!!f.conj}" title="Peça que é a soma de outras (brincos + colar…): cada uma com seu banho, tudo numa linha só">Conjunto</button></div>
    <div class="gera" id="gera"></div>
    <div id="custos"></div>
    ${editId?"":`<button type="button" class="btn sm fextra-tog" data-act="form-extras" aria-expanded="false">Mais opções de lançamento</button>`}
    ${editId?`<button class="btn sm" type="button" data-act="cancel">Cancelar <kbd>Esc</kbd></button>`:`<button class="btn sm" type="button" data-act="repetir" title="Copia a última peça lançada para o formulário (nova referência ao adicionar)">Repetir última</button><button class="btn sm" type="button" data-act="q" data-q="multi" title="Colar ou digitar várias peças, uma por linha">Várias linhas</button><button class="btn sm" type="button" data-act="rom-abrir" title="Colar a lista (romaneio) do fornecedor: o sistema lê as peças e você só digita peso e divisão">${romTem?"Retomar romaneio"+(romInfo?` (${esc(romInfo)})`:""):"Colar romaneio"}</button><label class="btn sm" style="cursor:pointer" title="Para quem não usa romaneio: escolha ou arraste o PDF (DANFE) ou o XML da nota fiscal. O sistema lê os itens e você confere antes de lançar.">Importar nota fiscal (PDF/XML)<input type="file" id="nfFile" accept=".pdf,.xml,application/pdf,text/xml,application/xml" class="vh"></label>${ROMS.length?`<button class="btn sm" type="button" data-act="rom-lista" title="Todos os romaneios já colados, com fotos e quantidades: abra para lançar o que faltou ou corrigir">Romaneios salvos (${ROMS.length})</button>`:""}${relTem?`<button class="btn sm" type="button" data-act="rel-abrir" title="Abre o relatório do último romaneio lançado">Último relatório</button>`:""}<button class="btn sm" type="button" data-act="limpar" title="Esvazia Descrição, Peso, Custo e quantidades (o que está marcado como “Fica guardado” em Colunas continua)">Limpar campos</button>`}

    <span class="zm" role="group" aria-label="Tamanho do formulário"><button type="button" class="btn sm" data-act="zoom" data-z="f" data-d="-1" title="Diminuir o formulário" aria-label="Diminuir o formulário">−</button><button type="button" class="btn sm zv" data-act="zoom" data-z="f" data-d="0" id="zvF" title="Voltar ao tamanho normal" aria-label="Tamanho normal do formulário">${Math.round(ZM.f*100)}%</button><button type="button" class="btn sm" data-act="zoom" data-z="f" data-d="1" title="Aumentar o formulário" aria-label="Aumentar o formulário">+</button></span>
    <button type="button" class="tg min" data-act="tg-min"title="${abertos.min?"Mostrar tudo":"Mostrar só o essencial"}">${abertos.min?"▴ Mostrar tudo":"▾ Só o essencial"}</button>
  </div>
  ${rowOrig}
  ${painelRapido()}${painelMulti()}
  <div class="z-row z-main">${rowMain}</div>
  ${f.conj?conjPainel(f):""}
  ${chips}${chipsCor}${rowBanhos}
  <div class="z-det"><button type="button" class="tg" data-act="tg-det" aria-expanded="${det}">${det?"▾":"▸"} Detalhes <span class="hint">— ${bruta?"verniz, custo e milésimos de cada banho, ":""}Custo de Insumos, NCM, CFOP, ID, Foto, Código de Barras, Tamanho, Localização…</span></button>
  ${det?`<div class="dets">
    ${(bruta||bpOn)?`<div class="dg wide"><h3>Banhos · ${esc(bh.nome)}${auto}</h3>${detBanhos||'<span class="hint">Marque um banho.</span>'}</div>`:""}
    <div class="dg"><h3>Valores e impostos</h3><div class="dgrid">${valores}</div></div>
    <div class="dg"><h3>Cadastro</h3><div class="dgrid">${cadastro}</div></div>
  </div>`:""}</div>
  </form>`;
  document.getElementById("formWrap").innerHTML=h;
  atualizarGera();{const fm=document.getElementById("form");if(roForm)roForm.observe(fm);fm.classList.toggle("auto-mini",foraDaPlanilha&&!S.form.conj)}ajustarAltura();
  if(quick){const i=document.getElementById("q1");if(i)i.focus()}
}
/* tamanhos com letra: P, M, G (ou Pequeno, Médio, Grande) entram na referência com a própria letra; números seguem a sequência de letras */
const PMG={pequeno:"P",pequena:"P",medio:"M","médio":"M",media:"M","média":"M",grande:"G"};
function dividirTamanhos(texto){const simples=t=>PMG[t.toLowerCase()]||/^(\d+([.,]\d+)?|(?!cm$|mm$)[A-Za-z]{1,3})$/i.test(t);
  return String(texto).replace(/(\d),(?=\d)/g,"$1\u0001").split(/[;,\/\n]+/).map(x=>x.replace(/\u0001/g,",").trim()).filter(Boolean).flatMap(x=>{const w=x.split(/\s+/);return w.length>1&&w.every(simples)?w:[x]})}
function addTamanhos(gr,texto){const ids=[];
  dividirTamanhos(texto).forEach(tk=>{
    const sem=tk.toLowerCase(),letraPMG=PMG[sem]||(/^[A-Za-z]{1,3}$/.test(tk)?tk.toUpperCase():""),nome=PMG[sem]||tk;
    let it=gr.itens.find(x=>String(x.nome).toLowerCase()===nome.toLowerCase());
    if(!it){const letra=letraPMG&&!gr.itens.some(x=>String(x.letra).toUpperCase()===letraPMG)?letraPMG:proxLetra(gr.itens.map(x=>x.letra));it={id:uid(),letra,nome};gr.itens.push(it)}
    ids.push(it.id)});return ids}
function letrasDeTamanho(){return todasGrades().flatMap(g=>g.itens.filter(x=>String(x.letra||"").toUpperCase()===String(x.nome||"").toUpperCase()).map(x=>String(x.letra).toUpperCase()))}
function salvarRapido(){
  const C=cfg(),f=S.form,g=id=>{const e=document.getElementById(id);return e?e.value.trim():""},n=g("q1"),lo=s=>s.toLowerCase();
  if(!n){document.getElementById("q1").focus();return}const rq=romQRow;if(rq!=null&&ROM&&ROM.rows[rq])romArma(ROM.rows[rq]);
  if(quick==="multi"){const linhas=n.split(String.fromCharCode(10)).map(x=>x.trim()).filter(Boolean);
    linhas.forEach(ln=>{const q=ln.split(/[;\t]/).map(x=>x.trim());MULTI.push({F:q[0]||"",N:q[1]||"",P:q[2]||""})});
    quick=null;renderForm();toast(`${linhas.length} linha(s) no formulário: ajuste o que precisar e clique em “Adicionar”.`);
    {const pn=document.getElementById("multiPanel");if(pn)rolarPane(pn)}return}
  if(quick==="cat"){let c=C.categorias.find(x=>lo(x.nome)===lo(n));const pr=c&&c.prefixo?String(c.prefixo).toUpperCase():semAc(g("q2")||n.slice(0,2)).toUpperCase().replace(/[^A-Z]/g,"");
    if(!c){const er=nomeCatErro(C,n,null);if(er){toast(er);document.getElementById("q1").focus();return}}
    if(!c&&!pr){toast("Informe o prefixo da categoria (só letras, ex.: BR).");{const e2=document.getElementById("q2");if(e2)e2.focus()}return}
    if(!c){c={nome:n,prefixo:pr,subs:[]};C.categorias.push(c)}
    /* contador: prefixo novo começa onde foi pedido; prefixo que já existe só pode SUBIR (nunca volta atrás, senão repete referência já exportada) */
    {const q3=g("q3").replace(/\D/g,"");if(!(pr in C.seqs))C.seqs[pr]=q3||"0";else if(q3&&!(ultimo(pr)>=+q3))C.seqs[pr]=q3}
    f.v.I=c.nome;delete f.v.J;sincGrade(f)}
  if(quick==="sub"){const c=catBy(f.v.I);if(c&&!c.subs.includes(n))c.subs.push(n);f.v.J=n;sincGrade(f)}
  if(quick==="forn"){let fo=C.fornecedores.find(x=>lo(x.nome)===lo(n));if(!fo){fo={nome:n,codigo:g("q2"),desconto:String(Math.min(100,Math.max(0,num(g("q3"))||0))),tipo:document.getElementById("q4").value};C.fornecedores.push(fo)}
    if(rq!=null&&ROM&&ROM.rows[rq]){ROM.rows[rq].forn=fo.nome;romReset(ROM.rows[rq])}else{f.v.H=fo.nome;f.desconto=fo.desconto||"0";if(fo.codigo)f.v.G=fo.codigo;if(!editId)banhistaDoFornecedor(f)}}
  if(quick==="obs"){if(!C.observacoes.includes(n))C.observacoes.unshift(n);f.v.M=n}
  if(quick==="cor"){if(!C.cores.includes(n))C.cores.push(n);if(quickB){f.ov=f.ov||{};f.ov[quickB]=f.ov[quickB]||{};f.ov[quickB].L=n}else f.v.L=n}
  if(quick==="cv"){const tgt=rq!=null&&ROM&&ROM.rows[rq]?ROM.rows[rq]:f;tgt.csel=tgt.csel||[];const L=partir(n),lt=L.length===1?g("q2").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,2):"";
    const M=C.coresMeta=C.coresMeta||{},sg=libSiglas();
    if(lt&&C.cores.some(y=>corKey(y)!==corKey(L[0])&&sg[corKey(y)]===lt)){toast("Essa sigla já é de outra cor.");document.getElementById("q2").focus();return}
    L.forEach(nm=>{if(!C.cores.some(y=>corKey(y)===corKey(nm)))C.cores.push(nm);const k=corKey(nm);M[k]=M[k]||{};M[k].ped=true;if(L.length===1){if(lt)M[k].sig=lt;if(g("q3"))M[k].txt=g("q3")}const id=idsCoresBiblioteca()[k];if(!tgt.csel.includes(id))tgt.csel.push(id)});tgt.corOn=true}
  if(quick==="gi"){const gr=rq!=null?gradeDaCat(f.v.I,f.v.J):gradeBy(f.grade);if(gr){const novos=addTamanhos(gr,n);if(rq!=null&&ROM&&ROM.rows[rq]){const r0=ROM.rows[rq];r0.gsel=gr.itens.map(x=>x.id).filter(id=>novos.includes(id)||(r0.gsel||[]).includes(id));r0.semG=false}else{f.gsel=gr.itens.map(x=>x.id).filter(id=>novos.includes(id)||(f.gsel||[]).includes(id));f.semGrade=false}}else if(rq!=null&&catBy(f.v.I)){const c0=catBy(f.v.I);c0.grade={id:uid(),nome:"Tamanhos",rotulo:" tamanho ",col:"K",subs:[],itens:[]};const nv=addTamanhos(c0.grade,n);if(ROM&&ROM.rows[rq]){ROM.rows[rq].gsel=nv.slice();ROM.rows[rq].semG=false}}}
  if(quick==="bn"){const bh=banhistaBy(f.banhista),L=(g("q2")||proxLetra(bh.banhos.map(x=>x.letra).concat(letrasDeTamanho()))).toUpperCase(),id=uid();
    bh.banhos.push({id,nome:n,letra:L,cor:document.getElementById("q3").value||n,mil:g("q4"),modo:"peso",mult:g("q5"),coluna:document.getElementById("q6").value,sufixo:document.getElementById("q7").value||(" banho "+n.toLowerCase()),marcado:false,vz:true});f.on[id]=true}
  if(quick==="bh"){const base=banhistaBy(f.banhista),nb=clone(base);nb.id=uid();nb.nome=n;nb.verniz=g("qv")||base.verniz;nb.banhos.forEach((b,i)=>{const v=g("qb"+i);if(v)b.mult=v});
    C.banhistas.push(nb);f.banhista=nb.id;marcadosPadrao(f);f.ov={}}
  if(ROM){if(rq!=null&&ROM.rows[rq]&&(quick==="cat"||quick==="sub")){const r=ROM.rows[rq];if(quick==="cat"){r.cat=f.v.I;r.sub="";r.catq=false;romNovaCat(r)}else{r.sub=f.v.J||n}}
    if(quick==="bh")ROM.rows.forEach(r=>{if(r.feito)return;r.on={};r.bo={};r.vz={};r.mk={}})}
  romQFim();
  const nome=n;quick=null;salvar(true);renderListas();renderTopo();renderForm();renderCfg();toast(`“${nome}” cadastrado.`);if(ROM)renderRom();else refocar("#f-F");
}
function previsao(){const fake={...clone(S.form),id:editId||"__p"},list=editId?S.lanc.map(l=>l.id===editId?fake:l):[...S.lanc,fake];return gerar(list)}
/* digitou o Preço de Varejo à mão: o Fator × passa a ser o que dá esse preço (preço ÷ soma dos custos) */
function fatorDoPreco(k){
  const f=S.form,pronta=k==="p",id=editId||"__p";f.mk=f.mk||{};f.ov=f.ov||{};
  const vOld=pronta?f.v.V:(f.ov[k]||{}).V;if(vazio(vOld))return;const alvo=num(vOld);if(alvo==null||alvo<0)return;
  const mkOld=f.mk[k];let base=null;
  try{if(pronta)delete f.v.V;else delete f.ov[k].V;f.mk[k]="1";
    const g=previsao(),ri=g.linhas.findIndex(r=>r.lancId===id&&(r.bid||r.key)===k);
    if(ri>=0){const x=celulas(g.linhas[ri],ri+2,true)[LET.indexOf("V")];if(x&&typeof x.v==="number")base=x.v}}
  finally{if(mkOld==null)delete f.mk[k];else f.mk[k]=mkOld;if(pronta)f.v.V=vOld;else f.ov[k].V=vOld}
  if(!(base>0)){toast("Para o fator ser calculado, informe antes o peso e os custos.");return}
  const fator=Math.round(alvo/base*10000)/10000,txt=String(fator).replace(".",",");
  f.mk[k]=txt;const mi=document.querySelector(`#form [data-mk="${k}"]`);if(mi)mi.value=txt;
  atualizarGera();salvar(false);
}
