# babel-plugin-febrest
用来解决一些编译问题。如果项目压缩之后包找不到依赖的错误可能是因为js压缩之后参数名被修改了，可以用这个插件解决。
* [Usage](#usage)
* [Demo](#demo)

## Usage

### Via .babelrc

Without options:
```
{
  "plugins": ["febrest"]
}
```
With options:
```
{
  "plugins": [
    ["febrest", {
     "include":["src/controllers"]
    }]
  ]
}
```
### Via CLI

```
babel --plugins febrest src/controllers
```
### Via Node API
```
require("babel-core").transform("code", {
  plugins: ["febrest"]
});
```

## Demo

test