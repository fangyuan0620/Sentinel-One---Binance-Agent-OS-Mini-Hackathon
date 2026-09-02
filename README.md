# Sentinel One · Binance Agent OS Mini Hackathon

Sentinel One 是一个面向币安 Agent OS 的「市场风险哨兵」：读取 Binance 公开行情，使用确定性指标生成可解释的观察计划，再经过独立 Risk Gate。AI/Agent 只能提出方向，不能修改规则，也没有任何下单、划转或提现路径。

## 运行

需要 Node.js 20+，无需 API Key：

```bash
npm run check
npm test
npm start
```

浏览器打开 <http://localhost:3000>。网络不可用时自动使用明确标注的演示快照，因此现场演示不会因为行情接口波动而失效。

## 演示脚本（约 90 秒）

1. 选择 `BTCUSDT`，组合净值填 `1000`，点击「运行风险扫描」：展示实时/降级行情、EMA、RSI、ATR 和观察方向。
2. 将风险预算改为 `4%`：Risk Gate 直接 `BLOCK`，说明硬规则不接受危险参数。
3. 选择 `ETHUSDT` 或输入问题「现在适合追多吗？」：结果仍是计划而非订单，页面明确显示 `EXECUTION DISABLED`。

## 安全边界

- 仅允许 BTCUSDT、ETHUSDT、BNBUSDT、SOLUSDT；所有市场请求是 Binance GET 公开端点。
- 单次风险预算上限 3%，计划名义价值上限为组合净值 20%。
- 无 API 密钥存储，无交易/测试订单、转账、提现代码。
- `executionAllowed` 永远为 `false`；输出用于研究与人工复核，不构成投资建议。

## Agent OS 对接说明

本项目已内置官方 MCP 客户端适配：设置 `AGENT_OS_ONLY=true` 后，服务启动时连接 `https://agent.binance.com/mcp/agentic`，执行 MCP `initialize`、`listTools`，按名称发现行情工具，并通过 Agent OS 调用 ticker 与 K 线。Agent OS 的 OAuth 由宿主环境处理；不提供 API key，也不调用写权限工具。未设置该变量时才使用公开 API 作为本地演示降级。

```bash
AGENT_OS_ONLY=true npm start
```

## 评审亮点

`Agent 提议 → 确定性风控闸 → 不可执行 Trade Plan → 可审计解释` 的信任边界清晰；演示同时覆盖正常路径、硬阻断路径和网络降级路径，7 天内可扩展为 Agent OS OAuth 真实只读连接。

## Skill Pack

项目随软件附带 `skills/` 模块包，并登记了 Binance 官方 Skills Hub 的三个只读 skill：`crypto-market-rank`、`binance-trading-signal`、`query-token-audit`（来源链接见 `skills/binance-official.json`）。它们作为官方增强信号接入产品编排：官方 skill 负责市场上下文/链上第二意见，本地 `risk-gate` 仍是唯一许可边界。在线 skill 的 OAuth、CLI（例如 baw）由宿主环境按官方页面安装；未授权时项目仍可运行，不会伪造结果。

## 打包成软件

这是一个可分发的 Node.js 应用：复制仓库后执行 `npm install`，再运行 `npm start`。可用 `npm pack --pack-destination dist` 生成 npm 软件包；发布包不包含 `node_modules`，安装后即可运行。
