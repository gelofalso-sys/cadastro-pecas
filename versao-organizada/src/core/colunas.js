/* ===== núcleo: colunas — funções sem DOM e sem estado global (movidas de src/js sem alterar o código) ===== */
// @auto-imports (gerado por tools/extrair_para_core.mjs --imports)
import { FORM_SEGURA, avalF, calcBanho, lerValor, numRaw } from "./formulas.js";
import { esc, num, vazio } from "./utilidades.js";
// @fim-imports
export const MB=1048576,
  MAX_PLANILHA_BYTES=15*MB,      /* planilha / CSV importada */
  MAX_PLANILHA_LINHAS=20000,     /* linhas de uma planilha importada */
  MAX_PDF_BYTES=30*MB,           /* PDF do romaneio e da nota fiscal */
  MAX_PDF_PAGINAS=120,           /* paginas de um PDF */
  MAX_XML_BYTES=8*MB,            /* XML da nota fiscal */
  MAX_FOTO_BYTES=32*MB,          /* foto */
  MAX_BACKUP_BYTES=150*MB,       /* backup JSON ao restaurar */
  LIM_EXPORT=MAX_PLANILHA_LINHAS-10,   /* linhas de dados por arquivo exportado (sobra o cabeçalho e a linha final) */
  MAX_TEXTO_COLADO=200000;
export const limErr=m=>{const e=new Error(m);e.lim=1;return e};
export const fmtMB=n=>(n/MB).toFixed(n<10*MB?1:0).replace(".",",");
export function checaTam(f,max,oque){if(f&&f.size>max)throw limErr(`${oque} “${f.name||"arquivo"}” tem ${fmtMB(f.size)} MB e o limite é ${fmtMB(max)} MB`);return f}
export function checaPaginas(doc){if(doc.numPages>MAX_PDF_PAGINAS){try{doc.destroy()}catch(e){}throw limErr(`Esse PDF tem ${doc.numPages} páginas e o limite é ${MAX_PDF_PAGINAS}`)}return doc}
export const modeloJueri=()=>({id:"jueri",nome:"Jueri",cols:LET.map((k,i)=>({k,h:HEAD[i],on:true}))});
export const modeloBling=()=>{const B=(h,k,o)=>({k:k||"",h,on:true,...(o||{})});
  return {id:"bling",nome:"Bling",formato:"csv",agrupar:"sim",lote:"1000",sep:",",dec:".",enc:"utf8bom",cols:[
  B("ID"),B("Código","E",{tipo:"texto",obrig:true,max:"60"}),B("Descrição","@desc",{obrig:true}),B("Unidade","",{padrao:"UN"}),B("NCM","Y",{tipo:"texto"}),B("Origem","",{padrao:"0"}),B("Preço","V",{tipo:"dinheiro",obrig:true}),B("Valor IPI fixo"),B("Observações","M"),
  B("Situação","AE",{padrao:"Ativo",lista:"Ativo;Inativo"}),B("Estoque","W",{tipo:"inteiro"}),B("Preço de custo","P",{tipo:"dinheiro"}),B("Cód no fornecedor","G"),B("Fornecedor"),B("Localização","X"),B("Estoque maximo"),B("Estoque minimo"),
  B("Peso líquido (Kg)","N",{tipo:"numero",fator:"0.001"}),B("Peso bruto (Kg)"),B("GTIN/EAN","Z",{tipo:"texto"}),B("GTIN/EAN da embalagem"),B("Largura do Produto"),B("Altura do Produto"),B("Profundidade do produto"),B("Data Validade"),
  B("Descrição do Produto no Fornecedor"),B("Descrição Complementar"),B("Itens p/ caixa"),B("Produto Variação","@pv"),B("Tipo Produção"),B("Classe de enquadramento do IPI"),B("Código da lista de serviços"),B("Tipo do item"),
  B("Grupo de Tags/Tags"),B("Tributos"),B("Código Pai","@pai",{tipo:"texto"}),B("Código Integração"),B("Grupo de produtos"),B("Marca"),B("CEST"),B("Volumes"),B("Descrição Curta"),B("Cross-Docking"),B("URL Imagens Externas","B",{tipo:"texto"}),B("Link Externo"),
  B("Meses Garantia no Fornecedor"),B("Clonar dados do pai"),B("Condição do produto"),B("Frete Grátis"),B("Número FCI"),B("Vídeo"),B("Departamento"),B("Unidade de medida"),B("Preço de compra"),B("Valor base ICMS ST para retenção"),
  B("Valor ICMS ST para retenção"),B("Valor ICMS próprio do substituto"),B("Categoria do produto"),B("Informações Adicionais")]}};
