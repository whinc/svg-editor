# SVG 技术分享

whincwu 


## 0. 主要内容

* SVG 简介
* SVG 如何实现可缩放
* SVG 绘图能力
* 探索更多 SVG 能力


## 1. SVG 简介

SVG是"Scalable Vector Graphics"的简称。中文可以理解成“可缩放矢量图形”。

SVG 是 W3C 的一个开放标准，用于描述二位矢量图形的图像格式。

2003.01.14 被列为 W3C 推荐标准，最新版本是 2011.08.16 发布的 SVG 1.1 版本，SVG 2.0 版本处于标准制定中。

### 1.1 光栅图 VS 矢量图

* 光栅图（位图、点阵图、像素图）：存储的是每个**像素数据**，缩放时通过一定算法来弥补新增或多出的空白区域，导致图形失真。
* 矢量图：存储的是**绘图指令**，无论图像如何缩放，都可以保持不失真。

### 1.2 与其他图像格式比较的优势

* SVG 是纯 XML 的，可被任何文本编辑器读写
* SVG 与JPEG和GIF图像比起来，尺寸更小，且可压缩性更强。
* SVG 可任意伸缩且不失真的
* SVG 图像可在任何的分辨率下被高质量地打印
* SVG 图像中的文本是可选的，同时也是可搜索的（很适合制作地图）
* SVG 是开放的标准
* SVG 可与 DOM 交互
* more...

### 浏览器支持情况

