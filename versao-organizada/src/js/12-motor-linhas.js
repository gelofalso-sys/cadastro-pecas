/* ===== motor: lançamentos -> linhas ===== */
/* a referência de cada peça fica FIXA depois de lançada (excluir ou trocar a categoria de outra peça não renumera as demais); "Renumerar" refaz na ordem */
function fixarRefs(){if(!S.lanc.some(l=>l&&l.v&&vazio(l.v.E)&&!(l.tipo==="pronta"&&l.vinc)))return false;const g=gerar(S.lanc);let ch=false;
  S.lanc.forEach(l=>{if(!l||!l.v||!vazio(l.v.E)||(l.tipo==="pronta"&&l.vinc))return;const rw=g.linhas.find(x=>x.lancId===l.id);if(!rw)return;const E=String(rw.v.E||""),pt=String(rw.part||""),b=pt&&E.endsWith(pt)?E.slice(0,E.length-pt.length):E;if(b){l.v.E=b;l.rf=1;ch=true}});return ch}
function renumerarRefs(){S.lanc.forEach(l=>{if(l&&l.rf&&l.v){delete l.v.E;delete l.rf}});fixarRefs()}
function gerar(list){
  list=list||S.lanc;list.forEach(l=>{if(l&&l.conj&&Array.isArray(l.comp)&&(l.cjSnap===undefined||l.cjSnap===conjSnap(l))){try{conjSync(l)}catch(e){}}});   /* conjunto lançado acompanha o cadastro de galvânicas (a menos que alguém tenha digitado o custo na planilha) */
  const C=cfg(),cont={},usados={},linhas=[],refs={},semQ={};
  /* referências digitadas à mão (no lançamento, coladas ou digitadas na planilha): a numeração automática continua depois da maior */
  const manual={},manualReal={};let curI=0;const addM=(x,i,rf)=>{const m=String(x||"").replace(/\s+/g,"").toUpperCase().match(/^([A-Z]+)(\d+)/);if(!m)return;const u=(usados[m[1]]=usados[m[1]]||new Map());if(!u.has(+m[2])||u.get(+m[2])>i)u.set(+m[2],i);manual[m[1]]=Math.max(manual[m[1]]||0,+m[2]);if(!rf)manualReal[m[1]]=Math.max(manualReal[m[1]]||0,+m[2])};
  list.forEach((l,i)=>{if(!vazio(l.v.E))addM(l.v.E,i,!!l.rf);Object.values(l.ov||{}).forEach(o=>{if(o&&typeof o==="object")addM(o.E,i)})});
  /* uma referência digitada só "reserva" o número para as peças lançadas depois dela; a peça antiga não é empurrada (se coincidir, aparece como repetida) */
  const next=p=>{if(!(p in cont))cont[p]=ultimo(p);do{cont[p]++}while(usados[p]&&usados[p].has(cont[p])&&usados[p].get(cont[p])<=curI);return cont[p]};
  const cats=[null];
  const aplicaOv=(row,l)=>{row.ovs=[];const ov=l.ov||{},put=(o,pai)=>{if(o&&typeof o==="object")Object.keys(o).forEach(L=>{if(L[0]==="_")return;if(FORMULA.has(L)&&vazio(o[L]))return;if(pai&&(L==="W"||L==="E"))return;row.v[L]=o[L];if(!(l.conj&&CJ_COL.includes(L))&&!row.ovs.includes(L))row.ovs.push(L)})};
    if(row.bid&&row.key!==row.bid)put(ov[row.bid],true);row.v0={...row.v};put(ov[row.key],false);return row};
  cats.forEach(cat=>{
    const its=list,grupos=[];
    its.forEach((l,i)=>{const pv=its[i-1];if(l.tipo==="pronta"&&l.vinc&&!temGrade(l)&&!bonP(l).length&&pv&&pv.tipo==="pronta"&&!temGrade(pv)&&!bonP(pv).length&&prefDe(val(l,"I")||"",val(l,"J"))===prefDe(val(pv,"I")||"",val(pv,"J")))grupos[grupos.length-1].push(l);else grupos.push([l])});
    const baldes={},seq=[],prontas=[];
    grupos.forEach(g=>{
      curI=list.indexOf(g[0]);const ov=String(g[0].v.E||"").replace(/\s+/g,"").toUpperCase(),p=prefDe(val(g[0],"I")||"",val(g[0],"J"));
      const base=ov?ov.replace(/(\d)[A-Z]$/,"$1"):p+fnum(p,next(p));
      /* referência digitada à mão (no lançamento ou na célula): só as peças lançadas depois dela continuam a partir daí; as anteriores mantêm o número */
      {if(!(p in cont))cont[p]=ultimo(p);g.forEach(l2=>{[l2.v.E,...Object.values(l2.ov||{}).map(o=>o&&typeof o==="object"?o.E:"")].forEach(x=>{const m=String(x||"").trim().toUpperCase().match(/^([A-Z]+)([0-9]+)/);if(m&&m[1]===p&&+m[2]>cont[p])cont[p]=+m[2]})})}
      g.forEach((l,k)=>{
        const cat=val(l,"I")||"";const comum={};LET.forEach(L=>comum[L]=val(l,L));comum.I=cat;{const cj=catBy(cat);if(cj&&cj.subSoRef&&cj.subSoRef[comum.J])comum.J=""}
        const meta={lancId:l.id,desconto:num(l.desconto)||0,lote:l.lote||null},mk=l.mk||{};
        if(l.tipo==="bruta"){
          const bh=bhDe(l);refs[l.id]=[];
          const vars=itensGrade(l),bon=bh.banhos.filter(b=>l.on&&l.on[b.id]),qv=k=>qtdPos(((l.ov||{})[k]||{}).W);let kk=0;
          /* com variação: se alguma combinação tem quantidade, as que ficaram sem quantidade não viram linha */
          const soComQ=vars.length&&bon.some(b=>vars.some(it=>qv(b.id+"~"+it.id)));
          bh.banhos.forEach((b,i)=>{
            if(!(l.on&&l.on[b.id]))return;
            (vars.length?vars:[null]).forEach(it=>{
              if(it&&soComQ&&!qv(b.id+"~"+it.id)){semQ[l.id]=(semQ[l.id]||0)+1;return}
              const letra=refParte(b,it);kk++;
              const v={...comum,E:base+letra,F:descVar(descBanho(l,b,i),it),L:b.cor,O:milDe(b,cat),W:""};["R","S","T"].forEach(c=>v[c]="");
              if(it&&it.col&&!vazio(it.valor))v[it.col]=it.valor;if(it&&it.extra)Object.assign(v,it.extra);
              const semCalc=banhoSemCalc(b);   /* banho sem cálculo (ex.: Prata 925): só marca a linha; sem custo de banho nem verniz */
              const row=aplicaOv({...meta,mk:(num(mk[b.id])||num(b.fator)||null),key:it?b.id+"~"+it.id:b.id,bid:b.id,gi:it?it.id:null,part:letra,col:b.coluna||"",v,...(semCalc?{}:{banho:{coluna:b.coluna,modo:b.modo||"peso",mult:num(multItem(l,b,cat))},verniz:vzOn(l,bh,b)?num(bh.verniz):null})},l);
              refs[l.id].push(row.v.E);
              if(C.ordem==="ab")(baldes[i]=baldes[i]||[]).push(row);else seq.push(row);
            });
          });
        }else{
          const vars=itensGrade(l),bp=bonP(l);
          if(bp.length){const bh=bhDe(l),qvk=k=>qtdPos(((l.ov||{})[k]||{}).W),soComQ=vars.length&&bp.some(b=>vars.some(it=>qvk(b.id+"~"+it.id)));let kk=0;refs[l.id]=[];
            bh.banhos.forEach((b,i)=>{if(!bp.includes(b))return;(vars.length?vars:[null]).forEach(it=>{if(it&&soComQ&&!qvk(b.id+"~"+it.id)){semQ[l.id]=(semQ[l.id]||0)+1;return}
              const letra=refParte(b,it);kk++;
              const v={...comum,E:base+letra,F:descVar(descBanho(l,b,i),it),L:b.cor,O:milDe(b,cat),W:""};if(it&&it.col&&!vazio(it.valor))v[it.col]=it.valor;if(it&&it.extra)Object.assign(v,it.extra);
              const row=aplicaOv({...meta,mk:(num(mk[b.id])||num(b.fator)||null),key:it?b.id+"~"+it.id:b.id,bid:b.id,gi:it?it.id:null,part:letra,col:b.coluna,v},l);refs[l.id].push(row.v.E);
              if(C.ordem==="ab")(baldes[i]=baldes[i]||[]).push(row);else seq.push(row)})});return}
          if(vars.length){refs[l.id]=[];const qv=k=>qtdPos(((l.ov||{})[k]||{}).W),soComQ=vars.some(it=>qv("p~"+it.id));vars.forEach(it=>{if(soComQ&&!qv("p~"+it.id)){semQ[l.id]=(semQ[l.id]||0)+1;return}const v={...comum,E:base+refParte(null,it),F:descVar(comSufixoCat(comum.F,cat,l.semSufixoCat),it),W:""};if(it.col&&!vazio(it.valor))v[it.col]=it.valor;if(it.extra)Object.assign(v,it.extra);
            const row=aplicaOv({...meta,mk:num(mk.p),key:"p~"+it.id,bid:"p",gi:it.id,part:refParte(null,it),v},l);refs[l.id].push(row.v.E);if(C.ordem==="ab")prontas.push(row);else seq.push(row)});return}
          const ref=ov&&g.length===1?ov:base+(g.length>1?letraN(k):"");
          const row=aplicaOv({...meta,mk:num(mk.p),key:"p",part:"",v:{...comum,E:ref,F:comSufixoCat(comum.F,cat,l.semSufixoCat)}},l);
          refs[l.id]=[row.v.E];
          if(C.ordem==="ab")prontas.push(row);else seq.push(row);
        }
      });
    });
    Object.keys(baldes).sort((a,b)=>a-b).forEach(k=>linhas.push(...baldes[k]));
    linhas.push(...seq,...prontas);
  });
  {const ex={};list.forEach(l=>{if(l.excl&&l.excl.length)ex[l.id]=new Set(l.excl)});
    if(Object.keys(ex).length)for(let i=linhas.length-1;i>=0;i--){const r=linhas[i];if(ex[r.lancId]&&ex[r.lancId].has(r.key)){const a=refs[r.lancId];if(a){const j=a.indexOf(r.v.E);if(j>=0)a.splice(j,1)}linhas.splice(i,1)}}}
  const conta={};linhas.forEach(r=>{const k=String(r.v.E||"").toUpperCase();conta[k]=(conta[k]||0)+1});
  linhas.forEach(r=>r.dup=conta[String(r.v.E||"").toUpperCase()]>1);
  return {linhas,refs,cont,manual,manualReal,semQ};
}
/* validação de número digitado/colado: sem texto, sem negativo; Quantidade = inteiro de 1 em diante */
/* fórmula aceita: só números, células (ex.: P2, AB10), + - * / e parênteses — nenhum nome de função (=RAND(), =HYPERLINK(...) etc.) */
/* quantidade da variação: número maior que zero, ou fórmula (ex.: =1) — a fórmula não pode fazer a linha sumir da exportação */
   /* teto de quantidade por linha */
