> https://github.com/wangeditor-next/wangEditor-next/issues/165
> 
> 记录了解决这个问题的思路


# yjs-for-vue3

**开发步骤**
- 研究`yjs`和`yjs-react`的实现思路
- 模仿`yjs`和`yjs-react`进行`yjs-vue3`的实现
- 按照其它packages的模式补全`yjs-vue3`相关的说明文档和测试用例

## 研究 yjs 和 yjs-react 的实现思路

主要有
- yjs/examples/frontend: 基础的协同编辑+光标显示协同编辑的demo
- @wangeditor-next/yjs-react: 跟React组件相关的代码部分，包括编辑器部分、根据编辑器获取各种cursor的hooks(部分需要`yjs`提供方法辅助)
- @wangeditor-next/yjs: 集成Y.js+slate.js的相关逻辑，提供给`yjs-react`和`yjs/examples/frontend`使用
> 注：这个仓库并没有使用`yjs-slate`第三方库，而是自己控制`yjs`与`slate`的相关转化，基本逻辑都放在`yjs`文件夹中

### yjs/examples/frontend

1. 没有光标的版本: `src/pages/Simple.tsx`
2. 有光标的版本: `src/pages/RemoteCursorOverlay/index.tsx`


核心代码
```tsx
useEffect(() => {
  if (editor) {
    sharedType.applyDelta(slateNodesToInsertDelta(initialValue))
    //   sharedType.insert(0, 'hello')
    YjsEditor.connect(editor)
  }
  return () => {
    if (editor && Object.prototype.hasOwnProperty.call(editor, 'diisconnect')) {
      YjsEditor.disconnect(editor)
    }
  }
}, [editor])
```

光标核心代码

```tsx
const [cursors] = useRemoteCursorOverlayPositions<CursorData>({
  containerRef,
})
```

```tsx
{cursors.map(cursor => (
  <RemoteSelection key={cursor.clientId} {...cursor} />
))}


<React.Fragment>
  {selectionRects.map((position, i) => (
    <div
      style={{ ...selectionStyle, ...position }}
      className="absolute pointer-events-none"
      key={i}
    />
  ))}
  {caretPosition && <Caret caretPosition={caretPosition} data={data} />}
</React.Fragment>
```

### 1. @wangeditor-next/yjs

> Yjs 团队明确表示他们不再维护官方的 Slate 绑定，而是推荐社区解决方案。
> 为什么移除 y-slate？
> 主要原因包括：
> - 维护负担：Slate API 频繁变化（特别是从 0.47 到 0.80 的重大变化），维护官方绑定需要大量精力
> - 社区方案更活跃：BitPhinix 的 slate-yjs 比官方版本更新更频繁、功能更完善
> - 专注核心 CRDT：Yjs 团队决定专注于核心 CRDT 库，而非特定编辑器绑定
> - 架构变化：Slate 0.50+ 的重大重构使旧集成方案难以维护


`yjs`和`slate`相关转化的相关逻辑

主要分为
- 基础的cursor相关插件
- range相关的工具方法
- history相关的方法

```ts
export {
  // Base cursor plugin
  CursorEditor,
  CursorState,
  CursorStateChangeEvent,
  relativePositionToSlatePoint,
  // Utils
  RelativeRange,
  relativeRangeToSlateRange,
  RemoteCursorChangeEventListener,
  slateNodesToInsertDelta,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
  withCursors,
  WithCursorsOptions,
  // History plugin
  withYHistory,
  WithYHistoryOptions,
  withYjs,
  WithYjsOptions,
  YHistoryEditor,
  YjsEditor,
  yTextToSlateElement,
}
```


> `slate的绝对位置`：slate是基于path的定位系统，`path` 是一个数字数组，代表从根节点开始到目标节点的路径，`offset` 则是该文本节点内的字符偏移量。例如 `[0, 1]` 表示根节点下第 0 个子节点的第 1 个子节点。这种绝对路径在文档内容发生变化时容易失效

> `Y.js的相对位置`：Y.js是基于相对位置来定位，它不依赖于文档的绝对路径，而是通过引用一个Y.js共享数据类型（比如`Y.XmlText`）和该类型的偏移量来定位。这种相对定位的优势在于，即使文档内容发生变化，只要引用的共享数据类型和偏移量所代表的逻辑位置没有改变，该相对位置仍然是有效的

`Y.js的Awareness协议`：每一个客户端都可以通过`awareness.setLocalStateField()`设置自己的本地状态，并通过`awareness.getState()`获取其它客户端的状态，当其它客户端的状态发生变化时，会触发`change`事件


光标计算的核心在于：将`Slate`的绝对光标位置转换为`Y.js`的相对光标位置，并通过`Awareness`协议进行同步


#### 1.1 本地位置变更

当用户在本地Editor发生操作导致位置改变时，会触发`wangEditor`的`onChange`方法

从而调用`YjsEditor.flushLocalChanges(e)`将本地slate操作同步到`Y.js`文档树
```ts
// Boot.registerPlugin(withYjs(sharedType))
// withYjs.ts
e.onChange = () => {
  if (YjsEditor.connected(e)) {
    YjsEditor.flushLocalChanges(e)
  }
  onChange()
}
```

然后触发`CursorEditor.sendCursorPosition(e)`
```ts
// Boot.registerPlugin(
//   withCursors(wsProvider.awareness, {
//     data: randomCursorData(),
//   }),
// )
// withCursors.ts
e.onChange = () => {
  onChange()
  if (YjsEditor.connected(e)) {
    CursorEditor.sendCursorPosition(e)
  }
}
```


#### 1.2 转化为Y.js相对位置并发送

在`e.sendCursorPosition()`中，调用`slatePointToRelativePosition()`将`Slate Position`转化为`Y.js RelativePosition`

```ts
const { anchor, focus } = slateRangeToRelativeRange(e.sharedRoot, e, range)

export function slateRangeToRelativeRange(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  range: BaseRange,
): RelativeRange {
  return {
    anchor: slatePointToRelativePosition(sharedRoot, slateRoot, range.anchor),
    focus: slatePointToRelativePosition(sharedRoot, slateRoot, range.focus),
  }
}

function slatePointToRelativePosition(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  point: BasePoint,
): Y.RelativePosition {
  const { yTarget, yParent, textRange } = getYTarget(sharedRoot, slateRoot, point.path)
  const index = textRange.start + point.offset
  return Y.createRelativePositionFromTypeIndex(yParent, index, index === textRange.end ? -1 : 0)
}
```

##### 1.2.1 getYTarget()

