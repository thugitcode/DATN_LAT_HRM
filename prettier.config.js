/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type {PrettierConfig | SortImportsConfig} */
const config = {
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  endOfLine: "lf",
  semi: true,
  // singleQuote: false,
  tabWidth: 2,
  // trailingComma: "es5",
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(@tanstack/(.*)$)|^(@tanstack$)",
    "^(@mantine/(.*)$)|^(@mantine$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^types$",
    "^@/types|^@/types/(.*)$",
    "^@/styles/(.*)$",
    "^@/assets/(.*)$",
    "^@/lib/(.*)$",
    "^@/hooks/(.*)$",
    "^@/components/(.*)$",
    "^@/features/(.*)$",
    "",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
};

export default config;
