/* ===== assistente "Outro sistema": escolhe a planilha modelo do sistema de destino e confere as colunas ===== */
let NOVO=null;
const TIPO_PAD={V:"dinheiro",P:"dinheiro",Q:"dinheiro",R:"dinheiro",S:"dinheiro",T:"dinheiro",U:"dinheiro",W:"inteiro",N:"numero"};
const csvLinha=(l,sep)=>{const o=[];let c="",q=false;for(let i=0;i<l.length;i++){const ch=l[i];
  if(q){if(ch==='"'){if(l[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}else if(ch==='"')q=true;else if(ch===sep){o.push(c);c=""}else c+=ch}o.push(c);return o};
function abrirNovoSistema(){NOVO=null;
  repModal(`<div class="rep-h"><div><b class="rep-t">Exportar para outro sistema</b><div class="hint">Baixe no outro sistema a <b>planilha modelo de importação de produtos</b> (costuma se chamar “planilha modelo” ou “tabela modelo”) e escolha o arquivo aqui. O app lê só a primeira linha, com os nomes das colunas, e não guarda o resto.</div></div><div class="rep-ac"><button type="button" class="btn sm" data-act="rel-fechar">Cancelar</button></div></div>
  <div class="rep-rf" data-novo style="padding:22px 18px;border:2px dashed var(--line);margin:14px 18px;border-radius:12px;justify-content:center"><label class="btn pri big" style="cursor:pointer">Escolher a planilha modelo<input type="file" id="fileNovo" accept=".xlsx,.xls,.csv" hidden></label><span class="hint">ou solte o arquivo aqui · .xlsx, .xls ou .csv</span></div>`)}
async function lerNovo(file){
  try{let hdr,formato="xlsx",sep=";";checaTam(file,MAX_PLANILHA_BYTES,"A planilha");
    if(/[.]csv$/i.test(file.name)){const buf=new Uint8Array(await file.arrayBuffer());if(buf.length>MAX_PLANILHA_LINHAS&&buf.reduce((n,b)=>n+(b===10?1:0),0)+1>MAX_PLANILHA_LINHAS)throw limErr(`Esse CSV tem mais de ${MAX_PLANILHA_LINHAS} linhas, que é o limite`);let t;try{t=new TextDecoder("utf-8",{fatal:true}).decode(buf)}catch(e){t=new TextDecoder("windows-1252").decode(buf)}
      t=t.replace(/^﻿/,"");const l1=t.split(/\r?\n/)[0]||"",cnt=c=>l1.split(c).length-1,tab=String.fromCharCode(9);
      sep=cnt(tab)>Math.max(cnt(";"),cnt(","))?"tab":cnt(";")>=cnt(",")&&cnt(";")>0?";":",";hdr=csvLinha(l1,sep==="tab"?tab:sep);formato="csv"}
    else{if(typeof XLSX==="undefined")throw new Error("a biblioteca de planilha não carregou");
      const bytes=new Uint8Array(await file.arrayBuffer());
      if(!((bytes[0]===0x50&&bytes[1]===0x4B)||(bytes[0]===0xD0&&bytes[1]===0xCF&&bytes[2]===0x11&&bytes[3]===0xE0)))throw new Error("esse arquivo não é uma planilha do Excel válida (.xlsx ou .xls). Se for texto, salve como .csv");
      const wb=XLSX.read(bytes,{type:"array"});checaLinhasPlan(wb.Sheets[wb.SheetNames[0]]);const aoa=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:null});hdr=(aoa[0]||[]).map(x=>x==null?"":String(x))}
    hdr=hdr.map(h=>String(h).replace(/[\t\r\n]+/g," ").trim());while(hdr.length&&!hdr[hdr.length-1])hdr.pop();
    if(!hdr.some(Boolean)||hdr.length>200)throw new Error("não achei os nomes das colunas na primeira linha");
    const usados=new Set(),cols=hdr.map(h=>{let k=h?(chaveDoCabecalho(h)||""):"";if(k&&usados.has(k))k="";if(k)usados.add(k);
      const c={k,h:h.slice(0,80),auto:!!k};if(k&&TIPO_PAD[k])c.tipo=TIPO_PAD[k];if(k==="N"&&/\bkg\b/i.test(h))c.fator="0.001";return c});
    NOVO={nome:file.name.replace(/[.][^.]+$/,"").slice(0,60),formato,sep,dec:sep===","?".":",",cols};{const tt=document.getElementById("toast");if(tt)tt.hidden=true}mostrarNovo()}
  catch(e){toast("Não consegui ler essa planilha: "+(e&&e.message?e.message:"arquivo inválido")+".")}}
function mostrarNovo(){const N=NOVO,reco=N.cols.filter(c=>c.k).length,chaves=[["","(deixar em branco)"],...LET.map(L=>[L,NOME[L]])];
  repModal(`<div class="rep-h"><div><b class="rep-t">Conferir as colunas</b><div class="hint">${reco} de ${N.cols.length} colunas reconhecidas. Ajuste o que estiver errado; o resto sai em branco. Arquivo: ${N.formato==="csv"?"texto (.csv)":"planilha (.xlsx)"}.</div></div><div class="rep-ac"><button type="button" class="btn pri sm" data-act="novo-ok">Usar este modelo</button><button type="button" class="btn sm" data-act="rel-fechar">Cancelar</button></div></div>
  <div class="rep-rf"><label class="fl" style="width:280px"><span>Nome do sistema</span><input data-nv="nome" value="${esc(N.nome)}"></label></div>
  <div class="rep-tb"><table class="cfg"><thead><tr><th>Coluna do outro sistema</th><th>Vai receber</th><th></th></tr></thead><tbody>${N.cols.map((c,i)=>`<tr class="${c.k?"":"nv-nao"}"><td>${esc(c.h||"(sem nome)")}</td><td><select data-nv="k" data-i="${i}" style="width:250px">${opts(chaves,c.k||"")}</select></td><td class="hint">${c.k?"✓ reconhecida":"em branco"}</td></tr>`).join("")}</tbody></table></div>`)}
/* modelo em arquivo .json: guardar, passar a outra pessoa ou ter um por sistema de destino */
async function modeloParaJson(mo){const dl=await obterDL();
  const o={app:"cadastro-pecas-modelo",v:1,modelo:{nome:mo.nome,formato:mo.formato==="csv"?"csv":"xlsx",agrupar:mo.agrupar==="sim"?"sim":"",lote:num(mo.lote)>0?String(Math.trunc(num(mo.lote))):"",sep:mo.sep||";",dec:mo.dec||",",enc:mo.enc||"utf8bom",aba:mo.aba||"",cols:mo.cols.map(c=>({k:c.k||"",h:c.h||"",on:c.on!==false,tipo:c.tipo||"",obrig:!!c.obrig,padrao:c.padrao||"",max:c.max||"",lista:c.lista||"",fator:c.fator||""}))}};
  try{await dl.save({filename:"modelo-"+String(mo.nome||"planilha").replace(/[^A-Za-z0-9 _-]/g,"-")+".json",data:new Blob([JSON.stringify(o,null,2)],{type:"application/json"})});toast("Modelo salvo.")}catch(e){if(!e||e.code!=="declined")toast("Não consegui salvar o modelo.")}}
function modeloDeJson(file){const fr=new FileReader();fr.onload=()=>{try{
  const o=JSON.parse(fr.result);if(!o||o.app!=="cadastro-pecas-modelo"||o.v!==1||!o.modelo||!Array.isArray(o.modelo.cols))throw new Error("este arquivo não é um modelo do Cadastro de Peças");
  const m=o.modelo,cs=m.cols;if(!cs.length||cs.length>200)throw new Error("o modelo precisa ter de 1 a 200 colunas");
  const tx=(v,n)=>typeof v==="string"?v.slice(0,n):"";
  const cols=cs.map(c=>{if(!c||typeof c!=="object")throw new Error("há uma coluna inválida");
    const k=LET.includes(c.k)||["@desc","@pv","@pai"].includes(c.k)?c.k:"",tipo=TIPOS_COL.some(t=>t[0]===c.tipo)?c.tipo:"",mx=Math.trunc(num(c.max)||0);
    const x={k,h:tx(c.h,80).replace(/[\t\r\n]+/g," ").trim(),on:c.on!==false};if(tipo)x.tipo=tipo;if(c.obrig===true)x.obrig=true;if(tx(c.padrao,200))x.padrao=tx(c.padrao,200);if(mx>0&&mx<=9999)x.max=String(mx);if(tx(c.lista,1000))x.lista=tx(c.lista,1000);{const fz=num(c.fator);if(fz!=null&&fz>0&&fz<=1e6&&fz!==1)x.fator=String(fz)}return x});
  const mo={id:uid(),nome:tx(m.nome,60)||file.name.replace(/[.][^.]+$/,""),cols,formato:m.formato==="csv"?"csv":"xlsx"};
  if(m.agrupar==="sim")mo.agrupar="sim";{const lt=Math.trunc(num(m.lote)||0);if(lt>0&&lt<=100000)mo.lote=String(lt)}if([";",",","tab"].includes(m.sep))mo.sep=m.sep;if([",","."].includes(m.dec))mo.dec=m.dec;if(["utf8","utf8bom"].includes(m.enc))mo.enc=m.enc;if(tx(m.aba,31))mo.aba=tx(m.aba,31);
  const C=cfg();C.modelos.push(mo);C.modelo=mo.id;salvar(true,false);render();toast(`Modelo “${mo.nome}” aberto: ${cols.length} colunas.`)
  }catch(e){toast("Não consegui abrir o modelo: "+(e&&e.message?e.message:"arquivo inválido")+".")}};fr.readAsText(file)}
