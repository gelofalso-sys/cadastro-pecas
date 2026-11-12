/* ===== limites de entrada (conferidos ANTES de ler o arquivo, com mensagem clara) ===== */
const MB=1048576,
  MAX_PLANILHA_BYTES=15*MB,      /* planilha / CSV importada */
  MAX_PLANILHA_LINHAS=20000,     /* linhas de uma planilha importada */
  MAX_PDF_BYTES=30*MB,           /* PDF do romaneio e da nota fiscal */
  MAX_PDF_PAGINAS=120,           /* paginas de um PDF */
  MAX_XML_BYTES=8*MB,            /* XML da nota fiscal */
  MAX_FOTO_BYTES=32*MB,          /* foto */
  MAX_BACKUP_BYTES=150*MB,       /* backup JSON ao restaurar */
  MAX_TEXTO_COLADO=400000;       /* caracteres de uma lista colada */
const limErr=m=>{const e=new Error(m);e.lim=1;return e};
const fmtMB=n=>(n/MB).toFixed(n<10*MB?1:0).replace(".",",");
/* confere o tamanho do arquivo antes de ler; lanca erro com mensagem clara se passar */
function checaTam(f,max,oque){if(f&&f.size>max)throw limErr(`${oque} “${f.name||"arquivo"}” tem ${fmtMB(f.size)} MB e o limite é ${fmtMB(max)} MB`);return f}
function checaPaginas(doc){if(doc.numPages>MAX_PDF_PAGINAS){try{doc.destroy()}catch(e){}throw limErr(`Esse PDF tem ${doc.numPages} páginas e o limite é ${MAX_PDF_PAGINAS}`)}return doc}
function checaLinhasPlan(ws){const r=ws&&ws["!ref"]?XLSX.utils.decode_range(ws["!ref"]):null;if(r&&r.e.r+1>MAX_PLANILHA_LINHAS)throw limErr(`Essa planilha tem ${r.e.r+1} linhas e o limite é ${MAX_PLANILHA_LINHAS}`);
  if(r&&r.e.c+1>300)throw limErr(`Essa planilha tem ${r.e.c+1} colunas e o limite é 300`);if(r&&(r.e.r+1)*(r.e.c+1)>1500000)throw limErr(`Essa planilha é grande demais (${(r.e.r+1)*(r.e.c+1)} células; o limite é 1.500.000)`)}
/* ===== as 31 colunas do modelo ===== */
/* Modelo da planilha: nome, ordem e quais colunas saem no arquivo. Os dados continuam guardados nas 31 colunas internas (A–AE); cada coluna do modelo diz de qual delas pega o valor. */
const modeloJueri=()=>({id:"jueri",nome:"Jueri",cols:LET.map((k,i)=>({k,h:HEAD[i],on:true}))});
/* Modelo Bling: as 59 colunas da "Tabela modelo" oficial (Importar e atualizar produtos), na mesma ordem. Colunas sem dado nosso saem em branco. */
const modeloBling=()=>{const B=(h,k,o)=>({k:k||"",h,on:true,...(o||{})});
  return {id:"bling",nome:"Bling",formato:"csv",agrupar:"sim",lote:"1000",sep:",",dec:".",enc:"utf8bom",cols:[
  B("ID"),B("Código","E",{tipo:"texto",obrig:true,max:"60"}),B("Descrição","@desc",{obrig:true}),B("Unidade","",{padrao:"UN"}),B("NCM","Y",{tipo:"texto"}),B("Origem","",{padrao:"0"}),B("Preço","V",{tipo:"dinheiro",obrig:true}),B("Valor IPI fixo"),B("Observações","M"),
  B("Situação","AE",{padrao:"Ativo",lista:"Ativo;Inativo"}),B("Estoque","W",{tipo:"inteiro"}),B("Preço de custo","P",{tipo:"dinheiro"}),B("Cód no fornecedor","G"),B("Fornecedor"),B("Localização","X"),B("Estoque maximo"),B("Estoque minimo"),
  B("Peso líquido (Kg)","N",{tipo:"numero",fator:"0.001"}),B("Peso bruto (Kg)"),B("GTIN/EAN","Z",{tipo:"texto"}),B("GTIN/EAN da embalagem"),B("Largura do Produto"),B("Altura do Produto"),B("Profundidade do produto"),B("Data Validade"),
  B("Descrição do Produto no Fornecedor"),B("Descrição Complementar"),B("Itens p/ caixa"),B("Produto Variação","@pv"),B("Tipo Produção"),B("Classe de enquadramento do IPI"),B("Código da lista de serviços"),B("Tipo do item"),
  B("Grupo de Tags/Tags"),B("Tributos"),B("Código Pai","@pai",{tipo:"texto"}),B("Código Integração"),B("Grupo de produtos"),B("Marca"),B("CEST"),B("Volumes"),B("Descrição Curta"),B("Cross-Docking"),B("URL Imagens Externas","B",{tipo:"texto"}),B("Link Externo"),
  B("Meses Garantia no Fornecedor"),B("Clonar dados do pai"),B("Condição do produto"),B("Frete Grátis"),B("Número FCI"),B("Vídeo"),B("Departamento"),B("Unidade de medida"),B("Preço de compra"),B("Valor base ICMS ST para retenção"),
  B("Valor ICMS ST para retenção"),B("Valor ICMS próprio do substituto"),B("Categoria do produto"),B("Informações Adicionais")]}};   /* Fornecedor e Categoria ficam em branco: o Bling recusa nomes que ainda não existem nele (testado no "Validar") */
