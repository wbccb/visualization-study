/**
 * 封装所有对文本的操作逻辑，包括
 * 1. 多行文本绘制
 * 2. 创建textarea和离屏div进行自动换行
 * 3. 复制黏贴长文本自动处理
 * 在baseCanvas只要简单调用封装方法即可实现绘制多行文本功能
 */
class TextHelper {
  constructor(baseCanvas) {
    this.baseCanvas = baseCanvas;

    // 一直保留一个textArea，避免频繁创建和删除
    const textAreaDom = document.createElement("textarea");
    textAreaDom.style.display = "none";
    const canvasDom = baseCanvas.getCanvasDom();
    canvasDom.parentElement.appendChild(textAreaDom);

    this.textAreaDom = textAreaDom;
  }

  showTextArea(x, y, width, height, blurCallBack) {
    const textAreaDom = this.textAreaDom;

    // console.info("最新的scrollX/scrollY", this.state.scrollX, this.state.scrollY);
    // const style = {
    //   display: "block",
    //   x: x + "px",
    //   y: y + "px",
    //   width,
    //   height,
    //   border: "1px solid black",
    //   zIndex: "101",
    // };
    // const initStyle = textAreaDom.style;
    // textAreaDom.style = Object.assign(initStyle, style);

    textAreaDom.style.display = "block";
    textAreaDom.style.position = "absolute";
    textAreaDom.style.left = x + "px";
    textAreaDom.style.top = y + "px";
    textAreaDom.style.width = width;
    textAreaDom.style.height = height;

    textAreaDom.style.border = "1px solid black";
    textAreaDom.style.zIndex = "101";

    const divDom = this.createTextAreaDiv();

    textAreaDom.oninput = (e) => {
      const textAreaValue = e.target.value;
      divDom.innerText = textAreaValue;
      console.info(JSON.stringify(textAreaValue));
      // TODO 判断是否需要换行
    };

    textAreaDom.onblur = () => {
      if (divDom) {
        const canvasDom = this.baseCanvas.getCanvasDom();
        canvasDom.parentElement.removeChild(divDom);
      }

      blurCallBack && blurCallBack(textAreaDom.value);
      textAreaDom.style.display = "none";
      setTimeout(() => {
        textAreaDom.innerText = "";
      }, 1000);
    };

    setTimeout(() => {
      textAreaDom.focus();
    }, 0);
  }

  /**
   * 单行文字的div，不添加到document中，为了自动换行使用
   */
  createTextAreaDiv() {
    // 创建div，单行模式，将目前textarea的内容复制到div上
    const divDom = document.createElement("div");
    divDom.contentEditable = true;
    // 根据目前内容宽度div的宽度，判断什么时候需要换行，然后插入换行符，实现自动换行功能
    // 换行符的作用是将textarea的多行文字内容正确绘制到canvas上

    divDom.style.position = "fixed";
    divDom.style.top = "0px";
    divDom.style.left = "0px";
    divDom.style.background = "red";

    // TODO 测试使用
    const canvasDom = this.baseCanvas.getCanvasDom();
    canvasDom.parentElement.appendChild(divDom);

    return divDom;
  }
}

export default TextHelper;
