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
- [X] SideMenu的拖拽功能实现
- [X] SideMenu的menu点击item功能实现
- [X] FormattingToolbar的menu点击item功能实现
- [ ] Link类型的转化以及样式实现
    - [X] 创建富文本中的Link类型
    - [ ] FormattingToolbar增加创建Link的按钮
    - [X] SideMenu增加创建Link的按钮
    - [ ] 鼠标悬浮在Link类型上面时弹出悬浮的布局`Link.vue`进行编辑文本、编辑链接、跳转到链接、删除等功能
- [ ] Table的相关功能，比如合并、增加一行等功能扩展