const HEAD=["ID","Foto","Código de Barras","Código Pai","Referência","Descrição","Código do Fornecedor","Fornecedor","Categoria","Subcategoria","Tamanho","Cor","Observação","Peso","Milésimos de Banho","Custo de Compra","Custo de Insumos","Custo do Banho de Ouro","Custo do Banho de Ródio","Custo do Banho de Prata","Custo do Banho de Verniz","Preço de Varejo","Quantidade","Localização","Número NCM","Número EAN","CFOP","FCP","Imposto","Exibir no Catálogo","Status"];
const LET=HEAD.map((_,i)=>{let s="",n=i+1;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s});
const NOME=Object.fromEntries(LET.map((l,i)=>[l,HEAD[i]]));
const COLW=[5.71,57.14,22.29,15.14,11,39.57,10.57,9.71,11.29,7.86,7.43,9,40,7,9,12,10,12,12,12,12,10,9,10,11,10,7,6,8,10,8];
const NUM=new Set(["N","O","P","Q","R","S","T","U","V","W","Y","AA","AB","AC"]);
/* Valores monetários em centavos; peso conserva milésimos de grama. */
const DUAS=new Set(["P","Q","R","S","T","U","V"]);
const MONEY=new Set(["P","Q","R","S","T","U","V"]);
const milDe=(b,cat)=>{const m=b&&b.milCat&&cat!=null?b.milCat[cat]:undefined;return (m!==undefined&&m!==null&&m!=='')?m:(b?b.mil:"")};
const multDe=(b,cat)=>{const m=b&&b.multCat&&cat!=null?b.multCat[cat]:undefined;return (m!==undefined&&m!==null&&m!=='')?m:(b?b.mult:"")};
const multItem=(l,b,cat)=>{const o=l&&l.ov&&l.ov[b.id],v=o&&o._m;return (v!=null&&String(v).trim()!=="")?v:multDe(b,cat)};
function resumoCat(bh){const out=[];const nomes=new Set();bh.banhos.forEach(b=>{Object.keys(b.milCat||{}).concat(Object.keys(b.multCat||{})).forEach(n=>nomes.add(n))});
  nomes.forEach(n=>{const p=bh.banhos.map(b=>{const m=(b.milCat||{})[n],v=(b.multCat||{})[n];return (m||v)?`${b.nome} ${m?m+"‰":""}${m&&v?" · ":""}${v?"R$ "+v:""}`:""}).filter(Boolean);if(p.length)out.push(`${n}: ${p.join(" / ")}`)});return out.join(" · ")}
