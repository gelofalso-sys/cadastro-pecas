/* ===== motor: lançamentos -> linhas ===== */
function gerar(list){
  list=list||S.lanc;list.forEach(l=>{if(l&&l.conj&&Array.isArray(l.comp)&&(l.cjSnap===undefined||l.cjSnap===conjSnap(l))){try{conjSync(l)}catch(e){}}});   /* conjunto lançado acompanha o cadastro de galvânicas (a menos que alguém tenha digitado o custo na planilha) */
  const C=cfg(),cont={},usados={},linhas=[],refs={},semQ={};
  /* referências digitadas à mão (no lançamento, coladas ou digitadas na planilha): a numeração automática continua depois da maior */
  const manual={};let curI=0;const addM=(x,i)=>{const m=String(x||"").replace(/\s+/g,"").toUpperCase().match(/^([A-Z]+)(\d+)/);if(!m)return;const u=(usados[m[1]]=usados[m[1]]||new Map());if(!u.has(+m[2])||u.get(+m[2])>i)u.set(+m[2],i);manual[m[1]]=Math.max(manual[m[1]]||0,+m[2])};
  list.forEach((l,i)=>{if(!vazio(l.v.E))addM(l.v.E,i);Object.values(l.ov||{}).forEach(o=>{if(o&&typeof o==="object")addM(o.E,i)})});
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
        const meta={lancId:l.id,desconto:num(l.desconto)||0},mk=l.mk||{};
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
              const row=aplicaOv({...meta,mk:(num(mk[b.id])||num(b.fator)||null),key:it?b.id+"~"+it.id:b.id,bid:b.id,gi:it?it.id:null,part:letra,col:b.coluna,v,banho:{coluna:b.coluna,modo:b.modo||"peso",mult:num(multItem(l,b,cat))},verniz:vzOn(l,bh,b)?num(bh.verniz):null},l);
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
          if(vars.length){refs[l.id]=[];const qv=k=>qtdPos(((l.ov||{})[k]||{}).W),soComQ=vars.some(it=>qv("p~"+it.id));vars.forEach(it=>{if(soComQ&&!qv("p~"+it.id)){semQ[l.id]=(semQ[l.id]||0)+1;return}const v={...comum,E:base+refParte(null,it),F:descVar(comSufixoCat(comum.F,cat),it),W:""};if(it.col&&!vazio(it.valor))v[it.col]=it.valor;if(it.extra)Object.assign(v,it.extra);
            const row=aplicaOv({...meta,mk:num(mk.p),key:"p~"+it.id,bid:"p",gi:it.id,part:refParte(null,it),v},l);refs[l.id].push(row.v.E);if(C.ordem==="ab")prontas.push(row);else seq.push(row)});return}
          const ref=ov&&g.length===1?ov:base+(g.length>1?letraN(k):"");
          const row=aplicaOv({...meta,mk:num(mk.p),key:"p",part:"",v:{...comum,E:ref,F:comSufixoCat(comum.F,cat)}},l);
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
  return {linhas,refs,cont,manual,semQ};
}
/* validação de número digitado/colado: sem texto, sem negativo; Quantidade = inteiro de 1 em diante */
const VALIDA_NUM=new Set(["N","O","P","Q","R","S","T","U","V","W","AB","AC"]);
/* fórmula aceita: só números, células (ex.: P2, AB10), + - * / e parênteses — nenhum nome de função (=RAND(), =HYPERLINK(...) etc.) */
const FORM_SEGURA=/^=(?:[0-9+\-*\/().,\s]|\b[A-Za-z]{1,2}[0-9]+\b)*$/;
/* quantidade da variação: número maior que zero, ou fórmula (ex.: =1) — a fórmula não pode fazer a linha sumir da exportação */
const QTD_MAX=1e7;   /* teto de quantidade por linha */
function qtdPos(v,rv,desc){const t=String(v==null?"":v).trim();if(t[0]==="="){if(t.length<=1)return false;if(!rv)return true;const n=numRaw(t,rv,0,desc);return n!=null&&Number.isInteger(n)&&n>=1&&n<=QTD_MAX}const q=num(t);return q>0&&q<=QTD_MAX&&Number.isInteger(q)}
function checaCel(L,v){
  v=String(v==null?"":v).trim();if(v==="")return {v};
  if(!VALIDA_NUM.has(L))return {v};
  if(v[0]==="="){if(!(FORM_SEGURA.test(v)&&sintaxeF(v.slice(1))))return {erro:`${NOME[L]}: fórmula não aceita (só números, células e + - * / ( ))`};
    {const rf=[...v.matchAll(/\b([A-Za-z]{1,2})[0-9]+\b/g)].map(m=>m[1].toUpperCase());
      if(rf.some(a=>!LET.includes(a)))return {erro:`${NOME[L]}: a fórmula cita uma coluna que não existe — “${v.slice(0,20)}”`};
      if(rf.includes(L))return {erro:`${NOME[L]}: a fórmula não pode citar a própria coluna (referência circular) — “${v.slice(0,20)}”`}}
    if(!/\b[A-Za-z]{1,2}[0-9]+\b/.test(v)){const n=avalF(v.slice(1),()=>null);
      if(n==null)return {erro:`${NOME[L]}: a fórmula não dá um número (divisão por zero?) — “${v.slice(0,20)}”`};
      if(n<0)return {erro:`${NOME[L]} não pode ser negativo — “${v.slice(0,20)}”`};
      if(n>1e9)return {erro:`${NOME[L]}: valor grande demais — “${v.slice(0,20)}”`};
      if(L==="W"&&(!Number.isInteger(n)||n<1||n>QTD_MAX))return {erro:`Quantidade precisa ser um número inteiro de 1 a 10.000.000 — “${v.slice(0,20)}” não vale`}}
    return {v}}
  const n=num(v);
  if(n==null)return {erro:`${NOME[L]} precisa ser um número — “${v.slice(0,20)}” não vale`};
  if(n<0)return {erro:`${NOME[L]} não pode ser negativo — “${v}”`};
  if(n>1e9)return {erro:`${NOME[L]}: valor grande demais — “${v.slice(0,20)}”`};
  if(L==="W"&&(!Number.isInteger(n)||n<1||n>QTD_MAX))return {erro:`Quantidade precisa ser um número inteiro de 1 a 10.000.000 — “${v}” não vale`};
  return {v};
}
function marcaRuim(ri,L){const td=document.querySelector(`#sheet tr[data-ri="${ri}"] td[data-c="${L}"]`);if(!td)return;td.style.outline="2px solid #c0392b";td.style.background="#fdecea";setTimeout(()=>{td.style.outline="";td.style.background=""},3000)}
/* "=" só vira fórmula em coluna numérica e com caracteres seguros; em texto (descrição, código…) vale como texto, nunca como fórmula do Excel */
function lerValor(v,L,rv){const s=String(v).trim();if(s.startsWith("=")){if(NUM.has(L)&&FORM_SEGURA.test(s)){const f=s.slice(1).toUpperCase().replace(/(\d),(\d)/g,"$1.$2");   /* vírgula decimal vira ponto: no arquivo a vírgula separaria argumentos */
    if(f.includes(",")||!sintaxeF(f))return {v:s};return {v:null,f,txt:s}}return {v:s}}if(NUM.has(L)&&L!=="Y"&&L!=="AA"){const n=num(s);return n==null?{v:s}:{v:n}}return {v:s}}
