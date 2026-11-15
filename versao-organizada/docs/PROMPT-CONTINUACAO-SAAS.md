# Prompt de continuação — transição SaaS do Cadastro de Peças

Cole o bloco abaixo numa sessão nova (pasta de trabalho: `versao-organizada/`).

---

Continue a transição do Cadastro de Peças para SaaS seguindo [docs/PLANO-TRANSICAO-SAAS.md](PLANO-TRANSICAO-SAAS.md). Leia primeiro o [CLAUDE.md](../CLAUDE.md) (comandos, onde ler, regras de fatia) e a seção **"Registro de execução"** no fim do plano. Fale português do Brasil. Não faça `git push`, não publique no Netlify e não apague nada sem eu pedir.

## Onde paramos (15/11/2026)

Branch `main` (tudo mesclado localmente; **nada enviado ao GitHub nem ao Netlify**). Tags locais `v-pre-saas` e `v-pre-etapa3`. O estado de prontidão está em [docs/PRONTIDAO-SAAS.md](PRONTIDAO-SAAS.md): leia primeiro.

- Etapas 0 a 4 concluídas como preparação: núcleo puro em `src/core/` (roda em Node: `tools/exemplo_nucleo_node.mjs`), `src/store/` (funil de dados, preferências, eventos, `storeLocal` com teste de contrato), 9 fatias, **0 globais mutáveis**.
- Decisão do dono (15/11/2026): deixar o código **preparado**, sem fazer a transição ainda. Etapa 5, `despachar` e desfazer por ações, cortar escritas entre fatias e o servidor (Etapas 6 e 7) ficam para depois.

## Como trabalhar

- Mapa gerado das fatias e do núcleo: [docs/ARQUITETURA.md](ARQUITETURA.md) (`npm run mapa`). Cada fatia diz no `LEIA-ME.md` para que serve, armadilhas e pendências.
- Mexa só na pasta da fatia; para usar outra, use o que ela expõe em `FATIA.json` (`expoe` novo exige justificativa no LEIA-ME da dona). Arquivo novo entra em `src/_ordem.txt`.
- Ação de clique nova: registre no `acoes.js` da fatia com `registrarAcoes(ACOES, "<fatia>", {...})` (`ACOES` está em `src/core/acoes.js`).
- Antes de commitar: `npm run lint` (lint + `fatias --validar` + fronteiras), `npm run test:unit`, `npm run build` (o HTML unificado é versionado), e a suíte completa:

```bash
CP_BACKUP="C:/Users/mathe/Downloads/cadastro-pecas-backup-completo-2026-11-08.json" python tests/run_all.py --paralelo=4
```

  Requer Node >= 22.12. Em `--paralelo` um teste Playwright diferente pode falhar por carga (t19, t62, t63_migracao_legada, t65_*, t69_*, t102): rode sozinho com `--so=<nome>` antes de tratar como falha.
- Ver o app com os dados do backup: [tools/ao_vivo.py](../tools/ao_vivo.py), depois `python -m http.server 8765 --directory ../arquivo/ao-vivo` e abrir `http://127.0.0.1:8765/app.html`.
- Pacote Netlify: `python tools/publicar.py` e `python tools/verificar_pacote.py` (saída em `publicar-netlify-unificado/`; gerar não é publicar).

## Próximos passos, em ordem

1. Responder as perguntas em aberto (ver `docs/PRONTIDAO-SAAS.md`) e, se possível, validar o app atual com 1 a 3 lojas reais (o pacote Netlify está pronto: `python tools/publicar.py`; gerar não é publicar).
2. **Etapa 6 — servidor**, só depois: brainstorm e plano; fatia mínima com uma organização por conta, importar backup pelo núcleo, exportar a mesma planilha e adaptador remoto que passe `tests/contrato_store.js`.
3. Etapa 5 (interface em módulos) e a 4.3 (`despachar`, desfazer por ações, cortar as escritas de `docs/escritas-entre-fatias.md`) quando fizerem falta.

## Pendências da auditoria (conhecidas, NÃO corrigidas; detalhes em [docs/AUDITORIA-COMPLETA-2026-11-09.md](AUDITORIA-COMPLETA-2026-11-09.md))

- `armazenamento`: AUD-A-001 (backup leve além do limite de restauração), AUD-A-002 (`migrarGrades` liga grades independentes), AUD-A-003 (reversão da restauração afirma sucesso sem conferir), AUD-A-004 (retorno de `romIndex`/`gravarIdx` ignorado), AUD-A-005 (lembrete conta backup inadequado), AUD-A-006 (fechar a aba durante gravação pendente), AUD-A-008 (exclusão sem o ponto prometido), AUD-A-009 (restauração não alerta backup incompleto).
- `planilha`/`lancamento`: AUD-A-007 (alteração não salva de uma variação substituída ao editar outra). Núcleo: AUD-B-001 (entrada numérica ambígua, `num('1.500')`).
- `romaneio`: AUD-C-001 (linha sem descrição omitida sem aviso), AUD-C-002 (selo da NF com item de quantidade 0), AUD-C-003 (limite de 3.000 linhas sem alerta), AUD-C-004 (CSV com ponto e vírgula). AUD-F-001 (padrão de leitura personalizado pode travar a aba).
- `exportacao`: AUD-D-001 (configuração muda durante a cópia/download). Testes: AUD-K-001 (agregador pode mascarar falha), AUD-K-003 (t40 não confere o custo no XLSX).

## Pendências pequenas adiadas

- Adaptadores gerados sem uso em `00-adaptadores-nucleo.js` (`bhDe`, `descBanho`, `todasGrades`…): tirar pelo gerador (`tools/extrair_para_core.mjs`), não à mão.
- `tools/injetar_estado.mjs` ainda mapeia nomes antigos de arquivos (ferramenta de uso único).
- Testes de caracterização: o de `gerar$` ficou tautológico depois que o app passou a usar o núcleo; `fixarRefs$`/`renumerarRefs$` só têm cobertura ponta a ponta.
- Ferramentas: `escrita-externa` também conta como `uso-nao-exposto`; o grafo não vê usos em `registrarAcoes` nem em listeners de nível superior.
- Overflow lateral de 63 px no romaneio aberto a 390 px (anterior à reorganização). Linhas acima de 160 caracteres em quase todos os arquivos (código minificado à mão).
- Publicar o pacote no Netlify, decidir o `git push` (tudo já mesclado em `main` localmente) e responder as perguntas em aberto do plano antes da Etapa 6.

## Armadilhas já encontradas

- Ao gerar código com quebra de linha dentro de strings, use `chr(10)` ou `String.fromCharCode(10)`.
- Em Windows, arquivos reescritos por Python saem com CRLF; use `tools/normalizar_eol.py` (o `.gitattributes` normaliza no commit).
- Nunca dispare `change` à mão num campo (refaz o formulário no meio da digitação); [37-moeda.js](../src/fatias/configuracao/37-moeda.js) só dispara `input`.
- A suíte copia `src`, `tests`, `tools`, `lib` e `vendor` para uma pasta temporária; mudanças feitas depois da cópia não entram naquela rodada.
- Mover código sem mudar o HTML: `git mv` ou `tools/dividir_arquivo.mjs`, linha na mesma posição de `src/_ordem.txt`, e `python tools/hash_html.py` igual antes e depois.
