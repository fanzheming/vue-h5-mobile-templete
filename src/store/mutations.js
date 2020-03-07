import * as types from './mutation-types'
import Vue from 'vue'
// vant的toast提示框组件
import { Toast } from 'vant'
Vue.use(Toast)

const mutations = {
    [types.TOGGLE_IS_LOADING](state, payload) {
        state.isLoading = payload ? toastLoading() : toastClear()
    }
}

// 轻提示加载中
function toastLoading(){
    Toast.loading({
        message: '加载中...',
        duration: 0, // 展示时长(ms)，值为 0 时，toast 不会消失
        forbidClick: true,  //不允许点击
        transition: 'van-fade' // 过渡效果为淡入
    })
}
// 关闭加载轻提示
function toastClear(){
    Toast.clear()
}

export default mutations