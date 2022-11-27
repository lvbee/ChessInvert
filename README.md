# ChessInvert

#### 介绍
中国象棋翻翻棋,休闲,对战,娱乐,小游戏,在线


#### 效果预览

![输入图片说明](/assets/index.jpg)

#### 使用说明

1.  引入jQuery，及js、css文件
2.  写html

```html
<div class="content">
    <div data-chess></div>
    <div>
        <button type="button" class="start">开始游戏</button>
    </div>
</div>
```

3.  注册插件
```js
$(function(){
    var $btn = $('.start');

    var myCNChessInvert = new CNChessInvert('[data-chess]', $btn, true);
    myCNChessInvert.restart();
    $btn.click(function() {
        myCNChessInvert.restart();
    });
});
```


