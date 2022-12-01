# ChessInvert

#### 介绍
中国象棋翻翻棋,休闲,对战,娱乐,小游戏,在线


#### 效果预览

![效果预览](https://github.com/lvbee/ChessInvert/blob/d7eda12e1df333a79c5f4ffdcb8f7941adeb23fe/index.jpg)

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


#### 更多

[原创]源码-更多地址
<a href="https://github.com/lvbee/ChessInvert" target="_blank">Github仓库</a>
、
<a href="https://gitee.com/lvbee/ChessInvert" target="_blank">Gitee仓库</a>
、
<a href="https://www.jq22.com/jquery-info24485" target="_blank">效果预览</a>


