import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
import store from '../store'
import { pending } from '../request/http'

// vue-router版本3.0.7以上重复路由报错不打印
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(error => error)
}

const router = new Router({
  mode: 'history', //history模式
  routes: [
    // 缺省路径默认重定向
    {
      path: '/',
      redirect: '/index'
    },
    // 例子
    {
      path: '/index',
      name: 'Index',
      meta: { title: '首页' },
      component: () => import('@/views/Index.vue') // 路由懒加载
    },
    {
      path: '/test',
      name: 'Test',
      meta: { title: '测试' },
      component: () => import('@/views/Test.vue') // 路由懒加载
    }
  ]
})

// 免登录白名单
const whiteList = ['/index','/test']

// 全局前置路由守卫
router.beforeEach(function(to, from, next) {
  // 打开loading
  store.commit('TOGGLE_IS_LOADING', true)
  // 替换页面标题
  to.meta.title && (window.document.title = to.meta.title)
  // 路由发生变化时取消当前页面所有网络请求，并移出pending数组
  pending.forEach((item, index, array) => {
    item.cancel()  //执行取消请求操作
    array.splice(index, 1) //把这条记录从数组中移除
  })
  // 在免登录白名单，直接进入
  if (whiteList.indexOf(to.path) !== -1) {
    console.log('在免登录白名单，直接进入')
    next()
  } else {
    // 不在白名单，先判断时间戳是否过期
    const nowTimestamp = new Date().getTime()
    const tokenExpiredTimestamp = Number(sessionStorage.getItem('tokenExpired'))
    if (nowTimestamp < tokenExpiredTimestamp) {
      // 不在白名单，令牌没有过期,直接进入
      console.log('不在白名单，令牌没有过期,直接进入')
      next()
    } else {
      // 不在白名单，令牌过期
      console.log('不在白名单，令牌过期')
      //todo 重新获取授权
    }
  }
})

// 全局后置路由守卫
router.afterEach(function(to) {
  window.scroll({
    top: 0,
    left: 0
  })
  // 关闭loading
  store.commit('TOGGLE_IS_LOADING', false)
})

export default router
