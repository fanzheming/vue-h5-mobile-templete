import axios from 'axios' // 引入axios
import store from '../store'
// import QS from 'qs' // !!!如果请求类型是application/x-www-form-urlencoded，需要引入qs模块，用来序列化post类型的数据
// vant toast提示框
import { Toast } from 'vant'
// vant dialog弹出框
import { Dialog } from 'vant'

/**
 * 轻提示
 * @param {String} 提示文字
 */
const toastTip = msg => {
  Toast({
    message: msg,
    duration: 1000, // 显示一秒后关闭
    forbidClick: true //蒙层 禁止点击
  })
}

/**
 * 弹窗
 * @param {String} status 提示文字
 * @param {Function} onClose 关闭后的回调
 */
const dialogTip = (msg, onClose) => {
  Dialog.alert({
    message: msg
  }).then(() => {
    onClose()
  })
}

let pending = [] //声明一个数组用于存储每个网络请求的标识和对应的取消请求函数

/**
 * 取得请求对象｛标识，取消请求函数｝，推入数组中
 * @param {Object} config 请求拦截器的配置
 */
function getRequestIdentification(config) {
  return new axios.CancelToken(cancel => {
    // 这里的标识我是用请求地址&请求方式拼接的字符串
    pending.push({ identification: `${config.url}&${config.method}`, cancel })
  })
}

/**
 * 匹配到对应的请求标识则执行取消请求操作，移除数组中对应的请求对象
 * @param {Object} config 请求拦截器的配置
 */
function removePending(config) {
  pending.forEach((item, index, array) => {
    if (item.identification === `${config.url}&${config.method}`) {
      item.cancel() //执行取消请求操作
      array.splice(index, 1) //把这条记录从数组中移除
    }
  })
}

// 调用接口前缀
let baseURL = ''
if (process.env.NODE_ENV == 'development') {
  baseURL = '/api'
} else if (process.env.NODE_ENV == 'production') {
  baseURL = '/api'
}

// axios实例的基本配置参数
let instanceConfig = {
  timeout: 1000 * 6, //超时时间
  baseURL
}

// 创建axios实例
export const instance = axios.create(instanceConfig)

// 实例的请求拦截器
instance.interceptors.request.use(
  config => {
    // 打开loading
    store.commit('TOGGLE_IS_LOADING', true)
    //在一个请求发送前先执行一下取消函数去判断是否重复请求
    removePending(config)
    config.cancelToken = getRequestIdentification(config)
    // 有token就添加认证请求头
    const token = sessionStorage.getItem('token')
    token && (config.headers.Authorization = token)
    return config
  },
  error => {
    return Promise.error(error)
  }
)

// 跳转登录页
const go2Login = () => {
  // 如有token先清除
  sessionStorage.getItem('token') && sessionStorage.removeItem('token')
  sessionStorage.getItem('tokenExpired') &&
    sessionStorage.removeItem('tokenExpired')
  router.replace({
    path: '/login',
    query: {
      redirect: router.currentRoute.fullPath //携带当前页面路由，以便登录后返回当前页面
    }
  })
}

/**
 * 请求失败后的错误统一处理
 * 可以跟你们的后台开发人员协商好统一的错误状态码
 * 然后根据返回的状态码进行一些操作，例如登录过期提示，错误提示等等
 * 下面列举几个常见的操作，其他需求可自行扩展
 * @param {Number} status 请求失败的状态码
 * @param {String} msg 请求失败的消息
 */
const errorHandle = (status, msg) => {
  //  判断请求超时
  // if (
  //   error.code === 'ECONNABORTED' &&
  //   error.message.indexOf('timeout') !== -1
  // ) {
  //   toastTip('请求超时，请稍后再试')
  // }
  // 状态码判断
  switch (status) {
    // 401：未授权，请登录
    case 401:
      dialogTip('未授权，请登录', go2Login)
      break
    // 403：拒绝访问(一般是token过期）
    case 403:
      dialogTip('登录过期，请重新登录', go2Login)
      break
    // 404 请求不存在
    case 404:
      toastTip('请求的资源不存在')
      break
    // 408 请求超时
    case 408:
      toastTip('请求超时，请稍后再试')
      break
    case 500:
      toastTip('服务器内部错误')
      break
    case 501:
      toastTip('服务未实现')
      break
    case 502:
      toastTip('网关错误')
      break
    case 503:
      toastTip('服务不可用')
      break
    case 504:
      toastTip('网关超时')
      break
    case 505:
      toastTip('HTTP版本不受支持')
      break
    default:
      toastTip(msg)
  }
}

//  实例响应拦截器
instance.interceptors.response.use(
  // 请求成功
  res => {
    // 打开loading
    store.commit('TOGGLE_IS_LOADING', false)
    return res.data
  },
  // 服务器状态码不是2xx
  error => {
    // 关闭loading
    store.commit('TOGGLE_IS_LOADING', false)
    const { response, config } = error
    //在一个响应后先执行一下取消函数，把已经完成的请求从pending数组中移除
    removePending(config)
    if (response) {
      errorHandle(response.status, response.data.message)
      return Promise.reject(response)
    } else {
      // 处理断网的情况
      if (!window.navigator.onLine) {
        toastTip('网络连接断开')
      } else {
        return Promise.reject(error)
      }
    }
  }
)

// ! 下面get post请求用Promise再次封装主要为了以后如果换网络请求的第三方库也不用改业务的代码，只需在这里修改

/**
 * get方法，对应get请求
 * @param {String} url 请求的url地址
 * @param {Object} params 请求时携带的参数
 */
function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    instance
      .get(url, {
        params: params
      })
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * post方法，对应post请求
 * @param {String} url 请求的url地址
 * @param {Object} data 请求时携带的参数
 */
function post(url, data = {}) {
  return new Promise((resolve, reject) => {
    instance
      .post(url, data)
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
  //axios.post(url, QS.stringify(data)) // 如果是application/x-www-form-urlencoded
}

export { get, post, pending }
