# 06 — Segurança da aplicação revalidada

Referenciais consultados em 07/11/2026: [OWASP ASVS](https://asvs.owasp.org/) e [Top 10:2025](https://top10.owasp.org/2025/). Objetivo proposto ASVS nível 2 para o SaaS; sem certificação ou cobertura dinâmica integral.

## Seguir o fluxo completo

O achado XSS anterior não se sustenta como exploração confirmada na versão atual. checarLanc aceita string e sinks data-lid não escapam atributos, porém lerLanc aplica idLimpo (H:1946), que remove delimitadores e espaços (H:1467). O payload inofensivo audit" data-audit="injected vira auditdata-auditinjected. Um probe que omite lerLanc não comprova alcance do sink.

Novo A01: validarBackup verifica duplicidade dos IDs brutos (3144), depois normaliza (3153). ab"c e abc tornam-se abc, confirmado com a função real em Node. Ainda não houve reprodução E2E de efeitos sobre peças/fotos. Corrigir unicidade após transformação e preservar/remapear referências; escape de atributos permanece defesa adicional.

PDF.js 3.11.174 tem isEvalSupported:false em H:3437 e 3573. Essa é a mitigação documentada pelo [mantenedor](https://github.com/mozilla/pdf.js/security/advisories/GHSA-wgrm-67xf-hhpq). Atualização continua recomendada, com corpus PDF/NF/fotos, sem classificar o vetor mitigado como execução comprovada.

SheetJS local 0.20.3 foi verificado. O fallback 0.18.5 está nas faixas afetadas por [CVE-2023-30533](https://cdn.sheetjs.com/advisories/CVE-2023-30533) e [CVE-2024-22363](https://cdn.sheetjs.com/advisories/CVE-2024-22363). A demo referencia biblioteca local inexistente em sua pasta. Não atribuir essas CVEs à versão local corrigida.

## Cobertura de ameaças

| Superfície | Estado observado | Mitigação/aceite |
|---|---|---|
| XSS texto/atributo/URL | esc/idLimpo presentes; 63 innerHTML; cobertura total NÃO VERIFICADA | revisar origem e contexto; atributos e URLs inertes em todas as telas |
| SQL/filtros/RPC | SQL próprio não encontrado; NÃO APLICÁVEL local, provedor NÃO VERIFICADO | parâmetros, allowlist de filtros/sort; grants e funções mínimos |
| Command injection | subprocess.run usa array; não demonstrada | validar domínio interpolado em JS do gerador e entradas de build |
| CSV/XLSX injection | csvq/protegeTxt e fórmulas controladas presentes | prefixos =,+,-,@, controles, locale, hyperlinks e funções externas |
| Auth/CSRF/CORS/redirect | backend próprio de sessão não localizado | SaaS: sessão server-side, cookies seguros, Origin/CSRF, CORS mínimo, redirects internos |
| IDOR/BOLA/BFLA/escalada | autorização SaaS não comprovada | servidor + RLS + R01–R16; menus não são controle |
| Chaves/tokens | imgbb em localStorage CONFIRMADO | segredos compartilhados somente servidor; revisão de bundle/log/cache |
| service_role/DEFINER/views | NÃO APLICÁVEL no app local | controles de 05 e testes de bypass por API direta |
| CSP/clickjacking | _headers tem CSP/XFO; serviço real NÃO VERIFICADO | verificar HTTP; migrar unsafe-inline para nonce/hash quando possível |
| CSP/mídia | o gerador omitia imgbb (A13); corrigido em G: img-src com https://i.ibb.co e connect-src com https://api.imgbb.com | verificar upload/preview em HTTP real e manter a allowlist mínima |
| Upload/SSRF | fetch cliente para endpoints conhecidos; servidor-fetch arbitrário não localizado | bucket privado, conteúdo/tamanho real, TTL; futuro import por URL nega redes privadas/redirects |
| XML/XXE | DOMParser cliente; XXE não demonstrado | parser servidor futuro sem DTD/entidades externas e com orçamento |
| DoS/memória | bytes/páginas/linhas limitados; planilha convertida antes de checar linhas em romPlanilha0 | cotas células/colunas/pixels/tempo, worker cancelável |
| Exportações/requisições em massa | limites SaaS ainda não implementados | quotas por tenant/ator, paginação máxima, jobs concorrentes limitados |
| Logs/auditoria | AUTOR é texto local | ator autenticado, append-only e sem documentos/tokens em logs |
| Supply chain | fallback antigo, minificador flutuante e artefato incompleto | dependências fixas, hash, proveniência e smoke do artefato |
| Webhook/pagamento | não encontrado | futuro: assinatura/timestamp/idempotência e outbox transacional |

Não usar a ausência de SQL/backend local para afirmar que o serviço remoto está protegido. Inventário de tabelas/policies/RPCs de produção permanece NÃO VERIFICADO.

## Confiabilidade também limita segurança

A04/A08: resposta remota pode substituir edição; falha remota retorna antes da cópia local. A05: foto manual verifica IDB, criação via romaneio não aguarda. A06: export marca incompleto, restore não distingue. A07: compensação em memória não garante recuperação de crash. A18: suíte existente pode apresentar sucesso falso.

Severidade, probabilidade, impactos, esforço e testes estão em 12. Reproduções futuras devem usar fixtures sintéticas/perfil isolado e observar o estado final. Não foram executados arquivos maliciosos, acessadas contas reais ou registradas credenciais.

