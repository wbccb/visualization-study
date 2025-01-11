# 格式刷实现思路

1. 选中文字，弹出【格式刷】按钮，点击后进行样式的复制 + 格式刷模式的开启 + 监听选区的变化
2. 当选区事件触发时，触发格式刷应用事件，将之前的样式复制-应用到选择的文字中
3. 其他：点击其他位置进行格式刷模式的取消
4. 其他：点击非文字部分无法进行格式化应用


## 参考
1.https://github.com/coolswitch/tiptap-extension-format-painter/blob/master/src/formatPainter.ts 

