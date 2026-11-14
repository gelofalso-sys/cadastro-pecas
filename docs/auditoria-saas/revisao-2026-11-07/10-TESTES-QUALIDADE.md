# 10 — Testes e critérios de qualidade

## Executado nesta revisão

Node v24.18.0 compilou os dois scripts inline sem erro (sem executar UI). Biblioteca local conferida: SheetJS 0.20.3 e hash compatível com lib/LEIA-ME.txt. idLimpo real normaliza o payload de atributo; IDs abc e ab"c colidem após limpeza. Probe isolado de checarLanc NÃO prova XSS porque omite lerLanc.

Existem 26 scripts tests/t*.py. Leitura do runner e amostras confirmou Playwright/Edge e openpyxl. Não foram executados: python/py no PATH eram aliases WindowsApps inacessíveis; run_all também sobrescreve wrapper existente. Não instalar nem modificar ambiente nesta auditoria. RLS, Storage, carga e restore NÃO EXECUTADOS: não há schema/ambiente conectado.

A18: nonzero sem stderr não reprova no runner. t30/t31/t32 acumulam pageerror depois do print sem exit/assert. Corrigir sentinelas de falha antes de confiar no baseline. t30 cobre menu/fila/hash/fator; t31 cobre 7 lotes por peso e 15 itens; t32 cobre múltiplas linhas editáveis. t18 requer CP_BACKUP e não deve usar dados reais em CI.

IDs T01–T18 abaixo são casos planejados, NÃO equivalem aos nomes tests/t1.py etc. Mapear explicitamente durante baseline. Preservar a suíte existente. Testes executáveis de banco serão criados no primeiro PR de fundação, respeitando a proibição de implementar nesta auditoria.

## Corpus mínimo de caracterização

| ID | Comportamento | Fixture / asserção |
|---|---|---|
| T01 | Referências | automática/manual, zeros, mesma categoria, subprefixo, duplicata, ordem preservada |
| T02 | Banhos/grades | ouro/prata/ródio/verniz, peso/fixo, combinações vazias, override por variante |
| T03 | Conjuntos | múltiplos componentes e banhos; total esperado por linha; edição e remoção |
| T04 | Números/preços | pt-BR/en, milhar, casas decimais, zero, inválido, negativo e resíduo de centavos |
| T05 | Jueri | 31 posições padrão, fórmula/tipo, cabeçalhos e zeros em códigos |
| T06 | Bling | 59 posições, pai/filhos, lotes sem separar grupo, BOM/encoding, preço e referência |
| T07 | Modelos próprios | importar/exportar modelo, obrigatório/tamanho/lista, coluna desconhecida e remapeamento de fórmula |
| T08 | Planilha | colar TSV, seleção, copiar, preencher abaixo, excluir variante, desfazer/refazer |
| T09 | Romaneio texto/PDF | identificação fornecedor, quantidades, fotos, lote/revisão, itens ignorados e refazer |
| T10 | NF XML/PDF | encoding, chave, desconto, fracionado/lote, duplicata, divergência de totais e seleção parcial |
| T11 | Fotos | tamanho/formato, original+mini, lote por nome, falha de quota, exclusão durante upload |
| T12 | Persistência | reload com rascunho/edição, quota local, IDB abortado, remoto lento/offline e conflito entre abas |
| T13 | Backup | round trip de cada store, inválido, versão futura, ID malicioso, falha no meio, hashes ausentes |
| T14 | Tabelas/relatórios | salvar nova mantém numeração, autoria legada, restaurar, exportar CSV e fotos referenciadas |
| T15 | Segurança de arquivos | ID/atributo inerte; fórmula CSV neutralizada; PDF/XLSX corrigidos; limites de tempo/memória |
| T16 | UI/acessibilidade | teclado, foco/modal/Escape, zoom, lista mobile, virtualização com fotos |
| T17 | Migração | mesmo snapshot duas vezes não duplica, tenant incorreto negado, rejeitados explícitos |
| T18 | Comando concorrente | mesmo lote 20 chamadas → um efeito; duas edições mesma revisão → uma vence, outra conflito |

Fixtures anonimizadas, pequenas e revisáveis; dados pessoais e chaves não entram no repositório. Para cada bug, caso falha antes e passa depois. Evitar snapshots gigantes sem assertions semânticas.

## Camadas

- Unitário: referência, custo, distribuição de quantidades, arredondamento, parser e serializador puros.
- Integração: adapter IndexedDB com quota/abort, storage com falha, transação SQL com rollback e idempotência.
- Contrato: imports→catalog e catalog→exports; schema versionado e consumidores antigo/novo durante transição.
- API: auth, status, validação, limites, revisão esperada, idempotência e corpo divergente com mesma chave.
- RLS/autorização/Storage: R01–R16 de [05](05-SEGURANCA-RLS.md), via papéis/JWT reais em ambiente sintético.
- E2E/regressão: adicionar→revisar→exportar→reabrir; importar NF/romaneio; tabelas; backup/restore.
- Concorrência: confirmação paralela, referências únicas, edição obsoleta, revogação durante operação, retries depois de resposta perdida.
- Carga: distribuição de tenants pequenos/grandes; RLS ativada; imports simultâneos e exportação. Não usar service_role para simular usuário.
- Recuperação: restaurar banco e arquivos em projeto separado e reconciliar manifestos.

## Suites por estágio

PR: lint/strict/build; unidade do módulo e contratos afetados; regressão do bug; SQL/RLS/Storage quando autorização/schema mudar; smoke E2E do fluxo alterado; segredo/dependência e limites de importação. Alterar parser/export implica corpus de formatos. Alterar shared/contracts implica consumidores completos.

Release: todos os T01–T18 e R01–R16, navegadores suportados, upgrade de schema, migração de fixture da versão anterior, restore, teste de carga acordado, headers de staging e análise de dependências. Registro de resultado com commit, ambiente, seed, duração e falhas.

## Métricas de aceite propostas

SLOs provisórios para validar com piloto: API interativa p95 <500 ms e p99 <1,5 s sem upload; erro interno <1% em janela de carga; nenhuma violação de isolamento; nenhuma duplicação em retries; zero diferença não explicada em contagens/referências/totais. UI: interação de tabela p95 <100 ms no dispositivo de referência, com corpus de 10 mil peças e número de variantes declarado. São metas, não resultados medidos.

Carga inicial 10 e 100 tenants simulados; ampliar só após obter dados do piloto. Testar 5× pico estimado e tenant desproporcional. Registrar conexões SQL reais, locks, CPU, I/O, latência RLS, bytes e backlog. Nenhuma aprovação baseada só em requests/s.

Financeiro futuro deve adicionar: duas baixas concorrentes, pagamento duplicado, saldo insuficiente, estorno parcial/total, falha antes/depois de commit, webhook repetido e reconciliação de razão. Esse gate precede qualquer operação financeira real.

Release bloqueado por P0 aberto, regressão de export sem aceite, dados perdidos, isolamento falho, restore não demonstrado ou migration incompatível. Cobertura percentual sozinha não substitui esses critérios.


Revisão de 07/11/2026. Auditoria e proposta, sem implementação. Snapshot/âncoras em [01](01-INVENTARIO-SISTEMA.md); histórico preservado no diretório pai.
