# autoload-modules
這是用來自動載入 node.js 的模組的模組。

# 簡介
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
    promise: 'bluebird',
    through: require('through2')
  }
});

$.async = $.asyncawait.async;
$.await = $.asyncawait.await;
$.gulpUtil.log('Start');
```

# 功能
autoload-modules 會根據一個名稱陣列來猜測模組名稱並將其自動載入。
會進行猜測的名稱最多有四個，依序為：mapping 名稱、屬性名稱、預設的轉換名稱、guessName 提供的轉換名稱。

- mapping 名稱：以範例來說，就是 promise，請參考參數的 mapping 項目的說明。
- 屬性名稱：以範例來說，就是 asyncawait，實際上會載入 asyncawait 模組。
- 預設的轉換名稱：假設屬性名稱為一個駝峰式名稱，並將其轉換為小寫字母與連字號組合成的名稱。以範例來說，就是 gulpUtil，實際上會載入 gulp-util 模組。
- guessName 提供的轉換名稱：請參考參數的 guessName 項目的說明。

# 參數
require('autoload-modules')(options) 會傳回一個 Proxy 的物件實體。
options 是非必填參數，目前提供的選項有以下幾個：

- guessName: 一個字串轉換函數，輸入一個屬性名稱，傳回一個 require 模組的名稱。

- mapping: 一個名稱對應的 Key-Value 物件。
  如果 Value 是一個字串，則會被當作第一順位的猜測名稱。
  如果 Value 是一個函數或物件，則會被直接指定為 Proxy 的屬性 (屬性名稱是 Key)




