# Cadastro de Peças — versão unificada

O arquivo principal é `Cadastro_de_Pecas_unificado.html`. Abra-o no Chrome e mantenha a pasta `lib` ao lado. A fonte única está em `src/`; para reconstruir o HTML execute `python tools/montar.py`. O comando não substitui os HTMLs anteriores.

Para gerar um pacote local de publicação execute `python tools/publicar.py`. O resultado fica em `publicar-netlify-unificado/`; para conferir seus arquivos execute `python tools/verificar_pacote.py`. Gerar o pacote não publica o site. O JavaScript está dividido por responsabilidade em `src/js`; o CSS está em `src/css/01-estilos.css` e o PDF embutido fica no corpo em `src/html/02-corpo-e-bibliotecas.html`.

A versão anterior do código-fonte e dos montadores foi copiada para `auditoria-ui-temporario/antes-unificacao/`. Os arquivos HTML anteriores e os pacotes antigos permanecem no projeto; use o HTML unificado para novos testes. A pasta `revisao-organizada` é um retrato histórico da revisão e não é atualizada automaticamente.

As sugestões ordenadas por uso consideram a tabela atual e as tabelas salvas, contando cada peça uma vez. O histórico é carregado em segundo plano e recalculado ao salvar, excluir ou restaurar tabelas. Para usar atalhos numéricos, foque na categoria, descrição, opção de cor ou banho e pressione Alt+Shift+1 a 9. A categoria inferida pela descrição é apenas sugerida quando já existe uma categoria selecionada.

Antes de trocar a versão de uso diário, baixe e confira um backup completo, valide a restauração com seus dados, e confira as exportações no Jueri e no Bling. Dados em outro navegador, perfil ou site podem não ser compartilhados. Para executar a suíte em uma cópia temporária, use `python tests/run_all.py`; opcionalmente defina `CP_BACKUP` para os testes que exigem backup real.
