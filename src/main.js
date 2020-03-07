import Vue from 'vue'
import App from './App'
// 路由
import router from './router'
// 状态存储
import store from './store'
// api接口
import api from './request/api'
// cookie
import VueCookies from 'vue-cookies'
Vue.use(VueCookies)
// fastclick  处理移动端click事件300毫秒延迟
import FastClick from 'fastclick'
FastClick.attach(document.body)
// 移动端适配  根据屏幕宽度自动改变font-size  配合postcss-pxtorem转换px到rem
import 'amfe-flexible'
// css样式初始化
import 'normalize.css/normalize.css'
// 引入模拟数据
import './mock/'
// 全局引入单个vant组件
import { Toast, Dialog, Overlay } from 'vant'
Vue.use(Toast).use(Dialog).use(Overlay)
// 不显示生产提示
Vue.config.productionTip = false
// 设置cookie过期时间为会话关闭失效
Vue.prototype.$cookies.config('0')
/**
 * 将api接口挂载到vue的原型上
 * 在vue组件中使用：this.$api.module1.getSample(obj)
 */
Vue.prototype.$api = api

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
