<template>
  <div class="btn-wrapper">
    <div style="margin-bottom: 10px">
      <el-alert :title="'当前状态:' + currentStatus" type="success" />
    </div>

    <!--    <el-button @click="resetScroll">点击恢复scroll</el-button>-->
    <el-button @click="clearAll">全部清除</el-button>

    <template v-for="(item, index) in Status">
      <el-button
        :type="item === currentStatus ? 'danger' : 'default'"
        :disabled="item === currentStatus"
        @click="setStatus(item)"
      >
        {{ item === currentStatus ? "当前状态:" + item : "切换状态:" + item }}
      </el-button>
    </template>
  </div>
  <div class="content" id="wrapper" ref="canvasWrapper">
    <canvas id="canvas"></canvas>
    <canvas id="main"></canvas>
  </div>
</template>

<script>
import {onMounted, ref} from "vue";
import GridController from "./canvas/GridController.js";
import LocationController from "./canvas/LocationController.js";
import BaseCanvas from "./canvas/base/BaseCanvas.js";
import {Status} from "./canvas/LocationController.js";

export default {
  setup() {
    onMounted(() => {
      init();
    });

    const initStatus = Status.TEXT;
    let main;
    function init() {
      const gridBaseCanvas = new BaseCanvas("canvas", true);
      const grid = new GridController(gridBaseCanvas, {
        size: 20,
      });

      const mainBaseCanvas = new BaseCanvas("main");
      main = new LocationController(mainBaseCanvas, {status: initStatus});

      const domWrapper = document.getElementById("wrapper");
      // domWrapper.addEventListener("pointermove", (event) => {
      //   const {del} = event;
      //   console.error("pointerMove", event);
      // });
      // domWrapper.addEventListener("pointerup", (event) => {
      //   console.error("pointerup", event);
      // });
    }

    const canvasWrapper = ref();
    const resetScroll = () => {};
    const clearAll = () => {
      main.clearAll();
    };

    const currentStatus = ref(initStatus);
    const setStatus = (status) => {
      main.changeStatus(status);
      currentStatus.value = status;
    };

    return {
      resetScroll,
      canvasWrapper,
      Status,
      setStatus,
      currentStatus,
      clearAll,
    };
  },
};
</script>

<style scoped></style>
