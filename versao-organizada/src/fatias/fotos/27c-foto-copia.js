/* a cópia leva a foto original (qualidade cheia) do banco, não só a miniatura */
function fotoCopia(de,para){try{idbGet("fotos",de).then(v=>{if(v)idbPut("fotos",para,v)}).catch(()=>{})}catch(e){}}
