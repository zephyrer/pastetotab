/*
  Version: MPL 1.1/GPL 2.0/LGPL 2.1

  The contents of this file are subject to the Mozilla Public License Version
  1.1 (the "License"); you may not use this file except in compliance with
  the License. You may obtain a copy of the License at
  http://www.mozilla.org/MPL/1.1/

  Software distributed under the License is distributed on an "AS IS" basis,
  WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
  for the specific language governing rights and limitations under the
  License.

  The Original Code is "Paste to Tab and Go" extension

  The Initial Developer of the Original Code is LouCypher.
  Portions created by the Initial Developer are Copyright (C) 2006
  the Initial Developer. All Rights Reserved.

  Contributor(s):
    LouCypher <loucypher@mozillaca.com>

  Alternatively, the contents of this file may be used under the terms of
  either the GNU General Public License Version 2 or later (the "GPL"), or
  the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
  in which case the provisions of the GPL or the LGPL are applicable instead
  of those above. If you wish to allow use of your version of this file only
  under the terms of either the GPL or the LGPL, and not to allow others to
  use your version of this file under the terms of the MPL, indicate your
  decision by deleting the provisions above and replace them with the notice
  and other provisions required by the GPL or the LGPL. If you do not delete
  the provisions above, a recipient may use your version of this file under
  the terms of any one of the MPL, the GPL or the LGPL.
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

  // get and return 'Paste & Go' menuitem on URL bar context menu
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

  // get and return tab context menu
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

  // insert 'Paste to New Tab & Go' menuitem into URL bar context menu
  insertURLBarMenuitem: function pasteToTab_insertURLBarMenuitem() {
    var id = "urlbar-paste-to-new-tab-and-go";
    var pg = this.pasteAndGo;
    if (!document.getElementById(id) && pg) {
      var tmpl = document.getElementById("template-paste-to-new-tab-and-go");
      var mi = tmpl.cloneNode(true); mi.id = id; mi.removeAttribute("hidden");
      pg.tooltipText = "";
      pg.setAttribute("onmouseover", "PasteToTab.updateText(this);");
      pg.setAttribute("onmouseout", "PasteToTab.updateText(this, '');");
      var urlBarCt = pg.parentNode;
      urlBarCt.insertBefore(mi, pg.nextSibling);
      urlBarCt.addEventListener("popupshowing", ptt_initURLBar = function(e) {
        PasteToTab.onURLBarContext(e);
      }, false);
      urlBarCt.removeEventListener("popuphiding", ptt_initURLBar, false);
    }
    this.debug("Menuitem has " +
               (document.getElementById(id) ? "" : "NOT ") +
               "been inserted into URL bar context menu.");
  },

  // load URL or search the web for text into a new tab
  loadOneTab: function pasteToTab_loadOneTab(aTab) {
    var string = readFromClipboard();
    if (!string) return;
    var tab = this.browser.loadOneTab(string, null, null, null, null, true);
    //if (!aTab) aTab = this.browser.mCurrentTab;
  },

  // load URL or search the web for text into a tab
  loadURI: function pasteToTab_loadURI(aTab, aEvent) {
    if (aEvent.ctrlKey || aEvent.metaKey) return;
    var string = readFromClipboard();
    if (!string) return;
    var browser = aTab.linkedBrowser;
    var flag = browser.webNavigation.LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP;
    browser.loadURIWithFlags(string, flag, null, null, null);
  },

  // check for middle click or ctrl+click
  checkForClickEvent: function pasteToTab_checkForClickEvent(aNode, aEvent) {
    if (aNode.getAttribute("disabled") == "true") return;
    if ((aEvent.button == 1) || 
        (aEvent.button == 0) && (aEvent.ctrlKey || aEvent.metaKey)) {
      var string = readFromClipboard();
      if (!string) return;
      this.loadOneTab(string, null, null, null, null, true);
      closeMenus(aEvent.target);
    }
  },

  isURI: function pasteToTab_isURI(aString) {
    try {
      return makeURI(aString); // check if a string is valid URI
    } catch(ex) {
      return null;  // return null if a string is not valid URI
    }
  },

  // display clipboard text on statusbar or tooltip when hover on menuitem
  updateText: function pasteToTab_updateText(aNode, aString) {
    var text = "";
    if (aString) text = aString;
    else text = readFromClipboard() ? readFromClipboard() : "";
    var statusbar = document.getElementById("status-bar");
    if (statusbar.hidden || !this.isURI(text)) {
      aNode.tooltipText = text;
    } else {
      aNode.tooltipText = "";
      document.getElementById("statusbar-display").label = text;
    }
  },

  // disable 'Paste to Tab & Go' menuitem on tab context menu
  // if there's no text in clipboard
  onTabContext: function pasteToTab_onTabContext(aEvent) {
    var menuitem = document.getElementById("paste-to-tab-and-go");
    menuitem.setAttribute("disabled", !readFromClipboard() ? true : false);
    this.debug("Tab: " + this.browser.mContextTab.label);
  },

  // disable 'Paste to New Tab & Go' menuitem on toolbar context menu
  // if there's no text in clipboard
  onToolbarContext: function pasteToTab_onToolbarContext(aEvent) {
    var mi = document.getElementById("paste-to-new-tab-and-go");
    var sep = document.getElementById("paste-to-new-tab-and-go-separator");
    mi.hidden = document.popupNode.id != "tabbrowser-tabs";
    sep.hidden = document.popupNode.id != "tabbrowser-tabs";
    mi.setAttribute("disabled", !readFromClipboard() ? true : false);
  },

  // disable 'Paste to New Tab & Go' menuitem on URL bar context menu
  // if there's no text in clipboard
  onURLBarContext: function pasteToTab_onURLBarContext(aEvent) {
    var mi = document.getElementById("urlbar-paste-to-new-tab-and-go");
    mi.setAttribute("disabled", !readFromClipboard() ? true : false);
    this.debug("URL bar context menu has been initiated!");
  },

  // initiate browser window
  initBrowser: function pasteToTab_initBrowser(aEvent) {
    // insert 'Paste to New Tab & Go' menuitem into URL bar context menu
    this.insertURLBarMenuitem();

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

    // initiate tab context menu
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
