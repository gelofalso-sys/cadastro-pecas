# 08 — Governança técnica para pessoas e agentes

Documento normativo proposto para a implementação posterior. Responsáveis são papéis; nomes reais devem ser definidos ao iniciar equipe. Não foram criados agentes nem branches nesta auditoria.

## Ownership e composição

| Equipe | Distribuição recomendada |
|---|---|
| 2 pessoas | 1 catálogo/editor/exportação; 1 persistência/importação/tenancy; revisão cruzada, alterações SQL e segurança revisadas por ambos |
| 5 pessoas | catálogo, importação, exportação/arquivos, plataforma/tenancy, QA/segurança; mídia dividida por entrega com owner único |
| 10 pessoas | pares por domínio de maior risco; plataforma/segurança e integração dedicadas; evitar dez editores simultâneos do HTML |
| Mais de 10 | responsáveis por domínio e contratos; grupos por fluxo vertical; limite de WIP e fila de integração; não criar microsserviço por equipe |

Enquanto existe um HTML compartilhado, apenas um integrador altera o arquivo por vez. Outras tarefas trabalham em fixtures, documentação e módulos extraídos. Worktrees isolam alterações físicas, mas não resolvem conflitos semânticos em estado ou schema.

## Regras obrigatórias para tarefas de IA

1. Ler resumo, ADRs, contrato do módulo, matriz de paridade e estado Git; preservar alterações existentes.
2. Declarar objetivo, paths permitidos, invariantes, dependências, teste de aceite e o que fica fora do PR.
3. Usar branch curta `codex/<dominio>-<objetivo>` e worktree própria quando houver execução simultânea. Não compartilhar banco dev mutável.
4. Não editar internals de outro domínio. Propor contrato público e coordenar com owner antes da implementação transversal.
5. Não criar `shared`/`utils` genérico por conveniência; extrair compartilhamento após dois consumidores reais.
6. Não introduzir service_role no browser, CRUD privilegiado genérico, policy `true`, tenant por filtro visual ou autenticação mock em produção.
7. Não remover comportamento por estética ou dificuldade de migração. Atualizar fixture, rastreabilidade e aceite de negócio para mudança deliberada.
8. Nunca apagar dado legado automaticamente. Migração deve ter manifesto, rejeitados, contagens, checksums e recuperação.
9. Reportar testes rodados, falhas, limites e evidências; teste não rodado não é “aprovado”. Não inventar cobertura, custos ou performance.
10. Não executar migrations/publicações destrutivas ou enviar dados reais para preview. Não registrar segredo, XML integral ou foto em logs.
11. ADR é necessário para mudar fonte de verdade, isolamento, arredondamento, formato exportado ou fronteira de módulo.
12. Entregar PR pequeno e revisável; evitar misturar atualização de dependências, nova tela e migração de dados no mesmo PR.

## Exemplo de CODEOWNERS futuro

```text
/modules/catalog/     @catalog-owner
/modules/imports/     @imports-owner
/modules/exports/     @exports-owner
/modules/media/       @platform-owner
/modules/archives/    @archives-owner
/modules/identity/    @security-owner
/modules/tenancy/     @security-owner
/supabase/            @database-owner @security-owner
/packages/contracts/  @architecture-owner
/packages/ui/         @ui-owner
/apps/web/src/app/    @integration-owner
/pnpm-lock.yaml       @integration-owner
```

Esses handles são placeholders, não usuários reais. CODEOWNERS sozinho não exige aprovação de todos os listados: configurar proteção/rulesets e verificação adicional para revisão de segurança obrigatória em auth/RLS/RPC/segredos/financeiro. Exigir checks, revisão independente, resolução de comentários, branch atualizada/merge queue e proibir push direto na principal.

## Coordenação dos pontos de conflito

| Recurso | Regra |
|---|---|
| Rotas | domínio recebe subtree; layout raiz e composição pelo integrador |
| Config global | mudança em PR separado com impacto explícito em todos os consumidores |
| UI compartilhada | API aditiva, exemplos/testes visuais, depreciação antes de remover |
| Tipos/schemas | contratos pequenos por caso de uso; DTO e entidade persistida não são o mesmo tipo |
| Migrations | reservar sequência com owner, nunca renomear/apagar migration aplicada; rodar cadeia completa na merge queue |
| Banco | projeto/local por worktree ou reset sintético exclusivo; nunca alterar staging enquanto outro teste usa |
| Dependências/lockfile | owner único de atualização; rebase e regeneração pelo gerenciador, não mesclar lockfile manualmente |
| APIs | versão de contrato e teste produtor/consumidor; mudança incompatível exige coexistência temporária |
| Importações entre pacotes | public exports e checagem automática de ciclos/proibições |

Mudança transversal: RFC curta com exemplo antes/depois, owners afetados, versão, plano expand/contract e ordem dos PRs. Primeiro contrato aditivo e testes; depois produtores/consumidores; remoção só após todos migrarem. Definir um integrador e um responsável final por release, evitando aprovação difusa.

PR mínimo: problema observável, comportamento esperado, testes relevantes, dados afetados, impacto de autorização, compatibilidade e rollback. CI seletivo por domínio, mas mudanças em contratos/config/banco acionam suíte ampliada. Segurança e migração não são dispensadas para “PR pequeno”.


Revisão de 07/11/2026. Auditoria e proposta, sem implementação. Snapshot/âncoras em [01](01-INVENTARIO-SISTEMA.md); histórico preservado no diretório pai.
