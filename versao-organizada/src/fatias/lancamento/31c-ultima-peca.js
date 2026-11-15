/* campos do banho/banhista: devolve a mensagem de erro ("" = válido). Letra opcional (vazia = a referência sai sem letra), única quando preenchida; milésimos, multiplicador e verniz >= 0 */
/* "Última peça": só dígitos, até 9; avisa quando tira sinal/letras ou corta */
function limpaUlt(raw){raw=String(raw==null?"":raw);const so=raw.replace(/[^0-9]/g,""),ign=raw.replace(/\s/g,"").length;
  if(so.length>9)toast("A última peça aceita no máximo 9 dígitos — o excedente foi cortado.");
  else if(raw.replace(/\s/g,"").length>so.length&&ign)toast("A última peça só aceita dígitos (0–9): sinal e letras foram removidos.");
  return so.slice(0,9)}
