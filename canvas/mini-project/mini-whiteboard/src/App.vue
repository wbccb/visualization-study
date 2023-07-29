<template>
  <div class="content">
    <canvas id="canvas"></canvas>
    <canvas id="main"></canvas>
  </div>

</template>

<script>
import {onMounted} from "vue";
import Grid from "./canvas/Grid.js";
import BaseCanvas from "./canvas/base/BaseCanvas.js";

export default {
  setup() {

    onMounted(() => {
      init();
    });

    function init() {
      const gridBaseCanvas = new BaseCanvas( "canvas");
      const grid = new Grid(gridBaseCanvas, {
        size: 20
      });

      const mainBaseCanvas = new BaseCanvas("main");
      const main = new Main(mainBaseCanvas)
    }

    return {};
  }
}
</script>


<style scoped>
</style>
