#!/usr/bin/env node
/**
 * md2pdf.mjs - Markdown Resume to PDF Converter
 *
 * Usage:
 *   node md2pdf.mjs <resume.md> [--template <path>] [--output <path>]
 *
 * Defaults:
 *   --template  ../templates/简历模板-标准专业版.html
 *   --output    same directory as input, same name with .pdf extension
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Cross-platform Chrome Detection ────────────────────────────────

function findChrome() {
  const os = platform();

  const candidates = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ],
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`,
      `${process.env.PROGRAMFILES || ''}\\Google\\Chrome\\Application\\chrome.exe`,
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
    ],
  };

  const paths = candidates[os] || [...(candidates.linux || [])];
  for (const p of paths) {
    if (p && existsSync(p)) return p;
  }

  // Fallback: let puppeteer try to find it
  return undefined;
}

// ─── CLI Argument Parsing ───────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = { input: null, template: null, output: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--template' && args[i + 1]) {
      opts.template = resolve(args[++i]);
    } else if (args[i] === '--output' && args[i + 1]) {
      opts.output = resolve(args[++i]);
    } else if (!args[i].startsWith('--')) {
      opts.input = resolve(args[i]);
    }
  }

  if (!opts.input) {
    console.error('Usage: node md2pdf.mjs <resume.md> [--template <path>] [--output <path>]');
    process.exit(1);
  }

  if (!opts.template) {
    opts.template = resolve(__dirname, '../templates/简历模板-标准专业版.html');
  }

  if (!opts.output) {
    const dir = dirname(opts.input);
    const name = basename(opts.input, '.md');
    opts.output = join(dir, `${name}.pdf`);
  }

  return opts;
}

// ─── Markdown Parser ────────────────────────────────────────────────

function parseMd(md) {
  const data = {
    name: '',
    phone: '',
    email: '',
    github: '',
    githubUrl: '',
    skills: [],
    targetPosition: '',
    targetCity: '',
    targetSalary: '',
    jobs: [],
    projects: [],
    education: { school: '', major: '', degree: '', period: '', note: '' },
  };

  const lines = md.split('\n');

  // ── Name (# heading)
  const nameMatch = md.match(/^#\s+(.+)$/m);
  if (nameMatch) data.name = nameMatch[1].trim();

  // ── Contact info
  const contactLine = lines.find(l => l.includes('手机') || l.includes('邮箱') || l.includes('Github'));
  if (contactLine) {
    const phoneMatch = contactLine.match(/手机[：:]\s*(\S+)/);
    const emailMatch = contactLine.match(/邮箱[：:]\s*(\S+)/);
    const githubMatch = contactLine.match(/Github[：:]\s*(https?:\/\/\S+)/i);
    if (phoneMatch) data.phone = phoneMatch[1];
    if (emailMatch) data.email = emailMatch[1];
    if (githubMatch) {
      data.githubUrl = githubMatch[1];
      data.github = githubMatch[1].replace(/^https?:\/\//, '');
    }
  }

  // ── Section splitting
  const sectionRegex = /^##\s+(.+)$/gm;
  const sections = {};
  let match;
  const sectionPositions = [];

  while ((match = sectionRegex.exec(md)) !== null) {
    sectionPositions.push({ title: match[1].trim(), start: match.index + match[0].length });
  }

  for (let i = 0; i < sectionPositions.length; i++) {
    const end = i + 1 < sectionPositions.length ? sectionPositions[i + 1].start - sectionPositions[i + 1].title.length - 4 : md.length;
    sections[sectionPositions[i].title] = md.slice(sectionPositions[i].start, end).trim();
  }

  // ── Skills
  if (sections['技能清单']) {
    const skillLines = sections['技能清单'].split('\n').filter(l => /^\d+\.\s/.test(l.trim()));
    data.skills = skillLines.map(l => l.replace(/^\d+\.\s*/, '').trim());
  }

  // ── Target position
  if (sections['期望职位']) {
    const parts = sections['期望职位'].trim().split(/\s+/);
    data.targetPosition = parts[0] || '';
    data.targetCity = parts[1] || '';
    data.targetSalary = parts.slice(2).join(' ') || '';
  }

  // ── Work experience
  if (sections['工作经历']) {
    const jobBlocks = sections['工作经历'].split(/^###\s+/m).filter(Boolean);
    for (const block of jobBlocks) {
      const blockLines = block.split('\n');
      const headerLine = blockLines[0].trim();
      // Format: "2021/06 - 2026/04 某某科技有限公司 高级研发工程师"
      const headerMatch = headerLine.match(/^(\d{4}\/\d{2}\s*-\s*\d{4}\/\d{2})\s+(.+?)\s+([\u4e00-\u9fa5]+[\u4e00-\u9fa5\w]*)$/);
      let period = '', company = '', role = '';
      if (headerMatch) {
        period = headerMatch[1];
        company = headerMatch[2];
        role = headerMatch[3];
      } else {
        // Fallback: try to split by spaces
        const parts = headerLine.split(/\s+/);
        period = parts.slice(0, 3).join(' ');
        company = parts[3] || '';
        role = parts.slice(4).join(' ') || '';
      }

      const bullets = blockLines
        .slice(1)
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.replace(/^[\s-]+/, '').trim());

      data.jobs.push({ period, company, role, bullets });
    }
  }

  // ── Projects
  if (sections['项目经历']) {
    const projBlocks = sections['项目经历'].split(/^###\s+/m).filter(Boolean);
    for (const block of projBlocks) {
      const blockLines = block.split('\n');
      const headerLine = blockLines[0].trim();
      // Format: "2024/07 - 2026/04 共享停车与停车云协同平台"
      const headerMatch = headerLine.match(/^(\d{4}\/\d{2}\s*-\s*\d{4}\/\d{2})\s+(.+)$/);
      let period = '', name = '';
      if (headerMatch) {
        period = headerMatch[1];
        name = headerMatch[2];
      } else {
        name = headerLine;
      }

      let techStack = '';
      let description = '';
      const bullets = [];
      let inResponsibility = false;

      for (let i = 1; i < blockLines.length; i++) {
        const line = blockLines[i].trim();
        if (line.startsWith('技术选型') || line.startsWith('技术选型：')) {
          techStack = line.replace(/^技术选型[：:]\s*/, '');
        } else if (line.startsWith('项目描述') || line.startsWith('项目描述：')) {
          description = line.replace(/^项目描述[：:]\s*/, '');
        } else if (line.startsWith('责任描述') || line.startsWith('核心模块')) {
          inResponsibility = line.startsWith('责任描述');
        } else if (line.startsWith('-') && inResponsibility) {
          bullets.push(line.replace(/^-\s*/, ''));
        } else if (line.startsWith('-') && !inResponsibility) {
          // Some projects list core modules as bullets before 责任描述
          // We still collect responsibility bullets
        }
      }

      // If no 责任描述 section found, collect all bullets
      if (bullets.length === 0) {
        for (let i = 1; i < blockLines.length; i++) {
          const line = blockLines[i].trim();
          if (line.startsWith('-')) {
            bullets.push(line.replace(/^-\s*/, ''));
          }
        }
      }

      data.projects.push({ period, name, techStack, description, bullets });
    }
  }

  // ── Education
  if (sections['教育背景']) {
    const eduText = sections['教育背景'];
    const eduLines = eduText.split('\n').filter(l => l.trim());
    // Try to parse structured format
    for (const line of eduLines) {
      if (line.includes('本科') || line.includes('硕士') || line.includes('博士') || line.includes('大专')) {
        data.education.degree = line.match(/(本科|硕士|博士|大专)/)?.[1] || '';
      }
      const schoolMatch = line.match(/([\u4e00-\u9fa5]+大学|[\u4e00-\u9fa5]+学院)/);
      if (schoolMatch) data.education.school = schoolMatch[1];
      const majorMatch = line.match(/[｜|]([\u4e00-\u9fa5]+工程|[\u4e00-\u9fa5]+科学|[\u4e00-\u9fa5]+技术|[\u4e00-\u9fa5]+管理)[｜|]/);
      if (majorMatch) data.education.major = majorMatch[1];
      const periodMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4})/);
      if (periodMatch) data.education.period = `${periodMatch[1]} - ${periodMatch[2]}`;
      // Note line
      if (line.includes('具备') || line.includes('能力') || line.includes('基础')) {
        data.education.note = line.replace(/^[-\s]*/, '').trim();
      }
    }
  }

  return data;
}

