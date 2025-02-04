# @vi-design/color
@vi-design/color是由TS编写的配色方案库，帮助开发者快速创建主题配色方案。
___________________________________________________________________

## 安装
```shell
npm install @vi-design/color
```

## 使用

```ts
import { createTheme,logColorsWithLabels } from 'visdev-color';

const theme = createTheme('#1376e7')
logColorsWithLabels(theme.light) 
logColorsWithLabels(theme.dark)
// 从调色板中获取颜色0-100
theme.palettes.primary.get(10)
// 从调色板中获取所有颜色
theme.palettes.primary.all()
// 主色
theme.light.primary
// 主色之上的文本颜色
theme.light.onPrimary
// 主色容器
theme.light.primaryContainer
// 主色容器之上的文本颜色
theme.light.onPrimaryContainer
```
