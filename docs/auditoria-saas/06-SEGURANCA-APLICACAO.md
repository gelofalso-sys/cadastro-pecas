# 06 — Segurança da aplicação

Referências de avaliação: [OWASP ASVS 5.0](https://asvs.owasp.org/) e [OWASP Top 10:2025](https://top10.owasp.org/2025/). São referências de cobertura, não certificação. Usar requisitos aplicáveis ao SaaS com objetivo ASVS nível 2; registrar requisito/controle/teste na implementação.

## Achados prioritários verificáveis

### A01 — injeção de atributo por ID de backup

`checarLanc` (2650–2659) aceita qualquer string em `l.id`; `validarBackup` preserva IDs (2687/2696). `gerar` transfere para `lancId` (1311). `cartoes` (1713), tabela (1770) e formulário (1973) interpolam IDs em atributos sem `esc`. Escape de descrição não protege identificadores.

Teste isolado em Node v24.18.0 extraiu a função real e passou `{id: 'audit" data-audit="injected'}`. Validação aceitou; interpolação equivalente gerou `<button data-lid="audit" data-audit="injected">`. CONFIRMADO: validação insuficiente e injeção de atributo. PROVÁVEL: XSS persistente após importar backup manipulado e renderizar. Execução de handler em navegador não testada. Em arquivo local não há CSP HTTP; na demo, `unsafe-inline` não fornece barreira adequada para esse caminho.

Correção: validar formato/tamanho de IDs no ingresso, preservar/mapear IDs legados válidos, construir atributos por DOM/React ou escapar todos; revisar também IDs de grades (2789) e demais sinks. Aceite: backup com aspas/markup rejeitado ou renderizado inerte em lista, tabela, formulário e revisão; nenhuma execução/evento extra e dados normais preservados.

### A02 — PDF.js vulnerável

CONFIRMADO: 3.11.174 em 2891; `getDocument` em 2911 e 3047 não define `isEvalSupported:false`. [Advisory do mantenedor](https://github.com/mozilla/pdf.js/security/advisories/GHSA-wgrm-67xf-hhpq) inclui versões até 4.1.392 em CVE-2024-4367, com correção em 4.2.67 e mitigação por desativar eval. Risco de execução ao processar PDF malicioso; não houve exploração. CSP de uma hospedagem pode alterar a exploração, mas não corrige a dependência.

Atualizar para versão suportada e corrigida, verificando API de extração de imagens/worker e fixtures. Mitigação temporária deve cobrir todos os pontos de abertura. Não presumir que simples troca de URL major seja compatível.

### A03 — SheetJS vulnerável

CONFIRMADO: `xlsx/0.18.5` (1105) é usado em leitura (3660–3671). Advisories [prototype pollution CVE-2023-30533](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6) e [ReDoS CVE-2024-22363](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9) abrangem essa versão; correções descritas em 0.19.3 e 0.20.2 respectivamente. Exploração no aplicativo NÃO VERIFICADA. Buscar distribuição oficial corrigida, integridade e licença; não assumir que `npm update xlsx` resolve. Alternativa é parser substituto com equivalência de tipos, fórmulas e cabeçalhos demonstrada.

## Cobertura de ameaças

| Superfície | Evidência / classificação | Ação e verificação |
|---|---|---|
| XSS por texto comum | `esc` em 1203 e numerosos templates: proteção CONFIRMADA; cobertura total NÃO VERIFICADA | Revisar os 49 `.innerHTML` por origem/contexto; teste de atributos, URLs e HTML |
| Fórmula CSV | `csvq` 1186 / `protegeTxt` 3596: neutralização CONFIRMADA | Testar prefixos =,+,-,@, tab/CR, aspas, delimitadores e negativo legítimo em todos os exports |
| Fórmula XLSX | regex restrita 1358 / célula 3570: mecanismo CONFIRMADO | Validar referência/cálculo e impedir funções externas; não chamar eval |
| SQL/RPC injection | SQL/RPC não encontrados: NÃO APLICÁVEL ao app local | Destino: queries parametrizadas, allowlist de sort/filtros, zero SQL concatenado |
| Command injection | `subprocess.run` usa array no gerador: não há shell injection demonstrada | Validar domínios interpolados em JS do gerador; build com entradas controladas |
| Segredos | chave imgbb em localStorage 2957/3988: CONFIRMADO | Qualquer script na origem pode ler; não guardar segredo compartilhado de plataforma no browser |
| CSRF/CORS/sessão | API de sessão própria não encontrada; provedor NÃO VERIFICADO | SaaS cookies seguros, validação Origin/CSRF em mutações, allowlist CORS; GET sem efeitos |
| IDOR/escalonamento | não há autorização SaaS demonstrada | Testes R01–R16; servidor/RLS, não menus escondidos |
| Headers | arquivo demo contém CSP e XFO; headers efetivamente servidos NÃO VERIFICADOS | Testar resposta HTTP no deploy e modo file separadamente |
| CSP inconsistente | connect-src da demo não inclui api.imgbb.com | Bloqueio de upload PROVÁVEL sob headers declarados; decidir oferecer integração na demo |
| SSRF/open redirect | requisições browser para endpoints fixos; servidor-fetch arbitrário não encontrado | Novo import por URL deve negar redes privadas, redirects e DNS rebinding; não adicioná-lo sem demanda |
| Arquivos grandes | fotos limitadas a 25 MB (3408); PDF percorre todas as páginas (2913) | Falta de orçamento PDF/XML/XLSX/backup nos caminhos lidos CONFIRMADA; impor bytes/páginas/linhas/pixels/tempo |
| XML externo | DOMParser no navegador (3033) | XXE não demonstrado; não transferir parsing ao servidor sem bloquear DTD/entidades e limitar expansão |
| Abuso de export/import | trabalho potencialmente grande no cliente | cancelamento, worker, cota por tenant e limite de lotes no servidor |
| Logs/auditoria | autor informado pelo usuário e histórico local | Não usar como prova autenticada; audit append-only no servidor |
| Supply chain | CDN sem integridade explícita e terser não fixado | Versões fixas, hash/SRI quando aplicável, build reproduzível e SBOM |
| Pagamentos/webhooks | não encontrados | Futuro: assinatura, timestamp, deduplicação e transação antes de reconhecer evento |

## Segurança e integridade operacional

`carregar` (1642–1648) informa que usuário pode lançar enquanto conexão está pendente e depois substitui o estado por remoto. Uma edição antes da resolução pode desaparecer: reprodução deve controlar uma promise remota e comparar versões. `flush` (1519) não torna config+lançamentos atômicos. `romSalvar`/delete remoto (2732–2735) suprimem erros; notificação de sucesso da UI não prova persistência.

`fotoNaPeca` (3414) altera miniatura e ignora null de `idbPut`. `backupTotal` (2611–2613) usa `||[]` em falha de leitura, e 2617 pode anunciar backup completo. Restauração (2706–2725) tenta compensar gravações, mas rollback pode falhar ou o processo encerrar entre stores. Há proteções úteis, porém sem commit durável único.

Não executar provas destrutivas em dados do usuário. Reproduzir com perfil temporário, fixtures sintéticas, interceptação do armazenamento e servidor local isolado. Testes de vulnerabilidade devem demonstrar inércia/negação com payloads inofensivos, sem exfiltração.
