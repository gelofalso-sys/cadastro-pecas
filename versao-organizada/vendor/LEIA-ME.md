# Bibliotecas de terceiros

O montador (`tools/montar.py`) embute `vendor/pdfjs/*` no HTML final. O SheetJS continua em `lib/` porque o app o carrega por caminho relativo (`lib/xlsx.full.min.js`) e o pacote do Netlify o copia dali.

| Arquivo | Biblioteca | Versão | Licença | SHA-256 |
|---|---|---|---|---|
| `vendor/pdfjs/pdf.min.js` | pdf.js (Mozilla) | 3.11.174 | Apache-2.0 | `585713997ee0c40d4733e6c5b67bc7a4c6fb220d5d41dc1c600b2549af707843` |
| `vendor/pdfjs/pdf.worker.min.js` | pdf.js worker | 3.11.174 | Apache-2.0 | `feabdf309770ed24bba31a5467836cdc8cf639c705af27d52b585b041bb8527b` |
| `lib/xlsx.full.min.js` | SheetJS Community Edition | 0.20.3 | Apache-2.0 | `cc015130aa8521e7f088f88898eba949ccdcbfb38df0bd129b44b7273c3a6f41` |

Para conferir: `certutil -hashfile <arquivo> SHA256`. Ao atualizar uma biblioteca, troque o arquivo, rode a suíte e atualize esta tabela.
