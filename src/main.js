import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'

import fastclick from 'fastclick'
fastclick.attach(document.body)

import VueLazyload from 'vue-lazyload'  // 请求首屏图片，滚动才加载其他图片
Vue.use(VueLazyload,{
  loading: require('@/common/image/default.png'),
})

import './common/stylus/index.styl'
import router from './router'
import store from './store'
Vue.config.productionTip = false
import initializeApi from './api'
initializeApi(Vue)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
