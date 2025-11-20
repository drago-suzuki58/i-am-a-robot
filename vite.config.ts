import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "IAmARobot",
      fileName: (format) => `i-am-a-robot.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: { react: "React" },
      },
    },
  },
});
