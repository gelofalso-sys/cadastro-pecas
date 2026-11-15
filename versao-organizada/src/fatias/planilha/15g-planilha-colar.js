function lerTsv(t){const NL=String.fromCharCode(10),CR=String.fromCharCode(13),TB=String.fromCharCode(9),Q=String.fromCharCode(34),rows=[];let row=[],cel="",q=false;t=String(t).split(CR).join("");
  for(let i=0;i<t.length;i++){const c=t[i];
    if(q){if(c===Q){if(t[i+1]===Q){cel+=Q;i++}else q=false}else cel+=c}
    else if(c===Q&&cel==="")q=true;else if(c===TB){row.push(cel);cel=""}else if(c===NL){row.push(cel);rows.push(row);row=[];cel=""}else cel+=c}
  if(cel!==""||row.length){row.push(cel);rows.push(row)}return rows}
function colarCel(texto,inicio){
  const {ri,L}=inicio||celEd,c0=LET.indexOf(L);celEd=null;
  let linhas=lerTsv(texto);
  /* cabeçalho colado junto: as colunas são reconhecidas pelo nome (qualquer sistema); sem cabeçalho vale a posição na tabela */
  let keys=null;{const mp=(linhas[0]||[]).map(c=>chaveDoCabecalho(c));if(mp.filter(Boolean).length>=2){keys=mp;linhas=linhas.slice(1)}}
  const keyAt=j=>keys?keys[j]:LET[c0+j];
  const saltos=[];linhas.forEach(cels=>cels.forEach((v,j)=>{if(keyAt(j)!=="E")return;const m=String(v||"").trim().toUpperCase().match(/^([A-Z]+)(\d+)/);if(!m||checaCel("E",v).erro)return;const atual=Math.max(inicioDe(m[1]),(G&&G.cont&&G.cont[m[1]])||0);if(+m[2]>atual+50)saltos.push(String(v).trim())}));
  if(saltos.length&&!confirm("A colagem contém "+saltos.length+" referência(s) que saltam mais de 50 números, como "+saltos.slice(0,3).join(", ")+". Isso pode alterar as próximas referências automáticas. Colar mesmo assim?")){toast("Colagem cancelada; nenhuma célula foi alterada.");return}
  const antes={},ids=[],alvo=[],recus=[];let n=0;{let r=ri;linhas.forEach(()=>{while(!vis(r))r++;alvo.push(r);r++})}
  const aceita=(LL,x,ri2)=>{const ck=checaCel(LL,x);if(ck.erro){recus.push({msg:ck.erro,ri:ri2,L:LL});return false}return true};
  linhas.forEach((cels,i)=>{
    const row=G.linhas[alvo[i]];
    if(row){const l=S.lanc.find(x=>x.id===row.lancId);if(!(l.id in antes))antes[l.id]=clone(l.ov||{});
      cels.forEach((v,j)=>{const LL=keyAt(j);if(LL&&aceita(LL,v,alvo[i])){gravarCel(alvo[i],LL,v.trim());n++}});return}
    const v={};cels.forEach((x,j)=>{const LL=keyAt(j);if(LL&&!vazio(x)&&aceita(LL,x,alvo[i])){v[LL]=x.trim();n++}});
    if(Object.keys(v).length){const l=novaLivre(v);S.lanc.push(l);ids.push(l.id)}
  });
  undo={tipo:"cola",antes,ids};salvar(false);renderTopo();if(editId)renderForm();
  recus.slice(0,20).forEach(z=>marcaRuim(z.ri,z.L));
  toast(`${n} célula(s) coladas${ids.length?` · ${ids.length} linha(s) nova(s)`:""}${recus.length?` · ${recus.length} RECUSADA(S): ${recus[0].msg}`:""}.`,n?{t:"Desfazer",fn:desfazer}:null);
}


