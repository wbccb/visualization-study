# 富文本

复用[BlockNote v0.20.0](https://github.com/TypeCellOS/BlockNote)版本部分代码进行二次开发的富文本编辑器

> 底层基于[prosemirror](https://prosemirror.net/)和[tiptap](https://tiptap.dev/)


## 开发计划
- [x] 整理代码，剔除一些不必要的冗余代码
- [x] 优化代码，跑通基础核心的文本编辑功能
- [x] SideMenu基础布局和样式实现
- [x] FormattingToolbar基础布局和样式实现
- [x] SlashMenu基础布局和样式实现
- [x] SideMenu各个图标与Component模式的集合，点击后会弹出二级菜单
- [x] FormattingToolbar的3个图标与Component模式的集合，点击后会弹出二级菜单
- [x] SideMenu的拖拽功能实现（模仿语雀）
- [x] SideMenu的menu点击item功能实现
- [x] FormattingToolbar的menu点击item功能实现
- [x] Link类型的转化以及样式实现
  - [x] 创建富文本中的Link类型
  - [x] FormattingToolbar增加创建Link的按钮
  - [x] SideMenu增加创建Link的按钮
  - [x] 鼠标悬浮在Link类型上面时弹出悬浮的布局`Link.vue`进行编辑文本、编辑链接、跳转到链接、删除等功能
- [x] 基于xl-multi-column进行table新的类型TableBlock的相关功能构建（模仿语雀的交互进行改进）
  - [x] 将xl-multi-column适配为新的类型并且创造tableBlock
  - [x] focus一个单元格+选择部分文字：table顶部弹出SideMenu进行设置
  - [x] 单元格输入"/"弹出SuggestionMenu可以选择插入不同类型的数据，也就是单元格可以容纳不同格式的数据
  - [x] 鼠标右键弹出：增加一行/一列、删除当前行/当前列
  - [x] focus一个单元格：table顶部弹出【文字颜色】【背景颜色】 +【border设置】进行单元格所有数据的改变
  - [x] 选择多个单元格：table顶部弹出【文字颜色】【背景颜色】 +【border设置】+【合并单元格】、【拆分单元格】进行单元格所有数据的改变
  - [x] 当选中TableCell单元格时，隐藏FormattingToolBar + 勾选单元格内的文字时，不出现Table顶部的按钮
  - [x] table的左边的SideMenu:【复制】、【删除】、【剪切】
- [x] 复制/黏贴功能完善
  - [x] BackGroundColor复制/黏贴功能完善
  - [x] Color复制/黏贴功能完善
  - [x] TextAlignment复制/黏贴功能完善
- [ ] 图片功能完善
  - [ ] 图片上传和对应的FormattingToolBar完善
  - [ ] 图片+文字的内联模式构建


## 后续计划
- [ ] 复制/黏贴功能完善
  - [ ] Border复制/黏贴功能完善
- [ ] 导入和导出功能
  - [ ] 编辑器的导入和导出功能
  - [ ] html的导入和导出功能
  - [ ] .docx文档的导入和导出功能
