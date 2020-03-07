/**
 * 模块1接口（实际开发中对应一个业务需求）
 */
import { get, post } from '../http'

// get请求
const getSample = obj => get('/xxx/xxx', obj)

// post请求
const postSample = obj => post('/xxx/xxx', obj)

export default {
  getSample,
  postSample
}
