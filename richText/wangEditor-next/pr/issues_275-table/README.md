# table 表格内的文本元素重构

> 本质跟BlockNote构建 tableBlock 一样，都需要将内联元素构建成为多个 blocks，然后才能进行对某一个 block 水平居中/垂直居中


## 原有的tableModule源码解析

- renderStyle: 传入 node 和 vnode，node 的样式属性 -> vnode 添加样式属性
- styleToHtml: 传入 node 和 DOM，node 样式属性 ->  DOM 的CSS
- parseStyleHTML: 传入 DOM 和 node，DOM 的CSS ->  node 样式属性
- renderElems: 根据 SlateElement 创建 VNode
- elemsToHtml: 根据 SlateElement 创建 DOM
- parseElemsHtml: 根据 DOM 解析为一个自定义 Object
- menus: 多个插件，可以进行 table插入、table删除....
- withTable: 扩展/重写 editor 的基础方法，从而适配 table 模式，比如 `重写 insertBreak - cell 内换行，只换行文本，不拆分 node`

## 涉及相关issues的分析

- issues#338: wps表格插入行，复制到wangEditor，然后操作wangEditor会报错
- issues#334: 表格里加空格会导致空格前面文字的样式丢失

### issues#338 wps表格插入行，复制到wangEditor，然后操作wangEditor会报错
> fix(table): fill in the hidden tablecell

### issues#334 表格里加空格会导致空格前面文字的样式丢失
> fix(table): compatible with table style nesting


## 想要实现效果的源码解析


## 改造tableModule

## 单元测试相关改造


### 熟悉目前的单元测试规则

### 增加/完善tableModule的单元测试

