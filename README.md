# raven-agent

A Claude Code plugin marketplace — a collection of practical utility skills.

[中文文档](README_CN.md)

## Plugins

### utility-tools

| Skill | Description |
|---|---|
| **resume-pdf** | Convert a structured Markdown resume to PDF using HTML templates. Supports template selection, custom output path, and dynamic section generation. |

## Installation

### As a Claude Code plugin

```bash
/plugin marketplace add https://github.com/charles0719/raven-agent.git
```

### Manual usage

Clone the repo and install dependencies:

```bash
git clone https://github.com/charles0719/raven-agent.git
cd raven-agent/plugins/utility-tools/skills/resume-pdf/scripts
npm install
```

Run the resume conversion:

```bash
node plugins/utility-tools/skills/resume-pdf/scripts/md2pdf.mjs <resume.md> [--template <template.html>] [--output <output.pdf>]
```

## Prerequisites

Before using this plugin, make sure the following are installed on your system:

| Dependency | Version | Installation |
|---|---|---|
| **Node.js** | >= 18 | [nodejs.org](https://nodejs.org/) |
| **Google Chrome** or **Chromium** | Any recent version | See below |
| **puppeteer-core** | Auto-installed | `cd plugins/utility-tools/skills/resume-pdf/scripts && npm install` |

### Chrome / Chromium installation

The script auto-detects Chrome/Chromium on your system. If not found, install it:

| Platform | Command |
|---|---|
| **macOS** | `brew install --cask google-chrome` |
| **Ubuntu/Debian** | `sudo apt install google-chrome-stable` or `sudo apt install chromium-browser` |
| **Windows** | Download from [google.com/chrome](https://www.google.com/chrome/) |
| **Codex / CI** | Usually pre-installed; if not: `apt install chromium` |

## Templates

| Template | Style | Note |
|---|---|---|
| `简历模板-标准专业版.html` | Navy blue, centered header, formal diamond bullets | **Default** |
| `简历模板-简洁商务版.html` | Slate blue, three-column work layout, modern feel | Optional |

## Markdown format

Your resume Markdown should follow this structure:

```markdown
# Name

Contact: phone | email | GitHub

## 技能清单
1. Skill 1
2. Skill 2

## 期望职位
Position City Salary

## 工作经历
### YYYY/MM - YYYY/MM Company Role
- Description

## 项目经历
### YYYY/MM - YYYY/MM Project Name
技术选型：Tech stack
项目描述：Description
责任描述：
- Responsibility

## 教育背景
School / Major / Degree / Period
```

See [examples/example-resume.md](plugins/utility-tools/skills/resume-pdf/examples/example-resume.md) for a complete example.

## How it works

```
resume.md → [md2pdf.mjs] → Parse MD → Fill HTML template → Puppeteer + Chrome → resume.pdf
```

1. **Parse** — Regex-based extraction of structured sections from Markdown
2. **Template** — Detect template type, extract CSS, dynamically generate HTML entries
3. **Render** — Puppeteer launches headless Chrome, renders the HTML, exports A4 PDF

## License

[MIT](LICENSE)

## Built for Claude Code

[![Claude Code](https://img.shields.io/badge/Claude-Code-00A4EF?logo=anthropic)](https://claude.ai/)
