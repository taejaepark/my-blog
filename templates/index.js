import { escapeHtml } from './layout.js';

export function indexPage(posts) {
  if (posts.length === 0) {
    return `<p class="empty">아직 글이 없습니다.</p>`;
  }

  return `<ul class="post-list">
${posts.map(p => `  <li class="post-item">
    <a class="post-title" href="posts/${p.slug}.html">${escapeHtml(p.title)}</a>
    <time class="post-date" datetime="${p.date.toISOString()}">${p.dateDisplay}</time>
    <p class="post-excerpt">${p.excerpt}</p>
  </li>`).join('\n')}
</ul>`;
}
