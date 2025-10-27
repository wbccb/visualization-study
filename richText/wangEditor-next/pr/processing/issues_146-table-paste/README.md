> https://github.com/wangeditor-next/wangEditor-next/issues/146
>
> 记录了解决这个问题的思路

# Bug: Error format when copying table from .docx

这个issues还残留一个没有修复的问题，复制docx到`Safari`浏览器时会导致`border-width`从`1px`突变为`11px`

思路
- 找到处理`paste`的代码逻辑
- 弄懂`paste`过来的数据结构
- 数据结构如何转化为slate的数据结构


## handlePaste()

```ts
function handleOnPaste(e: Event, textarea: TextArea, editor: IDomEditor) {
  EDITOR_TO_CAN_PASTE.set(editor, true) // 标记为：可执行默认粘贴
  const event = e as ClipboardEvent
  const { readOnly } = editor.getConfig()
  if (readOnly) { return }
  if (!hasEditableTarget(editor, event.target)) { return }
  const { customPaste } = editor.getConfig()
  if (customPaste) {
    const res = customPaste(editor, event)
    if (res === false) {
      // 自行实现粘贴，不执行默认粘贴
      EDITOR_TO_CAN_PASTE.set(editor, false) // 标记为：不可执行默认粘贴
      return
    }
  }
  // 如果支持 beforeInput 且不是纯粘贴文本（如 html、图片文件），则使用 beforeInput 来实现
  // 这里只处理：不支持 beforeInput 或者 粘贴纯文本
  if (!IS_SAFARI && HAS_BEFORE_INPUT_SUPPORT && !isPlainTextOnlyPaste(event)) { return }
  event.preventDefault()
  const data = event.clipboardData
  if (data == null) { return }
  editor.insertData(data)
}
```

- 如果是`IS_SAFARI`，则会执行`editor.insertData(data)`
- 如果不是`Safari` + 支持beforeInput + 不是简单的文本paste => 直接使用`beforeInput()`处理

在上面`https://github.com/wangeditor-next/wangEditor-next/issues/146` ， `safari`和其它浏览器执行的就是不同的分支情况，因此表现不一致

## insertData()

最终调用的是`editor.insertData()`

> 弄清楚测试用例中关于insertData()的使用情况