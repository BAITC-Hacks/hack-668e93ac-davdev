const escapeHtml = (str: string) =>
  str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

export default escapeHtml
