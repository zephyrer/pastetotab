var PasteToTab = {

  get tabbrowser() {
    return getBrowser();
  },

  get menuitem() {
    return document.getElementById("paste-to-tab-and-go");
  },

  get statusbar() {
    return document.getElementById("status-bar");
  },

  get statusbarText() {
    var status = document.getElementById("sb-status-bar-status-label") || // Songbird
                 document.getElementById("statusbar-display");
    return status;
  },

  // Songbird doesn't have readFromClipboard() function
  readFromClipboard: function pasteToTab_readFromClipboard() {
    var Cc = Components.classes; var Ci = Components.interfaces;
    var url;
    try {
      var clipboard = Cc['@mozilla.org/widget/clipboard;1'].
                      getService(Ci.nsIClipboard);
      var trans = Cc['@mozilla.org/widget/transferable;1'].
                  createInstance(Ci.nsITransferable);
      trans.addDataFlavor("text/unicode");
      if (clipboard.supportsSelectionClipboard()) {
        clipboard.getData(trans, clipboard.kSelectionClipboard);
      } else {
        clipboard.getData(trans, clipboard.kGlobalClipboard);
      }
      var data = {};
      var dataLen = {};
      trans.getTransferData("text/unicode", data, dataLen);
      if (data) {
        data = data.value.QueryInterface(Ci.nsISupportsString);
        url = data.data.substring(0, dataLen.value / 2);
      }
    } catch (ex) {
      return "";
    }
    return url;
  },

  andGo: function pasteToTab_andGo(aTab) {
    var string = this.readFromClipboard();
    if (!string) return;
    if (aTab.localName == "tabs") {
      this.tabbrowser.loadOneTab(string, null, null, null, null, true);
    } else {
      aTab.linkedBrowser.loadURI(string, null, null, true);
    }
  },

  mouseOver: function pasteToTab_mouseOver(aNode) {
    var text = this.readFromClipboard();
    if (this.statusbar.hidden) {
      aNode.setAttribute("tooltiptext", text);
    } else {
      if (this.statusbarText.localName == "statusbarpanel") {
        this.statusbarText.label = text;
      } else { // Songbird
        this.statusbarText.desc.value = text;
      }
    }
  },

  mouseOut: function pasteToTab_mouseOut(aNode) {
    if (this.statusbar.hidden) {
      aNode.removeAttribute("tooltiptext");
    } else {
      if (this.statusbarText.localName == "statusbarpanel") {
        this.statusbarText.label = "";
      } else { // Songbird
        this.statusbarText.desc.value = "";
      }
    }
  },

  initContext: function pasteToTab_initContext() {
    this.menuitem.setAttribute("disabled", !this.readFromClipboard()
                                           ? true : false);
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