var PasteToTab = {

  get tabbrowser() {
    return getBrowser();
  },

  get menuitem() {
    return document.getElementById("paste-to-tab-and-go");
  },

  get clipboard() {
    return readFromClipboard() ? readFromClipboard() : "";
  },

  andGo: function pasteToTab_andGo(aTab) {
    if (!this.clipboard) return;
    if (aTab.localName == "tabs") {
      this.tabbrowser.loadOneTab(this.clipboard, null, null, null, null, true);
    } else {
      aTab.linkedBrowser.loadURI(this.clipboard, null, null, true);
    }
  },

  setStatus: function pasteToTab_setStatus(aString) {
    document.getElementById("statusbar-display").label = aString;
  },

  initContext: function pasteToTab_initContext() {
    this.menuitem.setAttribute("disabled", !this.clipboard ? true : false);
  },

  init: function pasteToTab_init() {
    var tabContext = document.getAnonymousElementByAttribute(
                      this.tabbrowser, "anonid", "tabContextMenu");
    tabContext.insertBefore(this.menuitem, tabContext.firstChild);
    tabContext.addEventListener("popupshowing", function(e) {
      PasteToTab.initContext();
    }, false);
  }
}

window.addEventListener("load", function(e) {
  PasteToTab.init();
}, false);

