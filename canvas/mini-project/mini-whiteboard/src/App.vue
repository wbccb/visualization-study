<template>
  <div class="btn-wrapper" id="btn-wrapper">
    <!--    <div style="margin-bottom: 10px">-->
    <!--      <el-alert :title="'当前状态:' + currentStatus" type="success" />-->
    <!--    </div>-->

    <!--    <el-button @click="resetScroll">点击恢复scroll</el-button>-->
    <el-button @click="clearAll" small>全部清除</el-button>

    <template v-for="(item, index) in Status">
      <el-button
        :type="item === currentStatus ? 'danger' : 'default'"
        :disabled="item === currentStatus"
        @click="setStatus(item)"
        small
        style="margin-bottom: 5px"
      >
        {{ item === currentStatus ? "当前状态:" + item : "切换状态:" + item }}
      </el-button>
    </template>

    <el-button @click="canvasToImage" small>canvas转化为image</el-button>
    <el-button @click="restoreCanvas" small>恢复canvas透明度</el-button>
  </div>
  <div class="content" id="wrapper" ref="canvasWrapper" :style="{marginTop: marginTopRef + 'px'}">
    <canvas id="grid"></canvas>
    <canvas id="main"></canvas>
    <!--    <canvas id="test"></canvas>-->
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

    const initStatus = Status.NO;
    let main;
    let grid;

    const marginTopRef = ref(0);
    window.onresize = () => {
      const dom = document.getElementById("btn-wrapper");
      const height = dom.getBoundingClientRect().height;
      marginTopRef.value = height + 20;
    };
    function init() {
      const dom = document.getElementById("btn-wrapper");
      const height = dom.getBoundingClientRect().height;
      marginTopRef.value = height + 20;

      const gridBaseCanvas = new BaseCanvas("grid", true);
      grid = new GridController(gridBaseCanvas, {
        size: 20,
      });

      const mainBaseCanvas = new BaseCanvas("main", false);
      main = new LocationController(mainBaseCanvas, {status: initStatus});
      main.onEvent(EventType.STATUS_CHANGE, (status) => {
        setStatus(status);
      });

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

    const canvasToImage = () => {
      // 跟正常canvas绘制的区别在于：我们需要对整个画布进行裁剪，有一些很空的地方要去掉
      // 比如一个画布只有右上角有东西，那我们就应该只导出右上角那一部分

      const elements = main.getCanvasData();
      let minX = Number.MAX_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;
      let maxX = Number.MIN_SAFE_INTEGER;
      let maxY = Number.MIN_SAFE_INTEGER;
      for (const id in elements) {
        const {type, data: sourceData} = elements[id];
        if (type === "baseDrawPen") {
          for (const item of sourceData) {
            const [x, y] = item;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        } else {
          const {x, y} = sourceData;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      // TODO 如何利用BaseCanvas封装的方法呢？
      const canvas = document.createElement("canvas");
      // const canvas = document.getElementById("test");
      document.getElementById("main").style.opacity = 0;
      const ctx = canvas.getContext("2d");
      const toImageThis = {
        ctx: ctx,
        state: main.getCanvasState(),
        elements: elements,
        saveItem() {},
        drawHoverRect() {},
        drawSelectRect() {},
      };

      // +40是想要留有一点空隙
      const width = maxX - minX;
      const height = maxY - minY;
      console.error("canvasToImage", width);
      console.error("canvasToImage", height);
      // canvas.style.width = width + "px";
      // canvas.style.height = height + "px";
      // TODO 为什么要乘2次？？
      canvas.width = width * window.devicePixelRatio * window.devicePixelRatio;
      canvas.height = width * window.devicePixelRatio * window.devicePixelRatio;

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      for (const id in elements) {
        const {type, data: sourceData} = elements[id];
        const fn = main.baseCanvas[type];
        fn.call(toImageThis, id, sourceData);
      }

      const a = document.createElement("a");
      a.href = canvas.toDataURL();
      a.download = "test.png";
      a.click();
    };

    const restoreCanvas = () => {
      document.getElementById("main").style.opacity = 1;
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
      canvasToImage,
      restoreCanvas,
      marginTopRef,
    };
  },
};
</script>

<style scoped></style>
