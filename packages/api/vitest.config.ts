import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: "../../.env" });

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export -- ok
export default defineConfig({
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "e2e/**", "*.test.ts"],
    setupFiles: ["./src/tests/setup.ts"],
  },
});
