/* ===== motor: lançamentos -> linhas ===== */
/* validação de número digitado/colado: sem texto, sem negativo; Quantidade = inteiro de 1 em diante */
/* fórmula aceita: só números, células (ex.: P2, AB10), + - * / e parênteses — nenhum nome de função (=RAND(), =HYPERLINK(...) etc.) */
/* quantidade da variação: número maior que zero, ou fórmula (ex.: =1) — a fórmula não pode fazer a linha sumir da exportação */
   /* teto de quantidade por linha */
function marcaRuim(ri,L){const td=document.querySelector(`#sheet tr[data-ri="${ri}"] td[data-c="${L}"]`);if(!td)return;td.style.outline="2px solid #c0392b";td.style.background="#fdecea";setTimeout(()=>{td.style.outline="";td.style.background=""},3000)}
/* "=" só vira fórmula em coluna numérica e com caracteres seguros; em texto (descrição, código…) vale como texto, nunca como fórmula do Excel */
/* avalia uma fórmula segura (números, células, + - * / e parênteses) sem eval/Function (o cabeçalho de segurança do Netlify não permite);
   get(coluna) dá o número da célula referenciada. A linha da referência não conta: vale a própria linha — por isso a exportação reescreve as referências para a linha real */
/* a fórmula está escrita corretamente? (confere só a forma, com as células valendo 1) */
/* número de um valor digitado na linha: aceita fórmula (=2*3, =N2*2) e calcula; rv são os valores digitados da linha */
/* desc = desconto do fornecedor (%): a referência ao custo (P) vale a compra JÁ com desconto, o mesmo número da célula calculada e do arquivo */
/* valor calculado de uma coluna de banho (sem digitação) */