export const HEAD=["ID","Foto","Código de Barras","Código Pai","Referência","Descrição","Código do Fornecedor","Fornecedor","Categoria","Subcategoria","Tamanho","Cor","Observação","Peso","Milésimos de Banho","Custo de Compra","Custo de Insumos","Custo do Banho de Ouro","Custo do Banho de Ródio","Custo do Banho de Prata","Custo do Banho de Verniz","Preço de Varejo","Quantidade","Localização","Número NCM","Número EAN","CFOP","FCP","Imposto","Exibir no Catálogo","Status"];
export const LET=HEAD.map((_,i)=>{let s="",n=i+1;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s});
export const NOME=Object.fromEntries(LET.map((l,i)=>[l,HEAD[i]]));
export const COLW=[5.71,57.14,22.29,15.14,11,39.57,10.57,9.71,11.29,7.86,7.43,9,40,7,9,12,10,12,12,12,12,10,9,10,11,10,7,6,8,10,8];
export const NUM=new Set(["N","O","P","Q","R","S","T","U","V","W","Y","AA","AB","AC"]);
export const DUAS=new Set(["P","Q","R","S","T","U","V"]);
export const MONEY=new Set(["P","Q","R","S","T","U","V"]);
export const milDe=(b,cat)=>{const m=b&&b.milCat&&cat!=null?b.milCat[cat]:undefined;return (m!==undefined&&m!==null&&m!=='')?m:(b?b.mil:"")};
export const multDe=(b,cat)=>{const m=b&&b.multCat&&cat!=null?b.multCat[cat]:undefined;return (m!==undefined&&m!==null&&m!=='')?m:(b?b.mult:"")};
export const multItem=(l,b,cat)=>{const o=l&&l.ov&&l.ov[b.id],v=o&&o._m;return (v!=null&&String(v).trim()!=="")?v:multDe(b,cat)};
export function resumoCat(bh){const out=[];const nomes=new Set();bh.banhos.forEach(b=>{Object.keys(b.milCat||{}).concat(Object.keys(b.multCat||{})).forEach(n=>nomes.add(n))});
  nomes.forEach(n=>{const p=bh.banhos.map(b=>{const m=(b.milCat||{})[n],v=(b.multCat||{})[n];return (m||v)?`${b.nome} ${m?m+"‰":""}${m&&v?" · ":""}${v?"R$ "+v:""}`:""}).filter(Boolean);if(p.length)out.push(`${n}: ${p.join(" / ")}`)});return out.join(" · ")}
export const BANHO_COLS={R:"Ouro",S:"Ródio",T:"Prata"};
export const FORMULA=new Set(["R","S","T","U"]);
export const POR_BANHO=new Set(["L","O","R","S","T","U","W"]);
export function colcfgPadrao(){
  const c={};LET.forEach(L=>c[L]={form:true,manter:false,padrao:"",opcoes:"",obrig:false});
  ["H","I","J","M"].forEach(L=>c[L].manter=true);
  ["F","V","W"].forEach(L=>c[L].obrig=true);
  c.Q.padrao="0.5";c.Y.padrao="71131100";c.AA.padrao="5102";c.AB.padrao="2";c.AD.padrao="Não";c.AE.padrao="Ativo";
  return c;
}
export const BANHISTA0={id:"scarlat",nome:"Galvânica 1",verniz:"0.42",vernizOn:true,banhos:[
  {id:"ouro",nome:"Ouro",letra:"A",cor:"Ouro",mil:"1",modo:"peso",mult:"1.5",coluna:"R",sufixo:"",marcado:true,vz:true},
  {id:"prata",nome:"Prata",letra:"B",cor:"Prata",mil:"50",modo:"peso",mult:"1.54",coluna:"T",sufixo:" banho prata",marcado:true,vz:true}]};
