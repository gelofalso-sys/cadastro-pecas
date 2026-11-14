/* ===== núcleo: utilidades — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { semAc } from "./colunas.js";
// @fim-imports
export const DENY_ID=/["'<>`=\s&\\]/g;
export const idLimpo=x=>String(x==null?"":x).replace(DENY_ID,"");
export const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function num(s){if(s==null)return null;if(typeof s==="number")return isFinite(s)?s:null;let t=String(s).replace(/R\$|\s|%/g,"");if(!t)return null;
  /* aceita 1.234,56 (pt-BR) e 1,234.56 (en): o último separador é o decimal; os outros são milhar (grupos de 3). Só "," ou só 1 "." = decimal */
  {const c=t.lastIndexOf(","),p=t.lastIndexOf(".");
  if(c>=0&&p>=0){const dec=c>p?",":".",mil=dec===","?".":",",pt=t.split(dec);if(pt.length>2||pt[0].split(mil).slice(1).some(x=>x.length!==3))return null;t=pt[0].split(mil).join("")+"."+pt[1]}
  else if(c>=0){if(t.split(",").length>2){if(!/^-?\d{1,3}(,\d{3})+$/.test(t))return null;t=t.replace(/,/g,"")}else t=t.replace(",",".")}
  else if(p>=0&&t.split(".").length>2){if(!/^-?\d{1,3}(\.\d{3})+$/.test(t))return null;t=t.replace(/\./g,"")}}
  if(!/^-?\d*\.?\d+$/.test(t))return null;const n=parseFloat(t);return isFinite(n)?n:null}
