/* ===== romaneio: peça nova fora da lista, foto por item e insumos do romaneio rateados entre as peças ===== */

/* ---------- peça nova (que não veio no PDF e não sai de dividir um item) ---------- */
function romNovaPeca(){
  romGaranteRom();if(!ROM)return;
  const f=S.form,x={cod:"",desc:"",preco:null,precod:null,total:null,qtd:1,peso:"",q:{},skip:false,aviso:"",cat:f.v.I||"",sub:"",custo:"",extra:true,mk:{},bo:{},on:{},vz:{},ex:{}};
  romNovaCat(x);ROM.rows.push(x);romSalvarSoon();renderRom();
  const i=ROM.rows.length-1,rc=document.querySelector(`#romWrap .rc[data-i="${i}"]`);
  if(rc){rolarPane(rc);const d=rc.querySelector('[data-rp="desc"]');if(d)d.focus()}
  toast("Peça nova no romaneio: preencha descrição, categoria, peso, custo e a quantidade.")}
