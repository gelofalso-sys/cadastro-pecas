/* ===== colar romaneio: lê a lista do fornecedor com um modelo de leitura ===== */
/* padrão com quantificador dentro de grupo também quantificado, ex.: (a+)+ ou (\d*)* , pode travar a aba: não é aceito */
   /* o mesmo limite vale para texto colado e para o texto lido do PDF */
const romT=()=>{const C=cfg();return C.romaneios.find(t=>t.id===(ROM&&ROM.tid))||C.romaneios[0]};
   /* preço com 3-4 casas não é arredondado */
let ROM=null;
