# Prompt — Etapa 3 (`store` assíncrono)

Cole o bloco abaixo numa sessão nova (pasta de trabalho: `versao-organizada/`).

---

Vamos começar a Etapa 3 (camada de armazenamento) da transição SaaS do Cadastro de Peças. Fale português do Brasil. Não faça `git push`, não publique no Netlify e não apague nada sem eu pedir.

Leia antes, nesta ordem: [CLAUDE.md](../CLAUDE.md), [docs/PLANO-ETAPA-3-STORE.md](PLANO-ETAPA-3-STORE.md) (o plano detalhado; é um rascunho meu ainda não aprovado), a seção "Etapa 3" e o "Registro de execução" de [docs/PLANO-TRANSICAO-SAAS.md](PLANO-TRANSICAO-SAAS.md), `src/store/local.js` e `src/store/idb.js`, e o LEIA-ME de `src/fatias/armazenamento/`.

Estado de partida: `main` em `43b0f23` (também no GitHub), 9 fatias, `src/store/` já é o único lugar que toca `localStorage`/`sessionStorage`/IndexedDB, mas ainda síncrono e sem separar preferências de dados. Tag `v-pre-saas` marca o estado anterior à transição.

Como trabalhar: isto é trabalho grande, então use brainstorm -> plano -> execução por etapas (CLAUDE.md). Comece pelo brainstorm e **me pergunte**, uma de cada vez, as três decisões abertas do plano: (1) UUID para registros novos agora ou na Etapa 6 (minha tendência é adiar); (2) como tornar assíncrono sem quebrar o `salvar()` síncrono (fachada com migração por fatia, ou reescrever os chamadores); (3) se a Etapa 3 deve mesmo vir antes de validar o produto. Só depois de eu aprovar o desenho, escreva o plano de implementação em `docs/superpowers/plans/` e execute com no máximo 2 agentes (implementador + revisor), em branch própria saída de `main`.

Regras duras: formato do backup, chaves de armazenamento e esquema do IndexedDB (`cadpecas-big` v3, diário `EX_PREFIXO`, `BK_JOURNAL`) **não mudam**; qualquer necessidade de mudar isso, pare e pergunte. Backups antigos têm de continuar restaurando. Não "conserte" pendências da auditoria no meio (AUD-A-001 a 009 estão listadas em PROMPT-CONTINUACAO-SAAS.md). Pronto de cada passo: `npm run lint`, `node tools/fatias.mjs --validar`, `npm run mapa`, `npm run test:unit`, `npm run build`, e a suíte completa com `CP_BACKUP="C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json" python tests/run_all.py --paralelo=4` (falha só em paralelo: rode sozinha com `--so=`). Testes de armazenamento obrigatórios com backup real: t58, t59, t60, t61, t62, t63, t94. Ao terminar, registre em PLANO-TRANSICAO-SAAS.md e me diga o que ficou de fora.
