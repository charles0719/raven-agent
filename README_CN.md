# raven-agent

Claude Code 插件市场 — 一系列实用工具技能集。

[English](README.md)

## 插件

### utility-tools

| 技能 | 说明 |
|---|---|
| **resume-pdf** | 将结构化 Markdown 简历转换为 PDF。支持模板选择、自定义输出路径、动态段落生成。 |

## 安装

### 作为 Claude Code 插件安装

```bash
/plugin marketplace add https://github.com/charles0719/raven-agent.git
```

### 手动使用

克隆仓库并安装依赖：

```bash
git clone https://github.com/charles0719/raven-agent.git
cd raven-agent/plugins/utility-tools/skills/resume-pdf/scripts
npm install
```

运行简历转换：

```bash
node plugins/utility-tools/skills/resume-pdf/scripts/md2pdf.mjs <简历.md> [--template <模板.html>] [--output <输出.pdf>]
```

## 环境要求

使用前请确保系统已安装以下依赖：

| 依赖 | 版本要求 | 安装方式 |
|---|---|---|
| **Node.js** | >= 18 | [nodejs.org](https://nodejs.org/) |
| **Google Chrome** 或 **Chromium** | 任意较新版本 | 见下方 |
| **puppeteer-core** | 自动安装 | `cd scripts && npm install` |

### Chrome / Chromium 安装

脚本会自动检测系统上的 Chrome/Chromium。如果未找到，请按以下方式安装：

| 平台 | 命令 |
|---|---|
| **macOS** | `brew install --cask google-chrome` |
| **Ubuntu/Debian** | `sudo apt install google-chrome-stable` 或 `sudo apt install chromium-browser` |
| **Windows** | 从 [google.com/chrome](https://www.google.com/chrome/) 下载安装 |
| **Codex / CI** | 通常已预装；如未安装：`apt install chromium` |

## 模板

| 模板 | 风格 | 备注 |
|---|---|---|
| `简历模板-标准专业版.html` | 海军蓝、居中头部、菱形列表符、正式风格 | **默认** |
| `简历模板-简洁商务版.html` | 石板蓝、三栏工作经历布局、现代商务风 | 可选 |

## Markdown 格式要求

简历 Markdown 需要遵循以下结构：

```markdown
# 姓名

手机: xxx | 邮箱: xxx | Github: xxx

## 技能清单
1. 技能一
2. 技能二

## 期望职位
职位名称 城市 薪资范围

## 工作经历
### YYYY/MM - YYYY/MM 公司名称 职位
- 工作描述

## 项目经历
### YYYY/MM - YYYY/MM 项目名称
技术选型：技术栈
项目描述：描述内容
责任描述：
- 职责条目

## 教育背景
学校 / 专业 / 学历 / 年份
```

完整示例请参考 [examples/example-resume.md](plugins/utility-tools/skills/resume-pdf/examples/example-resume.md)。

## 工作原理

```
简历.md → [md2pdf.mjs] → 解析 MD → 填充 HTML 模板 → Puppeteer + Chrome → 简历.pdf
```

1. **解析** — 基于正则提取 Markdown 中的结构化段落
2. **模板** — 自动检测模板类型，提取 CSS，动态生成 HTML 条目
3. **渲染** — Puppeteer 启动无头 Chrome，渲染 HTML 并导出 A4 PDF

## 许可证

[MIT](LICENSE)

## 为 Claude Code 构建

[![Claude Code](https://img.shields.io/badge/Claude-Code-00A4EF?logo=anthropic)](https://claude.ai/)
