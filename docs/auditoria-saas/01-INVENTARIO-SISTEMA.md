# 01 — Inventário do sistema

## Repositório efetivo

`LEIA-ME.txt:2` define `cadastro-pecas.html` como fonte principal. Git rastreia quatro arquivos: `.gitignore`, `LEIA-ME.txt`, `cadastro-pecas.html`, `tools/demo.py`. `.gitignore:1–3` exclui backups, demo e versão Chrome. Foram encontrados 12 snapshots HTML e um gerador Python antigo em `backups/`; são referências históricas, não módulos ativos. Nenhum `AGENTS.md` foi encontrado na árvore examinada.

Não foram encontrados manifests Node, lockfiles, configuração TypeScript, migrations SQL, testes automatizados ou workflow CI na árvore disponível. Isto não prova que não existam em outro ambiente. Não há SDK Supabase no aplicativo examinado.

| Artefato | Tamanho capturado | SHA-256 | Papel |
|---|---:|---|---|
| cadastro-pecas.html | 508753 B | `76ea8a7ab604ca34f0e86e7f242c5107cd03bab407e1a7293d240fd7680622fe` | Fonte auditada |
| Cadastro de Pecas - abrir no Chrome.html | 512973 B | `ab4757e9f244217360a3031113a981d7a8b0bb336eb9cca2967386a44a3d6ebb` | Distribuição local, wrapper HTML |
| demo-netlify/index.html | 411037 B | `1cafe549d41d2181efe4eec77535471545a7d306b16f328169a67b51e3114308` | Distribuição limitada/minificada |
| tools/demo.py | 5543 B | `4b8fe039a3f4541f5e2300658d573b87d7ea93ed32ef620d8d17d21aea965eba` | Gerador da demo |

O primeiro inventário reportou outro tamanho do principal (512728 B), antes da captura por hash. A causa não foi determinada; não se presume snapshot imutável durante toda a inspeção. As referências de funções e linhas foram conferidas na captura posterior. Futuras mudanças devem revalidar o hash, sem descartar trabalho preexistente.

### Revalidação no fechamento

Os arquivos de aplicação mudaram novamente durante a elaboração documental, sem escrita desta auditoria nesses arquivos. Captura final observada: principal 511459 B, SHA-256 `409419188f662568374b270b974ccac44d76f6b368c2fd9d8dbaf8a2d3f5440e`; Chrome 511704 B, SHA-256 `68727fbe5e039d077ca07ba258b09588db2fdfad002baf606b3f0b497471bc6d`. Demo e gerador mantiveram os hashes da tabela. Não foi determinada a origem da alteração concorrente.

As referências numéricas dos documentos pertencem à captura auditada da tabela, não devem ser interpretadas como linhas imutáveis da versão final. Nomes das funções são as âncoras para relocalização. Rechecagem final confirmou que os caminhos prioritários permanecem: SheetJS em 1108; IDs sem escape em 1716/1773/1976; `checarLanc` em 2660 com validação apenas de string em 2662; PDF.js vulnerável em 2901; substituição remota em 1649–1650; `fotoNaPeca` ignorando retorno em 3424. Backup/restore passaram a iniciar em 2620/2713, e wrapper de romCriar em 3211. A versão final não recebeu uma segunda auditoria integral: alterações concorrentes fora desses pontos continuam NÃO VERIFICADAS.

Principal: 4216 linhas na contagem por quebra de linha, 305 declarações `function nome`, 49 ocorrências `.innerHTML`. Contagens lexicais não medem complexidade ciclomática. Nenhuma duplicidade de nomes foi encontrada por essa busca; há sobrescrita explícita de `romCriar` em 3201–3203. Código morto não foi comprovado: eventos delegados e callbacks impedem inferência segura por ausência de chamadas textuais.

## Stack e execução

- HTML/CSS e JavaScript moderno (`const`, `let`, async/await, Map, Set, spread), em IIFE strict, 1107–1108. Não é ES5; a maioria das funções não é global de `window`, mas compartilha o mesmo fechamento.
- Estado principal `S`, derivados `G`, configurações, formulário, ROM/NF, seleções e histórico são lidos por funções de domínio, renderização e persistência.
- Globais externos: `XLSX`, `pdfjsLib`, `window.claude`; exposições `window.__nf` (3218) e `window.__modais` (4181).
- SheetJS 0.18.5 por CDN (1105); PDF.js 3.11.174 carregado sob demanda (2891–2897); Google Fonts (4–5).
- localStorage: `cadpecas4`, fallback `cadpecas3`, preferências, índices, rascunhos, autor, chave imgbb e índice NF. IndexedDB `cadpecas-big`, versão 2, stores `fotos`, `roms`, `tabs` (2583).
- Integração opcional `window.claude.use("db")` (1643), documentos `dados/config`, `dados/lancamentos`, `dados/romaneio`. Protocolo, isolamento, autenticação e custos internos NÃO VERIFICADOS. A API parecida com documentos não permite identificar o banco subjacente.
- Upload externo para imgbb (2965/2982); download pelo provedor ou fallback navegador (3572).
- Desenvolvimento documentado: editar HTML, abrir versão Chrome. Produção documentada: gerar demo e arrastar pasta no Netlify Drop. Publicação efetiva, domínio, logs e headers servidos NÃO VERIFICADOS.
- Gerador usa substituições literais com assertions e `npx --yes terser` sem versão fixa (`tools/demo.py`, bloco de minificação). Não foi executado, evitando download/publicação e alteração de artefatos.

