import {globalConfig} from "../config/config.js";

/**
 * 封装所有对Image的操作逻辑，包括
 * 1. 上传图片文件
 * 2. 解析图片文件并触发回调
 * 3. 复制黏贴图片
 * 在baseCanvas只要简单调用封装方法即可实现绘制图片功能
 */
class ImageHelper {
  constructor(baseCanvas) {
    this.baseCanvas = baseCanvas;
  }

  selectImage(cancelCallBack) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.opacity = 0;
    input.addEventListener("change", (e) => {
      console.error("拿到图片", e);
      this.onImageSelectChange(e);
    });
    input.addEventListener("cancel", (e) => {
      console.error("取消上传图片");
      cancelCallBack && cancelCallBack();
    });
    document.body.appendChild(input);
    this.inputDom = input;
    input.click();
  }

  async onImageSelectChange(e) {
    // 绘制一个div装载图片，mouseMove的过程中进行div的移动
    const files = this.inputDom.files;
    if (files.length <= 0) {
      return;
    }

    const imageFile = files[0];
    const url = await this.getImageUrl(imageFile);

    const divDom = document.createElement("div");
    divDom.style.position = "absolute";
    divDom.style.left = "-100px";
    divDom.style.top = "-100px";
    divDom.style.zIndex = 102;
    divDom.style.width = "100px";
    divDom.style.height = "100px";
    divDom.style.backgroundImage = `url(${url})`;
    this.draggingElement = divDom;
    this.draggingElementBase64 = url;

    const canvasDom = this.baseCanvas.canvasDom;
    canvasDom.parentElement.appendChild(divDom);
  }

  getBase64Image() {
    return this.draggingElementBase64;
  }

  updateDraggingPosition(x, y) {
    this.draggingElement.style.left = x + 5 + "px";
    this.draggingElement.style.top = y + 5 + "px";
  }

  removeDraggingElement() {
    if (!this.draggingElement) {
      return;
    }
    const canvasDom = this.baseCanvas.canvasDom;
    canvasDom.parentElement.removeChild(this.draggingElement);

    this.draggingElement = null;
    this.draggingElementBase64 = null;
  }

  async getImageUrl(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject();
      };
      reader.readAsDataURL(file);
    });
  }
}

export default ImageHelper;
