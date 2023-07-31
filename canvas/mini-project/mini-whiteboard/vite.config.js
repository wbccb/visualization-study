import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";

// element-plus组件自动import
// 参考https://element-plus.gitee.io/en-US/guide/quickstart.html#on-demand-import
function createAutoImport() {
  return [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ];
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), createAutoImport()],
});
