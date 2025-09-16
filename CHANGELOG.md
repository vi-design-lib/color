# [2.1.0-alpha.5](https://gitee.com/vi-design/color/compare/v2.1.0-alpha.4...v2.1.0-alpha.5) (2025-09-16)


### Bug Fixes

* **theme:** 优化 getCacheThemeMode 方法以增强代码健壮性 ([2b093ac](https://gitee.com/vi-design/color/commits/2b093ac73d460a008a030896f47e655db95379c5))
* **theme:** 重构 WebTheme.createStyleSheet 方法，兼容移动端低版本浏览器 ([f5752ad](https://gitee.com/vi-design/color/commits/f5752ada74eccb479db6b0c08f89a9db16ff024b))


### Features

* **constant:** 添加版本号并更新全局声明 ([0f8660d](https://gitee.com/vi-design/color/commits/0f8660d0946ace90e2ba17b1d6c91494cdc21de1))
* **scheme:** 添加控件状态颜色支持 ([7901def](https://gitee.com/vi-design/color/commits/7901deff4886292e5cd445008d33ff091f906fed))
* **theme:** 优化主题管理并添加配色方案缓存功能 ([660d547](https://gitee.com/vi-design/color/commits/660d547547a654c3d0a04e802f616a124567876e))
* **theme:** 添加 toggleBright 方法实现亮色/暗色模式切换 ([d71a214](https://gitee.com/vi-design/color/commits/d71a21445bd3c71982fe898a5da745df6a6dd25b))



# [2.1.0-alpha.3](https://gitee.com/vi-design/color/compare/v2.1.0-alpha.2...v2.1.0-alpha.3) (2025-09-13)


### Features

* **example:** 添加 CSS 变量生成示例 ([21b1ae9](https://gitee.com/vi-design/color/commits/21b1ae9d0399e415f74d06751b0a8ad6281b5bda))
* **palette:** 优化色彩阶生成逻辑 ([55c9202](https://gitee.com/vi-design/color/commits/55c9202f203fb42f0e9cbc5f6cd6bab17d4259db))
* **scheme:** 调整暗色模式主色和强调色 ([b521119](https://gitee.com/vi-design/color/commits/b521119daf11acc5a108dc243a7da6c98c6f1d03))



# [2.1.0-alpha.2](https://gitee.com/vi-design/color/compare/v2.1.0-alpha.1...v2.1.0-alpha.2) (2025-09-13)



# [2.1.0-alpha.1](https://gitee.com/vi-design/color/compare/v2.1.0-alpha.0...v2.1.0-alpha.1) (2025-09-11)



# [2.1.0-alpha.0](https://gitee.com/vi-design/color/compare/v2.0.0-beta.9...v2.1.0-alpha.0) (2025-09-11)


### Features

* **conversion:** 添加任意颜色转 ARGB 功能 ([bf385f8](https://gitee.com/vi-design/color/commits/bf385f871ec21816ab32c7724e0094cfe1d07faa))
* **image-utils:** 为 colorFromImageElement 和 colorFromImage 函数添加默认颜色参数 ([a195503](https://gitee.com/vi-design/color/commits/a19550398e934b79ef23f544484d31014afdf878)), closes [#1677](https://gitee.com/vi-design/color/issues/1677) [#1677](https://gitee.com/vi-design/color/issues/1677)
* **theme:** 优化 UniApp 主题类并添加颜色提取功能 ([232ea75](https://gitee.com/vi-design/color/commits/232ea758fc76f89f415e7ad3435284f0f47d999b))
* **utils:** 扩展 rgbColorToObj 函数以支持 RGBA格式 ([671bfc0](https://gitee.com/vi-design/color/commits/671bfc0dddfa48e4fd3493363e036e5a0e48bb34))



# [2.0.0-beta.9](https://gitee.com/vi-design/color/compare/v2.0.0-beta.8...v2.0.0-beta.9) (2025-09-10)


### Features

* **scheme:** 为颜色角色添加 RGB 值 ([551e3c4](https://gitee.com/vi-design/color/commits/551e3c4847e93143cf2b718af18e4d2df1cf9211))



# [2.0.0-beta.8](https://gitee.com/vi-design/color/compare/v2.0.0-beta.7...v2.0.0-beta.8) (2025-09-10)


### Features

* **example:** 添加智能对比度调整算法示例 ([b3a46c9](https://gitee.com/vi-design/color/commits/b3a46c9adf768c558c2490b77dffb2f0a653a9ad))
* **utils:** 智能调整颜色对比度以满足WCAG标准 ([e9152fc](https://gitee.com/vi-design/color/commits/e9152fcfb05e8bbb7acb2cefbb6af42811e17dcb))



# [2.0.0-beta.7](https://gitee.com/vi-design/color/compare/v2.0.0-beta.6...v2.0.0-beta.7) (2025-09-10)


### Bug Fixes

* **theme:** 修复服务端判断错误BUG ([6facf36](https://gitee.com/vi-design/color/commits/6facf36d74795ff48dea51fa550dcbe7f505f5ad))



# [2.0.0-beta.6](https://gitee.com/vi-design/color/compare/v2.0.0-beta.5...v2.0.0-beta.6) (2025-09-10)


### Bug Fixes

* **theme:** 修复 Vitarx 主题插件报错 ([4293d39](https://gitee.com/vi-design/color/commits/4293d3942353aae8fa0230eb29b8056641ced92b))



# [2.0.0-beta.5](https://gitee.com/vi-design/color/compare/v1.0.0...v2.0.0-beta.5) (2025-09-08)


### Bug Fixes

* **theme:** 优化主题模式切换逻辑 ([c3cbaaa](https://gitee.com/vi-design/color/commits/c3cbaaae6f8a7ee22b4245294e1b45ed73a41642))
* **theme:** 修复 SSR 模式下系统主题选择逻辑 ([1718a2c](https://gitee.com/vi-design/color/commits/1718a2c1c37f468c8cec3111b358f94d476eaed3))
* **theme:** 修复主题设置和缓存相关问题 ([d56d684](https://gitee.com/vi-design/color/commits/d56d6843b5d2d517c99faab4f6712897481fa249))
* **theme:** 修复色调颜色获取逻辑并增加参数校验 ([6432049](https://gitee.com/vi-design/color/commits/643204955315a66ff0b0c348d4acdc91a6671c45))


### Features

* **image-utils:** 优化图片取色算法 ([b8859f4](https://gitee.com/vi-design/color/commits/b8859f41ca5fcba2536a146af0907dc26d3d4107))
* **image-utils:** 重构 colorFromImageElement 函数 ([2108841](https://gitee.com/vi-design/color/commits/210884120319f153076f50e490a51c30f3aba263))
* **scheme:** 优化 createScheme 函数参数设计 ([22e9d45](https://gitee.com/vi-design/color/commits/22e9d457b96cd1b78c26386cf48e1a53e11dd5b2))
* **scheme:** 优化色彩生成算法以避免功能色冲突 ([7888511](https://gitee.com/vi-design/color/commits/7888511687a85c03c4ebc6bfe3d16615156f1aca))
* **scheme:** 增强颜色方案生成逻辑 ([d99bcb0](https://gitee.com/vi-design/color/commits/d99bcb022997e4a21f5771c0b9cf4061e4dbcc82))
* **scheme:** 支持自定义配色规则 ([939d878](https://gitee.com/vi-design/color/commits/939d8780de79606d3b710db58233f6034d6d3571))
* **scheme:** 添加 scrim颜色属性 ([ef283ef](https://gitee.com/vi-design/color/commits/ef283ef8f1c7a68966ab933b32d35bc53bd67373))
* **theme:** 优化 Theme 构造函数文档注释 ([8d8505a](https://gitee.com/vi-design/color/commits/8d8505a4cce9203e2606c33018f35d7617c33d16))
* **theme:** 优化 Vue 主题配置并添加主题创建函数 ([713ed20](https://gitee.com/vi-design/color/commits/713ed200f8dcfcdc850f08d173074666db196945))
* **theme:** 优化主题功能以适配非浏览器环境 ([4a72e6f](https://gitee.com/vi-design/color/commits/4a72e6f124f5e808cec377d4004363064c8789fc))
* **theme:** 创建 createUniTheme函数并优化 UniAppThemeOptions 类型定义 ([e32b4d0](https://gitee.com/vi-design/color/commits/e32b4d0afa1a5f12b2a4585a1649e10fa23991e4))
* **theme:** 创建基础主题管理类 ([b5a437d](https://gitee.com/vi-design/color/commits/b5a437de44cfc73d89dd0b2a4c1264af23c710b8))
* **theme:** 增加 CSS 变量前缀和后缀设置 ([baf6748](https://gitee.com/vi-design/color/commits/baf6748ca0841b87c1a621be3db9e81adbe703c0))
* **theme:** 增加 UniAppTheme 单例属性并优化文档注释 ([7d15f0c](https://gitee.com/vi-design/color/commits/7d15f0c44688e054633a7e53d8eb367ce9801acb))
* **theme:** 增加服务端渲染支持 ([6f1d9fd](https://gitee.com/vi-design/color/commits/6f1d9fd5f0356af443139c58b925bdf11df7f106))
* **theme:** 增加配色算法和色相偏移角度选项 ([09fc046](https://gitee.com/vi-design/color/commits/09fc0460ea6aefc3db5037dedaa6ef3fc8e5975d))
* **theme:** 添加 createVitarxTheme 函数并优化类型定义 ([1445b21](https://gitee.com/vi-design/color/commits/1445b21257a6d0b1b2dfa68728f3f1f4ab396660))
* **theme:** 添加 ref 函数和相关类型定义 ([fec8b3c](https://gitee.com/vi-design/color/commits/fec8b3c61bbe2210f44ed0d77ab802c8a3c959c9))
* **theme:** 添加 setBright 方法并优化 mode 属性注释 ([fbffdf1](https://gitee.com/vi-design/color/commits/fbffdf10e414ad8c89db2f89e43033030a045c91))
* **theme:** 添加 uni-app 主题支持 ([6ab2d23](https://gitee.com/vi-design/color/commits/6ab2d23cbd6807a8e7a28f49205e7595dc6cb5b9))
* **theme:** 添加 Vitarx框架主题插件 ([2cc314a](https://gitee.com/vi-design/color/commits/2cc314a8f6336f62c0a3310c7c4b89f612930cbf))
* **theme:** 添加 Vue 框架主题插件 ([23d7094](https://gitee.com/vi-design/color/commits/23d709477a4dc8819b1f2016f295cfb75186fc70))
* **theme:** 添加主题安装功能 ([b63ec89](https://gitee.com/vi-design/color/commits/b63ec89f654473217bbc059b231cd145a5604127))
* **theme:** 添加主题安装和创建函数 ([4d425dc](https://gitee.com/vi-design/color/commits/4d425dc7d8692115a6ef2c6325480694e8a4f070))
* **theme:** 添加服务端渲染支持 ([1f97109](https://gitee.com/vi-design/color/commits/1f9710956f17ca629777f862a239c39c0ee3c018))
* **theme:** 添加系统主题切换支持 ([dc94fae](https://gitee.com/vi-design/color/commits/dc94faeb46ce1ab9b1565b9db6d824a6e6215c0b))
* **theme:** 添加自定义主题属性名支持并优化主题设置 ([e3a1c49](https://gitee.com/vi-design/color/commits/e3a1c49324fd8f0090c57dbfb557ad0cc9a7ea06))
* **theme:** 添加获取系统亮度的方法 ([88a1be8](https://gitee.com/vi-design/color/commits/88a1be8bc114ebee09de849df23cbf19ab2325cb))
* **theme:** 添加静态主题管理功能 ([9a35178](https://gitee.com/vi-design/color/commits/9a3517807dd6ab4876e1db8ad315939f5b1e63ea))
* **theme:** 添加默认主题模式配置项 ([3fcfcd2](https://gitee.com/vi-design/color/commits/3fcfcd236bfee279dd3d2d36ecd48287141d8283))
* **types:** 在 ColorSchemeKeys 类型中添加 `success`颜色 ([472c244](https://gitee.com/vi-design/color/commits/472c24411327cccf825a9c59af5cc94d43cd95ed))
* **utils:** 优化图片颜色提取功能 ([9d1f6d2](https://gitee.com/vi-design/color/commits/9d1f6d2f5771e3ff26f68710c73f50760f9f12be)), closes [#1677](https://gitee.com/vi-design/color/issues/1677)
* **utils:** 增加高级颜色计算功能 ([314dfcc](https://gitee.com/vi-design/color/commits/314dfcc2b1369d9f58e6c4b33a14126e039170d3))
* **utils:** 添加从图片获取颜色的功能 ([fe1c812](https://gitee.com/vi-design/color/commits/fe1c812f0b8954515c8d3d13d16bd4a8cd7ccc12))
* **utils:** 添加智能功能色计算方法并更新配色方案 ([924842e](https://gitee.com/vi-design/color/commits/924842e588bffe00526c39fc09ae132466882017))
* **utils:** 添加自动调整对比度功能 ([fa59be4](https://gitee.com/vi-design/color/commits/fa59be46b6213d5d2261a813facb9ba09f9d061f))
* **utils:** 添加颜色评分功能 ([4d18223](https://gitee.com/vi-design/color/commits/4d18223431bcc677ce13f39962bb2b365cc04950))
* **utils:** 添加颜色量化工具函数 ([07fdaa6](https://gitee.com/vi-design/color/commits/07fdaa61993ba4038a56539fa11c12f6b39baeca))
* **utils:** 计算自定义颜色对比度 ([2cd382d](https://gitee.com/vi-design/color/commits/2cd382d4719abc7ef3dda3ebebc0e3ade1a10ce8))
* 更新配色方案术语并调整相关代码 ([1adaf9b](https://gitee.com/vi-design/color/commits/1adaf9bb2c402a8d488bf2ed2680cb37800c6c33))


### Performance Improvements

* **utils:** 优化对比度计算性能 ([1b19e2c](https://gitee.com/vi-design/color/commits/1b19e2c9807a31b763d3243e2e37efff5c52a112))



# [1.0.0](https://gitee.com/vi-design/color/compare/df8b10dce57953498d8430410255e7c157704d45...v1.0.0) (2025-03-08)


### Bug Fixes

* **conversion:** 修复颜色对象转换的返回值 ([c28b804](https://gitee.com/vi-design/color/commits/c28b8041dcbc00b797e39630c08b8262584d07ad))
* **conversion:** 支持六位和三位的十六进制颜色值 ([77bbd2a](https://gitee.com/vi-design/color/commits/77bbd2a3e5e81ac3dfb06b5ce0064997f3ab85e3))
* **palette:** 修正颜色步长计算逻辑 ([830d1a1](https://gitee.com/vi-design/color/commits/830d1a1f11e75d989dc3275724ce2f58ff1b2ecc))
* **theme:** 将主题属性设置到正确的元素上 ([937289c](https://gitee.com/vi-design/color/commits/937289c799b222bf53d65070f641a816cfceba1c))
* **utils:** 增强 colorToRgbObj 函数的健壮性 ([7eab221](https://gitee.com/vi-design/color/commits/7eab221ab6d558f2859a325bab4059593d173e7a))


### Features

* **color:** 优化色彩调整功能并支持更多维度 ([673c485](https://gitee.com/vi-design/color/commits/673c485671a4da6413ec93e2b3f5f6e72609b6f8))
* **formula:** 改进 HSL 颜色调整功能 ([32a8a47](https://gitee.com/vi-design/color/commits/32a8a47dc9ce4d9e00db3050b1adde6e41b0536d))
* **palette:** 为 makePaletteArray 函数增加选项参数 ([c1b4eed](https://gitee.com/vi-design/color/commits/c1b4eed4c1dd6c1874daecd3517734b735566ce8))
* **palette:** 优化调色板生成逻辑 ([ab71343](https://gitee.com/vi-design/color/commits/ab71343d38dd5335994f226ba0f1257c5059d1f7))
* **palette:** 增加 HSL 颜色格式支持并优化 RGB 格式转换 ([65b0ca1](https://gitee.com/vi-design/color/commits/65b0ca12e3c638db92bf2a03761917e3c2136e75))
* **palette:** 增加 hsl 颜色类型的支持并优化颜色转换 ([ebae123](https://gitee.com/vi-design/color/commits/ebae1232680a824b8235f183eac9aaee767c4471))
* **palette:** 增加调色板的配置项 ([4e108d5](https://gitee.com/vi-design/color/commits/4e108d553201875fb5515340f3160de6495dd05d))
* **palette:** 增加调色板颜色亮度范围调整功能 ([6180e18](https://gitee.com/vi-design/color/commits/6180e186e4fe3e24ceacbd757dc3dbabe292217f))
* **palette:** 实现调色板功能 ([b638b04](https://gitee.com/vi-design/color/commits/b638b041403538c53deed5487bb358e7f4f9cbf1))
* **palette:** 将调色板颜色生成算法从 RGB 改为 HSL ([1c8e799](https://gitee.com/vi-design/color/commits/1c8e79998a1f16265cb01ded59bb9be3e549143e))
* **palette:** 扩展 create 方法支持可选配置项 ([e9a988b](https://gitee.com/vi-design/color/commits/e9a988bd11317d4dad6aef1eb7be8b25ad6e48a7))
* **palette:** 改进调色板颜色生成算法 ([f6d3c33](https://gitee.com/vi-design/color/commits/f6d3c337a0994bc7cc376c0b8d13f31023758aad))
* **palette:** 添加一些属性 ([89fb857](https://gitee.com/vi-design/color/commits/89fb85707f238ed84de92e1a946c826024bc7339))
* **scheme:** 支持 HSL 对象到颜色的转换 ([57c6433](https://gitee.com/vi-design/color/commits/57c64336df7c46a4965b2fb2b0cebe508134aa81))
* **scheme:** 添加 background 和 onBackground 颜色角色 ([8d662d4](https://gitee.com/vi-design/color/commits/8d662d4a1d12a3809c91b03e16a9a0920434855b))
* **scheme:** 添加 surfaceVariant颜色属性 ([e4f598f](https://gitee.com/vi-design/color/commits/e4f598f7e4b76b278730bdff95b24e4b3cd54172))
* **scheme:** 添加基础配色方案助手函数 ([7e0ecad](https://gitee.com/vi-design/color/commits/7e0ecadf348fde56b4750bce7029f0a9c2bfcdaf))
* **src:** 添加主题模块导出 ([4ac6d56](https://gitee.com/vi-design/color/commits/4ac6d56bc54ed5fcdcd6dfb446fb94449ff0bcea))
* **theme:** 优化主题类结构并添加新功能 ([f96f8c7](https://gitee.com/vi-design/color/commits/f96f8c7c387c09ced2ad0d54029d6d0120cc9a19))
* **theme:** 优化主题配色方案 ([460d177](https://gitee.com/vi-design/color/commits/460d177bb924aee0f00c2a891bb291133df43dd6))
* **theme:** 创建主题索引文件 ([1197252](https://gitee.com/vi-design/color/commits/119725214ae71ac2f312067e2aa5063519196182))
* **theme:** 增加自定义颜色方案功能并优化主题选项接口 ([f3baa68](https://gitee.com/vi-design/color/commits/f3baa684a82f92ad3bbd21e2d0cc1ded3acf38f0))
* **theme:** 实现主题类实现了主题类，用于生成亮色和暗色配色方案。 ([d4e5008](https://gitee.com/vi-design/color/commits/d4e50089af63ada0feca3888ed12e35d99088a95))
* **theme:** 新增主题管理功能 ([fcf67f9](https://gitee.com/vi-design/color/commits/fcf67f9dec36f11dbaf7b62b6b519049bc5c2b66))
* **theme:** 添加 createTheme 函数 ([9f4dde9](https://gitee.com/vi-design/color/commits/9f4dde906b895375e66a4cbe548f68fc1a9fd5ba))
* **theme:** 添加自定义 ref函数支持 ([d15ed8e](https://gitee.com/vi-design/color/commits/d15ed8ea97bff22deb810b16c9acfa76b6c0a2df))
* **theme:** 添加配色方案转换为简单调色板的方法 ([53be6b8](https://gitee.com/vi-design/color/commits/53be6b8754d6fc7ecbcadc82b129ea9d6c32e0b9))
* **theme:** 添加颜色配色方案类 ([2950898](https://gitee.com/vi-design/color/commits/29508987554ee66934b972ac0057718b1ce09201))
* **theme:** 调整辅色和次要辅色的色相偏移角度 ([2876e49](https://gitee.com/vi-design/color/commits/2876e49a0c7cb76db0f6a52b4c069d7b1669f164))
* **types:** 新增 HSL颜色类型 ([714d42c](https://gitee.com/vi-design/color/commits/714d42cb165d3aafe3520fb73dc27a3fe9a15a8d))
* **types:** 新增简约色阶和色调调色板类型 ([2fc2924](https://gitee.com/vi-design/color/commits/2fc29240f287e5a431bc3cfc3bb82b310a2337a4))
* **types:** 新增调色板配置类型 ([52d9731](https://gitee.com/vi-design/color/commits/52d9731f7b5a24c0b2800a8d459ea5b35ae8368a))
* **types:** 新增颜色类型和配色方案接口 ([a05674b](https://gitee.com/vi-design/color/commits/a05674be6da2f7914cdae6222183b6d96817bdd0))
* **types:** 添加主题配色方案模式类型 ([a279e9f](https://gitee.com/vi-design/color/commits/a279e9f54e21dce63c73e5758419118e6e66ba4d))
* **utils:** 优化颜色转换函数并支持 HSL 颜色 ([dbce018](https://gitee.com/vi-design/color/commits/dbce018640652d176d103e02cf933b446a388fe1))
* **utils:** 创建 utils 索引文件 ([5c8ed99](https://gitee.com/vi-design/color/commits/5c8ed9960e90651c4497ff9c4dd5c6b4451c0341))
* **utils:** 增强 logColorsWithLabels 函数的功能 ([7c31563](https://gitee.com/vi-design/color/commits/7c31563153c21588d444e468bf31ef8fca3cbeaf))
* **utils:** 新增颜色调节功能 ([f6b647e](https://gitee.com/vi-design/color/commits/f6b647e8a131dcf2ce01cdc6ed3af136c643e677))
* **utils:** 添加 HSL颜色公式工具类 ([3db9ddf](https://gitee.com/vi-design/color/commits/3db9ddf29952f2ee60f1e7f3d81701d946f34148))
* **utils:** 添加字符串首字母转大写函数 ([c3b4816](https://gitee.com/vi-design/color/commits/c3b4816f3d6e68b0d61b68e06f630ebb7ecec7e9))
* **utils:** 添加对比度计算工具 ([f754a01](https://gitee.com/vi-design/color/commits/f754a010adf875cfb32f9d04ba2e00068a4700da))
* **utils:** 添加小驼峰转中划线函数 ([1e58aa8](https://gitee.com/vi-design/color/commits/1e58aa838d6a2936dad9a002e8eac0a98b49b7fa))
* **utils:** 添加新的工具和公式模块 ([62de043](https://gitee.com/vi-design/color/commits/62de043e89d04bacf278d1329b733da0b6fb0fa4))
* **utils:** 添加获取颜色类型的函数 ([836eda3](https://gitee.com/vi-design/color/commits/836eda33b708938b77781879839f06de58c93303))
* **utils:** 添加颜色转换辅助函数 ([df8b10d](https://gitee.com/vi-design/color/commits/df8b10dce57953498d8430410255e7c157704d45))
* **utils:** 添加颜色输出工具函数 ([e7734f6](https://gitee.com/vi-design/color/commits/e7734f6068549e76305ebe841eee374d144d79b7))
* **utils:** 重构颜色转换工具并添加新功能 ([be7e2b5](https://gitee.com/vi-design/color/commits/be7e2b58119375826a317337d6a83cdaf6a20db1))
* 更新库名称和版本号 ([aebcf17](https://gitee.com/vi-design/color/commits/aebcf170504075f1335af238e05f6789c2e9df8d))



