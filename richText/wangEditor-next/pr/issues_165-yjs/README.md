> https://github.com/wangeditor-next/wangEditor-next/issues/165
> 
> 记录了解决这个问题的思路


## yjs-for-vue3

**开发步骤**
- 研究`yjs`和`yjs-react`的实现思路
- 模仿`yjs`和`yjs-react`进行`yjs-vue3`的实现
- 按照其它packages的模式补全`yjs-vue3`相关的说明文档和测试用例

### 研究 yjs 和 yjs-react 的实现思路

主要有
- yjs/examples/frontend: 基础的协同编辑+光标显示协同编辑的demo
- @wangeditor-next/yjs-react: 跟React组件相关的代码部分，包括编辑器部分、根据编辑器获取各种cursor的hooks(部分需要`yjs`提供方法辅助)
- @wangeditor-next/yjs: 集成Y.js+slate.js的相关逻辑，提供给`yjs-react`和`yjs/examples/frontend`使用
> 注：这个仓库并没有使用`yjs-slate`第三方库，而是自己控制`yjs`与`slate`的相关转化，基本逻辑都放在`yjs`文件夹中

#### yjs/examples/frontend

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

#### @wangeditor-next/yjs

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




#### @wangeditor-next/yjs-react

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



### 模仿 yjs 和 yjs-react 进行 yjs-vue3 的实现

1. 构建相同的目录结构
2. 保持方法以及导出方法的一致性，包括参数名和逻辑
3. 提供一个demo仿造`yjs/examples/frontend`进行示例的验证




### 补全 yjs-vue3 相关的说明文档和测试用例