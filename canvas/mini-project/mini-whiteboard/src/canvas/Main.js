import BaseCanvas from "./base/BaseCanvas.js";

/**
 * 将BaseCanvas对象传入，使用BaseCanvas.xxx提供的通用方法进行业务开发
 */
class Main {
    constructor(baseCanvas, options) {
        this.baseCanvas = baseCanvas;

        this.width = baseCanvas.width;
        this.height = baseCanvas.height;

        const ctx = this.baseCanvas.getContext();
        ctx.lineWidth = options.strokeStyle ? options.strokeStyle : 1
        ctx.strokeStyle = options.strokeStyle ? options.strokeStyle : "#dfe0e1";
        ctx.fillStyle = options.fillStyle ? options.fillStyle : "#dfe0e1";
    }
}

export default Main;