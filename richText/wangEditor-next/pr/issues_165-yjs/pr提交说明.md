related [issues/165-功能：多人协同插件支持](https://github.com/wangeditor-next/wangEditor-next/issues/165)

## yjs-for-vue功能对齐


### use-editor-static.ts

类似`yjs-for-react`的`use-editor-static.ts`，支持useContext的传入

在vue3中，`provide/inject`更加是解决一种父子props的多层传递问题，跟react类似useReducer还是有所区别

除了useContext，也可以直接传入props: editorRef相关响应式数据


```ts
// 内部通过useEditorStatic()也就是inject()获取editorRef
export function useRemoteCursorOverlayPositions<
  TCursorData extends Record<string, unknown>,
  TContainer extends HTMLElement = HTMLDivElement,
>({
  containerRef,
  shouldGenerateOverlay,
  editorRef,
  ...opts
}: UseRemoteCursorOverlayPositionsOptions<TContainer>) {
 
  // 只有完全未传 editorRef 时，才从 context 获取
  // undefined == null 或者 null == null 都为true
  if (editorRef == null) {
    editorRef = useEditorStatic()
  }
  ...
}

// 外部provide设置editorRef
const editorRef = shallowRef()
provideEditor(editorRef)

```


### useRemoteCursorStates.ts

监听`@wangeditor-next/yjs/CursorEditor`的`change`，然后触发` CursorEditor.cursorState`获取对应的`cursor`数据

```ts
CursorEditor.on(toRaw(newEditor) as CursorEditor & IDomEditor, 'change', changeHandler)

const updateCursor = (clientId: number) => {
    const editor = toRaw(editorRef.value) as CursorEditor & IDomEditor

    if (!editor) { return }
    const state = CursorEditor.cursorState(editor, clientId)

    if (state === null) {
        delete cursors.value[clientId.toString()]
        return
    }
    cursors.value[clientId.toString()] = state as CursorState<TCursorData>
}
const changeHandler = (event: CursorStateChangeEvent) => {
    event.added.forEach((clientId: number) => {
        updateCursor(clientId)
    })
    event.removed.forEach((clientId: number) => {
        updateCursor(clientId)
    })
    event.updated.forEach((clientId: number) => {
        updateCursor(clientId)
    })
}
```



### useRemoteCursorOverlayPositions.ts

主要分为：
> useRemoteCursorStates.ts监控Yjs的cursor变化
1. 初始化完成 + cursor变化时，触发重新计算`computeOverlayPosition()`
----------
> 界面变化导致需要强制重新计算cursor位置
2. 使用`observer.observe(element)`监听containerRef的尺寸变化，触发`computeOverlayPosition()`
3. 监听editor滚动，触发cursors的重新计算`computeOverlayPosition()`
----------
> 根据cursor计算overlayPositions
1. 根据cursors使用`computeOverlayPosition()`计算`overlayPositions`
2. 根据`cursors`和`overlayPositions`计算`overlayData`暴露给外部使用
----------


主要逻辑还是在`computeOverlayPosition()`中，跟`yjs-for-react`的计算基本保持一致，都是通过
- `getCursorRange(editor, state)`计算出range
- 根据`range`和`containerRef`触发`getOverlayPosition()`计算出`overlayPosition`

> `getCursorRange()`和`getOverlayPosition()`跟`yjs-for-react`相关方法逻辑是一模一样的

```ts
const computeOverlayPosition = (newCursorsValue: Record<string, CursorState<TCursorData>>) => {
    if (!editorRef.value) { return }
    // 监听containerRef.value挂载再触发一次computeOverlayPosition()
    // if (containerRef && !containerRef.value) {
    //   return;
    // }
    // 跟React版本一致，支持【containerRef.value】为空，代表还没初始化完成dom
    const containerRect = containerRef?.value?.getBoundingClientRect()
    const xOffset = containerRect?.x ?? 0
    const yOffset = containerRect?.y ?? 0

    const editor = toRaw(editorRef.value!) as CursorEditor & IDomEditor

    let overlayPositionsChanged = Object.keys(overlayPositions.value).length !== Object.keys(newCursorsValue).length
    // 每次都更新位置
    const newOverlayPositions = Object.fromEntries(
        Object.entries(newCursorsValue).map(([key, state]) => {
        const range: SlateRange | null = state.relativeSelection && getCursorRange(editor, state)

        if (!range) {
            return [key, FROZEN_EMPTY_ARRAY]
        }

        if (overlayPositionCache.get(range)) {
            return [key, overlayPositionCache.get(range)]
        }

        const overlayPosition = getOverlayPosition(editor, range, {
            xOffset,
            yOffset,
            shouldGenerateOverlay,
        })

        overlayPositionCache.set(range, overlayPosition)
        overlayPositionsChanged = true

        return [key, overlayPosition]
        }),
    )

    if (overlayPositionsChanged) {
        overlayPositions.value = newOverlayPositions
    }
}
```


## demo-演示视频

https://github.com/user-attachments/assets/d9d4c057-48e7-4afd-9151-8ab051e0c28f