import { escapeHtml } from './layout.js';

export function postPage(post) {
  return `<article class="post">
  <h1 class="post-title">${escapeHtml(post.title)}</h1>
  <time class="post-date" datetime="${post.date.toISOString()}">${post.dateDisplay}</time>
  <div class="post-content">
${post.html}
  </div>
  <p class="back-link"><a href="../index.html">← 목록으로</a></p>
</article>`;
}
