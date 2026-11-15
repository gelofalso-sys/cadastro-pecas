# Etapa 3 — `store` assíncrono: desenho

Data: 15/11/2026. Detalha [PLANO-ETAPA-3-STORE.md](../../PLANO-ETAPA-3-STORE.md); contexto em [PLANO-TRANSICAO-SAAS.md](../../PLANO-TRANSICAO-SAAS.md).

## Intenção
Deixar pronta a troca de onde os dados moram (navegador hoje, servidor depois) sem mudar tela, formato do backup, chaves de armazenamento nem esquema do IndexedDB. Esta etapa não liga servidor.

## Decisões do dono (delegadas: "siga o melhor caminho")
1. **UUID:** adiado para a Etapa 6. Etapa 3 sem formato novo de ID. (Custo se errado: refazer IDs só quando houver servidor.)
2. **Assíncrono sem quebrar `salvar()`:** fachada. `salvar()` continua síncrono (agenda 600 ms) e passa a usar a interface nova por baixo; chamadores migram por fatia. Reescrever todos os chamadores para `await` foi descartado (risco de ordem de gravação).
3. **Ordem:** fazer agora, começando pelo que também melhora o app offline (3.0 a 3.3). A interface assíncrona (3.4) e a migração por fatia (3.5) vêm depois, em ponto de parada próprio.

## Objetivos
- Preferências de tela/controle fora dos dados de negócio, por funções nomeadas, mesmas chaves e formato.
- `salvar()` sem toast nem redesenho: o store emite eventos, a casca decide o que mostrar, com comportamento visível idêntico.
- Interface `store` assíncrona + adaptador local; teste de contrato.

## Não objetivos / anti-objetivos
- Mudar formato do backup, chaves, esquema `cadpecas-big` v3, diário `EX_PREFIXO`, `BK_JOURNAL`: proibido (parar e perguntar).
- Corrigir AUD-A-001..009, o ciclo de `lancamento`/`armazenamento` ou linhas > 160: fora de escopo.
- Falha que só perde dado silenciosamente é pior que não entregar.

## Abordagens consideradas
- **A (escolhida): fachada + migração por fatia.** Seguro, cada passo termina com suíte verde.
- B: reescrever chamadores para `await`: limpo no fim, risco alto de corrida entre abas e perda de dados.
- C: adiar tudo: seguro, mas não prepara o servidor.

## Passos e pontos de parada
3.0 linha de base (hash, suíte, tag `v-pre-etapa3`) · 3.1 inventário `docs/inventario-store.md` · 3.2 `src/store/prefs.js` · 3.3 eventos de armazenamento (testes t59/t61 e de ordem) · **parada: relatar ao dono** · 3.4 interface + adaptador + contrato · 3.5 migração por fatia · 3.6 fechamento.
Branch própria saída de `main`. Pronto de cada passo: lint, `fatias --validar`, mapa, test:unit, build e suíte com `CP_BACKUP`; obrigatórios t58, t59, t60, t61, t62, t63, t94.

## Fica ao construtor
Nomes das funções de `prefs`, formato interno dos eventos, método exato de classificar as chaves (3.1).
