import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './plugins/iview.js'
import './components/index.js'
import { getInitConfig } from './ipc'
import { init as initShortcut } from './shortcut'

Vue.config.productionTip = false

// 启动应用时获取初始化数据
getInitConfig()
initShortcut(store.state.appConfig)

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
