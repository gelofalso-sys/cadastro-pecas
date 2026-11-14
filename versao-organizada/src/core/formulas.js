/* ===== núcleo: formulas — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { DUAS, FORMULA, LET, NOME, NUM, kDesc, r2c } from "./colunas.js";
import { num, vazio } from "./utilidades.js";
// @fim-imports
export const VALIDA_NUM=new Set(["N","O","P","Q","R","S","T","U","V","W","AB","AC"]);
export const FORM_SEGURA=/^=(?:[0-9+\-*\/().,\s]|\b[A-Za-z]{1,2}[0-9]+\b)*$/;
export const QTD_MAX=1e7;
export function qtdPos(v,rv,desc){const t=String(v==null?"":v).trim();if(t[0]==="="){if(t.length<=1)return false;if(!rv)return true;const n=numRaw(t,rv,0,desc);return n!=null&&Number.isInteger(n)&&n>=1&&n<=QTD_MAX}const q=num(t);return q>0&&q<=QTD_MAX&&Number.isInteger(q)}
export function checaCel(L,v){
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
export function lerValor(v,L,rv){const s=String(v).trim();if(s.startsWith("=")){if(NUM.has(L)&&FORM_SEGURA.test(s)){const f=s.slice(1).toUpperCase().replace(/(\d),(\d)/g,"$1.$2");   /* vírgula decimal vira ponto: no arquivo a vírgula separaria argumentos */
    if(f.includes(",")||!sintaxeF(f))return {v:s};return {v:null,f,txt:s}}return {v:s}}if(NUM.has(L)&&L!=="Y"&&L!=="AA"){const n=num(s);return n==null?{v:s}:{v:DUAS.has(L)?r2c(n):L==="N"?Math.round(n*1000)/1000:n}}return {v:s}}
export function calcExpr(s){s=s.replace(/\s+/g,"").replace(/(\d),(\d)/g,"$1.$2");let i=0;
  const ex=()=>{let v=te();while(s[i]==="+"||s[i]==="-"){const o=s[i++],r=te();v=o==="+"?v+r:v-r}return v},
    te=()=>{let v=un();while(s[i]==="*"||s[i]==="/"){const o=s[i++],r=un();v=o==="*"?v*r:v/r}return v},
    un=()=>{if(s[i]==="-"){i++;return -un()}if(s[i]==="+"){i++;return un()}return at()},
    at=()=>{if(s[i]==="("){i++;const v=ex();if(s[i]!==")")throw 0;i++;return v}const m=/^(?:\d+\.?\d*|\.\d+)/.exec(s.slice(i));if(!m)throw 0;i+=m[0].length;return parseFloat(m[0])};
  const r=ex();if(i!==s.length)throw 0;return r}
export function avalF(f,get){let ruim=false;
  const s=String(f).replace(/\b([A-Za-z]{1,2})[0-9]+\b/g,(m,a)=>{const n=get(a.toUpperCase());if(n==null||!isFinite(n)){ruim=true;return "0"}return "("+(Math.abs(n)<1e-6||Math.abs(n)>=1e21?n.toFixed(12):String(n))+")"});
  if(ruim)return null;
  try{const r=calcExpr(s);return typeof r==="number"&&isFinite(r)?r:null}catch(e){return null}}
export function sintaxeF(f){try{calcExpr(String(f).replace(/\b[A-Za-z]{1,2}[0-9]+\b/g,"1"));return true}catch(e){return false}}
export function numRaw(v,rv,dep,desc){dep=dep||0;const s=String(v==null?"":v).trim();if(s[0]!=="=")return num(v);if(dep>5||!FORM_SEGURA.test(s))return null;
  return avalF(s.slice(1),L=>{const n=numRaw((rv||{})[L],rv,dep+1,desc);return L==="P"&&desc>0&&n!=null?r2c(n-n*kDesc(desc)):n})}
export const pesoLinha=r=>numRaw(r.v.N,r.v,0,r.desconto);
export function calcBanho(row,L,r){
  const peso=pesoLinha(row);
  if(L===row.banho.coluna){if(row.banho.mult==null)return null;if(row.banho.modo==="fixo")return {v:r2c(row.banho.mult)};if(peso==null)return null;return {v:r2c(peso*row.banho.mult),f:`ROUND(N${r}*${row.banho.mult},2)`}}
  if(L==="U"&&row.verniz!=null&&peso!=null)return {v:r2c(peso*row.verniz),f:`ROUND(N${r}*${row.verniz},2)`};
  return null;
}
export function celulas(row,r,sugestao){
  const c=celulasBase(row,r);
  if(sugestao&&row.mk&&vazio(row.v.V)){   /* só o formulário pede a sugestão; tabela e arquivo saem sem preço se ele não foi digitado */const iv=LET.indexOf("V");let soma=0;["P","Q","R","S","T","U"].forEach(L=>{const x=c[LET.indexOf(L)];if(x&&typeof x.v==="number")soma+=x.v;else if(x&&x.f){const n=typeof x.calc==="number"?x.calc:numRaw(row.v[L],row.v);if(n!=null)soma+=n}});
    c[iv]={v:r2c(soma*row.mk),f:`ROUND((P${r}+Q${r}+R${r}+S${r}+T${r}+U${r})*${row.mk},2)`}}
  return c;
}
export const fLinha=(f,r)=>String(f).replace(/\b([A-Za-z]{1,2})[0-9]+\b/g,"$1"+r);
export function celulasBase(row,r){
  const c=LET.map(L=>{const x=celulaBase(row,r,L);if(x&&x.v==null&&x.f&&x.txt)x.f=fLinha(x.f,r);return x});
  /* resultado das fórmulas digitadas: usa o valor EFETIVO das células referenciadas (compra já com desconto, banho calculado…), o mesmo do arquivo */
  const val=(L,d)=>{const x=c[LET.indexOf(L)];if(!x)return null;if(typeof x.v==="number")return x.v;if(x.v==null&&x.f&&x.txt&&d<6)return avalF(x.f,K=>val(K,d+1));return null};
  {const ip=LET.indexOf("P"),x=c[ip];if(x&&x.v==null&&x.f&&x.desc){const n=avalF(x.f,K=>val(K,0));if(n!=null){const In=x.f,k=x.desc;c[ip]={v:r2c(n-n*k),f:`ROUND((${In})-((${In})*${k}),2)`}}}}
  c.forEach(x=>{if(x&&x.v==null&&x.f&&x.txt){const n=avalF(x.f,K=>val(K,0));if(n!=null)x.calc=n}});
  return c}
export function celulaBase(row,r,L){
    const v=row.v[L];
    if(row.banho&&FORMULA.has(L)){if(!vazio(v))return lerValor(v,L,row.v);return calcBanho(row,L,r)}
    if(vazio(v))return null;
    if(L==="P"){const c=num(v);if(c==null){const s=String(v).trim();   /* custo em fórmula também recebe o desconto do fornecedor */
      if(row.desconto>0&&s[0]==="="&&FORM_SEGURA.test(s)){const o=lerValor(v,L,row.v);if(o.f)o.desc=kDesc(row.desconto);return o}   /* o desconto é aplicado em celulasBase, com os valores efetivos das células referenciadas */
      return lerValor(v,L,row.v)}if(row.desconto>0){const k=kDesc(row.desconto);return {v:r2c(c-c*k),f:`ROUND(${c}-(${c}*${k}),2)`}}return {v:c}}
    return lerValor(v,L,row.v);
}
