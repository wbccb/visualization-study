<template>
  <div class="btn-wrapper">
    <div style="margin-bottom: 10px">
      <el-alert :title="'当前状态:' + currentStatus" type="success" closable="true" />
    </div>

    <el-button @click="resetScroll">点击恢复scroll</el-button>
    <el-button @click="clearAll">全部清除</el-button>

    <el-button @click="setStatus(Status.Rect)">切换为矩形绘制</el-button>
    <el-button @click="setStatus(Status.Diamond)">切换为菱形绘制</el-button>
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

    let main;
    function init() {
      const gridBaseCanvas = new BaseCanvas("canvas");
      const grid = new GridController(gridBaseCanvas, {
        size: 20,
      });

      const mainBaseCanvas = new BaseCanvas("main");
      main = new LocationController(mainBaseCanvas);

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

    const currentStatus = ref(Status.Rect);
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