export const mkGrade=(subs,id)=>({id:id,nome:"Tamanhos de anel",rotulo:" aro ",col:"K",subs:subs||[],itens:Array.from({length:15},(_,i)=>String(11+i)).map((n,i)=>({id:"a"+n,letra:String.fromCharCode(65+i),nome:n}))});
export const SEM_AC_MARCAS=/[\u0300-\u036f]/g;
export const semAc=s=>String(s==null?"":s).normalize("NFD").replace(SEM_AC_MARCAS,"").trim().toLowerCase();
export function letraN(i){let s="",n=i+1;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s}
export function proxLetra(us){for(let i=0;i<702;i++){const s=letraN(i);if(!us.includes(s))return s}return "Z"}
export const PRATA_SUBS=["Brincos","Colares","Anéis","Pulseiras","Pingentes","Conjuntos"];
export const JUERI_CATS=[
  {nome:"Acessórios",prefixo:"AC",subs:[]},
  {nome:"Anel",prefixo:"AN",subs:[],alias:["Anéis","Anél","Aneis"],remover:["Solitários","Aparadores","Falanges","Ajustáveis"],gr:{id:"aro",subs:[]}},
  {nome:"Brincos",prefixo:"BR",subs:["Argolas","Grandes","Médios","Pequenos","Piercings","Trios/duos"],trocas:{Piergings:"Piercings"}},
  {nome:"Colares",prefixo:"CO",subs:["Chokers","Correntes","Gargantilhas","Longos"],trocas:{Choker:"Chokers"}},
  {nome:"Conjuntos",prefixo:"CJ",subs:[]},
  {nome:"Infantil",prefixo:"IN",subs:["Brincos","Colares","Conjuntos","Pulseiras"],subPref:{Brincos:"BR",Colares:"CO",Conjuntos:"CJ",Pulseiras:"PU"}},
  {nome:"Masculinos",prefixo:"MA",subs:["Correntes","Pulseiras"],subPref:{Correntes:"CO",Pulseiras:"PU"}},
  {nome:"Personalizado",prefixo:"PE",subs:[]},
  {nome:"Pingentes",prefixo:"PG",subs:[]},
  {nome:"Prata 925",prefixo:"BR",sufixo:" Prata 925",subs:PRATA_SUBS,subPref:{Brincos:"BR",Colares:"CO","Anéis":"AN",Pulseiras:"PU",Pingentes:"PG",Conjuntos:"CJ"},subSoRef:Object.fromEntries(PRATA_SUBS.map(x=>[x,true])),gr:{id:"aro-p",subs:["Anéis"]}},
  {nome:"Pulseiras",prefixo:"PU",subs:[],remover:["Riviera","Elos","Braceletes","Berloques"]},
  {nome:"Relógios",prefixo:"RL",subs:[]},
  {nome:"Tornozeleiras",prefixo:"TZ",subs:[]}];