```ts
function getYTarget(yRoot: Y.XmlText, slateRoot: Node, path: Path): YTarget {
  const [pathOffset, ...childPath] = path
  const yOffset = slatePathOffsetToYOffset(slateRoot as Element, pathOffset)
  const targetNode = slateRoot.children[pathOffset]
  const delta = yTextToInsertDelta(yRoot)
  const targetLength = getSlateNodeYLength(targetNode)
  const targetDelta = sliceInsertDelta(delta, yOffset, targetLength)
  const yTarget = targetDelta[0]?.insert
  if (childPath.length > 0) {
    return getYTarget(yTarget, targetNode, childPath)
  }
  return {
    yParent: yRoot,
    textRange: { start: yOffset, end: yOffset + targetLength },
    yTarget: yTarget instanceof Y.XmlText ? yTarget : undefined,
    slateParent: slateRoot,
    slateTarget: targetNode,
    targetDelta,
  }
}
```

> 接下来我们将针对每一行代码进行具体的分析

------------
获取第一个元素的偏移量`pathOffset`（树状结构，第一层的偏移量）
```ts
const [pathOffset, ...childPath] = path
```
------------
获取当前`root`到这个节点的`yOffset`（包含第一层子元素的长度），即目标节点在 Y.js 兄弟节点列表中的起始偏移量
- 如果是文本元素，长度就是`text.length`
- 如果是元素节点，长度就是`1`_
```ts
const yOffset = slatePathOffsetToYOffset(slateRoot as Element, pathOffset)

export function slatePathOffsetToYOffset(element: Element, pathOffset: number) {
  return element.children
    .slice(0, pathOffset)
    .reduce((yOffset, node) => yOffset + getSlateNodeYLength(node), 0)
}
```

-------------------------------

调用`yRoot.toDelta()`获取 yRoot 的直接子内容，比如下面的`paragraph_1`、`image` 和 `paragraph_2`，不会深入到这些子节点的内部去处理 "Hello, World!" 或 "This is another paragraph." 等文本
```text
Y.XmlText (yRoot)
└─ Y.XmlText (paragraph_1)
   └─ "Hello, World!"
└─ Y.XmlElement (image)
└─ Y.XmlText (paragraph_2)
   └─ "This is another paragraph."
```

调用`normalizeInsertDelta()`扁平化 yRoot 的直接子内容，遇到非文本元素则直接添加到`normalized`，遇到相邻的两个文本元素（并且是属性相同），则进行合并再添加到`normalized`

> 假设我们有一个未标准化的 Delta 数组：
> 
> [ { insert: 'Hello' }, { insert: ' ' }, { insert: 'World!' }, { insert: 'I love you', attributes: { bold: true } }, { insert: '!', attributes: { bold: true } } ]
> 
> 合并完成后：[ { insert: 'Hello World!' }, { insert: 'I love you!', attributes: { bold: true } } ]


```ts
const delta = yTextToInsertDelta(yRoot)

function yTextToInsertDelta(yText: Y.XmlText): InsertDelta {
  return normalizeInsertDelta(yText.toDelta())
}
function normalizeInsertDelta(delta: InsertDelta): InsertDelta {
  const normalized: InsertDelta = []
  for (const element of delta) {
    if (typeof element.insert === 'string' && element.insert.length === 0) {
      continue
    }
    const prev = normalized[normalized.length - 1]
    if (!prev || typeof prev.insert !== 'string' || typeof element.insert !== 'string') {
      normalized.push(element)
      continue
    }
    
    const merge = prev.attributes === element.attributes
      || (!prev.attributes === !element.attributes
        && deepEquals(prev.attributes ?? {}, element.attributes ?? {}))
    if (merge) {
      prev.insert += element.insert
      continue
    }
    normalized.push(element)
  }
  return normalized
}
```

-------------------------------

从上面的`yTextToInsertDelta(yRoot)`拿到了第一层平铺的节点数据后，我们在上面`slatePathOffsetToYOffset()`获取当前`root`到这个节点的`yOffset`偏移量，偏移量包含第一层子元素的长度

调用`sliceInsertDelta()`根据 yOffset 和 targetLength 精确地切出目标节点对应的 Delta 片段。这个切片操作确保我们能精准地找到 Y.js 中的目标对象

> 注意：`yOffset`是根据`slateRoot` + `path` 计算出来的，`delta`是根据`yRoot`计算出来的第一层数据平铺，`targetDelta`是`delta`根据`yOffset`切割出来的`Y.js`中指定对象的Delta数据！！
```ts
const targetNode = slateRoot.children[pathOffset]
const targetLength = getSlateNodeYLength(targetNode)

const targetDelta = sliceInsertDelta(delta, yOffset, targetLength)
```

-------------------------------
递归调用`getYTarget()`重复上面的操作，直到找到叶子结点对应的那个`Y.js`对象数据

```ts
if (childPath.length > 0) {
  return getYTarget(yTarget, targetNode, childPath)
}
```

-------------------------------
最终返回一系列数据
- `yParent`不一定就是`slateRoot`对应的`yRoot`，而是某一个节点（因为会根据`childPath`递归调用`getYTarget()`）
- textRange其实是当前`yParent`的`[start, end]`，通过`yParent`的`[start,end]`可以得到yTarget
- `slateParent`对应的就是返回数据`Y.js`对应的`slate`节点数据
- `slateTarget`对应的就是返回数据`Y.js`对应的`yTarget`节点数据


> 因为 Y.js 的 Y.RelativePosition 就是基于这种父节点 + 内部偏移量的模式来工作的。当 slatePointToRelativePosition 函数最终拿到 getYTarget() 返回的结果时，它会使用 yParent 和 textRange.start 来创建 Y.RelativePosition

```ts
  return {
  yParent: yRoot,
  textRange: { start: yOffset, end: yOffset + targetLength },
  yTarget: yTarget instanceof Y.XmlText ? yTarget : undefined,
  slateParent: slateRoot,
  slateTarget: targetNode,
  targetDelta,
}
```

##### 1.2.2 Y.createRelativePositionFromTypeIndex()

> association: 这是一个可选参数，通常是 0 或 -1。它决定了当有新内容正好在 index 位置被插入时，相对位置的行为。
> 
> 正数或 0（默认行为）：光标将位于新插入内容的右侧
> 
> 负数：光标将位于新插入内容的左侧


根据当前`getYTarget`得到对应的`Y.js`对应的节点数据和偏移量`textRange`

然后使用`Y.js`的API构建一个相对位置，其中第三个参数`association`是为了保证光标显示效果的正常显示
- 比如用户在 "Hello World"的光标在`o`和`r`之间，那么`association`为`正数或 0（默认行为）`，那么在`o`和`r`之间新增新的内容时，光标仍然会保持在`r`的前面，但是不会在`o`的后面
- 比如用户在 "Hello World"的光标在`d`后面，那么`association`为`负数`，那么在`d`之后新增新的内容时，光标仍然会保持在`d`的后面

