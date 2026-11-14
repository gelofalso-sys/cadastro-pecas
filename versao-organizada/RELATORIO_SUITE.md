# Resultado da suíte — Cadastro de Peças unificado

Data: 14/11/2026. Execução integral em cópia temporária (`python tests/run_all.py`), com dados de teste.

**Resultado final:** 161 testes OK, 0 falhas, 0 pulados, com `CP_BACKUP` apontando para o backup completo real de 08/11/2026 (`t18.py` e `t94_backup_real.py` incluídos). Sem `CP_BACKUP` esses dois são pulados (159 OK). A conferência de exportação no Jueri e no Bling continua manual.

## Correções feitas nesta rodada

Código:
- Romaneio: ao trocar a categoria de uma peça já lançada, a referência antiga era mantida (CO1 em vez de AC1); agora entra na sequência do novo prefixo.
- Complementos de descrição: voltaram as palavras iniciais por categoria/subcategoria (subcategoria primeiro) e a cor e os banhos escolhidos ocultam palavras repetidas.
- Celular: seletor Bruta/Pronta do romaneio sem sobreposição, alvos de toque de 44 px (resumo de conjunto, fechar aviso) e campos de 16 px; botão Adicionar fixo no rodapé do formulário e gaveta do formulário abrindo em 80% da tela na primeira abertura.

Testes atualizados para o comportamento intencional da versão unificada: conjunto ativado automaticamente em itens de categoria Conjunto; quantidade informada por banho; planilha no formato do sistema sem mapeamento de colunas; linha sem descrição bloqueia a planilha; descrição não é mais preenchida sozinha nem recebe o texto da categoria. `run_all.py` passou a imprimir em UTF-8 e `t104` não deixa mais o navegador aberto ao falhar.

## Limites

Dois testes tiveram instabilidade de temporização (`t56_rom_acoes`, `t118_conjunto_palavras`) e foram tornados determinísticos; repetidos 3 e 6 vezes, passaram todas. Não foi feita a importação no Jueri e no Bling.
