# 07 — Performance e custos

## Caminhos atuais: não são Supabase

Sem provedor Claude: operações de cadastro/exportação locais; zero chamadas Supabase. Com provedor: inicialização solicita dois documentos em paralelo (1646) e, condicionalmente, um romaneio (2735). Cada flush envia até dois documentos completos (1519); romaneio tem salvamento próprio. São chamadas de API observadas no código, não contagem medida de requests HTTP do SDK. PDF carrega biblioteca/worker sob demanda; foto envia uma requisição imgbb por item, sequencialmente. Não foram encontrados polling ou subscriptions Supabase.

Não há HAR, p50/p95, planos SQL, métricas de bytes ou faturamento do usuário. Não atribuir economia percentual nem supor que uma chamada do SDK corresponde a uma única operação interna.

## Otimizações ligadas a evidências

| Recurso e evidência | Antes → depois proposto | Bytes / tempo / banco | Complexidade e risco |
|---|---|---|---|
| Documento de lançamentos, 1519 | 1 gravação de coleção inteira → 1 comando por conjunto de mudanças | Se N peças de B bytes e delta D: payload aproximadamente N×B → D, a medir; banco reduz regravação | Média; versão esperada e idempotência obrigatórias |
| Config + peças | até 2 writes independentes → 1 comando transacional quando ambos mudam | Menos ida/volta lógica, integridade maior; não significa metade da fatura | Média; RPC não deve ter privilégio amplo |
| `gerar` 1305 | `indexOf` por grupo → índice precomputado | Chamadas de rede iguais; CPU potencialmente O(N²) → O(N), além do custo das variantes | Baixa/média; preservar ordem de referências |
| `tabSalvar` 2542 | `find` por linha → Map por ID | Rede igual; reduz busca repetida em memória | Baixa; testar associação de variantes |
| `histNota` 1488 | serialização integral em cada alteração → comandos/snapshots espaçados | Menos cópia/GC; resultado deve manter desfazer | Média/alta; só após profiling, não remover recuperação |
| Backup 2611–2613 | abrir IDB e ler item a item → transação/batches com manifesto | Rede zero; reduzir aberturas; memória limitada por lote | Média; nunca converter erro em sucesso vazio |
| Tabela 1726–1744 | virtualização já existe → preservar e medir | Não propor “adicionar virtualização” inexistente como ganho | Média; testar foto/altura/seleção |
| SaaS catálogo | hipótese: 1 consulta por página, 50 linhas → mesma consulta deduplicada para widgets iguais | Se 2 KB/linha: ~100 KB sem imagens; cursor mantém custo previsível | Média; autorização do cache e invalidation |
| Fotos | original em listagem → thumbnail 240 px | Medir tamanhos reais; não inventar taxa de compressão | Baixa; evitar repetir transformação faturada |

Índices candidatos e método de EXPLAIN estão em [04](04-BANCO-DE-DADOS.md). Selecionar colunas explícitas; paginação por `(updated_at,id)` com tenant e limite máximo 100, ordem estável e definição do que fazer quando linha muda durante navegação. Busca debounce inicial 300 ms; medir usabilidade. Agregação de dashboard no banco somente se existir demanda; materialized view não justificada agora.

Cache de catálogo: chave `['tenant',tenantId,'catalog',filters,cursor,permissionRevision]`, staleTime inicial 30 s como hipótese, invalidar página/registro/contagem afetada após confirmação. Logout/troca/revogação limpam cache e cancelam requests. SSR não compartilha cache autenticado entre usuários. Preview local é otimista; erro restaura estado anterior e mantém rascunho. Saldo financeiro futuro: resposta de comando autoritativa, invalidação de todas as projeções afetadas e indicação de versão; nunca confirmar pagamento com cache antigo.

Realtime desligado inicialmente; habilitar apenas em recurso colaborativo com requisito medido. Não usar canal por widget. Reconsulta ao foco só quando stale e sessão válida. Pool de conexão é compartilhado por serviço, não por tenant; limite de browser não é limite de conexão SQL.

## Preços públicos consultados em 06/11/2026

