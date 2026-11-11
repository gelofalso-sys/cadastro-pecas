# Critérios de aceite — auditoria de 10/11/2026

Os testes foram executados em dados isolados; nenhum deles autoriza apagar dados reais. A versão da aplicação é identificada no menu pelo resumo do código montado. Este relatório registra limites, não constitui autorização para publicar.

## 1. Integridade dos dados

| Critério | Estado | Evidência e limite |
|---|---|---|
| Backup e restauração com comparação completa | Parcial | `tests/t58_backup_integridade.py`: dois lançamentos, um romaneio, uma tabela, quatro fotos e cadastros sintéticos comparados em navegador limpo. Não é backup real; usuário informou que os dados são testes. |
| Falta de espaço | Parcial | `tests/t59_conflito_quota.py` e `tests/t61_journal_quota.py` simulam falhas de localStorage/IndexedDB e recusam restauração se não for possível proteger os dados. Não representa 2–5 mil linhas e centenas de fotos reais. |
| Encerramento da aba | Parcial | `tests/t60_crash_restauracao.py` encerra a aba em quatro pontos da restauração e confere retorno ao estado anterior. Criar, revogar e importar ainda precisam de interrupções equivalentes. |
| Duas abas | Parcial | `tests/t62_backup_duas_abas.py`: restauração bloqueada enquanto outra aba da versão atual está aberta. Uma aba antiga não participa do bloqueio; não foi garantida a segurança entre versões diferentes. |
| Dados removidos pelo navegador | Parcial | Aviso em Importar e backup; lembrete existente depois de sete dias. Modo privado e política real de retenção do Safari não foram experimentados. |
| Mudança de versão | Parcial | `tests/t63_migracao_legada.py`: fixture simulada de cadpecas3. Não cobre todas as versões nem arquivos antigos reais. |

## 2. Cálculos e importação

| Critério | Estado | Evidência e limite |
|---|---|---|
| PDFs em Downloads | Parcial | 72 arquivos com nome contendo `-link-`: texto de 53 documentos e 421 linhas comparado integralmente por código, quantidade e total; 10 parcialmente sem divergência nas linhas comparáveis; três inconclusivos e seis sem o padrão usado. Não são 72 importações PDF ponta a ponta aprovadas. Scripts `tests/extrair_pdf_lote.py`, `tests/auditoria_pdf_lote.py`, `tests/auditoria_pdf_direto.py`. |
| XML, XLSX e CSV | Parcial | `tests/auditoria_xml_importacao.py`: NF-e sintética, dois itens, desconto e frete; testes `t47` e `t48` para XLSX e CSV. Não cobre todos fornecedores e casos de anéis reais. |
| Arredondamento de lotes | Parcial | `tests/auditoria_regressoes.js`: compara soma dos custos unitários arredondados com o total e avisa qualquer divergência em centavos; ajuste é manual. Não prova todos os lotes dos PDFs. |
| XLSX no destinatário | Pendente | O arquivo foi lido por openpyxl; não foi importado no Bling nem em outro destinatário. |

## 3. Regras de produto

| Critério | Estado | Evidência e limite |
|---|---|---|
| Varejo | Implementado | A pedido do usuário, preço pode ficar vazio; sugestão é identificada como referência e não vira preço salvo. `tests/t60_varejo.py` verifica revisão e célula exportada vazia. |
| Frete e separação | Implementado | Permanecem fora do custo das peças, conforme decisão do usuário; aviso na revisão. |
| Exclusões e restauração | Parcial | Exclusão de fornecedor pede confirmação com uso na tabela e no romaneio aberto; banhos e galvânicas usados já possuem confirmação. A confirmação de backup informa substituição e mesclagem. Uso em arquivos salvos não é contado no aviso. |

## 4. Navegadores e celular

| Critério | Estado | Evidência e limite |
|---|---|---|
| Safari/iOS e Firefox reais | Pendente | Lookbehind removido e regra coberta por `tests/seguranca_compat_regressao.js`; não substitui testar aparelhos reais. Sem Web Locks, restauração completa é bloqueada. |
| Chrome e Edge no celular | Parcial | `tests/t56.py` passou em Edge e Chrome com viewport de celular, não em aparelho físico. Testes de cadastro estrito existentes ainda não cobrem todos os fluxos. |

## 5. Segurança e privacidade

| Critério | Estado | Evidência e limite |
|---|---|---|
| CSP, eval e dependências | Parcial | Política publicada não contém `unsafe-eval`; pdf.js recebe `isEvalSupported:false`, mas biblioteca é obtida da CDN e precisa de rede. O pacote de publicação ainda não foi atualizado nem testado. |
| imgbb | Parcial | Envio automático exige consentimento; envio manual pede confirmação e há aviso sobre terceiro e chave. Testes unitários verificam condição; não foi exercitada a conta real do serviço. |
| Dados pessoais e entradas | Parcial | Aviso sobre texto pessoal e backup; XML sintético com HTML escapado na prévia. Não há cobertura completa ponta a ponta de todos os campos e formatos. Ambiente opcional pode fornecer integração externa; não presumir ausência universal de sincronização. |

## 6. Escala

| Critério | Estado | Evidência e limite |
|---|---|---|
| 5.000 linhas | Parcial | `tests/perf_5000.py`, Edge/Windows, dados sintéticos sem fotos: amostra pontual 1,42 s abertura, 0,47 s busca e 1,89 s exportação; 69 linhas virtualizadas e 5.001 no XLSX. Não mede FPS ou dispositivo real. |
| Histórico e fotos | Pendente | Memória com centenas de fotos, `varrerFotos`, `histNota` e regravação de fotos ainda precisam de perfil e limites mensurados. |

## 7. Uso e acessibilidade

| Critério | Estado | Evidência e limite |
|---|---|---|
| Uso por pessoa real | Pendente | Depende de acompanhamento com a pessoa usuária e romaneio real. |
| Teclado e avisos | Parcial | Imagens da tabela têm botão com foco; `tests/t64_acessibilidade.py` abre a imagem por Enter; cartão tem botão de edição separado; avisos duram mais e podem ser fechados. Falta auditoria completa com teclado e leitor de tela. |
| Celular | Parcial | Menu movido para a barra inferior e medido em 320 px sem transbordamento. Cartões de peça continuam longos; falta validar em aparelho real. |

## 8. Publicação

| Critério | Estado | Evidência e limite |
|---|---|---|
| Pacote testado | Pendente | `tools/publicar.py` gera manifesto de hashes e `tools/verificar_pacote.py` compara artefatos com o manifesto e a fonte montada. O pacote antigo não possui manifesto; ainda é necessário gerar, testar o próprio index do pacote e verificar antes de publicar. Hash não prova equivalência semântica da minificação. |
| Versão e reversão | Parcial | Identificação de data e resumo do código visível no menu. O plano operacional de reversão do deploy Netlify precisa ser conferido na conta antes da publicação. |
| Suíte final | Parcial | Passagem integrada teve três falhas de teste por seletor/espera/foco; os três foram ajustados e passaram em repetição isolada, assim como `t64_acessibilidade.py`. Uma segunda passagem integral após os ajustes de teste ainda não foi feita. `t18` permanece pulado sem `CP_BACKUP`. |