export const ROM_PESO=()=>({id:"pedido-peso",nome:"Pedido com itens por peso (GR)",padrao:"{item} {cod} {desc} {u}{qv} {pu} {total}",ini:"Unit. Total",fim:"Total Produtos",obsRe:"N. Pedido:\\s*(\\d+)",mapa:"Brinco=Brincos; Corrente=Colares>Correntes; Pingente=Pingentes; Anel=Anel; Pulseira=Pulseiras; Colar=Colares",auto:false,custo:"preco",valorRe:"Total Produtos:\\s*(\\d[\\d.]*,\\d{2})"});
export const ROMS0=()=>[{id:"carlinha",nome:"Clube de Compras da Carlinha",
  padrao:"{desc} [#{cod}] R$ {preco} R$ {precod} {qtd} R$ {total}",ini:"Valor Total",fim:"Valor Produtos",lixo:"P.gina \\d+/\\d+",
  obsRe:"Romaneio do (.+?) Pedido",mapa:"Colar=Colares; Corrente=Colares>Correntes; Choker=Colares>Chokers; Brinco=Brincos; Argola=Brincos>Argolas; Pingente=Pingentes; Anel=Anel; Pulseira=Pulseiras; Conjunto=Conjuntos",
  custo:"precod",qtdRe:"Quantidade Total de Produtos:\\s*(\\d+)",valorRe:"Valor Produtos(?: \\(sem desconto\\))?:\\s*R\\$\\s*(\\d[\\d.]*,\\d{2})"},ROM_PESO()];