Valores em US$, sem impostos/câmbio. Revalidar no orçamento e contrato. [Supabase pricing](https://supabase.com/pricing): Pro US$25/mês, crédito de compute US$10; 100 mil MAU; disco 8 GB/projeto, excedente US$0,125/GB; Storage 100 GB, excedente US$0,0213/GB. [Egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress): franquias separadas de 250 GB cached e uncached, excedentes US$0,03 e US$0,09/GB. A página de billing arredonda Storage para 0,021; cálculos aqui usam 0,0213 da página de preços.

[Vercel Pro](https://vercel.com/pricing) parte de US$20/mês, com US$20 de crédito de uso; assentos pagos adicionais e consumo dependem da contratação. [Railway Pro](https://railway.com/pricing) tem mínimo de US$20 de uso incluído; não somar novamente o crédito ao consumo. [Billing Supabase](https://supabase.com/docs/guides/platform/billing-on-supabase) esclarece que cada projeto tem compute próprio e quotas de uso agregadas na organização. API requests não devem ser orçadas por preço inventado por request: banco, bytes, runtime e recursos são os componentes relevantes.

## Premissas de demanda, não medições

Cadastro ativo: 3 usuários/tenant, 22 dias/mês, 1 sessão/usuário/dia, 120 operações API/sessão (100 leituras, 20 escritas), 5% dos usuários simultâneos (arredondar para cima). 10 mil peças/tenant, dados/índices/auditoria estimados 0,05 GB/tenant; fotos acumuladas 1 GB/tenant; saída uncached 0,25 GB/tenant/mês e cached 0,25 GB. Os bytes incluem respostas, exportações e fotos e devem ser confrontados com HAR. Uploads não foram cobrados como egress; backups/cópias podem gerar saída adicional.

| Métrica | 10 tenants | 100 | 1.000 | 10.000 |
|---|---:|---:|---:|---:|
| MAU | 30 | 300 | 3.000 | 30.000 |
| Simultâneos | 2 | 15 | 150 | 1.500 |
| Sessões/mês | 660 | 6.600 | 66.000 | 660.000 |
| Leituras API/mês | 66.000 | 660.000 | 6.600.000 | 66.000.000 |
| Escritas API/mês | 13.200 | 132.000 | 1.320.000 | 13.200.000 |
| Operações API/mês | 79.200 | 792.000 | 7.920.000 | 79.200.000 |
| Disco estimado GB | 0,5 | 5 | 50 | 500 |
| Storage GB | 10 | 100 | 1.000 | 10.000 |
| Saída uncached / cached GB | 2,5 / 2,5 | 25 / 25 | 250 / 250 | 2.500 / 2.500 |
| Logs a 1 KB/operação, GB/mês | 0,0792 | 0,792 | 7,92 | 79,2 |
| Edge Functions / Realtime | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |

Operação API não equivale a linha SQL: um comando pode inserir várias variantes. Hipótese de pico: cada simultâneo produz 120 operações em 30 minutos, dando aproximadamente 0,13 / 1 / 10 / 100 operações/s; testar rajadas 5× e importações concorrentes. Não dimensionar banco pela média mensal.

## Modelo calculável

Para N tenants: D=0,05N; S=N; Eu=Ec=0,25N GB. Encargo variável ilustrativo de produção:

`V = max(D-8,0)*0,125 + max(S-100,0)*0,0213 + max(Eu-250,0)*0,09 + max(Ec-250,0)*0,03`.

`Supabase = 25 + max(Cprodução + Cstaging - 10,0) + V + adicionais`.

Hipóteses de orçamento para compute, NÃO preços de instâncias dimensionadas/testadas: produção US$10/25/100/500, staging US$10 em todos os cenários. Não garantem capacidade. Vercel abaixo inclui orçamento total de frontend/BFF/egress após créditos; um assento. Outros assentos acrescentam custo. Backups/logs/email/worker são reservas hipotéticas, não cotações.

| US$/mês | 10 | 100 | 1.000 | 10.000 |
|---|---:|---:|---:|---:|
| Base Supabase + compute líquido | 35 | 50 | 125 | 525 |
| Variáveis calculadas V | 0 | 0 | 24,42 | 542,37 |
| Frontend+BFF, hipótese | 20 | 30 | 150 | 1.000 |
| Observabilidade, hipótese | 0 | 20 | 75 | 300 |
| Backups independentes, hipótese | 5 | 10 | 50 | 250 |
| Email/worker/outros, hipótese | 5 | 15 | 50 | 300 |
| Total do cenário ilustrativo | **65** | **125** | **474,42** | **2.917,37** |

Totais não são promessa de faturamento nem capacidade. Excluem implementação, atendimento, impostos, domínio, cobrança por transação e plano Enterprise/SLA. PITR não está incluído: preço público parte de US$100/mês, sujeito ao projeto/opção; acrescentar antes de prometer RPO inferior a backup diário. Backups de objetos e tráfego da cópia precisam orçamento real; a reserva pode ser insuficiente para muitos TB.

Sensibilidade: 10× mais fotos altera Storage e tráfego, não apenas banco. 10× sessões aumenta funções, consultas e logs; não inferir linearidade de compute. Necessidade de 5/10 assentos pagos muda hosting; custo por tenant calculado pela média esconde tenants pesados. Separar uso por empresa para definir planos e limites.

## Controle e escala progressiva

Alertas em 50/80/100% do orçamento e franquias; relatório diário de burn rate e projeção mensal; cota de arquivos/import/export por tenant; limite de concorrência de jobs, retries e retenção. Ao exceder, enfileirar/exportar depois e notificar; não interromper gravação crítica já confirmada. Spend cap do fornecedor não substitui controle da aplicação e pode não cobrir todos os itens.

Começar 10–100 empresas com projeto compartilhado e índices mínimos. Aos 1.000, medir noisy neighbor, fila, cache e pool. Aos 10.000, avaliar crescimento de fotos/audit, IOPS, duração de restores, consultas por tenant e sharding somente se evidência indicar. Contagem de empresas não valida SLO.
