// prettier.config.js, .prettierrc.js, prettier.config.cjs, or .prettierrc.cjs

/** @type {import("prettier").Options} */
const config = {
  trailingComma: "es5",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  printWidth: 80,
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: "always",
  singleAttributePerLine: false,
  htmlWhitespaceSensitivity: "css",
};

module.exports = config;
