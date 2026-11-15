# Etapa 3 — `store` assíncrono: plano detalhado

Data: 15/11/2026. Detalha a Etapa 3 de [PLANO-TRANSICAO-SAAS.md](PLANO-TRANSICAO-SAAS.md). Rascunho para aprovação: nada daqui foi executado. Pelo CLAUDE.md, trabalho grande segue brainstorm -> plano -> execução por etapas; este documento é o ponto de partida do brainstorm.

## Objetivo

Preparar a troca de **onde os dados moram** (hoje o navegador; depois um servidor) sem mudar a interface, sem perder dados e sem mudar o formato do backup. A Etapa 3 **não** liga servidor nenhum: ela só deixa a porta pronta.

## Onde estamos (medido em 15/11/2026)

- `src/store/local.js` (15 linhas) e `src/store/idb.js` (41 linhas) já são o único lugar que toca `localStorage`, `sessionStorage` e IndexedDB (teste `store_unico`). São funções finas e **síncronas** (localStorage) ou baseadas em Promise que nunca rejeitam (IndexedDB, devolvem `null` no erro).
- Chamadas fora do store: `lerPref` 44, `gravarPref` 35, `removerPref` 5, `lerSessao`/`gravarSessao`/`removerSessao` 6, `idbGet` 32, `idbOp` 23, `idbDel` 18, `idbPut` 14, `idbAbrir` 5.
- Chaves de `localStorage` vistas no código: dados (`cadpecas4`, `cadpecas3` legado, `cadpecas4-corrompido`, `cadpecas-roms`, `cadpecas-rom-info`, `cadpecas-tabs`), tela (`zoom`, `vista`, `colw`, `split`, `filtro`, `abertos`, `autor`) e controle de backup/serviços (`bk-ult`, `bk-em`, `rel`, `persist-aviso`, `origem-ok`, `cad-estrito`, `imgbb`, `imgbb-auto`, `imgbb-consent-v1`). A classificação exata em dado/tela/controle é a **primeira tarefa** (3.1), não está decidida.
- IndexedDB `cadpecas-big` v3, lojas `fotos`, `roms`, `tabs`, `pontos` (esta guarda também o diário de exclusões e o registro da restauração).
- `salvar()` é síncrono e é chamado por quase toda fatia; ele mistura gravação, toast e redesenho. É o maior obstáculo.

## Decisões que precisam do dono do projeto antes de começar

1. **UUID para registros novos** (item do plano original): é formato novo de ID, e o CLAUDE.md manda parar e perguntar. Recomendação: **adiar para a Etapa 6**, porque só importa quando houver servidor e vários aparelhos. Sem UUID, a Etapa 3 fica sem risco de mudança de formato.
2. **Como tornar assíncrono sem quebrar o `salvar()` síncrono.** Recomendação: não trocar `salvar()` de uma vez. Criar a interface nova ao lado, com o `salvar()` atual como fachada que a usa, e migrar fatia a fatia. Alternativa (reescrever todos os chamadores para `await`): mais limpa no fim, muito mais arriscada.
3. **Vale fazer a Etapa 3 antes de validar o produto?** Só serve ao caminho com servidor. Se a validação for com o app offline atual, ela pode esperar.

## Passos (cada um termina com testes verdes e o HTML regenerado)

**3.0 Linha de base.** `python tools/hash_html.py`, suíte completa com `CP_BACKUP` e tempos anotados. Criar tag local `v-pre-etapa3`.

**3.1 Inventário e classificação.** Gerar (ferramenta ou grep guiado) a lista de cada chamada a `lerPref/gravarPref/removerPref` e `idb*` com: chave ou loja, arquivo, fatia, e classe (dado de negócio, preferência de tela, controle de backup/serviço). Resultado em `docs/inventario-store.md`. Sem mudar código.

**3.2 Módulo `preferencias` (`src/store/prefs.js`).** Preferências de tela e de controle saem de `lerPref/gravarPref` espalhados e passam por funções nomeadas (`prefs.zoom.ler()`, etc.), **mesmas chaves, mesmo formato** (texto). Continuam síncronas: preferência de tela não precisa de rede. Os dados de negócio ficam fora deste módulo. Chave nova ou formato novo: parar e perguntar.

**3.3 Eventos de armazenamento.** Separar de `salvar()` o toast e o redesenho: o store emite `salvo`, `erro`, `conflito`, `cota`; um único ouvinte na casca (`app`) decide o que mostrar. Comportamento visível idêntico (mesmas mensagens, mesmos momentos). Aqui ficam os testes de quota e conflito (`t59`, `t61`).

**3.4 Interface `store` e adaptador local (`src/store/`).** Métodos assíncronos, nomes do plano original: `getConfig`, `saveConfig`, `listPecas`, `putPeca`, `deletePeca`, `listRomaneios`, `getRomaneio`, `putRomaneio`, `putFoto`, `getFoto`, `listTabelas`, `exportBackup`, `importBackup`. O adaptador local embrulha `local.js` e `idb.js` e preserva diário de exclusões, cota e recuperação. Nada na interface expõe `localStorage` ou IndexedDB. Teste de contrato que roda a mesma bateria contra o adaptador local (e, no futuro, contra o remoto).

**3.5 Migrar chamadores por fatia**, da menos para a mais acoplada (`exportacao`, `tabelas`, `configuracao`, `fotos`, `romaneio`, `planilha`, depois `lancamento` e `armazenamento`, que ainda têm fronteira "aponta"). Em cada uma: trocar `idb*`/`lerPref` de dado por chamadas ao `store`, rodar os testes da fatia (`FATIA.json`), `lint`, `fatias --validar`, `mapa`, suíte completa.

**3.6 Fechamento.** `store_unico` ampliado: nenhum arquivo fora de `src/store/` usa as funções finas de dado. `LEIA-ME` de `armazenamento` atualizado, `PLANO-TRANSICAO-SAAS.md` com o registro, HTML regenerado, pacote Netlify gerado e verificado (sem publicar).

## Testes obrigatórios (sempre com o backup real)

`t58`, `t58_backup_integridade`, `t59_conflito_quota`, `t60_crash_restauracao`, `t60_varejo`, `t61_journal_quota`, `t62_backup_duas_abas`, `t63_migracao_legada`, `t94_backup_real`, mais `perf_5000` (flake conhecido, rodar sozinho antes de contar como falha). Mais o teste de contrato novo (3.4).

## Riscos e o que fazer

- **Perda de dados em corrida entre abas ou em restauração:** não mexer no diário (`EX_PREFIXO`, `BK_JOURNAL`) nem no esquema do IndexedDB; qualquer mudança nisso é parar e perguntar.
- **`salvar()` síncrono vira assíncrono por engano:** ordem de gravação e leitura muda e aparece como bug raro. Mitigação: passo 3.3 isolado, com teste de ordem.
- **Ciclos de `lancamento`/`armazenamento`:** a migração desses dois pode exigir o gancho de "redesenhar" da Etapa 4. Se aparecer, registrar e **não** consertar no meio (regra do CLAUDE.md).
- **Ponto cego do checador:** usos dentro de `registrarAcoes({...})` e listeners de nível superior não são vistos; procurar também por grep.

## Pronto quando

Nenhum arquivo fora de `src/store/` toca dados de negócio no navegador; as preferências passam por `prefs.js`; `salvar()` não mostra toast nem redesenha; suíte completa verde com `CP_BACKUP`; formato do backup e esquema do IndexedDB **inalterados**; backups antigos ainda restauram.
