import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import { parseFrontmatter } from './lib/frontmatter.js';
import { layout } from './templates/layout.js';
import { indexPage } from './templates/index.js';
import { postPage } from './templates/post.js';

const POSTS_DIR = 'posts';
const DIST_DIR = 'dist';

function slugify(filename) {
  return filename
    .replace(/\.md$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function excerptOf(html, length = 150) {
  const text = stripTags(html);
  return text.length > length ? text.slice(0, length).trim() + '…' : text;
}

rmSync(DIST_DIR, { recursive: true, force: true });
mkdirSync(join(DIST_DIR, 'posts'), { recursive: true });

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));

const posts = files.map((file) => {
  const raw = readFileSync(join(POSTS_DIR, file), 'utf-8');
  const { data, content } = parseFrontmatter(raw);
  const html = marked.parse(content);
  const date = new Date(data.date || 0);

  return {
    slug: slugify(file),
    title: data.title || file,
    date,
    dateDisplay: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
    html,
    excerpt: excerptOf(html),
  };
});

posts.sort((a, b) => b.date - a.date);

for (const post of posts) {
  const page = layout({ title: post.title, body: postPage(post), rootPath: '../' });
  writeFileSync(join(DIST_DIR, 'posts', `${post.slug}.html`), page);
}

const indexHtml = layout({ title: 'My Blog', body: indexPage(posts) });
writeFileSync(join(DIST_DIR, 'index.html'), indexHtml);

cpSync('assets', join(DIST_DIR, 'assets'), { recursive: true });

console.log(`Built ${posts.length} post(s) → ${DIST_DIR}/`);
