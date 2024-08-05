<template>
  <div>
    <div id="containerRoot" style="width: 50%; height: 100%"></div>

    <div style="width: 50%; height: 100%">
      <V4></V4>
    </div>
  </div>

</template>

<script>
import V4 from "./components/V4.vue";

export default {
  components: {V4},
  beforeCreate() {
    // 定义图形组件
  },
  mounted() {
  }
}
</script>


<style scoped>

</style>
