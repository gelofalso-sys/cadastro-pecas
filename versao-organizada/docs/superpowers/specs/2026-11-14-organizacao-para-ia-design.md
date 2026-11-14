# Organização do código para manutenção por IA — desenho

Data: 14/11/2026. Substitui o escopo das Etapas 3 a 5 de [PLANO-TRANSICAO-SAAS.md](../../PLANO-TRANSICAO-SAAS.md). As Etapas 6 e 7 (servidor, assinatura) ficam **fora de escopo** por decisão do dono do projeto: primeiro organizar, depois validar e vender.

## Intenção e porquê

O app é um HTML único, montado a partir de 36 arquivos JS (cerca de 4.200 linhas, 667 KB) com 53 globais mutáveis. Quem mantém o código é uma IA, junto com o dono. Hoje uma tarefa como "mudar o lançamento de peça" obriga a abrir arquivos de várias áreas, e os arquivos de eventos (`30` a `35`) misturam todas as telas. Uma IA erra quando precisa carregar muito contexto e quando não sabe o que uma mudança afeta.

Objetivo: **uma tarefa de manutenção toca uma pasta, o mapa diz qual, e um teste rápido avisa se algo quebrou.** O comportamento visível não muda.

## Metas, não-metas e anti-metas

**Metas**
- Cada funcionalidade vive numa pasta própria (fatia) com contrato escrito e testes próximos.
- Um mapa de arquitetura **gerado a partir do código**, que não envelhece.
- Regras de lint que travam acesso indevido entre fatias, ativas desde o começo e apertadas conforme cada fatia é concluída.
- Globais caem de 53 para só os do estado explícito de cada fatia; nenhum arquivo escreve em variável de outra fatia.
- Nenhum arquivo acima de cerca de 400 linhas legíveis e nenhuma linha acima de 160 caracteres.

**Não-metas:** servidor, contas, assinatura, framework de interface, mudança visual, funcionalidade nova, mudança no formato do backup.

**Anti-metas (seria fracasso mesmo com testes verdes)**
- Perder ou corromper dados do usuário.
- Criar camadas de abstração que exigem ler mais arquivos do que antes.
- O app deixar de abrir offline como arquivo único.
- Uma fatia "organizada" que só funciona porque outra fatia lê as suas variáveis por baixo.

## Restrições

- O app não para de funcionar em nenhuma etapa; a suíte completa (`CP_BACKUP` com backup real) fica verde ao fim de cada fatia.
- O formato do backup é o contrato; backups antigos continuam sendo lidos.
- O HTML final continua sendo um bloco único embutido por `tools/montar.py`.
- Mudanças feitas na pasta de trabalho; sem `git push`, sem publicar no Netlify, sem apagar sem pedido.

## Abordagens consideradas

1. **Camadas em sequência** (`store`, depois estado, depois interface): descartada. Uma mudança de funcionalidade continuaria atravessando todas as camadas, e o `store` teria o maior risco de perda de dado com pouco retorno sem servidor.
2. **Fatias por funcionalidade, com mapa e lint desde o começo: escolhida.**
3. **Só mapa e lint, sem mover código:** descartada. Não resolve os globais nem os arquivos de eventos.

## Desenho

### Estrutura

```
src/
  core/          # funções puras (já existe; Etapa 2)
  store/         # acesso a localStorage/IndexedDB, camada fina e tardia
  fatias/
    <nome>/
      FATIA.json       # contrato: o que a fatia expõe e de quem depende
      LEIA-ME.md       # 20 a 40 linhas: para que serve, fluxos, armadilhas
      *.js             # lógica, estado próprio, eventos e templates da fatia
  app/           # casca: menu, janelas, paleta, atalhos globais
```

Os testes continuam em `tests/`, mas cada `FATIA.json` lista quais testes cobrem a fatia, para a IA rodar só esses (`run_all.py --so=<regex>` já existe).

### Fatias propostas (a confirmar na medição de acoplamento)

Mapeamento inicial dos arquivos atuais; os arquivos de eventos `30` a `35` são repartidos pela tela a que pertencem.

| Fatia | Arquivos de origem (hoje) |
|---|---|
| `configuracao` | `19`, `36`, `37` (cadastros, categorias, banhos, moeda) |
| `lancamento` | `12`, `13`, `17`, `18`, `26`, partes de `27` (adicionar, editar, cancelar) |
| `planilha` | `15`, `16`, `24`, `34` (filtros e cartões) |
| `romaneio` | `19c`, `21`, `21b`, `25`, `22`, partes de `34` (importação) |
| `notafiscal` e `fotos` | `23`, parte de `22`, `27` (fotos) |
| `exportacao` | `28`, `19b` (assistente de outro sistema), `29` (importar e copiar) |
| `tabelas` | `19d` |
| `armazenamento` | `14`, `20`, `21c` (persistência, IndexedDB, diagnóstico, backup) |
| `app` | `33`, `35`, `21d` (janelas, busca, paleta, menu, novidades) |

