---
name: resume-pdf
description: "Use when the user wants to convert a Markdown resume into a PDF file. Trigger on phrases like 'generate resume PDF', 'convert resume to PDF', 'make PDF from my resume', 'resume markdown to PDF', '/resume-pdf', or when the user has a .md resume file and wants a formatted PDF output."
allowed-tools: Bash
---

# Resume PDF Generator

Convert a Markdown resume into a professionally formatted PDF using customizable HTML templates.

## When to use

The user has a structured Markdown resume and wants to generate a PDF file. The user may also want to:

- Choose between different template styles
- Preview the generated HTML before PDF output
- Customize the output path

## Prerequisites

Before running the conversion script, ensure dependencies are installed:

```bash
cd <project-root>/scripts && [ -d node_modules ] || npm install && cd -
```

The system must have **Google Chrome** or **Chromium** installed. The script auto-detects the browser path across macOS, Windows, and Linux.

## How it works

### Step 1: Confirm inputs

Ask the user for:

1. **Resume file path** (required) — Path to the Markdown resume file
2. **Template** (optional) — Which template to use:
   - `templates/简历模板-标准专业版.html` — Standard Professional (navy blue, centered header, formal) **[default]**
   - `templates/简历模板-简洁商务版.html` — Clean Business (modern, three-column work experience layout)
3. **Output path** (optional) — Where to save the PDF. Defaults to same directory as input file.

### Step 2: Run the conversion

Execute the conversion script:

```bash
node <project-root>/scripts/md2pdf.mjs <resume.md> [--template <template.html>] [--output <output.pdf>]
```

**Examples:**

```bash
# Default template
node scripts/md2pdf.mjs my-resume.md

# Business template
node scripts/md2pdf.mjs my-resume.md --template templates/简历模板-简洁商务版.html

# Custom output path
node scripts/md2pdf.mjs my-resume.md --output ~/Desktop/resume.pdf
```

### Step 3: Report results

The script outputs:
- A `.html` file (intermediate, for debugging/preview)
- A `.pdf` file (final output)

Tell the user both file paths and the key stats (skills count, jobs count, projects count) logged by the script.

### Step 4: Handle errors

Common issues and fixes:

| Error | Cause | Fix |
|---|---|---|
| `Cannot find package 'puppeteer-core'` | Dependencies not installed | Run `npm install` in `scripts/` directory |
| `Chrome/Chromium not found` | No browser installed | Install Chrome: `brew install --cask google-chrome` (macOS) / `apt install google-chrome-stable` (Linux) |
| `Could not find expected browser` | Puppeteer can't locate Chrome | Check Chrome installation path |

## Markdown resume format

The Markdown resume must follow this structure. See `references/md-format.md` for full details.

```markdown
# Name

Contact info line (phone, email, GitHub)

## Skills section heading
1. Skill item 1
2. Skill item 2

## Target position heading
Position City Salary

## Work experience heading
### Period Company Role
- Description bullet

## Project experience heading
### Period Project Name
Tech stack line
Project description
Responsibility bullets

## Education heading
School / Major / Degree / Period
```

## Important notes

- The script dynamically generates HTML entries for any number of jobs/projects — it is not limited by the template's placeholder count
- Both templates are print-ready with `@media print` and `@page { size: A4 }` CSS
- The HTML output can be opened in a browser for quick preview before committing to the PDF
- Section headings in the Markdown must use Chinese: `技能清单`, `期望职位`, `工作经历`, `项目经历`, `教育背景`
