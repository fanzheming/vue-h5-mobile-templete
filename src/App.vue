<template>
  <div id="app">
    <transition :name="transitionName">
      <router-view class="Router" v-if="isRouterShow"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
	name: 'App',
	data() {
		return {
      transitionName: 'slide-left',
			isRouterShow: true
		}
	},
	methods: {
		// 重新加载
		async reload() {
			this.isRouterShow = false
			await this.$nextTick()
			this.isRouterShow = true
		}
	}
}
</script>

<style scoped>
.Router {
    position: absolute;
    width: 100%;
    transition: all 0.8s ease;
  }

  .slide-left-enter,.slide-right-leave-active{
    opacity: 0;
    transform: translate(100%,0);
  }

  .slide-left-leave-active,.slide-right-enter{
    opacity: 0;
    transform: translate(-100%,0);
  }
  
</style>