const BANHO_COLS={R:"Ouro",S:"Ródio",T:"Prata"};
const FORMULA=new Set(["R","S","T","U"]);
/* colunas que, na peça bruta, são de cada banho (linha A, B…) */
const POR_BANHO=new Set(["L","O","R","S","T","U","W"]);

function colcfgPadrao(){
  const c={};LET.forEach(L=>c[L]={form:true,manter:false,padrao:"",opcoes:"",obrig:false});
  ["H","I","J","M"].forEach(L=>c[L].manter=true);
  ["F","V","W"].forEach(L=>c[L].obrig=true);
  c.Q.padrao="0.5";c.Y.padrao="71131100";c.AA.padrao="5102";c.AB.padrao="2";c.AD.padrao="Não";c.AE.padrao="Ativo";
  return c;
}
const BANHISTA0={id:"scarlat",nome:"Galvânica 1",verniz:"0.42",vernizOn:true,banhos:[
  {id:"ouro",nome:"Ouro",letra:"A",cor:"Ouro",mil:"1",modo:"peso",mult:"1.5",coluna:"R",sufixo:"",marcado:true,vz:true},
  {id:"prata",nome:"Prata",letra:"B",cor:"Prata",mil:"50",modo:"peso",mult:"1.54",coluna:"T",sufixo:" banho prata",marcado:true,vz:true}]};
