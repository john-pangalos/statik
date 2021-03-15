import sucrase from "@rollup/plugin-sucrase";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/bundle.js",
    format: "cjs",
    banner: "#!/usr/bin/env node",
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    json(),
    resolve({
      extensions: [".js", ".ts"],
      moduleDirectories: ["node_modules", "src"],
    }),
    sucrase({
      exclude: ["node_modules/**"],
      transforms: ["typescript"],
    }),
  ],
};
