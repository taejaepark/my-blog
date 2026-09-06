export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function layout({ title, body, rootPath = '' }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${rootPath}assets/css/style.css">
<script>
(function () {
  var saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();
</script>
</head>
<body>
<header class="site-header">
  <a class="site-title" href="${rootPath}index.html">My Blog</a>
  <button id="theme-toggle" type="button" aria-label="Toggle dark mode">🌓</button>
</header>
<main>
${body}
</main>
<footer class="site-footer">
  <p>&copy; ${new Date().getFullYear()} My Blog</p>
</footer>
<script src="${rootPath}assets/js/theme.js"></script>
</body>
</html>
`;
}
