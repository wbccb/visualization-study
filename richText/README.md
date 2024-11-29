# 富文本

复用[BlockNote v0.17.0](https://github.com/TypeCellOS/BlockNote)版本部分代码进行二次开发的富文本编辑器

> 底层基于[prosemirror](https://prosemirror.net/)和[tiptap](https://tiptap.dev/)


## 开发计划
- [X] 整理代码，剔除一些不必要的冗余代码
- [X] 优化代码，跑通基础核心的文本编辑功能
- [X] SideMenu基础布局和样式实现
- [X] FormattingToolbar基础布局和样式实现
- [X] SlashMenu基础布局和样式实现
- [X] SideMenu各个图标与Component模式的集合，点击后会弹出二级菜单
- [X] FormattingToolbar的3个图标与Component模式的集合，点击后会弹出二级菜单
- [X] SideMenu的拖拽功能实现（模仿语雀）
- [X] SideMenu的menu点击item功能实现
- [X] FormattingToolbar的menu点击item功能实现
- [X] Link类型的转化以及样式实现
  - [X] 创建富文本中的Link类型
  - [X] FormattingToolbar增加创建Link的按钮
  - [X] SideMenu增加创建Link的按钮
  - [X] 鼠标悬浮在Link类型上面时弹出悬浮的布局`Link.vue`进行编辑文本、编辑链接、跳转到链接、删除等功能
- [ ] Table的相关功能（模仿语雀的交互进行改进）
  - [ ] 鼠标右键弹出：增加一行/一列、删除当前行/当前列、插入不同类型的数据（跟SuggestionMenu一致)
  - [ ] focus一个单元格：table顶部弹出【文字颜色】+【背景颜色】 + 【border设置】
  - [ ] focus一个单元格+选择部分文字：table顶部弹出【文字颜色】+【背景颜色】 + 【border设置】
  - [ ] 选择多个单元格：table顶部弹出【文字颜色】+【背景颜色】 + 【border设置】+【合并单元格】、【拆分单元格】
  - [ ] "/"弹出SuggestionMenu可以选择插入不同类型的数据
  - [ ] table的左边的SideMenu: 【复制】、【拖拽】、【删除】、【剪切】
  - [ ] table的左边、上边有一圈border: 点击后弹出tip提示可以拖拽，可以实现拖拽行/列
- [ ] 复制/黏贴功能完善 + 兼容性测试和处理
- [ ] 导入和导出功能
  - [ ] 编辑器的导入和导出功能
  - [ ] html的导入和导出功能
  - [ ] .docx文档的导入和导出功能
- [ ] 图片功能完善
  - [ ] 图片上传和对应的FormattingToolBar完善
  - [ ] 图片+文字的内联模式构建