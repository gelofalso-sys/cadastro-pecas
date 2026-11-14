# 09 — Migração incremental

## Escolha

Reescrita total: alto risco de perder semântica de referências, grades/banhos, agrupamento Bling, fórmulas, teclado, rascunhos e recuperação. Não foi demonstrada inviabilidade de extração. Migração por módulo: preferida, combinada com extração progressiva de regras puras. Novo backend multi-tenant será construído porque o atual adaptador de documentos não oferece contratos de tenant auditáveis no repositório; isso não exige reconstruir todos os fluxos de produto.

## Fases e gates

| Fase | Trabalho | Dependência | Aceite | Rollback |
|---|---|---|---|---|
| M0 baseline | snapshot/hash, inventário de dados, fixtures e checks | nenhuma | corpus de paridade revisado e backup restaurado em perfil descartável | fonte original intacta |
| M1 contenção | A03/A18 e integridade A01; reforçar limites já existentes, planejar atualização A02 | M0 | regressão de PDF/XLSX + payload inerte; distribuição verificada | versão anterior somente se não reabrir vulnerabilidade; preferir desabilitar importador afetado |
| M2 integridade local | resultados explícitos, backup com manifesto, concorrência | M0 | falha simulada não anuncia sucesso; reload preserva estado | formato antigo legível, cópia pré-mudança |
| M3 núcleo puro | gerar/calcular/formatar e parsers desacoplados | M1/M2 | corpus antigo/novo equivalente, divergência explicada | adapter legado selecionável |
| M4 fundação SaaS | auth/tenancy/schema/RLS/Storage/CI | contratos de M3 | R01–R16 e restore passam | sem dados reais até gate |
| M5 piloto vertical | catálogo, importação, exportação, arquivos e mídia no novo app | M3/M4 | mesmas saídas e operação com concorrência, 1 tenant piloto | parar escrita, exportar mudanças e reconciliar para legado |
| M6 expansão | migração assistida por tenant, métricas, quotas | M5 estável | reconciliação, SLO e recuperação nos volumes acordados | rollback por tenant, não sobrescrever todos |
| M7 retirada | remover caminho legado quando todos os usos estiverem cobertos | M6 | matriz 15 sem lacuna bloqueante; retenção encerrada por política | snapshot arquivado e ferramenta de leitura preservada |

## Extração por módulo

Catálogo: capturar peça bruta/pronta, referências manuais/zeros, banhos, grades, combinações, conjuntos e exclusões de linha; extrair `gerar(config, lançamentos)`; comparar linhas/referências e só depois trocar UI.

Importação: preservar parser texto, PDF/fotos, NF XML/PDF, customização de modelo, revisão de quantidade/custo e deduplicação. Separar parsing não confiável, preview e confirmação transacional. PDF parser substituído por segurança necessita fixtures reais anonimizadas; screenshot parecido não basta.

Exportação: manter cabeçalhos, ordem, tipos, encoding/BOM, delimitadores, casas decimais, lotes e agrupamento pai/variações. Comparar CSV por bytes quando determinístico; XLSX por células, tipos, fórmulas e valores, ignorando metadados voláteis. Validar manualmente em conta de teste dos destinos antes de prometer compatibilidade.

Mídia: inventariar original, miniatura e URL externa por peça; verificar hashes e órfãos. Não converter URL imgbb pública em “privada” apenas copiando string para banco. Migração do conteúdo externo requer download autorizado e teste de disponibilidade; marcar faltantes.

Arquivos: histórico de tabelas e romaneios permanece consultável, com versão de snapshot e origem; autor antigo é `legacy_author_text`, distinto de ator autenticado. Desfazer local e rollback de transação são conceitos distintos.

## Procedimento de dados local → tenant

1. Identificar origem/navegador/dispositivo. Um tenant pode ter várias cópias; mesmas chaves localStorage não significam mesma empresa.
2. Usuário autenticado e autorizado escolhe explicitamente empresa de destino. Não inferir tenant a partir de CNPJ do fornecedor da nota.
3. Exportar manifesto: versão, timestamp, contagens por entidade/store, hashes de fotos e snapshot, chaves antigas e erros de leitura. Não limpar origem.
4. Validar em staging: IDs, referências, duplicidades, shapes, limites e fotos. Mapear IDs por tenant+snapshot+tipo+legacy_id.
5. Gerar relatório de duplicatas/conflitos para decisão: mesma referência com conteúdo diferente não é automaticamente a mesma peça. NF duplicada deve respeitar exceção de reimportação auditada.
6. Upload em lotes idempotentes, assets pending, checkpoints e rejeitados com causa. Repetir lote não duplica.
7. Promover após contagens, referências, totais e hashes conferirem; registrar versão de cálculo e formato. Tolerância financeira não é implícita: diferença exige aceite documentado.
8. Congelar escrita na origem no corte; confirmar delta final. Não usar dual-write independente entre localStorage e servidor.
9. Disponibilizar consulta/backup da origem em janela inicial proposta de 30 dias, sujeita à política aprovada; testar restauração antes de apagar qualquer cópia.

Rollback após escrita SaaS exige exportar o delta e verificar compatibilidade do formato legado. Se houver recurso sem representação no legado, oferecer modo consulta/recuperação controlada; não prometer retorno por simples troca de URL. Feature flag por tenant controla rota, mas não desfaz dados.

Critério de paridade: todos os itens existentes da matriz 15 aprovados ou explicitamente aceitos como alteração pelo responsável de produto; zero perda silenciosa, zero referência órfã, zero mistura de tenant e todo rejeitado explicado.


Revisão de 07/11/2026. Auditoria e proposta, sem implementação. Snapshot/âncoras em [01](01-INVENTARIO-SISTEMA.md); histórico preservado no diretório pai.
