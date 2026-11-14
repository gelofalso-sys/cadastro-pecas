import globals from "globals";
// O app é um único <script> montado a partir de src/js; por isso a análise roda sobre o bloco
// montado (tools/lint.mjs), não arquivo a arquivo. Regras mínimas, só apontam.
export default [{
  files: ["**/*.js"],
  languageOptions: { ecmaVersion: 2023, sourceType: "script",
    globals: { ...globals.browser, XLSX: "readonly", pdfjsLib: "readonly" } },
  rules: { "no-undef": "warn", "no-unused-vars": ["warn", { args: "none" }], "no-shadow": ["warn", { allow: ["S"] }] }
}];
