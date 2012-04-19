/*
    Version: MPL 1.1/GPL 2.0/LGPL 2.1

    The contents of this file are subject to the Mozilla Public License
    Version 1.1 (the "License"); you may not use this file except in
    compliance with the License. You may obtain a copy of the License
    at http://www.mozilla.org/MPL/1.1/

    Software distributed under the License is distributed on an
    "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
    See the License for the specific language governing rights and
    limitations under the License.

    The Original Code is "Paste to Tab and Go" extension

    The Initial Developer of the Original Code is LouCypher.
    Portions created by the Initial Developer are Copyright (C) 2006
    the Initial Developer. All Rights Reserved.

    Contributor(s):
      LouCypher <loucypher@mozillaca.com>

    Alternatively, the contents of this file may be used under the terms
    of either the GNU General Public License Version 2 or later (the "GPL"),
    or the GNU Lesser General Public License Version 2.1 or later
    (the "LGPL"), in which case the provisions of the GPL or the LGPL are
    applicable instead of those above. If you wish to allow use of your
    version of this file only under the terms of either the GPL or the LGPL,
    and not to allow others to use your version of this file under the terms
    of the MPL, indicate your decision by deleting the provisions above and
    replace them with the notice and other provisions required by the GPL or
    the LGPL. If you do not delete the provisions above, a recipient may use
    your version of this file under the terms of any one of the MPL, the GPL
    or the LGPL.
*/

