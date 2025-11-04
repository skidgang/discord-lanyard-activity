import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "frameworks/react": "src/frameworks/react.ts",
    "frameworks/vue": "src/frameworks/vue.ts",
    "frameworks/svelte": "src/frameworks/svelte.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "vue", "svelte"],
});
