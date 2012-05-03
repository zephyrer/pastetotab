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

  toString: function PasteToTab_toString() {
    "use strict";
    return "Paste to Tab and Go";
  },

  get prefs() {
    return Services.prefs.getBranch("extensions.pastetotab.");
  },

  getBoolPref: function pasteToTab_prefs_getBoolPref(aPrefString) {
    return this.prefs.getBoolPref(aPrefString);
  },

  get browser() {
    return document.getElementById("content");
  },

  // For debugging
  debug: function pasteToTab_debug(aMessages) {
    if (this.getBoolPref("debug")) {
      Application.console.log("Paste to Tab and Go\n" + aMessages);
    }
  },

  // Open the options dialog
  options: function pasteToTab_options() {
    var win = Services.wm.getMostRecentWindow("PasteToTab:Preferences");
    if (win) {
      win.focus();
      return;
    }
    openDialog("chrome://pastetotab/content/options.xul",
               "pastetotab-options",
               "chrome, dialog, close, titlebar, centerscreen,"
             + "resizable, minimizable");
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
    switch (Application.id) {
      case "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}": // Firefox
        return document.getElementById("tabContextMenu");

      case "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}": // SeaMonkey
        var ptt = document.getElementById("paste-to-tab-and-go");
        var sep = document.getElementById("paste-to-tab-and-go-separator");
        var tabUndoCloseTab = document.getAnonymousElementByAttribute(
                                this.browser,
                                "tbattr", "tabbrowser-undoclosetab");
        var tabContext = tabUndoCloseTab.parentNode;
        tabContext.insertBefore(ptt, tabUndoCloseTab.nextSibling);
        tabContext.insertBefore(sep, tabUndoCloseTab.nextSibling);
        return tabContext;

      default: return null;
    }
  },

  // Insert 'Paste to New Tab & Go' menuitem into URL Bar context menu
  insertURLBarMenuitem: function pasteToTab_insertURLBarMenuitem() {
    function $(aId) {
      return document.getElementById(aId);
    }

    var pi = this.pasteAndGo;
    if (pi) {
      pi.addEventListener("mouseover", ptt1_mouseover = function(e) {
        PasteToTab.updateText(e.target);
      }, false);
      pi.addEventListener("mouseout", ptt1_mouseout = function(e) {
        PasteToTab.updateText(e.target, "");
      }, false);

      pi.previousSibling
        .addEventListener("mouseover", ptt2_mouseover = function(e) {
        PasteToTab.updateText(e.target);
      }, false);
      pi.previousSibling
        .addEventListener("mouseout", ptt2_mouseout = function(e) {
        PasteToTab.updateText(e.target, "");
      }, false);

      var tmpl, mi;
      var context = pi.parentNode;
      var ids = ["paste-to-new-tab-and-go", "paste-text-and-go"];
      for (var i = 0; i < ids.length; i++) {
        if (!$("urlbar-" + ids[i])) {
          tmpl = $("template-" + ids[i]);
          mi = tmpl.cloneNode(true);
          mi.id = "urlbar-" + ids[i];
          mi.removeAttribute("hidden");
          context.insertBefore(mi, pi.nextSibling);
        }
        this.debug("#urlbar-" + ids[i] + " has " + ($(ids[i]) ? "" : "NOT ")
                 + "been inserted into URL Bar context menu.");
      }

      if ($(ids[0]) || $(ids[1])) {
        context.addEventListener("popupshowing",
                                 ptt_initURLBar = function(e) {
          PasteToTab.onURLBarContext(e);
        }, false);
        context.removeEventListener("popuphiding", ptt_initURLBar, false);
      }
    }
  },

  // Insert 'Paste to New Tab & Search' menuitem into Search Bar context menu
  insertSearchBarMenuitem: function pasteToTab_insertSearchBarMenuitem() {
    var id = "searchbar-paste-to-new-tab-and-search";
    var pi = this.pasteAndSearch;
    this.debug("Paste & Search = " + pi);

    if (pi) {
      pi.addEventListener("mouseover", ptt3_mouseover = function(e) {
        PasteToTab.updateText(e.target);
      }, false);
      pi.addEventListener("mouseout", ptt3_mouseout = function(e) {
        PasteToTab.updateText(e.target, "");
      }, false);

      pi.previousSibling
        .addEventListener("mouseover", ptt4_mouseover = function(e) {
        PasteToTab.updateText(e.target);
      }, false);
      pi.previousSibling
        .addEventListener("mouseout", ptt4_mouseout = function(e) {
        PasteToTab.updateText(e.target, "");
      }, false);

      if (!document.getElementById(id)) {
        var tmpl = document.getElementById("template-paste-to-new-tab-"
                                         + "and-search");
        var mi = tmpl.cloneNode(true);
        mi.id = id;
        mi.removeAttribute("hidden");

        var context = pi.parentNode;
        context.insertBefore(mi, pi.nextSibling);
        context.addEventListener("popupshowing",
                                  ptt_initSearchBar = function(e) {
          PasteToTab.onSearchBarContext(e);
        }, false);
        context.removeEventListener("popuphiding", ptt_initSearchBar, false);
      }
    }

    this.debug("Menuitem has "
             + (document.getElementById(id) ? "" : "NOT ")
             + "been inserted into Search Bar context menu.");
  },

  get clipboard() {
    return readFromClipboard() ? readFromClipboard() : "";
  },

  get clipboardIsEmpty() {
    return this.clipboard ? false : true;
  },

  // Load URL or search the web for text into a new tab
  go: function pasteToTab_go(aURL) {
    var string = aURL ? aURL : this.clipboard;
    var focusTab;
    switch (this.prefs.getIntPref("focusTab")) {
      case 0: focusTab = false; break;
      case 1: focusTab = true; break;
      default:
        focusTab = !Services.prefs.getBoolPref("browser.tabs.loadInBackground");
    }
    /* Syntax: loadOneTab(aURI, aReferrerURI, aCharset, aPostData,
                          aLoadInBackground, aAllowThirdPartyFixup)
       If aURI is empty, load a new blank tab */
    this.browser.loadOneTab(string, null, null, null, !focusTab, true);
  },

  // Search the web for text on new tab
  search: function pasteToTab_search(aString) {
    var string = aString ? aString : this.clipboard;
    var searchBar = BrowserSearch.searchBar;
    if (searchBar) {
      var textBox = searchBar._textbox
      textBox.value = string;
      if (string) {
        try { // Add pasted string to textbox autocomplete
          textBox._formHistSvc
                 .addEntry(textBox.getAttribute("autocompletesearchparam"),
                           string);
        } catch (ex) {
          Cu.reportError("Saving search to form history failed: " + ex);
        }
      }
    }
    /* Syntax: BrowserSearch.loadSearch(searchText, useNewTab);
       If the string is empty, load search form */
    BrowserSearch.loadSearch(string, true);
  },

  // Load URL or search the web for text into a tab
  loadURI: function pasteToTab_loadURI(aTab, aEvent) {
    if (aEvent.ctrlKey || aEvent.metaKey) return;
    var string = this.clipboard;
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
      var string = this.clipboard;
      if (!string) return;
      this.go(string, null, null, null, null, true);
      closeMenus(aEvent.target);
    }
  },

  // Display clipboard text on tooltip when hover on menuitem
  updateText: function pasteToTab_updateText(aNode, aString) {
    aNode.tooltipText = aString ? aString : this.clipboard;
  },

  // Get and return contribution URL from pref
  get contributionURL() {
    return Services.urlFormatter
                   .formatURL(this.prefs.getCharPref("contributionURL"));
  },

  // Load donation page
  contribute: function pasteToTab_contribute() {
    //gBrowser.loadOneTab(this.contributionURL, null, null, null, false);
    //http://mxr.mozilla.org/mozilla-central/source/browser/base/content/browser.js#8993
    switchToTabHavingURI(this.contributionURL, true);
  },

  // Enable/disable and show/hide menuitem
  toggleNode: function pasteToTab_toggleNode(aId, aPrefString, aEvent) {
    var node = document.getElementById(aId);
    if (!node) return;

    // Disable menuitem if clipboard is empty
    node.disabled = this.clipboardIsEmpty;

    // Hide menuitem if pref is false
    if (aEvent && (aEvent.target.id == "toolbar-context-menu")) {
      var popupNode = ("triggerNode" in aEvent.target)
                          ? aEvent.target.triggerNode
                          : document.popupNode;
      node.hidden = !(this.getBoolPref(aPrefString) &&
                      (popupNode.id == "tabbrowser-tabs"))
    } else {
      node.hidden = !this.getBoolPref(aPrefString);
    }
  },

  // Toggle 'Paste to Tab & Go' menuitem on tab context menu
  onTabContext: function pasteToTab_onTabContext(aEvent) {
    this.toggleNode("paste-to-tab-and-go", "tab.pasteToThisTabAndGo");
    this.toggleNode("paste-to-tab-and-go-separator",
                    "tab.pasteToThisTabAndGo");
    this.debug("Tab: " + this.browser.mContextTab.label);
  },

  // Toggle 'Paste to New Tab & Go' menuitem on toolbar context menu
  onToolbarContext: function pasteToTab_onToolbarContext(aEvent) {
    this.toggleNode("paste-to-new-tab-and-go",
                    "tabbar.pasteToNewTabAndGo",
                    aEvent);
    this.toggleNode("paste-to-new-tab-and-go-separator",
                    "tabbar.pasteToNewTabAndGo",
                    aEvent);
  },

  // Toggle 'Paste to New Tab & Go' menuitem on URL Bar context menu
  onURLBarContext: function pasteToTab_onURLBarContext(aEvent) {
    this.toggleNode("urlbar-paste-to-new-tab-and-go",
                    "urlbar.pasteToNewTabAndGo");
    this.toggleNode("urlbar-paste-text-and-go", "urlbar.pasteTextAndGo");
    this.debug("URL Bar context menu has been initiated!");
  },

  // Toggle 'Paste to New Tab & Search' menuitem on Search Bar context menu
  onSearchBarContext: function pasteToTab_onSearchBarContext(aEvent) {
    this.toggleNode("searchbar-paste-to-new-tab-and-search",
                    "searchbar.pasteToNewTabAndSearch");
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
      /* Firefox only because 'Paste to New Tab & Go' is not added
         into toolbar context menu on SeaMonkey */
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

    // Load donation page on first installation only
    // Check connection first
    //BrowserOffline.toggleOfflineStatus(); // offline test
    if (this.getBoolPref("firstRun") && navigator.onLine) {
      var req = new XMLHttpRequest();
      req.open("GET", this.contributionURL, true);
      req.onreadystatechange = function (aEvent) {
        if ((req.readyState == 4) && (req.status == 200)) {
          PasteToTab.prefs.setBoolPref("firstRun", false);
          PasteToTab.contribute();
        }
      }
      req.send(null);
    }

  }
}

window.addEventListener("load", ptt_initBrowser = function(e) {
  PasteToTab.initBrowser(e);
}, false);

window.removeEventListener("unload", ptt_initBrowser, false);