/* A variação (tamanhos de anel, letras…) fica dentro da categoria: subs vazio = vale para toda a categoria; com nomes = só nessas subcategorias. */
const mkGrade=(subs,id)=>({id:id,nome:"Tamanhos de anel",rotulo:" aro ",col:"K",subs:subs||[],itens:Array.from({length:15},(_,i)=>String(11+i)).map((n,i)=>({id:"a"+n,letra:String.fromCharCode(65+i),nome:n}))});
const SEM_AC_MARCAS=/[\u0300-\u036f]/g;
const semAc=s=>String(s==null?"":s).normalize("NFD").replace(SEM_AC_MARCAS,"").trim().toLowerCase();
function letraN(i){let s="",n=i+1;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s}
function proxLetra(us){for(let i=0;i<702;i++){const s=letraN(i);if(!us.includes(s))return s}return "Z"}
/* Categorias e subcategorias como estão cadastradas no Jueri (Produto > Categoria). Prata 925 não tem subcategoria no Jueri: as daqui servem só para escolher o prefixo da referência e não vão para a planilha. */
const PRATA_SUBS=["Brincos","Colares","Anéis","Pulseiras","Pingentes","Conjuntos"];
const JUERI_CATS=[
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
const ROM_PESO=()=>({id:"pedido-peso",nome:"Pedido com itens por peso (GR)",padrao:"{item} {cod} {desc} {u}{qv} {pu} {total}",ini:"Unit. Total",fim:"Total Produtos",obsRe:"N. Pedido:\\s*(\\d+)",mapa:"Brinco=Brincos; Corrente=Colares>Correntes; Pingente=Pingentes; Anel=Anel; Pulseira=Pulseiras; Colar=Colares",auto:false,custo:"preco",valorRe:"Total Produtos:\\s*(\\d[\\d.]*,\\d{2})"});
const ROMS0=()=>[{id:"carlinha",nome:"Clube de Compras da Carlinha",
  padrao:"{desc} [#{cod}] R$ {preco} R$ {precod} {qtd} R$ {total}",ini:"Valor Total",fim:"Valor Produtos",lixo:"P.gina \\d+/\\d+",
  obsRe:"Romaneio do (.+?) Pedido",mapa:"Colar=Colares; Corrente=Colares>Correntes; Choker=Colares>Chokers; Brinco=Brincos; Argola=Brincos>Argolas; Pingente=Pingentes; Anel=Anel; Pulseira=Pulseiras; Conjunto=Conjuntos",
  custo:"precod",qtdRe:"Quantidade Total de Produtos:\\s*(\\d+)",valorRe:"Valor Produtos(?: \\(sem desconto\\))?:\\s*R\\$\\s*(\\d[\\d.]*,\\d{2})"},ROM_PESO()];
const DEFAULT_CONFIG={
  modelos:[modeloJueri()],modelo:"jueri",v9:true,v10:true,v12:true,seqs:{BR:"1669",CO:"0",AN:"0",PU:"0",TZ:"0",CJ:"0",PG:"0",AC:"0",IN:"0",MA:"0",PE:"0",RL:"0"},ordem:"int",v11:true,colcfg:colcfgPadrao(),banhistas:[],grades:[],romaneios:ROMS0(),
  categorias:JUERI_CATS.map(j=>({nome:j.nome,prefixo:j.prefixo,...(j.sufixo?{sufixo:j.sufixo}:{}),subs:[...j.subs],...(j.subPref?{subPref:{...j.subPref}}:{}),...(j.subSoRef?{subSoRef:{...j.subSoRef}}:{}),...(j.gr?{grade:mkGrade(j.gr.subs,j.gr.id)}:{})})),
  fornecedores:[],   /* instalação nova começa sem fornecedores, galvânica de exemplo nem observações: o usuário cadastra os dele */
  cores:["Ouro","Prata","Ródio","Prata 925","Ródio negro","Rosé","Azul","Cristal","Branco","Preto","Verde","Vermelho","Rosa","Lilás","Roxo","Amarelo","Laranja","Marrom","Grafite","Champagne","Nude","Turquesa","Pérola","Bege","Cinza","Multicolorido"],
  observacoes:[]
};
const FORM0=()=>({tipo:"bruta",desconto:"0",banhista:"",v:{I:"Brincos"},on:{},ov:{},vz:{},vinc:false,grade:"",gsel:[],csel:[],semGrade:false});

const clone=o=>JSON.parse(JSON.stringify(o));
/* miniatura de foto só vale se for imagem em data: URL (nada de javascript:, http: ou aspas) */
const ftOk=u=>typeof u==="string"&&u.length<2e7&&/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=]*$/.test(u);
const fs=u=>ftOk(u)?esc(u):"";
/* CSV: texto que começa com = + - @ vira fórmula no Excel; recebe um apóstrofo na frente (números ficam como estão) */
const csvq=x=>{let s=String(x==null?"":x);if(/^[=+@\t\r]/.test(s)||(s[0]==="-"&&!/^-\d+([.,]\d+)?$/.test(s)))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
const uid=()=>Math.random().toString(36).slice(2,10);
let S={config:clone(DEFAULT_CONFIG),lanc:[],form:FORM0()};
let delCat=null,editId=null,rascunho=null,lastExport=null,undo=null,erro="",sel=new Set(),G=null,celEd=null;
let abertos={};try{const ab0=localStorage.getItem("cadpecas-abertos");abertos=JSON.parse(ab0||"{}");if(ab0==null)abertos.min=true}catch(e){}   /* primeira abertura: formulário só com o essencial (dá para "Mostrar tudo") */
/* zoom (acessibilidade): um para a tabela (t) e outro para o formulário (f); só neste navegador */
const ZM={t:1,f:1};
try{const z=JSON.parse(localStorage.getItem("cadpecas-zoom")||"{}");["t","f"].forEach(k=>{const v=Number(z[k]);if(v>=0.7&&v<=1.6)ZM[k]=Math.round(v*10)/10})}catch(e){}
function zoomAplicar(grava){
  const r=document.documentElement.style;r.setProperty("--zt",ZM.t);r.setProperty("--zf",ZM.f);
  const a=document.getElementById("zvT"),b=document.getElementById("zvF");
  if(a)a.textContent=Math.round(ZM.t*100)+"%";if(b)b.textContent=Math.round(ZM.f*100)+"%";
  if(grava){try{localStorage.setItem("cadpecas-zoom",JSON.stringify(ZM))}catch(e){}}
}
zoomAplicar(false);

