import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import TreeTable from 'vue-table-with-tree-grid'
// 导入全局样式
import './assets/css/global.css'
// 导入elementui, Message, MessageBox
import ElementUI, { Message, MessageBox } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 全局挂载 VueQuillEditor
import VueQuillEditor from 'vue-quill-editor'
// 导入NProgress和它的样式表
import NProgress from 'nprogress'

Vue.config.productionTip = false
// 使用elementui
Vue.use(ElementUI)
// 使用table树形结构
Vue.component('tree-table', TreeTable)
// 配置请求和根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截，并在拦截其中展示进度条
axios.interceptors.request.use(config => {
  // 展示进度条
  NProgress.start()
  // 验证headers.Authorization是否有token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return config
  return config
})
// 在response拦截器中隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

// 定义时间处理函数
Vue.filter('dateFormat', function(originVal) {
  const date = new Date(originVal)
  const y = date.getFullYear()
  // 返回的0代表1月，因此要+1；将数字转为字符串需要+''；padStart可以组成长度为2的字符串，不足2位，用0替换第一位
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDate() + '').padStart(2, '0')
  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.use(VueQuillEditor)

Vue.prototype.$http = axios
// 配置全局弹框提示
Vue.prototype.$message = Message
// 挂载确认消息框
Vue.prototype.$confirm = MessageBox.confirm

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