```ts
function slatePointToRelativePosition(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  point: BasePoint,
): Y.RelativePosition {
  const { yTarget, yParent, textRange } = getYTarget(sharedRoot, slateRoot, point.path)

  if (yTarget) {
    throw new Error('Slate point points to a non-text element inside sharedRoot')
  }

  const index = textRange.start + point.offset

  return Y.createRelativePositionFromTypeIndex(yParent, index, index === textRange.end ? -1 : 0)
}
```


--------

##### 1.2.3 awareness.setLocalStateField更新本地的Y.js数据
调用`slatePointToRelativePosition()`将`Slate Position`转化为`Y.js RelativePosition`，我们可以拿到转换后的 `anchor` 和 `focus` 两个 `Y.RelativePosition` 对象

然后我们触发`e.awareness.setLocalStateField(默认是'selection', {anchor, focus})`更新本地的`awareness`状态

```ts
const { anchor, focus } = slateRangeToRelativeRange(e.sharedRoot, e, range)
if (
  !currentRange
  || !Y.compareRelativePositions(anchor, currentRange)
  || !Y.compareRelativePositions(focus, currentRange)
) {
  e.awareness.setLocalStateField(e.selectionStateField, { anchor, focus })
}
```

#### 1.3 Awareness状态广播

当用户A触发`e.awareness.setLocalStateField()`改变状态时

`Y.js`的`Awareness`协议会将用户A的变化广播（比如WebSocket）给所有连接的其它用户客户端

#### 1.4 远程客户端接收并转换为Slate绝对位置

用户B通过监听`e.awareness.on('change', awarenessChangeListener)`，获取目前所有注册的用户，触发对应的监听方法，也就是`getSnapshot()`
```ts
const awarenessChangeListener: RemoteCursorChangeEventListener = yEvent => {
  const listeners = CURSOR_CHANGE_EVENT_LISTENERS.get(e)

  if (!listeners) {
    return
  }

  const localId = e.awareness.clientID
  const event = {
    added: yEvent.added.filter(id => id !== localId),
    removed: yEvent.removed.filter(id => id !== localId),
    updated: yEvent.updated.filter(id => id !== localId),
  }

  if (event.added.length > 0 || event.removed.length > 0 || event.updated.length > 0) {
    listeners.forEach(listener => listener(event))
  }
}

// packages/yjs-for-react/src/hooks/useRemoteCursorStateStore.ts
const subscribe = (onStoreChange: () => void) => {
  onStoreChangeListeners.add(onStoreChange)
  if (!changeHandler) {
    changeHandler = event => {
      event.added.forEach(addChanged)
      event.removed.forEach(addChanged)
      event.updated.forEach(addChanged)
      onStoreChangeListeners.forEach(listener => listener())
    }
    CursorEditor.on(editor, 'change', changeHandler)
  }

  return () => {
    onStoreChangeListeners.delete(onStoreChange)
    if (changeHandler && onStoreChangeListeners.size === 0) {
      CursorEditor.off(editor, 'change', changeHandler)
      changeHandler = null
    }
  }
}
const getSnapshot = () => {
  if (changed.size === 0) {
    return cursors
  }
  changed.forEach(clientId => {
    const state = CursorEditor.cursorState(editor, clientId)
    if (state === null) {
      delete cursors[clientId.toString()]
      return
    }
    cursors[clientId] = state
  })
  changed.clear()
  cursors = { ...cursors }
  return cursors
}
```

`CursorEditor.cursorState(editor, clientId)`通过`clientId`拿到数据，`relativeSelection`对应的就是`{anchor, focus}`数据
> e.awareness.setLocalStateField(e.selectionStateField, { anchor, focus })

```ts
cursorState<TCursorData extends Record<string, unknown>>(
  editor: CursorEditor<TCursorData>,
  clientId: number,
): CursorState<TCursorData> | null {
  if (clientId === editor.awareness.clientID || !YjsEditor.connected(editor)) {
    return null
  }

  const state = editor.awareness.getStates().get(clientId)

  if (!state) {
    return null
  }

  return {
    relativeSelection: state[editor.selectionStateField] ?? null,
    data: state[editor.cursorDataField],
    clientId,
  }
}
```
-------

> 那editor.cursorDataField又是什么呢？

我们一开始初始化的时候，会进行注册，传入一个`data: randomCursorData(),`
```ts
Boot.registerPlugin(
  withCursors(wsProvider.awareness, {
    data: randomCursorData(),
  }),
)
```

在`withCursors()`中，我们会检测`options.data`是否有值，然后触发`CursorEditor.sendCursorData(e, data)`，从而触发`e.awareness.setLocalStateField(e.cursorDataField, cursorData)`

> 注：暂时还没发现哪里调用，可能是为了处理离线的cursor的初始化数据
```ts
const {
  cursorStateField: selectionStateField = 'selection',
  cursorDataField = 'data',
  autoSend = true,
  data,
} = options
const { connect, disconnect } = e
e.connect = () => {
  connect()
  e.awareness.on('change', awarenessChangeListener)
  awarenessChangeListener({
    removed: [],
    added: Array.from(e.awareness.getStates().keys()),
    updated: [],
  })

  if (autoSend) {
    if (data) {
      CursorEditor.sendCursorData(e, data)
    }
    const { onChange } = e
    e.onChange = () => {
      onChange()
      if (YjsEditor.connected(e)) {
        CursorEditor.sendCursorPosition(e)
      }
    }
  }
}

e.sendCursorData = (cursorData: TCursorData) => {
  e.awareness.setLocalStateField(e.cursorDataField, cursorData)
}
```

-------

当`getSnapshot()`调用时，会触发`cursorStates`发生变化，从而触发`overlayPosition`的重新计算
```ts
// packages/yjs-for-react/src/hooks/useRemoteCursorOverlayPositions.tsx
const cursorStates = useRemoteCursorStates<TCursorData>()

const updated = Object.fromEntries(
  Object.entries(cursorStates).map(([key, state]) => {
    const range = state.relativeSelection && getCursorRange(editor, state)

    if (!range) {
      return [key, FROZEN_EMPTY_ARRAY]
    }

    const cached = overlayPositionCache.current.get(range)

    if (cached) {
      return [key, cached]
    }

    // 对rang范围发生改变的位置进行重新cursorPos的计算
    // 由于重新计算是一个耗时的操作，因此这里用了缓存处理位置的计算
    const overlayPosition = getOverlayPosition(editor, range, {
      xOffset,
      yOffset,
      shouldGenerateOverlay,
    })

    overlayPositionsChanged = true
    overlayPositionCache.current.set(range, overlayPosition)
    return [key, overlayPosition]
  })
)
```

从而触发
- `getCursorRange()`：主要调用`@wangEditor-next/yjs`的`relativeRangeToSlateRange()`进行`range`的转换，然后进行一系列的数据的缓存
- `getOverlayPosition()`

##### 1.4.1 relativeRangeToSlateRange()

