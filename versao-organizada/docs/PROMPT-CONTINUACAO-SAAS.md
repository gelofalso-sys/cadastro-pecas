# Prompt de continuação — transição SaaS do Cadastro de Peças

Cole o bloco abaixo numa sessão nova (pasta de trabalho: `versao-organizada/`).

---

Continue a transição do Cadastro de Peças para SaaS seguindo [docs/PLANO-TRANSICAO-SAAS.md](PLANO-TRANSICAO-SAAS.md). Leia primeiro a seção **"Registro de execução"** no fim desse arquivo. Fale português do Brasil. Não faça `git push`, não publique no Netlify e não apague nada sem eu pedir.

## Onde paramos (14/11/2026)

Branch `main`, 6 commits locais à frente do GitHub (nada enviado). Tag local `v-pre-saas`.

| Commit | O que fez |
|---|---|
| `3af2902`, `a791edb` | Etapa 0: linha de base, material antigo para `../arquivo/`, árvore duplicada removida |
| `1e53e18` | Etapa 1: `package.json`, ESLint sobre o bloco montado, Prettier, `vendor/pdfjs/` |
| `c9d6b21` | Etapa 2 (parte 1): 255 funções puras em `src/core/` |
| `3a59c00` | Etapa 2 (parte 2): 108 funções que só dependem de `S` viram `f$(S, ...)` no núcleo, com adaptadores |
| `0c33a31` | Correções de celular (cartão do banho, fórmulas de custo, campos em R$, cadastros alinhados) |

Suíte completa verde com o backup real (`CP_BACKUP`), 164 OK. `t19` falha só em modo `--paralelo`; sozinho passa.

## Arquivos que importam

- Plano e registro: [docs/PLANO-TRANSICAO-SAAS.md](PLANO-TRANSICAO-SAAS.md)
- Núcleo (módulos ES, sem DOM): [src/core/](../src/core/) — `formulas`, `colunas`, `utilidades`, `configuracao`, `dominio`, `romaneio`, `backup`, `notafiscal`, `exportacao`; ordem de carga em [src/core/_ordem.txt](../src/core/_ordem.txt)
- Adaptadores gerados: [src/js/00-adaptadores-nucleo.js](../src/js/00-adaptadores-nucleo.js) (`f(...)` chama `f$(S, ...)`)
- Montador: [tools/montar.py](../tools/montar.py) (embute o núcleo sem `import`/`export` no bloco único)
- Ferramentas da Etapa 2: [tools/grafo_puro.mjs](../tools/grafo_puro.mjs) (lista o que é puro e a causa da impureza), [tools/extrair_para_core.mjs](../tools/extrair_para_core.mjs), [tools/injetar_estado.mjs](../tools/injetar_estado.mjs), [tools/checar_ordem.mjs](../tools/checar_ordem.mjs), [tools/lint.mjs](../tools/lint.mjs)
- Testes: [tests/run_all.py](../tests/run_all.py) (`--so=<regex>`, `--paralelo=N`), [tests/unit/](../tests/unit/) (Node puro), [tests/_fonte.js](../tests/_fonte.js) (ponte que lê o núcleo para testes que recortam texto)
- Ver o app no navegador com dados do backup: [tools/ao_vivo.py](../tools/ao_vivo.py), depois `python -m http.server 8765 --directory ../arquivo/ao-vivo` e abrir `http://127.0.0.1:8765/app.html`
- Pacote Netlify: `python tools/publicar.py` e `python tools/verificar_pacote.py` (saída em `publicar-netlify-unificado/`)
- Backup real para os testes: `C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json`

Comando padrão da suíte:

```bash
CP_BACKUP="C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json" python tests/run_all.py --paralelo=4
```

Tudo que falhar no modo paralelo deve ser rodado sozinho antes de ser tratado como falha real.

## Próximos passos, em ordem

1. **Fechar a Etapa 2.**
   - Separar o cálculo da escrita no DOM em `conjSync` (em [src/js/18-conjunto.js](../src/js/18-conjunto.js)) e `fixarRefs` (em [src/js/12-motor-linhas.js](../src/js/12-motor-linhas.js)); depois levar `gerar` para o núcleo.
   - Teste de caracterização com o backup real: dado `config` + `lanc`, as linhas exportadas pelo núcleo em Node são idênticas às do app (`tests/unit/`).
   - Desfazer os ciclos entre `colunas`, `formulas` e `utilidades` (mover `DEFAULT_CONFIG` e `semAc`).
   - Trocar `tests/_fonte.js` por importação direta dos módulos.
2. **Etapa 3 — camada `store`** (cuidado máximo: é onde se perde dado). Interface assíncrona com adaptador local sobre `localStorage` e IndexedDB, preferências separadas dos dados, nada fora de `src/store/` tocando armazenamento. Testes de quota, conflito, duas abas e restauração (`t58`–`t63`, `t94`) sempre com o backup real.
3. **Etapa 4 — estado explícito**: objeto de estado único e ações nomeadas; migrar os 53 globais por grupos (domínio, edição, interface).
4. **Etapa 5 — interface em módulos**: dividir os arquivos de eventos por tela, trocar strings HTML longas por funções de template, uma definição só para menu mobile e desktop.

Regras do plano que continuam valendo: o app não para de funcionar em nenhuma etapa; o formato do backup é o contrato; contar os globais a cada etapa; regenerar e verificar o pacote do Netlify ao fim.

## Pendências fora do plano

- Conferir ao vivo no celular as abas Modelo da planilha, Leitura de romaneios, Romaneios lançados, Fotos e Importar e backup (não foram vistas depois das correções de layout).
- Publicar o pacote atualizado no Netlify (a pasta local já está gerada; o site ainda não foi atualizado).
- Decidir sobre `git push` dos commits e da tag `v-pre-saas`.
- Responder as perguntas em aberto do plano (uma loja ou várias, preço, offline, pilha técnica, integrações, fotos) antes da Etapa 6.

## Armadilhas já encontradas

- A ferramenta de edição interpreta `\\n` em texto; ao gerar código com quebra de linha dentro de strings, use `chr(10)` ou `String.fromCharCode(10)`.
- Em Windows, arquivos reescritos por Python em modo texto saem com CRLF; o `.gitattributes` normaliza para LF no commit.
- Qualquer `change` disparado à mão num campo pode refazer o formulário no meio da digitação; em [src/js/37-moeda.js](../src/js/37-moeda.js) só se dispara `input`.
- Rodar a suíte copia `src`, `tests`, `tools`, `lib` e `vendor` para uma pasta temporária; mudanças feitas depois da cópia não entram naquela rodada.