var PasteToTab = {

  get browser() {
    return document.getElementById("content");
  },

  get tab() {
    return this.browser.mContextTab;
  },

  debug: function pasteToTab_debug(aMessages) {
    var debug = Services.prefs.getBoolPref("extensions.pastetotab.debug");
    if (debug) Application.console.log("Paste to Tab and Go\n" + aMessages);
  },

  // Get and return 'Paste & Go' menuitem on URL Bar context menu
  get pasteAndGo() {
    if (!gURLBar) return null;
    var inputBox;
    switch (Application.id) {
      case "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}": // Firefox
        inputBox = document.getAnonymousElementByAttribute(
                          gURLBar, "anonid", "textbox-input-box");
        return document.getAnonymousElementByAttribute(
                          inputBox, "anonid", "paste-and-go");
      case "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}": // SeaMonkey
        inputBox = document.getAnonymousElementByAttribute(
                      gURLBar, "class", "textbox-input-box paste-and-go");
        return document.getAnonymousElementByAttribute(
                      inputBox, "cmd", "cmd_pasteAndGo");
    }
  },

  // Get and return 'Paste & Search' menuitem on Search Bar context menu
  get pasteAndSearch() {
    var searchBar = BrowserSearch.searchBar;
    if (!searchBar) return null;
    var textBox = document.getAnonymousElementByAttribute(
                           searchBar, "anonid", "searchbar-textbox");
    var inputBox = document.getAnonymousElementByAttribute(
                            textBox, "anonid", "textbox-input-box");
    switch (Application.id) {
      case "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}": // Firefox
        return document.getAnonymousElementByAttribute(
                                  inputBox, "anonid", "paste-and-search");
      case "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}": // SeaMonkey
        return document.getAnonymousElementByAttribute(
                      inputBox, "cmd", "cmd_pasteAndSearch");
    }
  },

  // Get and return tab context menu
  get tabContextMenu() {
    var tabContext;
    switch (Application.id) {
      case "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}": // Firefox
        tabContext = document.getElementById("tabContextMenu");
        break;
      case "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}": // SeaMonkey
        var ptt = document.getElementById("paste-to-tab-and-go");
        var sep = document.getElementById("paste-to-tab-and-go-separator");
        var tabUndoCloseTab = document.getAnonymousElementByAttribute(
                                this.browser,
                                "tbattr", "tabbrowser-undoclosetab");
        tabContext = tabUndoCloseTab.parentNode;
        tabContext.insertBefore(ptt, tabUndoCloseTab.nextSibling);
        tabContext.insertBefore(sep, tabUndoCloseTab.nextSibling);
    }
    return tabContext;
  },

  // Insert 'Paste to New Tab & Go' menuitem into URL Bar context menu
  insertURLBarMenuitem: function pasteToTab_insertURLBarMenuitem() {
    var id = "urlbar-paste-to-new-tab-and-go";
    var pi = this.pasteAndGo;
    if (!document.getElementById(id) && pi) {
      var tmpl = document.getElementById("template-paste-to-new-tab-and-go");
      var mi = tmpl.cloneNode(true); mi.id = id; mi.removeAttribute("hidden");
      pi.setAttribute("onmouseover", "PasteToTab.updateText(this);");
      pi.setAttribute("onmouseout", "PasteToTab.updateText(this, '');");
      pi.previousSibling.setAttribute("onmouseover",
                                      "PasteToTab.updateText(this);");
      pi.previousSibling.setAttribute("onmouseout",
                                      "PasteToTab.updateText(this, '');");
      var context = pi.parentNode;
      context.insertBefore(mi, pi.nextSibling);
      context.addEventListener("popupshowing", ptt_initURLBar = function(e) {
        PasteToTab.onURLBarContext(e);
      }, false);
      context.removeEventListener("popuphiding", ptt_initURLBar, false);
    }
    this.debug("Menuitem has "
             + (document.getElementById(id) ? "" : "NOT ")
             + "been inserted into URL Bar context menu.");
  },

  // Insert 'Paste to New Tab & Search' menuitem into Search Bar context menu
  insertSearchBarMenuitem: function pasteToTab_insertSearchBarMenuitem() {
    var id = "searchbar-paste-to-new-tab-and-search";
    var pi = this.pasteAndSearch;
    this.debug("Paste & Search = " + pi);
    if (!document.getElementById(id) && pi) {
      var tmpl = document.getElementById("template-paste-to-new-tab-"
                                       + "and-search");
      var mi = tmpl.cloneNode(true); mi.id = id; mi.removeAttribute("hidden");
      pi.setAttribute("onmouseover", "PasteToTab.updateText(this);");
      pi.setAttribute("onmouseout", "PasteToTab.updateText(this, '');");
      pi.previousSibling.setAttribute("onmouseover",
                                      "PasteToTab.updateText(this);");
      pi.previousSibling.setAttribute("onmouseout",
                                      "PasteToTab.updateText(this, '');");
      var context = pi.parentNode;
      context.insertBefore(mi, pi.nextSibling);
      context.addEventListener("popupshowing",
                                ptt_initSearchBar = function(e) {
        PasteToTab.onSearchBarContext(e);
      }, false);
      context.removeEventListener("popuphiding", ptt_initSearchBar, false);
    }
    this.debug("Menuitem has "
             + (document.getElementById(id) ? "" : "NOT ")
             + "been inserted into Search Bar context menu.");
  },

  // Load URL or search the web for text into a new tab
  go: function pasteToTab_go(aTab) {
    var string = readFromClipboard();
    if (!string) return;
    var tab = this.browser.loadOneTab(string, null, null, null, null, true);
    //if (!aTab) aTab = this.browser.mCurrentTab;
  },

  // Search the web for text on new tab
  search: function pasteToTab_search(aString) {
    var string = aString ? aString
                         : readFromClipboard() ? readFromClipboard()
                                               : "";
    var searchBar = BrowserSearch.searchBar;
    if (searchBar) {
      var textBox = searchBar._textbox
      textBox.value = string;
      try { // Add pasted string to textbox autocomplete
        textBox._formHistSvc.addEntry(textBox.
                                      getAttribute("autocompletesearchparam"),
                                      string);
      } catch (ex) {
        Cu.reportError("Saving search to form history failed: " + ex);
      }
    }
    // Syntax: BrowserSearch.loadSearch(searchString, useNewTab);
    BrowserSearch.loadSearch(string, true);
  },

  // Load URL or search the web for text into a tab
  loadURI: function pasteToTab_loadURI(aTab, aEvent) {
    if (aEvent.ctrlKey || aEvent.metaKey) return;
    var string = readFromClipboard();
    if (!string) return;
    var browser = aTab.linkedBrowser;
    var flag = browser.webNavigation.LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP;
    browser.loadURIWithFlags(string, flag, null, null, null);
  },

  // Check for middle click or ctrl+click
  checkForClickEvent: function pasteToTab_checkForClickEvent(aNode, aEvent) {
    if (aNode.getAttribute("disabled") == "true") return;
    if ((aEvent.button == 1) ||
        (aEvent.button == 0) && (aEvent.ctrlKey || aEvent.metaKey)) {
      var string = readFromClipboard();
      if (!string) return;
      this.go(string, null, null, null, null, true);
      closeMenus(aEvent.target);
    }
  },

  // Check if a string is a valid URI
  isURI: function pasteToTab_isURI(aString) {
    try {
      return makeURI(aString); // check if a string is valid URI
    } catch(ex) {
      return null;  // return null if a string is not valid URI
    }
  },

  // Display clipboard text on tooltip when hover on menuitem
  updateText: function pasteToTab_updateText(aNode, aString) {
    var text = "";
    if (aString) text = aString;
    else text = readFromClipboard() ? readFromClipboard() : "";
    aNode.tooltipText = text;
    /*var statusbar = document.getElementById("status-bar");
    if (statusbar.hidden || !this.isURI(text)) {
      aNode.tooltipText = text;
    } else {
      aNode.tooltipText = "";
      document.getElementById("statusbar-display").label = text;
    }*/
  },

  // Disable 'Paste to Tab & Go' menuitem on tab context menu
  // if there's no text in clipboard
  onTabContext: function pasteToTab_onTabContext(aEvent) {
    var menuitem = document.getElementById("paste-to-tab-and-go");
    menuitem.setAttribute("disabled", !readFromClipboard() ? true : false);
    this.debug("Tab: " + this.browser.mContextTab.label);
  },

  // Disable 'Paste to New Tab & Go' menuitem on toolbar context menu
  // if there's no text in clipboard
  onToolbarContext: function pasteToTab_onToolbarContext(aEvent) {
    var mi = document.getElementById("paste-to-new-tab-and-go");
    var sep = document.getElementById("paste-to-new-tab-and-go-separator");
    mi.hidden = document.popupNode.id != "tabbrowser-tabs";
    sep.hidden = document.popupNode.id != "tabbrowser-tabs";
    mi.setAttribute("disabled", !readFromClipboard() ? true : false);
  },

  // Disable 'Paste to New Tab & Go' menuitem on URL Bar context menu
  // if there's no text in clipboard
  onURLBarContext: function pasteToTab_onURLBarContext(aEvent) {
    var mi = document.getElementById("urlbar-paste-to-new-tab-and-go");
    mi.setAttribute("disabled", !readFromClipboard() ? true : false);
    this.debug("URL Bar context menu has been initiated!");
  },

  // Disable 'Paste to New Tab & Search' menuitem on Search Bar context menu
  // if there's no text in clipboard
  onSearchBarContext: function pasteToTab_onSearchBarContext(aEvent) {
    var mi = document.getElementById("searchbar-paste-to-new-tab-and-search");
    mi.setAttribute("disabled", !readFromClipboard() ? true : false);
    this.debug("Search Bar context menu has been initiated!");
  },

  // Initiate browser window
  initBrowser: function pasteToTab_initBrowser(aEvent) {
    this.insertURLBarMenuitem(); // Insert 'Paste to New Tab & Go'
                                 // menuitem into URL Bar context menu

    this.insertSearchBarMenuitem(); // Insert 'Paste to New Tab & Search'
                                    // menuitem into Search Bar context menu

    // Initiate toolbar context menu
    if (document.getElementById("paste-to-new-tab-and-go")) {
      // Firefox only because 'Paste to New Tab & Go' is not added
      // into toolbar context menu on SeaMonkey
      var tbCtx = document.getElementById("toolbar-context-menu");
      tbCtx.addEventListener("popupshowing", ptt_initTbCtx = function(e) {
        PasteToTab.onToolbarContext(e);
      }, false);
      tbCtx.removeEventListener("popuphiding", ptt_initTbCtx, false);
    }

    // Initiate tab context menu
    var tabCtx = this.tabContextMenu;
    tabCtx.addEventListener("popupshowing", ptt_initTabCtx = function(e) {
      PasteToTab.onTabContext(e);
    }, false);
    tabCtx.removeEventListener("popuphiding", ptt_initTabCtx, false);
  }
}

window.addEventListener("load", ptt_initBrowser = function(e) {
  PasteToTab.initBrowser(e);
}, false);

window.removeEventListener("unload", ptt_initBrowser, false);
