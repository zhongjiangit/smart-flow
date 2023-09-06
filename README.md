# 背景介绍

# 项目介绍

# 查看示例

# 使用说明

# License

# 联系

# 贡献者/鸣谢

执行 npm run test 进行测试

执行 npm run test:c 查看测试覆盖率

yalc publish

yalc update
// or
yalc update [name]

yalc remove [name]
// or
yalc remove --all

1、esm: ES Modules, ECMAScript标准中定义的模块规范。适用于现代浏览器和Node.js环境下支持ES6及以上版本的js引擎
2、cjs: CommonJS 通用模块规范。适用于Node.js环境下支持ES6以上的js引擎
3、amd: 异步模块定义。适用于浏览器端的模块加载器（如RequireJS）（引入方式require(['path/to/my-library.amd.js'], function() {// 在回调中访问myLibrary对象，并调用其中的方法或属性})）
4、iife: 立即执行函数表达式。将代码包装再一个匿名函数内，并立即调用该函数以创建闭包作用域，避免全局变量污染（使用script标签引入）
5、umd: 通用模块定义。既可以再浏览器端使用AMD或者CommonJS方式加载，在node环境下也能够正常运行（使用script标签引入，也可以在node中使用require引入）
6、system: System.register()格式是SystemJS库实现的一种格式（可以使用script标签引入，也可以使用如3中的方式引入）

// 单个
// cjs 是 Node 中的模块规范// main一般配置cjs或者js
"main": "./lib/index.cjs.js",
// module字段指定esm格式打包后的入口文件路径
"module": "./lib/index.esm.js",
// ts需要配置此字段才能找到ts类型
"types": "./lib/index.d.ts",

"dev": "cross-env NODE_ENV=dev rollup -c -w",
"build": "rimraf lib && cross-env NODE_ENV=production rollup -c",

// 多个
"main": "dist/sumfunctionmethods.umd.min.js",
"module": "dist/sumfunctionmethods.esm.js",
"unpkg": "dist/sumfunctionmethods.js",
"jsdelivr": "dist/sumfunctionmethodsjs",

"dev": "rollup -w --environment NODE_ENV:development -c scripts/rollup.config.dev.js",
"build": "rollup --environment NODE_ENV:development -c scripts/rollup.config.prod.js",