跟上面的转化逻辑类似，这里就是将`Y.js`的相对位置转化为`slate`的绝对位置
```ts
export function relativeRangeToSlateRange(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  range: RelativeRange,
): BaseRange | null {
  const anchor = relativePositionToSlatePoint(sharedRoot, slateRoot, range.anchor)
  const focus = relativePositionToSlatePoint(sharedRoot, slateRoot, range.focus)
  return { anchor, focus }
}
export function relativePositionToSlatePoint(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  pos: Y.RelativePosition,
): BasePoint | null {
  const absPos = Y.createAbsolutePositionFromRelativePosition(pos, sharedRoot.doc)
  return absolutePositionToSlatePoint(sharedRoot, slateRoot, absPos)
}
```


`Y.createAbsolutePositionFromRelativePosition()`会根据当前的相对位置，然后计算出具体的可以操作的绝对位置
> 不仅仅是简单根据相对位置的旧的索引计算出绝对位置，而是根据当前文档的最新上下文（包括其他人已经修改了这个锚定对象的数据）来重新计算和定位，然后返回一个最新的绝对位置


得到`Y.js`的绝对位置后，调用`absolutePositionToSlatePoint()`开始转化`Y.js`为`Slate.js`的数据，涉及到
- getSlatePath()
- yOffsetToSlateOffsets()

```ts
export function absolutePositionToSlatePoint(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  { type, index, assoc }: Y.AbsolutePosition,
): BasePoint | null {
  const parentPath = getSlatePath(sharedRoot, slateRoot, type)
  const parent = Node.get(slateRoot, parentPath)
  
  const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, index, {
    assoc,
  })
  const target = parent.children[pathOffset]

  if (!Text.isText(target)) {
    return null
  }

  return { path: [...parentPath, pathOffset], offset: textOffset }
}
```

getSlatePath 先向上构建 Y.js 父节点路径，再向下逐级映射到 Slate 的 path 路径（yOffsetToSlateOffsets 负责将偏移量精准地定位到 Slate 的子节点和文本中）
> 接下来我们将针对这两个方法展开详细分析

---------------------------------------------------------------

`getSlatePath()` 分为两个部分：
- 向上递归遍历构建出`path`对应的节点数组`yNodePath`，`index=0`从根节点开始
- 遍历数组`yNodePath`，构建出具体的`path`

```ts

export function getSlatePath(sharedRoot: Y.XmlText, slateRoot: Node, yText: Y.XmlText): Path {
  const yNodePath = [yText]

  while (yNodePath[0] !== sharedRoot) {
    const { parent: yParent } = yNodePath[0]
    yNodePath.unshift(yParent)
  }
  let slateParent = slateRoot
  return yNodePath.reduce<Path>((path, yParent, idx) => {
    const yChild = yNodePath[idx + 1]
    if (!yChild) {
      return path
    }
    let yOffset = 0
    const currentDelta = yTextToInsertDelta(yParent)
    for (const element of currentDelta) {
      if (element.insert === yChild) {
        break
      }
      yOffset += typeof element.insert === 'string' ? element.insert.length : 1
    }
    if (Text.isText(slateParent)) {
      throw new Error('Cannot descent into slate text')
    }
    const [pathOffset] = yOffsetToSlateOffsets(slateParent as Element, yOffset)
    slateParent = slateParent.children[pathOffset]
    return path.concat(pathOffset)
  }, [])
}
```

举一个具体的示例
```json
[
  {
    "type": "paragraph", // 路径 [0]
    "children": [
      {
        "text": "Hello, " // 路径 [0, 0]
      },
      {
        "type": "mention", // 路径 [0, 1]
        "children": [
          { "text": "我是光标左边，我是光标右边" } // 路径 [0, 1, 0]
        ]
      },
      {
        "text": "World!" // 路径 [0, 2]
      }
    ]
  },
  {
    "type": "block-quote", // 路径 [1]
    "children": [
      {
        "text": "This is a quote." // 路径 [1, 0]
      }
    ]
  }
]
```

当目标节点是`yTextMention`的内部文本的某一个位置时，我们直接从上面json可以知道，光标对应的path 就是 path = `[0, 1, 0]`，textOffset = 6


`getSlatePath()`分为两个阶段：
- 向上追溯Y.js路径，我们可以得到 `yNodePath` = `[sharedRoot, yTextParagraph, yTextMention]`，就是 `[根节点, 目标节点的parent节点的parent, 目标节点的parent节点, 目标节点]`
- 向下映射到 Slate 路径，遍历 `yNodePath`
  - 第一次遍历获取到 `yParent` = `sharedRoot`，`yChild` = `yTextParagraph`，对`yParent`调用`yTextToInsertDelta()`进行第一层元素的平铺，最终形成`currentDelta` = `[{ insert: yTextParagraph }, { insert: yTextBlockQuote }]`
  - 寻找 `yChild` 在 `currentDelta` 的偏移量（注意：这里还不是 Slate Path 的偏移量，是文本元素等于 `element.insert.length`，其它元素长度等于 `1` 来计算的 Y.js 的偏移量） 
  - 根据 `slateParent` 和 `yOffset` 来计算出对应的`slate节点`的`childrenIndex` = `pathOffset`(取`yOffsetToSlateOffsets()`返回的数组的第一个元素lastNonEmptyPathOffset)，得到slateParent = `yTextParagraph`对应的`slate节点`，将pathOffset加入到`path数组`中，然后更新`slateParent`为`目标节点的parent节点的parent` => path 就是 `[0]`
  - 继续遍历，拿出 `yParent` = `yTextParagraph`，`yChild` = `yTextMention`，此时 `slateParent`等于 `yTextParagraph`对应的slate节点，继续上面3个步骤，计算出`path数组`的下一个值，然后更新`slateParent`，继续循环 => path 就是 `[0, 1]`
  - 继续遍历，拿出 `yParent` = `yTextMention`，`yChild` = `yText`= null，结束循环，返回path

注意：此时拿到的 `path` 是 `[0, 1]`

```ts
function yOffsetToSlateOffsets(
  parent: Element,
  yOffset: number,
  opts: { assoc?: number; insert?: boolean } = {},
): [number, number] {
  const { assoc = 0, insert = false } = opts
  let currentOffset = 0
  let lastNonEmptyPathOffset = 0
  for (let pathOffset = 0; pathOffset < parent.children.length; pathOffset += 1) {
    const child = parent.children[pathOffset]
    const nodeLength = Text.isText(child) ? child.text.length : 1
    if (nodeLength > 0) {
      lastNonEmptyPathOffset = pathOffset
    }
    const endOffset = currentOffset + nodeLength
    if (nodeLength > 0 && (assoc >= 0 ? endOffset > yOffset : endOffset >= yOffset)) {
      return [pathOffset, yOffset - currentOffset]
    }
    currentOffset += nodeLength
  }
  if (insert) {
    return [parent.children.length, 0]
  }
  const child = parent.children[lastNonEmptyPathOffset]
  const textOffset = Text.isText(child) ? child.text.length : 1
  return [lastNonEmptyPathOffset, textOffset]
}
```

