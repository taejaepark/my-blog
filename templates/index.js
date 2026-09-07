import { escapeHtml } from './layout.js';

const apps = [
  {
    name: '2048',
    description: '방향키(또는 스와이프)로 숫자 타일을 밀어서 합치는 퍼즐 게임. 점수판 포함.',
    href: 'apps/2048/index.html',
  },
];

function appsSection() {
  if (apps.length === 0) return '';

  return `<section class="app-section">
  <h2 class="section-title">미니 웹앱</h2>
  <div class="app-grid">
${apps.map(a => `    <a class="app-card" href="${a.href}">
      <span class="app-card-title">${escapeHtml(a.name)}</span>
      <p class="app-card-desc">${escapeHtml(a.description)}</p>
    </a>`).join('\n')}
  </div>
</section>
`;
}

export function indexPage(posts) {
  const postsHtml = posts.length === 0
    ? `<p class="empty">아직 글이 없습니다.</p>`
    : `<ul class="post-list">
${posts.map(p => `  <li class="post-item">
    <a class="post-title" href="posts/${p.slug}.html">${escapeHtml(p.title)}</a>
    <time class="post-date" datetime="${p.date.toISOString()}">${p.dateDisplay}</time>
    <p class="post-excerpt">${p.excerpt}</p>
  </li>`).join('\n')}
</ul>`;

  return `${appsSection()}${postsHtml}`;
}
