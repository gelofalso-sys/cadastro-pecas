# Cadastro de Peças — versão organizada

O app continua sendo UM arquivo (`cadastro-pecas.html`, abre direto no navegador). A diferença: o código-fonte
fica dividido em `src/` e o arquivo é MONTADO a partir dele.

- `src/css/` — estilos em 12 arquivos (ordem em `_ordem.txt`; a ordem importa por causa da cascata)
- `src/js/` — JavaScript em 31 arquivos por responsabilidade (ordem em `_ordem-a.txt` e `_ordem-b.txt`):
  10–19 limites, colunas, motor, persistência, planilha, lançamento, cadastros, romaneio;
  20–35 armazenamento, revisão, PDF, fotos/NF, relatório, exportar, importar, eventos, janelas, visões.
- `src/html/` — topo, corpo da página e fim
- `tools/montar.py` — junta tudo e gera `cadastro-pecas.html`
- `tests/run_all.py` — suíte (Playwright + Edge); `tools/demo.py` gera a demo para o Netlify

## Fluxo de trabalho
1. Edite os arquivos em `src/`.
2. `python tools/montar.py`  → gera `cadastro-pecas.html`
3. `python tests/run_all.py` → deve terminar com "Falhas: 0"

Todo o JS fica dentro do mesmo bloco (IIFE): os arquivos são só concatenados, não são módulos. Por isso uma função
de um arquivo enxerga as de todos os outros, e a ORDEM dos arquivos importa. Ao criar um arquivo novo, inclua-o no manifesto.

Verificação da divisão: o arquivo montado é idêntico, byte a byte, ao `cadastro-pecas.html` da pasta principal
no commit d82b061, e a suíte completa passou com 0 falhas.

## Cadastros: salvar explícito
`src/js/36-cadastros-salvar.js`: alterações feitas na área Cadastros ficam *pendentes* (barra "Salvar alterações / Descartar") e não são gravadas até salvar;
enquanto isso formulário, tabela, romaneio e Desfazer ficam travados. Descartar devolve cadastros, peças e romaneio ao estado anterior.
Em teste automatizado (`navigator.webdriver`) vale o modo antigo (grava na hora) para os testes existentes; `localStorage cadpecas-cad-estrito=1` liga o modo novo (ver `tests/t49.py`).
Limite: janelas (`.rep`) abertas a partir dos Cadastros (ex.: colar catálogo) continuam gravando na hora.
