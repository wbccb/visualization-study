import BaseCanvas from "./base/BaseCanvas.js";

/**
 * 将BaseCanvas对象传入，使用BaseCanvas.xxx提供的通用方法进行业务开发
 */
class Grid {
    constructor(baseCanvas, options) {
        this.baseCanvas = baseCanvas;
        this.options = options; // 包含网格的格子大小
        this.size = options.size;

        this.width = baseCanvas.width;
        this.height = baseCanvas.height;

        const ctx = this.baseCanvas.getContext();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#dfe0e1";

        this.renderHorizontal();
        this.renderVertical();
    }


    renderHorizontal() {
        const w = this.width;
        const h = this.height;
        const ctx = this.baseCanvas.getContext();
        const gridSize = this.size;
        for (let j = -h / 2; j <= h / 2; j = j + gridSize) {
            ctx.beginPath();
            ctx.moveTo(-w / 2, j);
            ctx.lineTo(w / 2, j);
            ctx.closePath();
            ctx.stroke();
        }
    }

    renderVertical() {
        const w = this.width;
        const h = this.height;
        const ctx = this.baseCanvas.getContext();
        const gridSize = this.size;
        for (let i = -w / 2; i <= w / 2; i = i + gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, -h / 2);
            ctx.lineTo(i, h / 2);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

export default Grid;