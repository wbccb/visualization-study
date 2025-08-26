# 协同编辑核心概念
- OT（操作转换）
- CRDT（无冲突复制数据类型）


## OT（操作转换）vs CRDT（无冲突复制数据类型）

### OT（操作转换）
当多个操作并发执行时，服务器通过转换函数确保最终一致性
1. 用户A执行操作O₁
2. 用户B执行操作O₂（与O₁并发）
3. 服务器接收O₁后，将O₂转换为O₂' = TP(O₁, O₂)
4. 服务器接收O₂后，将O₁转换为O₁' = TP(O₂, O₁)
5. 所有客户端应用转换后的操作，达到一致状态

### CRDT（无冲突复制数据类型）

设计数据结构使其天然支持并发操作，无需中央协调

需要自己实现CRDT数据->各类主流编辑器数据结构的转化


## Y.js（基于CRDT）
核心概念
- `CRDT`：其核心算法允许数据在多个副本上独立更新，并在同步时自动解决冲突，确保最终一致性
- `Shared Types`：提供常见的数据结构，这些结构可以并发操作
- `Document & Updates`：Y.Doc是顶层容器，存储所有共享数据。对Y.Doc的修改会产生二进制更新（updates），这些更新可以通过网络传输以同步状态
- `Providers`：：Provider是网络层抽象，处理Y.Doc和后端的同步

Yjs 采用带删除标记的链表（List with Tombstones）作为核心数据结构：


### yjs-demos
> https://github.com/yjs/yjs-demos

包含多种编辑器与`Y.js`集成的例子

## @hocuspocus/provider
基于`Y.js`实现封装和扩展，底层仍然使用`Y.js`的`CRDT`算法处理冲突，可以看作是`y-websocket`的增强版本，添加了更多适合生产环境的功能
- 更简单的服务器配置
- 内置的文档持久化支持
- 更完善的用户身份验证机制
- 更好的错误处理和重连机制

```js
const { createServer } = require('http')
const { Server } = require('y-websocket')

// 创建HTTP服务器
const httpServer = createServer()

// 配置Yjs WebSocket服务器
const wsServer = new Server({
  httpServer,
  // 可选：添加身份验证
  // authenticate: (authToken, req) => { ... }
})


//---------可以替换为---------------

import { HocuspocusProvider } from '@hocuspocus/provider'

// 创建连接
const provider = new HocuspocusProvider({
    url: 'ws://localhost:1234',
    name: 'my-document-room',
    // 可添加更多配置选项
})
```

## Y.js->ProseMirror的协同工作原理

> 使用 `https://github.com/yjs/y-prosemirror` 减少`yjs`与`promisemirror`底层数据的相互转化成本


1. ProseMirror编辑内容会与一个`Y.XmlFragment`或者`Y.Text`共享类型绑定
2. 任何本地编辑都会直接应用到Y.js的共享类型上
3. Y.js负责生成对应的updates更新
4. 配置的Provider(如`y-websocket`)会将这些更新发送给其他协作客户端或者服务器
5. 其它客户端收到更新后，Y.js会将这些应用于本地的Y.Doc中
6. Y.js的更改会触发事件，ProseMirror会根据事件更新其视图


## Y.js->Slate

Yjs 选择 CRDT 路径，而将 CRDT 模型映射到 Slate 的树形结构需要解决：
- 扁平序列与树形结构的转换
- 字符级属性与节点级属性的对应
- 边界情况的精确处理

1. Yjs 本质上处理扁平文本序列 -> Slate 是树形结构
```js
// Y.js
[{insert: "\n", attributes: {block: "paragraph"}}]

// Slate.js
<paragraph>text</paragraph>
```

2. Yjs 支持字符级别属性 -> Slate 通常是节点级别
- 将连续相同属性的字符合并为文本节点
- 边界处分割节点以保持属性一致性

3. 空白字符：Yjs 普通字符 -> Slate 中换行符表示块级元素分隔
- 将换行符映射为块级元素分隔符
- 特殊处理空块元素

-----------
复杂结构的转化：
1. Yjs扁平序列处理，解析结构标记
2. 根据解构数据构建`Slate`节点树，处理嵌套关系
3. 生成最终的文档















