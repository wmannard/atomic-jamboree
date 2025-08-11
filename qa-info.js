// Auto-populate .qa-info spans with the tag and attributes of their next sibling
export function updateQAInfoSpans() {
  document.querySelectorAll('.qa-info').forEach(span => span.remove()); // Remove old spans
  function isVisible(el) {
    return !!(el.offsetParent || (el.offsetWidth > 0 && el.offsetHeight > 0));
  }
  const atomicElements = Array.from(document.querySelectorAll('*'))
    .filter(el => {
      const tag = el.tagName.toLowerCase();
      return tag.startsWith('atomic-') && isVisible(el) && !tag.includes('layout');
    });
  atomicElements.forEach(el => {
    const attrs = Array.from(el.attributes)
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(' ');
    const qaSpan = document.createElement('span');
    qaSpan.className = 'qa-info';
    qaSpan.textContent = `<${el.tagName.toLowerCase()}${attrs ? ' ' + attrs : ''}>`;
    qaSpan.style.display = 'none'; // Hide by default
    el.parentNode.insertBefore(qaSpan, el);
  });
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', updateQAInfoSpans);
}
