# Roteiro de demonstração — romaneio GC-10208 (Link 243 · Antonios Brutos)

Números do PDF, conferidos de forma independente (extração do texto do PDF, fora do app):
**34 peças · 86 unidades · R$ 544,27** (5 categorias na lista: Brinco 13, Colar 2, Choker 7, Pulseira 7, Conjunto 5).
Os 2 itens de "Produtos não separados" (Choker, crédito) ficam de fora, como deve ser.

## Antes de começar
1. Abra `cadastro-pecas.html` num navegador limpo (ou limpe os dados do site) para não misturar com peças reais.
2. Cadastros › Galvânicas e banhos: fator **2,5** nos dois banhos (Ouro e Prata). **Salvar alterações**.
3. Cadastros › Fornecedores: **+ Fornecedor** → "Brutos da Carlinha", tipo Bruta. **Salvar alterações**.

## Passo a passo (valores já testados)
| Passo | O que fazer | O que aparece (confirmado) |
|---|---|---|
| 1 | Importar romaneio → escolher o PDF → Abrir | "34 peças lidas · 34 fotos"; **Lista: ✓ 86 peças conferem · ✓ valor R$ 544,27 confere**. Choker entra como Colares › Chokers |
| 2 | Fornecedor = Brutos da Carlinha | — |
| 3 | Edição em lote → Selecionar "Categoria Brincos" → Peso 1,8 → Aplicar. Repita: Colares 4,5 · Pulseiras 3,2 · Conjuntos 4 | "Aplicado a 13 / 9 / 7 / 5 peça(s)" |
| 4 | Conjuntos: fator 3 (Ouro e Prata) no mesmo lote | só os 5 conjuntos usam ×3; o resto usa ×2,5 |
| 5 | ÷ Dividir todas igualmente | todas as divisões fecham com a lista; faixa: **68 linhas · Custo total R$ 1.101,99 · Varejo R$ 2.863,83** |
| 6 | Desmarque as peças de 15 em diante e **Criar peças** | Revisão: 14 peças · 28 linhas · 34 unidades · Custo R$ 360,63 |
| 7 | Cadastros: renomeie uma categoria, mude R$/g do ouro | peças já lançadas acompanham (custos recalculam; varejo digitado não muda) |
| 8 | Romaneios salvos → abrir → filtro **Ignoradas** → marcar as 20 → Criar | Revisão: 20 peças · 52 unidades · Custo R$ 805,01 (com ouro a R$ 2,00/g) |
| 9 | Conferir | **86 unidades**, soma Compra × Qtd = **R$ 544,27**, 34 códigos distintos, referências sem repetição |

## Pontos para explicar (comportamentos do app, não defeitos)
- **Preço de varejo só entra na tabela se for digitado** (decisão do projeto). A sugestão (custos × fator) aparece nos cartões e na revisão, mas a coluna Varejo da tabela fica vazia até alguém digitar. Para a demonstração, digite o varejo em algumas peças ou avise a pessoa.
- **Desmarcar uma peça = ignorar.** Para lançar depois, use o filtro "Ignoradas" e marque de novo.
- **Peça de 1 unidade** gera a linha B (prata) sem quantidade.
- Peças de **anel** (categoria com tamanhos) não entram no "Dividir todas": precisam da grade de tamanhos.
