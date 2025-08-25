# 协同编辑核心概念
- OT（操作转换）
- CRDT（无冲突复制数据类型）

## Y.js
核心概念
- `CRDT`：其核心算法允许数据在多个副本上独立更新，并在同步时自动解决冲突，确保最终一致性
- `Shared Types`：提供常见的数据结构，这些结构可以并发操作
- `Document & Updates`：Y.Doc是顶层容器，存储所有共享数据。对Y.Doc的修改会产生二进制更新（updates），这些更新可以通过网络传输以同步状态
- `Providers`：：Provider是网络层抽象，处理Y.Doc和后端的同步

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

1. ProseMirror编辑内容会与一个`Y.XmlFragment`或者`Y.Text`共享类型绑定
2. 任何本地编辑都会直接应用到Y.js的共享类型上
3. Y.js负责生成对应的updates更新
4. 配置的Provider(如`y-websocket`)会将这些更新发送给其他协作客户端或者服务器
5. 其它客户端收到更新后，Y.js会将这些应用于本地的Y.Doc中
6. Y.js的更改会触发事件，ProseMirror会根据事件更新其视图