回到我们的`absolutePositionToSlatePoint()`，当我们使用`getSlatePath`拿到`path` = `[0, 1]` 时，我们会使用传入的`Y.AbsolutePosition`的`index`进行进一步的`yOffsetToSlateOffsets`计算获取对应的偏移值

```ts
export function absolutePositionToSlatePoint(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  { type, index, assoc }: Y.AbsolutePosition,
): BasePoint | null {
  const parentPath = getSlatePath(sharedRoot, slateRoot, type)
  const parent = Node.get(slateRoot, parentPath)
  
  const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, index, {
    assoc,
  })
  const target = parent.children[pathOffset]

  if (!Text.isText(target)) {
    return null
  }

  return { path: [...parentPath, pathOffset], offset: textOffset }
}
```

此时的 `parent` = `yTextMention`，`index` = 6

我们获取`parent.children` = `"text": "我是光标左边，我是光标右边"`, `Text.isText(child)`为true，返回`[pathOffset, yOffset - currentOffset]`

此时
- `pathOffset` = 0
- `yOffset - currentOffset` = 6

```ts
function yOffsetToSlateOffsets(
  parent: Element,
  yOffset: number,
  opts: { assoc?: number; insert?: boolean } = {},
): [number, number] {
  const { assoc = 0, insert = false } = opts
  let currentOffset = 0
  let lastNonEmptyPathOffset = 0
  for (let pathOffset = 0; pathOffset < parent.children.length; pathOffset += 1) {
    const child = parent.children[pathOffset]
    const nodeLength = Text.isText(child) ? child.text.length : 1
    if (nodeLength > 0) {
      lastNonEmptyPathOffset = pathOffset
    }
    const endOffset = currentOffset + nodeLength
    if (nodeLength > 0 && (assoc >= 0 ? endOffset > yOffset : endOffset >= yOffset)) {
      return [pathOffset, yOffset - currentOffset]
    }
    currentOffset += nodeLength
  }
  //...
}
```

回到`absolutePositionToSlatePoint()`，获取`target`判断是否为文本元素，然后合并`path`，最终
- `parentPath` = `[0, 1]`
- `pathOffset` = 0
- `textOffset` = 6
返回`{path: [0, 1, 0], offset: 6}`

```ts
const target = parent.children[pathOffset]
if (!Text.isText(target)) {
  return null
}
return { path: [...parentPath, pathOffset], offset: textOffset }
```

##### 1.4.2 getOverlayPosition()

经过`getCursorRange()`的计算，我们已经能够拿到目前光标的位置数据`{path: [0, 1, 0], offset: 6}`

```ts
// packages/yjs-for-react/src/hooks/useRemoteCursorOverlayPositions.tsx
const cursorStates = useRemoteCursorStates<TCursorData>()

const updated = Object.fromEntries(
  Object.entries(cursorStates).map(([key, state]) => {
    const range = state.relativeSelection && getCursorRange(editor, state)

    if (!range) {
      return [key, FROZEN_EMPTY_ARRAY]
    }

    const cached = overlayPositionCache.current.get(range)

    if (cached) {
      return [key, cached]
    }

    // 对rang范围发生改变的位置进行重新cursorPos的计算
    // 由于重新计算是一个耗时的操作，因此这里用了缓存处理位置的计算
    const overlayPosition = getOverlayPosition(editor, range, {
      xOffset,
      yOffset,
      shouldGenerateOverlay,
    })

    overlayPositionsChanged = true
    overlayPositionCache.current.set(range, overlayPosition)
    return [key, overlayPosition]
  })
)
```

根据`range`（有起点和终点）直接使用`slate`的API进行DOM的获取
> isBackward代表选区是从左到右，还是从右到左选区

然后构建出对应的`selectionRects`和`caretPosition`数据

```ts
function getOverlayPosition(
  editor: IDomEditor,
  range: BaseRange,
  { yOffset, xOffset, shouldGenerateOverlay }: GetSelectionRectsOptions,
): OverlayPosition {
  const [start, end] = Range.edges(range)
  const domRange = reactEditorToDomRangeSafe(editor, range)

  if (!domRange) {
    return {
      caretPosition: null,
      selectionRects: [],
    }
  }

  const selectionRects: SelectionRect[] = []
  const nodeIterator = Editor.nodes(editor, {
    at: range,
    match: (n, p) => Text.isText(n) && (!shouldGenerateOverlay || shouldGenerateOverlay(n, p)),
  })

  let caretPosition: CaretPosition | null = null
  const isBackward = Range.isBackward(range)

  for (const [node, path] of nodeIterator) {
    const domNode = DomEditor.toDOMNode(editor, node)

    const isStartNode = Path.equals(path, start.path)
    const isEndNode = Path.equals(path, end.path)

    let clientRects: DOMRectList | null = null

    if (isStartNode || isEndNode) {
      const nodeRange = document.createRange()

      nodeRange.selectNode(domNode)

      if (isStartNode) {
        nodeRange.setStart(domRange.startContainer, domRange.startOffset)
      }
      if (isEndNode) {
        nodeRange.setEnd(domRange.endContainer, domRange.endOffset)
      }

      clientRects = nodeRange.getClientRects()
    } else {
      clientRects = domNode.getClientRects()
    }

    const isCaret = isBackward ? isStartNode : isEndNode

    for (let i = 0; i < clientRects.length; i += 1) {
      const clientRect = clientRects.item(i)

      if (!clientRect) {
        continue
      }

      const isCaretRect = isCaret && (isBackward ? i === 0 : i === clientRects.length - 1)

      const top = clientRect.top - yOffset
      const left = clientRect.left - xOffset

      if (isCaretRect) {
        caretPosition = {
          height: clientRect.height,
          top,
          left: left + (isBackward || Range.isCollapsed(range) ? 0 : clientRect.width),
        }
      }

      selectionRects.push({
        width: clientRect.width,
        height: clientRect.height,
        top,
        left,
      })
    }
  }

  return {
    selectionRects,
    caretPosition,
  }
}
```


### 2. @wangeditor-next/yjs-react
                                                                                                                                                                                                                                                                                      
```ts
export { EditorContext, useEditorStatic } from './hooks/use-editor-static'
export {
  CursorOverlayData,
  useRemoteCursorOverlayPositions,
  UseRemoteCursorOverlayPositionsOptions,
} from './hooks/useRemoteCursorOverlayPositions'
export { useRemoteCursorStates, useRemoteCursorStatesSelector } from './hooks/useRemoteCursorStates'
export { getCursorRange } from './utils/getCursorRange'
```

#### 2.1 useRemoteCursorOverlayPositions()

