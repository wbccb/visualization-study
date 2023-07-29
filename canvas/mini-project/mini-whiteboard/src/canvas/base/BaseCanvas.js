/**
 * 封装通用方法，在这个类中进行canvas的初始化，然后将canvas传入到管理类中
 * 宽度和高度由domId的css对应的width和height控制
 */
class BaseCanvas {

    constructor(domId) {
        // 外部传入的canvas，为了所有元素都绘制在同一个canvas上面
        const canvasDom = document.getElementById(domId);
        if (!canvasDom) {
            console.error("document.getElmentById为空");
            return;
        }
        const ctx = canvasDom.getContext("2d");

        const {offsetWidth, offsetHeight} = canvasDom;
        const devicePixelRatio = window.devicePixelRatio;
        canvasDom.width = offsetWidth * devicePixelRatio;
        canvasDom.height = offsetHeight * devicePixelRatio;
        console.warn("目前得到的offsetWidth和offsetHeight", offsetWidth, offsetHeight);
        // 如果<canvasDom>的宽度和高度是800px，那么乘以devicePixelRatio=2就会变成1600px
        // <canvasDom width=1600 height=1600>，那么整体会缩小0.5倍，为了适应800px的CSS限制
        // 因此我们再手动放大2倍，就能得到之前一样的大小！
        // 那为什么要这样放大2倍呢？因为1600px压缩成800px后，2px就会等于1pt
        // 手动放大2倍也是2px-1pt，会让图像更加清晰可见
        ctx.scale(devicePixelRatio, devicePixelRatio);


        this.canvasDom = canvasDom;
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        // 将画布中心移动到canvas的中心为止
        // 显示原点坐标
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.arc(
            offsetWidth/2, offsetHeight/2,
            2,
            0, 2*Math.PI,
            true
        );
        ctx.fillText("原点", offsetWidth/2+5, offsetHeight/2+5);
        ctx.stroke();
    }


    renderCanvas() {

    }

    getContext() {
        return this.ctx;
    }

    /**
     * 清除画布
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

export default BaseCanvas;