/* avalia uma fórmula segura (números, células, + - * / e parênteses) sem eval/Function (o cabeçalho de segurança do Netlify não permite);
   get(coluna) dá o número da célula referenciada. A linha da referência não conta: vale a própria linha — por isso a exportação reescreve as referências para a linha real */
function calcExpr(s){s=s.replace(/\s+/g,"").replace(/(\d),(\d)/g,"$1.$2");let i=0;
  const ex=()=>{let v=te();while(s[i]==="+"||s[i]==="-"){const o=s[i++],r=te();v=o==="+"?v+r:v-r}return v},
    te=()=>{let v=un();while(s[i]==="*"||s[i]==="/"){const o=s[i++],r=un();v=o==="*"?v*r:v/r}return v},
    un=()=>{if(s[i]==="-"){i++;return -un()}if(s[i]==="+"){i++;return un()}return at()},
    at=()=>{if(s[i]==="("){i++;const v=ex();if(s[i]!==")")throw 0;i++;return v}const m=/^(?:\d+\.?\d*|\.\d+)/.exec(s.slice(i));if(!m)throw 0;i+=m[0].length;return parseFloat(m[0])};
  const r=ex();if(i!==s.length)throw 0;return r}
function avalF(f,get){let ruim=false;
  const s=String(f).replace(/\b([A-Za-z]{1,2})[0-9]+\b/g,(m,a)=>{const n=get(a.toUpperCase());if(n==null||!isFinite(n)){ruim=true;return "0"}return "("+(Math.abs(n)<1e-6||Math.abs(n)>=1e21?n.toFixed(12):String(n))+")"});
  if(ruim)return null;
  try{const r=calcExpr(s);return typeof r==="number"&&isFinite(r)?r:null}catch(e){return null}}
/* a fórmula está escrita corretamente? (confere só a forma, com as células valendo 1) */
function sintaxeF(f){try{calcExpr(String(f).replace(/\b[A-Za-z]{1,2}[0-9]+\b/g,"1"));return true}catch(e){return false}}
/* número de um valor digitado na linha: aceita fórmula (=2*3, =N2*2) e calcula; rv são os valores digitados da linha */
/* desc = desconto do fornecedor (%): a referência ao custo (P) vale a compra JÁ com desconto, o mesmo número da célula calculada e do arquivo */
function numRaw(v,rv,dep,desc){dep=dep||0;const s=String(v==null?"":v).trim();if(s[0]!=="=")return num(v);if(dep>5||!FORM_SEGURA.test(s))return null;
  return avalF(s.slice(1),L=>{const n=numRaw((rv||{})[L],rv,dep+1,desc);return L==="P"&&desc>0&&n!=null?r2c(n-n*kDesc(desc)):n})}
const pesoLinha=r=>numRaw(r.v.N,r.v,0,r.desconto);
/* valor calculado de uma coluna de banho (sem digitação) */
function calcBanho(row,L,r){
  const peso=pesoLinha(row);
  if(L===row.banho.coluna){if(row.banho.mult==null)return null;if(row.banho.modo==="fixo")return {v:row.banho.mult};if(peso==null)return null;return {v:r4(peso*row.banho.mult),f:`N${r}*${row.banho.mult}`}}
  if(L==="U"&&row.verniz!=null&&peso!=null)return {v:r4(peso*row.verniz),f:`N${r}*${row.verniz}`};
  return null;
}
const modeloAtual=()=>{const C=cfg();return (C.modelos||[]).find(x=>x.id===C.modelo)||C.modelos[0]};
const colunasExport=()=>modeloAtual().cols.filter(c=>c.on!==false);
const nomeTela=L=>{const c=modeloAtual().cols.find(x=>x.on!==false&&x.k===L);return c?c.h:NOME[L]};
