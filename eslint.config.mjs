import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
  ...nextCoreWebVitals,
  prettierConfig,
  globalIgnores([
    ".next/**",
    ".netlify/**",
    "out/**",
    "build/**",
    "chrome-extension/popup.css",
    "next-env.d.ts",
  ]),
]);
