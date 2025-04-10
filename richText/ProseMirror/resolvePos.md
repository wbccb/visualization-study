# ResolvedPos

## 具体示例
```text
     <blockGroup><blockContainer><paragraph>测试<img></blockContainer></blockGroup>
位置 0           1               2          3 4 5   6               7              8
```
**拿到的值:**
* 0: doc
* 1: blockGroup
* 2: blockContainer
* 3: paragraph
* 4: 测（paragraph）
* 5: 试（paragraph）
* 6: img（paragraph）
* 7: blockContainer
* 8: blockGroup
* 9: doc

当`pos=5`时，`editor._tiptapEditor.state.doc.resolve(5)`拿到的数据：

```json
{
  "pos": 5,
  "parentOffset": 2, // parent位置就是3
  "depth": 3,
  "nodeBefore": "文本TextNode",
  "nodeAfter": "图片ImageNode",
}
```

- `editor._tiptapEditor.state.doc.resolve(1)=blockGroup` 得到的 `depth=1`
- `editor._tiptapEditor.state.doc.resolve(2)=blockContainer` 得到的 `depth=2`
- `editor._tiptapEditor.state.doc.resolve(3)=paragraph` 得到的 `depth=3`
- `editor._tiptapEditor.state.doc.resolve(7)=</blockContainer>` 得到的 `depth=2` + `parentOffset:5`
> 也就是blockContainer的开始位置在`pos-parentOffset=2`


得到paragraph的初始位置位置 `pos - resolvedPos.parentOffset`

得到paragraph上一级的位置 `pos - resolvedPos.parentOffset - 1`

由于深度`depth=3`，因此我们可以得到最外层blockGroup位置 `pos - resolvedPos.parentOffset - (resolvedPos.depth-1)`

> 上面的推论是基于只有一个paragraph的情况


## 问题总结

### 1. blockGroup位置之谜
当有多个paragraph时，比如
```text
<blockGroup><blockContainer><paragraph>2</blockContainer><blockContainer><paragraph>测试<img></blockContainer></blockGroup>
```

很奇怪...为什么`</blockContainer>`后面还有一个`</blockGroup>`，但是`</blockGroup>`后面是没有`<blockGroup>`，也就是测试下来是下面的结果
```text
<blockGroup><blockContainer><paragraph>2</blockContainer></blockGroup><blockContainer><paragraph>测试<img></blockContainer></blockGroup>
```

> 难不成是两个`<blockContainer>`之间默认加个1个位置？默认加个空格？
>