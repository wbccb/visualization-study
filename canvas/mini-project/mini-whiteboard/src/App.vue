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
    <canvas id="grid"></canvas>
    <canvas id="main"></canvas>
  </div>
  <div class="canvas_button-wrapper">
    <el-button :icon="Plus" @click="addScale"></el-button>
    <el-text style="margin: 0px 10px">比例是{{ currentScale }}</el-text>
    <el-button :icon="Minus" @click="reduceScale"></el-button>
  </div>
</template>

<script>
import {onMounted, ref} from "vue";
import GridController from "./canvas/GridController.js";
import LocationController from "./canvas/LocationController.js";
import BaseCanvas from "./canvas/base/BaseCanvas.js";
import {Status} from "./canvas/LocationController.js";
import {EventType} from "./canvas/config/config.js";
import {Plus, Minus} from "@element-plus/icons-vue";

export default {
  setup() {
    onMounted(() => {
      init();
    });

    const initStatus = Status.TEXT;
    let main;
    let grid;

    function init() {
      const gridBaseCanvas = new BaseCanvas("grid", true);
      grid = new GridController(gridBaseCanvas, {
        size: 20,
      });

      const mainBaseCanvas = new BaseCanvas("main", false);
      main = new LocationController(mainBaseCanvas, {status: initStatus});
      // main.onEvent(EventType.STATUS_CHANGE, () => {
      //   setStatus(Status.NO);
      // });

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

    const currentScale = ref(1);
    const addScale = () => {
      const newValue = parseFloat((currentScale.value + 1).toFixed(1));
      if (newValue <= 0 || newValue >= 4) {
        return;
      }
      currentScale.value = newValue;
      main.setScale(newValue);
      grid.setScale(newValue);
    };
    const reduceScale = () => {
      const newValue = parseFloat((currentScale.value - 1).toFixed(1));
      if (newValue <= 0 || newValue >= 4) {
        return;
      }
      currentScale.value = newValue;
      main.setScale(newValue);
      grid.setScale(newValue);
    };

    return {
      resetScroll,
      canvasWrapper,
      Status,
      setStatus,
      currentStatus,
      clearAll,
      currentScale,
      Plus,
      Minus,
      addScale,
      reduceScale,
    };
  },
};
</script>

<style scoped></style>
