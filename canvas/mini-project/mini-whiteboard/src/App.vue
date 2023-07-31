<template>
  <div class="btn-wrapper">
    <el-button @click="resetScroll">点击恢复scroll</el-button>
  </div>
  <div class="content" id="wrapper" ref="canvasWrapper">
    <canvas id="canvas"></canvas>
    <canvas id="main"></canvas>
  </div>
</template>

<script>
import {onMounted, ref} from "vue";
import Grid from "./canvas/Grid.js";
import Main from "./canvas/Main.js";
import BaseCanvas from "./canvas/base/BaseCanvas.js";

export default {
  setup() {
    onMounted(() => {
      init();
    });

    function init() {
      const gridBaseCanvas = new BaseCanvas("canvas");
      const grid = new Grid(gridBaseCanvas, {
        size: 20,
      });

      const mainBaseCanvas = new BaseCanvas("main");
      const main = new Main(mainBaseCanvas);

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

    return {
      resetScroll,
      canvasWrapper,
    };
  },
};
</script>

<style scoped></style>
