// Exemplo executavel (e prova de prontidao): usa so src/core em Node puro, sem navegador, para ler um backup completo e gerar as
// linhas de exportacao. E o que o servidor da Etapa 6 fara. Uso: node tools/exemplo_nucleo_node.mjs <backup.json> [--json]
import fs from "node:fs";
import { validarBackup } from "../src/core/backup.js";
import { gerar$ } from "../src/core/dominio.js";
import { saidaLinhas$ } from "../src/core/exportacao.js";

const arq = process.argv[2];
if (!arq) { console.error("uso: node tools/exemplo_nucleo_node.mjs <backup.json> [--json]"); process.exit(2); }
const n = validarBackup(JSON.parse(fs.readFileSync(arq, "utf8")));     // le tambem backups antigos e normaliza config, pecas e formulario
const S = { config: n.config, lanc: n.lanc, form: n.form };           // o "estado" que o nucleo recebe como argumento
const g = gerar$(S, S.lanc);                                           // linhas por peca (banho, peso, referencia...)
const linhas = saidaLinhas$(S, g, null);                               // linhas prontas para a planilha de exportacao
const resumo = { pecas: S.lanc.length, linhasGeradas: g.linhas.length, linhasDeSaida: linhas.length, romaneios: Object.keys(n.roms || {}).length, tabelas: Object.keys(n.tabs || {}).length };
if (process.argv.includes("--json")) console.log(JSON.stringify({ resumo, primeiraLinha: linhas[0] && linhas[0].row }, null, 2));
else console.log(`pecas: ${resumo.pecas} · linhas geradas: ${resumo.linhasGeradas} · linhas de saida: ${resumo.linhasDeSaida} · romaneios: ${resumo.romaneios} · tabelas: ${resumo.tabelas}`);
