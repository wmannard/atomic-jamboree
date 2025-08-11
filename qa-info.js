// Auto-populate .qa-info spans with the tag and attributes of their next sibling
export function updateQAInfoSpans() {
  document.querySelectorAll('.qa-info').forEach(span => {
    const next = span.nextElementSibling;
    if (next) {
      const attrs = Array.from(next.attributes)
        .map(attr => `${attr.name}="${attr.value}"`)
        .join(' ');
      span.textContent = `<${next.tagName.toLowerCase()}${attrs ? ' ' + attrs : ''}>`;
    }
  });
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', updateQAInfoSpans);
}
