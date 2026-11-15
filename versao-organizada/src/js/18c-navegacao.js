function rolarPane(el){if(!el)return;visPara(el.closest&&el.closest("#cfg")?"cad":"lancar",true);if(celular()&&el.id==="romWrap")formAbrir(false);if(celular()){el.scrollIntoView({block:"start",behavior:"smooth"});return}
  const pb=document.getElementById("paneBot");if(pb)pb.scrollTo({top:pb.scrollTop+el.getBoundingClientRect().top-pb.getBoundingClientRect().top-6,behavior:"smooth"})}
function irPara(id){
  if(id==="lancar"&&celular()){visPara("lancar");formAbrir(true);return}
  if(id==="lancar"){visPara("lancar");document.getElementById("paneBot").scrollTo({top:0,behavior:"smooth"});refocar("#f-F");return}
  visPara("cad");abertos.tab=id;guardarAbertos();renderCfg();const d=document.querySelector("#cfg .ctabs");if(d)rolarPane(d);
}