## Matriz de módulos

Todas as linhas abaixo se referem a `cadastro-pecas.html`, salvo indicação. Complexidade/risco são avaliações de engenharia, não métricas executadas.

| Módulo | Localização / funções | Dependências | Complexidade / risco | Migração |
|---|---|---|---|---|
| Catálogo e referências | 1204–1353; `gerar`, `prefDe`, `fnum` | S.config, lançamentos, banhos, grades | Alta / alta | Extrair regras com configuração explícita; manter ordem e zeros |
| Cálculo/células | 1355–1480; `calcBanho`, `celulas`, `valorCol` | Modelo A–AE, fórmulas, overrides | Alta / alta | Caracterizar arredondamento; adaptador decimal |
| Editor e tabela | 1655–~2200; `renderTopo`, `janelaHtml`; 3456–3568 | G, DOM, filtros, histórico | Alta / alta | Substituir gradualmente por React, preservar virtualização e teclado |
| Cadastros e configurações | 1536–1605; 3288–3400 | fornecedores, categorias, banhistas, modelos | Média / alta | Schemas versionados e referências estáveis |
| Romaneios | 2726–3018, parsers anteriores | configuração, PDF, geração, fotos, IndexedDB | Alta / alta | Parser puro + caso de uso transacional; preservar revisão |
| Nota fiscal | 3020–3218; `nfLerXml`, `nfPdfParse`, `nfConfirmar` | ROM, fornecedor, custos | Alta / alta | Separar parser, conferência e confirmação; remover wrapper implícito |
| Fotos | 2898–3002; 3403–3436 | PDF, canvas, IndexedDB, imgbb | Alta / alta | Storage privado e publicação opcional explícita |
| Tabelas/relatórios | 2520–2609; 3243–3287 | cópias de peças, referências e fotos | Média / alta | Snapshots versionados, autoria autenticada |
| Exportação | 1111–1121; 3570–3679 | gerador, modelo, XLSX, download/clipboard | Alta / alta | Adaptadores Bling/Jueri; fixtures por formato |
| Backup/restore | 2610–2725; 3681–3690 | todos os armazenamentos | Alta / crítica | Manifesto, validação, staging e recuperação testada |
| Persistência/sync | 1480–1652; 2583–2585; 2732–2735; 4199–4209 | DOM de status, dados remotos, state | Alta / crítica | Repositórios, revisões e confirmações de durabilidade |
| Distribuição | tools/demo.py; demo-netlify/_headers | substrings do HTML, npx, Netlify | Média / alta | Build fixado, artefatos com hash e teste de headers |

## Fluxos e acoplamentos

1. Formulário → `adicionar` → `S.lanc` → `gerar` → tabela/preview → exportação → atualização de sequências. Reordenar peças pode alterar referências derivadas; não persistir um novo SKU arbitrariamente sem comparação.
2. Arquivo PDF/XML/texto → parser → revisão ROM/NF → criação de peças → fotos/histórico/índices → salvamento. `romCriar` é envolvida posteriormente para anexar metadados de NF: dependência de ordem de avaliação confirmada.
3. `salvar` registra snapshots e agenda 600 ms → `flush` grava documentos remotos, depois localStorage → miniaturas em IndexedDB. Não existe transação única entre os meios.
4. Inicialização lê local, renderiza e permite edição, aguarda provedor, então substitui configuração/lançamentos remotos. Reconciliação por revisão não aparece nesse caminho.
5. Exportação possui 31 colunas internas, modelo Bling com 59 posições, agrupamento/lotes e saída XLSX/CSV/cópia. O comentário sobre validação no Bling não é prova de compatibilidade atual do fornecedor.

Gargalos: fechamento compartilhado, identificadores por letras, geração dependente de estado/configuração, renderização junto à mutação, armazenamento distribuído em três meios e distribuição baseada em edição textual. Busca `indexOf` por grupo em `gerar` e `find` por linha em `tabSalvar` tornam percursos potencialmente quadráticos.

## Fora do escopo implementado

CRM, oportunidades, contratos, contas a pagar/receber, caixa, conciliação, DRE, ordem de produção, agenda e pós-venda: NÃO VERIFICADOS como funcionalidades existentes; não encontrados fluxos correspondentes neste app. Colunas de estoque e preço não constituem movimentação de estoque nem razão financeiro. NF importada não implica emissão fiscal, validação de autenticidade ou contabilização.