主要涉及3个方面
1. Y.js接收各个客户端监听 `cursor` 的变化
```ts
// 跟Y.js的光标变化函数绑定，自动更新cursorStates的数据
const cursorStates = useRemoteCursorStates<TCursorData>()
```

2. 监听`containerRef`的变化，从而触发`requestRerender()`进行重绘
```ts
useOnResize(refreshOnResize ? containerRef : undefined, () => {
  overlayPositionCache.current = new WeakMap()
  requestRerender(refreshOnResize !== 'debounced')
}
```

3. 重绘会触发`requestAnimationFrame()`进行`useReducer()`的计数，从而触发`react`的重绘
```ts
const requestRerender = useRequestRerender()

function useRequestRerender() {
  // 调用 rerender() 会使状态加 1，从而触发组件重渲染
  const [, rerender] = useReducer(s => s + 1, 0)
  const animationFrameIdRef = useRef<number | null>(null)

  const clearAnimationFrame = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = 0
    }
  }
  // 在每次渲染后执行: 处理"组件已渲染但请求仍存在"的情况，可能requestAnimationFrame还没执行就重新渲染
  useEffect(clearAnimationFrame)
  // 初始渲染（上一个已经清除） + 组件卸载时执行
  useEffect(() => clearAnimationFrame, [])
  return useCallback((immediately = false) => {
    if (immediately) {
      rerender()
      return
    }

    if (animationFrameIdRef.current) {
      return
    }

    animationFrameIdRef.current = requestAnimationFrame(rerender)
  }, [])
}
```

4. 重绘会触发所有`cursor`的重新计算，根据`range`变化重新计算，然后赋值给`overlayPositions`这个`react state`
```ts
const [overlayPositions, setOverlayPositions] = useState<Record<string, OverlayPosition>>({})

useLayoutEffect(() => {
  // We have a container ref but the ref is null => container
  // isn't mounted to we can't calculate the selection rects.
  if (containerRef && !containerRef.current) {
    return
  }

  const containerRect = containerRef?.current?.getBoundingClientRect()
  const xOffset = containerRect?.x ?? 0
  const yOffset = containerRect?.y ?? 0

  let overlayPositionsChanged =
    Object.keys(overlayPositions).length !== Object.keys(cursorStates).length

  const updated = Object.fromEntries(
    Object.entries(cursorStates).map(([key, state]) => {
      const range = state.relativeSelection && getCursorRange(editor, state)

      if (!range) {
        return [key, FROZEN_EMPTY_ARRAY]
      }

      const cached = overlayPositionCache.current.get(range)

      if (cached) {
        return [key, cached]
      }

      // 对rang范围发生改变的位置进行重新cursorPos的计算
      // 由于重新计算是一个耗时的操作，因此这里用了缓存处理位置的计算
      const overlayPosition = getOverlayPosition(editor, range, {
        xOffset,
        yOffset,
        shouldGenerateOverlay,
      })

      overlayPositionsChanged = true
      overlayPositionCache.current.set(range, overlayPosition)
      return [key, overlayPosition]
    })
  )

  if (overlayPositionsChanged) {
    setOverlayPositions(updated)
  }
})
```

5. `overlayPositions`的改变会触发`overlayData`的重新计算
```ts
const overlayData = useMemo<CursorOverlayData<TCursorData>[]>(
  () =>
    Object.entries(cursorStates).map(([clientId, state]) => {
      const range = state.relativeSelection && getCursorRange(editor, state)
      const overlayPosition = overlayPositions[clientId]

      return {
        ...state,
        range,
        caretPosition: overlayPosition?.caretPosition ?? null,
        selectionRects: overlayPosition?.selectionRects ?? FROZEN_EMPTY_ARRAY,
      }
    }),
  [cursorStates, editor, overlayPositions]
)
```

6. 最终返回`[overlayData, refresh]`
```ts
const refresh = useCallback(() => {
  overlayPositionCache.current = new WeakMap()
  requestRerender(true)
}, [requestRerender])
```

#### 2.2 getCursorRange()
主要调用`@wangEditor-next/yjs`的`relativeRangeToSlateRange()`进行`range`的转换，然后进行一系列的数据的缓存

```ts
function getCursorRange<
  TCursorData extends Record<string, unknown> = Record<string, unknown>,
>(editor: CursorEditor<TCursorData>, cursorState: CursorState<TCursorData>): BaseRange | null {
  if (!cursorState.relativeSelection) {
    return null
  }

  let cursorStates = CHILDREN_TO_CURSOR_STATE_TO_RANGE.get(editor.children)

  if (!cursorStates) {
    cursorStates = new WeakMap()
    CHILDREN_TO_CURSOR_STATE_TO_RANGE.set(editor.children, cursorStates)
  }

  let range = cursorStates.get(cursorState)

  if (range === undefined) {
    try {
      range = relativeRangeToSlateRange(editor.sharedRoot, editor, cursorState.relativeSelection)

      cursorStates.set(cursorState, range)
    } catch (e) {
      return null
    }
  }

  return range
}
```

### 3. getOverlayPosition()

获取该范围内的所有`node`节点
```ts
const nodeIterator = Editor.nodes(editor, {
  at: range,
  match: (n, p) => Text.isText(n) && (!shouldGenerateOverlay || shouldGenerateOverlay(n, p)),
})
```

遍历所有`nodeIterator`数据，进行位置的计算

```ts
for (const [node, path] of nodeIterator) {
  const domNode = DomEditor.toDOMNode(editor, node)

  const isStartNode = Path.equals(path, start.path)
  const isEndNode = Path.equals(path, end.path)

  let clientRects: DOMRectList | null = null

  if (isStartNode || isEndNode) {
    const nodeRange = document.createRange()

    nodeRange.selectNode(domNode)

    if (isStartNode) {
      nodeRange.setStart(domRange.startContainer, domRange.startOffset)
    }
    if (isEndNode) {
      nodeRange.setEnd(domRange.endContainer, domRange.endOffset)
    }

    clientRects = nodeRange.getClientRects()
  } else {
    clientRects = domNode.getClientRects()
  }

  const isCaret = isBackward ? isStartNode : isEndNode

  for (let i = 0; i < clientRects.length; i += 1) {
    const clientRect = clientRects.item(i)

    if (!clientRect) {
      continue
    }

    const isCaretRect = isCaret && (isBackward ? i === 0 : i === clientRects.length - 1)

    const top = clientRect.top - yOffset
    const left = clientRect.left - xOffset

    if (isCaretRect) {
      caretPosition = {
        height: clientRect.height,
        top,
        left: left + (isBackward || Range.isCollapsed(range) ? 0 : clientRect.width),
      }
    }

    selectionRects.push({
      width: clientRect.width,
      height: clientRect.height,
      top,
      left,
    })
  }
}
```