export const r4=n=>Math.round(n*10000)/10000;
export const brl=n=>(n||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
export const fmt=n=>n==null?"":String(r4(n)).replace(".",",");
export const vazio=v=>v==null||String(v).trim()==="";
export function selFaixa(gr,txt){const sel=new Set();
  String(txt||"").replace(/(\d)\s*(?:-|–|—|a|até|ate|ao)\s*(?=\d)/gi,"$1-").split(/[;, ]+/).filter(Boolean).forEach(tk=>{const m=tk.match(/^([0-9]+)-([0-9]+)$/);
    if(m){const lo=Math.min(+m[1],+m[2]),hi=Math.max(+m[1],+m[2]);gr.itens.forEach(it=>{const n=parseFloat(it.nome);if(n>=lo&&n<=hi)sel.add(it.id)})}
    else if(tk.toLowerCase()==="todos")gr.itens.forEach(it=>sel.add(it.id));
    else gr.itens.forEach(it=>{if(String(it.nome)===tk)sel.add(it.id)})});
  return gr.itens.map(i=>i.id).filter(id=>sel.has(id))}
export const catSing=s=>semAc(s).replace(/[^a-z0-9]+/g," ").trim().split(" ").map(w=>w.length>3&&w.endsWith("s")?w.slice(0,-1):w).join(" ");
export const apelidosDe=t=>String(t||"").split(/[;,]/).map(x=>x.trim()).filter(Boolean);
export function palavraDeNome(n){n=String(n||"").trim();if(!n||/[\/;,]/.test(n))return "";
  if(/éis$/i.test(n))return n.replace(/éis$/i,"el");if(/(res|zes|ses)$/i.test(n))return n.slice(0,-2);if(/s$/i.test(n)&&!/ss$/i.test(n))return n.slice(0,-1);return n}
export const BANCO_PALAVRAS={
 "Brincos":{"": ["Coração","Flor","Gota","Zircônia","Ponto de luz","Cristal","Cravejado","Liso"],"Argolas":["Argolinha","Click","Cravejada","Lisa","Quadrada","Coração","Zircônias"],"Pequenos":["Coração","Zircônia","Ponto de luz","Flor","Gota","Oval","Cristal","Cravejado"],"Trios/duos":["Trio","Duo","Argolinhas","Ponto de luz"]},
 "Anel":{"": ["Solitário","Cravejado","Liso","Regulável","Aparador","Coração","Zircônias","Entrelaçado"]},
 "Colares":{"": ["Coração","Elos","Bolinhas","Cruz","Ponto de luz","Riviera"],"Correntes":["Corrente","Elos","Veneziana","Cartier","Riviera","Cordão baiano"],"Chokers":["Choker","Elos","Corações","Chapinhas","Bolinhas","Losangos","Folhas"],"Gargantilhas":["Gargantilha","Coração","Ponto de luz","Zircônia"]},
 "Pulseiras":{"": ["Elos","Riviera","Corações","Bracelete","Dupla","Zircônias","Bolinhas","Regulável"]},
 "Pingentes":{"": ["Coração","Cruz","Medalha","Menino","Menina","Bonequinho"]},
 "Conjuntos":{"": ["Coração","Pedra fusion","Borboleta","Trevo","Zircônia","Ponto de luz"]},
 "Prata 925":{"Brincos":["Argolinha","Click","Coração","Ponto de luz","Zircônia"],"Anéis":["Solitário","Cravejado","Liso","Coração","Zircônias"],"Colares":["Corrente","Gargantilha","Coração","Veneziana"],"Pulseiras":["Elos","Coração","Riviera","Bolinhas"],"Pingentes":["Coração","Cruz","Medalha"]},
 "Masculinos":{"Correntes":["Grumet","Veneziana","Aço inox"],"Pulseiras":["Grumet","Elo fígaro","Aço inox"]},
 "Tornozeleiras":{"": ["Elos","Corações","Bolinhas","Miçangas"]},"Acessórios":{"": ["Tarraxa","Tarraxa mágica"]},
 "Infantil":{"": ["Infantil","Borboletinhas","Estrelinha","Coloridas"]},"Personalizado":{"": ["Nome","Coração","Mandala","Filhos"]},"Relógios":{"": ["Bracelete","Quadrado","Aço"]}
};
export function descAuto(f){return}
export const refParte=(b,it)=>(b?b.letra:"")+(!it?"":(it.ref!=null?it.ref:(it.g&&it.g.modoRef==="nome"?String(it.nome||it.letra):it.letra)));
export const onDe=l=>l.tipo==="bruta"?(l.on=l.on||{}):(l.onP=l.onP||{});
export const vzPad=(bh,b)=>b.vz!=null?!!b.vz:bh.vernizOn!==false;
export const vzOn=(l,bh,b)=>l.vz&&b.id in l.vz?!!l.vz[b.id]:vzPad(bh,b);
export const rotG=g=>g.rotulo==null?" ":g.rotulo;
export const efetivo=(g,x)=>({...x,g,texto:!vazio(x.texto)?x.texto:rotG(g)+(x.nome||x.letra),col:!vazio(x.col)?x.col:(g.col||""),valor:!vazio(x.valor)?x.valor:(g.col||!vazio(x.col)?(x.nome||""):"")});
export const proxCorLetra=(c,nome)=>{const us=new Set(((c&&c.cores)||[]).map(x=>String(x.letra||"").toUpperCase()));const w=semAc(String(nome||"")).toUpperCase().replace(/[^A-Z0-9]/g,"");if(w.length>=2){const cand=[w.slice(0,2)];for(let k=2;k<w.length;k++)cand.push(w[0]+w[k]);for(const q of cand)if(!us.has(q))return q}for(let i=1;i<100;i++)if(!us.has(String(i)))return String(i);return ""};
export const corKey=n=>semAc(String(n||"")).trim();
export function descVar(d,it){if(it&&it.seq)return it.seq.reduce((a,x)=>descVar(a,x),d);if(!it||!it.texto)return d;d=String(d||"");const g=it.g;
  if(g){const B=String.fromCharCode(92),ro=s=>String(s).split("").map(c=>"[]{}()|.*+?^$-/".indexOf(c)>=0?B+c:c).join(""),pal=[g.rotulo,...(g.sin||[])].map(x=>String(x||"").trim()).filter(Boolean),nomes=g.itens.map(x=>x.nome).filter(Boolean).map(ro).join("|");
    pal.forEach(w=>{d=d.replace(new RegExp("(^| )"+ro(w)+" *(?:[0-9]+(?:[.,][0-9]+)?"+(nomes?"|"+nomes:"")+")(?= |$)","gi"),"$1")});
    d=d.replace(/ {2,}/g," ").trim()}
  return d.toLowerCase().includes(it.texto.trim().toLowerCase())?d:d+it.texto}
export function contFinal(g){const o={...g.cont};Object.entries(g.manual||{}).forEach(([p,n])=>{if(n>(o[p]||0))o[p]=n});return o}
export const catPad={Y:"ncm",AA:"cfop",AB:"fcp",Q:"insumos"};
export const banhoSemCalc=b=>!!b&&(b.modo==="nenhum"||!b.coluna);
export function opts(list,sel,blank){return (blank!=null?`<option value="">${esc(blank)}</option>`:"")+list.map(v=>{const [vv,tt]=Array.isArray(v)?v:[v,v];return `<option value="${esc(vv)}"${vv===sel?" selected":""}>${esc(tt)}</option>`}).join("")+(sel&&!list.some(v=>(Array.isArray(v)?v[0]:v)===sel)?`<option selected>${esc(sel)}</option>`:"")}
