const { marked } = require('marked');

function parseMarkdownInsideHtml(content) {
  if (!content) return '';
  return content
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/(?<!\!)\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const isInternal = url.startsWith('/') || url.startsWith('#') || url.includes('lurevi.in');
      if (isInternal) {
        return `<a href="${url}">${text}</a>`;
      } else {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

const content1 = '<p>inspire personal interpretation.[Digital sculptures as wall art: the emerging trend](/blog/digital-sculptures-wall-art)</p>';
const content2 = 'Some markdown text with **bold** and a [link](https://google.com)';

console.log('Result 1:', marked.parse(parseMarkdownInsideHtml(content1)));
console.log('Result 2:', marked.parse(parseMarkdownInsideHtml(content2)));
