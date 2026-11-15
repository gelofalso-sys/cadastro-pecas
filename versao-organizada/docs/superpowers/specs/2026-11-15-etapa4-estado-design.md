# Etapa 4 — Estado explícito: desenho

Data: 15/11/2026. Detalha a Etapa 4 de [PLANO-TRANSICAO-SAAS.md](../../PLANO-TRANSICAO-SAAS.md). Decisões delegadas pelo dono ("siga melhor caminho").

## Intenção
Acabar com os globais mutáveis de nível superior (hoje 45) para que cada pedaço de estado tenha dono e nenhum módulo escreva em variável de outro. Serve a quem mexe no código (IA e pessoas) e prepara o servidor reaproveitar o domínio. Não muda tela, backup, chaves nem comportamento.

## Medição (15/11/2026, contagem de ocorrências do nome em `src/`, inclui variáveis locais homônimas)
Grandes: `S` 967, `ROM` 492, `G` 151, `editId` 120, `abertos` 101, `sel` 88, `rascunho` 83, `NF` 68. Médios: `dirty` 42, `conflito` 33, `TABS` 30, `ROMS` 30, `HIST` 25, `celEd` 24, `db` 23, `romConflito` 21, `undo` 20. Pequenos (até 19 ocorrências): cerca de 20 nomes (`romGravP`, `romST`, `AUTOR`, `sT`, `ftSalvas`, `lastExport`, `REDO`, `romUI`, `romTem`, `chain`, `tabArm`, `snapL`, `romInfo`, `corrompido`, `romArm`, `snapC`, `ARQ`, `restaurando`, `relTem`, `bancoAberto`, `impT`, `impConfigAntes`, `histSep`, `romCriando`, `romChaveL`, `HIST_SUG`). Nomes curtos (`w`, `erro`, `db`) também aparecem como variável local: renomear por texto é inseguro.

## Abordagens
- **A (escolhida): em duas partes.** 4.1 agrupa os globais pequenos e médios em objetos de estado por dona (`estadoArmazenamento`, `estadoRomaneio`, `estadoTabelas`, `estadoConfig`, `estadoPlanilha`, `estadoLancamento`, o padrão que as fatias já usam), com um codemod que usa a análise de escopo do ESLint (só troca referências que resolvem ao global, nunca locais). Prova: suíte verde, comportamento idêntico. 4.2 (S, ROM, G, editId, abertos, sel, rascunho, NF) e 4.3 (`despachar` com ações nomeadas, piloto em "lançar peça"; desfazer por ações) ficam para planos próprios, depois do 4.1.
- B: tudo de uma vez, com `estado` único e `despachar`: renomeia 2.000+ referências e troca o modelo do desfazer no mesmo passo; qualquer regressão vira difícil de localizar.
- C: só adicionar `despachar` por cima dos globais: dá a forma nova sem tirar os globais; os dois modelos convivem e a dívida cresce.

## Decisões deste desenho
- **O desfazer por ações (HIST/REDO) NÃO entra no 4.1.** É o comportamento mais sensível do app; só depois de o estado estar agrupado.
- **`salvar()` segue síncrono**, como na Etapa 3.
- Cada global pequeno tem uma dona; quem precisa mudar o valor chama função da dona (já é a regra das fatias). Escrita direta em `estadoX.campo` de outra fatia conta como violação a registrar, não a consertar aqui.
- Ordem de agrupamento pela dona hoje: `armazenamento` (24) primeiro, depois `romaneio`, `tabelas`, `configuracao`, `planilha`, base `src/js`.

## Objetivos / não objetivos
- 4.1: globais mutáveis de 45 para 19 (só os grandes e médios ficam: `S`, `ROM`, `G`, `editId`, `abertos`, `sel`, `rascunho`, `NF`, `dirty`, `conflito`, `TABS`, `ROMS`, `HIST`, `REDO`, `celEd`, `db`, `romConflito`, `undo`, `erro`; HIST e REDO juntos até o desfazer por ações); suíte verde com `CP_BACKUP`; hash do HTML muda, a prova é a suíte.
- Não objetivos: mudar formato de backup/chaves/IndexedDB, mexer em UI, `despachar`, desfazer por ações, UUID.
- Anti-objetivo: renomear por regex textual; mudar a ordem de gravação.

## Fica ao construtor
Nome exato dos campos, ordem de migração dentro de cada dona, forma do codemod, ajuste dos testes `vm` que recortam fontes e leem esses nomes (renomear stubs, como na Etapa 3).
