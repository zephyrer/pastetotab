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
    var inputBox = document.getAnonymousElementByAttribute(
                            gURLBar, "anonid", "textbox-input-box");
    var pasteNGo = document.getAnonymousElementByAttribute(
                            inputBox, "anonid", "paste-and-go");
    return pasteNGo;
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

  initContext: function pasteToTab_initContext(aEvent) {
    var menuitem = document.getElementById("paste-to-tab-and-go");
    menuitem.setAttribute("disabled", !readFromClipboard() ? true : false);
    PasteToTab._tab = document.popupNode;
  },

  initToolbarContext: function pasteToTab_initToolbarContext(aEvent) {
    var mi = document.getElementById("paste-to-new-tab-and-go");
    var sep = document.getElementById("paste-to-new-tab-and-go-separator");
    mi.hidden = document.popupNode.id != "tabbrowser-tabs";
    sep.hidden = document.popupNode.id != "tabbrowser-tabs";
    mi.setAttribute("disabled", !readFromClipboard() ? true : false);
  },

  initURLBarContext: function pasteToTab_initURLBarContext(aEvent) {
    var mi = document.getElementById("urlbar-paste-to-new-tab-and-go");
    mi.setAttribute("disabled", !readFromClipboard() ? true : false);
  },

  init: function pasteToTab_init(aEvent) {
    var tabContext = document.getElementById("tabContextMenu");
    tabContext.addEventListener("popupshowing",
                                PasteToTab.initContext, false);
    tabContext.removeEventListener("popuphiding",
                                   PasteToTab.initContext, false);

    var toolbarContext = document.getElementById("toolbar-context-menu");
    toolbarContext.addEventListener("popupshowing",
                                    PasteToTab.initToolbarContext, false);
    toolbarContext.removeEventListener("popuphiding",
                                       PasteToTab.initToolbarContext, false);

    var mi = document.getElementById("urlbar-paste-to-new-tab-and-go");
    var pg = PasteToTab.pasteAndGo;
    if (pg) {
      mi.removeAttribute("hidden");
      pg.setAttribute("onmouseover", "PasteToTab.mouseOver(this);");
      pg.setAttribute("onmouseout", "PasteToTab.mouseOut(this);");
      pg.parentNode.insertBefore(mi, pg.nextSibling);
      pg.parentNode.addEventListener("popupshowing",
                                     PasteToTab.initURLBarContext, false);
      pg.parentNode.removeEventListener("popuphiding",
                                        PasteToTab.initURLBarContext, false);
    }
  }
}

window.addEventListener("load", PasteToTab.init, false);
window.removeEventListener("unload", PasteToTab.init, false);


