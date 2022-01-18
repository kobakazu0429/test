import path from "path";
import { defineConfig } from "vite";

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(path.join(__dirname, "src", "index.ts")),
      name: "Test",
      fileName: (format) => `index.${format}.js`,
    },
  },
});