### Mapa e lint desde o começo

- `tools/mapa.mjs` lê todos os `FATIA.json` e o grafo de dependências real (`tools/grafo_puro.mjs`) e gera `docs/ARQUITETURA.md`: fatias, o que cada uma expõe, quem usa quem, arquivos e testes. Se `FATIA.json` e código divergirem, o comando falha. O mapa não se escreve à mão.
- `tools/checar_fronteiras.mjs` falha se uma fatia usar símbolo que a outra não declara em `expoe`, e conta globais mutáveis por fatia. Entra em `npm run lint` e em `run_all.py` antes da primeira fatia migrar, começando em modo **só aponta** (lista violações atuais como linha de base) e passando a **falhar** fatia por fatia.
- `CLAUDE.md` na raiz do projeto: comandos de build e teste, ponteiro para `docs/ARQUITETURA.md`, as armadilhas já conhecidas (`chr(10)` no lugar de `\n`, CRLF, não disparar `change` à mão, cópia temporária da suíte) e a regra "mexa só na pasta da fatia; se precisar de outra fatia, use o que ela expõe".

### Estado

Cada fatia tem o seu estado, num objeto próprio dentro da pasta (`estadoLancamento`, etc.), alterado só por funções da própria fatia. O estado compartilhado de domínio (`S`, `G`, `ROM`, `ROMS`) fica em `core` e é lido pelas fatias por funções de acesso. Migração dos 53 globais por grupos: domínio, edição, interface, nessa ordem, junto com a fatia dona de cada um.

### Armazenamento

Última peça: um módulo `src/store/` que **reúne** o acesso a `localStorage` e IndexedDB (hoje espalhado por 14 arquivos), sem mudar formato, chaves, diário nem comportamento. Sem interface assíncrona nova, sem UUID: só concentrar para a IA mexer em armazenamento em um lugar. Testes `t58` a `t63` e `t94` com backup real são obrigatórios.

### Ordem de trabalho

1. **Fundação:** `FATIA.json`, `tools/mapa.mjs`, `tools/checar_fronteiras.mjs` em modo aponta, `CLAUDE.md`, medição de acoplamento atual (confirma ou corrige a tabela de fatias).
2. **Fechar a Etapa 2:** separar `conjSync` e `fixarRefs` da escrita no DOM, levar `gerar` ao núcleo, teste de caracterização com o backup real, desfazer ciclos do núcleo, trocar `tests/_fonte.js` por importação direta.
3. **Fatias, da menos acoplada à mais acoplada**, cada uma terminando em suíte verde, regra de fronteira ativada em modo falha e verificação no celular: `exportacao`, `tabelas`, `configuracao`, `notafiscal`/`fotos`, `romaneio`, `planilha`, `lancamento`, `app`.
4. **`store`** concentrando o armazenamento.
5. **Fechamento:** `lint:estrito` sem avisos, contagem de globais, `ARQUITETURA.md` final, pacote do Netlify regenerado e verificado (sem publicar).

### Critério de pronto de uma fatia

Arquivos movidos; `FATIA.json` e `LEIA-ME.md` escritos; fronteira em modo falha sem violação; suíte completa verde com `CP_BACKUP`; telas da fatia conferidas no celular (390 px); contagem de globais registrada em `PLANO-TRANSICAO-SAAS.md`.

## O que fica para quem for construir

- Nome e corte final das fatias depois da medição de acoplamento (a tabela acima é proposta).
- Como representar `FATIA.json` e a convenção de nomes para o lint reconhecer a posse de cada símbolo.
- Se o bloco único continua por concatenação com `_ordem.txt` por fatia (recomendado; mantém o montador) ou se o núcleo ganha mais módulos reais.
- Pendências da auditoria de 09/11 (por exemplo AUD-A-007, AUD-C-001, AUD-C-003) **não** fazem parte deste trabalho; a fatia dona de cada uma deve registrá-la no seu `LEIA-ME.md` como problema conhecido.

## Calls feitos pelo autor deste documento (não foram combinados)

- Estrutura em `src/fatias/` com `FATIA.json` e `LEIA-ME.md` por fatia.
- Mapa gerado e conferido por ferramenta, em vez de escrito à mão.
- Lint de fronteira entra em modo "aponta" e vira "falha" por fatia.
- `CLAUDE.md` na raiz.
- `store` reduzido a concentrar acesso, sem API assíncrona, sem UUID.
- Ordem das fatias da menos para a mais acoplada, com `lancamento` e `app` por último.
