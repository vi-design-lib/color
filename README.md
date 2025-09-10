# @vi-design/color

@vi-design/color是使用TypeScript编写的配色方案库，帮助开发者快速创建主题配色方案。

---

## 安装

```shell
# npm
npm install @vi-design/color
# pnpm
pnpm add @vi-design/color
# yarn
yarn add @vi-design/color
```

## 文档

[文档和主题生成器](https://color.visdev.cn/)

## 使用

### 在 [Vitarx](https://vitarx.cn/) 框架中使用

1. 通过插件方式挂载主题：

    ```js
    // main.js
    
    import { theme } from '@vi-design/color/theme/vitarx'; // 正确的包路径
    import { createApp } from 'vitarx'
    import App from './App.js'
    
    const app = createApp('#root').use(theme,{ pirmaryColor:'#1677ff' }).render(App)
    ```

2. 通过es模块直接导出：

    ```jsx
    // 假设在 src/assets/theme.js 中定义 
    
    import { createVitarxTheme } from '@vi-design/color/theme/vitarx';
    
    const theme = createVitarxTheme('#1677ff',{
      customColor:{
        myColor:'#ff5500'
      },
     // ...
    })
    
    export default theme
    
    // ---------------------
    
    // 在组件中使用
    
    import theme from './assets/theme.js'
    
    function App() {
      // 如果主题模式变化，或主题颜色变化，都会自动更新视图
      return <div style={{color:theme.role('primary')}}>Hello World</div>
    }
    ```

### 在 [Vue](https://vuejs.org/) 中使用

在vue中使用的方式和vitarx框架几乎一致，同样也支持es模块方式，在这里就不再赘述。

```js
// main.js

import { theme } from '@vi-design/color/theme/vue'; // 正确的包路径
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App).use(theme, { mainColor: '#1677ff' }).mount('#app')
```

### 在 [UniApp](https://uniapp.dcloud.net.cn/) 中使用

创建和挂载主题：

```vue

<script>
  // App.vue

  // 导入 theme
  import { createUniTheme } from '@vi-design/color/theme/uniapp'; // 正确的包路径

  export default {
    onLaunch() {
      // 在应用启动钩子中创建主题，并将其挂载到 uni.$theme 上
      uni.$theme = createUniTheme('#1677ff');
    }
  }
</script>
```

TypeScript类型支持：

```ts
// 在项目根目录 types.d.ts 中定义如下内容

interface Uni {
  // 如果有自定义主题色，可以传入第二个泛型参数，指定主题色名称的联合类型
  $theme: import('@vi-design/color/theme/uniapp').UniAppTheme<'hex', string>
}
```

在UniApp中有多种全局挂载的方式，上面只例举了常用的一种，可自行尝试其他全局挂载方式。

### 在任意运行在浏览器端的网页应用中使用

1. es 模块方式：

    ```js
    import { createWebTheme } from '@vi-design/color';
    const theme = createWebTheme('#1677ff');
    
    // ❌ 错误做法，主题模式变化时 背景颜色并不会更新
    document.body.style.backgroundColor = theme.role('background');
    
    // ✅ 正确的做法应该
    document.body.style.backgroundColor = theme.cssVar('background') // var(--color-background)
    ```

2. CDN导入方式：

    ```html
       <!DOCTYPE html>
    <html lang="en">
    <head>
      <script src="https://unpkg.com/@vi-design/color/dist/color.umd.js"></script>
    </head>
    <body>
    <script>
      const theme = Color.createWebTheme('#1677ff')
      document.body.style.backgroundColor = theme.cssVar('background')
    </script>
    </body>
    </html>
    ```

### 在CSS中使用主题配色

仅 `VitarxTheme`、`VueTheme` 和 `WebTheme` 支持在CSS中使用主题变量，`UniAppTheme` 不支持此功能！

1. 在html标签中添加 `theme` 属性，指定主题模式：
   ```html
   <!doctype html>
   <html lang="en" theme="dark">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>测试</title>
   </head>
   <body>
   <div id="root"></div>
   </body>
   </html>
   ```
2. 在css文件中使用主题变量：
   ```css
   body {
     background-color: var(--color-background);
     color: var(--color-on-background);
   }
   ```

为了能够在css中有ide智能提示，我们可以在项目下添加一个css文件，但无需挂载到页面，如：

```css
:root {
  --color-background: #f9fafa;
  --color-on-background: #171a1c;
  /*...更多变量*/
}
```

可以前往 [在线工具](https://color.visdev.cn/) 创建一个默认的主题颜色变量文件，并放入项目中。

## 性能优化

1. 在 `Vitarx` 和 `Vue` 中使用时，为了避免首页黑白闪烁，可以在index.html中加入如下脚本：

    ```html
    <!--   这样做是为了避免在首页加载时，由于主题模式初始化导致的样式闪烁。-->
    <script>document.documentElement.setAttribute('theme', localStorage.getItem('_CACHE_THEME_MODE')||(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));</script>
    ```
2. 如果不需要动态切换主题配色方案，建议使用主题css文件 + `WebThemeManger` 进行管理主题

## API参考

以下是主题实例提供的方法和属性：

### mode

主题模式，支持`light`、`dark`和`system`三种模式。

```js
// 获取当前主题模式
const mode = theme.mode

// 设置主题模式
theme.mode = 'dark'
// 或者
theme.setMode('dark')
```

### bright

获取当前主题的亮度，返回`light`或`dark`。

```js
// 获取当前主题亮度
const bright = theme.bright
```

### scheme

获取当前主题的配色方案实例。

```js
// 获取配色方案实例
const scheme = theme.scheme
```

### role

获取角色颜色，如主色、背景色、文本色等。

```js
// 获取主色
const primary = theme.role('primary')
// 获取背景色
const background = theme.role('background')
// 获取文本色
const text = theme.role('text')
```

### tonal

获取色调颜色，色调值范围为1-10。

```js
// 获取主色的色调颜色
const primary5 = theme.tonal('primary', 5)
// 获取自定义颜色的色调
const myColor3 = theme.tonal('myColor', 3)
```

### changeColorScheme

动态切换颜色方案。

```js
// 切换主色
theme.changeColorScheme('#ff5500')

// 切换主色并更新自定义配色
theme.changeColorScheme('#ff5500', {
  myColor: '#00ff55'
})
```

## 主题可选配置

### 通用配置选项

所有主题类型都支持以下基础配置选项：

| 配置项             | 类型                                           | 默认值                    | 描述                                  |
|-----------------|----------------------------------------------|------------------------|-------------------------------------|
| `customColor`   | `Record<string, AnyColor>`                   | `{}`                   | 自定义颜色配置，如果和固有配色方案重名，会覆盖固有配色方案       |
| `outType`       | `'hex' \| 'rgb' \| 'hsl' \| 'RGB' \| 'HSL'`  | `'hex'`                | 输出的颜色格式类型                           |
| `formula`       | `'triadic' \| 'adjacent' \| 'complementary'` | `'triadic'`            | 颜色计算公式，用于生成协调的辅助色                   |
| `angle`         | `number`                                     | -                      | 色相起始角度，用于调整颜色生成的偏移                  |
| `darkRoleRule`  | `DeepPartial<PaletteExtractionColorRules>`   | `Scheme.darkRoleRule`  | 暗色模式调色板取色规则                         |
| `lightRoleRule` | `DeepPartial<PaletteExtractionColorRules>`   | `Scheme.lightRoleRule` | 亮色模式调色板取色规则                         |
| `cacheKey`      | `string`                                     | `'_CACHE_THEME_MODE'`  | 用于在本地存储中保存主题模式的键名                   |
| `refFactory`    | `RefFactory`                                 | `ref`                  | 自定义ref函数，支持`vitarx`和`vue3`框架中的ref函数 |
| `defaultMode`   | `'system'`                                   | `'system'`             | 当未设置主题模式时使用的默认值                     |

### Web主题特有配置

适用于 `WebTheme`、`VueTheme`、`VitarxTheme`：

| 配置项         | 类型                           | 默认值          | 描述                                 |
|-------------|------------------------------|--------------|------------------------------------|
| `varPrefix` | `string`                     | `'--color-'` | CSS变量前缀，生成的变量名会自动转换为`kebab-case`格式 |
| `varSuffix` | `string`                     | `''`         | CSS变量后缀，通常以 `-` 开头                 |
| `attribute` | `string`                     | `'theme'`    | HTML根元素用于记录主题亮度的属性名                |
| `ssr`       | `'light' \| 'dark' \| false` | `false`      | 服务端渲染时的系统主题亮度，false表示不在服务端渲染       |

### 静态主题管理器配置

适用于 `StaticThemeManager`：

| 配置项           | 类型                           | 默认值                   | 描述                  |
|---------------|------------------------------|-----------------------|---------------------|
| `attribute`   | `string`                     | `'theme'`             | HTML根元素用于记录主题亮度的属性名 |
| `cacheKey`    | `string`                     | `'_CACHE_THEME_MODE'` | 缓存主题模式的key          |
| `defaultMode` | `ThemeMode`                  | `'system'`            | 默认主题模式              |
| `refFactory`  | `RefFactory`                 | `ref`                 | ref工厂函数，用于创建响应式数据   |
| `ssr`         | `'light' \| 'dark' \| false` | `false`               | 服务端渲染时的系统主题亮度       |

### 插件配置选项

适用于 Vue 和 Vitarx 插件方式：

| 配置项            | 类型         | 默认值         | 描述               |
|----------------|------------|-------------|------------------|
| `primaryColor` | `AnyColor` | `'#1677ff'` | 主色，作为整个配色方案的基础颜色 |

### 配置示例

```js
// 基础配置
const theme = createWebTheme('#1677ff', {
  customColor: {
    brand: '#ff5500',
    accent: '#00ff55'
  },
  outType: 'hsl',
  formula: 'complementary'
})

// Web主题配置
const webTheme = createWebTheme('#1677ff', {
  varPrefix: '--my-theme-',
  varSuffix: '-color',
  attribute: 'data-theme',
  ssr: 'light'
})

// Vue插件配置
app.use(theme, {
  primaryColor: '#1677ff',
  customColor: {
    success: '#00ff00',
    warning: '#ffaa00'
  },
  varPrefix: '--ui-',
  defaultMode: 'system'
})
```

### 颜色格式说明

`AnyColor` 支持以下颜色格式：

- **十六进制**: `'#1677ff'`、`'#fff'`
- **RGB字符串**: `'rgb(22, 119, 255)'`
- **HSL字符串**: `'hsl(225, 100%, 54%)'`
- **RGB对象**: `{ r: 22, g: 119, b: 255 }`
- **HSL对象**: `{ h: 225, s: 1, l: 0.54 }`

### 配色算法说明

- **triadic**: 三分色，生成120度色相差的协调配色
- **adjacent**: 邻近色，生成相近色相的和谐配色
- **complementary**: 互补色，生成180度色相差的对比配色
