# Cadastro de Pecas (guia para IA)

App de arquivo unico (HTML) montado a partir de `src/`. Responda e comente em portugues.

## Comandos
- `npm run build` monta o HTML a partir de `src/` (tools/montar.py).
- `npm run test:unit` testes unitarios (node --test, tests/unit).
- `npm run lint` lint + validacao de FATIA.json + fronteiras entre fatias.
- `npm run mapa` regenera docs/ARQUITETURA.md (mapa gerado).
- `python tools/hash_html.py` hash do HTML montado (prova de refatoracao sem mudanca).
- Suite completa (alguns minutos):
  `CP_BACKUP="C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json" python tests/run_all.py --paralelo=4`
  - `--so=<regex>` roda so os testes cujo nome casa.
  - A suite roda numa copia temporaria; nao suja o projeto.
  - t19 falha so em `--paralelo`; rode sozinho antes de tratar como falha real.

## Onde ler
- `docs/ARQUITETURA.md`: mapa das fatias e do nucleo.
- `docs/superpowers/specs/2026-11-14-organizacao-para-ia-design.md`: desenho da reorganizacao.
- `src/_ordem.txt`: ordem de carga unica (caminhos relativos a `src/`). Arquivo novo entra aqui.
- Acoes de clique: `ACOES` em `src/js/30-eventos-mouse-e-clique.js`; `registrarAcoes` em `src/core/acoes.js`.
  Ao migrar um `case`: `break` vira `return`; `return` que pulava o pos-switch vira `return false`.

## Armadilhas conhecidas
- Em texto gerado use `chr(10)` / `String.fromCharCode(10)`, nunca `\n` literal.
- CRLF no Windows: use `tools/normalizar_eol.py` e respeite o `.gitattributes`.
- Nunca dispare `change` a mao em campo; so `input` (ver `src/js/37-moeda.js`).

## Regras de fatia
- Mexa so na pasta da fatia. Para usar outra fatia, use o que ela expoe em `FATIA.json`.
- `expoe` novo exige justificativa no `LEIA-ME.md` da fatia dona.

## Git
- Nao faca `git push` nem publique nada sem o usuario pedir.
