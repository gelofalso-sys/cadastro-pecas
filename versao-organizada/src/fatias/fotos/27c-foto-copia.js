/* a cópia leva a foto original (qualidade cheia) do banco, não só a miniatura */
function fotoCopia(de,para){try{bancoLer("fotos",de).then(v=>{if(v)bancoGravar("fotos",para,v)}).catch(()=>{})}catch(e){}}
