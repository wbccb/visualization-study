> https://github.com/wangeditor-next/wangEditor-next/issues/541
>
> 记录了解决这个问题的思路

# Bug: 设置dangerouslyInsertHtml底部会多出空白行

当设置这样的数据时，会导致真实界面的数据渲染为：`<p><a href="" target="">222</a></p><p>更新</p><p><br></p>`，增加一行`<br>`
```ts
window.editor.dangerouslyInsertHtml("<p><a>222</a></p><p>更新</p>")
```

多次触发`window.editor.dangerouslyInsertHtml("<p><a>222</a></p><p>更新</p>")`都会增加一行`<br>`

比如触发三次后，界面会变为`<p>2222</p><p><a href="" target="">222</a></p><p>更新</p><p><a href="" target="">222</a></p><p>更新</p><p><a href="" target="">222</a></p><p>更新</p><p><br></p><p><br></p><p><br></p>`

> 后面有3个`<p><br></p>`

