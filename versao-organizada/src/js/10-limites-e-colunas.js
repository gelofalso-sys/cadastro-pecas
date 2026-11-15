/* ===== limites de entrada (conferidos ANTES de ler o arquivo, com mensagem clara) ===== */
       /* caracteres de uma lista colada ou lida do PDF (medido: ~130 mil caracteres levam uns 5 s para ler; acima de 200 mil a aba ficaria travada por mais de 8 s) */
/* confere o tamanho do arquivo antes de ler; lanca erro com mensagem clara se passar */
function checaLinhasPlan(ws){const r=ws&&ws["!ref"]?XLSX.utils.decode_range(ws["!ref"]):null;if(r&&r.e.r+1>MAX_PLANILHA_LINHAS)throw limErr(`Essa planilha tem ${r.e.r+1} linhas e o limite é ${MAX_PLANILHA_LINHAS}`);
  if(r&&r.e.c+1>300)throw limErr(`Essa planilha tem ${r.e.c+1} colunas e o limite é 300`);if(r&&(r.e.r+1)*(r.e.c+1)>1500000)throw limErr(`Essa planilha é grande demais (${(r.e.r+1)*(r.e.c+1)} células; o limite é 1.500.000)`)}
/* ===== as 31 colunas do modelo ===== */
/* Modelo da planilha: nome, ordem e quais colunas saem no arquivo. Os dados continuam guardados nas 31 colunas internas (A–AE); cada coluna do modelo diz de qual delas pega o valor. */
/* Modelo Bling: as 59 colunas da "Tabela modelo" oficial (Importar e atualizar produtos), na mesma ordem. Colunas sem dado nosso saem em branco. */
   /* Fornecedor e Categoria ficam em branco: o Bling recusa nomes que ainda não existem nele (testado no "Validar") */
/* Valores monetários em centavos; peso conserva milésimos de grama. */
/* colunas que, na peça bruta, são de cada banho (linha A, B…) */

/* A variação (tamanhos de anel, letras…) fica dentro da categoria: subs vazio = vale para toda a categoria; com nomes = só nessas subcategorias. */
/* Categorias e subcategorias como estão cadastradas no Jueri (Produto > Categoria). Prata 925 não tem subcategoria no Jueri: as daqui servem só para escolher o prefixo da referência e não vão para a planilha. */
/* Modelo genérico sem fornecedor ou dados pessoais, para listas com código e valores. */

/* miniatura de foto só vale se for imagem em data: URL (nada de javascript:, http: ou aspas) */
/* CSV: texto que começa com = + - @ vira fórmula no Excel; recebe um apóstrofo na frente (números ficam como estão) */
const uid=()=>Math.random().toString(36).slice(2,10);
let S={config:clone(DEFAULT_CONFIG),lanc:[],form:FORM0()};
let editId=null,rascunho=null,lastExport=null,undo=null,erro="",sel=new Set(),G=null,celEd=null;
let abertos={};try{const ab0=prefLer("abertos");abertos=JSON.parse(ab0||"{}");if(ab0==null)abertos.min=true}catch(e){}   /* primeira abertura: formulário só com o essencial (dá para "Mostrar tudo") */
/* zoom (acessibilidade): um para a tabela (t) e outro para o formulário (f); só neste navegador */
try{const z=JSON.parse(prefLer("zoom")||"{}");["t","f"].forEach(k=>{const v=Number(z[k]);if(v>=0.7&&v<=1.6)ZM[k]=Math.round(v*10)/10})}catch(e){}
function zoomAplicar(grava){
  const r=document.documentElement.style;r.setProperty("--zt",ZM.t);r.setProperty("--zf",ZM.f);
  const a=document.getElementById("zvT"),b=document.getElementById("zvF");
  if(a)a.textContent=Math.round(ZM.t*100)+"%";if(b)b.textContent=Math.round(ZM.f*100)+"%";
  if(grava){try{prefGravar("zoom",JSON.stringify(ZM))}catch(e){}}
}
zoomAplicar(false);

