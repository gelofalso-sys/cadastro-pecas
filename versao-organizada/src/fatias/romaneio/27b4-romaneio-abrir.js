/* abre (ou retoma) o romaneio: usado pelo botão e pelo aviso de edição em curso */
function romAbrirNovo(){if(!romRetomar()){ROM={tid:abertos.romT&&cfg().romaneios.some(x=>x.id===abertos.romT)?abertos.romT:cfg().romaneios[0].id,texto:"",rows:[],obs:"",conf:"",msg:""};
      {const T0=romT();if(T0&&T0.forn&&fornBy(T0.forn))romSetForn(T0.forn)}}
      renderRom();const w=document.getElementById("romWrap");if(w){rolarPane(w);const ta=w.querySelector("textarea");if(ta)ta.focus({preventScroll:true})}}
