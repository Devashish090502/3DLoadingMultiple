import nextPlugin from "eslint-config-next";

const eslintConfig = [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mjs"],
    ...nextPlugin,
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
