(function(){const sp=document.getElementById("splitter"),app=document.getElementById("app");
  try{const v=localStorage.getItem("cadpecas-split");if(v)document.documentElement.style.setProperty("--split",v)}catch(e){}
  sp.addEventListener("mousedown",e=>{e.preventDefault();sp.classList.add("on");document.body.classList.add("splitting");const top=app.getBoundingClientRect().top,H=app.clientHeight;
    const mv=ev=>{const y=Math.min(Math.max(ev.clientY-top,120),H-130);document.documentElement.style.setProperty("--split",y+"px")};
    const up=()=>{document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);sp.classList.remove("on");document.body.classList.remove("splitting");try{localStorage.setItem("cadpecas-split",getComputedStyle(document.documentElement).getPropertyValue("--split").trim())}catch(x){}};
    document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up)});
  sp.addEventListener("dblclick",()=>{document.documentElement.style.setProperty("--split","48%");try{localStorage.removeItem("cadpecas-split")}catch(x){}});
})();
function rolarPane(el){if(!el)return;visPara(el.closest&&el.closest("#cfg")?"cad":"lancar",true);if(celular()&&el.id==="romWrap")formAbrir(false);if(celular()){el.scrollIntoView({block:"start",behavior:"smooth"});return}
  const pb=document.getElementById("paneBot");if(pb)pb.scrollTo({top:pb.scrollTop+el.getBoundingClientRect().top-pb.getBoundingClientRect().top-6,behavior:"smooth"})}
function irPara(id){
  if(id==="lancar"&&celular()){visPara("lancar");formAbrir(true);return}
  if(id==="lancar"){visPara("lancar");document.getElementById("paneBot").scrollTo({top:0,behavior:"smooth"});refocar("#f-F");return}
  visPara("cad");abertos.tab=id;guardarAbertos();renderCfg();const d=document.querySelector("#cfg .ctabs");if(d)rolarPane(d);
}
