/* ===== núcleo: exportacao — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { traduzF } from "./colunas.js";
import { refBase } from "./dominio.js";
import { esc } from "./utilidades.js";
// @fim-imports
export function faixaFiltro(g){const bs=[...new Set(g.linhas.map(r=>refBase(r.v.E)).filter(Boolean))].sort();return bs.length<=4?bs.join(", "):bs[0]+"–"+bs[bs.length-1]}
export function celulaXlsx(x,cols){if(x.f){const tf=cols?traduzF(x.f,cols):x.f;if(tf){const c={t:"n",f:tf};if(typeof x.v==="number")c.v=x.v;else if(typeof x.calc==="number")c.v=x.calc;return c}return typeof x.v==="number"?{t:"n",v:x.v}:typeof x.calc==="number"?{t:"n",v:x.calc}:{t:"s",v:"="+x.f}}return typeof x.v==="number"?{t:"n",v:x.v}:{t:"s",v:String(x.v).replace(/[\r\n]+/g," ")}}
export function pendGrupos(ger){const grupos=new Map(),soltas=[];
  ger.forEach(s=>{const m=s.match(/^Linha \d+ \(([^)]+)\): (.+)$/);if(!m){soltas.push(s);return}m[2].split(/, (?=[A-ZÀ-Ú])/).forEach(t=>{const k=t.trim();if(!grupos.has(k))grupos.set(k,[]);grupos.get(k).push(m[1])})});
  return [...grupos.entries()].sort((a,b)=>b[1].length-a[1].length).map(([k,refs])=>`<tr><td><b>${esc(k)}</b> — ${refs.length} peça(s): ${refs.slice(0,6).map(r=>`<button type="button" class="btn sm" data-act="exp-ir" data-ref="${esc(r)}">${esc(r)}</button>`).join(" ")}${refs.length>6?` e mais ${refs.length-6}`:""}</td></tr>`).join("")+soltas.map(s=>`<tr><td>${esc(s)}</td></tr>`).join("")}
export function txtSaida(r,c,dec){if(!r)return "";const v=r.v;if(v==null)return r.f?"="+r.f:"";if(typeof v==="number")return (c.tipo==="dinheiro"?(c.k==="P"?(Math.abs(v*100-Math.round(v*100))<1e-7?v.toFixed(2):v.toFixed(4).replace(/0+$/,"")):v.toFixed(2)):String(v)).replace(".",dec);return String(v).replace(/[\r\n]+/g," ")}
export const protegeTxt=s=>{s=String(s==null?"":s);return /^[=+@\t\r]/.test(s)||(s[0]==="-"&&!/^-\d+([.,]\d+)?$/.test(s))?"'"+s:s};
export function avisoZeros(sl,cols,onde){const ks=["C","Y","Z"].filter(k=>cols.some(c=>c.k===k));if(!ks.length)return "";let n=0;const ex=[];
  sl.forEach(e=>{const v=e.row&&e.row.v;if(!v)return;ks.forEach(k=>{const x=v[k];if(typeof x==="string"&&/^0\d/.test(x.trim())){n++;if(ex.length<2&&!ex.includes(x.trim()))ex.push(x.trim())}})});
  return n?`Atenção: ${n} valor(es) de EAN/NCM/código de barras começam com zero (ex.: ${ex.join(", ")}). Ao abrir ${onde} no Excel esse zero pode sumir; para manter, use o modelo .xlsx (sai como texto) ou importe a coluna como Texto.`:""}
export function dividirLotes(sl,lote){if(!(lote>0)||sl.length<=lote)return [sl];
  const grupos=[];sl.forEach(e=>{if(e.t==="filho"&&grupos.length)grupos[grupos.length-1].push(e);else grupos.push([e])});
  const out=[];let cur=[];grupos.forEach(gp=>{if(cur.length&&cur.length+gp.length>lote){out.push(cur);cur=[]}cur.push(...gp)});if(cur.length)out.push(cur);return out}
export const TIPO_PAD={V:"dinheiro",P:"dinheiro",Q:"dinheiro",R:"dinheiro",S:"dinheiro",T:"dinheiro",U:"dinheiro",W:"inteiro",N:"numero"};
export const csvLinha=(l,sep)=>{const o=[];let c="",q=false;for(let i=0;i<l.length;i++){const ch=l[i];
  if(q){if(ch==='"'){if(l[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}else if(ch==='"')q=true;else if(ch===sep){o.push(c);c=""}else c+=ch}o.push(c);return o};
export function exemplo(){
  const obs="Link 211 - Xangai Brutos Banho Scarlat 2026 setembro";
  const b=(F,J,N,P,V,qa,qb)=>({id:uid(),tipo:"bruta",desconto:"0",banhista:"scarlat",vinc:false,v:{F,J,N,P,V,H:"xangai",I:"Brincos",M:obs},on:{ouro:true,prata:true},ov:{ouro:{W:qa},prata:{W:qb}}});
  const p=(F,G2,vinc)=>({id:uid(),tipo:"pronta",desconto:"15",banhista:"",vinc,v:{F,G:G2,H:"Evidência",I:"Brincos",J:"Piergings",M:"Compra em setembro de 2026",L:"Ródio",P:"15,90",V:"49,90",W:"1"},on:{},ov:{}});
  const c=(cat,sub,F,H,tipo,x)=>tipo==="bruta"
    ?{id:uid(),tipo:"bruta",desconto:H==="Rosah"?"10":"0",banhista:"scarlat",vinc:false,v:{F,J:sub,N:x.N,P:x.P,V:x.V,H,I:cat,M:obs},on:{ouro:true,prata:true},ov:{ouro:{W:x.qa},prata:{W:x.qb}}}
    :{id:uid(),tipo:"pronta",desconto:H==="Evidência"?"15":"0",banhista:"",vinc:false,v:{F,G:x.G,H,I:cat,J:sub,M:"Compra em setembro de 2026",L:x.L,P:x.P,V:x.V,W:x.W},on:{},ov:{}};
  return [b("Earhook bolinhas e zircônias","Médios","1,7","3,60","49,90","3","2"),b("Brinco cravejado","Médios","2,5","6,00","69,90","3","2"),b("Brinco borboleta lisa","Pequenos","1,7","3,36","45,00","1","1"),
    p("Piercing fake cristal ródio","P-221",false),p("Piercing fake turmalina ródio","P-222",true),p("Piercing fake citrino ródio","P-224",true),
    /* um item de demonstração de cada uma das outras categorias (brutas vão para o banho; prontas entram direto) */
    c("Acessórios","","Chaveiro coração com strass","Rosah","bruta",{N:"4,2",P:"5,10",V:"29,90",qa:"2",qb:"2"}),
    c("Anel","","Anel solitário zircônia","xangai","bruta",{N:"2,1",P:"3,40",V:"39,90",qa:"2",qb:"1"}),
    c("Colares","Correntes","Corrente veneziana 45cm","xangai","bruta",{N:"6,8",P:"9,20",V:"79,90",qa:"2",qb:"2"}),
    c("Conjuntos","","Conjunto colar e brinco gota","Evidência","pronta",{L:"Ouro",P:"32,00",V:"119,90",W:"1",G:"CJ-301"}),
    c("Infantil","Brincos","Brinco infantil estrela","Spina Joias","pronta",{L:"Ouro",P:"7,50",V:"34,90",W:"2",G:"IN-110"}),
    c("Masculinos","Correntes","Corrente cartier masculina","Rosah","bruta",{N:"12,5",P:"15,00",V:"129,90",qa:"1",qb:"1"}),
    c("Personalizado","","Pingente com nome (sob encomenda)","Spina Joias","pronta",{L:"Prata",P:"18,00",V:"69,90",W:"1",G:"PE-001"}),
    c("Pingentes","","Pingente ponto de luz","xangai","bruta",{N:"1,3",P:"2,60",V:"24,90",qa:"3",qb:"2"}),
    c("Prata 925","Brincos","Brinco argola prata 925 lisa","Spina Joias","pronta",{L:"Prata 925",P:"28,00",V:"99,90",W:"1",G:"PR-501"}),
    c("Pulseiras","","Pulseira elos com pingentes","Rosah","bruta",{N:"7,4",P:"8,80",V:"59,90",qa:"2",qb:"2"}),
    c("Relógios","","Relógio feminino dourado","Evidência","pronta",{L:"Ouro",P:"54,00",V:"189,90",W:"1",G:"RL-901"}),
    c("Tornozeleiras","","Tornozeleira corrente e estrelas","Rosah","bruta",{N:"3,9",P:"4,70",V:"34,90",qa:"2",qb:"2"})];
}