function marcaRuim(ri,L){const td=document.querySelector(`#sheet tr[data-ri="${ri}"] td[data-c="${L}"]`);if(!td)return;td.style.outline="2px solid #c0392b";td.style.background="#fdecea";setTimeout(()=>{td.style.outline="";td.style.background=""},3000)}
/* "=" só vira fórmula em coluna numérica e com caracteres seguros; em texto (descrição, código…) vale como texto, nunca como fórmula do Excel */
/* avalia uma fórmula segura (números, células, + - * / e parênteses) sem eval/Function (o cabeçalho de segurança do Netlify não permite);
   get(coluna) dá o número da célula referenciada. A linha da referência não conta: vale a própria linha — por isso a exportação reescreve as referências para a linha real */
/* a fórmula está escrita corretamente? (confere só a forma, com as células valendo 1) */
/* número de um valor digitado na linha: aceita fórmula (=2*3, =N2*2) e calcula; rv são os valores digitados da linha */
/* desc = desconto do fornecedor (%): a referência ao custo (P) vale a compra JÁ com desconto, o mesmo número da célula calculada e do arquivo */
/* valor calculado de uma coluna de banho (sem digitação) */
const modeloAtual=()=>{const C=cfg();return (C.modelos||[]).find(x=>x.id===C.modelo)||C.modelos[0]};
const colunasExport=()=>modeloAtual().cols.filter(c=>c.on!==false);
const nomeTela=L=>{const c=modeloAtual().cols.find(x=>x.on!==false&&x.k===L);return c?c.h:NOME[L]};
