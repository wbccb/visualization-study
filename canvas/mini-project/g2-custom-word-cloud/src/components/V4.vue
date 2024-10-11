<template>
  <div id="container"></div>
</template>

<script>
import DataSet from '@antv/data-set';
import {Chart, registerShape, Util} from '@antv/g2';
import json from "../mock/data.js";

export default {
  name: "V4",
  mounted() {

    function getTextAttrs(cfg) {
      return {
        ...cfg.defaultStyle,
        ...cfg.style,
        fontSize: cfg.data.size,
        text: cfg.data.text,
        textAlign: 'center',
        fontFamily: cfg.data.font,
        fill: cfg.color || cfg.defaultStyle.stroke,
        textBaseline: 'bottom'
      };
    }

    const hexToRgba = (bgColor, alpha) => {
      let color = bgColor.slice(1);   // 去掉'#'号
      let rgba = [
        parseInt(color.slice(0, 2), 16),
        parseInt(color.slice(2, 4), 16),
        parseInt(color.slice(4, 6), 16),
        alpha
      ];
      return `rgba(${rgba.join()})`
    };

    // 给point注册一个词云的shape
    registerShape('point', 'cloud', {
      draw(cfg, container) {
        // 绘制文本
        const attrs = getTextAttrs(cfg);
        const textShape = container.addShape('text', {
          attrs: {
            ...attrs,
            x: cfg.x,
            y: cfg.y
          }
        });

        // 绘制多边形
        const textBBox = textShape.getCanvasBBox();
        let {minX, minY, maxX, maxY} = textBBox;
        minY = minY - 15;
        maxY = maxY + 10;
        minX = minX - 15;
        maxX = maxX + 12;
        function roundedRectPath(minX, minY, maxX, maxY, radius) {
          return [
            ['M', minX, minY + radius],
            ['Q', minX, minY, minX+radius, minY],
            ['L', maxX - radius, minY],
            ['Q', maxX, minY, maxX, minY+radius],
            ['L', maxX, maxY - radius],
            ['Q', maxX, maxY, maxX-radius, maxY],
            ['L', minX + radius, maxY],
            ['Q', minX, maxY, minX, maxY-radius],
            ['L', minX, minY + radius],
          ];
        }
        const radius = 10;
        const path = roundedRectPath(minX, minY, maxX, maxY, radius);
        container.addShape('path', {
          attrs: {
            path: path,
            fill: hexToRgba(cfg.color|| "#000", 0.16),
            stroke: cfg.color,
            ...cfg.style
          }
        });
        return textShape;
      }
    });
    const data = json.data;
    const dv = new DataSet.View().source(data);
    const range = dv.range('count');
    const min = range[0];
    const max = range[1];
    dv.transform({
      type: 'tag-cloud',
      fields: ['labelName', 'count'],
      size: [500, 500],
      font: 'Verdana',
      padding: 0,
      timeInterval: 5000, // max execute time
      spiral: 'archimedean',
      fontSize(d) {
        if (d.count) {
          return ((d.count - min) / (max - min)) * (80 - 24) + 24;
        }
        return 0;
      }
    });
    const chart = new Chart({
      container: 'container',
      autoFit: false,
      width: 1000,
      height: 1000,
      padding: 0
    });
    chart.data(dv.rows);
    chart.scale({
      x: {nice: false},
      y: {nice: false}
    });
    chart.legend(false);
    chart.axis(false);
    chart.tooltip({
      showTitle: false,
      showMarkers: false
    });
    chart.coordinate().reflect();
    chart.point()
        .position('x*y')
        .color('labelName')
        .shape('cloud')
        .tooltip('count*labelName');
    chart.interaction('element-active');
    chart.render();
  }
}
</script>


<style scoped>

</style>