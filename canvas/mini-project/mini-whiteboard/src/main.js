import {createApp} from "vue";
import "./style.css";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/es/components/message/style/css";
// import locale from "element-plus/lib/locale/lang/zh-cn.js";

const app = createApp(App);
app.use(ElementPlus, {});

app.mount("#app");
