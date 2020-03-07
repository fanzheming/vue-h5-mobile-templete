<template>
    <div style="background:orange;">
        <p>首页</p>
	    <router-link to="/test">去测试页</router-link>
    </div>
</template>
<script>
export default {
	name: 'test'
}
</script>

<style scoped>
p{
    margin:0;
    padding:0;
}
</style>