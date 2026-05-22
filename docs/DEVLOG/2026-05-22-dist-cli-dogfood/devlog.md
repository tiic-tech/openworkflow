# 我差点用错了 OpenWorkflow 的入口

今天我没有试图把 OpenWorkflow 的整天开发写成宏大叙事。这个仓库在 2026-05-22 已经有大量提交，从 M84 到 M98 都在推进 vision、validation、proto、tune、post-validate、smart-city dogfood 和 dailin-grade prompt pack。这样的范围如果直接写，会很容易变成流水账。

我选择了一个更小的切口：在 OpenWorkflow 自己的 dogfood 开发里，Agent 到底应该从哪里读取“当前 CLI 能力”。

这个问题看起来很小，但它暴露了一个很硬的产品边界：当一个工具正在开发它自己时，全局安装的 CLI、仓库源码、仓库构建后的 dist CLI、managed surface 不是同一个东西。Agent 如果把它们混在一起，就会拿错能力边界。

## 触发点

我一开始按 `AGENTS.md` 的第一条规则执行：

```bash
openworkflow --help
```

结果全局 binary 只告诉我有这些命令：

```text
init
validate
sync
doctor
clean
```

如果我停在这里，结论会是：当前 OpenWorkflow CLI 还没有 `handoff`、`inspect`、`context`、`draft`、`register`、`summaries`、`git-automation` 这些能力。

但这是错的。用户提醒我：当前 repo 是 dogfood 开发模式，最新能力需要用 repo dist CLI 获取。

我重新检查 `package.json`，发现 package bin 指向的是：

```json
"openworkflow": "dist/cli/src/index.js"
```

于是我改用：

```bash
node dist/cli/src/index.js --help
```

这一次，能力面完全不同：`handoff`、`status`、`brief`、`inspect`、`context`、`draft`、`register`、`check`、`summaries`、`summarize`、`git-automation` 都出现了。

真正有价值的点不在于“我用了错命令”。价值在于：OpenWorkflow 这种系统必须把“能力发现入口”也当作契约的一部分。

## 证据

这次小调查有四类证据。

第一，`AGENTS.md` 的 repo-local 指令要求 Agent 先跑 `openworkflow --help`，并用 `handoff` 作为严格信任门。它也明确说，在 dogfood OpenWorkflow 自己时，要用 OpenWorkflow 命令作为 read model 和 trust gate。

第二，全局 binary 的能力面是旧的。它只显示 maintenance 命令：`init`、`validate`、`sync`、`doctor`、`clean`。

第三，repo 的 dist CLI 是新的。`packages/cli/src/index.ts` 已经 dispatch 了 `handoff`、`context`、`inspect`、`draft`、`register`、`summaries`、`summarize`、`git-automation` 等命令，help 文本也把 Agent quick start 和 JSON report envelope 写得很清楚。

第四，dist CLI 的 runtime 输出证明它不是文档幻想。`node dist/cli/src/index.js handoff --root . --json` 返回 `handoff_ok: true`，`context --handoff --json` 能给出 `/ow:vision` 的 compact startup packet、readiness、quality summary 和 read order。

## 决策弧一：入口不是实现细节

我以前会把 CLI 入口当成执行细节：能跑就行。但在 dogfood 仓库里，入口本身决定 Agent 能看见什么世界。

全局 `openworkflow` 是一个已安装版本。它适合验证发布包用户能拿到的能力，但不适合作为当前开发树的能力真相。当前 repo 的 `dist/cli/src/index.js` 才能代表这个工作区刚构建出来的能力面。

这给未来 Agent 的规则很直接：

> 在 OpenWorkflow 自举仓库里，先确认能力入口，再相信能力列表。若任务涉及“最新能力”“dogfood”“repo 当前行为”，优先使用 `node dist/cli/src/index.js ...`。

## 决策弧二：AGENTS 指令需要解释执行环境

`AGENTS.md` 说“Run `openworkflow --help` first”。这条规则在普通消费仓库里是合理的，因为用户安装的 `openworkflow` 就是可用工具。但在 OpenWorkflow 自己的开发仓库里，这句话需要一个 dogfood 上下文补充：命令语义是 `openworkflow`，执行入口应该绑定到 repo dist CLI。

这不是要手工 patch `AGENTS.md`。`AGENTS.md` 是 managed surface。真正的产品修复应该发生在生成它的模板、registry 或同步逻辑里。

作为 devlog，这里只记录一个内容洞察：文档里出现命令名，不等于运行时入口已经唯一。对 Agent 来说，`openworkflow handoff --root . --json` 和 `node dist/cli/src/index.js handoff --root . --json` 是同一个语义动作，但不是同一个版本来源。

## 决策弧三：handoff 是信任门，不是装饰命令

dist CLI 的 `handoff` 输出把这次误差收束回一个明确状态：

```text
handoff_ok: true
next_command: /ow:vision
summary_quality_ok: true
next_command_ready: true
```

这个结果说明，当前 repo-local workflow surface 是健康的，下一步可以进入 `/ow:vision`。它也说明 Agent 不需要从 `.openworkflow` 里盲目递归翻文件：`context --handoff --json` 已经给了 bounded startup packet，并标出哪些是 must-read、哪些 raw evidence 只有在缺上下文时才读。

换句话说，OpenWorkflow 的能力不是“更多文件给 Agent 看”。它更像是一个渐进披露协议：先用 trust gate 判断能不能继续，再用 context packet 控制读取面。

## 我会怎么把这条经验固化给未来 Agent

这次小偏差可以变成四条操作规则：

1. 在 OW 自举仓库里，所有最新 CLI 能力确认都先跑 `node dist/cli/src/index.js --help`。
2. 全局 `openworkflow` 的输出只能代表已安装包，不能代表当前 repo 开发树。
3. 进入工作前跑 `node dist/cli/src/index.js handoff --root . --json`，把 `ok:false`、`health_errors`、`errors`、`warnings` 分开读。
4. 内容、spec 或产品讨论可以引用 managed surface；产品行为修复不要手改 `.openworkflow/**`、`.agents/**` 或 `AGENTS.md`，要改生成源。

## 这个小切口为什么有意思

我喜欢这个切口，是因为它不是“某个命令多了几个 subcommand”。它把 OpenWorkflow 的核心哲学压缩成一个很实际的问题：

> Agent 的上下文入口如果不受控，后面的所有推理都可能建立在过期能力上。

OpenWorkflow 正在做的不是单纯给 Agent 更多规则，而是让 Agent 每次接手仓库时能先问：当前可信入口是什么？当前 command boundary 是什么？哪些证据应该先读，哪些证据默认不碰？

这次 devlog 只讲了一个入口错位，但它刚好说明 dogfood 的价值：系统最有用的契约，往往是在自己差点被误用的时候显形的。

