// Código-fonte do núcleo (src/core) sem import/export, igual ao que o navegador recebe no bloco montado.
// Serve aos testes que ainda recortam trechos do código e os rodam em `vm`; o ideal é importar o módulo (ver tests/unit).
// core('romaneio') devolve o texto do módulo pedido, precedido dos módulos de que ele depende (como faria o ESM).
const fs = require('node:fs'), path = require('node:path');
const tirar = t => t.replace(/^import\s[^;\n]*?from\s+["'][^"']+["'];?[ \t]*$/gm, '').replace(/^export\s+(?=(?:async\s+function|function|const|let|var|class)\b)/gm, '');
const ler = nome => fs.readFileSync(path.join(__dirname, '..', 'src', 'core', nome + '.js'), 'utf8');
exports.core = (...nomes) => {
  const vistos = new Set(), saida = [];
  const visita = nome => {
    if (vistos.has(nome)) return; vistos.add(nome);
    const t = ler(nome);
    for (const m of t.matchAll(/^import\s[^;\n]*?from\s+["']\.\/([^"']+)\.js["']/gm)) visita(m[1]);
    saida.push(tirar(t));
  };
  nomes.forEach(visita);
  return saida.join('\n');
};
// Todo o núcleo (na ordem do montador) mais os adaptadores f(...) -> f$(S, ...): o app inteiro de funções puras e dependentes só de S.
// O teste fornece `S` no contexto do vm (ex.: { config, lanc }).
exports.tudo = () => {
  const ordem = fs.readFileSync(path.join(__dirname, '..', 'src', '_ordem.txt'), 'utf8').split(/\r?\n/).filter(n => n.startsWith('core/')).map(n => n.slice(5).replace(/\.js$/, ''));
  return exports.core(...ordem) + '\n' + fs.readFileSync(path.join(__dirname, '..', 'src', 'js', '00-adaptadores-nucleo.js'), 'utf8');
};