最终返回当前的选择范围 + `startNode/endNode`的位置
```ts
return {
    selectionRects,
    caretPosition,
}
```


### 4. 模仿 yjs 和 yjs-react 进行 yjs-vue3 的实现

1. 构建相同的目录结构
2. 保持方法以及导出方法的一致性，包括参数名和逻辑
3. 提供一个demo仿造`yjs/examples/frontend`进行示例的验证



### 5. 根据yjs-react再次检查yjs-vue的代码逻辑，并移植到wangEditor-next中

1. 根据yjs-react再次检查yjs-vue的代码逻辑，包括代码和注释
2. 移植yjs-for-wangEditor-vue3到wangEditor-next中，并且使用同样的rollup打包
   - rollup进行打包prod，观看打包过程是否正常，与yjs-react打包出来的产物是否相同
   - 验证开发环境：yjs-vue进行js文件的打包行成，然后在example/frontend-vue3中使用验证
3. 写pr提交说明.md，准备发起pr


#### 5.1 根据yjs-react再次检查yjs-vue的代码逻辑，包括代码和注释

```ts
export { EditorContext, useEditorStatic } from './hooks/use-editor-static'
export {
  CursorOverlayData,
  useRemoteCursorOverlayPositions,
  UseRemoteCursorOverlayPositionsOptions,
} from './hooks/useRemoteCursorOverlayPositions'
export { useRemoteCursorStates, useRemoteCursorStatesSelector } from './hooks/useRemoteCursorStates'
export { getCursorRange } from './utils/getCursorRange'
```

```ts
export type Store<T> = readonly [(onStoreChange: () => void) => () => void, () => T]
```

##### ✅5.1.1 Store没有暴露出去

在`yjs-for-react`中，有这么一个类型声明，但是`yjs-for-vue`中未构建对应的类型

```ts
// packages/yjs-for-react/src/types.ts
export type Store<T> = readonly [(onStoreChange: () => void) => () => void, () => T]

// packages/yjs-for-react/src/hooks/useRemoteCursorStateStore.ts
export type CursorStore<TCursorData extends Record<string, unknown> = Record<string, unknown>> =
  Store<Record<string, CursorState<TCursorData>>>
```

这是为了emit出去React的`[state, setState]`
```ts
const [subscribe, getSnapshot] = useRemoteCursorStateStore<TCursorData>()
```

但是Vue3是不需要emit这种格式，直接emit响应式数据即可，因此这个接口返回的数据类型直接就是`subscribe`，也就是`Record<string, CursorState<TCursorData>>`，而不是`Store<Record<string, CursorState<TCursorData>>`



##### ✅5.1.2 EditorContext和useEditorStatic没有暴露出去

yjs-for-react 使用了 React中的 Context 概念，也就是在底层传入Editor的模式

> 虽然vue3-demo：https://stackblitz.com/edit/vue3-wangeditor-demo-8emmc7?file=src%2FApp.vue
> 
> 没有直接使用useContext的能力（包括React-demo也没有），但是这里作为一个能力，应该保持一致


在`yjs-for-react`的`examples`中
```tsx
<EditorContext.Provider value={editor}>
  <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
    <Toolbar
      editor={editor}
      defaultConfig={toolbarConfig}
      mode="default"
      style={{ borderBottom: '1px solid #ccc' }}
    />
    <RemoteCursorOverlay>
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={innerEditor => setHtml(innerEditor.getHtml())}
        mode="default"
        style={{ height: '500px', innerWidth: '100%', overflowY: 'hidden' }}
      />
    </RemoteCursorOverlay>
  </div>
  <div style={{ marginTop: '15px' }}>{html}</div>
  <div style={{ marginTop: '15px' }}>{editor && JSON.stringify(editor.selection)}</div>
</EditorContext.Provider>
```

> 因为React使用`useContext()`是因为需要嵌套很多层，因此为了不用一只传递`props`，所以才在最外层使用`useContext()`


在Vue3中，我们不需要构建那么多层，是不是可以声明Context能力，但是不在内部使用useContext呢？

```ts
import { defineComponent, inject, type PropType, type ShallowRef, provide } from "vue";
import type { IDomEditor } from "@wangeditor-next/editor";

const EDITOR_CONTEXT_KEY = Symbol("editorContext");

export const useEditorStatic = (): ShallowRef<IDomEditor | null> | null => {
  const editor = inject<ShallowRef<IDomEditor | null> | null>(EDITOR_CONTEXT_KEY, null);
  if (!editor) {
    // 如果外部没有provide(ShallowRef)，则报错
    console.warn(
      "The `useEditorStatic` composable must be used inside the <EditorContextProvider> component's context.",
    );
  }
  return editor;
};

export const EditorContextProvider = defineComponent({
  name: "EditorContextProvider",
  props: {
    editor: {
      type: Object as PropType<ShallowRef<IDomEditor | null>>,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide(EDITOR_CONTEXT_KEY, props.editor);
    return () => slots.default?.();
  },
});
```



##### ✅5.1.3 createRemoteCursorStateStore() -> getCursorStateStore() -> useRemoteCursorStateStore() -> useRemoteCursorStates()

在`yjs-for-react`中，实现的计算方法在`createRemoteCursorStateStore()`中，并且拆分为多个方法，只要是
- `subscribe(onStoreChange)`: 传入`onStoreChange`，在y.js变化的时候，会触发`onStoreChange()` + 将y.js变化的数据存储在changed中 => `onStoreChange()`会触发`getSnapshot()`
- `getSnapshot()`：遍历之前存储的y.js的event事件（也就是`onStoreChange()`时顺便存储的事件），然后重新计算每一个cursor的state数据

> `useSyncExternalStore(subscribe, getSnapshot)` 的工作原理：当subscribe(onStoreChange)传入`onStoreChange()`触发时，会自动触发第二个参数`getSnapshot()`



而在`yjs-for-vue`中，不用经历如此复杂的链路，在`useRemoteCursorStates()`中直接监听Y.js的变化，然后直接改变`cursors`(响应式对象)即可



##### ✅5.1.4 CursorOverlayData & useRemoteCursorOverlayPositions & UseRemoteCursorOverlayPositionsOptions & getCursorRange都有暴露出去


问题1: 其它逻辑基本都统一了，就是`requestRerender()`传递的参数无法统一
```ts
useOnResize(refreshOnResize ? containerRef : undefined, () => {
    overlayPositionCache.current = new WeakMap()
    requestRerender(refreshOnResize !== 'debounced')
})
const refresh = useCallback(() => {
    overlayPositionCache.current = new WeakMap()
    requestRerender(true)
}, [requestRerender])

export function useRequestRerender() {
  const [, rerender] = useReducer(s => s + 1, 0)
  const animationFrameIdRef = useRef<number | null>(null)

  const clearAnimationFrame = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = 0
    }
  }

  useEffect(clearAnimationFrame)
  useEffect(() => clearAnimationFrame, [])

  return useCallback((immediately = false) => {
    if (immediately) {
      rerender()
      return
    }

    if (animationFrameIdRef.current) {
      return
    }

    animationFrameIdRef.current = requestAnimationFrame(rerender)
  }, [])
}
```

