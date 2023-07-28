# canvas

## docs

### 基础总结
基础知识、优化知识总结

```shell
npn install 
npm run docs:dev
```

### Canvas性能优化总结
有以下几个方向：
- 减少画布区域：可以通过设置画布的宽高来减小画布区域，从而减少需要绘制的像素点数量，提高性能。

- 减少绘制次数：可以通过合并多个绘制操作为一个绘制操作来减少绘制次数，从而提高性能。比如，可以使用离屏 canvas 来合并多个绘制操作。

- 减少重绘区域：可以通过局部重绘的方式，只重绘发生变化的区域，从而减少重绘区域，提高性能。

- 尽量使用 CSS3 动画代替 Canvas 绘制：CSS3 动画使用了 GPU 加速，比 Canvas 绘制更高效。因此，如果可以使用 CSS3 动画来实现相同的效果，尽量使用 CSS3 动画。

- 使用缓存：可以使用缓存技术来缓存已经绘制的图像，从而减少重复绘制。比如，可以使用 createImageBitmap 方法将 canvas 的某个区域缓存起来，下次绘制时，只需要使用 drawImage 方法将缓存的图像绘制到 canvas 上即可。

- 避免频繁的数据操作：如果需要对 canvas 的数据进行频繁的操作，可以使用 TypedArray 来代替数组，从而提高性能。

- 合理使用 requestAnimationFrame 方法：requestAnimationFrame 方法可以使动画更加流畅，但是如果使用不当，会影响性能。因此，需要合理使用 requestAnimationFrame 方法，避免过度调用。

## demo

小型demo

```shell
npm i -g live-server
```

在当前项目中使用命令，就可以启动本地服务器
```shell
live-server 
```

## mini-project

使用`canvas`实现的小型应用

### 使用`canvas`实现富文本编辑器

