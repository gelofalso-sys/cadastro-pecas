# Arquitetura (gerado)

Gerado por `npm run mapa` (tools/mapa.mjs). Nao edite a mao; `node tools/mapa.mjs --conferir` falha se estiver desatualizado.

## Fatias

### exportacao

Exportar a tabela (xlsx/csv/copiar) com conferencia previa, assistente de outro sistema, modelos em .json, importar planilha de referencia e copia/restauracao dos cadastros.

- Arquivos: `19b-assistente-outro-sistema.js`, `28-exportar.js`, `29-importar-e-copia.js`, `acoes.js`
- Expoe: `abrirNovoSistema`, `baixar`, `copiar`, `estadoExportacao`, `importar`, `lerNovo`, `modeloDeJson`, `obterDL`, `restaurar`
- Usa: `core`
- Usada por: `legado`
- Testes: `^backup_exclusao_pendente\.js$`, `^t100_xml_precisao\.py$`, `^t33\.py$`, `^t34\.py$`, `^t35\.py$`, `^t36\.py$`, `^t40\.py$`, `^t46\.py$`, `^t48\.py$`, `^t56_conjunto_romaneio\.py$`, `^t58_backup_integridade\.py$`, `^t60_varejo\.py$`, `^t65_categoria_conjunto\.py$`, `^t67_conjunto_quantidade\.py$`, `^t67_referencias_cores\.py$`, `^t69_banho_categoria_quantidade\.py$`, `^t69_banho_divisoes_exportacao\.py$`, `^t69_banho_fixo_categoria_quantidade\.py$`, `^t69_insumos\.py$`, `^t69_lote_por_grama_categorias\.py$`, `^t71_romaneios_reais\.py$`, `^t78_baixar_selecionadas\.py$`, `^t87_ajustes_cadastros\.py$`, `^t90_banco_backup\.js$`, `^t93_revisao_agil\.js$`, `^t94_backup_real\.py$`, `^t95_lapidacao\.py$`, `^t96_fluxos\.py$`
- Globais mutaveis: 0
- Fronteira: falha

### tabelas

Tabelas salvas (historico de tabelas montadas, salvar/restaurar/ver/excluir/CSV), ver romaneio, indice de tabelas no localStorage, historico de sugestoes e varredura de fotos vivas/orfas.

- Arquivos: `19d-tabelas-indice-e-fotos.js`, `19d2-tabelas-salvar-e-ver.js`, `acoes.js`
- Expoe: `arqRef`, `estadoTabelas`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`, `tabsMigrar`, `varrerFotos`, `varrerTudo`
- Usa: `core`
- Usada por: `legado`
- Testes: `^backup_auditoria_integridade\.js$`, `^interrupcao_exclusao\.js$`, `^interrupcao_exclusao_real\.js$`, `^t101_tabela_exclusao\.py$`, `^t44\.py$`, `^t58_backup_integridade\.py$`, `^tabela_exclusao_integridade\.js$`
- Globais mutaveis: 0
- Fronteira: falha

## Dependencias reais entre donos

| de -> para | simbolos |
|---|---|
| exportacao -> core | 33: `COLW`, `DUAS`, `LET`, `LIM_EXPORT`, `MAX_BACKUP_BYTES`, `MAX_PLANILHA_BYTES`, `MAX_PLANILHA_LINHAS`, `NOME`, ... |
| exportacao -> legado | 30: `S`, `casa`, `cfg`, `chaveDoCabecalho`, `checaLinhasPlan`, `colunasExport`, `conferirExport`, `faixaRefs`, ... |
| legado -> exportacao | 3: `abrirNovoSistema`, `estadoExportacao`, `obterDL` |
| legado -> tabelas | 8: `arqRef`, `gravarIdx`, `histSugAgendar`, `pontosIds`, `setAutor`, `tabIndex`, `tabsMigrar`, `varrerFotos` |
| tabelas -> core | 19: `LET`, `PONTO_IDS`, `TABDEL`, `brl`, `candFoto`, `celulas`, `clone`, `codsDe`, ... |
| tabelas -> legado | 35: `ARQ`, `AUTOR`, `HIST`, `HIST_SUG`, `REDO`, `S`, `TABS`, `avisoEdicao`, ... |

## Globais mutaveis por dono

| dono | globais |
|---|---|
| legado | 95 |
