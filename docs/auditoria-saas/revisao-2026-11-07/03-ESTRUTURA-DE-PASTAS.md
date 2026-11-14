# 03 — Organização de código proposta

Árvore de destino do primeiro SaaS. Criar os diretórios somente quando houver implementação correspondente. Não criar `apps/api`, financeiro, CRM ou pastas vazias nesta fase.

```text
apps/
  web/
    src/
      app/
        (auth)/
        (workspace)/[tenantId]/catalog/
        (workspace)/[tenantId]/imports/
        (workspace)/[tenantId]/archives/
        (workspace)/[tenantId]/settings/
        api/catalog/
        api/imports/
        api/exports/
      composition/             # composição e implementação de adapters
      legacy/                  # adaptador temporário, sem cópia divergente das regras
    tests/e2e/
modules/
  catalog/
    src/domain/                # peça, variação, conjunto, cálculo, referência
    src/application/           # criar/alterar/arquivar com versão esperada
    src/infrastructure/        # repository Supabase e adaptador legado
    src/presentation/          # editor, hooks e componentes específicos
    src/schemas/               # DTOs de entrada e persistência
    src/public.ts              # API pública servidor
    src/client.ts              # API pública permitida no browser
    tests/
  imports/
    src/parsers/               # texto, NF XML/PDF, spreadsheet
    src/application/           # revisar/confirmar lote e deduplicar
    src/infrastructure/
    src/presentation/
    src/public.ts
    tests/fixtures/
  exports/
    src/formats/               # Jueri/Bling, CSV/XLSX/clipboard
    src/application/
    src/public.ts
    tests/fixtures/
  media/
    src/application/
    src/infrastructure/
    src/public.ts
    tests/
  archives/
    src/application/           # tabelas salvas, relatórios, backup e restore
    src/infrastructure/
    src/public.ts
    tests/
  identity/
    src/application/           # sessão, convites
    src/infrastructure/
    src/public.ts
    tests/
  tenancy/
    src/application/           # empresa, membership, autorização
    src/infrastructure/
    src/public.ts
    tests/
packages/
  contracts/src/               # apenas contratos realmente compartilhados
  ui/src/                      # controles reutilizados por mais de um módulo
  config/                      # lint, TS, build
  testing/                     # factories e helpers usados em vários testes
supabase/
  migrations/
  tests/
docs/
  auditoria-saas/
  architecture/decisions/
```

Workspaces permitem lint/teste por domínio e um único lockfile. Não criar pacote por função. `domain` só importa linguagem e biblioteca matemática aprovada; não React, DOM, Supabase ou `localStorage`. `application` recebe portas explícitas; infraestrutura implementa portas; apresentação chama casos de uso por contrato. `schemas` não deve esconder regra de negócio complexa.

Componentes/hooks pertencem a `presentation` do domínio, não a um diretório global gigantesco. Repositories só existem para persistência real; `services` não é nome genérico obrigatório. Tipos próximos do uso; promover a `contracts` quando dois consumidores efetivamente precisarem.

## Contratos concretos

```ts
type ConfirmImport = {
  tenantId: string; // validado contra sessão; não confere autoridade
  batchId: string;
  expectedRevision: number;
  idempotencyKey: string;
};
type ConfirmedImport = {
  batchId: string;
  productIds: string[];
  revision: number;
  warnings: { code: string; row?: number }[];
};
```

`imports` prepara itens e chama API pública de catálogo através de um coordenador transacional; não escreve diretamente nas tabelas de catálogo por adapter próprio. A transação deve ser compartilhada por um caso de uso/RPC, não duas chamadas REST com aparente atomicidade. `exports` recebe snapshot de linhas autorizado, sem ler estado global. `archives` referencia contratos de snapshot, sem importar componentes do editor.

Direção: apresentação → aplicação → domínio; infraestrutura depende de portas do domínio/aplicação. Identidade não importa catálogo; tenancy não importa importação; contratos não importam módulos. Dependência inversa é resolvida por porta injetada em `composition`, não por import circular.

Exemplo permitido: `@cadastro/catalog/client` para preview puro. Proibido: `../../catalog/src/infrastructure/repository` em imports ou componente cliente importando `catalog/public` com segredo. ESLint/import rules e exports de pacote devem impor os limites. CI verifica ciclos.

## Decomposição do HTML

1. gerar (H:1578) recebe configuração e lançamentos explícitos.
2. calcBanho (1661), celulasBase (1748) e exportações (4167/4188) viram regras puras/adaptadores.
3. nfLerXml, nfPdfParse e romPlanilha0 separam parsing da revisão visual.
4. flush, idbOp e bkMontar recebem portas e retornam resultados sem toast.
5. romCriar e wrapper NF (3728) tornam-se caso de uso explícito.
6. renderTopo, renderCfg e onField migram por tela. Não reproduzir S como singleton global novo.


Revisão de 07/11/2026. Auditoria e proposta, sem implementação. Snapshot/âncoras em [01](01-INVENTARIO-SISTEMA.md); histórico preservado no diretório pai.
