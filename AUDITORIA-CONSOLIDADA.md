# Auditoria consolidada — Cadastro de Peças

Data: 8 de novembro de 2026. Versão examinada: commit `0271809`, arquivo principal `cadastro-pecas.html`. Três agentes revisaram interface, persistência e importação/exportação. A versão local para Chrome tem três linhas adicionais em relação ao arquivo principal.

## Escopo e limites

Os achados abaixo são de inspeção de código e descrevem cenários a reproduzir. Não houve validação visual: a ferramenta de navegador bloqueou a abertura do arquivo local e o acesso indireto ao mesmo conteúdo. Não se afirma cobertura completa nem que os problemas foram corrigidos. As prioridades indicam impacto e urgência estimados, não frequência medida.

## Pendências

### P1 — Sincronização sobrescreve alterações não salvas em outra variação

`sincFormCelula`, linha 2172, substitui os overrides da coluna em todas as variações do formulário. Alterar a quantidade do tamanho A no formulário e, sem salvar, editar a quantidade do tamanho B na tabela pode descartar a edição de A. Preservar as demais variações e testar simultaneamente edições no formulário e na tabela.

### P1 — Salvamento de tabela pode limpar alterações concorrentes

`tabSalvar`, linhas 3005–3014, calcula linhas e IDs, aguarda leituras e gravações, clona o estado em outro momento e finalmente limpa toda a lista quando a opção de começar nova tabela está marcada. Se o estado mudar durante as operações assíncronas, o histórico pode ficar inconsistente ou o trabalho posterior ser limpo. Reproduzir com armazenamento atrasado e alteração concorrente; capturar e validar uma versão consistente antes de limpar.

### P1 — Salvamento pode sobrescrever outra aba após espera

`flush`, linhas 1812–1824, verifica conflito no início, mas não novamente após as esperas de gravação remota ou de miniaturas no caminho de armazenamento cheio. Outra aba pode gravar durante a espera, e a primeira ainda escrever sobre ela. Revalidar o conflito imediatamente antes de cada gravação.

### P1 — Foto trocada durante gravação pode voltar à versão anterior

`guardarMinis`, linhas 1810–1811, grava a imagem de modo assíncrono e marca apenas o ID como salvo. Se a imagem mudar antes da conclusão, uma gravação antiga pode marcar a nova como salva sem que ela esteja no IndexedDB. Associar a confirmação à versão ou ao conteúdo gravado.

### P1 — Ponto anterior à exclusão pode ser criado depois dela

`excluirLinhas` e `excluir`, linhas 4130–4145, iniciam `pontoAuto` sem aguardar a captura; `pontoAuto` espera uma operação antes de chamar `pontoSalvar`. A exclusão pode ocorrer primeiro e o ponto prometido conter o estado posterior. Capturar o estado antes da exclusão e confirmar a persistência ou informar falha.

### P2 — Linhas sem descrição são omitidas na importação

Na importação de romaneio, linha 4584, uma linha com código, quantidade e preço, mas sem descrição, é ignorada sem aviso enquanto as demais podem ser aceitas. Identificar as linhas omitidas ou exigir correção antes de continuar.

### P2 — Limite de planilha não restringe largura ou área

`checaLinhasPlan`, linha 1367, limita somente o número de linhas antes de `sheet_to_json`, linha 3347. Uma planilha com intervalo muito largo pode exigir memória excessiva. Limitar também colunas e quantidade total de células antes da conversão.

### P2 — Limpeza após exportação não detecta mudanças de configuração

`sigLanc` e `gravarExport`, linhas 4236–4240, comparam peças, mas não configurações que afetam valores ou referências geradas. Uma alteração de configuração após exportar pode fazer a tabela corrente divergir do arquivo enquanto a limpeza ainda remove as peças. Comparar a saída exportada ou invalidar a ação ao alterar configuração relevante.

### P2 — Backup grande é avisado, mas continua irrestaurável

O backup manual avisa após salvar um arquivo acima de 150 MB, mas a restauração o recusa. O backup automático também deve ser verificado para esse limite. Oferecer formato ou divisão que possa ser restaurado, além de sinalizar o problema antes de depender do arquivo.

### Risco de desempenho a medir

`sincFormCelula`, linha 2174, recalcula a tabela inteira para cada célula alterada de uma peça em edição. Em colagens e preenchimentos grandes, o custo pode crescer bastante. Não houve medição ou reprodução de travamento.

## Correções verificadas por leitura

- Miniaturas `m:` e fotos `r:` são incluídas na seleção do backup; os dois conjuntos de controle de miniaturas são limpos na restauração.
- O filtro simples de exportação seleciona as linhas correspondentes; o modelo agrupado mantém as variações da peça e informa esse comportamento.
- Quantidades em fórmula são consideradas nos três ramos de geração inspecionados.
- A importação de romaneio bloqueia quantidades inválidas ou decimais e informa linhas com quantidade zero.
- A exportação captura IDs e assinaturas antes das esperas e preserva registros individuais editados depois.
- O ponto de restauração avisa que fotos não voltam no tempo, e IDs presentes em pontos são considerados na limpeza. Isso não equivale a versionar fotos antigas.
- A checagem de número de linhas da planilha agora ocorre antes da conversão.

Essas verificações não substituem testes de interface, persistência, interrupção e concorrência em ambiente isolado.