export const ROM_GENERICO=()=>({...ROMS0()[0],id:"generico-cod",nome:"Romaneio com códigos e valores",forn:"",auto:true});
export const DEFAULT_CONFIG={
  modelos:[modeloJueri()],modelo:"jueri",v9:true,v10:true,v12:true,seqs:{BR:"0",CO:"0",AN:"0",PU:"0",TZ:"0",CJ:"0",PG:"0",AC:"0",IN:"0",MA:"0",PE:"0",RL:"0"},ordem:"int",v11:true,colcfg:colcfgPadrao(),banhistas:[],grades:[],romaneios:[ROM_GENERICO(),ROM_PESO()],
  categorias:JUERI_CATS.map(j=>({nome:j.nome,prefixo:j.prefixo,...(j.sufixo?{sufixo:j.sufixo}:{}),subs:[...j.subs],...(j.subPref?{subPref:{...j.subPref}}:{}),...(j.subSoRef?{subSoRef:{...j.subSoRef}}:{}),...(j.gr?{grade:mkGrade(j.gr.subs,j.gr.id)}:{})})),
  fornecedores:[],   /* instalação nova começa sem fornecedores, galvânica de exemplo nem observações: o usuário cadastra os dele */
  cores:["Ouro","Prata","Ródio","Prata 925","Ródio negro","Rosé","Azul","Cristal","Branco","Preto","Verde","Vermelho","Rosa","Lilás","Roxo","Amarelo","Laranja","Marrom","Grafite","Champagne","Nude","Turquesa","Pérola","Bege","Cinza","Multicolorido"],
  observacoes:[]
};
export const FORM0=()=>({tipo:"bruta",desconto:"0",banhista:"",v:{I:"Brincos"},on:{},ov:{},vz:{},vinc:false,grade:"",gsel:[],csel:[],semGrade:false});
export const clone=o=>JSON.parse(JSON.stringify(o));
export const ftOk=u=>typeof u==="string"&&u.length<2e7&&/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=]*$/.test(u);
export const fs=u=>ftOk(u)?esc(u):"";
export const csvq=x=>{let s=String(x==null?"":x);if(/^[=+@\t\r]/.test(s)||(s[0]==="-"&&!/^-\d+([.,]\d+)?$/.test(s)))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
export const ZM={t:1,f:1};
export const TIPOS_COL=[["","Como vem"],["texto","Texto"],["numero","Número"],["inteiro","Inteiro"],["dinheiro","Dinheiro (2 casas; compra até 4)"]];
export const listaCol=c=>String(c&&c.lista||"").split(";").map(s=>s.trim()).filter(Boolean);
export const maxCol=c=>{const n=Math.trunc(num(c&&c.max)||0);return n>0?n:0};
export const abaNome=mo=>{let s=String(mo&&mo.aba||"").replace(/[\[\]:*?\/\\]/g," ").trim().slice(0,31).replace(/^'+|'+$/g,"").trim();if(/^history$/i.test(s))s+="_";return s||"Worksheet"};
export const attrVar=s=>String(s==null?"":s).replace(/[:;|]/g," ").trim();
export function celCol(c,cs,e){const k=c.k||"";
  if(k[0]==="@"){if(k==="@desc")return e.t==="filho"?{v:e.attrs}:cs[LET.indexOf("F")]||null;
    const v=k==="@pv"?(e.t==="filho"?"Variação":"Produto"):k==="@pai"?(e.t==="filho"?e.pai:""):"";return v===""?null:{v}}
  return k?cs[LET.indexOf(k)]||null:null}
export const normH=h=>semAc(h).replace(/[^a-z0-9]+/g," ").trim();
export const SIN={A:["id"],B:["foto","imagem","url da foto","link da foto","url imagens externas","url da imagem","link da imagem","imagens"],C:["codigo de barras","cod barras","codigo barras","barcode"],D:["codigo pai","pai"],E:["referencia","ref","sku","codigo","cod"],F:["descricao","nome","produto","nome do produto","titulo","descricao do produto"],G:["codigo do fornecedor","cod fornecedor","codigo fornecedor","ref fornecedor","cod no fornecedor"],H:["fornecedor"],I:["categoria","categoria do produto"],J:["subcategoria","sub categoria"],K:["tamanho","medida","numero"],L:["cor"],M:["observacao","observacoes","obs"],N:["peso","gramas","peso g","peso kg","peso (kg)","peso bruto","peso bruto kg","peso liquido kg","peso liquido","peso liquido g"],O:["milesimos de banho","milesimos","milesimos banho"],P:["custo de compra","custo compra","custo","preco de custo","valor de custo"],Q:["custo de insumos","insumos"],R:["custo do banho de ouro","banho de ouro"],S:["custo do banho de rodio","banho de rodio"],T:["custo do banho de prata","banho de prata"],U:["custo do banho de verniz","verniz","custo verniz"],V:["preco de varejo","preco","preco de venda","valor","varejo","preco venda","valor de venda"],W:["quantidade","qtd","estoque","qtde","estoque inicial","estoque atual","estoque, atual"],X:["localizacao","local"],Y:["numero ncm","ncm"],Z:["numero ean","ean","gtin","gtin ean"],AA:["cfop"],AB:["fcp"],AC:["imposto","icms"],AD:["exibir no catalogo","catalogo"],AE:["status","situacao"]};
export function traduzF(f,cols){const mapa={},fat={};cols.forEach((c,i)=>{if(c.k&&!(c.k in mapa)){mapa[c.k]=letraN(i);const z=(c.tipo==="numero"||c.tipo==="inteiro"||c.tipo==="dinheiro")?num(c.fator):null;if(z!=null&&z>0&&z!==1)fat[c.k]=z}});let falta=false;
  /* a fórmula foi escrita com os valores internos (ex.: peso em gramas); se a coluna sai convertida pelo fator (kg = g × 0,001), a referência volta à unidade interna */
  const out=String(f).replace(/([A-Za-z]{1,2})([0-9]+)/g,(m,a,n)=>{a=a.toUpperCase();if(!(a in mapa)){falta=true;return m}return fat[a]?"("+mapa[a]+n+"/"+fat[a]+")":mapa[a]+n});return falta?null:out}
export function celulas(row,r,sugestao){
  const c=celulasBase(row,r);
  if(sugestao&&row.mk&&vazio(row.v.V)){   /* só o formulário pede a sugestão; tabela e arquivo saem sem preço se ele não foi digitado */const iv=LET.indexOf("V");let soma=0;["P","Q","R","S","T","U"].forEach(L=>{const x=c[LET.indexOf(L)];if(x&&typeof x.v==="number")soma+=x.v;else if(x&&x.f){const n=typeof x.calc==="number"?x.calc:numRaw(row.v[L],row.v);if(n!=null)soma+=n}});
    c[iv]={v:r2c(soma*row.mk),f:`ROUND((P${r}+Q${r}+R${r}+S${r}+T${r}+U${r})*${row.mk},2)`}}
  return c;
}
export const r2c=x=>Math.round(+(x*100).toPrecision(12))/100;
export const kDesc=d=>Math.round(d*1e6)/1e8;
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
