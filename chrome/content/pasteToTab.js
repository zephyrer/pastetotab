/*
  Version: MPL 1.1/GPL 2.0/LGPL 2.1

  The contents of this file are subject to the Mozilla Public License Version
  1.1 (the "License"); you may not use this file except in compliance with
  the License. You may obtain a copy of the License at
  http://www.mozilla.org/MPL/

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

  _tab: null,

  get tabbrowser() {
    return getBrowser();
  },

  get statusbar() {
    return document.getElementById("status-bar");
  },

  get statusbarText() {
    return document.getElementById("statusbar-display");
  },

  get pasteAndGo() {
    if (!gURLBar) return null;
    var inputBox;
    switch (Application.id) {
      case "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}":
        // Firefox
        inputBox = document.getAnonymousElementByAttribute(
                          gURLBar, "anonid", "textbox-input-box");
        return document.getAnonymousElementByAttribute(
                          inputBox, "anonid", "paste-and-go");
      case "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}":
        // SeaMonkey
        inputBox = document.getAnonymousElementByAttribute(
                      gURLBar, "class", "textbox-input-box paste-and-go");
        return document.getAnonymousElementByAttribute(
                      inputBox, "cmd", "cmd_pasteAndGo");
    }
  },

  get tabContextMenu() {
    var tabContext;
    switch (Application.id) {
      case "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}":
        // Firefox
        tabContext = document.getElementById("tabContextMenu");
        break;

      case "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}":
        // SeaMonkey
        var png = document.getElementById("paste-to-tab-and-go");
        var sep = document.getElementById("paste-to-tab-and-go-separator");
        var tabUndoCloseTab = document.getAnonymousElementByAttribute(
                                this.tabbrowser,
                                "tbattr", "tabbrowser-undoclosetab");
        tabContext = tabUndoCloseTab.parentNode;
        tabContext.insertBefore(png, tabUndoCloseTab.nextSibling);
        tabContext.insertBefore(sep, tabUndoCloseTab.nextSibling);
    }
    return tabContext;
  },

  loadOneTab: function pasteToTab_loadOneTab(aString) {
    var string = aString;
    if (!string) {
      string = readFromClipboard();
      if (!string) return;
    }
    this.tabbrowser.loadOneTab(string, null, null, null, null, true);
  },

  loadURI: function pasteToTab_loadURI(aTab, aEvent) {
    if (aEvent.ctrlKey || aEvent.metaKey) return;
    var string = readFromClipboard();
    if (!string) return;
    var browser = aTab.linkedBrowser;
    var flag = browser.webNavigation.LOAD_FLAGS_ALLOW_THIRD_PARTY_FIXUP;
    browser.loadURIWithFlags(string, flag, null, null, null);
  },

  checkForClickEvent: function pasteToTab_checkForClickEvent(aNode, aEvent) {
    if (aNode.getAttribute("disabled") == "true") return;
    if ((aEvent.button == 1) || (aEvent.ctrlKey || aEvent.metaKey)) {
      var string = readFromClipboard();
      if (!string) return;
      this.loadOneTab(string, null, null, null, null, true);
      closeMenus(aEvent.target);
    }
  },

  isURI: function pasteToTab_isURI(aString) {
    try {
      return makeURI(aString);
    } catch(ex) {
      return null;
    }
  },

  mouseOver: function pasteToTab_mouseOver(aNode) {
    var text = readFromClipboard() ? readFromClipboard() : "";
    if (this.statusbar.hidden || !this.isURI(text)) {
      aNode.setAttribute("tooltiptext", text);
    } else {
      this.statusbarText.label = text;
    }
  },

  mouseOut: function pasteToTab_mouseOut(aNode) {
    var text = readFromClipboard() ? readFromClipboard() : "";
    if (this.statusbar.hidden || !this.isURI(text)) {
      aNode.removeAttribute("tooltiptext");
    } else {
      this.statusbarText.label = "";
    }
  },

  onTabContext: function pasteToTab_onTabContext(aEvent) {
    var menuitem = document.getElementById("paste-to-tab-and-go");
    menuitem.setAttribute("disabled", !readFromClipboard() ? true : false);
    PasteToTab._tab = document.popupNode;
  },

  onToolbarContext: function pasteToTab_onToolbarContext(aEvent) {
    var mi = document.getElementById("paste-to-new-tab-and-go");
    var sep = document.getElementById("paste-to-new-tab-and-go-separator");
    mi.hidden = document.popupNode.id != "tabbrowser-tabs";
    sep.hidden = document.popupNode.id != "tabbrowser-tabs";
    mi.setAttribute("disabled", !readFromClipboard() ? true : false);
  },

  onURLBarContext: function pasteToTab_onURLBarContext(aEvent) {
    var mi = document.getElementById("urlbar-paste-to-new-tab-and-go");
    mi.setAttribute("disabled", !readFromClipboard() ? true : false);
  },

  initBrowser: function pasteToTab_initBrowser(aEvent) {
    var mi = document.getElementById("urlbar-paste-to-new-tab-and-go");
    var pg = PasteToTab.pasteAndGo;
    if (pg) {
      mi.removeAttribute("hidden");
      pg.setAttribute("onmouseover", "PasteToTab.mouseOver(this);");
      pg.setAttribute("onmouseout", "PasteToTab.mouseOut(this);");
      pg.parentNode.insertBefore(mi, pg.nextSibling);
      pg.parentNode.addEventListener("popupshowing",
                                     PasteToTab.onURLBarContext, false);
      pg.parentNode.removeEventListener("popuphiding",
                                        PasteToTab.onURLBarContext, false);
    }

    if (document.getElementById("paste-to-new-tab-and-go")) {
      var toolbarContext = document.getElementById("toolbar-context-menu");
      toolbarContext.addEventListener("popupshowing",
                                      PasteToTab.onToolbarContext, false);
      toolbarContext.removeEventListener("popuphiding",
                                         PasteToTab.onToolbarContext,
                                         false);
    }

    var tabContext = PasteToTab.tabContextMenu;
    tabContext.addEventListener("popupshowing",
                                PasteToTab.onTabContext, false);
    tabContext.removeEventListener("popuphiding",
                                   PasteToTab.onTabContext, false);
  }
}

window.addEventListener("load", PasteToTab.initBrowser, false);
window.removeEventListener("unload", PasteToTab.initBrowser, false);
