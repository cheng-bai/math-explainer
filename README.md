# Math Explainer · 高中数学讲解实验室

把数学关系、可操作图形与分步推理放到同一个可离线分享的讲解页中。

这个项目起于“同一条椭圆的八种入口”，随后加入双曲线和抛物线。现在提取为一个小型通用框架：**数学模型负责算对，教学路径负责讲清，渲染器负责画准。**

[下载离线版](https://github.com/cheng-bai/math-explainer/releases) · [架构与演进](ARCHITECTURE.md) · [如何新增讲解](docs/AUTHORING.md) · [验证与限制](docs/VALIDATION.md) · [贡献约定](CONTRIBUTING.md)

## v0.1 已实现

- 保留椭圆、双曲线、抛物线各八入口，共24个旧实验；源码可在仓库内重建。
- 新的类型化内容契约、可信模型注册表、统一Scene、等比例SVG、公式排版与版本化分享状态。
- 概念例：二次函数的根、判别式与顶点高度。
- 问题例：抛物线弦中点，点差法/韦达法、必要与充分条件、切线/空集边界、弦长。
- 步骤与图形状态预设、高亮联动；多方法切换；深浅纸面、键盘与390px布局。
- 教师单文件HTML与学生练习HTML导出。学生文件从题干白名单重建，不含题解、提示、模型脚本或隐藏教师数据。
- 内容校验、数学性质测试、浏览器及完全离线检查；MIT开源。

**v0.1是可运行的架构起点。**两篇新内容已完成针对当前源码的独立数学与教学复核、性质测试与视觉验收，标记reviewed，详见[独立复核记录](docs/INDEPENDENT_REVIEW.md)。旧24入口仍在`legacy/`，尚未全部迁入新Scene契约；新渲染器当前只支持二维SVG。没有宣称自动解题、自动验证证明、全学科题库或已完成AI编排。

## 本地运行

需要 Node.js 22.12+ 和 npm。首次安装以`package-lock.json`为准。

```sh
npm ci
npm run build:legacy
npm run dev
```

按终端提示打开本机地址。目录中可选择两个新示例，也可进入原24个实验。停止服务后，离线成品仍能在浏览器打开。

完整静态站点：

```sh
npm run build:all
npm run preview
```

`dist/index.html`是新讲解页单文件；`dist/legacy/conics/conics-lab.html`是原24入口单文件。打包`dist/`即可作为完整静态站点分发。不需要后端、数据库、API key或账号。

## 导出课堂文件

```sh
npm run export -- --lesson=parabola-midpoint-chord --audience=teacher
npm run export -- --lesson=parabola-midpoint-chord --audience=student
```

输出到`artifacts/课程id-版本/index.html`。教师版含可操作图形和解法；学生版只保留完整题干、来源及作答区域，下载后无需网络或脚本。教师单课导出会移除旧实验跳转，以免单文件收到者点击缺失路径。

公开源码本身包含教学答案。学生练习文件的数据隔离用于避免误把答案随练习发出，并不是考试保密系统。

## 目录与扩展方式

```text
src/core/          内容契约、场景类型、参数与分享状态
src/math/          纯数学模型、模型注册表与绑定校验
src/content/       自编概念和问题；推理路径、边界与来源
src/renderers/     KaTeX与等比例SVG；不重复计算数学关系
src/main.ts       课堂交互编排
legacy/           可移植的三曲线实验，保留原仪器快照
scripts/          内容校验、导出、组装和公开文件检查
tests/            内容/状态/数学性质与浏览器检查
docs/             作者指南、复核证据、范围与限制
third-party/      第三方版权与完整许可
```

已有模型能表达的问题，新增内容即可；新的数学关系需要添加纯模型、合法性/边界及性质测试。新增空间、离散或机械呈现时增添渲染适配器，不把题目逻辑写进SVG函数。详细契约见[架构文档](ARCHITECTURE.md)。

## 复跑检查

```sh
npm run check:content
npm test
npm run test:legacy
npm run build:all
npm run export -- --lesson=parabola-midpoint-chord --audience=student
npm run export -- --lesson=parabola-midpoint-chord --audience=teacher
npx playwright install chromium
npm run test:browser
npm run check:public
```

本机已有Google Chrome时，可用`PLAYWRIGHT_CHANNEL=chrome npm run test:browser`，无需再下载浏览器。无头浏览器检查覆盖新示例的每个步骤、旧24入口可达、手机、分享恢复、边界、真实学生导出和离线运行。数值测试与格式校验都不能代替数学证明、来源核对与人工复核。

## 适合怎样发展

先用10个不同主题验证契约，再扩充模型和创作工具：函数/导数、三角与向量、数列/不等式、立体几何、概率统计、综合题。优先迁移高复用构造，随后加入Markdown创作与变式关联；按真实需求接入空间动画、CAS复核和AI草稿。后端、知识图谱、通用编辑器与多人协作均推迟到具体需求出现。见[路线与验收标准](ARCHITECTURE.md#演进次序与验收)。

## 来源、隐私与许可

仓库只含项目自编公开示例、已有自编实验及许可明确的第三方代码。没有导入真实学生资料、私人题库、试卷或账号配置。代码与自编内容均采用[MIT](LICENSE)。原拉绳仪使用[Anatomy](https://github.com/wheresryan22/anatomy)，公式使用[KaTeX](https://katex.org/)，均保留MIT版权与许可，详见[第三方声明](THIRD_PARTY_NOTICES.md)。

题干标注来源不自动获得再分发权限。提交外部试题、截图、字体或数据前请确认授权；不把个人教学资料直接提交至公开目录。
