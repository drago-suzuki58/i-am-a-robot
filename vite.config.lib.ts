import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Set the output directory for the library build
    outDir: "dist-pkg",
    lib: {
      entry: "src/index.ts",
      name: "IAmARobot",
      fileName: (format) => `i-am-a-robot.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {},
  },
});
