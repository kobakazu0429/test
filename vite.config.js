const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(path.join(__dirname, "src", "index.ts")),
      name: "Test",
      fileName: (format) => `index.${format}.js`,
    },
  },
});
