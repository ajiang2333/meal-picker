import { defineConfig } from "vite";
import uniPlugin from "@dcloudio/vite-plugin-uni";

const uni = ((uniPlugin as any).default || uniPlugin) as typeof uniPlugin;

export default defineConfig({
  plugins: [uni()],
  server: {
    host: "127.0.0.1",
    port: 5175
  }
});
