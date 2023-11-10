/**
 * Modifies legacy html to match TipTap document structure,
 * without losing content.
 *
 * - Images in paragraphs
 * - Links with images inside
 * - Links not in paragraphs
 * - YouTube videos
 *
 * Images are assumed to be configured as blocks in TipTap.
 *
 * Currently relies on document being available in the global scope, so we can only use this on the client ATM.
 */
export function normalizeExternalHtml(html: string) {
  const container = document.createElement('div');
  container.innerHTML = html;

  let el;
  // Move all images out of anchors, and set replacement text for the anchors.
  while ((el = container.querySelector('a > img'))) {
    unwrapLink(el.parentNode, el.getAttribute('alt') ?? 'Image link');
  }

  // Move all images out of paragraphs.
  while ((el = container.querySelector('p > img'))) {
    unwrap(el.parentNode);
  }

  // Wrap all non-paragraph-wrapped anchors in paragraphs.
  while ((el = container.querySelector('a:not(p a)'))) {
    wrap(el, document.createElement('p'));
  }

  // Move youtube iframes out of paragraphs.
  while ((el = container.querySelector('p > iframe[src*="youtube.com"]'))) {
    unwrap(el.parentNode);
  }

  // Wrap youtube iframes in the proper tiptap-element.
  while ((el = container.querySelector(':not([data-youtube-video]) > iframe[src*="youtube.com"]'))) {
    const wrapper = document.createElement('div');
    wrapper.dataset['youtubeVideo'] = 'true';
    wrap(el, wrapper);
  }

  return container.innerHTML;
}

/**
 * Move all chldren out of an element, and remove the element.
 */
function unwrap(el: ParentNode | null) {
  const parent = el?.parentNode;
  if (!el || !parent) return;

  // Move all children to the parent element.
  while (el.firstChild) parent.insertBefore(el.firstChild, el);

  // Remove the empty element.
  parent.removeChild(el);
}

/**
 * Move all chldren out of an anchor, and set a replacement text.
 */
function unwrapLink(el: ParentNode | null, replacementText: string) {
  const parent = el?.parentNode;
  if (!el || !parent) return;

  // Move all children to the parent element.
  while (el.firstChild) parent.insertBefore(el.firstChild, el);

  // Keep the anchor in the dom but since it's empty we'll
  // set a replacement text.
  el.textContent = replacementText;
}

/**
 * Wrap a dom node with another node.
 */
function wrap(el: Element, wrapper: Element) {
  if (!el.parentNode) return;
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
}
