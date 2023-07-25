# drawImage


## 绘制图片


```js
const x = 0;
const y = 0;
drawImage(image, 
        // 相机视口
        x, y, width, height,
        // 视图（可以理解为物品的缩放以及对应的坐标x和y）
        x1, y1, width1, height1
)
```


## 播放视频

```js
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

let interval = null;
video.addEventListener("play", function () {
    interval = setInterval(()=> {
        ctx.drawImage(video, 0, 0);
    }, 40);
});

video.addEventListener("pause", function () {
    clearInterval(interval);
});
```




## 播放逐帧动画

使用相机视口不停右移，每40ms移动一次，就可以不停播放逐帧动画


## ImageData

像素集合数据，每4个代表一个颜色，也就是一个RGB

```js
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
const image = new Image();
image.src = "....";
image.onload = function() {
    const {width, height} = image;
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    ctx.putImageData(imageData, 
        // 放置的位置x、y
        0, height,
        // 裁剪图片的开始点x、y
        width/2, height/2, // 从中心点开始裁剪
        // 裁剪图片的width和height
        width/2, height/2
    )
}
```

### ImageData-像素置灰

可以遍历ImageData所有的数据，然后使用下面的算法，将颜色变为灰色！

```js
const color = 0.299*r + 0.587*g + 0.114*b;
```

```js
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
const image = new Image();
image.src = "....";
image.onload = function() {
    const {width, height} = image;
    ctx.drawImage(image, 0, 0);
    
    const imageDataObject = ctx.getImageData(0, 0, width, height);
    const imageData = imageDataObject.data;
    
    for(let i=0; i<imageData.length; i=i+4) {
        const [r, g, b] = [imageData[i], imageData[i+1], imageData[i+2]];
        const color = 0.299*r + 0.587*g + 0.114*b;
        imageData[i] = color;
        imageData[i+1] = color;
        imageData[i+2] = color;
    }
    
    ctx.putImageData(imageDataObject, 
        // 放置的位置x、y
        0, height,
        // 裁剪图片的开始点x、y
        width/2, height/2, // 从中心点开始裁剪
        // 裁剪图片的width和height
        width/2, height/2
    )
}
```


### ImageData-马赛克


```js
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
const image = new Image();
image.src = "....";
image.onload = function() {
    const {width, height} = image;
    ctx.drawImage(image, 0, 0);
    
    const imageDataObject = ctx.getImageData(0, 0, width, height);
    const data = imageDataObject.data;
    
    
    ctx.fillRect(0, 0, width, height);
    const size = 15; // 每一个色块的大小，马赛克的一个色块！
    for(let y=0; y<width; y=y+size) {
        for(let x=0; x<width; x=x+size) {
            // 逐行遍历
            const i = (y*width + x) * 4;
            const [r, g, b] = [
                data[i],
                data[i+1],
                data[i+2]
            ]
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            // 绘制一个原点作为马赛克
            ctx.beginPath();
            ctx.arc(x, y, size/2, size/2);
            ctx.fill();
        }
    }
}
```