// ─── HTML Builders ──────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function detectTemplate(templateHtml) {
  if (templateHtml.includes('three-col')) return 'business';
  return 'standard';
}

function extractCss(templateHtml) {
  const match = templateHtml.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : '';
}

function buildStandardHtml(data, css) {
  const skillItems = data.skills
    .map(s => `      <li>${escapeHtml(s)}</li>`)
    .join('\n');

  const jobBlocks = data.jobs.map(job => `
    <div class="job">
      <div class="job-header">
        <div class="job-main">${escapeHtml(job.company)} | ${escapeHtml(job.role)}</div>
        <div class="job-period">${escapeHtml(job.period)}</div>
      </div>
      <ul>
${job.bullets.map(b => `        <li>${escapeHtml(b)}</li>`).join('\n')}
      </ul>
    </div>`).join('\n');

  const projectBlocks = data.projects.map(proj => `
    <div class="project">
      <div class="project-header">
        <div class="project-name">${escapeHtml(proj.name)}</div>
        <div class="project-period">${escapeHtml(proj.period)}</div>
      </div>
${proj.techStack ? `      <div class="project-stack"><span>技术选型：</span>${escapeHtml(proj.techStack)}</div>` : ''}
${proj.description ? `      <p class="project-desc">${escapeHtml(proj.description)}</p>` : ''}
      <ul>
${proj.bullets.map(b => `        <li>${escapeHtml(b)}</li>`).join('\n')}
      </ul>
    </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(data.name)} - ${escapeHtml(data.targetPosition)}</title>
<style>
${css}
</style>
</head>
<body>
<div class="page">

  <header class="header">
    <div class="header-top">
      <div class="name-block">
        <div class="name">${escapeHtml(data.name)}</div>
        <div class="job-title">${escapeHtml(data.targetPosition)}</div>
      </div>
    </div>
  </header>

  <section class="section">
    <div class="section-title">基本信息</div>
    <div class="info-row">
      <div class="info-item">手机：${escapeHtml(data.phone)}</div>
      <div class="info-item">邮箱：<a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>
${data.githubUrl ? `      <div class="info-item">GitHub：<a href="${escapeHtml(data.githubUrl)}">${escapeHtml(data.github)}</a></div>` : ''}
    </div>
  </section>

  <section class="section">
    <div class="section-title">期望职位</div>
    <p class="plain-text">${escapeHtml(data.targetPosition)} ${escapeHtml(data.targetCity)} ${escapeHtml(data.targetSalary)}</p>
  </section>

  <section class="section">
    <div class="section-title">技能清单</div>
    <ol class="text-list">
${skillItems}
    </ol>
  </section>

  <section class="section">
    <div class="section-title">工作经历</div>
${jobBlocks}
  </section>

  <section class="section">
    <div class="section-title">项目经历</div>
${projectBlocks}
  </section>

  <section class="section">
    <div class="section-title">教育背景</div>
    <div class="edu-item">
      <div class="edu-left">
        <div class="edu-school">${escapeHtml(data.education.school)}</div>
        <div class="edu-major">${escapeHtml(data.education.major)} | ${escapeHtml(data.education.degree)}（统招）</div>
      </div>
      <div class="edu-right">
        <div class="edu-degree">${escapeHtml(data.education.degree)}</div>
        <div class="edu-period">${escapeHtml(data.education.period)}</div>
      </div>
    </div>
${data.education.note ? `    <p class="plain-text" style="margin-top: 10px;">${escapeHtml(data.education.note)}</p>` : ''}
  </section>

</div>
</body>
</html>`;
}

function buildBusinessHtml(data, css) {
  const skillItems = data.skills
    .map(s => `      <li>${escapeHtml(s)}</li>`)
    .join('\n');

  const jobBlocks = data.jobs.map(job => `
    <div class="entry">
      <div class="entry-header three-col">
        <div class="entry-period">${escapeHtml(job.period)}</div>
        <div class="entry-title">${escapeHtml(job.company)}</div>
        <div class="entry-subtitle">${escapeHtml(job.role)}</div>
      </div>
      <ul class="list">
${job.bullets.map(b => `        <li>${escapeHtml(b)}</li>`).join('\n')}
      </ul>
    </div>`).join('\n');

  const projectBlocks = data.projects.map(proj => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-title">${escapeHtml(proj.name)}</div>
        <div class="entry-period">${escapeHtml(proj.period)}</div>
      </div>
${proj.techStack ? `      <div class="entry-subtitle">技术选型：${escapeHtml(proj.techStack)}</div>` : ''}
${proj.description ? `      <div class="entry-desc">${escapeHtml(proj.description)}</div>` : ''}
      <ul class="list">
${proj.bullets.map(b => `        <li>${escapeHtml(b)}</li>`).join('\n')}
      </ul>
    </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(data.name)} - ${escapeHtml(data.targetPosition)}</title>
<style>
${css}
</style>
</head>
<body>
<div class="page">
  <header class="header">
    <div class="name">${escapeHtml(data.name)}</div>
    <div class="job-target">应聘岗位：${escapeHtml(data.targetPosition)}</div>
    <div class="basic-info">
      <div>联系电话：${escapeHtml(data.phone)}</div>
      <div>电子邮箱：<a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>
${data.githubUrl ? `      <div>GitHub：<a href="${escapeHtml(data.githubUrl)}">${escapeHtml(data.github)}</a></div>` : ''}
    </div>
  </header>

  <section class="section">
    <div class="section-title">技能清单</div>
    <ul class="list">
${skillItems}
    </ul>
  </section>

  <section class="section">
    <div class="section-title">工作经历</div>
${jobBlocks}
  </section>

  <section class="section">
    <div class="section-title">项目经历</div>
${projectBlocks}
  </section>

  <section class="section">
    <div class="section-title">教育背景</div>
    <div class="entry">
      <div class="entry-header">
        <div class="entry-title">${escapeHtml(data.education.school)}</div>
        <div class="entry-period">${escapeHtml(data.education.period)}</div>
      </div>
      <div class="entry-subtitle">${escapeHtml(data.education.major)} / ${escapeHtml(data.education.degree)}</div>
    </div>
${data.education.note ? `    <p class="note">${escapeHtml(data.education.note)}</p>` : ''}
  </section>
</div>
</body>
</html>`;
}

// ─── PDF Generation ─────────────────────────────────────────────────

async function htmlToPdf(htmlContent, outputPath) {
  const puppeteer = await import('puppeteer-core');
  const chromePath = findChrome();
  if (!chromePath) {
    throw new Error(
      'Chrome/Chromium not found. Please install Google Chrome or set --chrome-path.\n' +
      '  macOS:  brew install --cask google-chrome\n' +
      '  Linux:  apt install google-chrome-stable\n' +
      '  Win:    https://www.google.com/chrome/'
    );
  }
  console.log(`[md2pdf] Using Chrome: ${chromePath}`);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();
}

// ─── Main ───────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv);

  console.log(`[md2pdf] Reading markdown: ${opts.input}`);
  const mdContent = readFileSync(opts.input, 'utf-8');

  console.log(`[md2pdf] Reading template: ${opts.template}`);
  const templateHtml = readFileSync(opts.template, 'utf-8');

  console.log('[md2pdf] Parsing markdown...');
  const data = parseMd(mdContent);
  console.log(`[md2pdf]   Name: ${data.name}`);
  console.log(`[md2pdf]   Skills: ${data.skills.length}`);
  console.log(`[md2pdf]   Jobs: ${data.jobs.length}`);
  console.log(`[md2pdf]   Projects: ${data.projects.length}`);

  const templateType = detectTemplate(templateHtml);
  console.log(`[md2pdf] Template type: ${templateType}`);

  const css = extractCss(templateHtml);
  const html = templateType === 'business'
    ? buildBusinessHtml(data, css)
    : buildStandardHtml(data, css);

  // Save intermediate HTML for debugging
  const htmlOutput = opts.output.replace(/\.pdf$/, '.html');
  writeFileSync(htmlOutput, html, 'utf-8');
  console.log(`[md2pdf] HTML saved: ${htmlOutput}`);

  console.log('[md2pdf] Generating PDF...');
  await htmlToPdf(html, opts.output);
  console.log(`[md2pdf] PDF saved: ${opts.output}`);
}

main().catch(err => {
  console.error('[md2pdf] Error:', err.message);
  process.exit(1);
});
