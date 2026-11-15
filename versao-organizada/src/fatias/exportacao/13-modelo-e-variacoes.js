/* ===== modelo configurável: regras de cada coluna do arquivo (tipo, obrigatória, padrão, tamanho, lista) ===== */
   /* o Excel recusa apóstrofo nas pontas e o nome History */
/* valor final de uma célula do arquivo: aplica o valor padrão (se vazia) e o tipo da coluna */
/* ===== variações no arquivo: produto pai + variações (modelo com "Agrupar em produto pai + variações") =====
   Cada peça com 2 ou mais linhas (banhos e/ou tamanhos) vira 1 linha de produto + 1 linha por variação, com
   descrição "Tamanho:14;Cor:Ouro" e o código do pai. Colunas automáticas: @desc, @pv e @pai. */
/* valor "cru" de uma coluna do modelo para uma linha de saída (colunas @ são automáticas) */
/* confere cada linha com as regras do modelo; devolve a lista de problemas */
/* descobre a coluna interna de um título de planilha qualquer (nomes do modelo atual, nomes do Jueri e sinônimos) */
/* fórmulas guardam as letras internas (N, P…U); no arquivo viram as letras do modelo. Sem a coluna no modelo, vai só o valor. */
/* centavos no arredondamento comercial (1,005 → 1,01), sem o erro do ponto flutuante */
/* o percentual de desconto entra no coeficiente com precisão total (1,234% = 0,01234) */
/* uma fórmula digitada vale para a própria linha: as referências saem apontando para a linha real (no app e no Excel dão o mesmo número) */

