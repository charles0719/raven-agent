# Markdown Resume Format Reference

The conversion script parses Markdown resumes with a specific structure. This document defines the expected format.

## Complete structure

```markdown
# 姓名

手机: 13800000000 | 邮箱: name@example.com | Github: http://github.com/username

## 技能清单

1. 技能描述一
2. 技能描述二
3. ...

## 期望职位

职位名称 城市 薪资范围

## 工作经历

### 起止时间 公司名称 职位名称

- 工作描述条目一
- 工作描述条目二
- 工作描述条目三

### 起止时间 公司名称 职位名称

- 工作描述条目一
- ...

## 项目经历

### 起止时间 项目名称

技术选型：Spring Boot + MySQL + Redis + ...

项目描述：项目的整体介绍和背景说明。

责任描述：

- 职责条目一
- 职责条目二
- 职责条目三

### 起止时间 项目名称

技术选型：...
...

## 教育背景

- 学历/学校名称
- 学校名称 ｜专业名称｜学历（统招） 起止年份

补充说明（可选）
```

## Parsing rules

### Name (`# heading`)
- The first `# ` heading is treated as the name

### Contact info
- A single line containing `手机`、`邮箱`、`Github` keywords
- Pipe-separated: `手机: xxx | 邮箱: xxx | Github: xxx`

### Skills (`## 技能清单`)
- Numbered list items: `1. `, `2. `, etc.
- Each item is one skill description

### Target position (`## 期望职位`)
- Single line, space-separated: `职位 城市 薪资`

### Work experience (`## 工作经历`)
- Each job starts with `### ` followed by: `起止时间 公司名称 职位名称`
- Time format: `YYYY/MM - YYYY/MM`
- Followed by bullet list (`-`) of job descriptions

### Project experience (`## 项目经历`)
- Each project starts with `### ` followed by: `起止时间 项目名称`
- Time format: `YYYY/MM - YYYY/MM`
- Optional lines:
  - `技术选型：` — tech stack
  - `项目描述：` — project description paragraph
  - `核心模块：` — core modules (parsed but only responsibility bullets go to PDF)
  - `责任描述：` — followed by bullet list of responsibilities

### Education (`## 教育背景`)
- School name (matched by `大学` or `学院` keyword)
- Major (matched between `｜` or `|` delimiters)
- Degree: `本科`, `硕士`, `博士`, or `大专`
- Period: `YYYY - YYYY` format

## Section heading requirements

The following section headings must be used exactly (Chinese):

| Section | Heading |
|---|---|
| Skills | `## 技能清单` |
| Target position | `## 期望职位` |
| Work experience | `## 工作经历` |
| Projects | `## 项目经历` |
| Education | `## 教育背景` |
