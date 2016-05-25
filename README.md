# autoload-modules

# 說明

- 這是用來自動載入 node.js 的模組的模組。
- 使用 ES6 的 Proxy 來 Lazy Load 模組。
- 提供預先指定模組載入
- 可指定一個名稱轉換的 callback 函數來猜測模組的名稱

# 執行需求
- node.js 版本 6.0.0 以上

# 安裝
```Shell
npm install autoload-modules --save
```
# 範例
```JavaScript
let $ = require('autoload-modules')({
  guessName: function(name) {
    return 'gulp-' + name;
  },
  mapping: {
    'promise': 'bluebird',
    'gutil': require('gulp-util')
  }
});

$.async = $.asyncawait.async;
$.await = $.asyncawait.await;
```




