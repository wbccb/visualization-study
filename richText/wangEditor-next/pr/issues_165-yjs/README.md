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

### @wangeditor-next/yjs

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




### @wangeditor-next/yjs-react
                                                                                                                                                                                                                                                                                      
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

#### useRemoteCursorOverlayPositions()

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

#### getCursorRange()
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

### getOverlayPosition()

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


### 模仿 yjs 和 yjs-react 进行 yjs-vue3 的实现

1. 构建相同的目录结构
2. 保持方法以及导出方法的一致性，包括参数名和逻辑
3. 提供一个demo仿造`yjs/examples/frontend`进行示例的验证




### 补全 yjs-vue3 相关的说明文档和测试用例