// ==UserScript==
// @name         dev-tools → VSCodium
// @match        *://*/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

;(() => {
  const Anchor = unsafeWindow.HTMLAnchorElement
  const originalClick = Anchor.prototype.click

  Anchor.prototype.click = function () {
    if (this.href.startsWith('vscode://file/')) {
      this.href = this.href.replace('vscode:', 'vscodium:')
    }

    return originalClick.call(this)
  }
})()
