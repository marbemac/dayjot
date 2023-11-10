export function elementFromString(value: string) {
  // add a wrapper to preserve leading and trailing whitespace
  const wrappedValue = `<body>${value}</body>`;

  return new window.DOMParser().parseFromString(wrappedValue, 'text/html').body;
}

export function escapeHTML(value: string) {
  return value?.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
