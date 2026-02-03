import { createApp } from "vue";
import App from "./App.vue";
import CCC from "./CCC.vue";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// if you just want to import css
// import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/TokyoNightLight/css-vars.css'
import './styles/TokyoNight/css-vars.css'
createApp(App).use(ElementPlus).mount("#app");
