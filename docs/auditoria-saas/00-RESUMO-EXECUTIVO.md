# Auditoria SaaS — Cadastro de Peças

Data: 06/11/2026. Escopo confirmado pelo usuário: aplicativo desta pasta. Fase: diagnóstico e projeto; implementação não iniciada.

## Conclusão

O sistema é um aplicativo de cadastro de peças, especialmente orientado a peças brutas/prontas, banhos, grades, conjuntos, romaneios, notas fiscais e exportação para Jueri/Bling. Não é possível caracterizá-lo como ERP financeiro ou SaaS multi-tenant implementado. O produto possui regras e proteções relevantes que devem ser preservadas; uma reescrita total não se justifica pelas evidências disponíveis.

A recomendação é migração incremental para um monólito modular em TypeScript strict, React/Next.js e Supabase, começando por caracterização, segurança dos importadores e confiabilidade da persistência. O primeiro lançamento SaaS deve atender ao cadastro real, sem construir antecipadamente CRM, financeiro ou produção.

## Método e limites

- CONFIRMADO: observado no código, arquivos ou teste isolado registrado.
- PROVÁVEL: fluxo sustenta o risco, mas falta reprodução completa.
- NÃO VERIFICADO: depende de ambiente, comportamento em navegador, dados ou configuração não acessados.
- NÃO APLICÁVEL: mecanismo não integra a arquitetura local inspecionada.
- Propostas, custos hipotéticos e critérios de aceite não representam implementação existente.

Foram inventariados arquivos rastreados, artefatos locais, backups, configuração de publicação e funções do HTML. A análise aprofundou geração de referências, importação, exportação, fotos, persistência, restauração, sincronização e renderização. Não houve pentest de produção, execução de arquivos maliciosos, acesso a dados de clientes, banco real ou medição de carga. Não há certificação de segurança nem cobertura dinâmica integral.

Referência Git: `d46df1b`; `cadastro-pecas.html` já estava modificado antes desta auditoria. Os achados referem-se ao arquivo de trabalho, não exclusivamente ao commit. Não foram alterados HTML, configurações, dependências ou banco. Só este diretório documental foi criado. Consulte hashes e limites da captura em [01](01-INVENTARIO-SISTEMA.md).

**Limite de versão:** o HTML principal e a distribuição Chrome sofreram alterações concorrentes durante a análise. Os achados prioritários foram rechecados no fechamento e permanecem; a versão final não recebeu nova auditoria integral. Linhas dos documentos se referem à captura identificada em 01; há tabela de relocalização dos pontos críticos. Fixar um snapshot é requisito da primeira implementação.

## Dez maiores riscos

| Ordem | ID | Evidência / classificação | Consequência | Prioridade |
|---|---|---|---|---|
| 1 | A01 | IDs aceitam aspas e entram sem escape em `data-lid`; injeção de atributo CONFIRMADA em teste isolado; XSS completo PROVÁVEL | Código no contexto da página após backup manipulado | P0 |
| 2 | A02 | PDF.js 3.11.174, versão afetada por CVE-2024-4367; CONFIRMADO | PDF malicioso pode executar código nas condições do advisory | P0 |
| 3 | A03 | SheetJS 0.18.5, versão afetada por dois advisories; CONFIRMADO | Poluição de protótipo / indisponibilidade por arquivo importado | P0 |
| 4 | A04 | Carregamento remoto substitui estado após habilitar edição; PROVÁVEL perda de edição | Retrabalho e dados sobrescritos | P1 |
| 5 | A05 | Gravação de foto ignora retorno de falha do IndexedDB; CONFIRMADO | Miniatura presente, original perdido | P1 |
| 6 | A06 | Backup converte falha de leitura em lista vazia; CONFIRMADO | Backup anunciado completo pode estar incompleto | P1 |
| 7 | A07 | Restauração usa compensações entre armazenamentos; CONFIRMADO, perda após interrupção NÃO VERIFICADA | Estado parcial após falha/fechamento | P1 |
| 8 | A08 | Dois documentos remotos gravados sequencialmente, sem versão; CONFIRMADO | Configuração e peças inconsistentes / concorrência | P1 |
| 9 | A09 | Identidade empresarial e autorização não aparecem no app local; isolamento do provedor NÃO VERIFICADO | Bloqueio de lançamento SaaS até implantar isolamento verificável | P1; bloqueante de release |
| 10 | A10 | Um HTML reúne 305 declarações nomeadas, estado e DOM; CONFIRMADO | Regressão e conflitos entre equipes | P1 |

P0 aqui significa tratar antes de ampliar distribuição/importação de arquivos não confiáveis; não afirma incidente ativo. Severidade, probabilidade, esforço e testes constam em [12](12-BACKLOG-PRIORIZADO.md).

## Pontos positivos a preservar

Escape textual centralizado; proteção contra fórmulas em CSV; validação de backups; aviso/bloqueio de dados corrompidos; detecção de outra aba; histórico limitado; virtualização de tabela; validação de tamanho de imagens; timeout de upload; conferência antes de exportar; restauração com tentativa de compensação; duplicidade de nota sinalizada. Esses mecanismos reduzem risco, mas não equivalem a transações, autorização ou garantia de recuperação.

## Decisões prioritárias

1. Fixar baseline e casos reais anonimizados; corrigir A01–A03 sem refatoração ampla.
2. Fazer backup/restore e confirmação de gravação confiáveis antes de migrar dados.
3. Extrair geração/cálculos e formatos mantendo resultados caracterizados.
4. Criar tenancy, RLS e testes negativos antes de colocar dados empresariais no servidor.
5. Migrar um tenant piloto, reconciliar contagens, referências, valores e hashes de arquivos; só ampliar após recuperação demonstrada.

Estimativa de planejamento para o SaaS de cadastro: 70–140 pessoa-dias, confiança baixa a média, excluindo ERP completo e suporte continuado. Marcos têm critérios de saída em [13](13-ROADMAP-EXECUCAO.md); não é compromisso de prazo. Custos mensais condicionais estão em [07](07-PERFORMANCE-CUSTOS.md).

## Navegação

| Documento | Finalidade |
|---|---|
| [01](01-INVENTARIO-SISTEMA.md) | Evidências, módulos e dependências |
| [02](02-ARQUITETURA-ALVO.md) | Alternativas e limites de confiança |
| [03](03-ESTRUTURA-DE-PASTAS.md) | Organização e contratos |
| [04](04-BANCO-DE-DADOS.md) | Modelo, transações e migrations |
| [05](05-SEGURANCA-RLS.md) | Autorização e testes multi-tenant |
| [06](06-SEGURANCA-APLICACAO.md) | Ameaças e evidências |
| [07](07-PERFORMANCE-CUSTOS.md) | Performance e FinOps |
| [08](08-GOVERNANCA-MULTIEQUIPE.md) | Regras para desenvolvedores e agentes |
| [09](09-PLANO-MIGRACAO.md) | Migração e rollback |
| [10](10-TESTES-QUALIDADE.md) | Casos, automação e gates |
| [11](11-DEVOPS-OPERACAO.md) | Operação e recuperação |
| [12](12-BACKLOG-PRIORIZADO.md) | Achados acionáveis |
| [13](13-ROADMAP-EXECUCAO.md) | Sequência e primeira implementação |
| [14](14-REGISTRO-DE-DECISOES.md) | ADRs e revisão adversarial |
| [15](15-MATRIZ-RASTREABILIDADE.md) | Paridade e lacunas |
