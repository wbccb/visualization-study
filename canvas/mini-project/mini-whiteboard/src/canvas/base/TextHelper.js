import {globalConfig} from "../config/config.js";

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

  isShowTextArea() {
    return this.textAreaDom.style.display !== "none";
  }

  showTextArea(x, y, textAreaWidth, textAreaHeight, blurCallBack) {
    const textAreaDom = this.textAreaDom;

    textAreaDom.style.display = "block";
    textAreaDom.style.position = "absolute";
    textAreaDom.style.left = x + "px";
    textAreaDom.style.top = y + "px";
    textAreaDom.style.width = textAreaWidth + "px";
    textAreaDom.style.height = textAreaHeight + "px";

    textAreaDom.style.border = "1px solid black";
    textAreaDom.style.zIndex = "101";

    // font="[style variant weight size/lineHeight family] or [reserved word]"
    // style: 正常 斜体 倾斜
    // variant: 属性设置或返回是否以小型大写字母显示字体,这意味着所有的小写字母将被转换为大写，但相比其余文本，该字母将是较小的字体尺寸
    // weight: 设置字体粗细
    // size: 设置字体尺寸
    // family: 设置字体系列
    // 只需要改变这里的fontStyle就可以改变输入框和所有canvas绘制文本的样式
    const fontStyle = {
      font: `normal normal bold 12px/${globalConfig.fontLineHeightString} arial,serif`,
      fillStyle: "red",
      textBaseline: "top",
    };
    textAreaDom.style.font = fontStyle.font;
    textAreaDom.style.color = fontStyle.fillStyle;

    let divDom = this.createTextAreaDiv();

    textAreaDom.oninput = (e) => {
      let textAreaValue = e.target.value;
      divDom.innerText = textAreaValue;
      console.info(JSON.stringify(textAreaValue));
      // 判断是否需要换行
      // 超过div的距离就代表需要自动换行，插入换行符，textArea一旦超过width就会自动换行
      // 但是我们需要手动插入换行符，因为我们canvas绘制的时候需要利用换行符进行文字的切割
      const divWidth = divDom.getBoundingClientRect().width;

      if (divWidth > textAreaWidth) {
        console.info("divWidth", divWidth, textAreaWidth);
        // 需要插入换行符，然后divWidth就会恢复到限定宽度的样子
        // 可以继续输入，然后检测divWidth是否超过限定宽度
        // 我们知道divWidth已经大于textAreaWidth，那我们该在哪个地方插入"\n"才能使得divWidth<textAreaWidth呢？
        // 一个字是12px，我们从最后一个字之前插入"\n"，divWidth整体宽度会减少12px
        const len = textAreaValue.length;
        const newTextAreaValue =
          textAreaValue.slice(0, len - 1) + "\n" + textAreaValue.slice(len - 1);
        textAreaDom.style.height = parseInt(textAreaDom.style.height.split("px")[0]) + 20 + "px";
        textAreaDom.value = newTextAreaValue; // 再度触发textAreaDom.oninput
      }
    };

    textAreaDom.onblur = () => {
      if (divDom) {
        const canvasDom = this.baseCanvas.getCanvasDom();
        canvasDom.parentElement.removeChild(divDom);
        divDom = null;
      }

      console.warn("fontStyle", fontStyle);
      blurCallBack && blurCallBack(textAreaDom.value, fontStyle);
      textAreaDom.style.display = "none";
      setTimeout(() => {
        textAreaDom.value = "";
      }, 0);
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
    const canvasDom = this.baseCanvas.getCanvasDom();
    canvasDom.parentElement.appendChild(divDom);

    // TODO 测试使用
    divDom.style.opacity = 0;

    return divDom;
  }
}

export default TextHelper;