Vue3不用这种强制setState的模式来触发重新渲染 => 重新触发cursorPosition的计算



------------------------------

问题2:
1. React 的 useLayoutEffect 是每次 render 后都执行（只要依赖变化），而且 首次 mount 也会执行 => watch(cursors.value, ...) 必须加`immediate: true`才能首次执行
2. 在 React 中，useLayoutEffect 确保 在浏览器 paint 之前同步计算 overlay 位置，避免闪烁 ===> watch(cursors.value, ...) 是 异步的（默认在 nextTick 后执行）

> cursorStates 变化 → 组件 re-render → useLayoutEffect 被调用


跟React的useLayoutEffect相同逻辑，只是Vue不需要重新渲染，只需要监听依赖的数据

我们Vue3中使用`watch()` + `flush: "sync"` + `immediate: "true"` 的模式重写 useLayoutEffect、

当前这里，有一个可能比较疑惑的地方

当容器尺寸变化会触发：
```ts
const observer = new ResizeObserver(() => {
  // 尺寸变化时触发
  computeOverlayPosition(cursors.value);
});
```

当`cursors`数据变化 / `containerRef.value`从null→ DOM / 容器被替换（如 v-if）===> 会触发：
```ts
  watch(
    () => [cursors.value, containerRef?.value],
    () => {
      if (!editorRef.value) return;
      // 重新计算overlayPosition
      computeOverlayPosition(cursors.value);
    },
    {
      immediate: true,
      flush: "sync",
    },
  );
```

而且computeOverlayPosition()有使用缓存overlayPositionCache，即使跟observer.observe(element)重复触发，也不会如何


##### ✅5.1.5 useRemoteCursorStates有暴露出去，但是useRemoteCursorStatesSelector没有暴露出去

```ts
export function useRemoteCursorStates<
  TCursorData extends Record<string, unknown> = Record<string, unknown>,
>() {
  const [subscribe, getSnapshot] = useRemoteCursorStateStore<TCursorData>()

  return useSyncExternalStore(subscribe, getSnapshot)
}

export function useRemoteCursorStatesSelector<
  TCursorData extends Record<string, unknown> = Record<string, unknown>,
  TSelection = unknown,
>(
  selector: (cursors: Record<string, CursorState<TCursorData>>) => TSelection,
  isEqual?: (a: TSelection, b: TSelection) => boolean,
): TSelection {
  const [subscribe, getSnapshot] = useRemoteCursorStateStore<TCursorData>()

  return useSyncExternalStoreWithSelector(subscribe, getSnapshot, null, selector, isEqual)
}
```

`useRemoteCursorStatesSelector`是React支持颗粒度的选择器，支持部分数据变化才触发重新渲染


> 在 Vue 3 中，确实通常不需要像 React 那样显式提供 selector 或封装 store，因为 Vue 的响应式系统天然支持细粒度更新。
> 
> 直接暴露 cursors 响应式引用，让用户自行 computed 或在模板中按需使用，是更符合 Vue 习惯、更简洁且高效的做法。 


因此Vue 3 直接返回`cursors`而不是返回`store=[state, setState]`是合理、简洁且符合框架理念的，不需要强行模仿 React 的 selector 和 store 模式：
✅ 不提供 selector：正确！Vue 的响应式系统自动处理细粒度更新。
✅ 不抽离 store：正确！每个组件独立管理自己的响应式状态是 Vue 的常见模式。

结论：Vue3版本可以不返回useRemoteCursorStatesSelector，因此useRemoteCursorStates不需要跟React一样返回一个store，而是一个cursors即可！


---------------------


#### 5.2 移植yjs-for-vue3到项目中，打包测试 

- 检查dev版本，能否直接开发环境运行进行调试
- 检查prod版本，能否build成为一个js文件，并与目前的打包模式进行对比检查是否有遗漏的地方


打包测试-主要提交
- feat: yjs-for-vue集成到项目中
- fix: yjs-for-vue的typescript相关报错修复
- feat: yjs-for-vue的demo本地客户端运行成功
- feat: yjs-for-vue的demo本地服务器运行成功（使用yarn@4版本）
- fix: 修复因为前面改动导致协同编辑光标失效的问题

> 注意：测试yjs-for-vue记得build，因为我们测试的是js文件

如果不考虑pnpm和yarn的冲突问题，即先使用pnpm打包，然后去掉package.json的`"packageManager": "pnpm@9.15.0"`，然后用yarn运行demo，是可以运行成功的！

##### ✅5.2.1 pnpm和yarn的冲突问题

1. examples/frontend使用yarn
2. 但是其它module使用pnpm进行管理

- 冲突1: 如果examples/frontend都使用pnpm，会导致`y-websocket`一直无法启动成功
- 冲突2: 如果都使用yarn，会破坏目前的工程化结构
- 冲突3: 如果examples/frontend使用yarn，其它使用pnpm，会因为package.json的`"packageManager": "pnpm@9.15.0"`一直报错


###### ✅5.2.1.1 尝试都使用pnpm，解决`y-websocket`的启动问题

`packages/yjs/examples/frontend-vue3`放在`packages/yjs`的`example`

所以`packages/yjs/examples/frontend-vue3`的package.json会提升到`packages/yjs`的`node_modules` 
- 现在之所以无法触发`pnpm exec y-websocket --port 1234 --path /wangeditor-next-yjs`，是因为`packages/yjs`的`package.json`没有这个`y-websocket`的依赖，增加到devDependencies即可

##### ✅5.2.1.2 完善工程化

1. `--ignore-workspace`按照依赖才能阻止当前example使用上层的node_modules，会导致很多依赖问题（比如上层没安装，也就是yjs没安装一些调试依赖）
2. 需要先监听yjs-for-vue的build成为js文件，然后才能启动webSocket服务器 + 本地客户端

```shell
  "scripts": {
    "install-ignore-workspace": "pnpm install --ignore-workspace",
    "yjs-for-vue:watch": "pnpm --dir ../../../yjs-for-vue run dev-watch",
    "dev-client": "vite --force",
    "dev-server": "pnpm exec y-websocket --port 1234 --path /wangeditor-next-yjs",
    "dev:all": "pnpm run dev-server & pnpm run dev-client",
    "eslint-fix": "pnpm exec eslint --fix src/   "
  },
```



##### 5.2.2 界面滚动时，光标没有实时滚动更新的问题
> react版本也没有解决这个问题



#### 5.3 demo功能对比


#### 5.4 写pr提交说明.md，准备发起pr