SVG 在桌面端 IE9+/Chrome/Firefox/Safari 支持，在移动端 Android 3.0+ 和 IOS 3.2+ 支持，详细参考[这里](http://caniuse.com/#feat=svg)。

<!--<iframe src="http://caniuse.com/#feat=svg" width="100%" height="400px"></iframe>-->


### 使用 SVG

作为图形文件使用:

```html
<img src="http://domain/path/to/xxx.svg"/>

div {
    background: url('http://domain/path/to/xxx.svg') no-repeat center;
    background-size : 200px 200px;
}

<iframe src="http://domain/path/to/xxx.svg" width="200" height="200" ></iframe>


// 或者 浏览器直接加载 SVG 文件
```

作为 DOM 使用：

```
<svg width="100" height="100">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>
```

<svg width="100" height="100">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>

与其他 DOM 一起使用

```html
<div style="position:relative; width: 200px; height:100px; background-color:red">
    <svg width="100" height="100" style="position: absolute; left:0;right:0;top:0;bottom:0; margin: auto">
        <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
    </svg>
</div>
```

<div style="position:relative; width: 200px; height:100px; background-color:#007acc">
    <svg width="100" height="100" style="position: absolute; left:0;right:0;top:0;bottom:0; margin: auto">
        <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
    </svg>
</div>


## 2. SVG 如何实现可缩放

SVG 区分绘图时坐标与实际显示的坐标，绘图时是在 viewBox 坐标中，最终显示是在 viewport 坐标中，浏览器的 SVG 实现会处理好 viewBox 到 viewport 坐标的映射，从而实现缩放。

## viewport 坐标

```
<svg width="100" height="100">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>
```

<svg width="100" height="100" style="border: 1px dashed red">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>

```
<svg width="50" height="50">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>
```

<svg width="50" height="50" style="border: 1px dashed red">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>

## viewBox 坐标


```
<svg width="50" height="50" viewBox="0, 0, 100, 100">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>

<svg width="150" height="150" viewBox="0, 0, 100, 100">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>
```

<svg width="50" height="50" viewBox="0, 0, 100, 100"  style="border: 1px dashed red">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>
<br/>
<svg width="150" height="150" viewBox="0, 0, 100, 100"  style="border: 1px dashed red">
    <circle cx="50" cy="50" r="50" fill="yellowgreen"></circle>
</svg>

拿放映机打比方，viewBox 可以看作是在胶片上作画，viewport 是胶片上图像最终投影出来的结果。

<img src="http://photo.zhangxinxu.com/gif/2014-08-27_105046-viewbox.gif" alt="">


## SVG 绘图能力

* `<rect>`
* `<circle>`
* `<ellipse>`
* `<line>`
* `<polyline>`
* `<polygon>`
* `<path>`

```
<svg viewbox="0 0 300 300" width="100" height="100">
    <polygon points="100,150 150,63.4 200,150" style="fill:none; stroke:red"></polygon>
    <polyline points="50,50 50,100 125, 100" style="fill:none;stroke:yellowgreen"></polyline>
    <polyline points="250,50 250,100 175, 100" style="fill:none;stroke:yellowgreen"></polyline>
    <rect x="100" y="150" width="100" height="50" style="fill:none; stroke:yellow"></rect>
    <ellipse cx="50" cy="175" rx="50" ry="25" style="fill:none; stroke:red"></ellipse>
    <ellipse cx="250" cy="175" rx="50" ry="25" style="fill:none; stroke:red"></ellipse>
    <circle cx="150" cy="250" r="50" style="fill:none; stroke:cyan"></circle>
<svg>
```

<svg viewbox="0 0 300 300" width="200" height="200" >
    <polygon points="100,150 150,63.4 200,150" style="fill:none; stroke:red"></polygon>
    <polyline points="50,50 50,100 125, 100" style="fill:none;stroke:yellowgreen"></polyline>
    <polyline points="250,50 250,100 175, 100" style="fill:none;stroke:yellowgreen"></polyline>
    <rect x="100" y="150" width="100" height="50" style="fill:none; stroke:yellow"></rect>
    <ellipse cx="50" cy="175" rx="50" ry="25" style="fill:none; stroke:red"></ellipse>
    <ellipse cx="250" cy="175" rx="50" ry="25" style="fill:none; stroke:red"></ellipse>
    <circle cx="150" cy="250" r="50" style="fill:none; stroke:cyan"></circle>
<svg>


* `<text>`

```
<svg height="90" width="200">
  <text x="10" y="20" style="fill:yellowgreen; font-size:16">Hello everyone!</text>
</svg>
```

<svg height="90" width="200">
  <text x="10" y="20" style="fill:yellowgreen; font-size:16">Hello everyone!</text>
</svg>


## 探索更多 SVG 能力

* 使用 SVG 实现 Loading 效果

```
<svg width="100" height="100" viewBox="0 0 440 440">
    <circle cx="220" cy="220" r="170" stroke-width="50" stroke="#D1D3D7" fill="none"></circle>
    <circle cx="220" cy="220" r="170" stroke-width="50" stroke="#00A5E0" fill="none" transform="matrix(0,-1,1,0,0,440)" stroke-dasharray="800 1069"></circle>
</svg>
```
<svg width="100" height="100" viewBox="0 0 440 440">
    <circle cx="220" cy="220" r="170" stroke-width="50" stroke="#D1D3D7" fill="none"></circle>
    <circle cx="220" cy="220" r="170" stroke-width="50" stroke="#00A5E0" fill="none" transform="matrix(0,-1,1,0,0,440)" stroke-dasharray="800 1069"></circle>
</svg>


* 使用 SVG 路径动画

```
<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">
  <g> 
    <text font-family="microsoft yahei" font-size="40" y="160" x="160" fill="yellowgreen">WeBank</text>
    <animateTransform attributeName="transform" begin="0s" dur="10s" type="rotate" from="0 160 160" to="360 160 160" repeatCount="indefinite"/>
  </g>
</svg>
```

<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">
  <g> 
    <text font-family="microsoft yahei" font-size="40" y="160" x="160" fill="yellowgreen">WeBank</text>
    <animateTransform attributeName="transform" begin="0s" dur="10s" type="rotate" from="0 160 160" to="360 160 160" repeatCount="indefinite"/>
  </g>
</svg>

```
<svg width="360" height="200" xmlns="http://www.w3.org/2000/svg">
  <text font-family="microsoft yahei" font-size="30" x="0" y="0" fill="yellowgreen">WeBank
    <animateMotion path="M10,80 q100,120 120,20 q140,-50 160,0" begin="0s" dur="3s" repeatCount="indefinite"/>
  </text>
  <path d="M10,80 q100,120 120,20 q140,-50 160,0" stroke="#cd0000" stroke-width="2" fill="none" />
</svg>
```

<svg width="360" height="200" xmlns="http://www.w3.org/2000/svg">
  <text font-family="microsoft yahei" font-size="30" x="0" y="0" fill="yellowgreen">WeBank
    <animateMotion path="M10,80 q100,120 120,20 q140,-50 160,0" begin="0s" dur="3s" repeatCount="indefinite"/>
  </text>
  <path d="M10,80 q100,120 120,20 q140,-50 160,0" stroke="#cd0000" stroke-width="2" fill="none" />
</svg>

* more...

## 参考

* [SVG Tutorial| w3schools](http://www.w3schools.com/graphics/svg_intro.asp)
* [Scalable Vector Graphics (SVG) 1.1 | W3C](https://www.w3.org/TR/SVG11/)
* [SVG | MDN](https://developer.mozilla.org/en-US/docs/Web/SVG)
* [理解SVG viewport,viewBox,preserveAspectRatio缩放](http://www.zhangxinxu.com/wordpress/2014/08/svg-viewport-viewbox-preserveaspectratio/)