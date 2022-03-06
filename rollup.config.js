import typescript from "@rollup/plugin-typescript";
import packageJson from "./package.json";

export default {
  input: "src/index.ts",
  output: {
    file: packageJson.main,
    format: "cjs",
  },
  plugins: [typescript()],
};
