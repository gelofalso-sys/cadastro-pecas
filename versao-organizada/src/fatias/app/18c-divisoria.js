(function(){const sp=document.getElementById("splitter"),app=document.getElementById("app");
  try{const v=prefLer("split");if(v)document.documentElement.style.setProperty("--split",v)}catch(e){}
  sp.addEventListener("mousedown",e=>{e.preventDefault();sp.classList.add("on");document.body.classList.add("splitting");const top=app.getBoundingClientRect().top,H=app.clientHeight;
    const mv=ev=>{const y=Math.min(Math.max(ev.clientY-top,120),H-130);document.documentElement.style.setProperty("--split",y+"px")};
    const up=()=>{document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);sp.classList.remove("on");document.body.classList.remove("splitting");try{prefGravar("split",getComputedStyle(document.documentElement).getPropertyValue("--split").trim())}catch(x){}};
    document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up)});
  sp.addEventListener("dblclick",()=>{document.documentElement.style.setProperty("--split","48%");try{prefRemover("split")}catch(x){}});
})();
