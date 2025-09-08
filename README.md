# @vi-design/color

@vi-design/color是使用TypeScript编写的配色方案库，帮助开发者快速创建主题配色方案。

---

## 安装
```shell
npm install @vi-design/color
```

或者使用yarn：

```shell
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
    
    const app = createApp('#root').use(theme,{ mainColor:'#1677ff' }).render(App)
    ```

2. 通过es模块直接导出：

    ```jsx
    // 假设在 src/assets/theme.js 中定义 
    
    import { createVitarxTheme } from '@vi-design/color/theme/vitarx';
    
    const theme = createVitarxTheme('#1677ff',{
      myColor:'#ff5500'
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

const app = createApp(App).use(theme,{ mainColor:'#1677ff' }).mount('#app')
```

### 在 [UniApp](https://uniapp.dcloud.net.cn/) 中使用

创建和挂载主题：

```vue
<script>
  // App.vue
  
  // 导入 theme
  import { createUniTheme } from '@vi-design/color/theme/uniapp'; // 正确的包路径
  
  export default {
    onLaunch(){
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

```css
body{
  background-color: var(--color-background);
  color: var(--color-on-background);
}
```

为了能够在css中有智能提示，我们应该在项目下添加一个默认的主题变量文件，如：

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

